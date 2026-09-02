import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Search, 
  Award, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  Mail, 
  ShieldCheck, 
  Compass, 
  Sparkles, 
  ChevronRight, 
  Filter, 
  Star, 
  BadgeCheck, 
  ExternalLink,
  Navigation,
  Globe,
  Briefcase,
  Layers,
  Send,
  UserCheck
} from 'lucide-react';
import { Member, Province, KridaType } from '../../types';
import { formatDriveImageUrl, getDriveDirectFallbackUrl, getValidAvatarUrl } from './SakaLogo';

interface CompetentGuidesSectionProps {
  members: Member[];
  provinces: Province[];
  onOpenVerifyModal: (member: Member) => void;
  selectedProvinceId?: string;
  onProvinceChange?: (provinceId: string) => void;
  title?: string;
  subtitle?: string;
  theme?: 'dark' | 'light';
  destinationContext?: {
    provinceName?: string;
    regencyName?: string;
    tourTitle?: string;
  };
}

export const CompetentGuidesSection: React.FC<CompetentGuidesSectionProps> = ({
  members,
  provinces,
  onOpenVerifyModal,
  selectedProvinceId: controlledProvinceId,
  onProvinceChange,
  title,
  subtitle,
  theme = 'dark',
  destinationContext
}) => {
  const [internalProvinceId, setInternalProvinceId] = useState<string>('ALL');
  const [selectedKrida, setSelectedKrida] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedLocationName, setDetectedLocationName] = useState<string | null>(null);

  // Sync controlled / internal state
  const currentProvinceId = controlledProvinceId !== undefined ? controlledProvinceId : internalProvinceId;

  const handleProvinceSelect = (pId: string) => {
    if (onProvinceChange) {
      onProvinceChange(pId);
    } else {
      setInternalProvinceId(pId);
    }
  };

  // Popular province quick filter buttons
  const popularProvinces = [
    { id: 'ALL', name: 'Semua Wilayah' },
    { id: '32', name: 'Jawa Barat' },
    { id: '31', name: 'DKI Jakarta' },
    { id: '34', name: 'DI Yogyakarta' },
    { id: '35', name: 'Jawa Timur' },
    { id: '51', name: 'Bali' },
    { id: '13', name: 'Sumatera Barat' },
    { id: '73', name: 'Sulawesi Selatan' },
    { id: '52', name: 'NTB' },
    { id: '53', name: 'NTT' }
  ];

  const kridaFilterList: { id: string; label: string; badge: string; color: string }[] = [
    { id: 'ALL', label: 'Semua Spesialisasi', badge: 'Semua Krida', color: 'slate' },
    { id: 'Krida Pemandu', label: 'Krida Pemandu', badge: 'Tour Guide & Storyteller', color: 'amber' },
    { id: 'Krida Penyuluh', label: 'Krida Penyuluh', badge: 'Sapta Pesona & Edukasi', color: 'emerald' },
    { id: 'Krida Mice & Event', label: 'Krida Mice & Event', badge: 'Event Organizer & Atraksi', color: 'purple' },
    { id: 'Krida Kuliner & Cinderamata', label: 'Krida Kuliner & Kriya', badge: 'Gastronomi & UMKM', color: 'rose' }
  ];

  // Geolocation detector to simulate / auto-detect user's closest province
  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          // Approximate Indonesian territory check
          let closestProv = '32'; // Default Jabar
          let locName = 'Jawa Barat (Sekitar Bandung/Jabodetabek)';

          if (latitude > -6.5 && latitude < -5.8 && longitude > 106.6 && longitude < 107.0) {
            closestProv = '31';
            locName = 'DKI Jakarta';
          } else if (latitude > -8.9 && latitude < -7.9 && longitude > 114.4 && longitude < 115.8) {
            closestProv = '51';
            locName = 'Bali';
          } else if (latitude > -8.2 && latitude < -7.5 && longitude > 110.0 && longitude < 111.0) {
            closestProv = '34';
            locName = 'DI Yogyakarta';
          } else if (latitude > -8.8 && latitude < -6.8 && longitude > 111.0 && longitude < 114.5) {
            closestProv = '35';
            locName = 'Jawa Timur';
          } else {
            closestProv = '32';
            locName = 'Jawa Barat';
          }

          setIsDetectingLocation(false);
          setDetectedLocationName(locName);
          handleProvinceSelect(closestProv);
        },
        () => {
          // Fallback if denied or unavailable
          setIsDetectingLocation(false);
          setDetectedLocationName('Jawa Barat (Default Lokasi Terdekat)');
          handleProvinceSelect('32');
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetectingLocation(false);
      handleProvinceSelect('32');
    }
  };

  // Filter members based on active status, competencies, province, and search query
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Must be active member
      if (m.status !== 'ACTIVE') return false;

      // Province filter
      if (currentProvinceId !== 'ALL' && m.provinceId !== currentProvinceId) {
        return false;
      }

      // Krida filter
      if (selectedKrida !== 'ALL' && m.krida !== selectedKrida) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.fullName.toLowerCase().includes(q);
        const matchCity = (m.regencyName || '').toLowerCase().includes(q) || (m.districtName || '').toLowerCase().includes(q);
        const matchKrida = (m.krida || '').toLowerCase().includes(q);
        const matchPosition = (m.currentPosition || '').toLowerCase().includes(q);
        const matchSkills = m.skills.some(s => s.skillName.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
        const matchCerts = m.certifications.some(c => c.name.toLowerCase().includes(q) || c.issuer.toLowerCase().includes(q));
        const matchNta = (m.nationalMemberNumber || '').toLowerCase().includes(q);

        if (!matchName && !matchCity && !matchKrida && !matchPosition && !matchSkills && !matchCerts && !matchNta) {
          return false;
        }
      }

      return true;
    });
  }, [members, currentProvinceId, selectedKrida, searchQuery]);

  // Helper to format clean WhatsApp link
  const getWhatsAppLink = (member: Member) => {
    let cleanPhone = (member.phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62' + cleanPhone;
    }

    const destinationText = destinationContext?.tourTitle 
      ? `mengenai paket destinasi "${destinationContext.tourTitle}" di ${destinationContext.regencyName || destinationContext.provinceName || 'daerah Kakak'}`
      : `mengenai layanan pemanduan wisata / pendampingan kegiatan di wilayah ${member.regencyName}, ${member.provinceName}`;

    const text = encodeURIComponent(
      `Halo Kak ${member.fullName},\n\nSaya melihat profil kompetensi Kakak di Direktori Saka Pariwisata Indonesia (${member.krida || 'Pemandu'}).\n\nSaya ingin berkonsultasi ${destinationText}.\n\nTerima kasih!`
    );

    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const isDark = theme === 'dark';

  return (
    <section className={`py-12 sm:py-16 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
              isDark 
                ? 'bg-purple-950/80 border border-purple-800/80 text-purple-300' 
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Direktori Pemandu & Kader Kompetensi Terdekat</span>
            </div>

            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {title || 'Temukan Pemandu & Fasilitator Wisata Berkompetensi'}
            </h2>

            <p className={`text-xs sm:text-sm max-w-2xl leading-relaxed ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {subtitle || 'Hubungi langsung kader Pramuka Saka Pariwisata yang memiliki sertifikasi kepemanduan, ekowisata, storytelling sejarah, dan keahlian lokal terdekat dengan wilayah destinasi Anda.'}
            </p>
          </div>

          {/* Quick Location Detector & Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-850 text-purple-300 border border-purple-800/60'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/20'
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              <span>{isDetectingLocation ? 'Mendeteksi Wilayah...' : 'Deteksi Wilayah Terdekat'}</span>
            </button>

            <div className={`px-3.5 py-2 rounded-xl text-xs font-semibold border ${
              isDark 
                ? 'bg-slate-950/80 border-slate-800 text-slate-300' 
                : 'bg-white border-slate-200 text-slate-700'
            }`}>
              <span>Tersedia: </span>
              <strong className={isDark ? 'text-emerald-400' : 'text-emerald-700'}>
                {filteredMembers.length} Kader Siap Dihubungi
              </strong>
            </div>
          </div>
        </div>

        {detectedLocationName && (
          <div className={`p-3 rounded-2xl text-xs flex items-center justify-between gap-3 border animate-in fade-in ${
            isDark 
              ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-200' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Lokasi terdekat terdeteksi: <strong>{detectedLocationName}</strong>. Menampilkan kader berkompetensi di sekitar wilayah ini.</span>
            </div>
            <button
              onClick={() => {
                setDetectedLocationName(null);
                handleProvinceSelect('ALL');
              }}
              className="text-[11px] underline font-bold cursor-pointer hover:opacity-80 flex-shrink-0"
            >
              Tampilkan Semua Wilayah
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className={`p-4 sm:p-5 rounded-3xl border shadow-lg space-y-4 ${
          isDark 
            ? 'bg-slate-950/90 border-slate-800' 
            : 'bg-white border-slate-200'
        }`}>
          
          {/* Row 1: Search & Province Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-7 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama pemandu, keahlian (BNSP, Storyteller, Ekowisata), kota/kabupaten..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium outline-none border transition-all ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                }`}
              />
            </div>

            {/* Province Select Dropdown */}
            <div className="md:col-span-5 flex items-center gap-2">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  value={currentProvinceId}
                  onChange={(e) => handleProvinceSelect(e.target.value)}
                  className={`w-full pl-10 pr-8 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold outline-none border cursor-pointer appearance-none ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white focus:border-purple-500'
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-emerald-500'
                  }`}
                >
                  <option value="ALL">📍 Semua Provinsi (Seluruh Indonesia)</option>
                  {provinces.filter(p => p.id !== '00').map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({members.filter(m => m.provinceId === p.id && m.status === 'ACTIVE').length} Pemandu)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Popular Province Fast Pills */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Pilih Provinsi Cepat:</span>
              {currentProvinceId !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => handleProvinceSelect('ALL')}
                  className="text-purple-400 hover:text-purple-300 cursor-pointer capitalize font-bold"
                >
                  Reset ke Semua
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar -mx-1 px-1">
              {popularProvinces.map((prov) => {
                const isSelected = currentProvinceId === prov.id;
                const count = prov.id === 'ALL' 
                  ? members.filter(m => m.status === 'ACTIVE').length 
                  : members.filter(m => m.provinceId === prov.id && m.status === 'ACTIVE').length;

                return (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => handleProvinceSelect(prov.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                      isSelected
                        ? isDark
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                          : 'bg-emerald-700 text-white shadow-md shadow-emerald-950/20'
                        : isDark
                          ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>{prov.name}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                      isSelected ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 3: Krida / Specialization Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800/40 pb-1 custom-scrollbar -mx-1 px-1">
            {kridaFilterList.map((k) => {
              const isSelected = selectedKrida === k.id;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setSelectedKrida(k.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 ${
                    isSelected
                      ? isDark
                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                        : 'bg-slate-900 text-white shadow-md'
                      : isDark
                        ? 'bg-slate-900/70 hover:bg-slate-850 text-slate-400 border border-slate-800'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{k.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Member Preview Cards Grid */}
        {filteredMembers.length === 0 ? (
          <div className={`p-12 text-center rounded-3xl border space-y-4 ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Compass className="w-12 h-12 mx-auto text-slate-500 stroke-1" />
            <div className="space-y-1">
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Tidak ada pemandu yang cocok dengan filter lokasi & kriteria
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Coba pilih provinsi lain, hapus kata kunci pencarian, atau reset filter Krida.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleProvinceSelect('ALL');
                setSelectedKrida('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>Reset Semua Filter</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => {
              const defaultAvatar = member.gender === 'PEREMPUAN'
                ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
              const avatar = formatDriveImageUrl(member.avatarUrl) || member.avatarUrl || defaultAvatar;
              const topSkills = member.skills.slice(0, 3);
              const topCert = member.certifications[0];
              const waLink = getWhatsAppLink(member);

              return (
                <div
                  key={member.id}
                  className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1.5 shadow-xl ${
                    isDark 
                      ? 'bg-slate-950/90 border-slate-800 hover:border-purple-500/60 hover:shadow-purple-950/30' 
                      : 'bg-white border-slate-200 hover:border-emerald-500/60 hover:shadow-emerald-950/15'
                  }`}
                >
                  <div className="p-6 space-y-4">
                    
                    {/* Top Identity Row */}
                    <div className="flex items-start gap-4">
                      {/* Avatar with Verified Ring */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={avatar}
                          alt={member.fullName}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40 group-hover:scale-105 transition-transform duration-300 shadow-md bg-slate-900"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            const directFallback = getDriveDirectFallbackUrl(member.avatarUrl);
                            if (directFallback && img.src !== directFallback) {
                              img.src = directFallback;
                            } else if (img.src !== defaultAvatar) {
                              img.src = defaultAvatar;
                            }
                          }}
                        />
                        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-slate-950" title="KTA Terverifikasi">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Info & Region */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            member.krida === 'Krida Pemandu'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                              : member.krida === 'Krida Penyuluh'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                              : member.krida === 'Krida Mice & Event'
                              ? 'bg-purple-950/80 text-purple-300 border border-purple-800/60'
                              : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                          }`}>
                            {member.krida || 'Kader Pariwisata'}
                          </span>
                        </div>

                        <h3 className={`font-bold text-base font-heading truncate leading-snug group-hover:text-purple-300 transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {member.fullName}
                        </h3>

                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                          <span className="truncate font-medium">
                            {member.districtName ? `${member.districtName}, ` : ''}{member.regencyName} • {member.provinceName}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 font-mono">
                          NTA: <span className="text-slate-300 font-semibold">{member.nationalMemberNumber || 'Terdaftar'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Bio Snippet */}
                    <p className={`text-xs line-clamp-2 leading-relaxed italic ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      "{member.bio || member.occupation || 'Kader aktif Saka Pariwisata berpengalaman dalam kepemanduan objek daya tarik wisata lokal.'}"
                    </p>

                    {/* Verified Competencies & SKK Badges */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/40">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Keahlian & Sertifikasi Kompetensi</span>
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {topSkills.map((sk) => (
                          <span
                            key={sk.id}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border ${
                              isDark 
                                ? 'bg-slate-900 border-slate-750 text-slate-200' 
                                : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            <BadgeCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span className="truncate max-w-[170px]">{sk.skillName}</span>
                          </span>
                        ))}

                        {topCert && (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-950/60 border border-amber-800/60 text-amber-300 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            <span className="truncate max-w-[170px]">{topCert.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className={`p-4 rounded-b-3xl border-t flex items-center justify-between gap-2 ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    {/* View KTA Modal */}
                    <button
                      type="button"
                      onClick={() => onOpenVerifyModal(member)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        isDark 
                          ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                      title="Lihat Profil KTA & SKK Lengkap"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Detail KTA</span>
                    </button>

                    {/* Direct Contact Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Phone button */}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                            isDark 
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                              : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                          }`}
                          title={`Telepon: ${member.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}

                      {/* WhatsApp Direct Chat (Primary Action) */}
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-950/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Hubungi langsung via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        <span>Chat WA</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
