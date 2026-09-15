import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Compass,
  Gift,
  LayoutDashboard,
  LockKeyhole,
  MapPin,
  Menu,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Member, TourPackage, CulinarySouvenirItem, CurrentUser, Activity, KridaId, KridaModuleItem } from '../types';
import { SakaLogo, formatDriveImageUrl } from '../components/common/SakaLogo';
import { CompetentGuidesSection } from '../components/common/CompetentGuidesSection';
import { LandingActivitiesSection } from '../components/activities/LandingActivitiesSection';
import { PROVINCES_DATA } from '../data/indonesiaTerritories';
import { KRIDA_CATEGORIES } from '../data/kridaData';
import { storage } from '../services/storage';
import { KridaExplorerModal } from '../components/krida/KridaExplorerModal';
import { KridaMaterialEditorModal } from '../components/krida/KridaMaterialEditorModal';
import { KridaFullScreenReaderModal } from '../components/krida/KridaFullScreenReaderModal';

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

type HomeTool = 'verify' | 'krida' | 'tour' | 'agenda' | 'kuliner' | 'anggota';

const HOME_TOOLS: Array<{
  id: HomeTool;
  label: string;
  hint: string;
  icon: React.ElementType;
  tone: string;
}> = [
  { id: 'verify', label: 'Verifikasi KTA', hint: 'Cek anggota', icon: ShieldCheck, tone: 'from-emerald-500/20 to-teal-500/5 text-emerald-300 border-emerald-500/20' },
  { id: 'krida', label: 'Krida & SKK', hint: 'Materi & uji', icon: Award, tone: 'from-purple-500/20 to-indigo-500/5 text-purple-300 border-purple-500/20' },
  { id: 'tour', label: 'Wisata', hint: 'Paket pilihan', icon: Compass, tone: 'from-amber-500/20 to-orange-500/5 text-amber-300 border-amber-500/20' },
  { id: 'agenda', label: 'Agenda', hint: 'Kegiatan', icon: CalendarDays, tone: 'from-sky-500/20 to-blue-500/5 text-sky-300 border-sky-500/20' },
  { id: 'kuliner', label: 'Kuliner', hint: 'Karya anggota', icon: Store, tone: 'from-rose-500/20 to-pink-500/5 text-rose-300 border-rose-500/20' },
  { id: 'anggota', label: 'Anggota', hint: 'Kompetensi', icon: Users, tone: 'from-cyan-500/20 to-teal-500/5 text-cyan-300 border-cyan-500/20' },
];

const KRIDA_ICONS: Record<KridaId, React.ElementType> = {
  pemandu: Compass,
  penyuluh: ShieldCheck,
  mice: CalendarDays,
  kuliner: Store,
};

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
  onEnterDashboard,
}) => {
  const [quickVerifyTerm, setQuickVerifyTerm] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [activeTool, setActiveTool] = useState<HomeTool | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [kridaModules, setKridaModules] = useState<KridaModuleItem[]>(() => storage.getKridaModules());
  const [isKridaExplorerOpen, setIsKridaExplorerOpen] = useState(false);
  const [activeExplorerKrida, setActiveExplorerKrida] = useState<KridaId>('pemandu');
  const [activeExplorerModuleId, setActiveExplorerModuleId] = useState<string | undefined>();
  const [isKridaEditorOpen, setIsKridaEditorOpen] = useState(false);
  const [editingKridaModule, setEditingKridaModule] = useState<KridaModuleItem | null>(null);
  const [isFullScreenReaderOpen, setIsFullScreenReaderOpen] = useState(false);
  const [readerModuleId, setReaderModuleId] = useState<string | undefined>();

  const activeMembersCount = useMemo(() => members.filter(m => m.status === 'ACTIVE').length, [members]);
  const publishedTours = useMemo(() => tours.filter(t => t.status === 'APPROVED_PUBLISHED'), [tours]);
  const approvedProducts = useMemo(() => culinaryItems.filter(c => (c.status || 'APPROVED') === 'APPROVED'), [culinaryItems]);
  const upcomingActivities = useMemo(() => activities.slice(0, 3), [activities]);

  useEffect(() => {
    const unsub = storage.subscribe(() => setKridaModules(storage.getKridaModules()));
    return (
    <div className="spwn-landing min-h-screen font-sans overflow-x-hidden">
      <header className="spwn-landing-header sticky top-0 z-50">
        <div className="spwn-landing-nav max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-3">
          <button type="button" onClick={() => scrollTo('landing-top')} className="flex items-center gap-3 min-w-0 cursor-pointer group">
            <div className="spwn-logo-frame shrink-0"><SakaLogo size={42} id="landing-saka-logo" /></div>
            <div className="text-left min-w-0">
              <div className="font-black text-base sm:text-lg tracking-tight text-[#34206b] truncate">SPWN<span className="text-[#7b2cbf]">APPS</span></div>
              <div className="hidden sm:block text-[9px] uppercase tracking-[.17em] text-slate-500">Saka Pariwisata Nasional</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1 text-[11px] font-bold text-slate-600">
            <button type="button" onClick={() => scrollTo('landing-krida')} className="spwn-nav-link">Krida</button>
            <button type="button" onClick={() => scrollTo('landing-discover')} className="spwn-nav-link">Destinasi</button>
            <button type="button" onClick={() => scrollTo('landing-agenda')} className="spwn-nav-link">Agenda</button>
            <button type="button" onClick={() => scrollTo('landing-members')} className="spwn-nav-link">Komunitas</button>
          </nav>

          <div className="flex items-center gap-2">
            {currentUser?.role === 'PUBLIC' ? (
              <>
                <button type="button" onClick={onOpenLoginModal} className="hidden sm:flex spwn-outline-btn"><LockKeyhole className="w-3.5 h-3.5" /> Masuk</button>
                <button type="button" onClick={onOpenRegisterModal} className="hidden sm:flex spwn-primary-btn"><UserPlus className="w-3.5 h-3.5" /> Daftar</button>
              </>
            ) : (
              <button type="button" onClick={() => onEnterDashboard(currentUser.role === 'MEMBER' ? 'my-card' : 'dashboard')} className="hidden sm:flex spwn-primary-btn"><LayoutDashboard className="w-3.5 h-3.5" /> Panel</button>
            )}
            <button type="button" onClick={() => setMobileMenuOpen(v => !v)} className="spwn-home-header-btn md:hidden" aria-label="Menu">{mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden spwn-mobile-menu px-4 py-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Krida', icon: Compass, id: 'landing-krida' },
              { label: 'Destinasi', icon: MapPin, id: 'landing-discover' },
              { label: 'Agenda', icon: CalendarDays, id: 'landing-agenda' },
            ].map(item => {
              const Icon = item.icon;
              return <button key={item.id} type="button" onClick={() => scrollTo(item.id)} className="spwn-mobile-menu-item"><Icon className="w-5 h-5 mx-auto mb-1 text-[#7b2cbf]" /><span>{item.label}</span></button>;
            })}
            <button type="button" onClick={() => openTool('verify')} className="spwn-mobile-menu-item"><ShieldCheck className="w-5 h-5 mx-auto mb-1 text-[#159f6b]" /><span>Verifikasi</span></button>
            {currentUser?.role === 'PUBLIC' ? <button type="button" onClick={onOpenLoginModal} className="spwn-mobile-menu-item"><LockKeyhole className="w-5 h-5 mx-auto mb-1 text-[#3b5bdb]" /><span>Masuk</span></button> : <button type="button" onClick={() => onEnterDashboard(currentUser.role === 'MEMBER' ? 'my-card' : 'dashboard')} className="spwn-mobile-menu-item"><LayoutDashboard className="w-5 h-5 mx-auto mb-1 text-[#3b5bdb]" /><span>Panel</span></button>}
            {currentUser?.role === 'PUBLIC' && <button type="button" onClick={onOpenRegisterModal} className="spwn-mobile-menu-item"><UserPlus className="w-5 h-5 mx-auto mb-1 text-[#f59e0b]" /><span>Daftar</span></button>}
          </div>
        )}
      </header>

      <main id="landing-top">
        <section className="spwn-hero relative px-4 sm:px-6 pt-5 sm:pt-8 pb-8 sm:pb-10">
          <div className="spwn-hero-art spwn-hero-art-a" />
          <div className="spwn-hero-art spwn-hero-art-b" />
          <div className="relative max-w-7xl mx-auto">
            <div className="spwn-hero-panel overflow-hidden">
              <div className="spwn-hero-gradient" />
              <div className="absolute inset-0 pointer-events-none opacity-90" style={{ backgroundImage: 'radial-gradient(circle at 73% 35%, rgba(255,255,255,.25) 0 2px, transparent 3px), radial-gradient(circle at 85% 68%, rgba(255,255,255,.18) 0 1.5px, transparent 2px)' }} />
              <div className="relative grid lg:grid-cols-[1.02fr_.98fr] min-h-[390px] sm:min-h-[450px]">
                <div className="p-7 sm:p-10 lg:p-12 flex flex-col justify-center text-white">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 border border-white/20 px-3 py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[.13em] backdrop-blur-md"><Sparkles className="w-3.5 h-3.5 text-[#ffd166]" /> Saka Pariwisata Nasional</div>
                  <h1 className="mt-5 text-[2.6rem] sm:text-5xl lg:text-[4.35rem] font-black tracking-[-.045em] leading-[.95]">Jelajahi.<br /><span className="text-[#ffd166]">Berkarya.</span><br /><span className="text-white">Berdaya.</span></h1>
                  <p className="mt-5 max-w-xl text-sm sm:text-base text-white/85 leading-relaxed">Satu ruang digital untuk belajar Krida, mengenal destinasi, mengembangkan kompetensi, dan terhubung bersama Saka Pariwisata Indonesia.</p>
                  <div className="mt-7 flex flex-col sm:flex-row gap-2.5">
                    <button type="button" onClick={() => scrollTo('landing-krida')} className="spwn-hero-primary"><Compass className="w-4 h-4" /> Mulai Eksplorasi <ArrowRight className="w-4 h-4" /></button>
                    <button type="button" onClick={() => openTool('verify')} className="spwn-hero-secondary"><ShieldCheck className="w-4 h-4" /> Verifikasi KTA</button>
                  </div>
                  <div className="mt-7 flex flex-wrap gap-2 text-[9px] font-bold text-white/85">
                    <span className="spwn-hero-chip">Jelajah Indonesia</span><span className="spwn-hero-chip">Belajar & Berkarya</span><span className="spwn-hero-chip">Kolaborasi</span>
                  </div>
                </div>

                <div className="relative hidden lg:flex items-end justify-center overflow-hidden">
                  <div className="spwn-hero-ribbon spwn-ribbon-one" />
                  <div className="spwn-hero-ribbon spwn-ribbon-two" />
                  <div className="spwn-hero-orb"><Compass className="w-16 h-16 text-white/90" /></div>
                  <div className="absolute right-10 bottom-8 w-64 rounded-[1.8rem] bg-white/90 backdrop-blur-xl p-4 shadow-2xl rotate-2">
                    <div className="text-[9px] uppercase tracking-[.15em] font-black text-[#7b2cbf]">Wonderful Indonesia spirit</div>
                    <div className="mt-1 text-xl font-black text-[#29233d] leading-tight">Pesona Indonesia dalam setiap langkah.</div>
                    <div className="mt-3 flex gap-1.5"><i className="spwn-dot spwn-dot-green" /><i className="spwn-dot spwn-dot-purple" /><i className="spwn-dot spwn-dot-orange" /><i className="spwn-dot spwn-dot-blue" /><i className="spwn-dot spwn-dot-magenta" /></div>
                  </div>
                </div>
              </div>
              <div className="spwn-wave spwn-wave-green" /><div className="spwn-wave spwn-wave-magenta" /><div className="spwn-wave spwn-wave-orange" />
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 pb-7">
          <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { id: 'krida', title: 'Krida & SKK', hint: 'Belajar kompetensi', icon: Award, cls: 'spwn-color-card-purple' },
              { id: 'agenda', title: 'Event & Kegiatan', hint: 'Ikuti agenda terbaru', icon: CalendarDays, cls: 'spwn-color-card-orange' },
              { id: 'anggota', title: 'Direktori Anggota', hint: 'Temukan komunitas', icon: Users, cls: 'spwn-color-card-blue' },
              { id: 'tour', title: 'Destinasi Wisata', hint: 'Jelajahi Indonesia', icon: Compass, cls: 'spwn-color-card-green' },
            ].map(tool => {
              const Icon = tool.icon;
              return <button key={tool.id} type="button" onClick={() => openTool(tool.id as HomeTool)} className={`spwn-color-card ${tool.cls}`}><span className="spwn-color-card-icon"><Icon className="w-5 h-5" /></span><span className="text-sm font-black text-[#28243a]">{tool.title}</span><span className="text-[10px] text-slate-500 mt-1">{tool.hint}</span></button>;
            })}
          </div>
        </section>

        <section id="landing-verification" className="scroll-mt-20 px-4 sm:px-6 py-7 sm:py-9">
          <div className="max-w-7xl mx-auto spwn-verify-panel">
            <div><div className="spwn-eyebrow text-[#159f6b]">Verifikasi anggota</div><h2 className="mt-1 text-2xl sm:text-3xl font-black text-[#28243a]">Pastikan KTA Saka Pariwisata resmi.</h2><p className="mt-2 text-xs sm:text-sm text-slate-500">Cari berdasarkan Nomor Anggota, ID verifikasi, atau nama anggota.</p></div>
            <form onSubmit={handleQuickVerify} className="mt-5 flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1 min-w-0"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input value={quickVerifyTerm} onChange={e => setQuickVerifyTerm(e.target.value)} placeholder="Nomor anggota atau nama..." className="spwn-light-input w-full h-12 pl-10 pr-3.5 rounded-2xl outline-none text-xs sm:text-sm" /></div>
              <button type="submit" className="spwn-green-btn h-12 px-5"><ShieldCheck className="w-4 h-4" /> Verifikasi</button>
            </form>
            {verifyError && <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-[11px] text-amber-700">{verifyError}</div>}
          </div>
        </section>

        <section id="landing-krida" className="scroll-mt-20 px-4 sm:px-6 py-11 sm:py-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-6"><div><div className="spwn-eyebrow text-[#7b2cbf]">Explore your skill</div><h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-[#28243a]">Dari Potensi Jadi Aksi.</h2><p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl">Pilih Krida → pilih SKK → buka materi. Ringkas, visual, dan nyaman dijelajahi dari ponsel.</p></div><button type="button" onClick={() => openReader()} className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#7b2cbf] hover:text-[#4c1d95] cursor-pointer">Baca layar penuh <ArrowRight className="w-3.5 h-3.5" /></button></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {KRIDA_CATEGORIES.map((category, index) => {
                const Icon = KRIDA_ICONS[category.id as KridaId] || Award;
                const count = kridaModules.filter(m => m.kridaId === category.id).length;
                const accents = ['spwn-krida-purple', 'spwn-krida-blue', 'spwn-krida-orange', 'spwn-krida-magenta'];
                return <button key={category.id} type="button" onClick={() => openKrida(category.id as KridaId)} className={`spwn-krida-card ${accents[index % accents.length]}`}><div className="flex items-start justify-between"><div className="spwn-krida-icon"><Icon className="w-5 h-5" /></div><ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#7b2cbf]" /></div><div className="mt-5 text-[9px] uppercase tracking-[.14em] text-slate-400 font-black">Krida 0{index + 1}</div><h3 className="mt-1 text-sm sm:text-lg font-black text-[#28243a]">{category.name}</h3><p className="mt-1.5 text-[10px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2">{category.description}</p><div className="mt-4 inline-flex items-center rounded-full bg-white/80 border border-white px-2.5 py-1 text-[9px] font-bold text-slate-600">{count || category.topicsCount} materi</div></button>;
              })}
            </div>
          </div>
        </section>

        <section id="landing-discover" className="scroll-mt-20 px-4 sm:px-6 py-11 sm:py-14 spwn-section-tint">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-6"><div><div className="spwn-eyebrow text-[#f59e0b]">Discover Indonesia</div><h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-[#28243a]">Destinasi & karya</h2><p className="mt-2 text-xs sm:text-sm text-slate-500">Lihat paket wisata dan karya kuliner/cinderamata dari ekosistem Saka Pariwisata.</p></div><button type="button" onClick={() => onEnterDashboard('culinary-souvenirs')} className="text-xs font-bold text-[#d97706] hover:text-[#92400e] cursor-pointer whitespace-nowrap">Lihat semua <ArrowRight className="inline w-3.5 h-3.5" /></button></div>
            {publishedTours.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-7">{publishedTours.slice(0, 3).map(tour => <button key={tour.id} type="button" onClick={() => onViewTourDetail(tour)} className="spwn-photo-card"><div className="h-44 sm:h-48 bg-slate-100 overflow-hidden relative"><img src={formatDriveImageUrl(tour.imageUrl) || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80'} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" referrerPolicy="no-referrer" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" /><div className="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[9px] text-white"><MapPin className="w-3 h-3" /> {tour.regencyName}, {tour.provinceName}</div></div><div className="p-4"><h3 className="text-sm font-black text-[#28243a] line-clamp-2">{tour.title}</h3><div className="mt-2 text-[9px] font-bold text-[#d97706]">Jelajahi paket →</div></div></button>)}</div> : <div className="spwn-empty-card mb-6">Belum ada paket wisata yang dipublikasikan.</div>}
            {approvedProducts.length > 0 && <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{approvedProducts.slice(0, 4).map(item => <button key={item.id} type="button" onClick={() => onSelectCulinaryDetail(item)} className="spwn-product-card"><div className="h-32 sm:h-40 bg-slate-100 overflow-hidden"><img src={formatDriveImageUrl(item.imageUrl) || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'} alt={item.name} className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" /></div><div className="p-3.5"><div className="text-[8px] uppercase tracking-[.12em] text-[#d946a0] font-black">{item.kind === 'KULINER' ? 'Kuliner' : 'Cinderamata'}</div><h3 className="mt-1 text-xs font-bold text-[#28243a] line-clamp-2">{item.name}</h3></div></button>)}</div>}
          </div>
        </section>

        <section id="landing-agenda" className="scroll-mt-20 px-4 sm:px-6 py-11 sm:py-14">
          <div className="max-w-7xl mx-auto"><div className="flex items-end justify-between gap-4 mb-6"><div><div className="spwn-eyebrow text-[#3b82f6]">What’s happening</div><h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-[#28243a]">Agenda Saka</h2><p className="mt-2 text-xs sm:text-sm text-slate-500">Kegiatan, pelatihan, orientasi, dan agenda terbaru.</p></div><button type="button" onClick={() => onEnterDashboard('activities')} className="text-xs font-bold text-[#2563eb] hover:text-[#1e3a8a] cursor-pointer whitespace-nowrap">Semua agenda <ArrowRight className="inline w-3.5 h-3.5" /></button></div><div className="spwn-content-card overflow-hidden"><LandingActivitiesSection activities={upcomingActivities} currentUser={currentUser} onViewActivityDetail={onViewActivityDetail} onOpenActivityForm={onOpenActivityForm} onEnterDashboard={onEnterDashboard} /></div></div>
        </section>

        <section id="landing-members" className="scroll-mt-20 px-4 sm:px-6 py-11 sm:py-14 spwn-section-soft-green">
          <div className="max-w-7xl mx-auto"><CompetentGuidesSection members={members} provinces={PROVINCES_DATA} onOpenVerifyModal={onOpenVerifyModal} theme="light" title="Komunitas & Kompetensi" subtitle="Temukan anggota Saka Pariwisata dan kompetensi yang tersedia di berbagai wilayah Indonesia." /></div>
        </section>
      </main>

      <footer className="spwn-landing-footer px-4 sm:px-6 py-8"><div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-5"><div className="flex items-center gap-3"><div className="spwn-logo-frame"><SakaLogo size={34} id="landing-footer-logo" /></div><div><div className="text-xs font-black text-[#34206b]">SPWNAPPS — Saka Pariwisata Nasional</div><div className="text-[9px] text-slate-500">Kwartir Nasional Gerakan Pramuka • Kementerian Pariwisata Republik Indonesia</div></div></div><div className="flex items-center gap-2"><button type="button" onClick={onOpenLoginModal} className="spwn-footer-icon" title="Masuk"><LockKeyhole className="w-4 h-4" /></button><button type="button" onClick={onOpenRegisterModal} className="spwn-footer-icon" title="Daftar"><UserPlus className="w-4 h-4" /></button></div></div></footer>

      {isKridaExplorerOpen && (
        <KridaExplorerModal
          isOpen={isKridaExplorerOpen}
          modules={kridaModules}
          initialKridaId={activeExplorerKrida}
          initialModuleId={activeExplorerModuleId}
          currentUser={currentUser}
          onClose={() => setIsKridaExplorerOpen(false)}
          onOpenEditor={openEditor}
        />
      )}
      {isKridaEditorOpen && editingKridaModule && <KridaMaterialEditorModal module={editingKridaModule} onClose={() => setIsKridaEditorOpen(false)} onSave={handleSaveKridaModule} />}
      {isFullScreenReaderOpen && <KridaFullScreenReaderModal modules={kridaModules} initialModuleId={readerModuleId} onClose={() => setIsFullScreenReaderOpen(false)} />}
    </div>
  );
};
