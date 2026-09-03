import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Phone, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  Filter, 
  Globe, 
  TreePine, 
  Utensils, 
  Gift, 
  Tent, 
  Users, 
  Clock, 
  Star, 
  ExternalLink, 
  Navigation, 
  Check, 
  Info,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Calendar,
  CalendarDays,
  Plus,
  Tag,
  Building2,
  Ticket
} from 'lucide-react';
import { 
  TourPackage, 
  CulinarySouvenirItem, 
  Member, 
  CurrentUser, 
  KridaType, 
  Province,
  Activity
} from '../../types';
import { ipLocationService, POPULAR_DESTINATIONS, DetectedLocation } from '../../services/ipLocationService';
import { PROVINCES_DATA } from '../../data/indonesiaTerritories';
import { storage } from '../../services/storage';
import { formatDriveImageUrl } from '../common/SakaLogo';
import { TourPackageDetailModal } from '../tourism/TourPackageDetailModal';
import { CulinarySouvenirDetailModal } from '../culinary/CulinarySouvenirDetailModal';
import { MemberVerificationModal } from '../member/MemberVerificationModal';
import { ActivityDetailModal } from '../activities/ActivityDetailModal';
import { ActivityFormModal } from '../activities/ActivityFormModal';

interface IntegratedTourismShowcaseGalleryProps {
  tours: TourPackage[];
  products: CulinarySouvenirItem[];
  members: Member[];
  activities?: Activity[];
  currentUser: CurrentUser;
  onViewTourDetail?: (tour: TourPackage) => void;
  onSelectMember?: (member: Member) => void;
  onSelectTab?: (tab: string) => void;
}

export const IntegratedTourismShowcaseGallery: React.FC<IntegratedTourismShowcaseGalleryProps> = ({
  tours,
  products,
  members,
  activities: initialActivities,
  currentUser,
  onViewTourDetail,
  onSelectMember,
  onSelectTab
}) => {
  // Main Tab Navigation: 'DESTINATIONS' | 'KRIDA_PRODUCTS' | 'AGENDA_ACTIVITIES' | 'RECOMMENDED_MEMBERS'
  const [activeMainTab, setActiveMainTab] = useState<'DESTINATIONS' | 'KRIDA_PRODUCTS' | 'AGENDA_ACTIVITIES' | 'RECOMMENDED_MEMBERS'>('DESTINATIONS');

  // Location Context State (Geo-IP & User Selection)
  const [userLocation, setUserLocation] = useState<DetectedLocation>(ipLocationService.getLocation());
  const [isDetectingIp, setIsDetectingIp] = useState<boolean>(false);
  const [selectedTourForMatching, setSelectedTourForMatching] = useState<TourPackage | null>(null);

  // Filters for Destinations
  const [tourCategoryFilter, setTourCategoryFilter] = useState<string>('ALL');
  const [tourSearchQuery, setTourSearchQuery] = useState<string>('');

  // Filters for 4 Krida Products
  const [selectedKrida, setSelectedKrida] = useState<'ALL' | KridaType>('ALL');
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');

  // Filters for Agenda Kegiatan Saka
  const [activitiesList, setActivitiesList] = useState<Activity[]>(initialActivities || storage.getActivities());
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<string>('ALL');
  const [activityLevelFilter, setActivityLevelFilter] = useState<string>('ALL');
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>('');

  // Filters for Recommended Members
  const [memberSkillCategoryFilter, setMemberSkillCategoryFilter] = useState<string>('ALL');

  // Modals Local State
  const [modalTour, setModalTour] = useState<TourPackage | null>(null);
  const [modalProduct, setModalProduct] = useState<CulinarySouvenirItem | null>(null);
  const [modalMember, setModalMember] = useState<Member | null>(null);
  const [modalActivity, setModalActivity] = useState<Activity | null>(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Synchronize activities list
  const refreshActivities = () => {
    setActivitiesList(storage.getActivities());
  };

  useEffect(() => {
    if (initialActivities) {
      setActivitiesList(initialActivities);
    } else {
      setActivitiesList(storage.getActivities());
    }
  }, [initialActivities]);

  // Subscribe to Location updates
  useEffect(() => {
    const unsub = ipLocationService.subscribe((loc) => {
      setUserLocation(loc);
    });
    return unsub;
  }, []);

  // Handle IP Auto-Detection Trigger
  const handleTriggerIpDetect = async () => {
    setIsDetectingIp(true);
    setSelectedTourForMatching(null); // Reset tour lock to detect user's physical IP
    try {
      const loc = await ipLocationService.detectPublicLocation();
      setUserLocation(loc);
    } finally {
      setIsDetectingIp(false);
    }
  };

  // Handle Manual Destination Selection (e.g. User picks Bandung, Yogyakarta, Bali, etc.)
  const handleSelectDestinationPreset = (preset: typeof POPULAR_DESTINATIONS[0]) => {
    const newLoc: DetectedLocation = {
      ip: userLocation.ip,
      city: preset.city,
      regionName: preset.provinceName,
      provinceId: preset.provinceId,
      country: 'Indonesia',
      isAutoDetected: false,
      source: 'USER_SELECTED'
    };
    ipLocationService.setLocation(newLoc);
    setUserLocation(newLoc);
    setSelectedTourForMatching(null);
  };

  // Handle Province Dropdown Change
  const handleProvinceDropdownChange = (provName: string) => {
    if (provName === 'ALL') return;
    const foundProv = PROVINCES_DATA.find(p => p.name === provName);
    const newLoc: DetectedLocation = {
      ip: userLocation.ip,
      city: provName,
      regionName: provName,
      provinceId: foundProv?.id || '00',
      country: 'Indonesia',
      isAutoDetected: false,
      source: 'USER_SELECTED'
    };
    ipLocationService.setLocation(newLoc);
    setUserLocation(newLoc);
    setSelectedTourForMatching(null);
  };

  // When User Clicks "Pilih Wisata Ini & Rekomendasikan Pemandu Lokal"
  const handleSelectTourForRecommendation = (tour: TourPackage) => {
    setSelectedTourForMatching(tour);
    const newLoc: DetectedLocation = {
      ip: userLocation.ip,
      city: tour.regencyName,
      regionName: tour.provinceName,
      provinceId: tour.provinceId,
      country: 'Indonesia',
      isAutoDetected: false,
      source: 'USER_SELECTED'
    };
    ipLocationService.setLocation(newLoc);
    setUserLocation(newLoc);
    setActiveMainTab('RECOMMENDED_MEMBERS');
  };

  // 1. FILTERED TOURS (DESTINATIONS)
  const publishedTours = useMemo(() => {
    const pub = tours.filter(t => t.status === 'APPROVED_PUBLISHED' || !t.status);
    return pub.length > 0 ? pub : tours;
  }, [tours]);

  const uniqueTourCategories = useMemo(() => {
    return Array.from(new Set(publishedTours.map(t => t.category).filter(Boolean)));
  }, [publishedTours]);

  const filteredTours = useMemo(() => {
    return publishedTours.filter(t => {
      const matchCat = tourCategoryFilter === 'ALL' || t.category === tourCategoryFilter;
      const q = tourSearchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        t.title.toLowerCase().includes(q) ||
        t.locationAddress.toLowerCase().includes(q) ||
        t.provinceName.toLowerCase().includes(q) ||
        t.regencyName.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [publishedTours, tourCategoryFilter, tourSearchQuery]);

  // 2. FILTERED 4 KRIDA PRODUCTS
  const approvedProducts = useMemo(() => {
    const app = products.filter(p => (p.status || 'APPROVED') === 'APPROVED');
    return app.length > 0 ? app : products;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return approvedProducts.filter(p => {
      const matchKrida = selectedKrida === 'ALL' || p.krida === selectedKrida;
      const q = productSearchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.provinceName.toLowerCase().includes(q) ||
        p.regencyName.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(q)));
      return matchKrida && matchQuery;
    });
  }, [approvedProducts, selectedKrida, productSearchQuery]);

  // 3. FILTERED AGENDA KEGIATAN SAKA PARIWISATA
  const uniqueActivityCategories = useMemo(() => {
    return Array.from(new Set(activitiesList.map(a => a.category).filter(Boolean)));
  }, [activitiesList]);

  const filteredActivities = useMemo(() => {
    return activitiesList.filter(a => {
      const matchCategory = activityCategoryFilter === 'ALL' || a.category === activityCategoryFilter;
      const matchLevel = activityLevelFilter === 'ALL' || a.organizerLevel === activityLevelFilter;
      const q = activitySearchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.locationName.toLowerCase().includes(q) ||
        a.provinceName.toLowerCase().includes(q) ||
        a.organizerName.toLowerCase().includes(q);
      return matchCategory && matchLevel && matchQuery;
    });
  }, [activitiesList, activityCategoryFilter, activityLevelFilter, activitySearchQuery]);

  // 4. SMART RECOMMENDED MEMBERS (GEO-MATCHING)
  const recommendedMembers = useMemo(() => {
    const targetLoc = {
      provinceName: userLocation.regionName,
      regencyName: userLocation.city,
      city: userLocation.city
    };
    const scored = ipLocationService.getRecommendedMembers(members, targetLoc, selectedTourForMatching);
    
    if (memberSkillCategoryFilter === 'ALL') {
      return scored;
    }
    return scored.filter(m => m.skills?.some(s => s.category.toLowerCase().includes(memberSkillCategoryFilter.toLowerCase())));
  }, [members, userLocation, selectedTourForMatching, memberSkillCategoryFilter]);

  // Check if current user is admin/operator
  const isOperatorOrAdmin = [
    'SUPER_ADMIN', 
    'ADMIN_PROVINCE', 
    'ADMIN_REGENCY', 
    'OPERATOR'
  ].includes(currentUser.role);

  // Format IDR Helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div id="galeri-terpadu-saka" className="space-y-6 scroll-mt-6">
      {/* ========================================================================= */}
      {/* 1. MASTER HEADER & SMART LOCATION BAR */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white border border-purple-800/40 shadow-xl relative overflow-hidden space-y-5">
        {/* Glow Visuals */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 border-b border-purple-800/30 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-400/40 rounded-full text-teal-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              <span>Pusat Eksplorasi & Direktori Cerdas Saka Pariwisata</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-heading text-white tracking-tight">
              Galeri Destinasi, Produk 4 Krida, Agenda & Pemandu Lokal
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-3xl leading-relaxed">
              Temukan paket ekowisata nusantara, karya binaan 4 Krida, agenda kegiatan resmi Saka Pariwisata se-Indonesia, serta kader pemandu bersertifikasi siap kontak langsung.
            </p>
          </div>

          {/* IP Detection / Current Location Status Badge */}
          <div className="flex-shrink-0 bg-slate-950/70 border border-purple-700/50 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 flex-shrink-0">
              <Navigation className="w-5 h-5 animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-[11px] text-teal-300 font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>{selectedTourForMatching ? 'Destinasi Dipilih' : userLocation.source === 'IP_GEO' ? 'IP Location Publik' : 'Wilayah Aktif'}</span>
              </div>
              <p className="text-sm font-extrabold text-white font-heading truncate max-w-[200px]">
                {userLocation.city ? `${userLocation.city}, ` : ''}{userLocation.regionName}
              </p>
            </div>

            <button
              onClick={handleTriggerIpDetect}
              disabled={isDetectingIp}
              title="Perbarui Deteksi Lokasi Otomatis via IP Publik"
              className="ml-2 p-2 bg-purple-600/30 hover:bg-purple-600/60 text-purple-200 hover:text-white rounded-xl border border-purple-400/30 transition-all cursor-pointer disabled:opacity-50 text-xs font-semibold flex items-center gap-1 min-h-[38px]"
            >
              <Globe className={`w-4 h-4 ${isDetectingIp ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isDetectingIp ? 'Mendeteksi...' : 'IP Saya'}</span>
            </button>
          </div>
        </div>

        {/* Location Selector Bar & Quick Preset Pills */}
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-purple-200 font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              <span>Pilih Destinasi untuk Menyesuaikan Rekomendasi Pemandu & Produk Daerah:</span>
            </span>

            {/* Province Dropdown */}
            <div className="flex items-center gap-2">
              <select
                aria-label="Pilih Provinsi Destinasi"
                value={userLocation.regionName}
                onChange={(e) => handleProvinceDropdownChange(e.target.value)}
                className="bg-slate-950/80 text-white text-xs border border-purple-700/60 rounded-xl px-3 py-1.5 outline-none focus:border-teal-400 cursor-pointer"
              >
                {PROVINCES_DATA.filter(p => p.id !== '00').map((prov) => (
                  <option key={prov.id} value={prov.name} className="bg-slate-900 text-white">
                    {prov.name} ({prov.island})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Clickable Destination Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {POPULAR_DESTINATIONS.map((preset) => {
              const isActive = userLocation.regionName === preset.provinceName && !selectedTourForMatching;
              return (
                <button
                  key={preset.label}
                  onClick={() => handleSelectDestinationPreset(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                    isActive 
                      ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-950/50 scale-102' 
                      : 'bg-white/10 hover:bg-white/20 text-purple-100 border border-white/15'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isActive ? 'text-slate-950' : 'text-teal-300'}`} />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Alert if Tour is currently locking the matching context */}
          {selectedTourForMatching && (
            <div className="p-2.5 bg-teal-950/70 border border-teal-600/50 rounded-xl flex items-center justify-between text-xs text-teal-200">
              <div className="flex items-center gap-2 truncate">
                <Compass className="w-4 h-4 text-teal-300 flex-shrink-0" />
                <span className="truncate">
                  Rekomendasi disesuaikan untuk paket: <strong className="text-white">{selectedTourForMatching.title}</strong> ({selectedTourForMatching.regencyName}, {selectedTourForMatching.provinceName})
                </span>
              </div>
              <button
                onClick={() => setSelectedTourForMatching(null)}
                className="text-xs font-bold text-teal-300 hover:text-white underline ml-3 flex-shrink-0 cursor-pointer"
              >
                Gunakan Lokasi Umum
              </button>
            </div>
          )}
        </div>

        {/* 4 Major Tab Switchers */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
          {/* Tab 1: Destinasi */}
          <button
            onClick={() => setActiveMainTab('DESTINATIONS')}
            className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3 border ${
              activeMainTab === 'DESTINATIONS'
                ? 'bg-gradient-to-r from-purple-700/80 to-indigo-700/80 border-teal-400 text-white shadow-lg shadow-purple-950/50 ring-2 ring-teal-400/30'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              activeMainTab === 'DESTINATIONS' ? 'bg-teal-400 text-slate-950' : 'bg-purple-900/60 text-purple-300'
            }`}>
              <TreePine className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm font-heading">Destinasi Ekowisata</span>
                <span className="px-1.5 py-0.2 bg-teal-400/20 text-teal-300 text-[10px] font-bold rounded-md">
                  {filteredTours.length}
                </span>
              </div>
              <p className="text-[11px] text-purple-200/70 truncate">Paket wisata binaan Saka</p>
            </div>
          </button>

          {/* Tab 2: Etalase Karya & Produk 4 Krida */}
          <button
            onClick={() => setActiveMainTab('KRIDA_PRODUCTS')}
            className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3 border ${
              activeMainTab === 'KRIDA_PRODUCTS'
                ? 'bg-gradient-to-r from-purple-700/80 to-indigo-700/80 border-teal-400 text-white shadow-lg shadow-purple-950/50 ring-2 ring-teal-400/30'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              activeMainTab === 'KRIDA_PRODUCTS' ? 'bg-teal-400 text-slate-950' : 'bg-purple-900/60 text-purple-300'
            }`}>
              <Gift className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm font-heading">Etalase Karya 4 Krida</span>
                <span className="px-1.5 py-0.2 bg-teal-400/20 text-teal-300 text-[10px] font-bold rounded-md">
                  {filteredProducts.length}
                </span>
              </div>
              <p className="text-[11px] text-purple-200/70 truncate">Kuliner, Kriya & Homestay</p>
            </div>
          </button>

          {/* Tab 3: Agenda Kegiatan Saka Pariwisata (BARU) */}
          <button
            onClick={() => setActiveMainTab('AGENDA_ACTIVITIES')}
            className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3 border ${
              activeMainTab === 'AGENDA_ACTIVITIES'
                ? 'bg-gradient-to-r from-purple-700/80 to-indigo-700/80 border-teal-400 text-white shadow-lg shadow-purple-950/50 ring-2 ring-teal-400/30'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              activeMainTab === 'AGENDA_ACTIVITIES' ? 'bg-teal-400 text-slate-950' : 'bg-purple-900/60 text-purple-300'
            }`}>
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm font-heading">Agenda Kegiatan Saka</span>
                <span className="px-1.5 py-0.2 bg-teal-400/20 text-teal-300 text-[10px] font-bold rounded-md">
                  {filteredActivities.length}
                </span>
              </div>
              <p className="text-[11px] text-purple-200/70 truncate">Perkemahan, Bakti & Pelatihan</p>
            </div>
          </button>

          {/* Tab 4: Rekomendasi Pemandu & Kader */}
          <button
            onClick={() => setActiveMainTab('RECOMMENDED_MEMBERS')}
            className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-3 border ${
              activeMainTab === 'RECOMMENDED_MEMBERS'
                ? 'bg-gradient-to-r from-teal-600/80 to-emerald-700/80 border-teal-300 text-white shadow-lg shadow-emerald-950/50 ring-2 ring-teal-300/40'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              activeMainTab === 'RECOMMENDED_MEMBERS' ? 'bg-white text-emerald-900' : 'bg-teal-900/60 text-teal-300'
            }`}>
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm font-heading">Pemandu Lokal</span>
                <span className="px-1.5 py-0.2 bg-emerald-400/30 text-emerald-200 text-[10px] font-bold rounded-md">
                  {recommendedMembers.length}
                </span>
              </div>
              <p className="text-[11px] text-teal-100/80 truncate">
                {userLocation.regionName} & Sekitarnya
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TAB 1 CONTENT: DESTINASI & EKOWISATA UNGGULAN */}
      {/* ========================================================================= */}
      {activeMainTab === 'DESTINATIONS' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold font-heading text-slate-900 flex items-center gap-2">
                  <TreePine className="w-5 h-5 text-emerald-700" />
                  <span>Katalog Paket Wisata & Ekowisata Binaan Saka</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih paket perjalanan edukatif dan klik <strong>"Rekomendasi Pemandu Lokal"</strong> untuk menemukan kader Pramuka terdekat di wilayah destinasi.
                </p>
              </div>

              {/* Search */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full md:w-80 shadow-2xs focus-within:border-purple-500 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={tourSearchQuery}
                  onChange={(e) => setTourSearchQuery(e.target.value)}
                  placeholder="Cari destinasi, kota, atau provinsi..."
                  className="bg-transparent outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
                />
                {tourSearchQuery && (
                  <button onClick={() => setTourSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setTourCategoryFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                  tourCategoryFilter === 'ALL'
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Semua Kategori ({publishedTours.length})
              </button>
              {uniqueTourCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTourCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
                    tourCategoryFilter === cat
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tours Grid */}
          {filteredTours.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400 space-y-2">
              <Compass className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="font-bold text-slate-700 text-sm">Tidak ada destinasi yang cocok dengan pencarian.</p>
              <p className="text-xs text-slate-400">Coba ganti kategori atau kata kunci.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTours.map((tour) => {
                const isSelected = selectedTourForMatching?.id === tour.id;
                return (
                  <div
                    key={tour.id}
                    className={`bg-white rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between overflow-hidden group hover:shadow-lg ${
                      isSelected ? 'border-teal-500 ring-2 ring-teal-400/40 shadow-md' : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Cover Photo */}
                      <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100">
                        <img
                          src={tour.coverImage}
                          alt={tour.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                          <span className="px-2.5 py-1 bg-slate-900/85 backdrop-blur-xs text-white rounded-lg text-xs font-bold border border-white/20">
                            {tour.category}
                          </span>
                          {tour.featured && (
                            <span className="px-2 py-1 bg-amber-500/90 text-slate-950 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-slate-950" />
                              <span>Unggulan</span>
                            </span>
                          )}
                        </div>

                        {/* Price & Duration */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10">
                          <div>
                            <p className="text-[10px] text-white/80 uppercase font-medium">Mulai dari</p>
                            <p className="text-base font-extrabold font-heading text-emerald-300 leading-tight">
                              {formatRupiah(tour.pricePerPerson)}
                              <span className="text-[10px] font-normal text-white/80"> / pax</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 font-medium">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{tour.durationDays} Hari</span>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 sm:p-5 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                          <span className="font-semibold text-slate-700 truncate">{tour.regencyName}, {tour.provinceName}</span>
                        </div>

                        <h4 
                          onClick={() => {
                            if (onViewTourDetail) onViewTourDetail(tour);
                            else setModalTour(tour);
                          }}
                          className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-purple-900 transition-colors line-clamp-2 cursor-pointer font-heading leading-snug"
                        >
                          {tour.title}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {tour.description}
                        </p>

                        {/* Facilities tags */}
                        {tour.facilities && tour.facilities.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {tour.facilities.slice(0, 2).map((fac, i) => (
                              <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-medium rounded-md border border-emerald-200/60">
                                ✓ {fac}
                              </span>
                            ))}
                            {tour.facilities.length > 2 && (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md">
                                +{tour.facilities.length - 2} lagi
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 sm:p-5 pt-0 space-y-2">
                      {/* Main Dynamic Recommendation Trigger */}
                      <button
                        onClick={() => handleSelectTourForRecommendation(tour)}
                        className={`w-full py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[40px] ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-md'
                            : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold shadow-xs active:scale-98'
                        }`}
                      >
                        <Award className="w-4 h-4 text-slate-950" />
                        <span>Rekomendasikan Pemandu {tour.provinceName}</span>
                        <ChevronRight className="w-4 h-4 text-slate-950" />
                      </button>

                      {/* Detail Modal Button */}
                      <button
                        onClick={() => {
                          if (onViewTourDetail) onViewTourDetail(tour);
                          else setModalTour(tour);
                        }}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Lihat Rincian Itinerary & Reservasi</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 2 CONTENT: ETALASE KARYA & PRODUK 4 KRIDA */}
      {/* ========================================================================= */}
      {activeMainTab === 'KRIDA_PRODUCTS' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Bar & 4 Krida Selectors */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold font-heading text-slate-900 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-700" />
                  <span>Etalase Produk & Inovasi Karya 4 Krida Saka Pariwisata</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Dukungan nyata bagi UMKM, pemandu lokal, kuliner khas, dan pengrajin cinderamata di bawah binaan Kwartir se-Indonesia.
                </p>
              </div>

              {/* Product Search */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 w-full md:w-80 shadow-2xs focus-within:border-purple-500 focus-within:bg-white transition-all">
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Cari produk, kopi, batik, anyaman..."
                  className="bg-transparent outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
                />
                {productSearchQuery && (
                  <button onClick={() => setProductSearchQuery('')} className="text-xs text-slate-400 hover:text-slate-600">✕</button>
                )}
              </div>
            </div>

            {/* 4 Krida Pills with Dedicated Icons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                onClick={() => setSelectedKrida('ALL')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                  selectedKrida === 'ALL'
                    ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Semua Karya ({approvedProducts.length})</span>
              </button>

              <button
                onClick={() => setSelectedKrida('Krida Kuliner & Cinderamata')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                  selectedKrida === 'Krida Kuliner & Cinderamata'
                    ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Utensils className="w-4 h-4 text-amber-600" />
                <span className="truncate w-full">Krida Kuliner & Kriya</span>
              </button>

              <button
                onClick={() => setSelectedKrida('Krida Pemandu')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                  selectedKrida === 'Krida Pemandu'
                    ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Compass className="w-4 h-4 text-emerald-600" />
                <span className="truncate w-full">Krida Pemandu</span>
              </button>

              <button
                onClick={() => setSelectedKrida('Krida Penyuluh')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                  selectedKrida === 'Krida Penyuluh'
                    ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <TreePine className="w-4 h-4 text-teal-600" />
                <span className="truncate w-full">Krida Daya Tarik Wisata</span>
              </button>

              <button
                onClick={() => setSelectedKrida('Krida Mice & Event')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1 border ${
                  selectedKrida === 'Krida Mice & Event'
                    ? 'bg-purple-900 text-white border-purple-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Tent className="w-4 h-4 text-indigo-600" />
                <span className="truncate w-full">Krida MICE & Homestay</span>
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400 space-y-2">
              <Gift className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="font-bold text-slate-700 text-sm">Belum ada karya atau produk yang sesuai dengan filter ini.</p>
              <p className="text-xs text-slate-400">Pilih Krida lain atau gunakan kata kunci umum.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((prod) => {
                const isLocationMatch = prod.provinceName === userLocation.regionName;
                return (
                  <div
                    key={prod.id}
                    className={`bg-white rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between overflow-hidden group hover:shadow-lg ${
                      isLocationMatch ? 'border-purple-300 ring-1 ring-purple-300/50 shadow-xs' : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                        {/* Krida Tag */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="px-2.5 py-1 bg-purple-950/85 backdrop-blur-xs text-purple-200 rounded-lg text-[11px] font-bold border border-purple-400/30">
                            {prod.krida}
                          </span>
                        </div>

                        {/* Location Match Pill */}
                        {isLocationMatch && (
                          <div className="absolute top-3 right-3 z-10">
                            <span className="px-2 py-0.5 bg-teal-400 text-slate-950 rounded-md text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                              <MapPin className="w-3 h-3" />
                              <span>Lokal {prod.provinceName}</span>
                            </span>
                          </div>
                        )}

                        {/* Price Unit */}
                        <div className="absolute bottom-3 left-3 text-white z-10">
                          <p className="text-[10px] text-white/80 uppercase font-medium">Estimasi Harga</p>
                          <p className="text-base font-extrabold font-heading text-teal-300 leading-tight">
                            {formatRupiah(prod.priceEstimate)}
                            <span className="text-[10px] font-normal text-white/80"> {prod.priceUnit ? `/ ${prod.priceUnit}` : ''}</span>
                          </p>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 sm:p-5 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                          <span className="truncate">{prod.regencyName}, {prod.provinceName}</span>
                        </div>

                        <h4
                          onClick={() => setModalProduct(prod)}
                          className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-purple-900 transition-colors line-clamp-2 cursor-pointer font-heading leading-snug"
                        >
                          {prod.name}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {prod.description}
                        </p>

                        {/* Author Info */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-medium uppercase">Kader Pembuat / Pangkalan</p>
                            <p className="font-bold text-slate-800 truncate">{prod.authorName}</p>
                            {prod.authorNta && (
                              <p className="text-[10px] font-mono text-purple-700 font-semibold">{prod.authorNta}</p>
                            )}
                          </div>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-md">
                            {prod.categoryLabel || prod.kind}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 sm:p-5 pt-0 space-y-2">
                      {/* WhatsApp Order Action */}
                      <a
                        href={`https://wa.me/${prod.contactPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Halo ${prod.authorName}, saya melihat produk karya Krida "${prod.name}" di Portal Saka Pariwisata. Boleh info pemesanan / layanannya?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl sm:rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 min-h-[40px] shadow-xs active:scale-98"
                      >
                        <Phone className="w-3.5 h-3.5 text-white" />
                        <span>Pesan / Hubungi Pengrajin</span>
                      </a>

                      <button
                        onClick={() => setModalProduct(prod)}
                        className="w-full py-1.5 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <span>Lihat Kisah Filosofi & Galeri</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB 3 CONTENT: AGENDA KEGIATAN SAKA PARIWISATA (BARU) */}
      {/* ========================================================================= */}
      {activeMainTab === 'AGENDA_ACTIVITIES' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Header Context Banner */}
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white border border-purple-700/40 shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/40 rounded-full text-teal-200 text-xs font-bold">
                  <CalendarDays className="w-3.5 h-3.5 text-teal-300" />
                  <span>Agenda & Kegiatan Resmi Saka Pariwisata</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-extrabold font-heading text-white">
                  Jadwal Perkemahan, Pelatihan & Aksi Sapta Pesona
                </h3>
                <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl leading-relaxed">
                  Galeri agenda kegiatan resmi yang diunggah oleh Kwartir, Pimpinan Saka, dan Operator. Terbuka bagi anggota Pramuka maupun masyarakat umum untuk berpartisipasi aktif.
                </p>
              </div>

              {/* Upload Button for Super Admin & Operators */}
              {isOperatorOrAdmin && (
                <button
                  onClick={() => {
                    setEditingActivity(null);
                    setIsActivityFormOpen(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Unggah Agenda Baru</span>
                </button>
              )}
            </div>

            {/* Non-transactional Direct WhatsApp Disclaimer Notice */}
            <div className="p-3 bg-teal-950/60 border border-teal-500/30 rounded-xl flex items-start gap-2.5 text-xs text-teal-100">
              <Info className="w-4 h-4 text-teal-300 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white font-semibold">Etalase Informasi & Pendaftaran Langsung:</strong>
                <span className="ml-1 text-teal-200/90">
                  Portal ini tidak memproses transaksi pembayaran keuangan langsung. Setiap pendaftaran, konfirmasi keikutsertaan, maupun pertanyaan dilakukan langsung menghubungi narahubung / nomor WhatsApp resmi yang tertera pada masing-masing kegiatan.
                </span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <button
                  onClick={() => setActivityCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activityCategoryFilter === 'ALL'
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Semua Kategori ({activitiesList.length})
                </button>
                {uniqueActivityCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActivityCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activityCategoryFilter === cat
                        ? 'bg-purple-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Tingkat / Scope Dropdown */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <select
                  aria-label="Filter Tingkat Penyelenggara"
                  value={activityLevelFilter}
                  onChange={(e) => setActivityLevelFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-purple-600 cursor-pointer"
                >
                  <option value="ALL">Semua Tingkat Penyelenggara</option>
                  <option value="Nasional">Tingkat Nasional (Kwarnas)</option>
                  <option value="Provinsi">Tingkat Daerah / Kwarda</option>
                  <option value="Kabupaten/Kota">Tingkat Cabang / Kwarcab</option>
                  <option value="Ranting">Tingkat Ranting / Kwarran</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari agenda kegiatan berdasarkan nama, lokasi, kwarda/kwarcab, atau narahubung..."
                value={activitySearchQuery}
                onChange={(e) => setActivitySearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-purple-600 focus:bg-white transition-all"
              />
              {activitySearchQuery && (
                <button
                  onClick={() => setActivitySearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Activities Cards Grid */}
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400 space-y-2">
              <CalendarDays className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="font-bold text-slate-700 text-sm">Tidak ada agenda kegiatan yang cocok dengan filter pencarian.</p>
              <p className="text-xs text-slate-400">Silakan ubah filter kategori atau kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredActivities.map((act) => {
                const percent = Math.min(100, Math.round((act.registeredCount / Math.max(1, act.maxParticipants)) * 100));
                const isFree = !act.registrationFee || act.registrationFee === 0;

                return (
                  <div
                    key={act.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-purple-300"
                  >
                    <div className="space-y-3">
                      {/* Cover Banner Image */}
                      <div className="h-48 sm:h-52 relative overflow-hidden bg-slate-900">
                        <img
                          src={act.coverImage}
                          alt={act.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                          <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg border border-white/10 shadow-xs">
                            {act.category}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-xs ${
                            act.status === 'OPEN_REGISTRATION'
                              ? 'bg-emerald-500/90 text-white border-emerald-400'
                              : act.status === 'ONGOING'
                              ? 'bg-blue-500/90 text-white border-blue-400 animate-pulse'
                              : 'bg-slate-700/90 text-slate-200 border-slate-600'
                          }`}>
                            {act.status === 'OPEN_REGISTRATION' ? 'PENDAFTARAN DIBUKA' : act.status === 'ONGOING' ? 'SEDANG BERLANGSUNG' : 'SELESAI'}
                          </span>
                        </div>

                        {/* Tingkat Penyelenggara & Lokasi Floating */}
                        <div className="absolute bottom-3 left-3 right-3 text-white z-10 space-y-0.5">
                          <span className="px-2 py-0.5 bg-purple-600/90 text-white text-[10px] font-bold rounded-md inline-block">
                            Tingkat {act.organizerLevel}
                          </span>
                          <p className="text-xs font-semibold text-slate-200 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-teal-400 flex-shrink-0" />
                            <span className="truncate">{act.locationName}, {act.provinceName}</span>
                          </p>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-4 sm:p-5 pt-1 space-y-3">
                        {/* Dates & Duration */}
                        <div className="flex items-center gap-1.5 text-xs text-purple-800 font-semibold bg-purple-50 p-2 rounded-xl border border-purple-100">
                          <CalendarDays className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                          <span className="truncate">
                            {new Date(act.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' - '}
                            {new Date(act.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Title */}
                        <h4
                          onClick={() => setModalActivity(act)}
                          className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-purple-900 transition-colors line-clamp-2 cursor-pointer font-heading leading-snug"
                        >
                          {act.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {act.description}
                        </p>

                        {/* Uploader / Organizer Box */}
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                          <div className="min-w-0">
                            <p className="text-[10px] text-slate-400 font-medium uppercase">Penyelenggara / Pengunggah</p>
                            <p className="font-bold text-slate-800 truncate">{act.organizerName}</p>
                            <p className="text-[10px] text-purple-700 font-medium">{act.uploadedByName} ({act.uploadedByRole})</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[10px] text-slate-400 block">Biaya Registrasi</span>
                            <span className={`text-xs font-extrabold ${isFree ? 'text-emerald-700' : 'text-purple-900'}`}>
                              {isFree ? 'GRATIS / SUBSIDI' : formatRupiah(act.registrationFee)}
                            </span>
                          </div>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />
                              <span>Kapasitas Peserta:</span>
                            </span>
                            <span className="font-bold text-slate-700">
                              {act.registeredCount} / {act.maxParticipants} Orang ({percent}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-teal-500 to-purple-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 sm:p-5 pt-0 space-y-2 border-t border-slate-100 bg-slate-50/50">
                      {/* WhatsApp Direct Contact Button */}
                      <a
                        href={`https://wa.me/${act.contactPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Halo Panitia / Narahubung Kegiatan "${act.title}", saya ingin menanyakan informasi dan pendaftaran kegiatan ini yang saya lihat di Portal Saka Pariwisata.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl sm:rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 min-h-[40px] shadow-xs active:scale-98"
                      >
                        <Phone className="w-3.5 h-3.5 text-white" />
                        <span>Hubungi Narahubung via WhatsApp</span>
                      </a>

                      {/* View Detail & Registration Modal */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModalActivity(act)}
                          className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
                        >
                          <Ticket className="w-3.5 h-3.5 text-purple-700" />
                          <span>Detail & Pendaftaran</span>
                        </button>

                        {/* Edit for Operators/Admins */}
                        {isOperatorOrAdmin && (
                          <button
                            onClick={() => {
                              setEditingActivity(act);
                              setIsActivityFormOpen(true);
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-900 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
                            title="Edit Agenda Kegiatan"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 4 CONTENT: REKOMENDASI KADER & KOMPETENSI ANGGOTA TERDEKAT */}
      {/* ========================================================================= */}
      {activeMainTab === 'RECOMMENDED_MEMBERS' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Recommender Banner Context */}
          <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white border border-teal-600/40 shadow-lg space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/40 rounded-full text-teal-200 text-xs font-bold">
                  <Award className="w-3.5 h-3.5 text-teal-300" />
                  <span>Geo-Competency Matching Engine</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-extrabold font-heading text-white">
                  Kader & Pemandu Wisata Terdekat: {userLocation.city ? `${userLocation.city}, ` : ''}{userLocation.regionName}
                </h3>
                <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl leading-relaxed">
                  {selectedTourForMatching ? (
                    <span>
                      Direkomendasikan khusus untuk destinasi <strong>{selectedTourForMatching.title}</strong> berdasarkan lokasi dan sertifikasi pemanduan/ekowisata.
                    </span>
                  ) : (
                    <span>
                      Sistem mencocokkan profil kader Pramuka Pariwisata bersertifikasi BNSP, pramuwisata HPI, dan penggiat konservasi di <strong>{userLocation.regionName}</strong> dan wilayah sekitarnya.
                    </span>
                  )}
                </p>
              </div>

              {/* Skills Quick Filter */}
              <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-teal-500/40">
                <button
                  onClick={() => setMemberSkillCategoryFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    memberSkillCategoryFilter === 'ALL'
                      ? 'bg-teal-400 text-slate-950 shadow-xs'
                      : 'text-teal-200 hover:text-white'
                  }`}
                >
                  Semua Keahlian
                </button>
                <button
                  onClick={() => setMemberSkillCategoryFilter('Pemanduan')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    memberSkillCategoryFilter === 'Pemanduan'
                      ? 'bg-teal-400 text-slate-950 shadow-xs'
                      : 'text-teal-200 hover:text-white'
                  }`}
                >
                  Tour Guide
                </button>
                <button
                  onClick={() => setMemberSkillCategoryFilter('Ekowisata')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    memberSkillCategoryFilter === 'Ekowisata'
                      ? 'bg-teal-400 text-slate-950 shadow-xs'
                      : 'text-teal-200 hover:text-white'
                  }`}
                >
                  Ekowisata
                </button>
              </div>
            </div>
          </div>

          {/* Members Scored Cards Grid */}
          {recommendedMembers.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
              <p className="font-bold text-slate-700 text-sm">Belum ada kader terdaftar di wilayah ini.</p>
              <p className="text-xs text-slate-400">Pilih provinsi lain atau gunakan tombol IP Saya.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedMembers.map((member) => {
                const isHighMatch = member.matchScore >= 80;
                return (
                  <div
                    key={member.id}
                    className={`bg-white rounded-2xl sm:rounded-3xl border transition-all flex flex-col justify-between overflow-hidden group hover:shadow-lg ${
                      isHighMatch ? 'border-teal-400 ring-2 ring-teal-400/30 shadow-md' : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="p-4 sm:p-5 space-y-4">
                      {/* Top Header Row with Match Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative flex-shrink-0">
                            <img
                              src={formatDriveImageUrl(member.avatarUrl) || member.avatarUrl || (member.gender === 'PEREMPUAN' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150')}
                              alt={member.fullName}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-purple-200 shadow-2xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = member.gender === 'PEREMPUAN'
                                  ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
                                  : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150';
                              }}
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white" title="Terverifikasi Aktif">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 font-heading truncate leading-snug">
                              {member.fullName}
                            </h4>
                            <p className="text-[11px] font-mono font-bold text-purple-700 truncate">
                              NTA: {member.nationalMemberNumber || 'KTA Terverifikasi'}
                            </p>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate mt-0.5">
                              <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                              <span className="truncate">{member.regencyName}, {member.provinceName}</span>
                            </p>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <div className="flex-shrink-0 text-right">
                          <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold flex items-center gap-1 ${
                            isHighMatch 
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                              : 'bg-teal-50 text-teal-800 border border-teal-200'
                          }`}>
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>{member.matchScore}% Relevan</span>
                          </span>
                          <p className="text-[9px] text-slate-400 mt-0.5 font-medium">{member.matchBadge}</p>
                        </div>
                      </div>

                      {/* Krida & Position */}
                      <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
                        <div className="min-w-0">
                          <span className="text-[10px] text-purple-900 font-bold uppercase tracking-wider block">Krida Utama</span>
                          <span className="font-extrabold text-purple-950 truncate block text-[11px]">
                            {member.krida || 'Krida Pemandu'}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-purple-200 text-purple-900 text-[10px] font-bold rounded-md flex-shrink-0">
                          {member.currentPosition || 'Kader Saka'}
                        </span>
                      </div>

                      {/* Bio */}
                      {member.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                          "{member.bio}"
                        </p>
                      )}

                      {/* Skills & Competencies Badges */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Kompetensi & Lisensi
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {member.skills && member.skills.map((skill) => (
                            <span 
                              key={skill.id}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold rounded-lg flex items-center gap-1 border border-slate-200/80"
                            >
                              <Award className="w-3 h-3 text-amber-600" />
                              <span>{skill.skillName}</span>
                            </span>
                          ))}
                          {member.certifications && member.certifications.map((cert) => (
                            <span
                              key={cert.id}
                              className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg flex items-center gap-1 border border-emerald-200"
                            >
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span className="truncate max-w-[180px]">{cert.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 sm:p-5 pt-0 space-y-2 border-t border-slate-100 bg-slate-50/50">
                      {/* WhatsApp Direct Contact Button */}
                      <a
                        href={`https://wa.me/${member.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Halo Kak ${member.fullName}, saya melihat profil dan kompetensi Anda di Portal Saka Pariwisata (${member.regencyName}, ${member.provinceName}). Saya ingin berkonsultasi mengenai pemanduan dan eksplorasi wisata${
                            selectedTourForMatching ? ` untuk paket "${selectedTourForMatching.title}"` : ''
                          }.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl sm:rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 min-h-[40px] shadow-xs active:scale-98"
                      >
                        <Phone className="w-3.5 h-3.5 text-white" />
                        <span>Hubungi Pemandu via WhatsApp</span>
                      </a>

                      {/* View KTA Digital & Credentials */}
                      <button
                        onClick={() => {
                          if (onSelectMember) onSelectMember(member);
                          else setModalMember(member);
                        }}
                        className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                        <span>Verifikasi KTA & Portofolio Resmi</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODALS INTEGRATION */}
      {/* ========================================================================= */}
      {modalTour && (
        <TourPackageDetailModal
          tour={modalTour}
          currentUser={currentUser}
          onClose={() => setModalTour(null)}
          onDelete={(tourId) => {
            storage.deleteTourPackage(tourId, currentUser);
            setModalTour(null);
          }}
        />
      )}

      {modalProduct && (
        <CulinarySouvenirDetailModal
          item={modalProduct}
          currentUser={currentUser}
          onClose={() => setModalProduct(null)}
          onDelete={(id) => {
            storage.deleteCulinarySouvenir(id, currentUser);
            setModalProduct(null);
          }}
        />
      )}

      {modalMember && (
        <MemberVerificationModal
          member={modalMember}
          onClose={() => setModalMember(null)}
        />
      )}

      {modalActivity && (
        <ActivityDetailModal
          activity={modalActivity}
          currentUser={currentUser}
          onClose={() => setModalActivity(null)}
          onRegisterSuccess={() => {
            refreshActivities();
            const updated = storage.getActivities().find(a => a.id === modalActivity.id);
            if (updated) setModalActivity(updated);
          }}
          onEditActivity={(act) => {
            setModalActivity(null);
            setEditingActivity(act);
            setIsActivityFormOpen(true);
          }}
          onDeleteActivity={(actId) => {
            storage.deleteActivity(actId, currentUser);
            refreshActivities();
            setModalActivity(null);
          }}
        />
      )}

      {isActivityFormOpen && (
        <ActivityFormModal
          currentUser={currentUser}
          initialActivity={editingActivity || undefined}
          onClose={() => {
            setIsActivityFormOpen(false);
            setEditingActivity(null);
          }}
          onSaveSuccess={() => {
            refreshActivities();
            setIsActivityFormOpen(false);
            setEditingActivity(null);
          }}
        />
      )}
    </div>
  );
};
