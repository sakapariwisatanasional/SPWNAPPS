import { Member, UserRole } from '../types';
import { storage } from './storage';
import { spreadsheetService } from './spreadsheetService';
import { formatDriveImageUrl } from '../components/common/SakaLogo';

export interface VerificationResult {
  found: boolean;
  member: Member | null;
  source: 'LOCAL' | 'GOOGLE_SPREADSHEET' | 'NONE';
  searchTerm: string;
  normalizedTerm: string;
  message?: string;
}

/**
 * Pembersih dan penormalisasi kueri pencarian NTA/Barcode/URL
 */
export function normalizeNtaQuery(rawInput: string): {
  cleanQuery: string;
  strippedDigits: string;
  isUrl: boolean;
  extractedQuery: string;
} {
  if (!rawInput) {
    return { cleanQuery: '', strippedDigits: '', isUrl: false, extractedQuery: '' };
  }

  const text = String(rawInput).trim();
  let isUrl = false;
  let extractedQuery = text;

  try {
    const looksLikeUrl = /^https?:\/\//i.test(text) || /(?:verifyId|memberId|nta|kta|id)=/i.test(text) || /\/verify(?:\/|\?|$)/i.test(text);
    if (looksLikeUrl) {
      isUrl = true;
      const urlObj = /^https?:\/\//i.test(text)
        ? new URL(text)
        : new URL(text, typeof window !== 'undefined' ? window.location.origin : 'https://localhost');

      // verifyId remains the first value for backwards compatibility, but the
      // verification service separately reads every identity from the URL.
      const qId = urlObj.searchParams.get('verifyId') ||
                  urlObj.searchParams.get('memberId') ||
                  urlObj.searchParams.get('nta') ||
                  urlObj.searchParams.get('kta') ||
                  urlObj.searchParams.get('id');

      if (qId) {
        extractedQuery = qId.trim();
      } else if (urlObj.pathname.includes('/verify/')) {
        extractedQuery = decodeURIComponent(urlObj.pathname.split('/verify/')[1]?.split('?')[0] || '').trim();
      }
    }
  } catch {
    // Gunakan input mentah bila URL tidak valid.
  }

  const cleanQuery = extractedQuery.replace(/^['"`]+|['"`]+$/g, '').trim();
  const strippedDigits = cleanQuery.replace(/\D/g, '');

  return { cleanQuery, strippedDigits, isUrl, extractedQuery };
}

/**
 * Normalisasi identitas untuk pencocokan yang tahan terhadap perbedaan:
 * - 00.00.00.000001 vs 000000000001
 * - angka Google Sheets 1 vs format KTA 00.00.00.000001
 * - spasi, tanda kutip, dash, slash, dan huruf besar/kecil.
 */
function normalizeIdentity(value: unknown): string {
  return String(value ?? '').trim().replace(/^['"`]+|['"`]+$/g, '').toLowerCase();
}

function digitsOnly(value: unknown): string {
  return normalizeIdentity(value).replace(/\D/g, '');
}

function ktaDigits(value: unknown): string {
  const raw = normalizeIdentity(value);
  const digits = digitsOnly(raw);
  // Nomor KTA pada aplikasi menggunakan pola 00.00.00.000001 (12 digit).
  // Google Sheets dapat mengembalikannya sebagai angka "1", sehingga pad 12
  // digit hanya untuk nilai yang jelas berupa nomor KTA numerik.
  if (digits && digits.length < 12 && (raw.includes('.') || /^\d+$/.test(raw))) {
    return digits.padStart(12, '0');
  }
  return digits;
}

function identityMatches(query: string, value: unknown, kind: 'KTA' | 'ID' | 'GENERIC' = 'GENERIC'): boolean {
  const q = normalizeIdentity(query);
  const v = normalizeIdentity(value);
  if (!q || !v) return false;
  if (q === v) return true;

  if (kind === 'KTA') {
    const qd = ktaDigits(q);
    const vd = ktaDigits(v);
    return !!qd && !!vd && qd === vd;
  }

  const qd = digitsOnly(q);
  const vd = digitsOnly(v);
  if (qd && vd && qd === vd && qd.length >= 4) return true;

  return false;
}

/**
 * Memeriksa kecocokan anggota dengan berbagai variasi format (dengan/tanpa titik, token, nama, ID)
 */
export function isMemberMatch(member: Member, cleanQuery: string, strippedDigits: string): boolean {
  if (!member) return false;

  const query = normalizeIdentity(cleanQuery);
  if (!query) return false;

  if (identityMatches(query, member.nationalMemberNumber, 'KTA')) return true;
  if (identityMatches(query, member.id, 'ID')) return true;
  if (identityMatches(query, member.userId, 'ID')) return true;

  if (member.verificationToken && identityMatches(query, member.verificationToken)) return true;

  const qDigits = strippedDigits || digitsOnly(query);
  if (member.nikMasked && qDigits.length >= 6) {
    const nik = digitsOnly(member.nikMasked);
    if (nik && (nik.includes(qDigits) || qDigits.includes(nik))) return true;
  }

  if (member.phone && qDigits.length >= 8) {
    const phone = digitsOnly(member.phone);
    if (phone && (phone.endsWith(qDigits) || qDigits.endsWith(phone))) return true;
  }

  if (member.email && normalizeIdentity(member.email) === query) return true;

  if (member.fullName) {
    const name = normalizeIdentity(member.fullName);
    if (name === query) return true;
    if (query.length >= 4 && (name.includes(query) || query.includes(name))) return true;
  }

  return false;
}

/**
 * Cari anggota di database lokal React / localStorage
 */
export function searchMemberLocally(rawInput: string, memberList?: Member[]): Member | null {
  const { cleanQuery, strippedDigits } = normalizeNtaQuery(rawInput);
  if (!cleanQuery && !strippedDigits) return null;

  const members = memberList && memberList.length > 0 ? memberList : storage.getMembers();

  for (const m of members) {
    if (isMemberMatch(m, cleanQuery, strippedDigits)) {
      return m;
    }
  }

  return null;
}

/**
 * Cari anggota secara live ke Google Spreadsheet
 */
export async function searchMemberInRemoteSpreadsheet(rawInput: string): Promise<Member | null> {
  const { cleanQuery, strippedDigits } = normalizeNtaQuery(rawInput);
  if (!cleanQuery && !strippedDigits) return null;

  try {
    // Anggota adalah profil/KTA. Users hanya menjadi registry penghubung akun.
    // Keduanya dibaca live dari Google Spreadsheet, tanpa localStorage sebagai
    // sumber kebenaran verifikasi.
    const anggotaRows = await spreadsheetService.fetchSheetRows('Anggota');
    if (!anggotaRows || anggotaRows.length === 0) return null;

    let usersRows: Record<string, any>[] = [];
    try {
      const fetchedUsers = await spreadsheetService.fetchSheetRows('Users');
      if (Array.isArray(fetchedUsers)) usersRows = fetchedUsers;
    } catch (userErr) {
      // Sheet Users boleh gagal/berbeda versi. Verifikasi KTA tetap harus bisa
      // berjalan langsung melalui sheet Anggota.
      console.warn('Sheet Users tidak dapat dibaca; lanjut dengan Anggota:', userErr);
    }

    const getVal = (row: Record<string, any>, aliases: string[]): string => {
      for (const a of aliases) {
        if (row[a] !== undefined && row[a] !== null && String(row[a]).trim() !== '') {
          return String(row[a]).trim();
        }
      }
      const keys = Object.keys(row);
      for (const a of aliases) {
        const cleanA = a.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const k of keys) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanK === cleanA) {
            const v = row[k];
            if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim();
          }
        }
      }
      return '';
    };

    const parseRole = (roleStr?: string): UserRole => {
      if (!roleStr) return 'MEMBER';
      const r = roleStr.toUpperCase().replace(/\s+/g, '_');
      if (r.includes('SUPER') || r.includes('NASIONAL') || r.includes('PIMPINAN_NASIONAL') || r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
      if (r.includes('KWARDA') || r.includes('PROVINSI') || r === 'ADMIN_PROVINCE') return 'ADMIN_PROVINCE';
      if (r.includes('KWARCAB') || r.includes('KABUPATEN') || r.includes('KOTA') || r === 'ADMIN_REGENCY') return 'ADMIN_REGENCY';
      if (r.includes('KWARRAN') || r.includes('RANTING') || r.includes('KECAMATAN') || r === 'ADMIN_BRANCH') return 'ADMIN_BRANCH';
      return 'MEMBER';
    };

    type UserLink = {
      id: string;
      memberId: string;
      name: string;
      email: string;
      status: string;
    };

    const users: UserLink[] = usersRows.map(row => ({
      id: getVal(row, ['ID User', 'ID', 'User ID', 'id_user', 'user_id', 'col_0']),
      memberId: getVal(row, ['Member ID', 'memberId', 'member_id', 'ID Anggota', 'Nomor ID', 'col_9']),
      name: getVal(row, ['Nama', 'Nama Lengkap', 'name', 'Full Name', 'col_4']),
      email: getVal(row, ['Email', 'email', 'E-mail', 'col_2']),
      status: getVal(row, ['Status', 'status', 'col_11'])
    }));

    const query = normalizeIdentity(cleanQuery);
    const queryDigits = strippedDigits || digitsOnly(query);

    // Candidate member IDs berasal dari QR, dari Users.Member ID, dan dari
    // Users.ID User. Ini membuat ID akun dan ID profil menjadi dua arah.
    const memberIdCandidates = new Set<string>();
    const addCandidate = (value: unknown) => {
      const v = normalizeIdentity(value);
      if (v) memberIdCandidates.add(v);
    };

    // Bila input sendiri sudah berupa ID/member ID.
    addCandidate(cleanQuery);

    // Cari User yang cocok dengan input (memberId, user ID, email, atau nama).
    for (const u of users) {
      if (
        identityMatches(query, u.memberId, 'ID') ||
        identityMatches(query, u.id, 'ID') ||
        (u.email && normalizeIdentity(u.email) === query) ||
        (u.name && normalizeIdentity(u.name) === query)
      ) {
        addCandidate(u.memberId);
        addCandidate(u.id);
      }
    }

    const buildMemberFromRow = (row: Record<string, any>, idx: number, linkedUser?: UserLink): Member => {
      const fullName = getVal(row, ['Nama Lengkap', 'nama_lengkap', 'Nama', 'nama', 'Full Name', 'Name', 'col_2']) || `Anggota ${idx + 1}`;
      const kta = getVal(row, ['Nomor KTA', 'Nomor Anggota', 'Nomor NTA', 'nomor_kta', 'NTA', 'KTA', 'No KTA', 'No. KTA', 'No NTA', 'No. NTA', 'Nomor Registrasi', 'col_1']);
      const email = getVal(row, ['Email', 'email', 'E-mail', 'Alamat Email', 'col_3']) || linkedUser?.email || `member${idx + 1}@pramuka.id`;
      const phone = getVal(row, ['Nomor WA', 'No WhatsApp', 'Nomor WhatsApp', 'No WA', 'WhatsApp', 'Telepon', 'col_4']);
      const memberId = getVal(row, ['ID', 'id', 'Id', 'member_id', 'Member ID', 'Nomor ID', 'ID Anggota', 'col_0']) || linkedUser?.memberId || `sheet-member-${idx}`;
      const prov = getVal(row, ['Provinsi', 'Kwarda', 'provinsi', 'col_5']) || 'Tingkat Nasional';
      const kab = getVal(row, ['Kabupaten/Kota', 'Kwarcab', 'kabupaten', 'Kabupaten', 'Kota', 'col_6']) || 'Kwartir Nasional';
      const kec = getVal(row, ['Kecamatan', 'Kwarran/Kecamatan', 'Kwartir Ranting', 'Kwarran', 'kecamatan_ranting', 'Ranting', 'col_7']) || 'Pimpinan Nasional';
      const jabatan = getVal(row, ['Jabatan', 'Gudep', 'Posisi / Jabatan', 'Jabatan Kepengurusan', 'Posisi', 'col_8']);
      const krida = getVal(row, ['Krida', 'krida', 'Peminatan Krida', 'col_9']) || 'Krida Pemandu';
      const roleStr = getVal(row, ['Role', 'Peran', 'Hak Akses', 'Wewenang']) || '';
      const role = parseRole(roleStr || jabatan);
      const rawFoto = getVal(row, ['Foto URL', 'foto_url', 'Foto', 'Pas Foto', 'Photo', 'Avatar', 'Link Foto', 'col_11']);
      const avatarUrl = formatDriveImageUrl(rawFoto) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80';
      const statusRaw = getVal(row, ['Status', 'status', 'Status Keanggotaan', 'col_10']) || linkedUser?.status || 'ACTIVE';
      const statusUpper = statusRaw.toUpperCase();

      return {
        id: memberId,
        userId: linkedUser?.id || `user-${memberId}`,
        nationalMemberNumber: kta || undefined,
        fullName,
        nikMasked: '3201**********01',
        avatarUrl,
        gender: 'LAKI_LAKI',
        birthPlace: 'Indonesia',
        birthDate: '2000-01-01',
        email,
        phone,
        address: `${kec}, ${kab}, ${prov}`,
        provinceId: '00',
        provinceName: prov,
        regencyId: '00.00',
        regencyName: kab,
        districtId: '00.00.00',
        districtName: kec,
        currentPosition: jabatan || (role === 'SUPER_ADMIN' ? 'Ketua Pimpinan Saka Pariwisata Nasional' : `Anggota ${krida}`),
        krida: krida as any,
        joinYear: new Date().getFullYear(),
        educationLevel: 'SMA/SMK',
        occupation: 'Pramuka Pariwisata',
        bio: 'Anggota resmi Saka Pariwisata. Terverifikasi dari database Google Spreadsheet.',
        status: (statusUpper === 'PENDING' ? 'PENDING' : statusUpper === 'ACTIVE' ? 'ACTIVE' : statusUpper as any),
        registeredAt: getVal(row, ['Tanggal Daftar', 'tanggal_daftar', 'Created At', 'Timestamp', 'col_12']) || new Date().toISOString(),
        verificationToken: `VERIFY-SP-${kta ? kta.replace(/\./g, '') : memberId}`,
        isOperator: role !== 'MEMBER',
        operatorRole: role !== 'MEMBER' ? role : undefined,
        skills: [],
        certifications: [],
        locationHistory: []
      };
    };

    // Tahap 1: cari langsung di Anggota berdasarkan KTA atau ID.
    for (let idx = 0; idx < anggotaRows.length; idx++) {
      const row = anggotaRows[idx];
      const rowId = getVal(row, ['ID', 'id', 'Id', 'member_id', 'Member ID', 'Nomor ID', 'ID Anggota', 'col_0']);
      const rowKta = getVal(row, ['Nomor KTA', 'Nomor Anggota', 'Nomor NTA', 'nomor_kta', 'NTA', 'KTA', 'No KTA', 'No. KTA', 'No NTA', 'No. NTA', 'Nomor Registrasi', 'col_1']);
      const rowLink = getVal(row, ['Link Verifikasi', 'Verification Link', 'verificationLink', 'link_verifikasi', 'col_13']);
      const directMatch =
        identityMatches(query, rowKta, 'KTA') ||
        identityMatches(query, rowId, 'ID') ||
        (rowLink && identityMatches(query, rowLink));

      const linkedUser = users.find(u =>
        (u.memberId && identityMatches(rowId, u.memberId, 'ID')) ||
        (u.id && identityMatches(rowId, u.id, 'ID'))
      );

      const linkedCandidateMatch = memberIdCandidates.size > 0 && [...memberIdCandidates].some(c => identityMatches(c, rowId, 'ID'));

      if (directMatch || linkedCandidateMatch) {
        const member = buildMemberFromRow(row, idx, linkedUser);
        storage.addOrUpdateMember(member);
        return member;
      }
    }

    // Tahap 2: jika query adalah User ID/member ID tetapi Anggota.ID berbeda
    // format, gunakan Users.Member ID sebagai jembatan berdasarkan email/nama.
    const matchingUsers = users.filter(u =>
      identityMatches(query, u.memberId, 'ID') || identityMatches(query, u.id, 'ID') ||
      (u.email && normalizeIdentity(u.email) === query) ||
      (u.name && normalizeIdentity(u.name) === query)
    );

    for (const u of matchingUsers) {
      const byUser = anggotaRows.find(row => {
        const rowId = getVal(row, ['ID', 'id', 'Id', 'member_id', 'Member ID', 'Nomor ID', 'ID Anggota', 'col_0']);
        const rowEmail = getVal(row, ['Email', 'email', 'E-mail', 'Alamat Email', 'col_3']);
        const rowName = getVal(row, ['Nama Lengkap', 'Nama', 'Full Name', 'Name', 'col_2']);
        return identityMatches(u.memberId, rowId, 'ID') ||
               (u.email && rowEmail && normalizeIdentity(u.email) === normalizeIdentity(rowEmail)) ||
               (u.name && rowName && normalizeIdentity(u.name) === normalizeIdentity(rowName));
      });
      if (byUser) {
        const idx = anggotaRows.indexOf(byUser);
        const member = buildMemberFromRow(byUser, idx, u);
        storage.addOrUpdateMember(member);
        return member;
      }
    }

    // Tahap 3: QR lama yang berisi nomor KTA angka pendek (misalnya "1")
    // dicocokkan ke KTA 12 digit yang tersimpan sebagai 00.00.00.000001.
    if (queryDigits) {
      const byNumericKta = anggotaRows.find(row => {
        const rowKta = getVal(row, ['Nomor KTA', 'Nomor Anggota', 'Nomor NTA', 'nomor_kta', 'NTA', 'KTA', 'No KTA', 'No. KTA', 'No NTA', 'No. NTA', 'Nomor Registrasi', 'col_1']);
        const qKta = ktaDigits(query);
        const rKta = ktaDigits(rowKta);
        return !!qKta && !!rKta && qKta === rKta;
      });
      if (byNumericKta) {
        const idx = anggotaRows.indexOf(byNumericKta);
        const rowId = getVal(byNumericKta, ['ID', 'id', 'Id', 'member_id', 'Member ID', 'Nomor ID', 'ID Anggota', 'col_0']);
        const linkedUser = users.find(u => identityMatches(rowId, u.memberId, 'ID'));
        const member = buildMemberFromRow(byNumericKta, idx, linkedUser);
        storage.addOrUpdateMember(member);
        return member;
      }
    }
  } catch (err) {
    console.warn('Live remote spreadsheet lookup failed:', err);
  }

  return null;
}

/**
 * Fungsi Utama: Verifikasi Anggota Multi-Tier (Lokal + Cloud Google Spreadsheet)
 */
export async function verifyMemberUniversal(
  rawInput: string,
  localMembers?: Member[],
  options?: { authoritativeRemote?: boolean }
): Promise<VerificationResult> {
  const { cleanQuery, strippedDigits } = normalizeNtaQuery(rawInput);
  const authoritativeRemote = options?.authoritativeRemote === true;

  if (!cleanQuery && !strippedDigits) {
    return {
      found: false,
      member: null,
      source: 'NONE',
      searchTerm: rawInput,
      normalizedTerm: '',
      message: 'Silakan masukkan nomor anggota atau token verifikasi.'
    };
  }

  // Untuk halaman verifikasi/QR, Google Spreadsheet adalah sumber kebenaran.
  // Jangan mengembalikan record localStorage yang mungkin merupakan KTA lama.
  if (authoritativeRemote) {
    try {
      const candidates: string[] = [];
      const pushCandidate = (value: string | null) => {
        const v = String(value || '').trim();
        if (v && !candidates.some(c => normalizeIdentity(c) === normalizeIdentity(v))) candidates.push(v);
      };

      // URL QR dapat membawa beberapa identitas sekaligus. Semua harus dicoba.
      if (typeof window !== 'undefined') {
        try {
          const u = new URL(rawInput, window.location.origin);
          pushCandidate(u.searchParams.get('verifyId'));
          pushCandidate(u.searchParams.get('memberId'));
          pushCandidate(u.searchParams.get('nta'));
          pushCandidate(u.searchParams.get('kta'));
          pushCandidate(u.searchParams.get('id'));
          const pathId = u.pathname.match(/\/verify\/([^/?#]+)/i)?.[1];
          if (pathId) pushCandidate(decodeURIComponent(pathId));
        } catch {}
      }

      // Input scanner biasa (misalnya 00.00.00.000001) tetap menjadi candidate.
      pushCandidate(cleanQuery);
      pushCandidate(rawInput);

      for (const candidate of candidates) {
        const remoteMatch = await searchMemberInRemoteSpreadsheet(candidate);
        if (remoteMatch) {
          return {
            found: true,
            member: remoteMatch,
            source: 'GOOGLE_SPREADSHEET',
            searchTerm: rawInput,
            normalizedTerm: normalizeNtaQuery(candidate).cleanQuery
          };
        }
      }
    } catch (e) {
      console.warn('Authoritative Google Spreadsheet verification failed:', e);
    }

    return {
      found: false,
      member: null,
      source: 'NONE',
      searchTerm: rawInput,
      normalizedTerm: cleanQuery,
      message: 'Data KTA tidak ditemukan pada Google Spreadsheet terbaru. Pastikan Nomor KTA atau ID anggota pada QR benar-benar ada pada sheet Anggota.'
    };
  }

  // Mode umum/manual: lokal tetap boleh dipakai sebagai fallback cepat.
  const localMatch = searchMemberLocally(rawInput, localMembers);
  if (localMatch) {
    return {
      found: true,
      member: localMatch,
      source: 'LOCAL',
      searchTerm: rawInput,
      normalizedTerm: cleanQuery
    };
  }

  try {
    const remoteMatch = await searchMemberInRemoteSpreadsheet(rawInput);
    if (remoteMatch) {
      return {
        found: true,
        member: remoteMatch,
        source: 'GOOGLE_SPREADSHEET',
        searchTerm: rawInput,
        normalizedTerm: cleanQuery
      };
    }
  } catch (e) {
    console.warn('Error during universal verification remote lookup:', e);
  }

  return {
    found: false,
    member: null,
    source: 'NONE',
    searchTerm: rawInput,
    normalizedTerm: cleanQuery,
    message: 'Nomor Anggota Tidak Ditemukan. Pastikan nomor anggota yang dimasukkan benar dan sesuai dengan format resmi Kwartir.'
  };
}
