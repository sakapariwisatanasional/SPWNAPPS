import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const app = express();
const PORT = 3000;
export type UserRole = 
  | 'SUPER_ADMIN'      // Kwartir Nasional (Nasional)
  | 'ADMIN_PROVINCE'   // Kwartir Daerah (Provinsi)
  | 'ADMIN_REGENCY'    // Kwartir Cabang (Kabupaten/Kota)
  | 'ADMIN_BRANCH'     // Kwartir Ranting (Kecamatan/Ranting)
  | 'MEMBER'           // Anggota Saka Pariwisata
  | 'PUBLIC';          // Pengunjung Umum

export type MemberStatus = 
  | 'PENDING'
  | 'ACTIVE'
  | 'REVISION_REQUIRED'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'RESIGNED';

export interface Province {
  id: string;          // Kode 2 digit (e.g. '32')
  code: string;
  name: string;
  island: string;
  memberCount?: number;
}

export interface Regency {
  id: string;          // Kode e.g. '32.06'
  provinceId: string;
  code: string;
  name: string;
  type: 'KABUPATEN' | 'KOTA' | 'PUSAT' | 'NASIONAL';
  memberCount?: number;
}

export interface District {
  id: string;          // Kode e.g. '32.06.12'
  regencyId: string;
  code: string;
  name: string;
}

export interface MemberLocationHistory {
  id: string;
  memberId: string;
  prevDistrictName: string;
  newDistrictName: string;
  prevMemberNumber: string;
  newMemberNumber: string;
  transferDate: string;
  reason: string;
  authorizedByName: string;
}

export type SkillProficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface Skill {
  id: string;
  name: string;
  category: 
    | 'Pemanduan & Tour Guide'
    | 'Fotografi & Media'
    | 'Ekowisata & Alam'
    | 'Hospitality & Kuliner'
    | 'Digital Marketing & UMKM'
    | 'Budaya & Storytelling'
    | 'MICE & Event';
  description: string;
  iconName?: string;
}

export interface MemberSkill {
  id: string;
  skillId: string;
  skillName: string;
  category: string;
  proficiency: SkillProficiency;
  yearsOfExperience: number;
  portfolioUrl?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  certificateNumber?: string;
  certificateIssuer?: string;
  certificateFileUrl?: string;
}

export interface Certification {
  id: string;
  memberId: string;
  name: string;
  certNumber: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  fileUrl?: string;
  isVerified: boolean;
}

export type KridaType = 
  | 'Krida Pemandu'
  | 'Krida Penyuluh'
  | 'Krida Mice & Event'
  | 'Krida Kuliner & Cinderamata';

export interface Member {
  id: string;                  // UUID
  userId: string;
  nationalMemberNumber?: string; // Format: PP.KK.KC.NNNNNN
  fullName: string;
  nikMasked: string;           // E.g. 320612******0004
  avatarUrl: string;
  gender: 'LAKI_LAKI' | 'PEREMPUAN';
  birthPlace: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  
  // Hierarchy Links
  provinceId: string;
  provinceName: string;
  regencyId: string;
  regencyName: string;
  districtId: string;
  districtName: string;
  
  joinYear: number;
  status: MemberStatus;
  currentPosition: string;     // e.g. Anggota Krida Pemandu
  krida?: KridaType;
  educationLevel: string;
  occupation: string;
  bio: string;
  
  skills: MemberSkill[];
  certifications: Certification[];
  locationHistory: MemberLocationHistory[];
  
  registeredAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  verificationToken: string;   // Token untuk QR Code publik

  // Operator Privileges & Delegation
  isOperator?: boolean;
  operatorRole?: UserRole;
  operatorJurisdictionId?: string;
  operatorJurisdictionName?: string;
  operatorAssignedAt?: string;
  operatorAssignedBy?: string;
  operatorNotes?: string;
}

export type TourCategory = 
  | 'Wisata Alam'
  | 'Wisata Budaya'
  | 'Wisata Kuliner'
  | 'Desa Wisata'
  | 'Ekowisata'
  | 'Adventure'
  | 'Eduwisata'
  | 'Bahari'
  | 'Heritage & Sejarah'
  | 'MICE & Event';

export type TourOwnerType = 'MEMBER' | 'BRANCH' | 'REGENCY' | 'PROVINCE' | 'PARTNER';

export type TourStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED_PUBLISHED' | 'REJECTED';

export interface TourItinerary {
  day: number;
  title: string;
  description: string;
  timeRange?: string;
}

export interface TourPackage {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: TourCategory;
  coverImage: string;
  galleryImages: string[];
  
  ownerType: TourOwnerType;
  ownerId: string;
  ownerName: string;
  
  provinceId: string;
  provinceName: string;
  regencyId: string;
  regencyName: string;
  districtName: string;
  branchName?: string;
  
  locationAddress: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  googleMapsUrl?: string;
  
  durationDays: number;
  pricePerPerson: number;
  minCapacity: number;
  maxCapacity: number;
  
  facilities: string[];
  lodgingType?: string;
  transportationType?: string;
  guideProvided: boolean;
  contactPhone: string;
  contactEmail: string;
  
  itinerary: TourItinerary[];
  
  status: TourStatus;
  submittedAt: string;
  publishedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  viewsCount: number;
  featured?: boolean;
}

export interface Activity {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl: string;
  coverImage?: string;
  category: string;
  organizerLevel: 'INTERNASIONAL' | 'NASIONAL' | 'PROVINSI' | 'KABUPATEN' | 'RANTING';
  organizerName: string;
  
  locationName: string;
  locationAddress?: string;
  provinceId?: string;
  provinceName: string;
  regencyId?: string;
  regencyName: string;
  scope?: string;
  
  startDate: string;
  endDate: string;
  timeString: string;
  capacity: number;
  maxParticipants?: number;
  registeredCount: number;
  isPublic: boolean;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'OPEN_REGISTRATION';
  requirements: string[];
  
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  feeType?: 'GRATIS' | 'BERBAYAR' | 'SUBSIDI';
  feeAmount?: number;
  uploadedByRole?: 'SUPER_ADMIN' | 'ADMIN_PROVINCE' | 'ADMIN_REGENCY' | 'ADMIN_BRANCH' | 'OPERATOR';
  uploadedByName?: string;
  uploadedAt?: string;
  registrationLink?: string;
  featured?: boolean;
}

export interface ActivityRegistration {
  id: string;
  activityId: string;
  activityTitle: string;
  memberId: string;
  memberName: string;
  registeredAt: string;
  status: 'REGISTERED' | 'CONFIRMED' | 'ATTENDED';
  attendanceQrCode: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'MEMBER' | 'TOUR_PACKAGE' | 'ACTIVITY' | 'TERRITORY' | 'AUTH' | 'SKILL' | 'CULINARY_SOUVENIR';
  entityId: string;
  description: string;
  timestamp: string;
  ipAddress: string;
}

export type ProductKind = 'KULINER' | 'CINDERAMATA';

export type KridaProductCategory = 
  | 'Pemanduan & Paket Wisata'    // Krida Pemandu (Walking Tour, Local Guide, Ekowisata)
  | 'Fotografi & Media Wisata'     // Krida Penyuluh (Foto Wisata, Video Promosi, Cetak Karya)
  | 'MICE, Kemah & Atraksi'       // Krida Atraksi & MICE (Scout Camp, Pertunjukan, Outbound)
  | 'Kuliner & Minuman Daerah'    // Krida Kuliner & Cinderamata (Makanan Tradisional, Minuman Herbal)
  | 'Kriya & Cinderamata Khas'    // Krida Kuliner & Cinderamata (Batik, Anyaman, Kerajinan, Suvenir)
  | 'Jasa & Edukasi Wisata';      // Pelatihan, Storytelling, Workshop

export type ProductModerationStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface CulinarySouvenirItem {
  id: string;
  name: string;
  kind: ProductKind; // 'KULINER' | 'CINDERAMATA'
  krida: KridaType;  // 'Krida Pemandu' | 'Krida Penyuluh' | 'Krida Mice & Event' | 'Krida Kuliner & Cinderamata'
  kridaCategory: KridaProductCategory;
  categoryLabel: string; // e.g. "Makanan Khas", "Minuman Tradisional", "Kriya Anyaman", "Batik Daerah", "Jasa Pemanduan", "Paket Kemah"
  description: string;
  storyOrigin?: string; // Cerita/Filosofi/Sejarah Khas Daerah atau Nilai Tambah
  priceEstimate: number;
  priceUnit?: string; // e.g. "per porsi", "per buah", "per pax", "per paket", "per hari", "per lembar"
  imageUrl: string;
  galleryImages?: string[];
  
  // Wilayah asal (Kwarran / Kwarcab / Kwarda)
  provinceId: string;
  provinceName: string;
  regencyId: string;
  regencyName: string;
  districtId: string; // Kwarran ID
  districtName: string; // Kwarran / Kecamatan Name
  
  // Penginput (Anggota Saka)
  authorMemberId: string;
  authorName: string;
  authorNta?: string;
  authorAvatarUrl?: string;
  authorRole?: string;
  
  // Kontak & Sentra UMKM / Pangkalan
  umkmName?: string;
  contactPhone: string; // WhatsApp untuk pemesanan / info
  contactEmail?: string;
  address?: string;
  tags: string[];
  
  // Alur Persetujuan Operator Wilayah
  status: ProductModerationStatus; // 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  approverRole?: UserRole;
  rejectionReason?: string;
  
  createdAt: string;
  likesCount: number;
  featured?: boolean;
}

export interface CurrentUser {
  id: string;
  username?: string;
  email: string;
  name: string;
  role: UserRole;
  jurisdictionName?: string;
  jurisdictionId?: string;
  avatarUrl: string;
  memberId?: string;
}

export type KtaCardTheme = 'purple_saka' | 'emerald_pesona' | 'indigo_navy' | 'dark_slate' | 'gold_amber';
export type KtaBarcodeType = 'CODE128' | 'STANDARD' | 'QR';
export type KtaCardPreset = 'CR80_KTA' | 'KTP' | 'SIM' | 'CUSTOM';
export type KtaCardSide = 'FRONT' | 'BACK';
export type KtaMemberFieldKey =
  | 'fullName' | 'id' | 'nationalMemberNumber' | 'currentPosition'
  | 'provinceName' | 'regencyName' | 'districtName' | 'krida' | 'phone' | 'email' | 'joinYear' | 'status';

export interface KtaDataFieldConfig {
  id: string;
  field: KtaMemberFieldKey;
  label?: string;
  showLabel?: boolean;
  side: KtaCardSide;
  visible: boolean;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'bold' | 'black';
  color: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase';
  align?: 'left' | 'center' | 'right';
}

export interface KtaLogoElement {
  id: string; name: string; url: string; side: KtaCardSide;
  x: number; y: number; width: number; height: number; opacity?: number;
  objectFit?: 'contain' | 'cover' | 'fill';
}

export interface KtaTextElement {
  id: string; text: string; side: KtaCardSide; x: number; y: number; width: number;
  fontSize: number; fontWeight: 'normal' | 'medium' | 'bold' | 'black'; color: string;
  align?: 'left' | 'center' | 'right'; textTransform?: 'none' | 'uppercase' | 'lowercase';
}

export interface KtaCardSettings {
  preset?: KtaCardPreset; widthMm: number; heightMm: number; cornerRadiusMm: number;
  cardTheme: KtaCardTheme; bgImageUrl?: string; frontBackgroundUrl?: string; backBackgroundUrl?: string;
  customBackgroundColorFront?: string; customBackgroundColorBack?: string; bgOpacity?: number;
  frontLogoUrl?: string; backLogoUrl?: string; logos: KtaLogoElement[];
  dataFields: KtaDataFieldConfig[]; textElements: KtaTextElement[];
  frontOrganizationTitle: string; frontOrganizationSubtitle: string;
  frontOrganizationTitleX?: number; frontOrganizationTitleY?: number; frontOrganizationTitleWidth?: number;
  frontOrganizationTitleFontSize?: number; frontOrganizationTitleFontWeight?: 'normal'|'medium'|'bold'|'black';
  frontOrganizationTitleColor?: string; frontOrganizationTitleAlign?: 'left'|'center'|'right';
  frontOrganizationSubtitleX?: number; frontOrganizationSubtitleY?: number; frontOrganizationSubtitleWidth?: number;
  frontOrganizationSubtitleFontSize?: number; frontOrganizationSubtitleFontWeight?: 'normal'|'medium'|'bold'|'black';
  frontOrganizationSubtitleColor?: string; frontOrganizationSubtitleAlign?: 'left'|'center'|'right';
  frontValidityText: string; watermarkOpacity: number; showKridaBadge: boolean;
  showPhoto: boolean; showQrCode: boolean; qrX?: number; qrY?: number; qrSize?: number;
  backHeaderTitle: string; backHeaderSubtitle: string; terms: string[]; issueLocationDate: string;
  barcodeType: KtaBarcodeType; barcodeCustomValue?: string; showBarcode?: boolean;
  barcodeX?: number; barcodeY?: number; barcodeWidth?: number; barcodeHeight?: number; barcodeShowText?: boolean;
  barcodeCaption?: string;
  showBarcodeFront?: boolean; barcodeFrontCustomValue?: string; barcodeFrontX?: number; barcodeFrontY?: number; barcodeFrontWidth?: number; barcodeFrontHeight?: number; barcodeFrontShowText?: boolean; barcodeFrontCaption?: string; barcodeFrontCaptionX?: number; barcodeFrontCaptionY?: number; barcodeFrontCaptionWidth?: number; barcodeFrontCaptionFontSize?: number; barcodeFrontCaptionFontWeight?: 'normal'|'medium'|'bold'|'black'; barcodeFrontCaptionColor?: string; barcodeFrontCaptionAlign?: 'left'|'center'|'right'; barcodeFrontCaptionLineHeight?: number; barcodeFrontCaptionLetterSpacing?: number;
  photoX?: number; photoY?: number; photoWidth?: number; photoHeight?: number; photoRadius?: number; photoBorderWidth?: number; photoBorderColor?: string; photoObjectFit?: 'contain'|'cover'|'fill';
  frontValidityTextX?: number; frontValidityTextY?: number; frontValidityTextWidth?: number; frontValidityTextFontSize?: number; frontValidityTextFontWeight?: 'normal'|'medium'|'bold'|'black'; frontValidityTextColor?: string; frontValidityTextAlign?: 'left'|'center'|'right'; frontValidityTextLineHeight?: number; frontValidityTextLetterSpacing?: number;
  frontOrganizationTitleLineHeight?: number; frontOrganizationTitleLetterSpacing?: number; frontOrganizationSubtitleLineHeight?: number; frontOrganizationSubtitleLetterSpacing?: number;
  backHeaderTitleX?: number; backHeaderTitleY?: number; backHeaderTitleWidth?: number; backHeaderTitleFontSize?: number; backHeaderTitleFontWeight?: 'normal'|'medium'|'bold'|'black'; backHeaderTitleColor?: string; backHeaderTitleAlign?: 'left'|'center'|'right'; backHeaderTitleLineHeight?: number; backHeaderTitleLetterSpacing?: number;
  backHeaderSubtitleX?: number; backHeaderSubtitleY?: number; backHeaderSubtitleWidth?: number; backHeaderSubtitleFontSize?: number; backHeaderSubtitleFontWeight?: 'normal'|'medium'|'bold'|'black'; backHeaderSubtitleColor?: string; backHeaderSubtitleAlign?: 'left'|'center'|'right'; backHeaderSubtitleLineHeight?: number; backHeaderSubtitleLetterSpacing?: number;
  termsX?: number; termsY?: number; termsWidth?: number; termsFontSize?: number; termsFontWeight?: 'normal'|'medium'|'bold'|'black'; termsColor?: string; termsAlign?: 'left'|'center'|'right'; termsLineHeight?: number; termsLetterSpacing?: number;
  signerX?: number; signerY?: number; signerWidth?: number; signerColor?: string; signerAlign?: 'left'|'center'|'right'; signerLineHeight?: number; signerLetterSpacing?: number; issueLocationDateFontSize?: number; signerNameFontSize?: number; signerTitleFontSize?: number; signerSubtitleFontSize?: number;
  signerName: string; signerTitle: string; signerSubtitle?: string; showStamp: boolean;
  lastUpdated?: string; updatedBy?: string;
}

// ==========================================
// 4 KRIDA MODULES & CURRICULUM TYPES
// ==========================================
export type KridaId = 'pemandu' | 'penyuluh' | 'kuliner' | 'mice';

export interface KridaCategoryInfo {
  id: KridaId;
  name: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  color: string;
  borderGlow: string;
  description: string;
  desc?: string;
  topicsCount: number;
}

export interface KridaCurriculumSession {
  sessionNumber: number;
  title: string;
  duration: string;
  competency: string;
  method: string;
}

export interface KridaTestRequirements {
  purwa: string[];
  madya: string[];
  utama: string[];
}

export interface KridaCompetencyRow {
  code: string;
  element: string;
  indicator: string;
  assessment: string;
}

export interface KridaImage {
  id: string;
  url: string;
  caption: string;
}

export interface KridaLink {
  id: string;
  title: string;
  url: string;
  type: 'VIDEO' | 'REFERENCE' | 'REGULATION';
}

export interface KridaDownloadFile {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: string;
}

// Aliases for editor and modal components
export type CompetencyRow = KridaCompetencyRow;
export type ModuleImage = KridaImage;
export type ModuleLink = KridaLink;
export type DownloadableResource = KridaDownloadFile;
export type CurriculumSession = KridaCurriculumSession;

export interface KridaModuleItem {
  id: string;
  kridaId: KridaId;
  kridaName: string;
  code: string; // e.g. 'PM-01', 'PY-01', 'ME-01', 'KC-01'
  title: string;
  badge: string;
  levelSKK: string;
  description: string;
  content: string; // Rich formatted text/markdown
  curriculum: KridaCurriculumSession[];
  testRequirements: KridaTestRequirements;
  competencyTable: KridaCompetencyRow[];
  images: KridaImage[];
  links: KridaLink[];
  downloads: KridaDownloadFile[];
  updatedAt: string;
  updatedBy: string;
  // Standar Buku Panduan SKK Saka Pariwisata 2026:
  skkniReference?: string;
  practiceProduct?: {
    purwa: string;
    madya: string;
    utama: string;
  };
  portfolioItems?: string[];
  scoringWeights?: {
    knowledge: number; // 20%
    skill: number;     // 40%
    attitude: number;  // 20%
    product: number;   // 20%
    passingGrade: number; // 80 (Memenuhi)
  };
  specialSafetyNotes?: string;
}


// Security & Compliance Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: blob: https:; connect-src 'self' https: wss:; frame-ancestors *;"
  );
  next();
});

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// CORS handler for cross-device access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ==========================================
// PASSWORD HASHING & SESSION MANAGEMENT
// ==========================================
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, key] = storedHash.split(':');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  } catch {
    return false;
  }
}

interface ActiveSession {
  token: string;
  userId: string;
  username: string;
  role: string;
  name: string;
  jurisdictionName?: string;
  jurisdictionId?: string;
  avatarUrl?: string;
  memberId?: string;
  expiresAt: number;
}

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// IMPORTANT: set SESSION_SECRET in production (especially Vercel) so every
// serverless instance can verify the same bearer token.
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-only-change-this-session-secret';
const IS_VERCEL = process.env.VERCEL === '1' || !!process.env.VERCEL;

// URL Google Apps Script TIDAK boleh ditentukan oleh source code.
// Super Admin mengisinya melalui Dashboard > Pengaturan API.
const DEFAULT_APPS_SCRIPT_URL = '';

function normalizeManualAppsScriptUrl(raw: unknown): string {
  const value = String(raw || '').trim().replace(/\s+/g, '');
  if (!value) return '';
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:[?#].*)?$/i.test(value)) {
    return '';
  }
  return value;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signSessionPayload(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
}

function createSession(user: any): string {
  const payload = {
    userId: String(user.id),
    username: String(user.username || user.email || ''),
    role: String(user.role || 'MEMBER'),
    name: String(user.name || user.fullName || ''),
    jurisdictionName: user.jurisdictionName,
    jurisdictionId: user.jurisdictionId,
    avatarUrl: user.avatarUrl,
    memberId: user.memberId,
    exp: Date.now() + SESSION_TTL_MS
  };
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${signSessionPayload(encoded)}`;
}

function getSessionUser(req: express.Request): ActiveSession | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSignature] = parts;
  const expectedSignature = signSessionPayload(encodedPayload);

  try {
    const a = Buffer.from(providedSignature);
    const b = Buffer.from(expectedSignature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload || typeof payload.exp !== 'number' || Date.now() > payload.exp) return null;

    return {
      token,
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      name: payload.name,
      jurisdictionName: payload.jurisdictionName,
      jurisdictionId: payload.jurisdictionId,
      avatarUrl: payload.avatarUrl,
      memberId: payload.memberId,
      expiresAt: payload.exp
    };
  } catch {
    return null;
  }
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'saka-database.json');

const DEFAULT_SPREADSHEET_ID = '1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E';
const DEFAULT_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit?usp=sharing`;

interface DatabaseSchema {
  config: {
    spreadsheetId: string;
    spreadsheetUrl: string;
    scriptUrl: string;
    autoSync: boolean;
    autoRefreshIntervalSeconds: number;
    lastSyncedAt: string;
    status: string;
  };
  members: any[];
  tours: any[];
  culinaryItems: any[];
  activities: any[];
  kridaModules?: any[];
  users: any[];
  auditLogs: any[];
  lastUpdated: string;
  version: number;
}

// Initial in-memory database
let db: DatabaseSchema = {
  config: {
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
    scriptUrl: '',
    autoSync: true,
    autoRefreshIntervalSeconds: 6,
    lastSyncedAt: new Date().toISOString(),
    status: 'CONNECTED'
  },
  members: [],
  tours: [],
  culinaryItems: [],
  activities: [],
  kridaModules: [],
  users: [],
  auditLogs: [],
  lastUpdated: new Date().toISOString(),
  version: 1
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create data dir:', e);
  }
}

// Load database from file
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      db = {
        ...db,
        ...parsed,
        config: {
          ...db.config,
          ...(parsed.config || {})
        }
      };
      console.log(`[DB] Loaded ${db.members.length} members, ${db.tours.length} tours, ${db.activities.length} activities from file.`);
    }
  } catch (err) {
    console.error('[DB] Error loading database file:', err);
  }
}

// Ensure users and Super Admin account are securely initialized with password hashes
function initializeUsersAndSuperAdmin() {
  if (!Array.isArray(db.users)) {
    db.users = [];
  }

  // Scrub any legacy plain text passwords or insecure demo users
  db.users = db.users.filter(u => u.username !== 'rohadiwijaya' && u.password !== 'rohadiwijaya');

  const adminUsername = process.env.ADMIN_USERNAME || 'admin_saka';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SakaPariwisata#2026!';

  let superAdmin = db.users.find(u => u.role === 'SUPER_ADMIN');
  if (!superAdmin) {
    superAdmin = {
      id: 'user-superadmin-nasional',
      username: adminUsername,
      passwordHash: hashPassword(adminPassword),
      email: 'admin@sakapariwisata.id',
      name: 'Super Admin Kwartir Nasional',
      role: 'SUPER_ADMIN',
      jurisdictionName: 'Kwartir Nasional (Pusat)',
      jurisdictionId: '00',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };
    db.users.push(superAdmin);
    saveDatabase();
    console.log(`[Security] Super Admin account initialized with secure hashed password (Username: ${adminUsername}).`);
  } else if (!superAdmin.passwordHash) {
    superAdmin.passwordHash = hashPassword(adminPassword);
    delete (superAdmin as any).password;
    saveDatabase();
  }
}

// Save database to file
function saveDatabase() {
  try {
    db.lastUpdated = new Date().toISOString();
    db.version = (db.version || 0) + 1;
    // Vercel serverless filesystems are not persistent. Keep the in-memory
    // cache for the lifetime of the instance, but never let a read-only FS
    // operation break an API request.
    if (!IS_VERCEL) {
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[DB] Error saving database file:', err);
  }
}

loadDatabase();
initializeUsersAndSuperAdmin();

// GViz API fetcher helper
async function fetchSheetGViz(sheetName: string): Promise<Record<string, any>[]> {
  const spreadsheetId = db.config.spreadsheetId || DEFAULT_SPREADSHEET_ID;
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&_t=${Date.now()}`;
  try {
    const res = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
    if (!res.ok) return [];
    const text = await res.text();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) return [];

    const json = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
    if (!json.table || !json.table.rows) return [];

    const cols = (json.table.cols || []).map((c: any, i: number) => (c && c.label && c.label.trim()) || `col_${i}`);
    return json.table.rows.map((row: any) => {
      const item: Record<string, any> = {};
      if (row.c) {
        row.c.forEach((cell: any, idx: number) => {
          const key = cols[idx] || `col_${idx}`;
          item[key] = cell ? (cell.v !== null && cell.v !== undefined ? cell.v : cell.f || '') : '';
        });
      }
      return item;
    }).filter((r: any) => Object.values(r).some(v => v !== '' && v !== null && v !== undefined));
  } catch (err) {
    console.warn(`[Sync] GViz fetch error for ${sheetName}:`, err);
    return [];
  }
}

function cleanDriveUrl(raw?: string): string {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('data:image') || trimmed.startsWith('blob:')) return trimmed;
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return trimmed;
}

function getColVal(row: Record<string, any>, aliases: string[]): string {
  if (!row) return '';
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
        if (v !== undefined && v !== null && String(v).trim() !== '') {
          return String(v).trim();
        }
      }
    }
  }
  return '';
}

// Full sync from Google Spreadsheet to Central Server DB
async function syncFromGoogleSpreadsheet(): Promise<{ success: boolean; message: string }> {
  console.log('[Sync] Starting full sync from Google Spreadsheet...');
  try {
    // 1. Sync Anggota
    const memberRows = await fetchSheetGViz('Anggota');
    if (memberRows && memberRows.length > 0) {
      const importedMembers = memberRows.map((row, idx) => {
        const fullName = getColVal(row, ['Nama Lengkap', 'Nama', 'Full Name', 'col_2']) || `Anggota ${idx + 1}`;
        const kta = getColVal(row, ['Nomor KTA', 'Nomor Anggota', 'Nomor NTA', 'NTA', 'KTA', 'No KTA', 'col_1']);
        const rawProv = getColVal(row, ['Kwartir Daerah (Provinsi)', 'Kwartir Daerah', 'Kwarda', 'Provinsi', 'province', 'col_5']);
        const rawReg = getColVal(row, ['Kwartir Cabang (Kab/Kota)', 'Kwartir Cabang', 'Kwarcab', 'Kabupaten/Kota', 'Kabupaten', 'Kota', 'regency', 'col_6']);
        const rawDistrict = getColVal(row, ['Kecamatan', 'Kwarran/Kecamatan', 'Kwartir Ranting', 'Kwarran', 'Ranting', 'districtName', 'col_7']);
        const isNational = /^(00|nasional|tingkat nasional|kwartir nasional|kwar?nas|pimpinan nasional)$/i.test(String(rawProv || '').trim()) || /kwartir\s+nasional|tingkat\s+nasional|pusat\s+nasional/i.test(String(rawReg || ''));
        const provinceId = getColVal(row, ['ID Provinsi', 'provinceId']) || (isNational ? '00' : '');
        const provinceName = isNational ? 'Kwartir Nasional' : rawProv;
        const regencyId = getColVal(row, ['ID Kwarcab', 'regencyId']) || (isNational ? '00.00' : '');
        const regencyName = isNational ? 'Pusat Nasional' : rawReg;
        const districtId = getColVal(row, ['ID Kecamatan', 'ID Kwarran', 'districtId']) || (isNational ? '00.00.00' : '');
        const districtName = isNational ? 'Nasional' : rawDistrict;
        const currentPosition = getColVal(row, ['Jabatan', 'Gudep', 'Posisi / Jabatan', 'Posisi / Jabatan Kepengurusan', 'Jabatan Kepengurusan', 'Posisi', 'currentPosition', 'current_position', 'col_8']);
        const krida = getColVal(row, ['Krida', 'Peminatan Krida', 'Peminatan Krida Saka Pariwisata', 'col_9']) || 'Krida Pemandu';
        const status = (getColVal(row, ['Status', 'Status Keanggotaan', 'status', 'col_10']) || 'ACTIVE').toUpperCase();
        const photo = cleanDriveUrl(getColVal(row, ['Foto URL', 'Foto', 'Avatar', 'Link Foto', 'col_11'])) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80';
        const email = getColVal(row, ['Email', 'email', 'E-mail', 'col_3']) || `member${idx + 1}@pramuka.id`;
        const phone = getColVal(row, ['Nomor WA', 'Nomor WhatsApp', 'Telepon', 'Phone', 'col_4']) || '081234567890';
        const id = getColVal(row, ['ID', 'id', 'member_id', 'Nomor ID', 'col_0']) || `sheet-member-${idx + 1}`;
        const registeredAt = getColVal(row, ['Tanggal Daftar', 'Created At', 'Timestamp', 'Waktu Pendaftaran', 'col_12']) || new Date().toISOString();
        let parsedSkills: any[] = [];
        let parsedCertifications: any[] = [];
        try { parsedSkills = JSON.parse(getColVal(row, ['Keahlian JSON']) || '[]'); } catch {}
        try { parsedCertifications = JSON.parse(getColVal(row, ['Sertifikasi JSON']) || '[]'); } catch {}
        return {
          id, userId: getColVal(row, ['User ID']) || `user-${id}`, nationalMemberNumber: kta || undefined, fullName,
          nikMasked: getColVal(row, ['NIK Tersamar']) || '3201**********01', avatarUrl: photo,
          gender: (getColVal(row, ['Jenis Kelamin', 'Gender']) || 'LAKI_LAKI').toUpperCase().startsWith('P') ? 'PEREMPUAN' : 'LAKI_LAKI',
          birthPlace: getColVal(row, ['Tempat Lahir']) || 'Indonesia', birthDate: getColVal(row, ['Tanggal Lahir']) || '2000-01-01',
          email, phone, address: getColVal(row, ['Alamat']) || `${districtName || regencyName}, ${regencyName}, ${provinceName}`,
          provinceId, provinceName, regencyId, regencyName, districtId, districtName,
          currentPosition: currentPosition || `Anggota ${krida}`,
          krida, joinYear: Number(getColVal(row, ['Tahun Bergabung'])) || new Date().getFullYear(),
          educationLevel: getColVal(row, ['Pendidikan']) || 'SMA/SMK', occupation: getColVal(row, ['Pekerjaan']) || 'Anggota Pramuka',
          bio: getColVal(row, ['Bio']) || `Anggota resmi Saka Pariwisata ${provinceName || 'Indonesia'}.`,
          status: status === 'ACTIVE' || status === 'PENDING' || status === 'SUSPENDED' ? status : 'ACTIVE', registeredAt,
          verificationToken: `VERIFY-SP-${kta ? kta.replace(/\./g, '') : id}`, isOperator: false,
          operatorRole: isNational ? 'SUPER_ADMIN' : undefined, operatorJurisdictionName: isNational ? 'Kwartir Nasional' : undefined,
          skills: parsedSkills, certifications: parsedCertifications, locationHistory: []
        };
      });

      // Deduplicate and merge members
      const existing = [...db.members];
      importedMembers.forEach(im => {
        const idx = existing.findIndex(e =>
          e.id === im.id ||
          (e.nationalMemberNumber && im.nationalMemberNumber && e.nationalMemberNumber === im.nationalMemberNumber) ||
          (e.email && im.email && e.email.toLowerCase() === im.email.toLowerCase())
        );
        if (idx !== -1) {
          existing[idx] = { ...existing[idx], ...im };
        } else {
          existing.push(im);
        }
      });
      db.members = existing;
    }

    // 2. Sync Paket_Wisata
    const tourRows = await fetchSheetGViz('Paket_Wisata');
    if (tourRows && tourRows.length > 0) {
      db.tours = tourRows.map((row, idx) => {
        const id = getColVal(row, ['ID', 'id', 'col_0']) || `tour-sheet-${idx + 1}`;
        const title = getColVal(row, ['Nama Paket', 'title', 'col_1']) || `Paket Wisata ${idx + 1}`;
        const category = getColVal(row, ['Kategori', 'category', 'col_2']) || 'Ekowisata';
        const price = parseFloat(getColVal(row, ['Harga', 'price', 'col_3'])) || 450000;
        const duration = parseInt(getColVal(row, ['Durasi (Hari)', 'duration', 'col_4']), 10) || 2;
        const location = getColVal(row, ['Lokasi', 'location', 'col_5']) || '';
        const prov = getColVal(row, ['Provinsi', 'province', 'col_6']) || 'Jawa Barat';
        const reg = getColVal(row, ['Kabupaten/Kota', 'regency', 'col_7']) || 'Kabupaten Bandung';
        const organizer = getColVal(row, ['Penyelenggara', 'organizer', 'col_8']) || 'Saka Pariwisata';
        const phone = getColVal(row, ['Kontak WA', 'phone', 'col_9']) || '081223344556';
        const banner = cleanDriveUrl(getColVal(row, ['Foto Banner', 'col_10'])) || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80';

        return {
          id,
          title,
          slug: id,
          category,
          pricePerPerson: price,
          durationDays: duration,
          locationAddress: location,
          provinceId: '32',
          provinceName: prov,
          regencyId: '32.04',
          regencyName: reg,
          districtName: 'Sentra Saka',
          ownerType: 'MEMBER',
          ownerId: 'mem-jabar-01',
          ownerName: organizer,
          contactPhone: phone,
          contactEmail: 'info@sakapariwisata.id',
          coverImage: banner,
          galleryImages: [banner],
          description: `Paket wisata edukasi dan petualangan ${title}. Dipandu oleh kader Pramuka Saka Pariwisata tersertifikasi.`,
          facilities: ['Pemandu Wisata Saka Pariwisata BNSP', 'Tiket Masuk Destinasi', 'Dokumentasi', 'Asuransi'],
          minCapacity: 2,
          maxCapacity: 30,
          guideProvided: true,
          itinerary: [{ day: 1, title: 'Eksplorasi Destinasi', description: 'Kunjungan dan pendampingan pemandu Saka Pariwisata' }],
          status: 'APPROVED_PUBLISHED',
          submittedAt: new Date().toISOString(),
          viewsCount: 20,
          featured: true
        };
      });
    }

    // 3. Sync Kuliner_Cinderamata
    const culinaryRows = await fetchSheetGViz('Kuliner_Cinderamata');
    if (culinaryRows && culinaryRows.length > 0) {
      db.culinaryItems = culinaryRows.map((row, idx) => {
        const id = getColVal(row, ['ID', 'id', 'col_0']) || `prod-sheet-${idx + 1}`;
        const name = getColVal(row, ['Nama Produk', 'name', 'col_1']) || `Produk Saka ${idx + 1}`;
        const kind = (getColVal(row, ['Jenis', 'kind', 'col_2']) || 'KULINER').toUpperCase() === 'CINDERAMATA' ? 'CINDERAMATA' : 'KULINER';
        const krida = getColVal(row, ['Kategori', 'krida', 'col_3']) || 'Krida Kuliner & Cinderamata';
        const price = parseFloat(getColVal(row, ['Harga', 'price', 'col_4'])) || 50000;
        const author = getColVal(row, ['Produsen/Pengrajin', 'author', 'col_5']) || 'Kader Saka Pariwisata';
        const phone = getColVal(row, ['Kontak WA', 'phone', 'col_6']) || '081223344556';
        const prov = getColVal(row, ['Provinsi', 'province', 'col_7']) || 'Jawa Barat';
        const reg = getColVal(row, ['Kabupaten/Kota', 'regency', 'col_8']) || 'Kabupaten Bandung';
        const img = cleanDriveUrl(getColVal(row, ['Foto Produk', 'col_9'])) || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80';
        const catLabel = getColVal(row, ['Sertifikasi Halal', 'col_10']) || 'Produk UMKM Saka Pariwisata';

        return {
          id,
          name,
          kind,
          krida,
          kridaCategory: kind === 'KULINER' ? 'Kuliner & Minuman Daerah' : 'Kriya & Cinderamata Khas',
          categoryLabel: catLabel,
          description: `Produk karya kader Saka Pariwisata: ${name}. Terjamin mutu dan cita rasa lokal.`,
          priceEstimate: price,
          priceUnit: 'per kemasan / pcs',
          imageUrl: img,
          provinceId: '32',
          provinceName: prov,
          regencyId: '32.04',
          regencyName: reg,
          districtId: '32.04.01',
          districtName: 'Sentra Saka',
          authorMemberId: 'mem-jabar-01',
          authorName: author,
          contactPhone: phone,
          tags: ['UMKM', 'Saka Pariwisata', 'Lokal'],
          status: 'APPROVED',
          createdAt: new Date().toISOString(),
          likesCount: 20,
          featured: true
        };
      });
    }

    // 4. Sync Agenda_Kegiatan
    const actRows = await fetchSheetGViz('Agenda_Kegiatan');
    if (actRows && actRows.length > 0) {
      db.activities = actRows.map((row, idx) => {
        const id = getColVal(row, ['ID', 'id', 'col_0']) || `act-sheet-${idx + 1}`;
        const title = getColVal(row, ['Nama Agenda', 'Judul Kegiatan', 'Nama Kegiatan', 'title', 'col_1']) || `Kegiatan Saka ${idx + 1}`;
        const category = getColVal(row, ['Kategori', 'category', 'col_2']) || 'Pelatihan';
        const scale = (getColVal(row, ['Skala Tingkat', 'Tingkat', 'Level', 'col_3']) || 'NASIONAL').toUpperCase();
        const organizer = getColVal(row, ['Penyelenggara', 'col_4']) || 'Pimpinan Saka Pariwisata';
        const location = getColVal(row, ['Lokasi', 'Tempat', 'col_5']) || 'Bumi Perkemahan';
        const prov = getColVal(row, ['Provinsi', 'province', 'col_6']) || 'Jawa Barat';
        const startD = getColVal(row, ['Tanggal Mulai', 'startDate', 'col_7']) || '2026-09-18';
        const endD = getColVal(row, ['Tanggal Selesai', 'endDate', 'col_8']) || '2026-09-22';
        const feeType = (getColVal(row, ['Jenis Biaya', 'Biaya', 'col_9']) || 'GRATIS').toUpperCase();
        const fee = parseFloat(getColVal(row, ['Nominal Biaya', 'col_10'])) || 0;
        const phone = getColVal(row, ['Kontak Narahubung', 'Kontak WA', 'phone', 'col_11']) || '081299881122';

        return {
          id,
          title,
          slug: id,
          description: `Kegiatan resmi Saka Pariwisata: ${title}. Terbuka untuk seluruh anggota Gerakan Pramuka dan masyarakat.`,
          bannerUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=80',
          coverImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=80',
          category,
          organizerLevel: scale.includes('INTER') ? 'INTERNASIONAL' : scale.includes('PROV') ? 'PROVINSI' : scale.includes('KAB') ? 'KABUPATEN' : 'NASIONAL',
          organizerName: organizer,
          locationName: location,
          locationAddress: `${location}, ${prov}`,
          provinceName: prov,
          regencyName: 'Pusat Kegiatan',
          startDate: startD.includes('Date(') ? '2026-09-18' : startD,
          endDate: endD.includes('Date(') ? '2026-09-22' : endD,
          timeString: '08:00 - 17:00 WIB',
          capacity: 250,
          registeredCount: 0,
          isPublic: true,
          status: 'OPEN_REGISTRATION',
          requirements: ['Anggota Aktif Gerakan Pramuka / Saka Pariwisata'],
          contactPhone: phone,
          feeType: feeType.includes('SUBSIDI') ? 'SUBSIDI' : feeType.includes('BERBAYAR') ? 'BERBAYAR' : 'GRATIS',
          feeAmount: fee,
          uploadedByName: 'Pimpinan Saka Pariwisata',
          uploadedByRole: 'SUPER_ADMIN'
        };
      });
    }

    db.config.lastSyncedAt = new Date().toISOString();
    db.config.status = 'CONNECTED';
    saveDatabase();
    console.log(`[Sync] Full sync complete: ${db.members.length} members, ${db.tours.length} tours, ${db.culinaryItems.length} culinary, ${db.activities.length} activities.`);
    return { success: true, message: 'Sinkronisasi berhasil' };
  } catch (e: any) {
    console.error('[Sync] Error syncing from spreadsheet:', e);
    return { success: false, message: e.message };
  }
}

// Background spreadsheet sync. In Vercel serverless, avoid a permanent
// interval and avoid doing a large outbound sync during cold-start import.
if (!IS_VERCEL) {
  syncFromGoogleSpreadsheet().catch(err => console.warn('[Sync] Initial sync notice:', err));
  setInterval(() => {
    syncFromGoogleSpreadsheet().catch(() => {});
  }, 25000);
}

// Proxy mutation to Google Apps Script Web App
async function forwardToGoogleAppsScript(payload: any, requestedScriptUrl?: unknown): Promise<any> {
  // Prioritas MUTLAK: URL yang dikirim aplikasi dari Dashboard.
  // Environment/default hanya dipertahankan sebagai kompatibilitas server lama,
  // tetapi tidak digunakan jika URL manual belum diberikan.
  const manualUrl = normalizeManualAppsScriptUrl(requestedScriptUrl);
  const configuredUrl = normalizeManualAppsScriptUrl(db.config.scriptUrl);
  const envUrl = normalizeManualAppsScriptUrl(process.env.GOOGLE_APPS_SCRIPT_URL);
  const scriptUrl = manualUrl || configuredUrl || envUrl || DEFAULT_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    throw new Error('Google Apps Script Web App URL belum dikonfigurasi. Isi URL /exec melalui Dashboard > Pengaturan API.');
  }

  const gasPayload = { ...payload };
  delete gasPayload.scriptUrl;

  const res = await fetch(scriptUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gasPayload)
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!res.ok) {
    throw new Error(`Google Apps Script HTTP ${res.status}${data?.message ? `: ${data.message}` : ''}`);
  }
  if (data?.status === 'error' || data?.success === false) {
    throw new Error(data.message || 'Google Apps Script menolak permintaan.');
  }

  console.log(`[GAS Forward] ${payload.action} berhasil.`, data || 'OK');
  return data || { status: 'success' };
}

// ==========================================
// API ROUTES
// ==========================================

// Health check
// Upload image proxy: browser -> application server -> Google Apps Script -> Google Drive.
// The browser must not call Apps Script directly because the JSON POST would
// require cross-origin handling. This route also keeps the GAS URL server-side.
app.post('/api/upload-image', async (req, res) => {
  try {
    const { base64, filename, category, scriptUrl } = req.body || {};
    const value = String(base64 || '').trim();

    if (!/^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(value)) {
      return res.status(400).json({
        success: false,
        status: 'error',
        message: 'Data gambar tidak valid.'
      });
    }

    // Match the Apps Script limit and avoid oversized requests reaching GAS.
    if (value.length > 12 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        status: 'error',
        message: 'Data gambar terlalu besar.'
      });
    }

    const result = await forwardToGoogleAppsScript({
      action: 'UPLOAD_IMAGE',
      base64: value,
      filename: String(filename || `image_${Date.now()}.jpg`).trim(),
      category: String(category || 'MEMBER_AVATAR').trim().toUpperCase(),
      scriptUrl
    }, scriptUrl);

    if (!result || result.success === false || !result.url) {
      return res.status(502).json({
        success: false,
        status: 'error',
        message: result?.message || 'Google Apps Script tidak mengembalikan URL foto.'
      });
    }

    return res.json({
      success: true,
      status: 'success',
      action: 'UPLOAD_IMAGE',
      fileId: result.fileId || null,
      url: result.url,
      directUrl: result.directUrl || result.url,
      viewUrl: result.viewUrl || null,
      category: result.category || category || 'MEMBER_AVATAR',
      filename: result.filename || filename || null,
      message: result.message || 'Foto berhasil disimpan ke Google Drive'
    });
  } catch (error: any) {
    console.error('[Upload Image] Error:', error);
    const message = error?.message || 'Upload foto gagal.';
    const statusMatch = message.match(/HTTP (\d{3})/i);
    const upstreamStatus = statusMatch ? Number(statusMatch[1]) : 502;
    return res.status(upstreamStatus >= 400 && upstreamStatus <= 599 ? upstreamStatus : 502).json({
      success: false,
      status: 'error',
      message
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ------------------------------------------
// AUTHENTICATION ROUTES
// ------------------------------------------

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { username, password, scriptUrl } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Nama pengguna dan kata sandi wajib diisi.' });
  }

  const cleanUser = String(username).trim().toLowerCase();
  const rawPass = String(password);

  // 1. Coba cache/server DB terlebih dahulu.
  let matchedUser: any = db.users.find(u =>
    (u.username && String(u.username).toLowerCase() === cleanUser) ||
    (u.email && String(u.email).toLowerCase() === cleanUser)
  );

  // 2. Sumber autentikasi utama adalah Sheet Users.
  // Ini membuat login tetap bekerja setelah logout/cold start Vercel,
  // karena akun tidak bergantung pada LocalStorage atau memory server.
  if (!matchedUser) {
    try {
      const gasResult = await forwardToGoogleAppsScript({
        action: 'AUTH_GET_USER',
        identifier: cleanUser
      }, scriptUrl);

      if (gasResult?.found && gasResult?.user) {
        matchedUser = gasResult.user;
        // Cache hanya setelah akun berhasil ditemukan di Spreadsheet.
        const existingIndex = db.users.findIndex(u =>
          String(u.id || '') === String(matchedUser.id || '')
        );
        if (existingIndex >= 0) db.users[existingIndex] = matchedUser;
        else db.users.push(matchedUser);
        saveDatabase();
      }
    } catch (gasError) {
      console.warn('[Auth] Gagal membaca Users dari Google Spreadsheet:', gasError);
    }
  }

  // Kompatibilitas data lama yang menyimpan kredensial pada member cache.
  // Tetap hanya menerima passwordHash, bukan password plaintext.
  if (!matchedUser) {
    const member = db.members.find(m =>
      (m.email && String(m.email).toLowerCase() === cleanUser) ||
      (m.nationalMemberNumber && String(m.nationalMemberNumber).toLowerCase() === cleanUser)
    );
    if (member && member.passwordHash) {
      matchedUser = {
        id: member.userId || `USER-${String(member.id || '').replace(/^SPW-/, '')}`,
        username: member.email.split('@')[0],
        email: member.email,
        name: member.fullName,
        role: member.isOperator ? (member.operatorRole || 'ADMIN_REGENCY') : 'MEMBER',
        jurisdictionName: member.provinceId === '00' ? 'Kwartir Nasional' : (member.districtName ? `${member.districtName}, ${member.regencyName || ''}`.replace(/,\s*$/, '') : (member.regencyName || member.provinceName || 'Indonesia')),
        jurisdictionId: member.provinceId === '00' ? '00' : member.regencyId,
        avatarUrl: member.avatarUrl,
        memberId: member.id,
        passwordHash: member.passwordHash
      };
    }
  }

  if (!matchedUser || !matchedUser.passwordHash || !verifyPassword(rawPass, String(matchedUser.passwordHash))) {
    console.warn(`[Auth] Failed login attempt for user: ${cleanUser}`);
    return res.status(401).json({ success: false, message: 'Kombinasi nama pengguna atau kata sandi tidak valid.' });
  }

  const token = createSession(matchedUser);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: matchedUser.id,
    userName: matchedUser.name,
    userRole: matchedUser.role,
    action: 'LOGIN',
    targetType: 'AUTH',
    targetId: matchedUser.id,
    description: `Login berhasil sebagai ${matchedUser.role} (${matchedUser.jurisdictionName || 'Nasional'})`,
    timestamp: new Date().toISOString()
  });
  if (db.auditLogs.length > 500) db.auditLogs.pop();
  saveDatabase();

  const sanitizedUser = {
    id: matchedUser.id,
    username: matchedUser.username,
    name: matchedUser.name,
    email: matchedUser.email,
    role: matchedUser.role,
    jurisdictionName: matchedUser.jurisdictionName,
    jurisdictionId: matchedUser.jurisdictionId,
    avatarUrl: matchedUser.avatarUrl,
    memberId: matchedUser.memberId
  };

  res.json({ success: true, token, user: sanitizedUser });
});

// GET /api/auth/me - Verify current session token
app.get('/api/auth/me', (req, res) => {
  const session = getSessionUser(req);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Sesi tidak valid atau telah kedaluwarsa.' });
  }
  res.json({
    success: true,
    user: {
      id: session.userId,
      username: session.username,
      name: session.name,
      role: session.role,
      jurisdictionName: session.jurisdictionName,
      jurisdictionId: session.jurisdictionId,
      avatarUrl: session.avatarUrl,
      memberId: session.memberId
    }
  });
});

// POST /api/auth/logout - Invalidate session
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]?.trim();
    // Sessions are stateless. Clearing the bearer token on the client is the
    // logout action; persistent revocation would require a shared session store.
  }
  res.json({ success: true, message: 'Berhasil keluar.' });
});

// POST /api/auth/change-password
app.post('/api/auth/change-password', (req, res) => {
  const session = getSessionUser(req);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Harap masuk terlebih dahulu.' });
  }
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 6 karakter.' });
  }

  const user = db.users.find(u => u.id === session.userId);
  if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
    return res.status(400).json({ success: false, message: 'Kata sandi saat ini tidak sesuai.' });
  }

  user.passwordHash = hashPassword(newPassword);
  saveDatabase();

  res.json({ success: true, message: 'Kata sandi berhasil diperbarui.' });
});

// POST /api/auth/register - Public new member registration
app.post('/api/auth/register', async (req, res) => {
  const requestId = `REG-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  try {
    const { memberData, password, photoData, photoUrl, photoFileName, scriptUrl } = req.body || {};
    const registrationScriptUrl = normalizeManualAppsScriptUrl(scriptUrl);

    console.log(`[Register][${requestId}] START`, {
      hasMemberData: Boolean(memberData),
      hasPassword: typeof password === 'string' && password.length > 0,
      hasPhotoData: typeof photoData === 'string' && photoData.startsWith('data:image/'),
      hasPhotoUrl: Boolean(photoUrl),
      scriptConfigured: Boolean(registrationScriptUrl)
    });

    if (!memberData || !memberData.fullName) {
      return res.status(400).json({ success: false, requestId, message: 'Data anggota wajib dilengkapi.' });
    }

    const rawPassword = typeof password === 'string' ? password : '';
    if (rawPassword.length < 6) {
      return res.status(400).json({ success: false, requestId, message: 'Kata sandi minimal 6 karakter.' });
    }

    const email = String(memberData.email || '').trim().toLowerCase();
    const requestedUsername = String(memberData.username || '').trim().toLowerCase();
    const username = requestedUsername || (email ? email.split('@')[0] : '');

    if (!email) {
      return res.status(400).json({ success: false, requestId, message: 'Email wajib diisi untuk membuat akun.' });
    }
    if (!username) {
      return res.status(400).json({ success: false, requestId, message: 'Nama pengguna tidak dapat ditentukan dari data pendaftaran.' });
    }

    if (!registrationScriptUrl) {
      return res.status(400).json({
        success: false,
        requestId,
        message: 'Google Apps Script Web App URL belum dikonfigurasi. Isi URL /exec melalui Dashboard > Pengaturan API sebelum pendaftaran.'
      });
    }

    const hasPhotoData = typeof photoData === 'string' && /^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(photoData.trim());
    const hasPhotoUrl = typeof photoUrl === 'string' && /^https?:\/\//i.test(photoUrl.trim());
    if (!hasPhotoData && !hasPhotoUrl) {
      return res.status(400).json({
        success: false,
        requestId,
        message: 'Pas foto wajib dipilih atau diberikan melalui URL gambar.'
      });
    }

    // Jangan melakukan pre-upload. Foto dan data akun dikirim sekali ke GAS
    // melalui REGISTER_MEMBER agar browser hanya menunggu satu transaksi.
    const duplicateUser = db.users.find(u =>
      (u.username && String(u.username).toLowerCase() === username) ||
      (u.email && String(u.email).toLowerCase() === email)
    );
    if (duplicateUser) {
      return res.status(409).json({
        success: false,
        requestId,
        message: 'Username atau email sudah terdaftar. Silakan gunakan akun yang sudah ada.'
      });
    }

    const duplicateMember = db.members.find(m =>
      (m.email && String(m.email).toLowerCase() === email) ||
      (memberData.nationalMemberNumber && m.nationalMemberNumber &&
        String(m.nationalMemberNumber).toLowerCase() === String(memberData.nationalMemberNumber).toLowerCase())
    );
    if (duplicateMember) {
      return res.status(409).json({ success: false, requestId, message: 'Email atau Nomor KTA sudah terdaftar.' });
    }

    const generatedMemberNumber = String(Date.now()).slice(-6).padStart(6, '0');
    const suppliedMemberId = String(memberData.id || '').trim();
    const memberId = suppliedMemberId.startsWith('SPW-') ? suppliedMemberId : `SPW-${generatedMemberNumber}`;
    const userId = String(memberData.userId || `USER-${Date.now().toString().slice(-10)}`);
    const registeredAt = new Date().toISOString();
    const passHash = hashPassword(rawPassword);

    // Jangan pernah menyimpan Base64 di memberData.avatarUrl. Foto perangkat
    // sekarang sudah di-upload ke Drive sebelum request registrasi.
    const safeMemberData = {
      ...memberData,
      avatarUrl: hasPhotoUrl ? String(photoUrl).trim() : ''
    };

    const newMember = {
      ...safeMemberData,
      id: memberId,
      userId,
      email,
      status: 'PENDING',
      registeredAt,
      passwordHash: passHash,
      avatarUrl: hasPhotoUrl ? String(photoUrl).trim() : ''
    };

    const newUser = {
      id: userId,
      username,
      email,
      passwordHash: passHash,
      name: newMember.fullName,
      role: 'MEMBER',
      jurisdictionName: newMember.provinceId === '00'
        ? 'Kwartir Nasional'
        : (newMember.districtName
          ? `${newMember.districtName}, ${newMember.regencyName || ''}`.replace(/,\s*$/, '')
          : (newMember.regencyName || newMember.provinceName || 'Indonesia')),
      jurisdictionId: newMember.provinceId === '00' ? '00' : (newMember.regencyId || ''),
      avatarUrl: newMember.avatarUrl,
      memberId,
      createdAt: registeredAt,
      status: 'PENDING'
    };

    console.log(`[Register][${requestId}] Sending REGISTER_MEMBER to GAS`, {
      memberId,
      userId,
      hasPhotoData,
      hasPhotoUrl
    });

    const gasResult = await forwardToGoogleAppsScript({
      action: 'REGISTER_MEMBER',
      requestId,
      memberId,
      userId,
      passwordHash: passHash,
      photoData: hasPhotoData ? photoData.trim() : '',
      photoUrl: hasPhotoUrl ? String(photoUrl).trim() : '',
      photoFileName: String(photoFileName || `KTA_${memberId}.jpg`).trim(),
      member: newMember,
      user: newUser
    }, registrationScriptUrl);

    if (!gasResult || gasResult.success !== true || !gasResult.memberId || !gasResult.userId) {
      throw new Error('Google Apps Script tidak mengembalikan konfirmasi pendaftaran yang lengkap.');
    }

    if (String(gasResult.memberId) !== memberId || String(gasResult.userId) !== userId) {
      throw new Error('Konfirmasi ID anggota dari Google Apps Script tidak sesuai dengan permintaan pendaftaran.');
    }

    // GAS adalah sumber kebenaran untuk transaksi. Gunakan objek yang
    // dikembalikan GAS bila tersedia agar URL Drive dan timestamp konsisten.
    const savedMember = gasResult.member && typeof gasResult.member === 'object'
      ? { ...newMember, ...gasResult.member }
      : newMember;
    const savedUser = gasResult.user && typeof gasResult.user === 'object'
      ? { ...newUser, ...gasResult.user }
      : newUser;

    db.members = db.members.filter(m => m.id !== memberId && m.email !== email);
    db.members.unshift(savedMember);
    db.users = db.users.filter(u => u.id !== userId && String(u.email || '').toLowerCase() !== email);
    db.users.push(savedUser);

    db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      userId: 'public-register',
      userName: savedMember.fullName,
      userRole: 'PUBLIC',
      action: 'REGISTER',
      targetType: 'MEMBER',
      targetId: memberId,
      description: `Pendaftaran mandiri calon anggota baru: ${savedMember.fullName}`,
      timestamp: registeredAt
    });
    if (db.auditLogs.length > 500) db.auditLogs.pop();
    saveDatabase();

    const token = createSession(savedUser);
    const sanitizedUser = {
      id: savedUser.id,
      username: savedUser.username,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      jurisdictionName: savedUser.jurisdictionName,
      jurisdictionId: savedUser.jurisdictionId,
      avatarUrl: savedUser.avatarUrl,
      memberId: savedUser.memberId,
      status: savedUser.status || 'PENDING'
    };

    console.log(`[Register][${requestId}] SUCCESS`, {
      memberId,
      userId,
      driveFileId: gasResult.drive?.fileId || null,
      memberRow: gasResult.memberRow || null,
      userRow: gasResult.userRow || null
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      requestId,
      message: 'Pendaftaran keanggotaan berhasil diajukan dan sedang menunggu verifikasi.',
      memberId,
      userId,
      member: savedMember,
      user: sanitizedUser,
      drive: gasResult.drive || null,
      memberRow: gasResult.memberRow || null,
      userRow: gasResult.userRow || null,
      token
    });
  } catch (error: any) {
    console.error(`[Register][${requestId}] FAILED`, error);
    const message = error?.message || 'Pendaftaran gagal diproses.';
    return res.status(502).json({
      success: false,
      status: 'error',
      requestId,
      message: `Pendaftaran gagal diproses: ${message}`
    });
  }
});

// ------------------------------------------
// DATA & CONFIGURATION ROUTES (ROLE-ENFORCED)
// ------------------------------------------

// Config GET & POST
app.get('/api/config', (req, res) => {
  const session = getSessionUser(req);
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin) {
    // Only return safe public operational status
    return res.json({
      config: {
        // Web App URL bukan credential rahasia; browser pengguna membutuhkannya
        // agar dapat melakukan sinkronisasi langsung ke Google Apps Script.
        scriptUrl: db.config.scriptUrl || '',
        spreadsheetId: db.config.spreadsheetId || DEFAULT_SPREADSHEET_ID,
        spreadsheetUrl: db.config.spreadsheetUrl || DEFAULT_SPREADSHEET_URL,
        status: db.config.status || 'CONNECTED',
        autoSync: db.config.autoSync,
        autoRefreshIntervalSeconds: db.config.autoRefreshIntervalSeconds || 6,
        lastSyncedAt: db.config.lastSyncedAt
      },
      lastUpdated: db.lastUpdated,
      version: db.version
    });
  }

  // Full config for Super Admin
  res.json({
    config: db.config,
    lastUpdated: db.lastUpdated,
    version: db.version
  });
});

app.post('/api/config', (req, res) => {
  const session = getSessionUser(req);
  if (session?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Wewenang Super Admin diperlukan untuk memperbarui konfigurasi pusat.' });
  }

  const updates = req.body || {};
  db.config = {
    ...db.config,
    ...updates
  };
  saveDatabase();
  console.log('[Config] Updated shared configuration by Super Admin:', session.name);
  res.json({ success: true, config: db.config });
});


// =========================================================
// KTA DESIGN SETTINGS — CENTRAL SOURCE OF TRUTH
// =========================================================
// GET is intentionally available to authenticated and public/member browsers:
// KTA layout is presentation configuration, not private member data.
// The actual source of truth remains the Google Spreadsheet via Apps Script.
app.get('/api/kta-settings', async (req, res) => {
  try {
    const scriptUrl = normalizeManualAppsScriptUrl(db.config.scriptUrl);
    if (!scriptUrl) {
      return res.status(503).json({
        success: false,
        message: 'Google Apps Script Web App URL belum dikonfigurasi melalui Dashboard > Pengaturan API.'
      });
    }

    const url = scriptUrl.includes('?')
      ? `${scriptUrl}&action=GET_KTA_SETTINGS&_t=${Date.now()}`
      : `${scriptUrl}?action=GET_KTA_SETTINGS&_t=${Date.now()}`;

    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.status === 'error' || data?.success === false) {
      throw new Error(data?.message || `Gagal membaca pengaturan KTA (HTTP ${response.status}).`);
    }

    return res.json({
      success: true,
      status: 'success',
      action: 'GET_KTA_SETTINGS',
      settings: data.settings || null,
      updatedAt: data.updatedAt || null,
      updatedBy: data.updatedBy || null
    });
  } catch (error: any) {
    console.error('[KTA Settings] GET error:', error);
    return res.status(502).json({
      success: false,
      status: 'error',
      message: error?.message || 'Gagal membaca pengaturan KTA pusat.'
    });
  }
});

// Only Super Admin may publish a new KTA layout.
app.put('/api/kta-settings', async (req, res) => {
  const session = getSessionUser(req);
  if (session?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Wewenang Super Admin diperlukan.' });
  }

  try {
    const settings = req.body?.settings;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Pengaturan KTA tidak valid.' });
    }

    const scriptUrl = normalizeManualAppsScriptUrl(req.body?.scriptUrl || db.config.scriptUrl);
    if (!scriptUrl) {
      return res.status(400).json({
        success: false,
        message: 'Google Apps Script Web App URL belum dikonfigurasi melalui Dashboard > Pengaturan API.'
      });
    }

    const result = await forwardToGoogleAppsScript({
      action: 'UPSERT_KTA_SETTINGS',
      settings,
      updatedBy: session.name || session.username || 'Super Admin'
    }, scriptUrl);

    return res.json({
      success: true,
      status: 'success',
      action: 'UPSERT_KTA_SETTINGS',
      settings: result?.settings || settings,
      updatedAt: result?.updatedAt || new Date().toISOString(),
      updatedBy: result?.updatedBy || session.name || session.username || 'Super Admin',
      message: result?.message || 'Pengaturan KTA tersimpan di Google Spreadsheet.'
    });
  } catch (error: any) {
    console.error('[KTA Settings] PUT error:', error);
    const message = error?.message || 'Gagal menyimpan pengaturan KTA pusat.';
    const statusMatch = message.match(/HTTP (\d{3})/i);
    const upstreamStatus = statusMatch ? Number(statusMatch[1]) : 502;
    return res.status(upstreamStatus >= 400 && upstreamStatus <= 599 ? upstreamStatus : 502).json({
      success: false,
      status: 'error',
      message
    });
  }
});

// Central Data GET with strict Privacy and Role Enforcement
app.get('/api/data', async (req, res) => {
  const session = getSessionUser(req);
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';
  const isOperator = session && ['ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(session.role);

  // Pada Vercel, instance serverless baru tidak menjalankan interval sync.
  // Hydrate database dari Spreadsheet saat cache server masih kosong agar
  // Dashboard Super Admin tidak hanya bergantung pada data file lokal.
  if (db.members.length === 0) {
    const syncResult = await syncFromGoogleSpreadsheet();
    if (!syncResult.success) {
      console.warn('[Data] Initial Spreadsheet hydration gagal:', syncResult.message);
    }
  }

  // Mask member data for public viewers to prevent data leaks
  const sanitizedMembers = db.members.map(m => {
    if (isSuperAdmin || isOperator) {
      return m; // Full data for authorized administration
    }
    // Public directory data only:
    return {
      id: m.id,
      nationalMemberNumber: m.nationalMemberNumber,
      fullName: m.fullName,
      nikMasked: m.nikMasked || '3201********0001',
      avatarUrl: m.avatarUrl,
      gender: m.gender,
      provinceName: m.provinceName,
      regencyName: m.regencyName,
      districtName: m.districtName,
      provinceId: m.provinceId,
      regencyId: m.regencyId,
      districtId: m.districtId,
      krida: m.krida,
      currentPosition: m.currentPosition,
      joinYear: m.joinYear,
      status: m.status,
      registeredAt: m.registeredAt,
      verificationToken: m.verificationToken,
      skills: m.skills,
      certifications: m.certifications
    };
  });

  // Only return users list if Super Admin
  const sanitizedUsers = isSuperAdmin 
    ? db.users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name,
        role: u.role,
        jurisdictionName: u.jurisdictionName,
        jurisdictionId: u.jurisdictionId,
        avatarUrl: u.avatarUrl
      }))
    : [];

  // Only return audit logs if Super Admin or Operator
  const sanitizedAuditLogs = isSuperAdmin 
    ? db.auditLogs.slice(0, 100) 
    : isOperator 
      ? db.auditLogs.filter(l => l.userId === session.userId).slice(0, 50) 
      : [];

  // Sanitize spreadsheet config for public
  const sanitizedConfig = isSuperAdmin
    ? db.config
    : {
        status: db.config.status || 'CONNECTED',
        autoSync: db.config.autoSync,
        autoRefreshIntervalSeconds: db.config.autoRefreshIntervalSeconds || 6,
        lastSyncedAt: db.config.lastSyncedAt
      };

  res.json({
    members: sanitizedMembers,
    tours: db.tours.filter(t => isSuperAdmin || isOperator || t.status === 'APPROVED_PUBLISHED'),
    culinaryItems: db.culinaryItems.filter(c => isSuperAdmin || isOperator || c.status === 'APPROVED'),
    activities: db.activities,
    kridaModules: db.kridaModules || [],
    users: sanitizedUsers,
    auditLogs: sanitizedAuditLogs,
    config: sanitizedConfig,
    lastUpdated: db.lastUpdated,
    version: db.version
  });
});

// Manual Sync Trigger
app.post('/api/sync-spreadsheet', async (req, res) => {
  const session = getSessionUser(req);
  if (!session || (session.role !== 'SUPER_ADMIN' && !['ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(session.role))) {
    return res.status(403).json({ success: false, message: 'Autentikasi administrator diperlukan untuk sinkronisasi database.' });
  }

  const result = await syncFromGoogleSpreadsheet();
  res.json({
    ...result,
    membersCount: db.members.length,
    toursCount: db.tours.length,
    activitiesCount: db.activities.length,
    culinaryCount: db.culinaryItems.length,
    lastUpdated: db.lastUpdated
  });
});

// Central Mutation API - Receives any create/update/delete with Server Role Enforcement
app.post('/api/mutate', async (req, res) => {
  const session = getSessionUser(req);
  const isSuperAdmin = session?.role === 'SUPER_ADMIN';
  const isOperator = session && ['ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(session.role);

  const { type, action, payload, scriptUrl } = req.body || {};
  const requestScriptUrl = normalizeManualAppsScriptUrl(scriptUrl);
  if (!type || !action) {
    return res.status(400).json({ success: false, message: 'Parameter type atau action tidak lengkap.' });
  }

  // Role Validation for sensitive actions
  if (type === 'MEMBER') {
    if (action === 'DELETE') {
      if (!isSuperAdmin) {
        return res.status(403).json({ success: false, message: 'Hanya Super Admin Nasional yang berhak menghapus data anggota.' });
      }
    } else if (action === 'UPDATE' || action === 'STATUS' || action === 'BATCH_DELETE_DUMMY') {
      if (!isSuperAdmin && !isOperator) {
        return res.status(403).json({ success: false, message: 'Wewenang administrator diperlukan untuk memperbarui data anggota.' });
      }
    }
  }

  if (!requestScriptUrl) {
    return res.status(400).json({
      success: false,
      status: 'error',
      message: 'Google Apps Script Web App URL belum dikonfigurasi. Isi URL /exec melalui Dashboard > Pengaturan API.'
    });
  }

  const forwardMutation = (gasPayload: any) =>
    forwardToGoogleAppsScript(gasPayload, requestScriptUrl);

  // Validasi kewenangan wilayah dilakukan di server, bukan hanya di browser.
  const canEditMemberInJurisdiction = (target: any, incoming: any): boolean => {
    if (isSuperAdmin) return true;
    if (!isOperator || !session) return false;
    const current = target || {};
    const next = incoming || {};
    if (session.role === 'ADMIN_PROVINCE') {
      const allowed = String(session.jurisdictionId || '').trim();
      return !!allowed && String(current.provinceId || '').trim() === allowed && String(next.provinceId || current.provinceId || '').trim() === allowed;
    }
    if (session.role === 'ADMIN_REGENCY') {
      const allowed = String(session.jurisdictionId || '').trim();
      return !!allowed && String(current.regencyId || '').trim() === allowed && String(next.regencyId || current.regencyId || '').trim() === allowed;
    }
    if (session.role === 'ADMIN_BRANCH') {
      const allowed = String(session.jurisdictionId || '').trim();
      return !!allowed && String(current.districtId || '').trim() === allowed && String(next.districtId || current.districtId || '').trim() === allowed;
    }
    return false;
  };

  const spreadsheetMemberPayload = (member: any) => ({
    action: 'UPSERT_MEMBER',
    sheet: 'Anggota',
    memberId: member.id,
    rowData: [
      member.id || '',
      member.nationalMemberNumber || '',
      member.fullName || '',
      member.email || '',
      member.phone || '',
      member.provinceName || '',
      member.regencyName || '',
      member.districtName || '',
      member.currentPosition || '',
      member.krida || '',
      member.status || 'PENDING',
      member.avatarUrl || '',
      member.registeredAt || new Date().toISOString(),
      `https://sakapariwisata-nasional.vercel.app/verify?verifyId=${encodeURIComponent(member.nationalMemberNumber || member.id)}`
    ]
  });

  // Audit Logging
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    userId: session?.userId || 'guest-user',
    userName: session?.name || 'Pengunjung / Publik',
    userRole: session?.role || 'PUBLIC',
    action: `${type}_${action}`,
    targetType: type,
    targetId: payload?.id || payload?.memberId || 'unknown',
    description: `Operasi mutasi ${action} pada ${type} (${payload?.fullName || payload?.title || payload?.name || payload?.id || ''})`,
    timestamp: new Date().toISOString()
  });
  if (db.auditLogs.length > 500) db.auditLogs.pop();

  console.log(`[Mutation] [${session?.role || 'PUBLIC'}] Received ${type}:${action} from client.`);

  try {
    if (type === 'MEMBER') {
      const member = payload;
      if (action === 'CREATE' || action === 'REGISTER') {
        const idx = db.members.findIndex(m => m.id === member.id || (member.nationalMemberNumber && m.nationalMemberNumber === member.nationalMemberNumber));
        if (idx !== -1) {
          db.members[idx] = { ...db.members[idx], ...member };
        } else {
          db.members.unshift(member);
        }
        await forwardMutation(spreadsheetMemberPayload(member));
      } else if (action === 'UPDATE' || action === 'STATUS' || action === 'PHOTO_UPDATE') {
        let idx = db.members.findIndex(m => m.id === member.id);
        let existingMember = idx !== -1 ? db.members[idx] : null;

        // Serverless instances (terutama Vercel) memiliki cache database in-memory
        // yang dapat masih kosong ketika browser sudah memiliki data hasil sinkronisasi
        // Spreadsheet. Jangan langsung mengembalikan 404. Lakukan lazy-sync dari
        // Spreadsheet, lalu cari ulang berdasarkan ID, Nomor KTA/NTA, atau email.
        if (!existingMember && member?.id) {
          const syncResult = await syncFromGoogleSpreadsheet();
          if (syncResult.success) {
            idx = db.members.findIndex(m =>
              m.id === member.id ||
              (!!member.nationalMemberNumber && String(m.nationalMemberNumber || '') === String(member.nationalMemberNumber)) ||
              (!!member.email && String(m.email || '').toLowerCase() === String(member.email).toLowerCase())
            );
            existingMember = idx !== -1 ? db.members[idx] : null;
          }
        }

        if (!existingMember) {
          return res.status(404).json({
            success: false,
            code: 'MEMBER_NOT_FOUND_AFTER_SYNC',
            message: 'Anggota tidak ditemukan pada database server maupun hasil sinkronisasi Google Spreadsheet. Pastikan ID, Nomor KTA/NTA, atau email anggota sesuai dengan data pada sheet Anggota.'
          });
        }
        if (!canEditMemberInJurisdiction(existingMember, member)) {
          return res.status(403).json({ success: false, message: 'Anda tidak memiliki kewenangan wilayah untuk mengubah data anggota ini atau memindahkannya ke wilayah lain.' });
        }

        // Operator wilayah tidak boleh mengubah Nomor KTA/NTA yang sudah diterbitkan.
        if (!isSuperAdmin && String(member.nationalMemberNumber || '') !== String(existingMember.nationalMemberNumber || '')) {
          return res.status(403).json({ success: false, message: 'Nomor KTA/NTA hanya dapat dikoreksi oleh Super Admin.' });
        }

        const updatedMember = { ...existingMember, ...member, id: existingMember.id, userId: member.userId || existingMember.userId };
        db.members[idx] = updatedMember;

        await forwardMutation(spreadsheetMemberPayload(updatedMember));
        if ((action === 'STATUS' || action === 'UPDATE') && member.id && member.status) {
          await forwardMutation({
            action: 'UPDATE_AUTH_STATUS',
            memberId: member.id,
            status: member.status
          });
        }
      } else if (action === 'DELETE') {
        const memberId = payload.id || payload.memberId;
        db.members = db.members.filter(m => m.id !== memberId);
        forwardMutation({
          action: 'DELETE_ROW',
          sheet: 'Anggota',
          id: memberId,
          secondaryId: payload.kta || payload.nationalMemberNumber
        });
      }
    } else if (type === 'TOUR') {
      const tour = payload;
      if (action === 'CREATE' || action === 'UPDATE') {
        const idx = db.tours.findIndex(t => t.id === tour.id);
        if (idx !== -1) {
          db.tours[idx] = { ...db.tours[idx], ...tour };
        } else {
          db.tours.unshift(tour);
        }
        forwardMutation({
          action: 'UPSERT_ROW',
          sheet: 'Paket_Wisata',
          id: tour.id,
          rowData: [
            tour.id,
            tour.title,
            tour.category,
            tour.pricePerPerson,
            tour.durationDays,
            tour.locationAddress || '',
            tour.provinceName,
            tour.regencyName,
            tour.ownerName,
            tour.contactPhone,
            tour.coverImage,
            new Date().toISOString()
          ]
        });
      } else if (action === 'DELETE') {
        db.tours = db.tours.filter(t => t.id !== payload.id);
        forwardMutation({
          action: 'DELETE_ROW',
          sheet: 'Paket_Wisata',
          id: payload.id
        });
      }
    } else if (type === 'CULINARY') {
      const item = payload;
      if (action === 'CREATE' || action === 'UPDATE') {
        const idx = db.culinaryItems.findIndex(c => c.id === item.id);
        if (idx !== -1) {
          db.culinaryItems[idx] = { ...db.culinaryItems[idx], ...item };
        } else {
          db.culinaryItems.unshift(item);
        }
        forwardMutation({
          action: 'UPSERT_ROW',
          sheet: 'Kuliner_Cinderamata',
          id: item.id,
          rowData: [
            item.id,
            item.name,
            item.kind,
            item.krida,
            item.priceEstimate,
            item.authorName,
            item.contactPhone,
            item.provinceName,
            item.regencyName,
            item.imageUrl,
            item.categoryLabel || 'Produk UMKM Saka Pariwisata',
            new Date().toISOString()
          ]
        });
      } else if (action === 'DELETE') {
        db.culinaryItems = db.culinaryItems.filter(c => c.id !== payload.id);
        forwardMutation({
          action: 'DELETE_ROW',
          sheet: 'Kuliner_Cinderamata',
          id: payload.id
        });
      }
    } else if (type === 'ACTIVITY') {
      const act = payload;
      if (action === 'CREATE' || action === 'UPDATE') {
        const idx = db.activities.findIndex(a => a.id === act.id);
        if (idx !== -1) {
          db.activities[idx] = { ...db.activities[idx], ...act };
        } else {
          db.activities.unshift(act);
        }
        forwardMutation({
          action: 'UPSERT_ROW',
          sheet: 'Agenda_Kegiatan',
          id: act.id,
          rowData: [
            act.id,
            act.title,
            act.category,
            act.organizerLevel,
            act.organizerName,
            act.locationName,
            act.provinceName,
            act.startDate,
            act.endDate,
            act.feeType,
            act.feeAmount,
            act.contactPhone,
            act.uploadedByName || 'Pimpinan Saka Pariwisata',
            new Date().toISOString()
          ]
        });
      } else if (action === 'DELETE') {
        db.activities = db.activities.filter(a => a.id !== payload.id);
        forwardMutation({
          action: 'DELETE_ROW',
          sheet: 'Agenda_Kegiatan',
          id: payload.id
        });
      }
    } else if (type === 'KRIDA_MODULE') {
      const moduleItem = payload;
      if (!Array.isArray(db.kridaModules)) db.kridaModules = [];
      if (action === 'UPDATE' || action === 'CREATE') {
        const idx = db.kridaModules.findIndex(m => m.id === moduleItem.id);
        if (idx !== -1) {
          db.kridaModules[idx] = { ...db.kridaModules[idx], ...moduleItem };
        } else {
          db.kridaModules.push(moduleItem);
        }
      } else if (action === 'BATCH_UPDATE') {
        if (Array.isArray(payload)) {
          db.kridaModules = payload;
        }
      }
    }

    saveDatabase();
    res.json({
      success: true,
      lastUpdated: db.lastUpdated,
      version: db.version
    });
  } catch (err: any) {
    console.error('[Mutation Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bulk sync endpoint from client to server (Super Admin only)
app.post('/api/sync-bulk', (req, res) => {
  const session = getSessionUser(req);
  if (session?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Hanya Super Admin yang berhak melakukan sinkronisasi massal.' });
  }

  const { members, tours, culinaryItems, activities, config } = req.body || {};

  if (config) {
    db.config = { ...db.config, ...config };
  }

  if (Array.isArray(members) && members.length > 0) {
    const map = new Map<string, any>();
    db.members.forEach(m => map.set(m.id, m));
    members.forEach(m => map.set(m.id, { ...map.get(m.id), ...m }));
    db.members = Array.from(map.values());
  }

  if (Array.isArray(tours) && tours.length > 0) {
    const map = new Map<string, any>();
    db.tours.forEach(t => map.set(t.id, t));
    tours.forEach(t => map.set(t.id, { ...map.get(t.id), ...t }));
    db.tours = Array.from(map.values());
  }

  if (Array.isArray(culinaryItems) && culinaryItems.length > 0) {
    const map = new Map<string, any>();
    db.culinaryItems.forEach(c => map.set(c.id, c));
    culinaryItems.forEach(c => map.set(c.id, { ...map.get(c.id), ...c }));
    db.culinaryItems = Array.from(map.values());
  }

  if (Array.isArray(activities) && activities.length > 0) {
    const map = new Map<string, any>();
    db.activities.forEach(a => map.set(a.id, a));
    activities.forEach(a => map.set(a.id, { ...map.get(a.id), ...a }));
    db.activities = Array.from(map.values());
  }

  saveDatabase();
  res.json({ success: true, lastUpdated: db.lastUpdated, version: db.version });
});

// Final API error handler. This ensures unexpected route errors return JSON
// instead of terminating the serverless invocation.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]', err);
  if (res.headersSent) return next(err);
  res.status(500).json({
    success: false,
    message: err?.message || 'Terjadi kesalahan pada server.',
    error: IS_VERCEL ? 'SERVERLESS_API_ERROR' : 'API_ERROR'
  });
});

// Vercel serverless entrypoint: export the Express app directly.
export default app;
export { app };
