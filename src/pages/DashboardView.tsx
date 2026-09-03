import React, { useState } from 'react';
import { 
  Users, 
  Compass, 
  Clock, 
  MapPin, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight, 
  UserPlus, 
  ExternalLink,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileText,
  Sliders,
  Image as ImageIcon,
  Palette,
  FileSpreadsheet,
  FolderOpen,
  Database,
  CloudUpload,
  Layers
} from 'lucide-react';
import { Member, TourPackage, CurrentUser, Province, CulinarySouvenirItem } from '../types';
import { DigitalMemberCard } from '../components/member/DigitalMemberCard';
import { NationalMapVisual } from '../components/dashboard/NationalMapVisual';
import { CulinarySouvenirGallerySection } from '../components/dashboard/CulinarySouvenirGallerySection';
import { TourPackageCarouselSection } from '../components/dashboard/TourPackageCarouselSection';
import { IntegratedTourismShowcaseGallery } from '../components/dashboard/IntegratedTourismShowcaseGallery';
import { DashboardWidget } from '../components/dashboard/DashboardWidget';
import { SakaLogo } from '../components/common/SakaLogo';
import { storage } from '../services/storage';

interface DashboardViewProps {
  currentUser: CurrentUser;
  members: Member[];
  tours: TourPackage[];
  provinces: Province[];
  culinaryItems?: CulinarySouvenirItem[];
  onSelectTab: (tab: string) => void;
  onOpenRegisterModal: () => void;
  onVerifyMember: (member: Member) => void;
  onApproveMemberQuick: (memberId: string) => void;
  onViewTourDetail: (tour: TourPackage) => void;
  onOpenEditCardModal?: () => void;
  onOpenEditPhotoModal?: (member: Member) => void;
  onOpenEditMemberModal?: (member: Member) => void;
  onOpenPrintPdfModal?: (member: Member) => void;
  onOpenCulinaryFormModal?: (item?: CulinarySouvenirItem) => void;
  onSelectCulinaryDetail?: (item: CulinarySouvenirItem) => void;
  onOpenSpreadsheetModal?: () => void;
  onOpenDriveModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  members,
  tours,
  provinces,
  culinaryItems,
  onSelectTab,
  onOpenRegisterModal,
  onVerifyMember,
  onApproveMemberQuick,
  onViewTourDetail,
  onOpenEditCardModal,
  onOpenEditPhotoModal,
  onOpenEditMemberModal,
  onOpenPrintPdfModal,
  onOpenCulinaryFormModal,
  onSelectCulinaryDetail,
  onOpenSpreadsheetModal,
  onOpenDriveModal
}) => {
  const isPublic = currentUser.role === 'PUBLIC';
  const isMember = currentUser.role === 'MEMBER';
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isOperator = currentUser.role === 'ADMIN_PROVINCE' || currentUser.role === 'ADMIN_REGENCY' || currentUser.role === 'ADMIN_BRANCH';
  const isAdmin = isSuperAdmin || isOperator;

  const ktaSettings = storage.getKtaSettings();
  const currentOpacityPct = Math.round((ktaSettings.bgOpacity ?? 0.10) * 100);

  // Live Culinary & Souvenir items
  const liveCulinaryItems = culinaryItems || storage.getCulinarySouvenirs();

  // Scoped Data for Operators
  const scopedMembers = isSuperAdmin 
    ? members 
    : currentUser.role === 'ADMIN_PROVINCE' 
      ? members.filter(m => m.provinceId === currentUser.jurisdictionId)
      : currentUser.role === 'ADMIN_REGENCY'
        ? members.filter(m => m.regencyId === currentUser.jurisdictionId)
        : currentUser.role === 'ADMIN_BRANCH'
          ? members.filter(m => m.branchId === currentUser.jurisdictionId)
          : [];

  const scopedTours = isSuperAdmin
    ? tours
    : currentUser.role === 'ADMIN_PROVINCE'
      ? tours.filter(t => t.provinceId === currentUser.jurisdictionId)
      : currentUser.role === 'ADMIN_REGENCY'
        ? tours.filter(t => t.regencyId === currentUser.jurisdictionId)
        : tours;

  // Stats Calculation based on Scope
  const activeMembersCount = isSuperAdmin ? members.filter(m => m.status === 'ACTIVE').length : scopedMembers.filter(m => m.status === 'ACTIVE').length;
  const pendingMembers = isSuperAdmin ? members.filter(m => m.status === 'PENDING') : scopedMembers.filter(m => m.status === 'PENDING');
  const publishedTours = isSuperAdmin ? tours.filter(t => t.status === 'APPROVED_PUBLISHED') : scopedTours.filter(t => t.status === 'APPROVED_PUBLISHED');
  
  // State for Public Dashboard Tour Filters
  const [selectedTourCategory, setSelectedTourCategory] = useState<string>('ALL');
  const [tourSearch, setTourSearch] = useState<string>('');

  // Extract categories from published tours
  const tourCategories = Array.from(new Set(publishedTours.map(t => t.category).filter(Boolean)));

  const filteredPublicTours = publishedTours.filter(t => {
    const matchCat = selectedTourCategory === 'ALL' || t.category === selectedTourCategory;
    const q = tourSearch.toLowerCase().trim();
    const matchQuery = !q || 
      t.title.toLowerCase().includes(q) ||
      t.locationName.toLowerCase().includes(q) ||
      t.provinceName.toLowerCase().includes(q) ||
      t.regencyName.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  // =========================================================================
  // 1. TAMPILAN DASHBOARD KHUSUS PERAN PUBLIK (WISATAWAN / PENGUNJUNG UMUM)
  // =========================================================================
  if (isPublic) {
    return (
      <div className="space-y-6 sm:space-y-8 pb-16">
        {/* 1. Welcome Banner Publik */}
        <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-10 text-white shadow-xl border border-purple-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-12 -bottom-10 opacity-10 pointer-events-none">
            <SakaLogo size={220} />
          </div>
          
          <div className="flex items-center gap-4 z-10 max-w-2xl">
            <SakaLogo size={60} id="public-dashboard-logo" className="hidden sm:inline-flex flex-shrink-0" />
            <div className="space-y-1.5 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-purple-500/20 border border-purple-400/40 rounded-full text-purple-200 text-[11px] sm:text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Portal Eksplorasi Saka Pariwisata Indonesia</span>
              </div>
              <h2 className="text-xl sm:text-4xl font-extrabold tracking-tight font-heading leading-tight text-white">
                Selamat Datang di Saka Pariwisata
              </h2>
              <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed">
                Jelajahi keindahan destinasi nusantara, desa wisata, dan ekowisata binaan kader Gerakan Pramuka Saka Pariwisata dari Sabang sampai Merauke.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 z-10 w-full md:w-auto">
            <button
              onClick={() => onSelectTab('tours')}
              className="flex-1 md:flex-none px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-extrabold rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Compass className="w-4 h-4 text-slate-900" />
              <span>Semua Paket Wisata</span>
            </button>

            <button
              onClick={() => onSelectTab('verify-portal')}
              className="flex-1 md:flex-none px-4 sm:px-5 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl sm:rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 backdrop-blur-xs border border-white/20 transition-all cursor-pointer min-h-[44px]"
            >
              <ShieldCheck className="w-4 h-4 text-purple-300" />
              <span>Verifikasi QR</span>
            </button>
          </div>
        </div>

        {/* 1. Galeri Terpadu Cerdas Saka Pariwisata */}
        <IntegratedTourismShowcaseGallery
          tours={tours}
          products={liveCulinaryItems}
          members={members}
          currentUser={currentUser}
          onViewTourDetail={onViewTourDetail}
          onSelectMember={onVerifyMember}
          onSelectTab={onSelectTab}
        />

        {/* 2. Galeri Paket Wisata (Carousel) */}
        <TourPackageCarouselSection
          tours={tours}
          currentUser={currentUser}
          onViewTourDetail={onViewTourDetail}
          onSelectTab={onSelectTab}
        />

        {/* 3. Galeri Kuliner & Cinderamata Khas Daerah */}
        <CulinarySouvenirGallerySection
          items={liveCulinaryItems}
          currentUser={currentUser}
          onOpenFormModal={onOpenCulinaryFormModal || (() => {})}
          onSelectItemDetail={onSelectCulinaryDetail || (() => {})}
        />

        {/* 4. Highlight Stats Publik */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Paket Wisata</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-lg sm:text-2xl font-extrabold font-heading text-slate-900">
              {publishedTours.length} Destinasi
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Wisata edukatif</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Kategori</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-lg sm:text-2xl font-extrabold font-heading text-slate-900">
              {tourCategories.length} Ragam
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Ekowisata & budaya</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Wilayah</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-lg sm:text-2xl font-extrabold font-heading text-slate-900">
              38 Provinsi
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Jejaring destinasi</p>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Pemandu</span>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-lg sm:text-2xl font-extrabold font-heading text-slate-900">
              Standar BNSP
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Ramah & profesional</p>
          </div>
        </div>

        {/* 5. Sapta Pesona */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white border border-emerald-700/50 shadow-xl space-y-3">
          <div className="max-w-2xl space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
              Komitmen Sapta Pesona
            </span>
            <h4 className="text-base sm:text-xl font-bold font-heading text-white">
              Pariwisata Berkelanjutan & Berbudaya
            </h4>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Seluruh paket wisata binaan Saka Pariwisata mengedepankan prinsip Sapta Pesona: Aman, Tertib, Bersih, Sejuk, Indah, Ramah Tamah, dan Kenangan bagi wisatawan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. TAMPILAN DASHBOARD KHUSUS PERAN ANGGOTA (MEMBER PERSONAL PORTFOLIO)
  // =========================================================================
  if (isMember) {
    const memberProfile = 
      members.find(m => m.id === currentUser.memberId) || 
      members.find(m => m.userId === currentUser.id) ||
      members.find(m => m.fullName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) ||
      members.find(m => m.status === 'ACTIVE') || 
      members[0];
    return (
      <div className="space-y-6 sm:space-y-8 pb-16">
        {/* Welcome Banner Anggota */}
        <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl border border-purple-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-12 -bottom-10 opacity-10 pointer-events-none">
            <SakaLogo size={200} />
          </div>

          <div className="flex items-center gap-4 z-10 max-w-2xl">
            <img 
              src={currentUser.avatarUrl || memberProfile?.avatarUrl} 
              alt={currentUser.name} 
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-purple-400/50 shadow-md flex-shrink-0"
            />
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/40 rounded-full text-emerald-300 text-[11px] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Anggota Aktif Saka Pariwisata</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-heading leading-tight">
                Halo, {currentUser.name}
              </h2>
              <p className="text-xs text-purple-100/80">
                Pangkalan: <span className="font-semibold text-white">{memberProfile?.gugusDepan || 'Kwarran Binaan'}</span> | Krida: <span className="font-semibold text-emerald-300">{memberProfile?.krida || 'Pemandu Wisata'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 z-10 w-full md:w-auto">
            <button
              onClick={() => onSelectTab('my-card')}
              className="flex-1 md:flex-none px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-400 hover:to-emerald-400 text-white font-bold rounded-xl sm:rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 transition-all cursor-pointer min-h-[44px]"
            >
              <FileText className="w-4 h-4" />
              <span>Buka KTA Digital & QR</span>
            </button>
          </div>
        </div>

        {/* Quick Nav Cards untuk Anggota */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div 
            onClick={() => onSelectTab('my-card')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Kartu Anggota (KTA)</h4>
            <p className="text-xs text-slate-500 mt-1">Lihat, unduh, dan cetak KTA standar CR80 & A4</p>
          </div>

          <div 
            onClick={() => onSelectTab('skills')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Uji Keahlian & SKK</h4>
            <p className="text-xs text-slate-500 mt-1">Direktori kompetensi & sertifikasi 4 Krida</p>
          </div>

          <div 
            onClick={() => onSelectTab('tours')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Paket Wisata</h4>
            <p className="text-xs text-slate-500 mt-1">Katalog perjalanan dan promosi rute wisata</p>
          </div>

          <div 
            onClick={() => onSelectTab('activities')}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Agenda Kegiatan</h4>
            <p className="text-xs text-slate-500 mt-1">Jadwal perkemahan, diklat, dan bakti wisata</p>
          </div>
        </div>

        {/* Member 3D KTA Card Preview Section */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                Kartu Tanda Anggota (KTA) Saya
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                Identitas Resmi Kader Saka Pariwisata
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('my-card')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Kelola KTA Lengkap
            </button>
          </div>

          {memberProfile && (
            <div className="max-w-md mx-auto">
              <DigitalMemberCard
                member={memberProfile}
                onVerifyClick={onVerifyMember}
                onEditPhoto={onOpenEditPhotoModal}
                onEditMemberProfile={onOpenEditMemberModal}
                onPrintPdf={onOpenPrintPdfModal}
                allowAdminEdit={false}
                showControls={true}
              />
            </div>
          )}
        </div>

        {/* Galeri Terpadu Rekomendasi */}
        <IntegratedTourismShowcaseGallery
          tours={tours}
          products={liveCulinaryItems}
          members={members}
          currentUser={currentUser}
          onViewTourDetail={onViewTourDetail}
          onSelectMember={onVerifyMember}
          onSelectTab={onSelectTab}
        />
      </div>
    );
  }

  // =========================================================================
  // 3. TAMPILAN DASHBOARD UNTUK ADMINISTRATOR / OPERATOR KWARTIR
  // =========================================================================
  const previewMember = 
    scopedMembers.find(m => m.id === currentUser.memberId) || 
    scopedMembers.find(m => m.userId === currentUser.id) || 
    scopedMembers.find(m => m.fullName.toLowerCase().trim() === currentUser.name.toLowerCase().trim()) ||
    scopedMembers.find(m => m.status === 'ACTIVE') || 
    members.find(m => m.status === 'ACTIVE') || 
    members[0];
  const recentRegistrations = scopedMembers.slice(0, 5);

  const getDashboardTitle = () => {
    if (isSuperAdmin) return 'Dashboard Super Admin - Kwartir Nasional';
    if (currentUser.role === 'ADMIN_PROVINCE') return `Dashboard Kwartir Daerah - ${currentUser.jurisdictionName}`;
    if (currentUser.role === 'ADMIN_REGENCY') return `Dashboard Kwartir Cabang - ${currentUser.jurisdictionName}`;
    return `Dashboard Kwartir Ranting - ${currentUser.jurisdictionName}`;
  };

  const getScopeBadge = () => {
    if (isSuperAdmin) return 'Cakupan Seluruh Indonesia (38 Provinsi)';
    if (currentUser.role === 'ADMIN_PROVINCE') return `Kewenangan Kwarda: ${currentUser.jurisdictionName}`;
    if (currentUser.role === 'ADMIN_REGENCY') return `Kewenangan Kwarcab: ${currentUser.jurisdictionName}`;
    return `Kewenangan Kwarran: ${currentUser.jurisdictionName}`;
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Welcome Banner with Role & Jurisdiction Context */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl border border-purple-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 relative overflow-hidden">
        {/* Background glow and watermark */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 -bottom-10 opacity-10 pointer-events-none">
          <SakaLogo size={200} />
        </div>
        
        <div className="flex items-center gap-4 z-10 max-w-2xl">
          <SakaLogo size={56} id="dashboard-banner-logo" className="hidden sm:inline-flex flex-shrink-0" />
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-purple-500/20 border border-purple-400/40 rounded-full text-purple-200 text-[11px] sm:text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>{getScopeBadge()}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight font-heading leading-tight">
              {getDashboardTitle()}
            </h2>
            <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed">
              {isSuperAdmin
                ? 'Pusat manajemen nasional terpadu untuk pendataan keanggotaan, konfigurasi template KTA se-Indonesia, dan verifikasi kwarda.'
                : `Panel administrasi kwarda/kwarcab untuk verifikasi pendaftaran calon anggota dan pengelolaan paket wisata di wilayah ${currentUser.jurisdictionName}.`
              }
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 z-10 w-full md:w-auto">
          {/* Akses Database Spreadsheet HANYA SUPER ADMIN KWARTIR NASIONAL */}
          {isSuperAdmin && onOpenSpreadsheetModal && (
            <button
              onClick={onOpenSpreadsheetModal}
              className="flex-1 md:flex-none px-3.5 sm:px-4 py-2.5 sm:py-3 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 font-semibold rounded-xl sm:rounded-2xl text-xs flex items-center justify-center gap-2 backdrop-blur-xs border border-emerald-500/50 transition-all cursor-pointer shadow-xs min-h-[44px]"
              title="Database Google Spreadsheet Kwartir Nasional (Super Admin)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>Database Spreadsheet</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-emerald-700 text-emerald-100 rounded font-mono font-bold">Kwarnas</span>
            </button>
          )}

          {/* Akses Media Google Drive HANYA SUPER ADMIN KWARTIR NASIONAL */}
          {isSuperAdmin && onOpenDriveModal && (
            <button
              onClick={onOpenDriveModal}
              className="flex-1 md:flex-none px-3.5 sm:px-4 py-2.5 sm:py-3 bg-purple-900/70 hover:bg-purple-800 text-purple-100 font-semibold rounded-xl sm:rounded-2xl text-xs flex items-center justify-center gap-2 backdrop-blur-xs border border-purple-500/40 transition-all cursor-pointer shadow-xs min-h-[44px]"
              title="Google Drive Cloud Media Repository (Super Admin)"
            >
              <FolderOpen className="w-4 h-4 text-purple-300" />
              <span>Media Google Drive</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-purple-800 text-purple-200 rounded font-mono font-bold">Cloud</span>
            </button>
          )}

          {/* Desain KTA HANYA BISA DIAKSES OLEH SUPER ADMIN KWARTIR NASIONAL */}
          {isSuperAdmin && onOpenEditCardModal && (
            <button
              onClick={onOpenEditCardModal}
              className="flex-1 md:flex-none px-3.5 sm:px-4 py-2.5 sm:py-3 bg-purple-900/60 hover:bg-purple-800 text-purple-100 font-semibold rounded-xl sm:rounded-2xl text-xs flex items-center justify-center gap-2 backdrop-blur-xs border border-purple-500/40 transition-all cursor-pointer shadow-xs min-h-[44px]"
              title="Atur Format & Opasitas Template KTA Nasional"
            >
              <Sliders className="w-4 h-4 text-purple-300" />
              <span>Desain KTA Kwarnas ({currentOpacityPct}%)</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('verify-portal')}
            className="flex-1 md:flex-none px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl sm:rounded-2xl text-xs flex items-center justify-center gap-2 backdrop-blur-xs border border-white/20 transition-all cursor-pointer min-h-[44px]"
          >
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            <span>Verifikasi QR</span>
          </button>
        </div>
      </div>

      {/* SUPER ADMIN EXCLUSIVE: PUSAT INTEGRASI CLOUD DATABASE SPREADSHEET & MEDIA DRIVE */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white border border-purple-800/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                    Pusat Data & Media Cloud Kwarnas
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    Akses Super Admin
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold font-heading text-white">
                  Integrasi Google Spreadsheet & Google Drive Repository
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Kelola sinkronisasi otomatis basis data keanggotaan nasional dan repositori media cloud Kwartir Nasional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Google Spreadsheet */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-emerald-500/30 hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-4 shadow-sm group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-700/50">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                        Database Google Spreadsheet
                      </h4>
                      <p className="text-[11px] text-emerald-400 font-mono">Live 2-Way Sync & Backup</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-900/60 border border-emerald-600/40 text-emerald-200 text-[10px] font-bold rounded-full">
                    Terhubung
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sinkronkan seluruh data anggota, KTA, paket wisata, dan log kwartir se-Indonesia secara real-time ke Google Spreadsheet resmi.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                {onOpenSpreadsheetModal && (
                  <button
                    onClick={onOpenSpreadsheetModal}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-950/40"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Kelola Database Spreadsheet</span>
                  </button>
                )}
              </div>
            </div>

            {/* Card 2: Google Drive Repository */}
            <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-purple-500/30 hover:border-purple-500/60 transition-all flex flex-col justify-between space-y-4 shadow-sm group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-700/50">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                        Media Google Drive Repository
                      </h4>
                      <p className="text-[11px] text-purple-400 font-mono">Cloud Asset & Direct Link</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-purple-900/60 border border-purple-600/40 text-purple-200 text-[10px] font-bold rounded-full">
                    Aset Cloud
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Akses repositori folder Google Drive untuk foto kader, aset KTA, logo Kwartir, dan materi 4 Krida dengan generator URL otomatis.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                {onOpenDriveModal && (
                  <button
                    onClick={onOpenDriveModal}
                    className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-950/40"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Buka Media Google Drive</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operator Jurisdiction Alert Notice if non-superadmin */}
      {isOperator && (
        <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-purple-900">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>
              <strong>Mode Operator Wilayah:</strong> Anda mengelola data untuk wilayah <strong>{currentUser.jurisdictionName}</strong>. Data di luar wilayah ini dibatasi sesuai hak akses.
            </span>
          </div>
          <button
            onClick={() => onSelectTab('members')}
            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs flex-shrink-0 cursor-pointer"
          >
            Kelola Anggota Wilayah
          </button>
        </div>
      )}

      {/* 1. Galeri Terpadu Cerdas Saka Pariwisata */}
      <IntegratedTourismShowcaseGallery
        tours={scopedTours}
        products={liveCulinaryItems}
        members={scopedMembers}
        currentUser={currentUser}
        onViewTourDetail={onViewTourDetail}
        onSelectMember={onVerifyMember}
        onSelectTab={onSelectTab}
      />

      {/* 2. Galeri Paket Wisata (Carousel) */}
      <TourPackageCarouselSection
        tours={scopedTours}
        currentUser={currentUser}
        onViewTourDetail={onViewTourDetail}
        onSelectTab={onSelectTab}
      />

      {/* 3. Galeri Kuliner & Cinderamata Khas Daerah */}
      <CulinarySouvenirGallerySection
        items={liveCulinaryItems}
        currentUser={currentUser}
        onOpenFormModal={onOpenCulinaryFormModal || (() => {})}
        onSelectItemDetail={onSelectCulinaryDetail || (() => {})}
      />

      {/* 4 Stat Cards - Scoped to Jurisdiction */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1 */}
        <div 
          onClick={() => onSelectTab('members')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isSuperAdmin ? 'Total Anggota Nasional' : `Anggota di ${currentUser.jurisdictionName}`}
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">
              {activeMembersCount.toLocaleString('id-ID')}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12% bln ini
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1">
            {isSuperAdmin ? 'Terdata aktif se-Indonesia' : `Terdata di ${currentUser.jurisdictionName}`}
          </p>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => onSelectTab('tours')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Paket Wisata</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">
              {publishedTours.length} Paket
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-teal-600">
              Potensi Daerah
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1">
            {isSuperAdmin ? 'Dipromosikan ke publik' : `Di wilayah ${currentUser.jurisdictionName}`}
          </p>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => onSelectTab('members')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Menunggu Verifikasi</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-extrabold font-heading text-amber-700">
              {pendingMembers.length} Calon
            </span>
            <span className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-800 px-1.5 sm:px-2 py-0.5 rounded-md font-bold w-fit">
              Review
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1">
            {isSuperAdmin ? 'Calon anggota se-Indonesia' : `Calon anggota di ${currentUser.jurisdictionName}`}
          </p>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => onSelectTab('territories')}
          className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Wilayah</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">
              {isSuperAdmin ? '38 Prov' : currentUser.jurisdictionName}
            </span>
            <span className="text-[10px] sm:text-[11px] font-bold text-indigo-600">
              {isSuperAdmin ? '514 Kab/Kota' : 'Kwartir'}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1">
            {isSuperAdmin ? 'Cakupan Nasional RI' : 'Wilayah Administrasi'}
          </p>
        </div>
      </div>

      {/* Visualisasi Pertumbuhan Anggota Menggunakan Recharts */}
      <DashboardWidget 
        members={scopedMembers}
        title={isSuperAdmin ? "Visualisasi Pertumbuhan Anggota Nasional" : `Statistik Anggota Wilayah ${currentUser.jurisdictionName}`}
        subtitle="Analisis dinamika registrasi, kader aktif terverifikasi, dan tren penambahan berkala"
      />

      {/* Main Grid: Left Table & Right Digital Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Recent Registrations Table (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 font-heading">
                Pendaftaran Anggota Terbaru {isOperator && `(${currentUser.jurisdictionName})`}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {isSuperAdmin ? 'Calon anggota terdata di seluruh pangkalan kwartir' : `Calon anggota di wilayah kewenangan ${currentUser.jurisdictionName}`}
              </p>
            </div>
            <button
              onClick={() => onSelectTab('members')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer p-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Desktop/Tablet Table View */}
          <div className="hidden sm:block">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Anggota</th>
                  <th className="pb-3">Wilayah</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 text-xs">
                      Belum ada pendaftaran anggota di wilayah ini.
                    </td>
                  </tr>
                ) : (
                  recentRegistrations.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 sm:py-3 pr-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={m.avatarUrl}
                            alt={m.fullName}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate max-w-[110px] sm:max-w-[160px]">{m.fullName}</p>
                            <p className="text-[9px] sm:text-[10px] font-mono text-emerald-700 font-medium truncate max-w-[110px] sm:max-w-[160px]">
                              {m.nationalMemberNumber || 'Menunggu No. KTA'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 sm:py-3 px-2">
                        <p className="text-slate-700 font-medium truncate max-w-[100px] sm:max-w-[130px]">{m.regencyName}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 truncate max-w-[100px] sm:max-w-[130px]">{m.branchName}</p>
                      </td>
                      <td className="py-2.5 sm:py-3 px-2">
                        {m.status === 'ACTIVE' ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            AKTIF
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 sm:py-3 pl-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {m.status === 'PENDING' && (
                            <button
                              onClick={() => onApproveMemberQuick(m.id)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold transition-colors min-h-[32px]"
                              title="Setujui dan terbitkan Nomor Anggota Nasional"
                            >
                              Setujui
                            </button>
                          )}
                          <button
                            onClick={() => onVerifyMember(m)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                            title="Cek Verifikasi"
                            aria-label="Cek Verifikasi Anggota"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Fluid Cards (Zero Horizontal Scroll!) */}
          <div className="sm:hidden divide-y divide-slate-100">
            {recentRegistrations.length === 0 ? (
              <p className="py-6 text-center text-slate-400 text-xs">
                Belum ada pendaftaran anggota di wilayah ini.
              </p>
            ) : (
              recentRegistrations.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={m.avatarUrl}
                      alt={m.fullName}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs truncate">{m.fullName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{m.regencyName}</p>
                      <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded-md font-semibold mt-0.5 ${
                        m.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {m.status === 'ACTIVE' ? 'Aktif' : 'Menunggu'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {m.status === 'PENDING' && (
                      <button
                        onClick={() => onApproveMemberQuick(m.id)}
                        className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                      >
                        Setujui
                      </button>
                    )}
                    <button
                      onClick={() => onVerifyMember(m)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                      title="Cek Verifikasi"
                      aria-label="Cek Verifikasi Anggota"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Interactive Digital KTA Card Preview (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-white border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                  Kartu Tanda Anggota (KTA)
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white font-heading">
                  Identitas Digital Saka
                </h3>
              </div>

              {isSuperAdmin && onOpenEditCardModal ? (
                <button
                  onClick={onOpenEditCardModal}
                  className="px-2.5 py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-400/40 text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Ubah Desain Latar Belakang & Opasitas KTA (Super Admin Kwarnas)"
                >
                  <Palette className="w-3.5 h-3.5 text-purple-300" />
                  <span>Desain KTA ({currentOpacityPct}%)</span>
                </button>
              ) : (
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-lg border border-emerald-400/30">
                  KTA Standar Kwarnas
                </span>
              )}
            </div>

            {/* Embedded 3D Member Card */}
            {previewMember && (
              <DigitalMemberCard
                member={previewMember}
                onVerifyClick={onVerifyMember}
                onEditCard={isSuperAdmin ? onOpenEditCardModal : undefined}
                onEditPhoto={onOpenEditPhotoModal}
                onEditMemberProfile={onOpenEditMemberModal}
                onPrintPdf={onOpenPrintPdfModal}
                allowAdminEdit={isSuperAdmin}
                showControls={true}
              />
            )}

            {/* Quick Admin Transparency Indicator (Super Admin Only) */}
            {isSuperAdmin && onOpenEditCardModal && (
              <div className="p-2.5 bg-purple-950/40 rounded-2xl border border-purple-800/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-purple-200">
                    Transparansi Latar: <strong className="text-white font-mono">{currentOpacityPct}%</strong>
                    {currentOpacityPct === 90 && <span className="text-emerald-400 font-normal"> (Standar Terbaca)</span>}
                  </span>
                </div>
                <button
                  onClick={onOpenEditCardModal}
                  className="text-[10px] font-bold text-purple-300 hover:text-white underline cursor-pointer"
                >
                  Ubah Desain
                </button>
              </div>
            )}
          </div>

          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-[11px] text-slate-300 leading-relaxed flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>KTA dilengkapi QR Code anti-pemalsuan dan dapat langsung diverifikasi petugas atau pemangku pariwisata.</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Regional Map Visual & Featured Tours */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Territory Distribution: Super Admin sees national, Operators see their province/regency context */}
        <div className="lg:col-span-6 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs">
          <NationalMapVisual provinces={provinces} />
        </div>

        {/* Featured Tours */}
        <div className="lg:col-span-6 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 font-heading">
                Paket Wisata Unggulan Komunitas
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Pemberdayaan potensi destinasi oleh kader Saka Pariwisata
              </p>
            </div>
            <button
              onClick={() => onSelectTab('tours')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer p-1"
            >
              <span>Jelajah Semua</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {publishedTours.slice(0, 2).map((tour) => (
              <div 
                key={tour.id} 
                onClick={() => onViewTourDetail(tour)}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-28 rounded-xl overflow-hidden relative">
                    <img
                      src={tour.coverImage}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-xs text-[10px] font-bold text-white rounded-md">
                      {tour.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {tour.title}
                  </h4>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-emerald-800 font-heading">
                    Rp {(tour.pricePerPerson ?? 0).toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-400">{tour.durationDays} Hari</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
