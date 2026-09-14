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
    <div className="min-h-screen bg-[#090711] text-slate-100 font-sans selection:bg-fuchsia-500 selection:text-white overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090711]/85 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-3">
          <button type="button" onClick={() => scrollTo('landing-top')} className="flex items-center gap-2.5 min-w-0 cursor-pointer group">
            <div className="shrink-0 rounded-2xl p-0.5 bg-gradient-to-br from-fuchsia-400/60 via-violet-400/40 to-amber-300/50 group-hover:scale-105 transition-transform">
              <div className="rounded-[14px] bg-[#100d1c] p-1"><SakaLogo size={36} id="landing-saka-logo" /></div>
            </div>
            <div className="text-left min-w-0">
              <div className="font-black text-sm sm:text-base tracking-wide truncate">SAKA <span className="text-fuchsia-300">PARIWISATA</span></div>
              <div className="hidden sm:block text-[9px] uppercase tracking-[.18em] text-slate-500">Kwartir Nasional Gerakan Pramuka</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-1 text-[11px] font-bold text-slate-400">
            <button type="button" onClick={() => scrollTo('landing-krida')} className="px-3 py-2 rounded-xl hover:bg-white/[.06] hover:text-white cursor-pointer">Eksplorasi</button>
            <button type="button" onClick={() => scrollTo('landing-discover')} className="px-3 py-2 rounded-xl hover:bg-white/[.06] hover:text-white cursor-pointer">Destinasi</button>
            <button type="button" onClick={() => scrollTo('landing-agenda')} className="px-3 py-2 rounded-xl hover:bg-white/[.06] hover:text-white cursor-pointer">Agenda</button>
          </nav>

          <div className="flex items-center gap-1.5">
            {currentUser?.role === 'PUBLIC' ? (
              <>
                <button type="button" onClick={onOpenLoginModal} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/[.04] hover:bg-white/[.08] text-slate-200 text-[11px] font-extrabold cursor-pointer"><LockKeyhole className="w-3.5 h-3.5" /> Masuk</button>
                <button type="button" onClick={onOpenRegisterModal} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white text-[11px] font-extrabold shadow-lg shadow-fuchsia-900/20 cursor-pointer"><UserPlus className="w-3.5 h-3.5" /> Daftar</button>
              </>
            ) : (
              <button type="button" onClick={() => onEnterDashboard(currentUser.role === 'MEMBER' ? 'my-card' : 'dashboard')} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/[.04] hover:bg-white/[.08] text-slate-200 text-[11px] font-extrabold cursor-pointer"><LayoutDashboard className="w-3.5 h-3.5" /> Panel</button>
            )}
            <button type="button" onClick={() => setMobileMenuOpen(v => !v)} className="spwn-home-header-btn md:hidden" aria-label="Menu">{mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0d0b17] px-4 py-3 grid grid-cols-3 gap-2">
            {[
              { label: 'Eksplorasi', icon: Compass, id: 'landing-krida' },
              { label: 'Destinasi', icon: MapPin, id: 'landing-discover' },
              { label: 'Agenda', icon: CalendarDays, id: 'landing-agenda' },
            ].map(item => {
              const Icon = item.icon;
              return <button key={item.id} type="button" onClick={() => scrollTo(item.id)} className="rounded-2xl border border-white/10 bg-white/[.04] p-3 text-center cursor-pointer hover:bg-white/[.08]"><Icon className="w-5 h-5 mx-auto mb-1 text-fuchsia-300" /><span className="text-[10px] font-bold">{item.label}</span></button>;
            })}
            <button type="button" onClick={() => openTool('verify')} className="rounded-2xl border border-white/10 bg-white/[.04] p-3 text-center cursor-pointer hover:bg-white/[.08]"><ShieldCheck className="w-5 h-5 mx-auto mb-1 text-emerald-300" /><span className="text-[10px] font-bold">Verifikasi</span></button>
            {currentUser?.role === 'PUBLIC' ? <button type="button" onClick={onOpenLoginModal} className="rounded-2xl border border-white/10 bg-white/[.04] p-3 text-center cursor-pointer hover:bg-white/[.08]"><LockKeyhole className="w-5 h-5 mx-auto mb-1 text-slate-300" /><span className="text-[10px] font-bold">Masuk</span></button> : <button type="button" onClick={() => onEnterDashboard(currentUser.role === 'MEMBER' ? 'my-card' : 'dashboard')} className="rounded-2xl border border-white/10 bg-white/[.04] p-3 text-center cursor-pointer hover:bg-white/[.08]"><LayoutDashboard className="w-5 h-5 mx-auto mb-1 text-slate-300" /><span className="text-[10px] font-bold">Panel</span></button>}
            {currentUser?.role === 'PUBLIC' && <button type="button" onClick={onOpenRegisterModal} className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-3 text-center cursor-pointer hover:bg-fuchsia-500/15"><UserPlus className="w-5 h-5 mx-auto mb-1 text-fuchsia-300" /><span className="text-[10px] font-bold">Daftar</span></button>}
          </div>
        )}
      </header>

      <main id="landing-top">
        <section className="relative px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-16 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[520px] rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
          <div className="absolute top-24 -left-40 w-72 h-72 rounded-full bg-fuchsia-500/10 blur-3xl pointer-events-none" />
          <div className="absolute top-16 -right-40 w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-6xl mx-auto grid lg:grid-cols-[1.08fr_.92fr] items-center gap-10 lg:gap-14">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.045] px-3.5 py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[.14em] text-fuchsia-200 shadow-lg shadow-black/10"><Sparkles className="w-3.5 h-3.5 text-amber-300" /> Digital Youth Tourism Community</div>
              <h1 className="mt-5 text-[2.65rem] sm:text-5xl lg:text-[4.6rem] font-black tracking-[-.045em] leading-[.98]">Jelajahi.<br /><span className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-amber-200 bg-clip-text text-transparent">Berkarya.</span></h1>
              <p className="mt-5 max-w-xl mx-auto lg:mx-0 text-sm sm:text-base text-slate-400 leading-relaxed">Temukan Krida, kenali destinasi, bagikan karya, bersama Saka Pariwisata.</p>
              <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5">
                <button type="button" onClick={() => scrollTo('landing-krida')} className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-500 hover:to-fuchsia-400 text-white text-xs font-black shadow-xl shadow-violet-950/30 cursor-pointer">Mulai Eksplorasi <ArrowRight className="w-4 h-4" /></button>
                <button type="button" onClick={() => openTool('verify')} className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 border border-white/10 bg-white/[.04] hover:bg-white/[.08] text-slate-200 text-xs font-black cursor-pointer"><ShieldCheck className="w-4 h-4 text-emerald-300" /> Verifikasi KTA</button>
              </div>
              <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-2 text-[9px] font-bold text-slate-500">
                <span className="px-2.5 py-1.5 rounded-full bg-white/[.035] border border-white/[.07]">🧭 Explore</span><span className="px-2.5 py-1.5 rounded-full bg-white/[.035] border border-white/[.07]">📚 Learn</span><span className="px-2.5 py-1.5 rounded-full bg-white/[.035] border border-white/[.07]">🎯 Create</span><span className="px-2.5 py-1.5 rounded-full bg-white/[.035] border border-white/[.07]">🤝 Connect</span>
              </div>
            </div>

            <div className="relative max-w-md w-full mx-auto lg:ml-auto">
              <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-fuchsia-500/15 via-violet-500/10 to-amber-300/10 blur-2xl" />
              <div className="relative rounded-[2rem] border border-white/10 bg-white/[.055] p-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="rounded-[1.6rem] border border-white/10 bg-[#110d1d] p-5 sm:p-6 overflow-hidden">
                  <div className="flex items-center justify-between"><div><div className="text-[9px] uppercase tracking-[.16em] text-fuchsia-300 font-black">Explore your path</div><div className="mt-1 text-lg font-black">Pilih dunia yang ingin kamu kuasai.</div></div><div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 to-amber-300/10 border border-white/10 grid place-items-center"><Compass className="w-5 h-5 text-amber-200" /></div></div>
                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    {KRIDA_CATEGORIES.map((category, index) => {
                      const Icon = KRIDA_ICONS[category.id as KridaId] || Award;
                      const count = kridaModules.filter(m => m.kridaId === category.id).length;
                      const accents = ['from-violet-500/20 to-fuchsia-500/5', 'from-sky-500/20 to-cyan-500/5', 'from-amber-500/20 to-orange-500/5', 'from-rose-500/20 to-pink-500/5'];
                      return <button key={category.id} type="button" onClick={() => openKrida(category.id as KridaId)} className={`text-left rounded-2xl border border-white/10 bg-gradient-to-br ${accents[index % accents.length]} p-3.5 hover:-translate-y-0.5 hover:border-white/20 transition-all cursor-pointer`}><div className="w-9 h-9 rounded-xl bg-black/15 border border-white/10 grid place-items-center"><Icon className="w-4 h-4 text-white" /></div><div className="mt-3 text-[11px] font-black text-white">{category.name}</div><div className="mt-1 text-[9px] text-slate-500">{count || category.topicsCount} materi</div></button>;
                    })}
                  </div>
                  <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.035] p-3 flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-8 h-8 rounded-xl bg-emerald-500/10 grid place-items-center"><Users className="w-4 h-4 text-emerald-300" /></span><div><div className="text-[10px] font-bold text-white">Komunitas aktif</div><div className="text-[9px] text-slate-500">Temukan kompetensi di berbagai wilayah</div></div></div><span className="text-sm font-black text-emerald-300">{activeMembersCount}</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 pb-8">
          <div className="max-w-6xl mx-auto grid grid-cols-3 gap-2.5 sm:gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-3 sm:p-4 text-center hover:bg-white/[.05] transition-colors"><Users className="w-4 h-4 mx-auto text-cyan-300 mb-2" /><div className="text-xl sm:text-2xl font-black">{activeMembersCount}</div><div className="text-[8px] sm:text-[10px] text-slate-500 mt-1">Anggota aktif</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-3 sm:p-4 text-center hover:bg-white/[.05] transition-colors"><Compass className="w-4 h-4 mx-auto text-amber-300 mb-2" /><div className="text-xl sm:text-2xl font-black">{publishedTours.length}</div><div className="text-[8px] sm:text-[10px] text-slate-500 mt-1">Paket wisata</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-3 sm:p-4 text-center hover:bg-white/[.05] transition-colors"><Gift className="w-4 h-4 mx-auto text-rose-300 mb-2" /><div className="text-xl sm:text-2xl font-black">{approvedProducts.length}</div><div className="text-[8px] sm:text-[10px] text-slate-500 mt-1">Karya produk</div></div>
          </div>
        </section>

        <section id="landing-verification" className="scroll-mt-20 px-4 sm:px-6 py-8 sm:py-10">
          <div className="max-w-4xl mx-auto rounded-[2rem] border border-emerald-400/15 bg-gradient-to-br from-emerald-500/[.08] via-white/[.035] to-violet-500/[.06] p-4 sm:p-6 shadow-2xl shadow-black/20">
            <div className="flex items-start gap-3 mb-4"><div className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-500/10 border border-emerald-400/15 grid place-items-center"><ShieldCheck className="w-5 h-5 text-emerald-300" /></div><div className="min-w-0"><div className="text-[9px] uppercase tracking-[.15em] text-emerald-300 font-black">Identity check</div><h2 className="mt-1 text-base sm:text-lg font-black">Verifikasi KTA / Nomor Anggota</h2><p className="mt-1 text-[10px] sm:text-xs text-slate-500">Cari berdasarkan nomor anggota, token verifikasi, atau nama.</p></div><span className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 bg-emerald-500/10 text-emerald-300 text-[9px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Tersinkron</span></div>
            <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row gap-2.5"><div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input value={quickVerifyTerm} onChange={e => setQuickVerifyTerm(e.target.value)} placeholder="Nomor anggota atau nama..." className="w-full h-12 pl-10 pr-3.5 rounded-2xl bg-black/20 border border-white/10 outline-none text-xs sm:text-sm focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/5" /></div><button type="submit" className="h-12 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"><ShieldCheck className="w-4 h-4" /> Verifikasi</button></form>
            {verifyError && <div className="mt-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-2.5 text-[11px] text-amber-300">{verifyError}</div>}
          </div>
        </section>

        <section id="landing-krida" className="scroll-mt-20 px-4 sm:px-6 py-12 sm:py-16 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-6"><div><div className="text-[9px] uppercase tracking-[.18em] text-fuchsia-300 font-black">Explore your skill</div><h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight">4 Krida. Banyak kemungkinan.</h2><p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl">Pilih Krida → pilih SKK → buka materi. Dibuat ringkas agar mudah dijelajahi dari ponsel.</p></div><button type="button" onClick={() => openReader()} className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-fuchsia-300 hover:text-white cursor-pointer">Baca layar penuh <ArrowRight className="w-3.5 h-3.5" /></button></div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {KRIDA_CATEGORIES.map((category, index) => {
                const Icon = KRIDA_ICONS[category.id as KridaId] || Award;
                const count = kridaModules.filter(m => m.kridaId === category.id).length;
                const accents = ['from-violet-600/25 via-fuchsia-500/10 to-transparent', 'from-sky-600/25 via-cyan-500/10 to-transparent', 'from-amber-500/25 via-orange-500/10 to-transparent', 'from-rose-500/25 via-pink-500/10 to-transparent'];
                return <button key={category.id} type="button" onClick={() => openKrida(category.id as KridaId)} className={`text-left rounded-[1.6rem] border border-white/10 bg-gradient-to-br ${accents[index % accents.length]} p-4 sm:p-5 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-black/20 transition-all cursor-pointer group`}><div className="flex items-start justify-between"><div className="w-12 h-12 rounded-2xl bg-black/15 border border-white/10 grid place-items-center group-hover:scale-105 transition-transform"><Icon className="w-5 h-5 text-white" /></div><ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" /></div><div className="mt-5 text-[9px] uppercase tracking-[.14em] text-white/50 font-black">Krida 0{index + 1}</div><h3 className="mt-1 text-sm sm:text-lg font-black">{category.name}</h3><p className="mt-1.5 text-[10px] sm:text-xs text-slate-400 leading-relaxed line-clamp-2">{category.description}</p><div className="mt-4 inline-flex items-center rounded-full bg-black/15 border border-white/10 px-2.5 py-1 text-[9px] font-bold text-white/70">{count || category.topicsCount} materi</div></button>;
              })}
            </div>
          </div>
        </section>

        <section id="landing-discover" className="scroll-mt-20 px-4 sm:px-6 py-12 sm:py-16 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between gap-4 mb-6"><div><div className="text-[9px] uppercase tracking-[.18em] text-amber-300 font-black">Discover Indonesia</div><h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight">Destinasi & karya</h2><p className="mt-2 text-xs sm:text-sm text-slate-500">Lihat apa yang sedang tersedia dari ekosistem Saka Pariwisata.</p></div><button type="button" onClick={() => onEnterDashboard('culinary-souvenirs')} className="text-xs font-bold text-amber-300 hover:text-white cursor-pointer whitespace-nowrap">Lihat semua <ArrowRight className="inline w-3.5 h-3.5" /></button></div>
            {publishedTours.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-7">{publishedTours.slice(0, 3).map(tour => <button key={tour.id} type="button" onClick={() => onViewTourDetail(tour)} className="text-left rounded-[1.5rem] overflow-hidden border border-white/10 bg-white/[.035] hover:bg-white/[.055] hover:border-amber-400/30 hover:-translate-y-1 transition-all cursor-pointer group"><div className="h-44 sm:h-48 bg-slate-900 overflow-hidden relative"><img src={formatDriveImageUrl(tour.imageUrl) || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&auto=format&fit=crop&q=80'} alt={tour.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" referrerPolicy="no-referrer" /><div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" /><div className="absolute left-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 text-[9px] text-white"><MapPin className="w-3 h-3" /> {tour.regencyName}, {tour.provinceName}</div></div><div className="p-4"><h3 className="text-sm font-black line-clamp-2">{tour.title}</h3><div className="mt-2 text-[9px] font-bold text-amber-300">Jelajahi paket →</div></div></button>)}</div> : <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5 text-xs text-slate-500 mb-6">Belum ada paket wisata yang dipublikasikan.</div>}
            {approvedProducts.length > 0 && <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{approvedProducts.slice(0, 4).map(item => <button key={item.id} type="button" onClick={() => onSelectCulinaryDetail(item)} className="text-left rounded-[1.25rem] overflow-hidden border border-white/10 bg-white/[.035] hover:bg-white/[.055] hover:border-rose-400/30 hover:-translate-y-0.5 transition-all cursor-pointer"><div className="h-32 sm:h-40 bg-slate-900"><img src={formatDriveImageUrl(item.imageUrl) || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'} alt={item.name} className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" /></div><div className="p-3.5"><div className="text-[8px] uppercase tracking-[.12em] text-rose-300 font-black">{item.kind === 'KULINER' ? 'Kuliner' : 'Cinderamata'}</div><h3 className="mt-1 text-xs font-bold line-clamp-2">{item.name}</h3></div></button>)}</div>}
          </div>
        </section>

        <section id="landing-agenda" className="scroll-mt-20 px-4 sm:px-6 py-12 sm:py-16 border-t border-white/10">
          <div className="max-w-6xl mx-auto"><div className="flex items-end justify-between gap-4 mb-6"><div><div className="text-[9px] uppercase tracking-[.18em] text-sky-300 font-black">What’s happening</div><h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight">Agenda Saka</h2></div><button type="button" onClick={() => onEnterDashboard('activities')} className="text-xs font-bold text-sky-300 hover:text-white cursor-pointer whitespace-nowrap">Semua agenda <ArrowRight className="inline w-3.5 h-3.5" /></button></div><div className="rounded-[1.6rem] border border-white/10 bg-white/[.025] overflow-hidden"><LandingActivitiesSection activities={upcomingActivities} currentUser={currentUser} onViewActivityDetail={onViewActivityDetail} onOpenActivityForm={onOpenActivityForm} onEnterDashboard={onEnterDashboard} /></div></div>
        </section>

        <section id="landing-members" className="scroll-mt-20 px-4 sm:px-6 py-12 sm:py-16 border-t border-white/10">
          <div className="max-w-6xl mx-auto"><CompetentGuidesSection members={members} provinces={PROVINCES_DATA} onOpenVerifyModal={onOpenVerifyModal} theme="dark" title="Komunitas & Kompetensi" subtitle="Temukan anggota Saka Pariwisata dan kompetensi yang tersedia di berbagai wilayah Indonesia." /></div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 sm:px-6 py-8 bg-black/20"><div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4"><div className="flex items-center gap-2.5"><SakaLogo size={34} id="landing-footer-logo" /><div><div className="text-xs font-black">Saka Pariwisata Indonesia</div><div className="text-[9px] text-slate-600">Kwartir Nasional Gerakan Pramuka</div></div></div><div className="flex items-center gap-2"><button type="button" onClick={onOpenLoginModal} className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/[.05] cursor-pointer" title="Masuk"><LockKeyhole className="w-4 h-4" /></button><button type="button" onClick={onOpenRegisterModal} className="p-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/[.05] cursor-pointer" title="Daftar"><UserPlus className="w-4 h-4" /></button></div></div></footer>

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
