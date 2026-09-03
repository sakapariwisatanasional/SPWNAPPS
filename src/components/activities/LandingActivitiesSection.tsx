import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock, 
  Sparkles, 
  Search, 
  Filter, 
  Phone, 
  ArrowRight, 
  ChevronRight, 
  CheckCircle2, 
  Plus, 
  Globe, 
  Building2, 
  Lock, 
  ExternalLink,
  Tag,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { Activity, CurrentUser } from '../../types';

interface LandingActivitiesSectionProps {
  activities: Activity[];
  currentUser?: CurrentUser;
  onViewActivityDetail: (activity: Activity) => void;
  onOpenActivityForm?: () => void;
  onEnterDashboard?: (tab?: string) => void;
}

export const LandingActivitiesSection: React.FC<LandingActivitiesSectionProps> = ({
  activities,
  currentUser,
  onViewActivityDetail,
  onOpenActivityForm,
  onEnterDashboard
}) => {
  const [selectedScope, setSelectedScope] = useState<'ALL' | 'NATIONAL_INTL' | 'PROVINCE' | 'BRANCH'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isOperatorOrAdmin = currentUser && [
    'SUPER_ADMIN',
    'ADMIN_PROVINCE',
    'ADMIN_REGENCY',
    'ADMIN_BRANCH',
    'OPERATOR'
  ].includes(currentUser.role);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(activities.map(a => a.category).filter(Boolean)));
  }, [activities]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      // Scope Filter
      let matchScope = true;
      if (selectedScope === 'NATIONAL_INTL') {
        matchScope = act.organizerLevel === 'NASIONAL' || act.organizerLevel === 'INTERNASIONAL';
      } else if (selectedScope === 'PROVINCE') {
        matchScope = act.organizerLevel === 'PROVINSI';
      } else if (selectedScope === 'BRANCH') {
        matchScope = act.organizerLevel === 'KABUPATEN' || act.organizerLevel === 'RANTING';
      }

      // Category Filter
      const matchCat = selectedCategory === 'ALL' || act.category === selectedCategory;

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        act.title.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.locationName.toLowerCase().includes(q) ||
        act.provinceName.toLowerCase().includes(q) ||
        (act.regencyName && act.regencyName.toLowerCase().includes(q)) ||
        (act.organizerName && act.organizerName.toLowerCase().includes(q)) ||
        (act.uploadedByName && act.uploadedByName.toLowerCase().includes(q));

      return matchScope && matchCat && matchSearch;
    });
  }, [activities, selectedScope, selectedCategory, searchQuery]);

  const nationalAndIntlCount = useMemo(() => {
    return activities.filter(a => a.organizerLevel === 'NASIONAL' || a.organizerLevel === 'INTERNASIONAL').length;
  }, [activities]);

  const provinceCount = useMemo(() => {
    return activities.filter(a => a.organizerLevel === 'PROVINSI').length;
  }, [activities]);

  const branchCount = useMemo(() => {
    return activities.filter(a => a.organizerLevel === 'KABUPATEN' || a.organizerLevel === 'RANTING').length;
  }, [activities]);

  const formatRupiah = (val?: number) => {
    if (!val || val === 0) return 'GRATIS';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'INTERNASIONAL':
        return {
          label: '🌐 Skala Internasional',
          bgClass: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400/40'
        };
      case 'NASIONAL':
        return {
          label: '🇮🇩 Skala Nasional (Kwarnas)',
          bgClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400/40'
        };
      case 'PROVINSI':
        return {
          label: '🏛️ Tingkat Daerah (Kwarda)',
          bgClass: 'bg-emerald-600 text-white border-emerald-400/40'
        };
      case 'KABUPATEN':
        return {
          label: '🏢 Tingkat Cabang (Kwarcab)',
          bgClass: 'bg-amber-600 text-white border-amber-400/40'
        };
      case 'RANTING':
        return {
          label: '🏕️ Tingkat Ranting (Kwarran)',
          bgClass: 'bg-teal-600 text-white border-teal-400/40'
        };
      default:
        return {
          label: `Tingkat ${level}`,
          bgClass: 'bg-slate-700 text-white border-slate-600'
        };
    }
  };

  return (
    <section id="landing-agenda-section" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 border-t border-slate-800">
      
      {/* Header & Title Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[11px] font-bold uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5 text-teal-400" />
            <span>Agenda Kegiatan & Event Resmi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-heading">
            Agenda Kegiatan & Event Saka Pariwisata
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Kalender kegiatan resmi: kemah bakti, jambore, pelatihan pemandu wisata, festival ekowisata, dan lokakarya kejuruan 4 Krida yang diunggah oleh Kwartir Nasional, Kwarda, dan Kwarcab.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
          {isOperatorOrAdmin && onOpenActivityForm && (
            <button
              onClick={onOpenActivityForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Agenda ({currentUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operator'})</span>
            </button>
          )}

          {onEnterDashboard && (
            <button
              onClick={() => onEnterDashboard('activities')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-900 text-purple-200 border border-purple-700/60 text-xs font-bold transition-all cursor-pointer"
            >
              <span>Buka Kalender Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scope Filtering Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => setSelectedScope('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            selectedScope === 'ALL'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
              : 'bg-slate-950/80 hover:bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          <span>Semua Agenda ({activities.length})</span>
        </button>

        <button
          onClick={() => setSelectedScope('NATIONAL_INTL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            selectedScope === 'NATIONAL_INTL'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
              : 'bg-slate-950/80 hover:bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>🌟 Nasional & Internasional (Kwarnas)</span>
          <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-md text-[10px] font-mono">
            {nationalAndIntlCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedScope('PROVINCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            selectedScope === 'PROVINCE'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
              : 'bg-slate-950/80 hover:bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>🌲 Tingkat Daerah (Kwarda)</span>
          <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-md text-[10px] font-mono">
            {provinceCount}
          </span>
        </button>

        <button
          onClick={() => setSelectedScope('BRANCH')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
            selectedScope === 'BRANCH'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/50'
              : 'bg-slate-950/80 hover:bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>🏕️ Cabang & Ranting (Kwarcab / Kwarran)</span>
          <span className="px-1.5 py-0.2 bg-white/20 text-white rounded-md text-[10px] font-mono">
            {branchCount}
          </span>
        </button>
      </div>

      {/* Category Pills & Instant Search */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === 'ALL'
                  ? 'bg-teal-500 text-slate-950 shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-teal-500 text-slate-950 shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Stats Label */}
          <div className="text-right text-[11px] text-slate-400 flex-shrink-0">
            Menampilkan <strong className="text-white">{filteredActivities.length}</strong> agenda kegiatan aktif
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari agenda kegiatan (misal: Kemah Bakti Bromo, Sertifikasi Pemandu, Festival Kuliner DIY, Banyuwangi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-teal-400 focus:bg-slate-900 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer px-2 py-0.5 bg-slate-800 rounded-md"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <CalendarDays className="w-12 h-12 mx-auto text-slate-600 stroke-1" />
          <p className="font-bold text-white text-base">Tidak ada agenda kegiatan yang sesuai filter.</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Silakan pilih kategori lain atau ubah kata kunci pencarian untuk menemukan agenda lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const badgeInfo = getLevelBadge(act.organizerLevel);
            const isFree = !act.feeAmount || act.feeAmount === 0 || act.feeType === 'GRATIS';
            const cap = act.capacity || act.maxParticipants || 100;
            const regCount = act.registeredCount || 0;
            const percent = Math.min(100, Math.round((regCount / Math.max(1, cap)) * 100));

            return (
              <div
                key={act.id}
                className="bg-slate-950/90 border border-slate-800 rounded-3xl overflow-hidden hover:border-purple-500/60 transition-all duration-300 group shadow-xl flex flex-col justify-between hover:-translate-y-1.5"
              >
                <div>
                  {/* Banner Image with Badges */}
                  <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-900">
                    <img
                      src={act.coverImage || act.bannerUrl}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                    {/* Top Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                      <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg border border-white/10 shadow-xs">
                        {act.category}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-xs ${badgeInfo.bgClass}`}>
                        {badgeInfo.label}
                      </span>
                    </div>

                    {/* Bottom Floating Location */}
                    <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                      <p className="text-xs font-semibold text-slate-200 flex items-center gap-1 truncate drop-shadow-md">
                        <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                        <span className="truncate">{act.locationName}, {act.provinceName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3.5">
                    
                    {/* Date & Schedule */}
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-300 bg-purple-950/60 border border-purple-800/60 px-3 py-1.5 rounded-xl">
                      <CalendarDays className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(act.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' - '}
                        {new Date(act.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onViewActivityDetail(act)}
                      className="text-base font-bold text-white group-hover:text-purple-300 transition-colors font-heading line-clamp-2 cursor-pointer leading-snug"
                    >
                      {act.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>

                    {/* Organizer & Official Uploader */}
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-semibold">
                        <span>Penyelenggara Resmi</span>
                        <span>Skema Biaya</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {act.organizerName}
                        </span>
                        <span className={`text-xs font-extrabold flex-shrink-0 ${
                          isFree ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {isFree ? 'GRATIS / SUBSIDI' : formatRupiah(act.feeAmount)}
                        </span>
                      </div>
                      {act.uploadedByName && (
                        <p className="text-[10px] text-purple-400 truncate pt-0.5">
                          Didaftarkan oleh: {act.uploadedByName}
                        </p>
                      )}
                    </div>

                    {/* Quota Progress Bar */}
                    <div className="space-y-1 pt-0.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>Kuota Terisi:</span>
                        </span>
                        <span className="font-bold text-slate-200">
                          {regCount} / {cap} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-400 to-purple-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 space-y-2 border-t border-slate-800/80 bg-slate-950/40">
                  <button
                    onClick={() => onViewActivityDetail(act)}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Lihat Rincian & Persyaratan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {act.contactPhone && (
                    <a
                      href={`https://wa.me/${act.contactPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Halo Panitia / Narahubung Kegiatan "${act.title}", saya tertarik dan ingin mendaftar kegiatan ini melalui Portal Saka Pariwisata.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 border border-emerald-500/30"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Hubungi Panitia ({act.contactPerson || 'WhatsApp'})</span>
                    </a>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
