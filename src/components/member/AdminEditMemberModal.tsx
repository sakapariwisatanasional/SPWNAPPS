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
  id: string;
  userId: string;
  nationalMemberNumber?: string;
  fullName: string;
  nikMasked: string;
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
  currentPosition: string;
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
  verificationToken: string;

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
  | 'Pemanduan & Paket Wisata'
  | 'Fotografi & Media Wisata'
  | 'MICE, Kemah & Atraksi'
  | 'Kuliner & Minuman Daerah'
  | 'Kriya & Cinderamata Khas'
  | 'Jasa & Edukasi Wisata';

export type ProductModerationStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface CulinarySouvenirItem {
  id: string;
  name: string;
  kind: ProductKind;
  krida: KridaType;
  kridaCategory: KridaProductCategory;
  categoryLabel: string;
  description: string;
  storyOrigin?: string;
  priceEstimate: number;
  priceUnit?: string;
  imageUrl?: string;
  ownerMemberId: string;
  ownerMemberName: string;
  ownerKwartirName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  address?: string;
  tags: string[];
  
  // Alur Persetujuan Operator Wilayah
  status: ProductModerationStatus;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  approverRole?: UserRole;
  rejectionReason?: string;
  
  createdAt: string;
  likesCount: number;
  featured?: boolean;
}

export type OfficialMerchandiseCategory =
  | 'APPAREL'
  | 'ACCESSORIES'
  | 'IDENTITY'
  | 'OUTDOOR';

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
  launchAt?: string;
  featured?: boolean;
  active: boolean;
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
  | 'provinceName' | 'regencyName' | 'districtName' | 'kwartirName' | 'kwartirHierarchy'
  | 'krida' | 'phone' | 'email' | 'joinYear' | 'status';

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
  id: string;
  name: string;
  url: string;
  side: KtaCardSide;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity?: number;
  objectFit?: 'contain' | 'cover' | 'fill';
}

export interface KtaTextElement {
  id: string;
  text: string;
  side: KtaCardSide;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'bold' | 'black';
  color: string;
  align?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'lowercase';
}

export interface KtaCardSettings {
  preset?: KtaCardPreset;
  widthMm: number;
  heightMm: number;
  cornerRadiusMm: number;
  cardTheme: KtaCardTheme;
  bgImageUrl?: string;
  frontBackgroundUrl?: string;
  backBackgroundUrl?: string;
  customBackgroundColorFront?: string;
  customBackgroundColorBack?: string;
  bgOpacity?: number;
  frontLogoUrl?: string;
  backLogoUrl?: string;
  logos: KtaLogoElement[];
  dataFields: KtaDataFieldConfig[];
  textElements: KtaTextElement[];
  frontOrganizationTitle: string;
  frontOrganizationSubtitle: string;
  frontOrganizationTitleX?: number;
  frontOrganizationTitleY?: number;
  frontOrganizationTitleWidth?: number;
  frontOrganizationTitleFontSize?: number;
  frontOrganizationTitleFontWeight?: 'normal'|'medium'|'bold'|'black';
  frontOrganizationTitleColor?: string;
  frontOrganizationTitleAlign?: 'left'|'center'|'right';
  frontOrganizationSubtitleX?: number;
  frontOrganizationSubtitleY?: number;
  frontOrganizationSubtitleWidth?: number;
  frontOrganizationSubtitleFontSize?: number;
  frontOrganizationSubtitleFontWeight?: 'normal'|'medium'|'bold'|'black';
  frontOrganizationSubtitleColor?: string;
  frontOrganizationSubtitleAlign?: 'left'|'center'|'right';
  frontValidityText: string;
  watermarkOpacity: number;
  showKridaBadge: boolean;
  showPhoto: boolean;
  showQrCode: boolean;
  qrX?: number;
  qrY?: number;
  qrSize?: number;
  qrBorderWidth?: number;
  qrBorderColor?: string;
  qrBorderRadius?: number;
  qrPadding?: number;
  qrBackgroundColor?: string;
  backHeaderTitle: string;
  backHeaderSubtitle: string;
  terms: string[];
  issueLocationDate: string;
  barcodeType: KtaBarcodeType;
  barcodeCustomValue?: string;
  showBarcode?: boolean;
  issueLocationDateX?: number;
  issueLocationDateY?: number;
  barcodeX?: number;
  barcodeY?: number;
  barcodeWidth?: number;
  barcodeHeight?: number;
  barcodeShowText?: boolean;
  signerMemberId?: string;
  showSignerQrCode?: boolean;
  showSignerName?: boolean;
  showSignerTitle?: boolean;
  showSignerVerified?: boolean;
  signerVerifiedX?: number;
  signerVerifiedY?: number;
  signerVerifiedWidth?: number;
  signerVerifiedFontSize?: number;
  signerVerifiedColor?: string;
  signerQrX?: number;
  signerQrY?: number;
  signerQrSize?: number;
  signerQrPadding?: number;
  signerQrBackgroundColor?: string;
  signerQrBorderWidth?: number;
  signerQrBorderColor?: string;
  signerQrBorderRadius?: number;
  barcodeCaption?: string;
  showBarcodeFront?: boolean;
  barcodeFrontCustomValue?: string;
  barcodeFrontX?: number;
  barcodeFrontY?: number;
  barcodeFrontWidth?: number;
  barcodeFrontHeight?: number;
  barcodeFrontShowText?: boolean;
  barcodeFrontCaption?: string;
  barcodeFrontCaptionX?: number;
  barcodeFrontCaptionY?: number;
  barcodeFrontCaptionWidth?: number;
  barcodeFrontCaptionFontSize?: number;
  barcodeFrontCaptionFontWeight?: 'normal'|'medium'|'bold'|'black';
  barcodeFrontCaptionColor?: string;
  barcodeFrontCaptionAlign?: 'left'|'center'|'right';
  barcodeFrontCaptionLineHeight?: number;
  barcodeFrontCaptionLetterSpacing?: number;
  photoX?: number;
  photoY?: number;
  photoWidth?: number;
  photoHeight?: number;
  photoRadius?: number;
  photoBorderWidth?: number;
  photoBorderColor?: string;
  photoObjectFit?: 'contain'|'cover'|'fill';
  frontValidityTextX?: number;
  frontValidityTextY?: number;
  frontValidityTextWidth?: number;
  frontValidityTextFontSize?: number;
  frontValidityTextFontWeight?: 'normal'|'medium'|'bold'|'black';
  frontValidityTextColor?: string;
  frontValidityTextAlign?: 'left'|'center'|'right';
  frontValidityTextLineHeight?: number;
  frontValidityTextLetterSpacing?: number;
  frontOrganizationTitleLineHeight?: number;
  frontOrganizationTitleLetterSpacing?: number;
  frontOrganizationSubtitleLineHeight?: number;
  frontOrganizationSubtitleLetterSpacing?: number;
  backHeaderTitleX?: number;
  backHeaderTitleY?: number;
  backHeaderTitleWidth?: number;
  backHeaderTitleFontSize?: number;
  backHeaderTitleFontWeight?: 'normal'|'medium'|'bold'|'black';
  backHeaderTitleColor?: string;
  backHeaderTitleAlign?: 'left'|'center'|'right';
  backHeaderTitleLineHeight?: number;
  backHeaderTitleLetterSpacing?: number;
  backHeaderSubtitleX?: number;
  backHeaderSubtitleY?: number;
  backHeaderSubtitleWidth?: number;
  backHeaderSubtitleFontSize?: number;
  backHeaderSubtitleFontWeight?: 'normal'|'medium'|'bold'|'black';
  backHeaderSubtitleColor?: string;
  backHeaderSubtitleAlign?: 'left'|'center'|'right';
  backHeaderSubtitleLineHeight?: number;
  backHeaderSubtitleLetterSpacing?: number;
  termsX?: number;
  termsY?: number;
  termsWidth?: number;
  termsFontSize?: number;
  termsFontWeight?: 'normal'|'medium'|'bold'|'black';
  termsColor?: string;
  termsAlign?: 'left'|'center'|'right';
  termsLineHeight?: number;
  termsLetterSpacing?: number;
  signerX?: number;
  signerY?: number;
  signerWidth?: number;
  signerColor?: string;
  signerAlign?: 'left'|'center'|'right';
  signerLineHeight?: number;
  signerLetterSpacing?: number;
  signerNameXOffset?: number;
  signerNameYOffset?: number;
  issueLocationDateFontSize?: number;
  signerNameFontSize?: number;
  signerTitleFontSize?: number;
  signerSubtitleFontSize?: number;
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
  code: string;
  title: string;
  badge: string;
  levelSKK: string;
  description: string;
  content: string;
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
    knowledge: number;
    skill: number;
    attitude: number;
    product: number;
    passingGrade: number;
  };
  specialSafetyNotes?: string;
}
