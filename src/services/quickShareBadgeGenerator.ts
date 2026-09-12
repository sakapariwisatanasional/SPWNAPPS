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
  verifyId?: string;
  memberId?: string;
  candidates?: string[];
} {
  if (!rawInput) {
    return { cleanQuery: '', strippedDigits: '', isUrl: false, extractedQuery: '', candidates: [] };
  }

  const text = String(rawInput).trim();
  let isUrl = false;
  let extractedQuery = text;
  let verifyId = '';
  let memberId = '';
  const candidates: string[] = [];

  const push = (value: string | null | undefined) => {
    const v = String(value || '').trim();
    if (v && !candidates.some(c => c.toLowerCase() === v.toLowerCase())) candidates.push(v);
  };

  // QR lama dan QR baru sama-sama didukung:
  // /?verifyId=...
  // /verify?verifyId=...&memberId=...
  // /verify/...
  try {
    if (/^https?:\/\//i.test(text)) {
      const urlObj = new URL(text);
      isUrl = true;
      verifyId = String(
        urlObj.searchParams.get('verifyId') ||
        urlObj.searchParams.get('nta') ||
        urlObj.searchParams.get('kta') ||
        ''
      ).trim();
      memberId = String(
        urlObj.searchParams.get('memberId') ||
        urlObj.searchParams.get('id') ||
        ''
      ).trim();

      push(verifyId);
      push(memberId);

      if (!verifyId && !memberId && urlObj.pathname.includes('/verify/')) {
        push(decodeURIComponent(urlObj.pathname.split('/verify/')[1]?.split('?')[0] || '').trim());
      }

      extractedQuery = candidates[0] || text;
    } else if (/verifyId=/i.test(text) || /memberId=/i.test(text)) {
      isUrl = true;
      const queryString = text.includes('?') ? text.split('?')[1] : text;
      const params = new URLSearchParams(queryString);
      verifyId = String(params.get('verifyId') || params.get('nta') || params.get('kta') || '').trim();
      memberId = String(params.get('memberId') || params.get('id') || '').trim();
      push(verifyId);
      push(memberId);
      extractedQuery = candidates[0] || text;
    } else {
      push(text);
    }
  } catch {
    push(text);
  }

  const cleanQuery = (extractedQuery || candidates[0] || text)
    .replace(/^['"`]+|['"`]+$/g, '')
    .trim();
  const strippedDigits = cleanQuery.replace(/\D/g, '');

  // Pastikan semua identitas QR tersedia bagi verifier authoritative.
  if (verifyId) push(verifyId);
  if (memberId) push(memberId);

  return {
    cleanQuery,
    strippedDigits,
    isUrl,
    extractedQuery,
    verifyId: verifyId || undefined,
    memberId: memberId || undefined,
    candidates
  };
}

/**
 * Memeriksa kecocokan anggota dengan berbagai variasi format (dengan/tanpa titik, token, nama, ID)
 */
function normalizeIdentity(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().replace(/^['"`]+|['"`]+$/g, '');
}

function normalizeKtaDigits(value: unknown): string {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  // Google Sheets kadang mengembalikan Nomor KTA sebagai angka sehingga
  // 00.00.00.000001 bisa terbaca sebagai 1. Hilangkan leading zero hanya
  // untuk membandingkan representasi numerik KTA.
  return digits.replace(/^0+(?=\d)/, '');
}

export function isMemberMatch(member: Member, cleanQuery: string, strippedDigits: string): boolean {
  if (!member) return false;

  const query = normalizeIdentity(cleanQuery);
  const queryDigits = normalizeKtaDigits(strippedDigits || cleanQuery);

  // 1. Nomor KTA/NTA — dukung data lama yang tersimpan sebagai angka.
  if (member.nationalMemberNumber) {
    const nta = normalizeIdentity(member.nationalMemberNumber);
    if (nta === query) return true;

    const ntaDigits = normalizeKtaDigits(member.nationalMemberNumber);
    if (queryDigits && ntaDigits && ntaDigits === queryDigits) return true;

    // Kompatibilitas dengan QR yang hanya membawa beberapa digit terakhir.
    if (queryDigits.length >= 4 && ntaDigits.endsWith(queryDigits)) return true;
    if (query.length >= 4 && nta.endsWith(query)) return true;
  }

  // 2. Verification token
  if (member.verificationToken) {
    const token = normalizeIdentity(member.verificationToken);
    if (token === query) return true;
    if (query.length >= 5 && token.includes(query)) return true;
  }

  // 3. ID anggota dan User ID
  if (normalizeIdentity(member.id) === query) return true;
  if (normalizeIdentity(member.userId) === query) return true;

  // 4. NIK
  if (member.nikMasked && member.nikMasked.replace(/\D/g, '').length >= 6 && queryDigits.length >= 6) {
    const nikDigits = member.nikMasked.replace(/\D/g, '');
    if (nikDigits.includes(queryDigits) || queryDigits.includes(nikDigits)) return true;
  }

  // 5. WhatsApp
  if (member.phone && queryDigits.length >= 8) {
    const phoneDigits = member.phone.replace(/\D/g, '');
    if (phoneDigits.endsWith(queryDigits) || queryDigits.endsWith(phoneDigits)) return true;
  }

  // 6. Email
  if (member.email && normalizeIdentity(member.email) === query) return true;

  // 7. Nama
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
  const parsed = normalizeNtaQuery(rawInput);
  const queryCandidates = [...(parsed.candidates || []), parsed.cleanQuery]
    .map(v => String(v || '').trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.findIndex(x => x.toLowerCase() === v.toLowerCase()) === i);

  if (queryCandidates.length === 0) return null;

  try {
    // Anggota adalah sumber profil KTA. Users hanya dipakai sebagai tabel
    // relasi tambahan: Users.Member ID -> Anggota.ID.
    const [rows, userRows] = await Promise.all([
      spreadsheetService.fetchSheetRows('Anggota'),
      spreadsheetService.fetchSheetRows('Users').catch(() => [])
    ]);

    if (!Array.isArray(rows) || rows.length === 0) return null;

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

    // Bangun relasi User ID / Member ID -> Member ID.
    const userLinkedMemberIds = new Set<string>();
    if (Array.isArray(userRows)) {
      for (const userRow of userRows) {
        const userId = getVal(userRow, ['ID', 'ID User', 'User ID', 'id_user', 'userId', 'col_0']);
        const linkedMemberId = getVal(userRow, ['Member ID', 'member_id', 'memberId', 'ID Anggota', 'ID Member', 'col_9']);
        if (!userId && !linkedMemberId) continue;

        for (const candidate of queryCandidates) {
          const c = normalizeIdentity(candidate);
          if (
            (userId && normalizeIdentity(userId) === c) ||
            (linkedMemberId && normalizeIdentity(linkedMemberId) === c)
          ) {
            if (linkedMemberId) userLinkedMemberIds.add(linkedMemberId);
            // Jika QR lama ternyata membawa ID anggota yang sama dengan User.ID,
            // tetap simpan linked ID bila tersedia.
            if (!linkedMemberId && userId) userLinkedMemberIds.add(userId);
          }
        }
      }
    }

    const matchRow = (row: Record<string, any>): boolean => {
      const id = getVal(row, ['ID', 'id', 'Id', 'member_id', 'Member ID', 'Nomor ID', 'col_0']);
      const kta = getVal(row, ['Nomor KTA', 'Nomor Anggota', 'Nomor NTA', 'nomor_kta', 'NTA', 'KTA', 'No KTA', 'No. KTA', 'No NTA', 'No. NTA', 'Nomor Registrasi', 'col_1']);
      const token = getVal(row, ['Link Verifikasi', 'Verification Link', 'verificationLink', 'link_verifikasi', 'Verification Token', 'Token']);
      const link = getVal(row, ['Link Verifikasi', 'Verification Link', 'verificationLink', 'link_verifikasi', 'col_13']);

      for (const candidate of queryCandidates) {
        const temp: Partial<Member> = {
          id,
          userId: id,
          nationalMemberNumber: kta || undefined,
          verificationToken: token || link || undefined
        };
        if (isMemberMatch(temp as Member, candidate, candidate.replace(/\D/g, ''))) return true;
        if (id && normalizeIdentity(id) === normalizeIdentity(candidate)) return true;
        if (kta && normalizeKtaDigits(kta) === normalizeKtaDigits(candidate)) return true;
      }

      if (id && [...userLinkedMemberIds].some(uid => normalizeIdentity(uid) === normalizeIdentity(id))) {
        return true;
      }

      return false;
    };

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      if (!row || typeof row !== 'object') continue;
      if (!matchRow(row)) continue;

      const fullName = getVal(row, ['Nama Lengkap', 'nama_lengkap', 'Nama', 'nama', 'Full Name', 'Name', 'col_2']) || `Anggota ${idx + 1}`;
      const kta = getVal(row, ['Nomor KTA', 'Nomor Anggota', 'Nomor NTA', 'nomor_kta', 'NTA', 'KTA', 'No KTA', 'No. KTA', 'No NTA', 'No. NTA', 'Nomor Registrasi', 'col_1']);
      const email = getVal(row, ['Email', 'email', 'E-mail', 'Alamat Email', 'col_3']);
      const phone = getVal(row, ['Nomor WA', 'No WhatsApp', 'Nomor WhatsApp', 'No WA', 'WhatsApp', 'Telepon', 'col_4']);
      const memberId = getVal(row, ['ID', 'id', 'Id', 'member_id', 'Member ID', 'Nomor ID', 'col_0']) || `sheet-member-${idx}`;
      const prov = getVal(row, ['Provinsi', 'Kwarda', 'provinsi', 'col_5']) || 'Tingkat Nasional';
      const kab = getVal(row, ['Kabupaten/Kota', 'Kwarcab', 'kabupaten', 'Kabupaten', 'Kota', 'col_6']) || 'Kwartir Nasional';
      const kec = getVal(row, ['Kecamatan', 'Kwarran/Kecamatan', 'Kwartir Ranting', 'Kwarran', 'kecamatan_ranting', 'Ranting', 'col_7']) || 'Pimpinan Nasional';
      const jabatan = getVal(row, ['Jabatan', 'Gudep', 'Posisi / Jabatan', 'Jabatan Kepengurusan', 'Posisi', 'col_8']);
      const krida = getVal(row, ['Krida', 'krida', 'Peminatan Krida', 'col_9']) || 'Krida Pemandu';
      const roleStr = getVal(row, ['Role', 'Peran', 'Hak Akses', 'Wewenang']);
      const role = parseRole(roleStr || jabatan);
      const rawFoto = getVal(row, ['Foto URL', 'foto_url', 'Foto', 'Pas Foto', 'Photo', 'Avatar', 'Link Foto', 'col_11']);
      const avatarUrl = formatDriveImageUrl(rawFoto) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80';
      const rawStatus = getVal(row, ['Status', 'status', 'Status Keanggotaan', 'col_10']).toUpperCase();

      const linkedUser = Array.isArray(userRows)
        ? userRows.find((u: any) => {
            const uid = getVal(u, ['ID', 'ID User', 'User ID', 'id_user', 'userId', 'col_0']);
            const mid = getVal(u, ['Member ID', 'member_id', 'memberId', 'ID Anggota', 'ID Member', 'col_9']);
            return normalizeIdentity(mid) === normalizeIdentity(memberId) || normalizeIdentity(uid) === normalizeIdentity(memberId);
          })
        : null;

      const tempMember: Member = {
        id: memberId,
        userId: linkedUser
          ? getVal(linkedUser, ['ID', 'ID User', 'User ID', 'id_user', 'userId', 'col_0'])
          : `user-${memberId}`,
        nationalMemberNumber: kta || undefined,
        fullName,
        nikMasked: getVal(row, ['NIK', 'NIK Masked', 'nik_masked', 'col_nik']) || '3201**********01',
        avatarUrl,
        gender: (getVal(row, ['Jenis Kelamin', 'Gender', 'gender']) || 'LAKI_LAKI').toUpperCase().includes('PEREMPUAN') ? 'PEREMPUAN' : 'LAKI_LAKI',
        birthPlace: getVal(row, ['Tempat Lahir', 'Birth Place']) || 'Indonesia',
        birthDate: getVal(row, ['Tanggal Lahir', 'Birth Date']) || '2000-01-01',
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
        status: rawStatus === 'PENDING' ? 'PENDING' : rawStatus === 'ACTIVE' ? 'ACTIVE' : (rawStatus as any) || 'ACTIVE',
        registeredAt: getVal(row, ['Tanggal Daftar', 'tanggal_daftar', 'Created At', 'Timestamp', 'col_12']) || new Date().toISOString(),
        verificationToken: getVal(row, ['Verification Token', 'Token', 'Link Verifikasi', 'Verification Link', 'verificationLink', 'link_verifikasi', 'col_13']) || `VERIFY-SP-${kta ? kta.replace(/\./g, '') : memberId}`,
        isOperator: role !== 'MEMBER',
        operatorRole: role !== 'MEMBER' ? role : undefined,
        skills: [],
        certifications: [],
        locationHistory: []
      };

      storage.addOrUpdateMember(tempMember);
      return tempMember;
    }
  } catch (err) {
    console.error('Live remote spreadsheet lookup failed:', err);
    return null;
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
      // QR baru dapat membawa lebih dari satu identitas: Nomor KTA dan memberId.
      // Coba semuanya ke Spreadsheet sehingga perubahan Nomor KTA tidak memutus QR.
      const candidates: string[] = [];
      const pushCandidate = (value: string | null | undefined) => {
        const v = String(value || '').trim();
        if (v && !candidates.some(c => c.toLowerCase() === v.toLowerCase())) candidates.push(v);
      };
      for (const candidate of (normalizeNtaQuery(rawInput).candidates || [])) pushCandidate(candidate);
      pushCandidate(cleanQuery);
      if (typeof window !== 'undefined') {
        try {
          const u = new URL(rawInput, window.location.origin);
          pushCandidate(u.searchParams.get('verifyId'));
          pushCandidate(u.searchParams.get('memberId'));
          pushCandidate(u.searchParams.get('nta'));
          pushCandidate(u.searchParams.get('kta'));
          pushCandidate(u.searchParams.get('id'));
        } catch {}
      }
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
      message: 'Data KTA tidak ditemukan pada Google Spreadsheet terbaru. Data lokal lama tidak digunakan untuk verifikasi QR.'
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
