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
    return () => unsub();
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const openTool = (tool: HomeTool) => {
    setActiveTool(prev => prev === tool ? null : tool);
    if (tool === 'verify') scrollTo('landing-verification');
    if (tool === 'krida') scrollTo('landing-krida');
    if (tool === 'tour') scrollTo('landing-discover');
    if (tool === 'agenda') scrollTo('landing-agenda');
    if (tool === 'kuliner') scrollTo('landing-discover');
    if (tool === 'anggota') scrollTo('landing-members');
  };

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
    if (found) onOpenVerifyModal(found);
    else setVerifyError('Data anggota tidak ditemukan. Periksa Nomor Anggota atau Nama.');
  };

  const openKrida = (kridaId: KridaId, moduleId?: string) => {
    setActiveExplorerKrida(kridaId);
    setActiveExplorerModuleId(moduleId);
    setIsKridaExplorerOpen(true);
  };

  // Support deep-links created by the "Bagikan" button in the Krida Explorer.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kridaParam = params.get('krida') as KridaId | null;
    const moduleParam = params.get('skk');

    if (kridaParam && KRIDA_CATEGORIES.some(category => category.id === kridaParam)) {
      const targetModule = moduleParam
        ? kridaModules.find(module => module.id === moduleParam && module.kridaId === kridaParam)
        : undefined;

      openKrida(kridaParam, targetModule?.id);
    }
  }, []);

  const openReader = (moduleId?: string) => {
    setReaderModuleId(moduleId || kridaModules[0]?.id);
    setIsFullScreenReaderOpen(true);
  };

  const openEditor = (item: KridaModuleItem) => {
    setEditingKridaModule(item);
    setIsKridaEditorOpen(true);
  };

  const handleSaveKridaModule = (updatedItem: KridaModuleItem) => {
    storage.updateKridaModule(updatedItem, currentUser.name);
    setKridaModules(storage.getKridaModules());
  };

  return (
    <div className="min-h-screen bg-[#080711] text-slate-100 font-sans selection:bg-purple-600 selection:text-white overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#080711]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button type="button" onClick={() => scrollTo('landing-top')} className="flex items-center gap-2.5 min-w-0 cursor-pointer">
            <SakaLogo size={38} id="landing-saka-logo" />
            <div className="text-left min-w-0">
              <div className="font-black text-sm sm:text-base tracking-wide truncate">SAKA <span className="text-purple-400">PARIWISATA</span></div>
              <div className="hidden sm:block text-[9px] uppercase tracking-[.16em] text-slate-500">Kwartir Nasional Gerakan Pramuka</div>
            </div>
          </button>

          <div className="hidden sm:flex items-center gap-1">
            <button type="button" onClick={() => openTool('krida')} className="spwn-home-header-btn" title="Krida & SKK"><Award className="w-4 h-4" /></button>
            {currentUser?.role !== 'PUBLIC' ? (
              <button type="button" onClick={() => onEnterDashboard(currentUser.role === 'MEMBER' ? 'my-card' : 'dashboard')} className="spwn-home-header-btn" title="Dashboard"><LayoutDashboard className="w-4 h-4" /></button>
            ) : (
              <button type="button" onClick={onOpenLoginModal} className="spwn-home-header-btn" title="Masuk"><LockKeyhole className="w-4 h-4" /></button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {currentUser?.role === 'PUBLIC' && (
              <button type="button" onClick={onOpenRegisterModal} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-extrabold cursor-pointer"><UserPlus className="w-3.5 h-3.5" /> Daftar</button>
            )}
            <button type="button" onClick={() => setMobileMenuOpen(v => !v)} className="spwn-home-header-btn sm:hidden" aria-label="Menu">{mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-white/5 bg-[#0d0c18] px-4 py-3 grid grid-cols-3 gap-2">
            {HOME_TOOLS.map(tool => {
              const Icon = tool.icon;
              return <button key={tool.id} type="button" onClick={() => openTool(tool.id)} className="rounded-2xl border border-white/5 bg-white/[.03] p-3 text-center cursor-pointer"><Icon className="w-5 h-5 mx-auto mb-1 text-purple-300" /><span className="text-[10px] font-bold">{tool.label}</span></button>;
            })}
            {currentUser?.role === 'PUBLIC' ? <button type="button" onClick={onOpenLoginModal} className="rounded-2xl border border-white/5 bg-white/[.03] p-3 text-center cursor-pointer"><LockKeyhole className="w-5 h-5 mx-auto mb-1 text-slate-300" /><span className="text-[10px] font-bold">Masuk</span></button> : <button type="button" onClick={() => onEnterDashboard(currentUser.role === 'MEMBER' ? 'my-card' : 'dashboard')} className="rounded-2xl border border-white/5 bg-white/[.03] p-3 text-center cursor-pointer"><LayoutDashboard className="w-5 h-5 mx-auto mb-1 text-slate-300" /><span className="text-[10px] font-bold">Panel</span></button>}
          </div>
        )}
      </header>

      <main id="landing-top">
        <section className="relative px-4 sm:px-6 pt-12 sm:pt-16 pb-10">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,.20),transparent_42%)]" />
          <div className="relative max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[.12em] text-purple-200"><Sparkles className="w-3.5 h-3.5 text-amber-300" /> Ekosistem Digital Saka Pariwisata</div>
            <h1 className="mt-5 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.04]">Kenali. Terhubung. <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-amber-300">Berdaya.</span></h1>
            <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">Semua layanan utama Saka Pariwisata dalam satu tempat. Pilih ikon yang Anda butuhkan — detail akan muncul saat diperlukan.</p>

            <div className="mt-8 grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 max-w-4xl mx-auto">
              {HOME_TOOLS.map(tool => {
                const Icon = tool.icon;
                const active = activeTool === tool.id;
                return <button key={tool.id} type="button" onClick={() => openTool(tool.id)} className={`group rounded-2xl border bg-gradient-to-b p-3 sm:p-4 transition-all cursor-pointer hover:-translate-y-0.5 ${tool.tone} ${active ? 'ring-2 ring-purple-400/60 bg-white/[.07]' : 'bg-white/[.02]'}`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-2 transition-transform group-hover:scale-110" />
                  <div className="text-[10px] sm:text-[11px] font-extrabold text-white">{tool.label}</div>
                  <div className="hidden sm:block text-[9px] text-slate-500 mt-0.5">{tool.hint}</div>
                </button>;
              })}
            </div>
          </div>
        </section>

        <section id="landing-verification" className="scroll-mt-20 px-4 sm:px-6 pb-12">
          <div className="max-w-3xl mx-auto rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[.08] via-[#0d1018] to-purple-500/[.06] p-4 sm:p-6 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 grid place-items-center"><ShieldCheck className="w-5 h-5 text-emerald-300" /></div><div className="text-left"><h2 className="text-sm sm:text-base font-black">Verifikasi KTA / Nomor Anggota</h2><p className="text-[10px] sm:text-xs text-slate-500">Cari berdasarkan nomor anggota, token verifikasi, atau nama.</p></div><span className="ml-auto hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-emerald-500/10 text-emerald-300 text-[9px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Data tersinkron</span></div>
            <form onSubmit={handleQuickVerify} className="flex gap-2">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input value={quickVerifyTerm} onChange={e => setQuickVerifyTerm(e.target.value)} placeholder="Nomor anggota atau nama..." className="w-full h-11 pl-10 pr-3 rounded-xl bg-black/20 border border-white/10 outline-none text-xs sm:text-sm focus:border-purple-500/60" /></div>
              <button type="submit" className="h-11 px-4 sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"><ShieldCheck className="w-4 h-4" /><span className="hidden sm:inline">Verifikasi</span></button>
            </form>
            {verifyError && <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-300">{verifyError}</div>}
          </div>
        </section>

        <section className="px-4 sm:px-6 pb-12">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-2.5 sm:gap-4">
            <div className="rounded-2xl border border-white/5 bg-white/[.025] p-3 sm:p-5 text-center"><Users className="w-4 h-4 mx-auto text-cyan-300 mb-2" /><div className="text-xl sm:text-3xl font-black">{activeMembersCount}</div><div className="text-[9px] sm:text-xs text-slate-500 mt-1">Anggota aktif</div></div>
            <div className="rounded-2xl border border-white/5 bg-white/[.025] p-3 sm:p-5 text-center"><Compass className="w-4 h-4 mx-auto text-amber-300 mb-2" /><div className="text-xl sm:text-3xl font-black">{publishedTours.length}</div><div className="text-[9px] sm:text-xs text-slate-500 mt-1">Paket wisata</div></div>
            <div className="rounded-2xl border border-white/5 bg-white/[.025] p-3 sm:p-5 text-center"><Gift className="w-4 h-4 mx-auto text-rose-300 mb-2" /><div className="text-xl sm:text-3xl font-black">{approvedProducts.length}</div><div className="text-[9px] sm:text-xs text-slate-500 mt-1">Karya produk</div></div>
          </div>
        </section>

        <section id="landing-krida" className="scroll-mt-20 px-4 sm:px-6 py-10 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-5"><div><div className="text-[10px] uppercase tracking-[.16em] text-purple-300 font-black">Pusat pembelajaran</div><h2 className="mt-1 text-2xl sm:text-3xl font-black">4 Krida & SKK</h2><p className="mt-1 text-xs sm:text-sm text-slate-500">Pilih Krida → pilih mata Krida → buka materi atau instrumen uji.</p></div><button type="button" onClick={() => openReader()} className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-purple-300 hover:text-white cursor-pointer">Baca layar penuh <ArrowRight className="w-3.5 h-3.5" /></button></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {KRIDA_CATEGORIES.map(category => {
                const Icon = KRIDA_ICONS[category.id as KridaId] || Award;
                const count = kridaModules.filter(m => m.kridaId === category.id).length;
                return <button key={category.id} type="button" onClick={() => openKrida(category.id as KridaId)} className="text-left rounded-3xl border border-white/7 bg-white/[.025] hover:bg-white/[.05] hover:border-purple-500/30 p-4 sm:p-5 transition-all cursor-pointer group"><div className="flex items-start justify-between"><div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/15 grid place-items-center"><Icon className="w-5 h-5 text-purple-300" /></div><ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-300 transition-transform group-hover:translate-x-0.5" /></div><h3 className="mt-4 text-sm sm:text-base font-black">{category.name}</h3><p className="mt-1 text-[10px] sm:text-xs text-slate-500 line-clamp-2">{category.description}</p><div className="mt-4 text-[9px] font-bold text-purple-300">{count || category.topicsCount} materi</div></button>;
              })}
            </div>
          </div>
        </section>

        <section id="landing-discover" className="scroll-mt-20 px-4 sm:px-6 py-10 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-5"><div><div className="text-[10px] uppercase tracking-[.16em] text-amber-300 font-black">Karya & destinasi</div><h2 className="mt-1 text-2xl sm:text-3xl font-black">Yang sedang tersedia</h2></div><button type="button" onClick={() => onEnterDashboard('culinary-souvenirs')} className="text-xs font-bold text-amber-300 cursor-pointer">Lihat semua <ArrowRight className="inline w-3.5 h-3.5" /></button></div>
            {publishedTours.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">{publishedTours.slice(0, 3).map(tour => <button key={tour.id} type="button" onClick={() => onViewTourDetail(tour)} className="text-left rounded-3xl overflow-hidden border border-white/7 bg-white/[.025] hover:border-amber-500/30 transition-all cursor-pointer group"><div className="h-40 bg-slate-900 overflow-hidden"><img src={formatDriveImageUrl(tour.imageUrl) || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80'} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" referrerPolicy="no-referrer" /></div><div className="p-4"><div className="flex items-center gap-1 text-[9px] text-slate-500"><MapPin className="w-3 h-3" /> {tour.regencyName}, {tour.provinceName}</div><h3 className="mt-2 text-sm font-black line-clamp-2">{tour.title}</h3></div></button>)}</div> : <div className="rounded-2xl border border-white/5 bg-white/[.02] p-5 text-xs text-slate-500 mb-6">Belum ada paket wisata yang dipublikasikan.</div>}
            {approvedProducts.length > 0 && <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{approvedProducts.slice(0, 4).map(item => <button key={item.id} type="button" onClick={() => onSelectCulinaryDetail(item)} className="text-left rounded-2xl overflow-hidden border border-white/7 bg-white/[.025] hover:border-rose-500/30 cursor-pointer"><div className="h-28 sm:h-36 bg-slate-900"><img src={formatDriveImageUrl(item.imageUrl) || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'} alt={item.name} className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" /></div><div className="p-3"><div className="text-[9px] text-rose-300 font-bold">{item.kind === 'KULINER' ? 'KULINER' : 'CINDERAMATA'}</div><h3 className="mt-1 text-xs font-bold line-clamp-2">{item.name}</h3></div></button>)}</div>}
          </div>
        </section>

        <section id="landing-agenda" className="scroll-mt-20 px-4 sm:px-6 py-10 border-t border-white/5">
          <div className="max-w-6xl mx-auto"><div className="flex items-end justify-between mb-5"><div><div className="text-[10px] uppercase tracking-[.16em] text-sky-300 font-black">Aktivitas</div><h2 className="mt-1 text-2xl sm:text-3xl font-black">Agenda Saka</h2></div><button type="button" onClick={() => onEnterDashboard('activities')} className="text-xs font-bold text-sky-300 cursor-pointer">Semua agenda <ArrowRight className="inline w-3.5 h-3.5" /></button></div><div className="rounded-3xl border border-white/5 bg-white/[.015] overflow-hidden"><LandingActivitiesSection activities={upcomingActivities} currentUser={currentUser} onViewActivityDetail={onViewActivityDetail} onOpenActivityForm={onOpenActivityForm} onEnterDashboard={onEnterDashboard} /></div></div>
        </section>

        <section id="landing-members" className="scroll-mt-20 px-4 sm:px-6 py-10 border-t border-white/5">
          <div className="max-w-6xl mx-auto"><CompetentGuidesSection members={members} provinces={PROVINCES_DATA} onOpenVerifyModal={onOpenVerifyModal} theme="dark" title="Anggota & Kompetensi" subtitle="Temukan anggota Saka Pariwisata dan kompetensi yang tersedia di berbagai wilayah." /></div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-4 sm:px-6 py-8 bg-black/20"><div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"><div className="flex items-center gap-2.5"><SakaLogo size={34} id="landing-footer-logo" /><div><div className="text-xs font-black">Saka Pariwisata Indonesia</div><div className="text-[9px] text-slate-600">Kwartir Nasional Gerakan Pramuka</div></div></div><div className="flex items-center gap-2"><button type="button" onClick={onOpenLoginModal} className="p-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white cursor-pointer" title="Masuk"><LockKeyhole className="w-4 h-4" /></button><button type="button" onClick={onOpenRegisterModal} className="p-2.5 rounded-xl border border-white/5 text-slate-400 hover:text-white cursor-pointer" title="Daftar"><UserPlus className="w-4 h-4" /></button></div></div></footer>

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
