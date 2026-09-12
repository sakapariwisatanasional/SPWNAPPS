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
 * Normalisasi nilai identitas anggota.
 * Tidak mengubah data asli; hanya membuat bentuk pembanding yang konsisten.
 */
function normalizeText(value: unknown): string {
  return String(value ?? '')
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function compact(value: unknown): string {
  return normalizeText(value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function digits(value: unknown): string {
  return normalizeText(value).replace(/\D/g, '');
}

/**
 * Membandingkan identitas tanpa terjebak perbedaan format Google Sheets.
 * Contoh: 00.00.00.000001 dan 000000000001 dianggap sama.
 */
function identifierMatches(a: unknown, b: unknown): boolean {
  const aa = normalizeText(a);
  const bb = normalizeText(b);
  if (!aa || !bb) return false;

  if (aa.toLowerCase() === bb.toLowerCase()) return true;
  if (compact(aa) === compact(bb)) return true;

  const ad = digits(aa);
  const bd = digits(bb);
  if (ad && bd) {
    if (ad === bd) return true;
    // Untuk nomor KTA, toleransi nol di depan.
    if (ad.replace(/^0+/, '') === bd.replace(/^0+/, '')) return true;
  }

  return false;
}

/**
 * Pembersih dan penormalisasi kueri NTA/Barcode/QR/URL.
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

  const text = normalizeText(rawInput);
  let isUrl = false;
  let extractedQuery = text;

  try {
    const looksLikeUrl = /^https?:\/\//i.test(text) || /(?:verifyId|memberId|nta|kta|id)=/i.test(text) || /\/verify(?:\/|\?|$)/i.test(text);
    if (looksLikeUrl) {
      isUrl = true;
      const urlObj = new URL(text, typeof window !== 'undefined' ? window.location.origin : 'https://sakapariwisata-nasional.vercel.app');
      const qId = urlObj.searchParams.get('verifyId') ||
        urlObj.searchParams.get('memberId') ||
        urlObj.searchParams.get('nta') ||
        urlObj.searchParams.get('kta') ||
        urlObj.searchParams.get('id');

      if (qId) {
        extractedQuery = normalizeText(qId);
      } else if (urlObj.pathname.includes('/verify/')) {
        extractedQuery = normalizeText(decodeURIComponent(urlObj.pathname.split('/verify/')[1]?.split('?')[0] || ''));
      }
    }
  } catch {
    // Gunakan input mentah bila URL tidak dapat diparse.
  }

  const cleanQuery = normalizeText(extractedQuery);
  return {
    cleanQuery,
    strippedDigits: digits(cleanQuery),
    isUrl,
    extractedQuery
  };
}

/**
 * Ambil SEMUA identitas yang mungkin dibawa QR/URL.
 * Ini penting karena QR lama hanya membawa verifyId, sedangkan QR baru membawa
 * verifyId + memberId.
 */
export function getVerificationCandidates(rawInput: string): string[] {
  const candidates: string[] = [];
  const add = (value: unknown) => {
    const v = normalizeText(value);
    if (!v) return;
    if (!candidates.some(x => identifierMatches(x, v))) candidates.push(v);
  };

  add(normalizeNtaQuery(rawInput).cleanQuery);

  try {
    const url = new URL(rawInput, typeof window !== 'undefined' ? window.location.origin : 'https://sakapariwisata-nasional.vercel.app');
    ['verifyId', 'memberId', 'nta', 'kta', 'id', 'userId'].forEach(key => add(url.searchParams.get(key)));

    if (url.pathname.includes('/verify/')) {
      add(decodeURIComponent(url.pathname.split('/verify/')[1]?.split('?')[0] || ''));
    }
  } catch {
    // Bukan URL.
  }

  // Bila scanner mengembalikan URL encoded sebagai teks biasa.
  try {
    const decoded = decodeURIComponent(rawInput);
    if (decoded !== rawInput) add(decoded);
  } catch {}

  return candidates;
}

/**
 * Memeriksa kecocokan anggota dengan ID, Nomor KTA, token, NIK, telepon,
 * email, dan nama.
 */
export function isMemberMatch(member: Member, cleanQuery: string, strippedDigits: string): boolean {
  if (!member) return false;
  const q = normalizeText(cleanQuery);
  if (!q) return false;

  const values: unknown[] = [
    member.nationalMemberNumber,
    member.verificationToken,
    member.id,
    member.userId,
    member.nikMasked,
    member.phone,
    member.email,
    member.fullName
  ];

  for (const value of values) {
    if (identifierMatches(value, q)) return true;
  }

  const qDigits = strippedDigits || digits(q);
  if (qDigits.length >= 4) {
    const ntaDigits = digits(member.nationalMemberNumber);
    if (ntaDigits && (ntaDigits === qDigits || ntaDigits.replace(/^0+/, '') === qDigits.replace(/^0+/, ''))) return true;
    if (ntaDigits && ntaDigits.endsWith(qDigits)) return true;

    const phoneDigits = digits(member.phone);
    if (phoneDigits.length >= 8 && (phoneDigits.endsWith(qDigits) || qDigits.endsWith(phoneDigits))) return true;
  }

  const name = compact(member.fullName);
  const qCompact = compact(q);
  if (name && qCompact.length >= 4 && (name.includes(qCompact) || qCompact.includes(name))) return true;

  return false;
}

export function searchMemberLocally(rawInput: string, memberList?: Member[]): Member | null {
  const { cleanQuery, strippedDigits } = normalizeNtaQuery(rawInput);
  if (!cleanQuery && !strippedDigits) return null;

  const members = memberList && memberList.length > 0 ? memberList : storage.getMembers();
  for (const m of members) {
    if (isMemberMatch(m, cleanQuery, strippedDigits)) return m;
  }
  return null;
}

function parseRole(roleStr?: string): UserRole {
  if (!roleStr) return 'MEMBER';
  const r = roleStr.toUpperCase().replace(/\s+/g, '_');
  if (r.includes('SUPER') || r.includes('NASIONAL') || r.includes('PIMPINAN_NASIONAL') || r === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (r.includes('KWARDA') || r.includes('PROVINSI') || r === 'ADMIN_PROVINCE') return 'ADMIN_PROVINCE';
  if (r.includes('KWARCAB') || r.includes('KABUPATEN') || r.includes('KOTA') || r === 'ADMIN_REGENCY') return 'ADMIN_REGENCY';
  if (r.includes('KWARRAN') || r.includes('RANTING') || r.includes('KECAMATAN') || r === 'ADMIN_BRANCH') return 'ADMIN_BRANCH';
  return 'MEMBER';
}

/** Ambil nilai header dengan toleransi nama kolom lama/baru dan col_N. */
function getVal(row: Record<string, any>, aliases: string[]): string {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== null && normalizeText(row[alias])) return normalizeText(row[alias]);
  }

  const keys = Object.keys(row);
  for (const alias of aliases) {
    const ca = compact(alias);
    for (const key of keys) {
      if (compact(key) === ca) {
        const value = normalizeText(row[key]);
        if (value) return value;
      }
    }
  }
  return '';
}

function makeMemberFromAnggotaRow(row: Record<string, any>, idx: number): Member {
  const fullName = getVal(row, ['Nama Lengkap', 'nama_lengkap', 'Nama', 'nama', 'Full Name', 'Name', 'col_2']) || `Anggota ${idx + 1}`;
  const kta = getVal(row, ['Nomor KTA', 'Nomor Anggota', 'Nomor NTA', 'nomor_kta', 'NTA', 'KTA', 'No KTA', 'No. KTA', 'No NTA', 'No. NTA', 'Nomor Registrasi', 'col_1']);
  const email = getVal(row, ['Email', 'email', 'E-mail', 'Alamat Email', 'col_3']);
  const phone = getVal(row, ['Nomor WA', 'No WhatsApp', 'Nomor WhatsApp', 'No WA', 'WhatsApp', 'Telepon', 'col_4']);
  const memberId = getVal(row, ['ID', 'id', 'Id', 'member_id', 'Member ID', 'Nomor ID', 'col_0']) || `sheet-member-${idx}`;
  const prov = getVal(row, ['Provinsi', 'Kwarda', 'provinsi', 'col_5']) || 'Tingkat Nasional';
  const kab = getVal(row, ['Kabupaten/Kota', 'Kwarcab', 'kabupaten', 'Kabupaten', 'Kota', 'col_6']) || 'Kwartir Nasional';
  const kec = getVal(row, ['Kecamatan', 'Kwarran/Kecamatan', 'Kwartir Ranting', 'Kwarran', 'kecamatan_ranting', 'Ranting', 'col_7']) || 'Pimpinan Nasional';
  const jabatan = getVal(row, ['Jabatan', 'Posisi / Jabatan', 'Jabatan Kepengurusan', 'Posisi', 'col_8']);
  const krida = getVal(row, ['Krida', 'krida', 'Peminatan Krida', 'col_9']) || 'Krida Pemandu';
  const role = parseRole(getVal(row, ['Role', 'Peran', 'Hak Akses', 'Wewenang']) || jabatan);
  const rawFoto = getVal(row, ['Foto URL', 'foto_url', 'Foto', 'Pas Foto', 'Photo', 'Avatar', 'Link Foto', 'col_11']);
  const avatarUrl = formatDriveImageUrl(rawFoto) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80';
  const rawStatus = getVal(row, ['Status', 'status', 'Status Keanggotaan', 'col_10']).toUpperCase();

  const member: Member = {
    id: memberId,
    userId: getVal(row, ['User ID', 'ID User', 'user_id', 'userId']) || `user-${memberId}`,
    nationalMemberNumber: kta || undefined,
    fullName,
    nikMasked: getVal(row, ['NIK', 'NIK Masked', 'NIK Terakhir']) || '3201**********01',
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
    status: rawStatus === 'PENDING' ? 'PENDING' : 'ACTIVE',
    registeredAt: getVal(row, ['Tanggal Daftar', 'tanggal_daftar', 'Created At', 'Timestamp', 'col_12']) || new Date().toISOString(),
    verificationToken: getVal(row, ['Verification Token', 'Token Verifikasi', 'verificationToken']) || `VERIFY-SP-${kta ? kta.replace(/\./g, '') : memberId}`,
    isOperator: role !== 'MEMBER',
    operatorRole: role !== 'MEMBER' ? role : undefined,
    skills: [],
    certifications: [],
    locationHistory: []
  };

  return member;
}

/**
 * Verifikasi remote yang kompatibel dengan DATA LAMA.
 *
 * Sumber utama profil tetap sheet Anggota.
 * Sheet Users dipakai sebagai registry kedua untuk menghubungkan:
 * Users.Member ID -> Anggota.ID
 * Users.ID User   -> Anggota.User ID (bila ada)
 *
 * Status PENDING tidak pernah dipakai sebagai filter pencarian.
 */
export async function searchMemberInRemoteSpreadsheet(rawInput: string): Promise<Member | null> {
  const candidates = getVerificationCandidates(rawInput);
  if (candidates.length === 0) return null;

  try {
    // Ambil kedua sheet secara live. Promise.all menjaga latency tetap rendah.
    const [anggotaRows, userRows] = await Promise.all([
      spreadsheetService.fetchSheetRows('Anggota'),
      spreadsheetService.fetchSheetRows('Users').catch(() => [] as Record<string, any>[])
    ]);

    if (!Array.isArray(anggotaRows) || anggotaRows.length === 0) {
      console.warn('[KTA VERIFY] Sheet Anggota kosong/tidak terbaca. Users rows:', userRows.length);
      return null;
    }

    // Bangun indeks Users dari Member ID dan ID User.
    const userByMemberId = new Map<string, Record<string, any>>();
    const userByUserId = new Map<string, Record<string, any>>();

    for (const user of userRows) {
      const memberId = getVal(user, ['Member ID', 'member_id', 'MemberID', 'ID Anggota', 'ID Member', 'col_9']);
      const userId = getVal(user, ['ID User', 'User ID', 'ID', 'id_user', 'userId', 'col_0']);
      if (memberId) userByMemberId.set(compact(memberId), user);
      if (userId) userByUserId.set(compact(userId), user);
    }

    // Pertama cari langsung di Anggota berdasarkan seluruh identitas QR.
    for (let idx = 0; idx < anggotaRows.length; idx++) {
      const row = anggotaRows[idx];
      const member = makeMemberFromAnggotaRow(row, idx);
      const link = getVal(row, ['Link Verifikasi', 'Verification Link', 'verificationLink', 'link_verifikasi', 'col_13']);
      const rowUserId = getVal(row, ['User ID', 'ID User', 'user_id', 'userId']);

      const directMatch = candidates.some(candidate => {
        const q = normalizeNtaQuery(candidate);
        return isMemberMatch(member, q.cleanQuery, q.strippedDigits) || identifierMatches(link, candidate) || identifierMatches(rowUserId, candidate);
      });

      if (directMatch) {
        // Jika ID Anggota memiliki record Users, lengkapi userId/status metadata.
        const user = userByMemberId.get(compact(member.id));
        const userById = rowUserId ? userByUserId.get(compact(rowUserId)) : undefined;
        const linkedUser = user || userById;
        if (linkedUser) {
          const linkedUserId = getVal(linkedUser, ['ID User', 'User ID', 'ID', 'col_0']);
          if (linkedUserId) member.userId = linkedUserId;
        }
        storage.addOrUpdateMember(member);
        console.info('[KTA VERIFY] MATCH ANGGOTA', { id: member.id, kta: member.nationalMemberNumber, name: member.fullName });
        return member;
      }
    }

    // Kedua: gunakan Users sebagai jembatan. Ini menangani data lama ketika
    // QR/URL hanya berisi Member ID atau ID User tetapi Anggota memiliki format berbeda.
    for (const candidate of candidates) {
      const user = userByMemberId.get(compact(candidate)) || userByUserId.get(compact(candidate));
      if (!user) continue;

      const linkedMemberId = getVal(user, ['Member ID', 'member_id', 'MemberID', 'ID Anggota', 'ID Member', 'col_9']);
      const linkedUserId = getVal(user, ['ID User', 'User ID', 'ID', 'id_user', 'userId', 'col_0']);
      if (!linkedMemberId && !linkedUserId) continue;

      for (let idx = 0; idx < anggotaRows.length; idx++) {
        const member = makeMemberFromAnggotaRow(anggotaRows[idx], idx);
        if ((linkedMemberId && identifierMatches(member.id, linkedMemberId)) || (linkedUserId && identifierMatches(member.userId, linkedUserId))) {
          member.userId = linkedUserId || member.userId;
          storage.addOrUpdateMember(member);
          console.info('[KTA VERIFY] MATCH VIA USERS', { candidate, id: member.id, kta: member.nationalMemberNumber, name: member.fullName });
          return member;
        }
      }
    }

    console.warn('[KTA VERIFY] NO MATCH', {
      candidates,
      anggotaRows: anggotaRows.length,
      userRows: userRows.length
    });
  } catch (err) {
    console.warn('[KTA VERIFY] Live remote spreadsheet lookup failed:', err);
  }

  return null;
}

export async function verifyMemberUniversal(
  rawInput: string,
  localMembers?: Member[],
  options?: { authoritativeRemote?: boolean }
): Promise<VerificationResult> {
  const { cleanQuery } = normalizeNtaQuery(rawInput);
  const authoritativeRemote = options?.authoritativeRemote === true;

  if (!cleanQuery && getVerificationCandidates(rawInput).length === 0) {
    return {
      found: false,
      member: null,
      source: 'NONE',
      searchTerm: rawInput,
      normalizedTerm: '',
      message: 'Silakan masukkan nomor anggota atau token verifikasi.'
    };
  }

  if (authoritativeRemote) {
    const candidates = getVerificationCandidates(rawInput);
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

    return {
      found: false,
      member: null,
      source: 'NONE',
      searchTerm: rawInput,
      normalizedTerm: cleanQuery,
      message: 'Data anggota tidak ditemukan pada Google Spreadsheet terbaru. Pencarian sudah menggunakan Nomor KTA, ID Anggota, dan Member ID Users.'
    };
  }

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

  return {
    found: false,
    member: null,
    source: 'NONE',
    searchTerm: rawInput,
    normalizedTerm: cleanQuery,
    message: 'Nomor Anggota Tidak Ditemukan. Pastikan ID anggota atau Nomor KTA sesuai dengan Google Spreadsheet.'
  };
}
