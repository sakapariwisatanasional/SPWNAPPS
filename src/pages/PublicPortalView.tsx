import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  QrCode, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  ExternalLink,
  Sparkles,
  Award,
  UserPlus,
  ArrowRight,
  Filter,
  Calendar,
  Users,
  Star,
  Check,
  BadgeCheck,
  ChevronRight,
  BookOpen,
  Send,
  Camera,
  ScanLine,
  RefreshCw,
  Database
} from 'lucide-react';
import { Member, TourPackage, Skill } from '../types';
import { TourPackageCard } from '../components/tourism/TourPackageCard';
import { SakaLogo } from '../components/common/SakaLogo';
import { MASTER_SKILLS } from '../data/initialData';
import { IntegratedTourismShowcaseGallery } from '../components/dashboard/IntegratedTourismShowcaseGallery';
import { storage } from '../services/storage';
import { verifyMemberUniversal, VerificationResult, normalizeNtaQuery } from '../services/ktaVerificationService';
import { KtaBarcodeScannerModal } from '../components/member/KtaBarcodeScannerModal';

interface PublicPortalViewProps {
  members: Member[];
  tours: TourPackage[];
  skills?: Skill[];
  onOpenRegisterModal: () => void;
  onOpenVerifyModal: (member: Member) => void;
  onViewTourDetail: (tour: TourPackage) => void;
  onSelectTab?: (tab: string) => void;
}

export const PublicPortalView: React.FC<PublicPortalViewProps> = ({
  members,
  tours,
  skills = MASTER_SKILLS,
  onOpenRegisterModal,
  onOpenVerifyModal,
  onViewTourDetail,
  onSelectTab
}) => {
  // --- Verification State ---
  const [verifyInput, setVerifyInput] = useState('');
  const [searchedMember, setSearchedMember] = useState<Member | null>(null);
  const [verificationMeta, setVerificationMeta] = useState<VerificationResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [notFoundMessage, setNotFoundMessage] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // --- Tour Packages State ---
  const [tourCategoryFilter, setTourCategoryFilter] = useState<string>('ALL');
  const [tourSearchQuery, setTourSearchQuery] = useState<string>('');

  // --- Skill / Talent Pool State ---
  const [talentSearchQuery, setTalentSearchQuery] = useState<string>('');
  const [talentCategoryFilter, setTalentCategoryFilter] = useState<string>('ALL');
  const [talentSkillFilter, setTalentSkillFilter] = useState<string>('ALL');

  // Perform universal verification
  const executeVerification = async (termToVerify: string) => {
    const term = termToVerify.trim();
    if (!term) return;

    setIsVerifying(true);
    setNotFound(false);
    setNotFoundMessage('');
    setSearchedMember(null);
    setVerificationMeta(null);

    try {
      const result = await verifyMemberUniversal(term, members);
      setIsVerifying(false);
      setVerificationMeta(result);

      if (result.found && result.member) {
        setSearchedMember(result.member);
        setNotFound(false);
      } else {
        setSearchedMember(null);
        setNotFound(true);
        setNotFoundMessage(
          result.message || 'Nomor Anggota Tidak Ditemukan. Pastikan nomor anggota yang dimasukkan benar dan sesuai dengan format resmi Kwartir.'
        );
      }
    } catch (e: any) {
      setIsVerifying(false);
      setNotFound(true);
      setNotFoundMessage('Terjadi kesalahan saat memverifikasi data anggota.');
    }
  };

  // Auto-check URL parameters on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlVerifyId = urlParams.get('verifyId') || urlParams.get('nta') || urlParams.get('id') || urlParams.get('kta');
      if (urlVerifyId) {
        const term = urlVerifyId.trim();
        setVerifyInput(term);
        executeVerification(term);
      }
    } catch (e) {
      console.warn('URL verify param error', e);
    }
  }, [members]);

  // Verify Handler
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    executeVerification(verifyInput);
  };

  // Filtered Tours
  const filteredTours = useMemo(() => {
    return tours.filter(t => {
      if (t.status !== 'APPROVED_PUBLISHED') return false;
      const matchCat = tourCategoryFilter === 'ALL' || t.category === tourCategoryFilter;
      const q = tourSearchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        t.title.toLowerCase().includes(q) ||
        t.locationName.toLowerCase().includes(q) ||
        t.provinceName.toLowerCase().includes(q) ||
        t.regencyName.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [tours, tourCategoryFilter, tourSearchQuery]);

  // Extract unique tour categories
  const tourCategories = useMemo(() => {
    const cats = new Set<string>();
    tours.forEach(t => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats);
  }, [tours]);

  // Skill Categories
  const skillCategories = useMemo(() => {
    return Array.from(new Set(skills.map(s => s.category)));
  }, [skills]);

  // Filtered Talents
  const filteredTalents = useMemo(() => {
    return members.filter(m => {
      if (m.status !== 'ACTIVE') return false;
      if (!m.skills || m.skills.length === 0) return false;

      const q = talentSearchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        m.fullName.toLowerCase().includes(q) ||
        (m.skills && m.skills.some(s => s.skillName.toLowerCase().includes(q))) ||
        (m.provinceName && m.provinceName.toLowerCase().includes(q)) ||
        (m.regencyName && m.regencyName.toLowerCase().includes(q)) ||
        (m.currentPosition && m.currentPosition.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (talentCategoryFilter !== 'ALL') {
        const hasCat = m.skills.some(s => s.category === talentCategoryFilter);
        if (!hasCat) return false;
      }

      if (talentSkillFilter !== 'ALL') {
        const hasSkill = m.skills.some(s => s.skillId === talentSkillFilter);
        if (!hasSkill) return false;
      }

      return true;
    });
  }, [members, talentSearchQuery, talentCategoryFilter, talentSkillFilter]);

  const activeTalentCount = members.filter(m => m.status === 'ACTIVE' && m.skills && m.skills.length > 0).length;

  return (
    <div className="space-y-12 pb-20">
      {/* 1. HERO BANNER: Portal Publik Saka Pariwisata */}
      <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-purple-900/50 relative overflow-hidden">
        {/* Ambient Glow Background & Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <SakaLogo size={320} />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-5 z-10 relative">
          <div className="flex justify-center mb-1">
            <SakaLogo size={74} id="portal-hero-logo" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/20 border border-purple-400/40 rounded-full text-purple-200 text-xs font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <span>Portal Publik Resmi Saka Pariwisata Kwartir Nasional Gerakan Pramuka</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-heading tracking-tight text-white leading-tight">
            Eksplorasi Pariwisata & Direktori Talenta Pramuka
          </h1>

          <p className="text-xs sm:text-base text-purple-100/80 max-w-2xl mx-auto leading-relaxed">
            Temukan paket wisata komunitas edukatif binaan Saka Pariwisata, hubungi pemandu dan talenta bersertifikasi BNSP, serta daftarkan diri Anda menjadi anggota baru Saka Pariwisata.
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenRegisterModal}
              className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftar Anggota Baru</span>
            </button>

            <a
              href="#paket-wisata"
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-purple-300" />
              <span>Paket Wisata</span>
            </a>

            <a
              href="#talent-pool"
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-purple-300" />
              <span>Direktori Keahlian</span>
            </a>

            <a
              href="#verifikasi-kta"
              className="px-5 py-3.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-bold rounded-2xl text-xs sm:text-sm border border-purple-500/40 transition-all cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-purple-300" />
              <span>Verifikasi KTA</span>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-purple-800/40 mt-6">
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                {tours.filter(t => t.status === 'APPROVED_PUBLISHED').length}
              </p>
              <p className="text-[11px] text-purple-200/70 font-medium">Paket Wisata Aktif</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                {activeTalentCount}
              </p>
              <p className="text-[11px] text-purple-200/70 font-medium">Talenta Tersertifikasi</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                38+
              </p>
              <p className="text-[11px] text-purple-200/70 font-medium">Kwartir Daerah</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-extrabold text-white font-heading">
                100%
              </p>
              <p className="text-[11px] text-purple-200/70 font-medium">KTA Digital Resmi</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REGISTRATION CALL-TO-ACTION BANNER: Pilihan Mendaftar Anggota Baru */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-purple-700/60 shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 rounded-full text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Penerimaan Anggota Baru Terbuka</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-heading text-white">
              Bergabung Menjadi Anggota Saka Pariwisata
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Tingkatkan wawasan kepariwisataan, raih sertifikasi kompetensi pemandu wisata BNSP, dan dapatkan <strong>Kartu Tanda Anggota (KTA) Digital Resmi Ber-QR Code</strong> yang diakui secara nasional.
            </p>
            
            {/* 3 Keuntungan Utama */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-left">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl text-xs border border-white/10">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-100 font-medium">KTA Digital Standar ISO</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl text-xs border border-white/10">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-100 font-medium">Pelatihan 4 Krida Khusus</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-2 rounded-xl text-xs border border-white/10">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-slate-100 font-medium">Jejaring Pemandu 38 Kwarda</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-full sm:w-auto text-center">
            <button
              onClick={onOpenRegisterModal}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-2xl text-sm shadow-xl shadow-emerald-950 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 group"
            >
              <UserPlus className="w-5 h-5 text-slate-950" />
              <span>Daftar Anggota Baru Sekarang</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[11px] text-purple-200/70 mt-2">
              Proses pendaftaran cepat & gratis secara online
            </p>
          </div>
        </div>
      </div>

      {/* 2.5 GALERI TERPADU CERDAS SAKA PARIWISATA: Destinasi, Produk 4 Krida & Rekomendasi Pemandu Wilayah */}
      <section id="galeri-unggulan" className="scroll-mt-6">
        <IntegratedTourismShowcaseGallery
          tours={tours}
          products={storage.getCulinarySouvenirs()}
          members={members}
          currentUser={{
            id: 'public-guest',
            username: 'wisatawan',
            email: 'wisatawan@publik.id',
            name: 'Wisatawan Nusantara',
            role: 'MEMBER',
            jurisdictionName: 'Publik'
          }}
          onViewTourDetail={onViewTourDetail}
          onSelectMember={onOpenVerifyModal}
          onSelectTab={onSelectTab}
        />
      </section>

      {/* 3. SECTION 1: PAKET WISATA KOMUNITAS */}
      <section id="paket-wisata" className="space-y-6 pt-4 scroll-mt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Katalog Wisata Edukatif</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 mt-1">
              Paket Wisata Binaan Saka Pariwisata
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Destinasi pilihan yang dikembangkan oleh anggota Saka Pariwisata bersama masyarakat desa wisata
            </p>
          </div>

          {/* Quick Search for Tours */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2 w-full md:w-80 shadow-xs focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={tourSearchQuery}
              onChange={(e) => setTourSearchQuery(e.target.value)}
              placeholder="Cari paket wisata, desa, daerah..."
              className="bg-transparent outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
            />
            {tourSearchQuery && (
              <button 
                onClick={() => setTourSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tour Categories Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setTourCategoryFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              tourCategoryFilter === 'ALL'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua Paket ({tours.filter(t => t.status === 'APPROVED_PUBLISHED').length})
          </button>
          {tourCategories.map((cat) => {
            const count = tours.filter(t => t.status === 'APPROVED_PUBLISHED' && t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setTourCategoryFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  tourCategoryFilter === cat
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Tour Packages Cards Grid */}
        {filteredTours.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
            <Compass className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-2" />
            <p className="font-bold text-slate-700 text-sm">Tidak ada paket wisata yang cocok.</p>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci lain atau pilih kategori Semua Paket.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => (
              <TourPackageCard
                key={tour.id}
                tour={tour}
                onViewDetail={onViewTourDetail}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. SECTION 2: DIREKTORI KEAHLIAN & TALENT POOL PARIWISATA */}
      <section id="talent-pool" className="space-y-6 pt-4 scroll-mt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Pangkalan Data Kompetensi Resmi</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 mt-1">
              Direktori Keahlian & Talent Pool Pariwisata
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar pemandu wisata, fotografer, penyuluh, dan praktisi kepariwisataan anggota Saka Pariwisata bersertifikasi
            </p>
          </div>
        </div>

        {/* Talent Filters */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Search Input */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={talentSearchQuery}
                onChange={(e) => setTalentSearchQuery(e.target.value)}
                placeholder="Cari nama talenta, keahlian, kota..."
                className="bg-transparent outline-none w-full text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={talentCategoryFilter}
                onChange={(e) => {
                  setTalentCategoryFilter(e.target.value);
                  setTalentSkillFilter('ALL');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none font-medium text-slate-700 focus:border-emerald-500"
              >
                <option value="ALL">Semua Kategori Bidang</option>
                {skillCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Specific Skill Dropdown */}
            <div>
              <select
                value={talentSkillFilter}
                onChange={(e) => setTalentSkillFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none font-medium text-slate-700 focus:border-emerald-500"
              >
                <option value="ALL">Semua Jenis Keahlian Khusus</option>
                {skills
                  .filter(s => talentCategoryFilter === 'ALL' || s.category === talentCategoryFilter)
                  .map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Talents Grid */}
        {filteredTalents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
            <Award className="w-12 h-12 mx-auto text-slate-300 stroke-1 mb-2" />
            <p className="font-bold text-slate-700 text-sm">Tidak ada talenta keahlian yang cocok.</p>
            <p className="text-xs text-slate-400 mt-1">Coba gunakan filter kategori lain atau reset kata pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalents.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Header Profile */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900 truncate font-heading">
                          {member.fullName}
                        </h4>
                        <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" title="Anggota Terverifikasi" />
                      </div>
                      <p className="text-[11px] font-mono font-bold text-purple-700 truncate">
                        {member.nationalMemberNumber || 'Anggota Resmi'}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-700 truncate mt-0.5">
                        {member.currentPosition || 'Anggota Saka Pariwisata'}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {member.provinceId === '00' || member.provinceName?.toLowerCase().includes('nasional')
                          ? 'Kwartir Nasional'
                          : (member.regencyName ? `Kwarcab ${member.regencyName}` : `Kwarda ${member.provinceName}`)}
                      </p>
                    </div>
                  </div>

                  {/* Skills List */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Kompetensi & Keahlian:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {member.skills?.map((s) => (
                        <span
                          key={s.id}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold"
                        >
                          {s.skillName}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications if any */}
                  {member.certifications && member.certifications.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Sertifikasi Resmi:
                      </p>
                      <div className="space-y-1">
                        {member.certifications.slice(0, 2).map((cert) => (
                          <div key={cert.id} className="text-[10px] text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            <Award className="w-3 h-3 text-purple-600 flex-shrink-0" />
                            <span className="truncate font-medium">{cert.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Krida: <strong className="text-slate-600">{member.krida || 'Krida Pemandu'}</strong>
                  </span>
                  <button
                    onClick={() => onOpenVerifyModal(member)}
                    className="px-3.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold rounded-xl text-xs border border-purple-200 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Verifikasi KTA</span>
                    <ExternalLink className="w-3 h-3 text-purple-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. SECTION 3: VERIFIKASI KEANGGOTAAN SAKA PARIWISATA */}
      <section id="verifikasi-kta" className="space-y-6 pt-4 scroll-mt-6">
        <div className="bg-gradient-to-br from-slate-900 to-purple-950 rounded-3xl p-6 sm:p-10 text-white border border-purple-800/60 shadow-xl space-y-6">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/40 rounded-full text-purple-200 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-purple-300" />
              <span>Verifikasi Keabsahan KTA Digital & Fisik</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold font-heading text-white">
              Cek Keaslian Kartu Tanda Anggota (NTA)
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              Ketik Nomor Anggota Nasional (misal: <code className="bg-purple-950 px-2 py-0.5 rounded text-purple-200 font-mono">00.00.00.000001</code> atau <code className="bg-purple-950 px-2 py-0.5 rounded text-purple-200 font-mono">32.06.12.000123</code>) untuk memastikan keaslian anggota.
            </p>

            {/* Search Input Form */}
            <div className="pt-2 max-w-lg mx-auto space-y-2">
              <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 px-4 py-3 flex items-center gap-3 text-white focus-within:bg-white/20 focus-within:border-purple-400 transition-all">
                  <QrCode className="w-5 h-5 text-purple-300 flex-shrink-0" />
                  <input
                    type="text"
                    value={verifyInput}
                    onChange={(e) => setVerifyInput(e.target.value)}
                    placeholder="Ketik Nomor Anggota / NTA / Token..."
                    className="bg-transparent outline-none w-full text-xs sm:text-sm placeholder:text-purple-200/50 font-mono text-white"
                  />
                  {verifyInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setVerifyInput('');
                        setSearchedMember(null);
                        setNotFound(false);
                      }}
                      className="text-purple-300 hover:text-white text-xs font-bold px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 disabled:opacity-50 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-lg shadow-purple-950 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memeriksa...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Verifikasi</span>
                    </>
                  )}
                </button>
              </form>

              {/* Camera Scanner Button */}
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 rounded-xl text-purple-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>📷 Pindai Kamera Barcode / QR Code KTA</span>
                </button>
              </div>
            </div>

            {/* Quick Demo Autofill Suggestions */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-purple-200/60">
              <span>Coba cepat:</span>
              {members.slice(0, 4).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    const term = m.nationalMemberNumber || m.verificationToken || m.id;
                    setVerifyInput(term);
                    executeVerification(term);
                  }}
                  className="font-mono text-purple-200 hover:underline bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800 text-[10px] cursor-pointer"
                >
                  {m.nationalMemberNumber} ({m.fullName.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {isVerifying && (
            <div className="p-6 bg-purple-900/40 border border-purple-500/40 rounded-3xl max-w-md mx-auto text-center space-y-2 text-white">
              <RefreshCw className="w-8 h-8 text-purple-300 animate-spin mx-auto" />
              <p className="font-bold text-sm text-purple-200">
                Memverifikasi Data KTA...
              </p>
              <p className="text-xs text-purple-300/80">
                Mengecek kecocokan di database lokal dan Google Spreadsheet
              </p>
            </div>
          )}

          {/* Verification Result Card */}
          {searchedMember && !isVerifying && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 text-slate-900 shadow-2xl max-w-2xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs sm:text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>DATA ANGGOTA VALID & RESMI TERDAFTAR</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {verificationMeta?.source === 'GOOGLE_SPREADSHEET' && (
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-900 font-extrabold text-[10px] rounded-full border border-blue-200 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      GOOGLE SHEETS
                    </span>
                  )}
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-extrabold text-[10px] rounded-full border border-emerald-200">
                    KTA AKTIF
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <img
                  src={searchedMember.avatarUrl}
                  alt={searchedMember.fullName}
                  className="w-24 h-28 object-cover rounded-2xl border-2 border-purple-500 shadow-md"
                />
                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-heading">
                    {searchedMember.fullName}
                  </h3>
                  <div className="bg-purple-50 inline-block px-3 py-1 rounded-lg border border-purple-200 text-purple-950 font-mono font-bold text-xs">
                    NTA: {searchedMember.nationalMemberNumber || 'Dalam Proses'}
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Jabatan: {searchedMember.currentPosition || 'Anggota Saka Pariwisata'}
                  </p>
                  <p className="text-xs text-slate-600">
                    Pangkalan: <strong className="text-slate-800">{searchedMember.branchName}</strong>
                  </p>
                  <p className="text-xs text-slate-500">
                    {searchedMember.provinceId === '00' || searchedMember.provinceName?.toLowerCase().includes('nasional')
                      ? 'Kwartir Nasional Gerakan Pramuka'
                      : `Kwartir Cabang ${searchedMember.regencyName}, Kwarda ${searchedMember.provinceName}`}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Terdaftar sejak {new Date(searchedMember.registeredAt).getFullYear()}
                </span>
                <button
                  onClick={() => onOpenVerifyModal(searchedMember)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Buka Sertifikat Lengkap
                </button>
              </div>
            </div>
          )}

          {notFound && !isVerifying && (
            <div className="bg-rose-50 rounded-3xl p-6 border border-rose-200 text-center max-w-md mx-auto space-y-2 text-slate-900 animate-in fade-in duration-200">
              <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
              <h4 className="font-bold text-rose-900 text-sm">Nomor Anggota Tidak Ditemukan</h4>
              <p className="text-xs text-rose-700 leading-relaxed">
                {notFoundMessage || 'Pastikan nomor anggota yang dimasukkan benar dan sesuai dengan format resmi Kwartir.'}
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="px-3 py-1.5 bg-rose-200/80 hover:bg-rose-200 text-rose-900 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Coba Pindai Barcode / QR dengan Kamera</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. SAPTA PESONA & PRAMUKA VALUES */}
      <section className="space-y-4 pt-2">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-lg font-bold text-slate-900 font-heading">
            Prinsip Dasar & Sapta Pesona Pariwisata
          </h3>
          <p className="text-xs text-slate-500">
            Nilai luhur yang menjadi pedoman seluruh insan Pramuka Saka Pariwisata Indonesia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm font-heading">Sapta Pesona Pariwisata</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mewujudkan 7 unsur pesona: Aman, Tertib, Bersih, Sejuk, Indah, Ramah Tamah, dan Kenangan dalam setiap pelayanan kepariwisataan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-base">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm font-heading">Tri Satya & Dasa Darma</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Komitmen spiritual dan moral dalam menjalankan kewajiban terhadap Tuhan dan NKRI, cinta alam, dan pengabdian masyarakat.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-base">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm font-heading">Pemberdayaan Desa Wisata</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mendorong ekonomi lokal desa wisata melalui pemanduan bersertifikasi, promosi budaya nusantara, dan konservasi ekowisata.
            </p>
          </div>
        </div>
      </section>

      {/* KTA Barcode & QR Scanner Modal */}
      <KtaBarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        localMembers={members}
        onScanSuccess={(scannedMember, result) => {
          setSearchedMember(scannedMember);
          setVerificationMeta(result);
          setVerifyInput(scannedMember.nationalMemberNumber || scannedMember.verificationToken || scannedMember.id);
          setNotFound(false);
          // Scroll to verification card
          const el = document.getElementById('verifikasi-kta');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />
    </div>
  );
};
