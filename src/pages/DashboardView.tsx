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
  members = [],
  tours = [],
  provinces = [],
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
  const isPublic = currentUser?.role === 'PUBLIC';
  const isMember = currentUser?.role === 'MEMBER';
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isOperator = currentUser?.role === 'ADMIN_PROVINCE' || currentUser?.role === 'ADMIN_REGENCY' || currentUser?.role === 'ADMIN_BRANCH';
  const isAdmin = isSuperAdmin || isOperator;

  const ktaSettings = storage.getKtaSettings();
  const currentOpacityPct = Math.round((ktaSettings?.bgOpacity ?? 0.10) * 100);

  const liveCulinaryItems = culinaryItems || storage.getCulinarySouvenirs() || [];

  const scopedMembers = isSuperAdmin 
    ? (members || [])
    : currentUser?.role === 'ADMIN_PROVINCE' 
      ? (members || []).filter(m => m.provinceId === currentUser.jurisdictionId)
      : currentUser?.role === 'ADMIN_REGENCY'
        ? (members || []).filter(m => m.regencyId === currentUser.jurisdictionId)
        : currentUser?.role === 'ADMIN_BRANCH'
          ? (members || []).filter(m => m.branchId === currentUser.jurisdictionId)
          : [];

  const scopedTours = isSuperAdmin
    ? (tours || [])
    : currentUser?.role === 'ADMIN_PROVINCE'
      ? (tours || []).filter(t => t.provinceId === currentUser.jurisdictionId)
      : currentUser?.role === 'ADMIN_REGENCY'
        ? (tours || []).filter(t => t.regencyId === currentUser.jurisdictionId)
        : (tours || []);

  const activeMembersCount = isSuperAdmin 
    ? (members || []).filter(m => m?.status === 'ACTIVE').length 
    : scopedMembers.filter(m => m?.status === 'ACTIVE').length;

  const pendingMembers = isSuperAdmin 
    ? (members || []).filter(m => m?.status === 'PENDING') 
    : scopedMembers.filter(m => m?.status === 'PENDING');

  const publishedTours = isSuperAdmin 
    ? (tours || []).filter(t => t?.status === 'APPROVED_PUBLISHED' || (t as any)?.status === 'PUBLISHED') 
    : scopedTours.filter(t => t?.status === 'APPROVED_PUBLISHED' || (t as any)?.status === 'PUBLISHED');
  
  const [selectedTourCategory, setSelectedTourCategory] = useState<string>('ALL');
  const [tourSearch, setTourSearch] = useState<string>('');

  const tourCategories = Array.from(new Set(publishedTours.map(t => t?.category).filter(Boolean)));

  // Filter aman tanpa memicu crash undefined toLowerCase
  const filteredPublicTours = publishedTours.filter(t => {
    if (!t) return false;
    const matchCat = selectedTourCategory === 'ALL' || t.category === selectedTourCategory;
    const q = (tourSearch || '').toLowerCase().trim();
    if (!q) return matchCat;

    const titleStr = (t.title || '').toLowerCase();
    const locStr = (t.locationName || (t as any).locationAddress || '').toLowerCase();
    const provStr = (t.provinceName || '').toLowerCase();
    const regStr = (t.regencyName || '').toLowerCase();

    const matchQuery = titleStr.includes(q) || locStr.includes(q) || provStr.includes(q) || regStr.includes(q);
    return matchCat && matchQuery;
  });

  // TAMPILAN PUBLIK
  if (isPublic) {
    return (
      <div className="space-y-6 sm:space-y-8 pb-16">
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
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
                Jelajahi Pesona Nusantara Bersama Saka Pariwisata
              </h1>
              <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
                Temukan paket perjalanan edukatif, pemandu bersertifikasi, dan produk kriya kuliner binaan Gerakan Pramuka.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 w-full sm:w-auto">
            <button
              onClick={onOpenRegisterModal}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Anggota Baru</span>
            </button>
            <button
              onClick={() => onSelectTab('tours')}
              className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs border border-white/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Compass className="w-4 h-4 text-purple-300" />
              <span>Direktori Wisata</span>
            </button>
          </div>
        </div>

        <IntegratedTourismShowcaseGallery
          tours={tours}
          products={liveCulinaryItems}
          members={members}
          onViewTourDetail={onViewTourDetail}
          onSelectCulinaryDetail={onSelectCulinaryDetail}
          onSelectTab={onSelectTab}
        />

        <NationalMapVisual
          provinces={provinces}
          members={members}
          onSelectProvince={() => onSelectTab('members')}
        />
      </div>
    );
  }

  // TAMPILAN MEMBER & ADMIN
  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSuperAdmin ? 'Kwartir Nasional Super Admin' : isOperator ? currentUser?.jurisdictionName : 'Dashboard Anggota'}</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser?.fullName || currentUser?.name || 'Kader Saka'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Sistem Informasi Registrasi & Manajemen Saka Pariwisata Nasional
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 z-10">
          {isSuperAdmin && onOpenSpreadsheetModal && (
            <button
              onClick={onOpenSpreadsheetModal}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Spreadsheet Sync</span>
            </button>
          )}
          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Pendaftaran Baru</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <DashboardWidget
          title="Anggota Aktif"
          value={activeMembersCount.toLocaleString('id-ID')}
          subtitle="Kader Terverifikasi"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
          trend="+12%"
          onClick={() => onSelectTab('members')}
        />
        <DashboardWidget
          title="Menunggu Validasi"
          value={pendingMembers.length.toLocaleString('id-ID')}
          subtitle="Perlu Tindakan"
          icon={<Clock className="w-5 h-5 text-amber-500" />}
          onClick={() => onSelectTab('members')}
        />
        <DashboardWidget
          title="Paket Wisata"
          value={publishedTours.length.toLocaleString('id-ID')}
          subtitle="Aktif di Direktori"
          icon={<Compass className="w-5 h-5 text-blue-500" />}
          onClick={() => onSelectTab('tours')}
        />
        <DashboardWidget
          title="Produk & Kuliner"
          value={liveCulinaryItems.length.toLocaleString('id-ID')}
          subtitle="Karya Kader Saka"
          icon={<Award className="w-5 h-5 text-purple-500" />}
          onClick={() => onSelectTab('culinary-souvenirs')}
        />
      </div>

      {pendingMembers.length > 0 && isAdmin && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">Antrean Verifikasi Anggota Baru ({pendingMembers.length})</h3>
            </div>
            <button
              onClick={() => onSelectTab('members')}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingMembers.slice(0, 6).map((m) => (
              <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img src={m.avatarUrl} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-xs text-slate-800 truncate">{m.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{m.krida} • {m.regencyName}</p>
                  </div>
                </div>
                <button
                  onClick={() => onApproveMemberQuick(m.id)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg flex-shrink-0 cursor-pointer"
                >
                  Setujui
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <IntegratedTourismShowcaseGallery
        tours={tours}
        products={liveCulinaryItems}
        members={members}
        onViewTourDetail={onViewTourDetail}
        onSelectCulinaryDetail={onSelectCulinaryDetail}
        onSelectTab={onSelectTab}
      />

      <NationalMapVisual
        provinces={provinces}
        members={members}
        onSelectProvince={() => onSelectTab('members')}
      />
    </div>
  );
};
