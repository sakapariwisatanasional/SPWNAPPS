export type UserRole = 
  | 'SUPER_ADMIN'      // Pengendali sistem tertinggi / Kwartir Nasional
  | 'ADMIN_NATIONAL'   // Admin operasional Kwartir Nasional
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
  id: string;          // Kode resmi e.g. '32.06.010'
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

export type KtaInterestType = KridaType | 'Majelis Pembimbing' | 'Pimpinan Saka' | 'Pamong Saka';

export type KwartirLevel = 'NASIONAL' | 'DAERAH' | 'CABANG' | 'RANTING';

export const getMemberKwartirLevel = (
  provinceId?: string,
  regencyId?: string,
  districtId?: string
): KwartirLevel => {
  if (String(provinceId || '') === '00') return 'NASIONAL';
  if (String(districtId || '').trim()) return 'RANTING';
  if (String(regencyId || '').trim()) return 'CABANG';
  return 'DAERAH';
};

export const getMemberKwartirName = (
  provinceId?: string,
  provinceName?: string,
  regencyId?: string,
  regencyName?: string,
  districtName?: string
): string => {
  const level = getMemberKwartirLevel(provinceId, regencyId, districtName);
  if (level === 'NASIONAL') return 'Kwartir Nasional';
  if (level === 'RANTING') return `Kwartir Ranting ${districtName || ''}`.trim();
  if (level === 'CABANG') return `Kwartir Cabang ${regencyName || ''}`.trim();
  return `Kwartir Daerah ${provinceName || ''}`.trim();
};

export const getMemberKwartirHierarchy = (
  provinceId?: string,
  provinceName?: string,
  regencyName?: string,
  districtName?: string
): string => {
  if (String(provinceId || '') === '00') return 'Kwartir Nasional';
  return [
    provinceName ? `Kwarda ${provinceName}` : '',
    regencyName ? `Kwarcab ${regencyName}` : '',
    districtName ? `Kwarran ${districtName}` : ''
  ].filter(Boolean).join(' • ');
};

export interface Member {
  id: string;                  // UUID
  userId: string;
  nationalMemberNumber?: string; // Format: PP.KK.KKK.NNNNNN
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
  branchName?: string;
  gugusDepan?: string;
  kwartirLevel?: KwartirLevel;
  kwartirName?: string;
  kwartirHierarchy?: string;
  ktaInterest?: KtaInterestType;
  
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

export interface TourPackage {
  id: string;
  title: string;
  category: TourCategory;
  description: string;
  pricePerPerson: number;
  durationDays: number;
  locationAddress: string;
  provinceId: string;
  provinceName: string;
  regencyId: string;
  regencyName: string;
  ownerType: TourOwnerType;
  ownerId: string;
  ownerName: string;
  contactPhone: string;
  coverImage?: string;
  galleryImages?: string[];
  itinerary?: string[];
  facilities?: string[];
  terms?: string;
  status: TourStatus;
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type CulinaryKind = 'KULINER' | 'CINDERAMATA' | 'KRIYA';

export interface CulinarySouvenirItem {
  id: string;
  name: string;
  kind: CulinaryKind;
  krida: KridaType;
  description: string;
  priceEstimate: number;
  authorName: string;
  contactPhone: string;
  provinceId: string;
  provinceName: string;
  regencyId: string;
  regencyName: string;
  imageUrl?: string;
  categoryLabel?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  type: 'PELATIHAN' | 'KEGIATAN' | 'RAPAT' | 'KOMPETISI' | 'PAMERAN' | 'LAINNYA';
  startDate: string;
  endDate?: string;
  location: string;
  provinceId?: string;
  provinceName?: string;
  regencyId?: string;
  regencyName?: string;
  organizerName: string;
  contactPhone?: string;
  coverImage?: string;
  registrationUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED';
  featured?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface OfficialMerchandiseProduct {
  id: string;
  name: string;
  shortName?: string;
  category: OfficialMerchandiseCategory;
  description: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  accentClass?: string;
  iconName?: string;
  sizes?: string[];
  tags: string[];
  comingSoon: boolean;
  purchaseEnabled?: boolean;
  launchAt?: string;
  featured?: boolean;
  active: boolean;
}

export type OfficialMerchandiseCategory =
  | 'APPAREL'
  | 'ACCESSORIES'
  | 'IDENTITY'
  | 'OUTDOOR';

export interface CurrentUser {
  id: string;
  username?: string;
  email: string;
  name: string;
  role: UserRole;
  jurisdictionName?: string;
  jurisdictionId?: string;
  avatarUrl?: string;
  memberId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface VerificationRequest {
  id: string;
  memberId: string;
  memberName: string;
  memberNumber?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  totalTours: number;
  publishedTours: number;
  totalCulinary: number;
  publishedCulinary: number;
  totalActivities: number;
  upcomingActivities: number;
}

export interface SearchResult {
  type: 'MEMBER' | 'TOUR' | 'CULINARY' | 'ACTIVITY';
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface SpreadsheetRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface SpreadsheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  scriptUrl: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR' | 'CHECKING';
  lastSyncedAt?: string;
  lastError?: string;
  autoSync?: boolean;
  autoRefreshIntervalSeconds?: number;
  syncOnStartup?: boolean;
  syncOnFocus?: boolean;
  syncOnOnline?: boolean;
}

export interface SpreadsheetSyncState {
  isSyncing: boolean;
  isSaving: boolean;
  lastSyncedTime?: string;
  lastSavedTime?: string;
  lastSavedAction?: string;
  error?: string | null;
  pollingIntervalSeconds?: number;
}

export interface AppSettings {
  appName: string;
  appVersion: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  allowPublicDirectory: boolean;
  allowTourSubmission: boolean;
  allowCulinarySubmission: boolean;
  allowActivitySubmission: boolean;
}

export interface AuthSession {
  user: CurrentUser;
  expiresAt: string;
  token?: string;
}

export interface MemberFilter {
  search?: string;
  status?: MemberStatus;
  provinceId?: string;
  regencyId?: string;
  districtId?: string;
  krida?: KridaType;
}

export interface TourFilter {
  search?: string;
  category?: TourCategory;
  provinceId?: string;
  regencyId?: string;
  status?: TourStatus;
}

export interface ActivityFilter {
  search?: string;
  type?: ActivityEvent['type'];
  provinceId?: string;
  regencyId?: string;
  status?: ActivityEvent['status'];
}

export interface OfficialMerchandiseFilter {
  category?: OfficialMerchandiseCategory;
  comingSoon?: boolean;
  featured?: boolean;
  active?: boolean;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

export interface MemberStatsByRegion {
  provinceId: string;
  provinceName: string;
  memberCount: number;
  activeCount: number;
  pendingCount: number;
}

export interface ActivityRegistration {
  id: string;
  activityId: string;
  memberId?: string;
  name: string;
  phone: string;
  email?: string;
  registeredAt: string;
  status: 'REGISTERED' | 'CONFIRMED' | 'CANCELLED';
}

export interface TourBooking {
  id: string;
  tourId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  participantCount: number;
  travelDate?: string;
  notes?: string;
  createdAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export interface CulinaryOrder {
  id: string;
  itemId: string;
  customerName: string;
  customerPhone: string;
  quantity: number;
  notes?: string;
  createdAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
}

export interface OfficialMerchandiseOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  whatsapp: string;
  address: string;
  province: string;
  regency: string;
  district: string;
  note?: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    size?: string;
    quantity: number;
  }>;
  subtotal: number;
  shippingCost?: number;
  total?: number;
  status: 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt?: string;
}
