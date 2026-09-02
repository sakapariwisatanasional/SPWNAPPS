import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock, 
  Image as ImageIcon, 
  Tag, 
  Phone, 
  Building2, 
  Plus, 
  Trash2, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Info,
  Lock,
  Globe,
  AlertCircle
} from 'lucide-react';
import { Activity, CurrentUser, Province } from '../../types';
import { storage } from '../../services/storage';
import { REGENCIES_DATA } from '../../data/indonesiaTerritories';

interface ActivityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  initialActivity?: Activity | null;
  onSuccess: () => void;
}

const CATEGORY_OPTIONS = [
  'Perkemahan & Kemah Bakti',
  'Sertifikasi & Pelatihan Pemandu',
  'Festival & Expo Wisata',
  'Bakti Sapta Pesona & Konservasi',
  'Musyawarah & Lokakarya',
  'Eksplorasi Rute Ekowisata'
];

const PRESET_BANNERS = [
  { label: 'Perkemahan Alam', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Ekowisata Pegunungan', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Festival & Budaya', url: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Wisata Bahari', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&auto=format&fit=crop&q=80' },
  { label: 'MICE & Konvensi', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Desa Wisata Bali', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80' }
];

export const ActivityFormModal: React.FC<ActivityFormModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialActivity,
  onSuccess
}) => {
  const provinces = storage.getProvinces();

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isProvinceAdmin = currentUser.role === 'ADMIN_PROVINCE';
  const isRegencyAdmin = currentUser.role === 'ADMIN_REGENCY';
  const isBranchAdmin = currentUser.role === 'ADMIN_BRANCH';

  // Allowed scales based on role
  const availableLevels = useMemo(() => {
    if (isSuperAdmin) {
      return [
        { value: 'INTERNASIONAL', label: '🌟 Tingkat Internasional (WOSM / ASEAN / Global)' },
        { value: 'NASIONAL', label: '🇮🇩 Tingkat Nasional (Kwartir Nasional)' },
        { value: 'PROVINSI', label: '🏛️ Tingkat Daerah / Provinsi (Kwarda)' },
        { value: 'KABUPATEN', label: '🏢 Tingkat Cabang / Kab / Kota (Kwarcab)' },
        { value: 'RANTING', label: '🏕️ Tingkat Ranting / Kecamatan (Kwarran)' }
      ];
    } else if (isProvinceAdmin) {
      return [
        { value: 'PROVINSI', label: '🏛️ Tingkat Daerah / Provinsi (Kwarda)' },
        { value: 'KABUPATEN', label: '🏢 Tingkat Cabang / Kab / Kota (Kwarcab di Provinsi)' },
        { value: 'RANTING', label: '🏕️ Tingkat Ranting / Kecamatan (Kwarran di Provinsi)' }
      ];
    } else if (isRegencyAdmin) {
      return [
        { value: 'KABUPATEN', label: '🏢 Tingkat Cabang / Kab / Kota (Kwarcab)' },
        { value: 'RANTING', label: '🏕️ Tingkat Ranting / Kecamatan (Kwarran di Cabang)' }
      ];
    } else {
      return [
        { value: 'RANTING', label: '🏕️ Tingkat Ranting / Kecamatan (Kwarran)' }
      ];
    }
  }, [isSuperAdmin, isProvinceAdmin, isRegencyAdmin]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [organizerLevel, setOrganizerLevel] = useState<'INTERNASIONAL' | 'NASIONAL' | 'PROVINSI' | 'KABUPATEN' | 'RANTING'>('NASIONAL');
  const [organizerName, setOrganizerName] = useState('');
  
  const [provinceId, setProvinceId] = useState('32');
  const [provinceName, setProvinceName] = useState('Jawa Barat');
  const [regencyId, setRegencyId] = useState('');
  const [regencyName, setRegencyName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [locationAddress, setLocationAddress] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeString, setTimeString] = useState('08:00 WIB - Selesai');
  
  const [capacity, setCapacity] = useState<number>(100);
  const [feeType, setFeeType] = useState<'GRATIS' | 'BERBAYAR' | 'SUBSIDI'>('GRATIS');
  const [feeAmount, setFeeAmount] = useState<number>(0);
  
  const [bannerUrl, setBannerUrl] = useState(PRESET_BANNERS[0].url);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState<string[]>([
    'Anggota Aktif Saka Pariwisata atau Pramuka Penegak/Pandega',
    'Memiliki KTA Digital Terverifikasi',
    'Membawa perlengkapan kegiatan ramah lingkungan'
  ]);
  const [newReq, setNewReq] = useState('');

  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available regencies for selected province
  const availableRegencies = useMemo(() => {
    return REGENCIES_DATA.filter(r => r.provinceId === provinceId);
  }, [provinceId]);

  // Sync initial activity or default state with strict territorial bounds
  useEffect(() => {
    if (initialActivity) {
      setTitle(initialActivity.title || '');
      setCategory(initialActivity.category || CATEGORY_OPTIONS[0]);
      
      // Ensure level respects role
      const initialLvl = initialActivity.organizerLevel || 'PROVINSI';
      if (!isSuperAdmin && (initialLvl === 'NASIONAL' || initialLvl === 'INTERNASIONAL')) {
        setOrganizerLevel(isProvinceAdmin ? 'PROVINSI' : 'KABUPATEN');
      } else {
        setOrganizerLevel(initialLvl);
      }

      setOrganizerName(initialActivity.organizerName || '');
      setProvinceId(initialActivity.provinceId || '32');
      setProvinceName(initialActivity.provinceName || 'Jawa Barat');
      setRegencyId(initialActivity.regencyId || '');
      setRegencyName(initialActivity.regencyName || '');
      setLocationName(initialActivity.locationName || '');
      setLocationAddress(initialActivity.locationAddress || '');
      setStartDate(initialActivity.startDate || '');
      setEndDate(initialActivity.endDate || '');
      setTimeString(initialActivity.timeString || '08:00 WIB - Selesai');
      setCapacity(initialActivity.capacity || 100);
      setFeeType(initialActivity.feeType || 'GRATIS');
      setFeeAmount(initialActivity.feeAmount || 0);
      setBannerUrl(initialActivity.bannerUrl || initialActivity.coverImage || PRESET_BANNERS[0].url);
      setDescription(initialActivity.description || '');
      setRequirements(initialActivity.requirements || []);
      setContactPerson(initialActivity.contactPerson || '');
      setContactPhone(initialActivity.contactPhone || '');
      setContactEmail(initialActivity.contactEmail || '');
    } else {
      // Default new form state strictly scoped to current user role and territory
      setTitle('');
      setCategory(CATEGORY_OPTIONS[0]);

      if (isSuperAdmin) {
        setOrganizerLevel('NASIONAL');
        setOrganizerName('Pimpinan Saka Pariwisata Kwartir Nasional Gerakan Pramuka');
        setProvinceId('32');
        setProvinceName('Jawa Barat');
        setRegencyId('');
        setRegencyName('');
      } else if (isProvinceAdmin) {
        setOrganizerLevel('PROVINSI');
        const userProvId = currentUser.jurisdictionId || '32';
        setProvinceId(userProvId);
        const pObj = provinces.find(p => p.id === userProvId);
        const pName = pObj ? pObj.name : 'Jawa Barat';
        setProvinceName(pName);
        setOrganizerName(`Pimpinan Saka Pariwisata Kwarda ${pName}`);
        setRegencyId('');
        setRegencyName('');
      } else if (isRegencyAdmin) {
        setOrganizerLevel('KABUPATEN');
        const userRegId = currentUser.jurisdictionId || '32.04';
        const provCode = userRegId.split('.')[0] || '32';
        setProvinceId(provCode);
        const pObj = provinces.find(p => p.id === provCode);
        setProvinceName(pObj ? pObj.name : 'Jawa Barat');
        setRegencyId(userRegId);
        const regObj = REGENCIES_DATA.find(r => r.id === userRegId);
        const rName = regObj ? regObj.name : (currentUser.jurisdictionName?.replace('Kwarcab ', '') || 'Kabupaten Bandung');
        setRegencyName(rName);
        setOrganizerName(`Pimpinan Saka Pariwisata Kwarcab ${rName}`);
      } else {
        setOrganizerLevel('RANTING');
        setProvinceId('32');
        setProvinceName('Jawa Barat');
        setRegencyId('32.04');
        setRegencyName('Kabupaten Bandung');
        setOrganizerName(`Pimpinan Saka Pariwisata ${currentUser.jurisdictionName || 'Kwarran'}`);
      }

      setLocationName('');
      setLocationAddress('');
      setStartDate(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
      setEndDate(new Date(Date.now() + 86400000 * 9).toISOString().split('T')[0]);
      setTimeString('08:00 WIB - Selesai');
      setCapacity(100);
      setFeeType('GRATIS');
      setFeeAmount(0);
      setBannerUrl(PRESET_BANNERS[0].url);
      setDescription('');
      setRequirements([
        'Anggota Aktif Saka Pariwisata atau Pramuka Penegak/Pandega',
        'Memiliki KTA Digital Terverifikasi',
        'Membawa perlengkapan kegiatan ramah lingkungan'
      ]);
      setContactPerson(currentUser.name);
      setContactPhone('081299881122');
      setContactEmail(currentUser.email);
    }
  }, [initialActivity, isOpen, currentUser, isSuperAdmin, isProvinceAdmin, isRegencyAdmin]);

  if (!isOpen) return null;

  const handleProvinceChange = (pId: string) => {
    if (!isSuperAdmin) return; // Locked for operators
    setProvinceId(pId);
    const prov = provinces.find(p => p.id === pId);
    if (prov) {
      setProvinceName(prov.name);
      // Reset regency when province changes
      setRegencyId('');
      setRegencyName('');
    }
  };

  const handleRegencyChange = (rId: string) => {
    if (isRegencyAdmin || isBranchAdmin) return; // Locked for regency/branch operators
    setRegencyId(rId);
    const reg = REGENCIES_DATA.find(r => r.id === rId);
    if (reg) {
      setRegencyName(reg.name);
    } else {
      setRegencyName('');
    }
  };

  const handleAddRequirement = () => {
    if (newReq.trim()) {
      setRequirements([...requirements, newReq.trim()]);
      setNewReq('');
    }
  };

  const handleRemoveRequirement = (idx: number) => {
    setRequirements(requirements.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title.trim() || !locationName.trim()) {
      alert('Mohon isi Judul Kegiatan dan Lokasi Kegiatan.');
      return;
    }

    // Role-based validation guard
    if (!isSuperAdmin && (organizerLevel === 'NASIONAL' || organizerLevel === 'INTERNASIONAL')) {
      alert('Hanya Super Admin yang berwenang mendaftarkan kegiatan berskala Nasional atau Internasional.');
      return;
    }

    setIsSubmitting(true);

    const activityPayload: Partial<Activity> = {
      title,
      category,
      organizerLevel,
      organizerName,
      provinceId,
      provinceName,
      regencyId,
      regencyName,
      locationName,
      locationAddress,
      startDate,
      endDate,
      timeString,
      capacity: Number(capacity) || 100,
      feeType,
      feeAmount: Number(feeAmount) || 0,
      bannerUrl,
      coverImage: bannerUrl,
      description,
      requirements,
      contactPerson,
      contactPhone,
      contactEmail,
      isPublic: true,
      status: 'OPEN_REGISTRATION'
    };

    if (initialActivity) {
      storage.updateActivity(initialActivity.id, activityPayload);
    } else {
      storage.addActivity(activityPayload);
    }

    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-purple-950 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/80 text-purple-200 flex items-center justify-center font-bold">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-heading">
                {initialActivity ? 'Edit Agenda Kegiatan Saka Pariwisata' : 'Unggah Agenda Kegiatan Baru'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-purple-200">
                  {currentUser.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSuperAdmin 
                    ? 'bg-amber-400 text-amber-950' 
                    : 'bg-emerald-400 text-emerald-950'
                }`}>
                  {isSuperAdmin ? 'Super Admin Kwarnas' : `Operator ${currentUser.jurisdictionName || 'Wilayah'}`}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Role & Territorial Boundary Notice Banner */}
          {isSuperAdmin ? (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-950">
                  👑 Hak Akses Penuh Super Admin Kwartir Nasional
                </p>
                <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                  Anda berwenang mendaftarkan agenda kegiatan berskala <strong>Nasional</strong>, <strong>Internasional</strong>, maupun seluruh tingkatan Kwarda & Kwarcab di seluruh 38 provinsi Indonesia.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
              <Lock className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-sky-950">
                  🔒 Batasan Hak Akses Teritorial Operator ({currentUser.jurisdictionName || 'Cabang'})
                </p>
                <p className="text-xs text-sky-900/90 mt-0.5 leading-relaxed">
                  Sesuai ketentuan sistem, hanya <strong>Super Admin</strong> yang dapat mendaftarkan event berskala <strong>Nasional / Internasional</strong>. Anda hanya berwenang mendaftarkan agenda kegiatan dan event di wilayah cabang/yurisdiksi terdaftar Anda.
                </p>
              </div>
            </div>
          )}

          {/* 1. Informasi Utama */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Informasi Pokok Kegiatan
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Judul Agenda Kegiatan *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Kemah Bakti Saka Pariwisata Nasional 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kategori Kegiatan</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Tingkat / Skala Penyelenggara</label>
                  {!isSuperAdmin && (
                    <span className="text-[10px] text-sky-700 font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Wilayah Terkunci
                    </span>
                  )}
                </div>
                <select
                  value={organizerLevel}
                  onChange={(e) => setOrganizerLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                >
                  {availableLevels.map((lvl) => (
                    <option key={lvl.value} value={lvl.value}>{lvl.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Nama Lembaga / Kwartir Penyelenggara *</label>
              <input
                type="text"
                required
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="Contoh: Pimpinan Saka Pariwisata Kwartir Nasional Gerakan Pramuka"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Tanggal, Waktu & Kapasitas */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Jadwal & Kapasitas Peserta
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tanggal Mulai</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tanggal Selesai</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Waktu / Durasi</label>
                <input
                  type="text"
                  value={timeString}
                  onChange={(e) => setTimeString(e.target.value)}
                  placeholder="08:00 WIB - Selesai"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kapasitas Maksimal Peserta</label>
                <input
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Skema Biaya</label>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="GRATIS">Gratis (Free)</option>
                  <option value="SUBSIDI">Subsidi Kwartir</option>
                  <option value="BERBAYAR">Mandiri / Berbayar</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nominal Biaya (Rp)</label>
                <input
                  type="number"
                  disabled={feeType === 'GRATIS'}
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* 3. Lokasi & Wilayah Teritorial */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Lokasi & Wilayah Teritorial Penyelenggaraan
              </h3>
              {!isSuperAdmin && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  Yurisdiksi: {currentUser.jurisdictionName || 'Wilayah Operator'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Provinsi */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Provinsi Penyelenggaraan</label>
                  {!isSuperAdmin && (
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Terkunci
                    </span>
                  )}
                </div>
                {isSuperAdmin ? (
                  <select
                    value={provinceId}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {provinces.map((prov) => (
                      <option key={prov.id} value={prov.id}>{prov.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium flex items-center justify-between">
                    <span>{provinceName}</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </div>

              {/* Kabupaten / Kota */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Kabupaten / Kota</label>
                  {(isRegencyAdmin || isBranchAdmin) && (
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Terkunci
                    </span>
                  )}
                </div>
                {(isRegencyAdmin || isBranchAdmin) ? (
                  <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium flex items-center justify-between">
                    <span>{regencyName || 'Kabupaten Bandung'}</span>
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ) : (
                  <select
                    value={regencyId}
                    onChange={(e) => handleRegencyChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="">-- Seluruh Wilayah / Tingkat Provinsi --</option>
                    {availableRegencies.map((reg) => (
                      <option key={reg.id} value={reg.id}>{reg.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Tempat / Kawasan Wisata *</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Contoh: Bumi Perkemahan Laut Pasir Bromo"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Alamat Lengkap / Keterangan Titik Kumpul</label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="Contoh: Kawasan Bromo, Desa Ngadisari"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Banner Gambar & Deskripsi */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              4. Banner & Deskripsi Kegiatan
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Pilih Preset Gambar atau Masukkan URL Banner</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_BANNERS.map((preset) => (
                  <button
                    type="button"
                    key={preset.label}
                    onClick={() => setBannerUrl(preset.url)}
                    className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all cursor-pointer ${
                      bannerUrl === preset.url ? 'border-purple-600 ring-2 ring-purple-400' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white text-[9px] font-bold text-center py-0.5 truncate px-1">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>

              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none mt-2"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Deskripsi Rinci Agenda Kegiatan</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan maksud dan tujuan kegiatan, rangkaian acara harian, manfaat yang diperoleh peserta..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Dynamic Requirements */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Persyaratan & Ketentuan Peserta</label>
              <div className="space-y-2">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => {
                        const updated = [...requirements];
                        updated[idx] = e.target.value;
                        setRequirements(updated);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    placeholder="Tambah poin persyaratan baru..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Narahubung Pengunggah (WhatsApp Kontak Langsung) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              5. Kontak Narahubung Pengunggah (WhatsApp & Telepon)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Narahubung *</label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Kak Farhan Maulana"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nomor WhatsApp / Telp *</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="081223344556"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Alamat Email Panitia</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="panitia@sakapariwisata.id"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-purple-200" />
              <span>
                {isSubmitting 
                  ? 'Menyimpan...' 
                  : (initialActivity ? 'Simpan Perubahan Agenda' : 'Terbitkan Agenda Kegiatan')}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
