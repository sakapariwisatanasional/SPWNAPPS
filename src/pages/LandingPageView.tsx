import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  QrCode, 
  Compass, 
  Award, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Utensils, 
  Calendar, 
  Lock, 
  UserPlus, 
  FileSpreadsheet, 
  FolderOpen,
  ExternalLink,
  ChevronRight,
  Eye,
  Star,
  Layers,
  Heart,
  Globe2,
  Clock,
  Gift,
  TreePine,
  ShoppingBag,
  BadgeCheck,
  Check,
  LayoutDashboard,
  BookOpen,
  Edit3,
  Download,
  FileText,
  Video,
  Table as TableIcon
} from 'lucide-react';
import { Member, TourPackage, CulinarySouvenirItem, CurrentUser, Activity, KridaId, KridaModuleItem } from '../types';
import { SakaLogo, formatDriveImageUrl } from '../components/common/SakaLogo';
import { DEFAULT_SPREADSHEET_URL } from '../services/spreadsheetService';
import { GOOGLE_DRIVE_MAIN_FOLDER } from '../services/driveRepository';
import { CompetentGuidesSection } from '../components/common/CompetentGuidesSection';
import { LandingActivitiesSection } from '../components/activities/LandingActivitiesSection';
import { PROVINCES_DATA } from '../data/indonesiaTerritories';
import { KRIDA_CATEGORIES } from '../data/kridaData';
import { storage } from '../services/storage';
import { KridaExplorerModal } from '../components/krida/KridaExplorerModal';
import { KridaMaterialEditorModal } from '../components/krida/KridaMaterialEditorModal';
import { CompactKridaPortal } from '../components/krida/CompactKridaPortal';

interface LandingPageViewProps {
  currentUser: CurrentUser;
  members: Member[];
  tours: TourPackage[];
  culinaryItems: CulinarySouvenirItem[];
  activities: Activity[];
  onOpenLoginModal: () => void;
  onOpenRegisterModal: () => void;
  onOpenVerifyModal: (member: Member) => void;
  onViewTourDetail: (tour: TourPackage) => void;
  onSelectCulinaryDetail: (item: CulinarySouvenirItem) => void;
  onViewActivityDetail: (activity: Activity) => void;
  onOpenActivityForm?: () => void;
  onEnterDashboard: (tab?: string) => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  currentUser,
  members,
  tours,
  culinaryItems,
  activities,
  onOpenLoginModal,
  onOpenRegisterModal,
  onOpenVerifyModal,
  onViewTourDetail,
  onSelectCulinaryDetail,
  onViewActivityDetail,
  onOpenActivityForm,
  onEnterDashboard
}) => {
  const [quickVerifyTerm, setQuickVerifyTerm] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const [galleryTab, setGalleryTab] = useState<'ALL' | 'TOURS' | 'CULINARY' | 'SOUVENIR'>('ALL');
  const activeMembersCount = members.filter(m => m.status === 'ACTIVE').length;
  const publishedTours = tours.filter(t => t.status === 'APPROVED_PUBLISHED');
  const approvedProducts = culinaryItems.filter(c => (c.status || 'APPROVED') === 'APPROVED');
  const culinaryProducts = approvedProducts.filter(c => c.kind === 'KULINER');
  const souvenirProducts = approvedProducts.filter(c => c.kind === 'CINDERAMATA');

  // Fallback high-res tourism images
  const DEFAULT_TOUR_IMG = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80';
  const DEFAULT_FOOD_IMG = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80';
  const DEFAULT_CRAFT_IMG = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

  const handleQuickVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');

    const term = quickVerifyTerm.trim().toLowerCase();
    if (!term) return;

    const found = members.find(m => 
      (m.nationalMemberNumber && m.nationalMemberNumber.toLowerCase() === term) ||
      (m.verificationToken && m.verificationToken.toLowerCase() === term) ||
      m.id.toLowerCase() === term ||
      m.fullName.toLowerCase().includes(term)
    );

    if (found) {
      onOpenVerifyModal(found);
    } else {
      setVerifyError('Data anggota tidak ditemukan. Pastikan Nomor KTA atau Nama yang dimasukkan sudah benar.');
    }
  };

  // Krida Folder & Modules state
  const [kridaModules, setKridaModules] = useState<KridaModuleItem[]>(() => storage.getKridaModules());
  const [isKridaExplorerOpen, setIsKridaExplorerOpen] = useState(false);
  const [activeExplorerKrida, setActiveExplorerKrida] = useState<KridaId>('pemandu');
  const [activeExplorerModuleId, setActiveExplorerModuleId] = useState<string | undefined>(undefined);
  const [isKridaEditorOpen, setIsKridaEditorOpen] = useState(false);
  const [editingKridaModule, setEditingKridaModule] = useState<KridaModuleItem | null>(null);

  // Cross-device sync listener
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setKridaModules(storage.getKridaModules());
    });
    return () => unsub();
  }, []);

  const handleOpenKridaFolder = (kridaId: KridaId, moduleId?: string) => {
    setActiveExplorerKrida(kridaId);
    setActiveExplorerModuleId(moduleId);
    setIsKridaExplorerOpen(true);
  };

  const handleOpenEditor = (moduleItem: KridaModuleItem) => {
    setEditingKridaModule(moduleItem);
    setIsKridaEditorOpen(true);
  };

  const handleSaveKridaModule = (updatedItem: KridaModuleItem) => {
    storage.updateKridaModule(updatedItem, currentUser.name);
    setKridaModules(storage.getKridaModules());
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      
      {/* 1. TOP NAVBAR */}
      <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SakaLogo size={42} id="landing-saka-logo" />
          <div>
            <h1 className="text-base sm:text-lg font-extrabold font-heading tracking-wide uppercase text-white flex items-center gap-1.5">
              <span>Saka</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-400">Pariwisata</span>
            </h1>
            <p className="text-[10px] text-purple-200/70 tracking-wider font-semibold uppercase">
              Kwartir Nasional Gerakan Pramuka
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser && currentUser.role !== 'PUBLIC' ? (
            <button
              type="button"
              onClick={() => onEnterDashboard(currentUser.role === 'MEMBER' ? 'my-card' : 'dashboard')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-300" />
              <span>Panel {currentUser.role === 'MEMBER' ? 'KTA Anggota' : 'Dashboard'} ({currentUser.name.split(' ')[0]})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                <span>Masuk / Login</span>
              </button>

              <button
                type="button"
                onClick={onOpenRegisterModal}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Anggota</span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[600px] h-96 sm:h-[600px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-purple-800/80 text-purple-300 text-xs font-bold shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Platform Digital Resmi Saka Pariwisata Indonesia</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white tracking-tight leading-tight">
            Satu Keanggotaan, <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-amber-300 to-teal-300">
              Satu Ekosistem Pariwisata Indonesia
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Platform keanggotaan nasional Saka Pariwisata yang menghubungkan Pramuka Saka Pariwisata dari seluruh Indonesia melalui KTA Digital berbasis QR Code, direktori keahlian, paket wisata komunitas, serta katalog kuliner dan cinderamata.
          </p>

          {/* Slogan / Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/70 border border-purple-800/80 text-amber-300 text-xs sm:text-sm font-bold tracking-wide shadow-md">
            <span>Terhubung • Berkarya • Berdaya • Mempromosikan Pariwisata Indonesia</span>
          </div>

          {/* 3. QUICK VERIFICATION BOX */}
          <div className="pt-8 max-w-2xl mx-auto">
            <div className="bg-slate-950/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-heading">
                    Verifikasi Keaslian KTA & Nomor Anggota
                  </h3>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  Sistem Real-Time
                </span>
              </div>

              <form onSubmit={handleQuickVerify} className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={quickVerifyTerm}
                    onChange={(e) => setQuickVerifyTerm(e.target.value)}
                    placeholder="Masukkan No. Anggota (31.71.01.2025.0001) atau Nama Anggota..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verifikasi</span>
                </button>
              </form>

              {verifyError && (
                <p className="text-xs text-amber-400 bg-amber-950/60 p-2.5 rounded-xl border border-amber-800/60">
                  {verifyError}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. METRICS / STATS BAR */}
      <section className="border-y border-slate-800 bg-slate-950/60 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <p className="text-2xl sm:text-3xl font-extrabold text-white font-heading">{activeMembersCount}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Anggota Terverifikasi</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">{publishedTours.length}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Paket Wisata Komunitas</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <p className="text-2xl sm:text-3xl font-extrabold text-teal-400 font-heading">{culinaryItems.length}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Kuliner & Cinderamata</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-heading">38 Kwarda</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Cakupan Seluruh Indonesia</p>
          </div>
        </div>
      </section>

      {/* 5. 4 KRIDA SAKA PARIWISATA: FOLDER KATEGORI MATERI & KURIKULUM SKK (SIMPEL, RINGKAS, TANPA SCROLLING) */}
      <section id="krida-learning-portal" className="py-14 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Folder Pembelajaran & Kurikulum SKK Resmi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-heading">
              Folder 4 Krida & Kurikulum SKK
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Tampilan interaktif dan ringkas tanpa scrolling. Pilih folder krida untuk melihat mata krida, lalu klik untuk membuka naskah materi, silabus pelatihan, dan instrumen uji syarat kecakapan khusus (SKK).
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleOpenKridaFolder('pemandu')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/50 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Buka Penjelajah Lengkap (23 SKK)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* COMPACT KRIDA PORTAL: What user clicks is what they see, with on-demand material opening */}
        <CompactKridaPortal
          modules={kridaModules}
          currentUser={currentUser}
          onOpenFullExplorer={handleOpenKridaFolder}
          onOpenEditor={handleOpenEditor}
          variant="dark"
          initialKridaId={activeExplorerKrida}
        />
      </section>

      {/* 6. PREVIEW ANGGOTA BERKOMPETENSI & PEMANDU TERDEKAT */}
      <CompetentGuidesSection
        members={members}
        provinces={PROVINCES_DATA}
        onOpenVerifyModal={onOpenVerifyModal}
        theme="dark"
        title="Temukan Pemandu & Kader Saka Terdekat dengan Wilayah Anda"
        subtitle="Hubungi langsung anggota dan pamong Saka Pariwisata yang memiliki lisensi BNSP, sertifikasi keahlian ekowisata, pemandu budaya, dan cinderamata di wilayah terdekat."
      />

      {/* 7. AGENDA KEGIATAN & EVENT SAKA PARIWISATA */}
      <LandingActivitiesSection
        activities={activities}
        currentUser={currentUser}
        onViewActivityDetail={onViewActivityDetail}
        onOpenActivityForm={onOpenActivityForm}
        onEnterDashboard={onEnterDashboard}
      />

      {/* 8. PAKET WISATA & KULINER SPOTLIGHT */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 border-t border-slate-800">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Wisata & Karya 4 Krida Nusantara</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-heading">
              Jelajahi Paket Wisata & Cinderamata Khas
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Karya nyata kader Saka Pariwisata se-Indonesia: paket ekowisata terpandu, gastronomi khas daerah, serta suvenir ramah lingkungan siap dipesan.
            </p>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setGalleryTab('TOURS')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                galleryTab === 'TOURS'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                  : 'bg-purple-900/60 hover:bg-purple-900 text-purple-200 border border-purple-700/60'
              }`}
            >
              <span>Paket Wisata ({publishedTours.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGalleryTab('ALL')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                galleryTab === 'ALL'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-700/60'
              }`}
            >
              <span>Galeri 4 Krida</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
          <button
            onClick={() => setGalleryTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              galleryTab === 'ALL'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950/80 hover:bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <span>Semua Rekomendasi</span>
            <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-md text-[10px] font-mono">
              {publishedTours.length + approvedProducts.length}
            </span>
          </button>

          <button
            onClick={() => setGalleryTab('TOURS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              galleryTab === 'TOURS'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950/80 hover:bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <TreePine className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paket Wisata & Ekowisata</span>
            <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-md text-[10px] font-mono">
              {publishedTours.length}
            </span>
          </button>

          <button
            onClick={() => setGalleryTab('CULINARY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              galleryTab === 'CULINARY'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950/80 hover:bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-amber-400" />
            <span>Kuliner Khas Daerah</span>
            <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-md text-[10px] font-mono">
              {culinaryProducts.length}
            </span>
          </button>

          <button
            onClick={() => setGalleryTab('SOUVENIR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
              galleryTab === 'SOUVENIR'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
                : 'bg-slate-950/80 hover:bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-rose-400" />
            <span>Kriya & Cinderamata</span>
            <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-md text-[10px] font-mono">
              {souvenirProducts.length}
            </span>
          </button>
        </div>

        {/* 1. TOURS GRID (When ALL or TOURS is active) */}
        {(galleryTab === 'ALL' || galleryTab === 'TOURS') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-white font-heading flex items-center gap-2">
                <TreePine className="w-4 h-4 text-emerald-400" />
                <span>Paket Wisata & Destinasi Binaan Pramuka</span>
              </h3>
              <button
                onClick={() => onEnterDashboard('tours')}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua ({publishedTours.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(galleryTab === 'ALL' ? publishedTours.slice(0, 3) : publishedTours).map((tour) => {
                const tourImgUrl = formatDriveImageUrl(tour.coverImage || (tour as any).coverImageUrl) || DEFAULT_TOUR_IMG;
                const price = (tour as any).price ?? tour.pricePerPerson ?? 0;

                return (
                  <div
                    key={tour.id}
                    onClick={() => onViewTourDetail(tour)}
                    className="bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/60 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-emerald-950/30 flex flex-col justify-between hover:-translate-y-1.5"
                  >
                    <div>
                      {/* Image Container with high-res rendering */}
                      <div className="relative h-52 sm:h-56 overflow-hidden bg-slate-900">
                        <img
                          src={tourImgUrl}
                          alt={tour.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_TOUR_IMG;
                          }}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                          <span className="px-3 py-1 bg-slate-950/85 backdrop-blur-md text-emerald-300 text-xs font-extrabold rounded-xl border border-emerald-500/30 shadow-md flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{tour.category}</span>
                          </span>

                          {tour.featured && (
                            <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-lg shadow-md flex items-center gap-1">
                              <Star className="w-3 h-3 fill-slate-950" />
                              <span>Unggulan</span>
                            </span>
                          )}
                        </div>

                        {/* Bottom Overlay Info (Price & Duration) */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10">
                          <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                            <p className="text-[9px] text-slate-400 uppercase font-semibold">Mulai Dari</p>
                            <p className="text-sm sm:text-base font-extrabold font-heading text-emerald-300 leading-tight">
                              Rp {price.toLocaleString('id-ID')}
                              <span className="text-[10px] font-normal text-slate-300"> / pax</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1 text-xs bg-slate-950/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 font-semibold text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{tour.durationDays} Hari</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          <span className="truncate font-medium">{tour.regencyName}, {tour.provinceName}</span>
                        </div>

                        <h4 className="font-bold text-white text-base font-heading group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                          {tour.title}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {tour.description}
                        </p>

                        {/* Highlights pills */}
                        {tour.facilities && tour.facilities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {tour.facilities.slice(0, 2).map((fac, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] text-slate-300 font-medium truncate max-w-[150px]"
                              >
                                ✓ {fac}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 pb-5 pt-2 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                      <span className="truncate text-[11px]">
                        {tour.guideProvided ? '✓ Pemandu Lisensi HPI/Saka' : 'Pemandu Lokal'}
                      </span>
                      <span className="text-emerald-400 font-bold text-xs group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Detail</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. CULINARY & SOUVENIR 4 KRIDA SHOWCASE (When ALL, CULINARY, or SOUVENIR is active) */}
        {(galleryTab === 'ALL' || galleryTab === 'CULINARY' || galleryTab === 'SOUVENIR') && approvedProducts.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-850">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-extrabold text-white font-heading flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <span>
                  {galleryTab === 'CULINARY' 
                    ? 'Katalog Kuliner & Minuman Khas Daerah' 
                    : galleryTab === 'SOUVENIR'
                    ? 'Katalog Kriya & Cinderamata Kreatif'
                    : 'Karya Produk, Kriya & Kuliner Binaan 4 Krida'}
                </span>
              </h3>
              <button
                onClick={() => onEnterDashboard('culinary-souvenirs')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Semua ({approvedProducts.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(galleryTab === 'ALL'
                ? approvedProducts.slice(0, 4)
                : galleryTab === 'CULINARY'
                ? culinaryProducts
                : souvenirProducts
              ).map((item) => {
                const itemImgUrl = formatDriveImageUrl(item.imageUrl) || (item.kind === 'KULINER' ? DEFAULT_FOOD_IMG : DEFAULT_CRAFT_IMG);

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectCulinaryDetail(item)}
                    className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/60 rounded-3xl overflow-hidden transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-amber-950/30 flex flex-col justify-between hover:-translate-y-1.5"
                  >
                    <div>
                      {/* Image container */}
                      <div className="relative h-48 overflow-hidden bg-slate-900">
                        <img
                          src={itemImgUrl}
                          alt={item.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = item.kind === 'KULINER' ? DEFAULT_FOOD_IMG : DEFAULT_CRAFT_IMG;
                          }}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30" />

                        {/* Top Badge */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg backdrop-blur-md shadow-md ${
                            item.kind === 'KULINER'
                              ? 'bg-amber-500/90 text-slate-950'
                              : 'bg-rose-500/90 text-white'
                          }`}>
                            {item.krida || (item.kind === 'KULINER' ? 'Kuliner' : 'Cinderamata')}
                          </span>

                          <span className="px-2.5 py-1 bg-slate-950/85 backdrop-blur-md text-emerald-300 text-[11px] font-mono font-extrabold rounded-lg border border-emerald-500/30">
                            Rp {(item.priceEstimate ?? 0).toLocaleString('id-ID')}
                          </span>
                        </div>

                        {/* Bottom Tag */}
                        <div className="absolute bottom-2.5 left-2.5 text-white z-10">
                          <span className="text-[10px] text-slate-300 font-semibold px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs border border-white/10">
                            {item.categoryLabel || item.kridaCategory || 'Karya Daerah'}
                          </span>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{item.districtName} • {item.regencyName}</span>
                        </div>

                        <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                          {item.name}
                        </h4>

                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 pb-4 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate flex items-center gap-1">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{item.authorName}</span>
                      </span>
                      <span className="text-amber-400 font-bold text-[10px] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        <span>Pesan</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 7. FOOTER & SPREADSHEET DATABASE BADGE */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <SakaLogo size={36} id="landing-footer-logo" />
            <div>
              <p className="font-bold text-white">Saka Pariwisata Indonesia</p>
              <p className="text-[11px] text-slate-500">Kwartir Nasional Gerakan Pramuka</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            {currentUser && currentUser.role !== 'PUBLIC' ? (
              <>
                <button
                  onClick={() => onEnterDashboard(currentUser.role === 'MEMBER' ? 'my-card' : 'dashboard')}
                  className="hover:text-white transition-colors cursor-pointer text-purple-300 font-semibold"
                >
                  Panel {currentUser.role === 'MEMBER' ? 'KTA Anggota' : 'Dashboard'}
                </button>
                <span className="text-slate-700">|</span>
              </>
            ) : null}
            <button
              onClick={onOpenLoginModal}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Masuk / Login
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={onOpenRegisterModal}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Daftar Anggota Baru
            </button>
          </div>

          <p className="text-slate-500 text-center md:text-right">
            © {new Date().getFullYear()} Satuan Karya Pramuka Pariwisata Indonesia.
          </p>
        </div>
      </footer>

      {/* 9. MODALS PEMBELAJARAN KRIDA & CMS SUPER ADMIN */}
      <KridaExplorerModal
        isOpen={isKridaExplorerOpen}
        onClose={() => {
          setIsKridaExplorerOpen(false);
          setActiveExplorerModuleId(undefined);
        }}
        modules={kridaModules}
        currentUser={currentUser}
        initialKridaId={activeExplorerKrida}
        initialModuleId={activeExplorerModuleId}
        onOpenEditor={handleOpenEditor}
      />

      <KridaMaterialEditorModal
        isOpen={isKridaEditorOpen}
        onClose={() => {
          setIsKridaEditorOpen(false);
          setEditingKridaModule(null);
        }}
        moduleItem={editingKridaModule}
        currentUser={currentUser}
        onSave={handleSaveKridaModule}
      />
    </div>
  );
};
