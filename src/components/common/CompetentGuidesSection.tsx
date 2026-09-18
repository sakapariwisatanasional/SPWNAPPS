import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  LayoutGrid,
  List,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  Phone,
} from 'lucide-react';
import { Member, Province } from '../../types';
import {
  formatDriveImageUrl,
  getDriveDirectFallbackUrl,
  getValidAvatarUrl,
} from './SakaLogo';

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

type ViewMode = 'grid' | 'compact';
type SortOption = 'competency' | 'name' | 'city';

interface KridaFilter {
  id: string;
  label: string;
  description: string;
}

const KRIDA_FILTERS: KridaFilter[] = [
  {
    id: 'ALL',
    label: 'Semua Krida',
    description: 'Semua spesialisasi',
  },
  {
    id: 'Krida Pemandu',
    label: 'Pemandu',
    description: 'Tour guide & storytelling',
  },
  {
    id: 'Krida Penyuluh',
    label: 'Penyuluh',
    description: 'Sapta Pesona & edukasi',
  },
  {
    id: 'Krida Mice & Event',
    label: 'MICE & Event',
    description: 'Event & atraksi',
  },
  {
    id: 'Krida Kuliner & Cinderamata',
    label: 'Kuliner & Kriya',
    description: 'Gastronomi & UMKM',
  },
];

const getMemberCompetencyScore = (member: Member): number => {
  const skills = member.skills?.length || 0;
  const certifications = member.certifications?.length || 0;

  return skills * 2 + certifications * 3;
};

/**
 * Membuat nilai hash sederhana dari ID anggota.
 *
 * Dipakai untuk menentukan urutan showcase yang stabil.
 * Berbeda dengan Math.random(), hasilnya tidak berubah setiap render.
 */
const getStableHash = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
};

export const CompetentGuidesSection: React.FC<CompetentGuidesSectionProps> = ({
  members,
  provinces,
  onOpenVerifyModal,
  selectedProvinceId: controlledProvinceId,
  onProvinceChange,
  title,
  subtitle,
  theme = 'dark',
  destinationContext,
}) => {
  const [internalProvinceId, setInternalProvinceId] = useState<string>('ALL');
  const [selectedKrida, setSelectedKrida] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isDetectingLocation, setIsDetectingLocation] =
    useState<boolean>(false);
  const [detectedLocationName, setDetectedLocationName] = useState<
    string | null
  >(null);

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('competency');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDirectory, setShowDirectory] = useState<boolean>(false);

  const [showcaseIndex, setShowcaseIndex] = useState<number>(0);
  const [showcaseKey, setShowcaseKey] = useState<number>(0);

  const isDark = theme === 'dark';
  const currentProvinceId =
    controlledProvinceId !== undefined
      ? controlledProvinceId
      : internalProvinceId;

  const itemsPerPage = viewMode === 'grid' ? 6 : 8;

  const handleProvinceSelect = (provinceId: string) => {
    setCurrentPage(1);

    if (onProvinceChange) {
      onProvinceChange(provinceId);
    } else {
      setInternalProvinceId(provinceId);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedKrida('ALL');
    setSortBy('competency');
    setCurrentPage(1);
    setDetectedLocationName(null);
    handleProvinceSelect('ALL');
  };

  /**
   * Deteksi wilayah menggunakan browser geolocation.
   *
   * Catatan:
   * koordinat tidak diterjemahkan menjadi alamat presisi.
   * Pemetaan di bawah hanya digunakan sebagai perkiraan wilayah
   * untuk beberapa area Indonesia yang umum digunakan.
   */
  const handleDetectLocation = () => {
    if (isDetectingLocation) return;

    setIsDetectingLocation(true);

    if (!('geolocation' in navigator)) {
      setIsDetectingLocation(false);
      setDetectedLocationName(
        'Lokasi tidak tersedia di perangkat ini. Menampilkan Jawa Barat.'
      );
      handleProvinceSelect('32');
      setShowDirectory(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        let closestProvinceId = '32';
        let locationName = 'Jawa Barat';

        if (
          latitude > -6.5 &&
          latitude < -5.8 &&
          longitude > 106.6 &&
          longitude < 107.0
        ) {
          closestProvinceId = '31';
          locationName = 'DKI Jakarta';
        } else if (
          latitude > -8.9 &&
          latitude < -7.9 &&
          longitude > 114.4 &&
          longitude < 115.8
        ) {
          closestProvinceId = '51';
          locationName = 'Bali';
        } else if (
          latitude > -8.2 &&
          latitude < -7.5 &&
          longitude > 110.0 &&
          longitude < 111.0
        ) {
          closestProvinceId = '34';
          locationName = 'DI Yogyakarta';
        } else if (
          latitude > -8.8 &&
          latitude < -6.8 &&
          longitude > 111.0 &&
          longitude < 114.5
        ) {
          closestProvinceId = '35';
          locationName = 'Jawa Timur';
        } else if (
          latitude > -7.8 &&
          latitude < -6.5 &&
          longitude > 108.8 &&
          longitude < 111.5
        ) {
          closestProvinceId = '33';
          locationName = 'Jawa Tengah';
        }

        setIsDetectingLocation(false);
        setDetectedLocationName(locationName);
        handleProvinceSelect(closestProvinceId);
        setShowDirectory(true);
      },
      () => {
        setIsDetectingLocation(false);
        setDetectedLocationName(
          'Lokasi tidak dapat diakses. Menampilkan Jawa Barat sebagai wilayah awal.'
        );
        handleProvinceSelect('32');
        setShowDirectory(true);
      },
      {
        timeout: 5000,
        maximumAge: 300000,
      }
    );
  };

  const filteredMembers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const result = members.filter((member) => {
      if (member.status !== 'ACTIVE') {
        return false;
      }

      if (
        currentProvinceId !== 'ALL' &&
        member.provinceId !== currentProvinceId
      ) {
        return false;
      }

      if (
        selectedKrida !== 'ALL' &&
        member.krida !== selectedKrida
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableValues = [
        member.fullName,
        member.regencyName,
        member.districtName,
        member.provinceName,
        member.krida,
        member.currentPosition,
        member.occupation,
        member.nationalMemberNumber,
        ...(member.skills || []).flatMap((skill) => [
          skill.skillName,
          skill.category,
        ]),
        ...(member.certifications || []).flatMap((certification) => [
          certification.name,
          certification.issuer,
        ]),
      ];

      return searchableValues.some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.fullName.localeCompare(b.fullName, 'id');
      }

      if (sortBy === 'city') {
        const cityA = a.regencyName || a.provinceName || '';
        const cityB = b.regencyName || b.provinceName || '';

        return cityA.localeCompare(cityB, 'id');
      }

      const scoreDifference =
        getMemberCompetencyScore(b) - getMemberCompetencyScore(a);

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      return a.fullName.localeCompare(b.fullName, 'id');
    });

    return result;
  }, [
    members,
    currentProvinceId,
    selectedKrida,
    searchQuery,
    sortBy,
  ]);

  /**
   * Anggota untuk showcase publik.
   *
   * Hanya anggota aktif yang mempunyai KTA dan foto.
   * Urutan dibuat stabil berdasarkan ID agar tidak berubah
   * setiap kali React melakukan re-render.
   */
  const showcaseMembers = useMemo(() => {
    return members
      .filter(
        (member) =>
          member.status === 'ACTIVE' &&
          Boolean((member.nationalMemberNumber || '').trim()) &&
          Boolean((member.avatarUrl || '').trim())
      )
      .sort((a, b) => {
        const hashDifference =
          getStableHash(String(a.id)) - getStableHash(String(b.id));

        if (hashDifference !== 0) {
          return hashDifference;
        }

        return a.fullName.localeCompare(b.fullName, 'id');
      });
  }, [members]);

  useEffect(() => {
    if (showDirectory || showcaseMembers.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setShowcaseIndex(
        (current) => (current + 1) % showcaseMembers.length
      );
      setShowcaseKey((current) => current + 1);
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, [showDirectory, showcaseMembers.length]);

  useEffect(() => {
    if (showcaseIndex >= showcaseMembers.length) {
      setShowcaseIndex(0);
    }
  }, [showcaseIndex, showcaseMembers.length]);

  /**
   * Pastikan halaman selalu valid setelah jumlah hasil berubah.
   */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMembers.length / itemsPerPage)
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;

    return filteredMembers.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredMembers, currentPage, itemsPerPage]);

  const showcaseMember = showcaseMembers[showcaseIndex];

  const getWhatsAppLink = (member: Member) => {
    let cleanPhone = (member.phone || '').replace(/[^0-9]/g, '');

    if (cleanPhone.startsWith('0')) {
      cleanPhone = `62${cleanPhone.slice(1)}`;
    } else if (cleanPhone && !cleanPhone.startsWith('62')) {
      cleanPhone = `62${cleanPhone}`;
    }

    if (!cleanPhone) {
      return '#';
    }

    const destinationText = destinationContext?.tourTitle
      ? `mengenai paket destinasi "${destinationContext.tourTitle}" di ${
          destinationContext.regencyName ||
          destinationContext.provinceName ||
          'daerah Kakak'
        }`
      : `mengenai layanan kepemanduan wisata / pendampingan kegiatan di wilayah ${
          member.regencyName || member.provinceName || 'Indonesia'
        }`;

    const message = encodeURIComponent(
      `Halo Kak ${member.fullName},\n\n` +
        `Saya melihat profil kompetensi Kakak di Direktori Saka Pariwisata Indonesia ` +
        `(${member.krida || 'Pemandu'}).\n\n` +
        `Saya ingin berkonsultasi ${destinationText}.\n\n` +
        `Terima kasih!`
    );

    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const sectionClasses = isDark
    ? 'text-slate-100'
    : 'text-slate-800';

  const panelClasses = isDark
    ? 'bg-slate-950/90 border-slate-800'
    : 'bg-white border-slate-200';

  const inputClasses = isDark
    ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20'
    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20';

  return (
    <section
      id="pemandu-kader-section"
      className={`py-12 sm:py-16 ${sectionClasses}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* =========================================================
            HEADER
        ========================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider ${
                isDark
                  ? 'bg-purple-950/70 border border-purple-800/70 text-purple-300'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Direktori Kader Berkompetensi</span>
            </div>

            <h2
              className={`mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {title ||
                'Temukan Pemandu & Fasilitator Wisata Berkompetensi'}
            </h2>

            <p
              className={`mt-3 text-xs sm:text-sm max-w-2xl leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              {subtitle ||
                'Hubungi langsung kader Pramuka Saka Pariwisata yang memiliki kompetensi kepemanduan, ekowisata, storytelling sejarah, dan keahlian lokal.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetectingLocation}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 border transition-all ${
                isDetectingLocation
                  ? 'opacity-70 cursor-wait'
                  : 'cursor-pointer'
              } ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-purple-300 hover:border-purple-600 hover:bg-slate-800'
                  : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              <Navigation
                className={`w-3.5 h-3.5 ${
                  isDetectingLocation ? 'animate-spin' : ''
                }`}
              />
              {isDetectingLocation
                ? 'Mendeteksi...'
                : 'Deteksi Wilayah'}
            </button>

            <div
              className={`px-4 py-2.5 rounded-xl border text-xs ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-slate-400'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span>Hasil: </span>
              <strong
                className={
                  isDark
                    ? 'text-emerald-400'
                    : 'text-emerald-700'
                }
              >
                {filteredMembers.length} kader
              </strong>
            </div>
          </div>
        </div>

        {/* =========================================================
            LOCATION NOTICE
        ========================================================== */}
        {detectedLocationName && (
          <div
            className={`px-4 py-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              isDark
                ? 'bg-emerald-950/40 border-emerald-900/70 text-emerald-200'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-emerald-400" />
              <span>
                Perkiraan wilayah:
                <strong className="ml-1">
                  {detectedLocationName}
                </strong>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setDetectedLocationName(null);
                handleProvinceSelect('ALL');
              }}
              className="font-bold underline hover:no-underline cursor-pointer shrink-0"
            >
              Lihat semua wilayah
            </button>
          </div>
        )}

        {/* =========================================================
            FILTER PANEL
        ========================================================== */}
        <div
          className={`rounded-3xl border p-4 sm:p-5 ${panelClasses}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            {/* Search */}
            <div className="lg:col-span-6 relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                  setShowDirectory(true);
                }}
                placeholder="Cari nama, keahlian, kota, krida, sertifikasi..."
                aria-label="Cari kader"
                className={`w-full h-11 pl-10 pr-10 rounded-xl border outline-none text-xs sm:text-sm font-medium transition-all focus:ring-4 ${inputClasses}`}
              />

              {searchQuery && (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Province */}
            <div className="lg:col-span-4 relative">
              <MapPin
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              />

              <select
                value={currentProvinceId}
                onChange={(event) => {
                  setShowDirectory(true);
                  handleProvinceSelect(event.target.value);
                }}
                aria-label="Filter provinsi"
                className={`w-full h-11 pl-10 pr-8 rounded-xl border outline-none appearance-none cursor-pointer text-xs sm:text-sm font-semibold transition-all focus:ring-4 ${inputClasses}`}
              >
                <option value="ALL">
                  Semua Provinsi
                </option>

                {provinces
                  .filter((province) => province.id !== '00')
                  .map((province) => {
                    const count = members.filter(
                      (member) =>
                        member.provinceId === province.id &&
                        member.status === 'ACTIVE'
                    ).length;

                    return (
                      <option
                        key={province.id}
                        value={province.id}
                      >
                        {province.name}
                        {count > 0 ? ` (${count})` : ''}
                      </option>
                    );
                  })}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:col-span-2 relative">
              <ArrowUpDown
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none"
              />

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as SortOption);
                  setCurrentPage(1);
                  setShowDirectory(true);
                }}
                aria-label="Urutkan hasil"
                className={`w-full h-11 pl-8 pr-5 rounded-xl border outline-none appearance-none cursor-pointer text-xs font-semibold transition-all focus:ring-4 ${inputClasses}`}
              >
                <option value="competency">
                  Kompetensi
                </option>
                <option value="name">
                  Nama A-Z
                </option>
                <option value="city">
                  Wilayah
                </option>
              </select>
            </div>
          </div>

          {/* Krida */}
          <div
            className={`mt-4 pt-4 border-t ${
              isDark
                ? 'border-slate-800'
                : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {KRIDA_FILTERS.map((filter) => {
                  const isSelected =
                    selectedKrida === filter.id;

                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => {
                        setSelectedKrida(filter.id);
                        setCurrentPage(1);
                        setShowDirectory(true);
                      }}
                      title={filter.description}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? isDark
                            ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                            : 'bg-slate-900 border-slate-900 text-white shadow-sm'
                          : isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Award
                        className={`w-3.5 h-3.5 ${
                          isSelected
                            ? 'text-amber-300'
                            : 'text-amber-400'
                        }`}
                      />
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              {/* View mode */}
              <div
                className={`inline-flex self-start xl:self-auto p-1 rounded-xl border ${
                  isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('grid');
                    setCurrentPage(1);
                    setShowDirectory(true);
                  }}
                  aria-label="Tampilan kartu"
                  aria-pressed={viewMode === 'grid'}
                  className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Kartu
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('compact');
                    setCurrentPage(1);
                    setShowDirectory(true);
                  }}
                  aria-label="Tampilan daftar ringkas"
                  aria-pressed={viewMode === 'compact'}
                  className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer ${
                    viewMode === 'compact'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Ringkas
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            PUBLIC SHOWCASE
        ========================================================== */}
        {!showDirectory ? (
          <div
            className={`overflow-hidden rounded-3xl border ${panelClasses}`}
          >
            <div className="p-5 sm:p-7 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                <div>
                  <p
                    className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.16em] ${
                      isDark
                        ? 'text-purple-300'
                        : 'text-emerald-700'
                    }`}
                  >
                    Keluarga Saka Pariwisata
                  </p>

                  <h3
                    className={`mt-1 text-xl sm:text-2xl font-extrabold font-heading ${
                      isDark
                        ? 'text-white'
                        : 'text-slate-900'
                    }`}
                  >
                    Terhubung dari berbagai wilayah Indonesia.
                  </h3>

                  <p
                    className={`mt-1 text-xs sm:text-sm ${
                      isDark
                        ? 'text-slate-400'
                        : 'text-slate-500'
                    }`}
                  >
                    Temukan kader aktif berdasarkan kompetensi
                    dan wilayah.
                  </p>
                </div>

                <div
                  className={`self-start px-3 py-2 rounded-xl border text-xs font-bold ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}
                >
                  {showcaseMembers.length} anggota dengan KTA
                </div>
              </div>

              {showcaseMember ? (
                <div
                  key={showcaseKey}
                  className="animate-in fade-in slide-in-from-bottom-3 duration-500"
                >
                  <div
                    className={`max-w-4xl mx-auto rounded-3xl border p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center gap-5 ${
                      isDark
                        ? 'bg-slate-900/70 border-slate-800'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0 mx-auto sm:mx-0">
                      <img
                        src={
                          formatDriveImageUrl(
                            showcaseMember.avatarUrl
                          ) ||
                          getValidAvatarUrl(
                            showcaseMember.avatarUrl,
                            showcaseMember.gender
                          )
                        }
                        alt={`Foto ${showcaseMember.fullName}`}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-purple-500/30 bg-slate-900"
                        loading="eager"
                        referrerPolicy="no-referrer"
                        onError={(event) => {
                          const image = event.currentTarget;
                          const fallback =
                            getDriveDirectFallbackUrl(
                              showcaseMember.avatarUrl
                            );

                          if (
                            fallback &&
                            image.src !== fallback
                          ) {
                            image.src = fallback;
                          }
                        }}
                      />

                      <span
                        className="absolute -right-1 -bottom-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-950 text-white flex items-center justify-center"
                        title="KTA tersedia"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    </div>

                    {/* Profile */}
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h4
                          className={`text-lg sm:text-xl font-extrabold font-heading ${
                            isDark
                              ? 'text-white'
                              : 'text-slate-900'
                          }`}
                        >
                          {showcaseMember.fullName}
                        </h4>

                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          <ShieldCheck className="w-3 h-3" />
                          KTA
                        </span>
                      </div>

                      <p
                        className={`mt-1 text-sm font-semibold ${
                          isDark
                            ? 'text-purple-300'
                            : 'text-emerald-700'
                        }`}
                      >
                        {showcaseMember.currentPosition ||
                          showcaseMember.krida ||
                          'Anggota Saka Pariwisata'}
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          isDark
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                      >
                        <MapPin className="inline w-3.5 h-3.5 mr-1 text-rose-400" />
                        {showcaseMember.regencyName ||
                          showcaseMember.districtName ||
                          showcaseMember.provinceName ||
                          'Indonesia'}
                        {showcaseMember.provinceName
                          ? ` · ${showcaseMember.provinceName}`
                          : ''}
                      </p>

                      <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-1.5">
                        {(showcaseMember.skills || [])
                          .slice(0, 3)
                          .map((skill) => (
                            <span
                              key={skill.id}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                                isDark
                                  ? 'bg-slate-950 border-slate-800 text-slate-300'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              {skill.skillName}
                            </span>
                          ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onOpenVerifyModal(showcaseMember)
                      }
                      className="shrink-0 mx-auto sm:mx-0 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Lihat Profil
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`py-10 text-center rounded-2xl border border-dashed ${
                    isDark
                      ? 'border-slate-800 text-slate-400'
                      : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <Compass className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-semibold">
                    Belum ada anggota dengan KTA dan foto
                    yang dapat ditampilkan.
                  </p>
                </div>
              )}

              {showcaseMembers.length > 1 && (
                <div
                  className="mt-5 flex items-center justify-center gap-1.5"
                  aria-label="Indikator anggota showcase"
                >
                  {showcaseMembers
                    .slice(
                      0,
                      Math.min(showcaseMembers.length, 7)
                    )
                    .map((member, index) => (
                      <span
                        key={member.id}
                        className={`h-1.5 rounded-full transition-all ${
                          index === showcaseIndex
                            ? 'w-5 bg-purple-400'
                            : 'w-1.5 bg-slate-600'
                        }`}
                      />
                    ))}
                </div>
              )}

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowDirectory(true)}
                  className={`px-4 py-2.5 rounded-xl border text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${
                    isDark
                      ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Jelajahi semua anggota
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* =====================================================
                DIRECTORY HEADER
            ====================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-base sm:text-lg font-extrabold ${
                      isDark
                        ? 'text-white'
                        : 'text-slate-900'
                    }`}
                  >
                    Direktori Anggota
                  </h3>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDark
                        ? 'bg-purple-950 text-purple-300'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {filteredMembers.length}
                  </span>
                </div>

                <p
                  className={`text-xs mt-0.5 ${
                    isDark
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  Hasil berdasarkan pencarian, wilayah, dan
                  spesialisasi.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDirectory(false)}
                className={`self-start sm:self-auto px-3 py-2 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-900'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Kembali
              </button>
            </div>

            {/* =====================================================
                EMPTY STATE
            ====================================================== */}
            {filteredMembers.length === 0 ? (
              <div
                className={`p-10 sm:p-12 text-center rounded-3xl border ${panelClasses}`}
              >
                <div
                  className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${
                    isDark
                      ? 'bg-slate-900'
                      : 'bg-slate-100'
                  }`}
                >
                  <Compass className="w-7 h-7 text-slate-500" />
                </div>

                <h3
                  className={`mt-4 text-base font-bold ${
                    isDark
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                >
                  Tidak ada anggota yang cocok
                </h3>

                <p
                  className={`mt-1 max-w-md mx-auto text-xs leading-relaxed ${
                    isDark
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  Belum ada kader aktif yang sesuai dengan
                  kombinasi pencarian dan filter saat ini.
                </p>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset Filter
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              /* ===================================================
                 GRID VIEW
              ==================================================== */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                {paginatedMembers.map((member) => {
                  const avatar =
                    formatDriveImageUrl(member.avatarUrl) ||
                    getValidAvatarUrl(
                      member.avatarUrl,
                      member.gender
                    );

                  const topSkills = (
                    member.skills || []
                  ).slice(0, 3);

                  const topCertification =
                    member.certifications?.[0];

                  const waLink = getWhatsAppLink(member);

                  return (
                    <article
                      key={member.id}
                      className={`group rounded-3xl border overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 hover:border-purple-700/70'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="p-5">
                        {/* Identity */}
                        <div className="flex items-start gap-3.5">
                          <div className="relative shrink-0">
                            <img
                              src={avatar}
                              alt={`Foto ${member.fullName}`}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 rounded-2xl object-cover border border-purple-500/30 bg-slate-900"
                              onError={(event) => {
                                const image =
                                  event.currentTarget;
                                const fallback =
                                  getDriveDirectFallbackUrl(
                                    member.avatarUrl
                                  );

                                if (
                                  fallback &&
                                  image.src !== fallback
                                ) {
                                  image.src = fallback;
                                }
                              }}
                            />

                            <span
                              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-slate-950"
                              title="Anggota aktif"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <span
                              className={`inline-flex max-w-full px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wide ${
                                isDark
                                  ? 'bg-purple-950/70 text-purple-300'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              <span className="truncate">
                                {member.krida ||
                                  'Kader Pariwisata'}
                              </span>
                            </span>

                            <h3
                              className={`mt-2 text-base font-extrabold font-heading truncate ${
                                isDark
                                  ? 'text-white'
                                  : 'text-slate-900'
                              }`}
                            >
                              {member.fullName}
                            </h3>

                            <div
                              className={`mt-1 flex items-start gap-1 text-xs ${
                                isDark
                                  ? 'text-slate-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-400" />
                              <span className="line-clamp-2">
                                {member.districtName
                                  ? `${member.districtName}, `
                                  : ''}
                                {member.regencyName ||
                                  member.provinceName ||
                                  'Indonesia'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bio */}
                        <p
                          className={`mt-4 text-xs leading-relaxed line-clamp-2 ${
                            isDark
                              ? 'text-slate-300'
                              : 'text-slate-600'
                          }`}
                        >
                          {member.bio ||
                            member.occupation ||
                            'Kader aktif Saka Pariwisata yang siap mendukung kegiatan pariwisata dan kepemanduan.'}
                        </p>

                        {/* Skills */}
                        <div className="mt-4 flex flex-wrap gap-1.5 min-h-[26px]">
                          {topSkills.map((skill) => (
                            <span
                              key={skill.id}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold border ${
                                isDark
                                  ? 'bg-slate-900 border-slate-800 text-slate-300'
                                  : 'bg-slate-50 border-slate-200 text-slate-600'
                              }`}
                            >
                              {skill.skillName}
                            </span>
                          ))}

                          {topCertification && (
                            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500">
                              {topCertification.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        className={`mt-auto p-3 border-t flex items-center justify-between gap-2 ${
                          isDark
                            ? 'bg-slate-900/50 border-slate-800'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            onOpenVerifyModal(member)
                          }
                          className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                            isDark
                              ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                          Detail KTA
                        </button>

                        {member.phone ? (
                          <a
                            href={
                              waLink !== '#'
                                ? waLink
                                : `tel:${member.phone}`
                            }
                            target={
                              waLink !== '#'
                                ? '_blank'
                                : undefined
                            }
                            rel={
                              waLink !== '#'
                                ? 'noopener noreferrer'
                                : undefined
                            }
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Chat WA
                            {waLink !== '#' && (
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            )}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenVerifyModal(member)
                            }
                            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Lihat Profil
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* ===================================================
                 COMPACT VIEW
              ==================================================== */
              <div className="space-y-2.5">
                {paginatedMembers.map((member) => {
                  const avatar =
                    formatDriveImageUrl(member.avatarUrl) ||
                    getValidAvatarUrl(
                      member.avatarUrl,
                      member.gender
                    );

                  const waLink = getWhatsAppLink(member);

                  return (
                    <article
                      key={member.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={avatar}
                          alt={`Foto ${member.fullName}`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-purple-500/30 bg-slate-900 shrink-0"
                          onError={(event) => {
                            const image =
                              event.currentTarget;
                            const fallback =
                              getDriveDirectFallbackUrl(
                                member.avatarUrl
                              );

                            if (
                              fallback &&
                              image.src !== fallback
                            ) {
                              image.src = fallback;
                            }
                          }}
                        />

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`font-bold text-sm truncate ${
                                isDark
                                  ? 'text-white'
                                  : 'text-slate-900'
                              }`}
                            >
                              {member.fullName}
                            </h3>

                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              Aktif
                            </span>
                          </div>

                          <p
                            className={`mt-0.5 text-xs truncate ${
                              isDark
                                ? 'text-slate-400'
                                : 'text-slate-500'
                            }`}
                          >
                            {member.currentPosition ||
                              member.krida ||
                              'Anggota Saka Pariwisata'}
                          </p>

                          <p
                            className={`mt-0.5 text-xs truncate ${
                              isDark
                                ? 'text-slate-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {member.regencyName ||
                              member.districtName ||
                              member.provinceName ||
                              'Indonesia'}
                            {member.provinceName
                              ? ` · ${member.provinceName}`
                              : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-stretch lg:self-auto">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenVerifyModal(member)
                          }
                          className={`flex-1 lg:flex-none px-3 py-2 rounded-xl text-xs font-bold border inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            isDark
                              ? 'border-slate-700 text-slate-300 hover:bg-slate-900'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                          KTA
                        </button>

                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            aria-label={`Telepon ${member.fullName}`}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                              isDark
                                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {member.phone && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                              Chat WA
                            </span>
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* =====================================================
                PAGINATION
            ====================================================== */}
            {filteredMembers.length > 0 && totalPages > 1 && (
              <div
                className={`pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDark
                    ? 'border-slate-800'
                    : 'border-slate-200'
                }`}
              >
                <p
                  className={`text-xs ${
                    isDark
                      ? 'text-slate-400'
                      : 'text-slate-500'
                  }`}
                >
                  Menampilkan{' '}
                  <strong
                    className={
                      isDark
                        ? 'text-slate-200'
                        : 'text-slate-800'
                    }
                  >
                    {(currentPage - 1) * itemsPerPage + 1}
                    {' - '}
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredMembers.length
                    )}
                  </strong>{' '}
                  dari{' '}
                  <strong
                    className={
                      isDark
                        ? 'text-slate-200'
                        : 'text-slate-800'
                    }
                  >
                    {filteredMembers.length}
                  </strong>{' '}
                  kader
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.max(1, page - 1)
                      )
                    }
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 transition-all ${
                      currentPage === 1
                        ? 'opacity-40 cursor-not-allowed'
                        : 'cursor-pointer'
                    } ${
                      isDark
                        ? 'border-slate-700 text-slate-300 hover:bg-slate-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">
                      Sebelumnya
                    </span>
                  </button>

                  <span
                    className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-purple-300'
                        : 'bg-slate-50 border-slate-200 text-emerald-700'
                    }`}
                  >
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border inline-flex items-center gap-1.5 transition-all ${
                      currentPage === totalPages
                        ? 'opacity-40 cursor-not-allowed'
                        : 'cursor-pointer'
                    } ${
                      isDark
                        ? 'border-slate-700 text-slate-300 hover:bg-slate-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="hidden sm:inline">
                      Selanjutnya
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
