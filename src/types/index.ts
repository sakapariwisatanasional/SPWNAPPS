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

export interface Branch {
  id: string;          // UUID
  districtId: string;
  regencyId: string;
  provinceId: string;
  code: string;        // e.g. '01'
  name: string;        // e.g. 'Ranting Ciawi'
  address: string;
  contactPerson: string;
  phone: string;
}

export interface MemberLocationHistory {
  id: string;
  memberId: string;
  prevBranchName: string;
  newBranchName: string;
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
  branchId: string;
  branchName: string;
  gugusDepan: string;
  
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
  gudepOrPangkalan?: string;
  
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
  password?: string;
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

export interface KtaCardSettings {
  // Background & Theme Customization
  cardTheme: KtaCardTheme;
  bgImageUrl?: string;
  bgOpacity?: number; // 0.0 - 1.0 (default 0.10 / 10%)

  // Front Side Customization
  frontOrganizationTitle: string;
  frontOrganizationSubtitle: string;
  frontValidityText: string;
  watermarkOpacity: number;
  showKridaBadge: boolean;

  // Back Side Customization
  backHeaderTitle: string;
  backHeaderSubtitle: string;
  terms: string[];
  issueLocationDate: string;
  barcodeType: KtaBarcodeType;
  barcodeCustomValue?: string;
  signerName: string;
  signerTitle: string;
  signerSubtitle?: string;
  showStamp: boolean;
  lastUpdated?: string;
  updatedBy?: string;
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

