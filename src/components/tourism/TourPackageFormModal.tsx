import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  MapPin, 
  Camera, 
  Compass, 
  Sparkles, 
  Check, 
  Calendar,
  FolderOpen,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react';
import { TourCategory, TourOwnerType, TourItinerary, Province, Regency, CurrentUser, TourPackage } from '../../types';
import { storage } from '../../services/storage';
import { GOOGLE_DRIVE_MAIN_FOLDER, formatGoogleDriveUrl } from '../../services/driveRepository';

interface TourPackageFormModalProps {
  isOpen: boolean;
  currentUser: CurrentUser;
  editTour?: TourPackage | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TourPackageFormModal: React.FC<TourPackageFormModalProps> = ({
  isOpen,
  currentUser,
  editTour,
  onClose,
  onSuccess
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TourCategory>('Wisata Alam');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80');
  
  const [selectedProvinceId, setSelectedProvinceId] = useState('32');
  const [selectedRegencyId, setSelectedRegencyId] = useState('32.06');
  const [locationAddress, setLocationAddress] = useState('');
  
  const [durationDays, setDurationDays] = useState(2);
  const [pricePerPerson, setPricePerPerson] = useState(350000);
  const [minCapacity, setMinCapacity] = useState(4);
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [lodgingType, setLodgingType] = useState('Homestay Desa Wisata');
  const [transportationType, setTransportationType] = useState('Shuttle / Mobil Antar-Jemput');
  const [contactPhone, setContactPhone] = useState('0812-3456-7890');
  const [contactEmail, setContactEmail] = useState('wisata@sakapariwisata.id');
  const [status, setStatus] = useState<'SUBMITTED' | 'APPROVED_PUBLISHED' | 'REJECTED' | 'ARCHIVED'>('APPROVED_PUBLISHED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [facilityList, setFacilityList] = useState<string[]>([
    'Pemandu Berlisensi Saka Pariwisata',
    'Tiket Masuk Daya Tarik Wisata',
    'Makan & Minum Tradisional',
    'Dokumentasi Perjalanan'
  ]);
  const [newFacilityInput, setNewFacilityInput] = useState('');

  const [itineraries, setItineraries] = useState<TourItinerary[]>([
    { day: 1, title: 'Kedatangan & Eksplorasi Kawasan Wisata', description: 'Briefing, sambutan hangat, dan jelajah destinasi utama.', timeRange: '08:00 - 17:00' },
    { day: 2, title: 'Workshop Budaya & Kepulangan', description: 'Mencicipi kuliner khas, belanja cinderamata, dan foto bersama.', timeRange: '08:00 - 12:00' }
  ]);

  useEffect(() => {
    setProvinces(storage.getProvinces());
  }, []);

  useEffect(() => {
    if (editTour) {
      setTitle(editTour.title || '');
      setDescription(editTour.description || '');
      setCategory(editTour.category || 'Wisata Alam');
      setCoverImage(editTour.coverImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80');
      setSelectedProvinceId(editTour.provinceId || '32');
      setSelectedRegencyId(editTour.regencyId || '32.06');
      setLocationAddress(editTour.locationAddress || '');
      setDurationDays(editTour.durationDays || 2);
      setPricePerPerson(editTour.pricePerPerson || 350000);
      setMinCapacity(editTour.minCapacity || 2);
      setMaxCapacity(editTour.maxCapacity || 20);
      setLodgingType(editTour.lodgingType || 'Homestay Desa Wisata');
      setTransportationType(editTour.transportationType || 'Shuttle / Mobil Antar-Jemput');
      setContactPhone(editTour.contactPhone || '0812-3456-7890');
      setContactEmail(editTour.contactEmail || 'wisata@sakapariwisata.id');
      setStatus(editTour.status || 'APPROVED_PUBLISHED');
      if (editTour.facilities && editTour.facilities.length > 0) {
        setFacilityList(editTour.facilities);
      }
      if (editTour.itinerary && editTour.itinerary.length > 0) {
        setItineraries(editTour.itinerary);
      }
    } else {
      setTitle('');
      setDescription('');
      setCategory('Wisata Alam');
      setCoverImage('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80');
      setLocationAddress('');
      setDurationDays(2);
      setPricePerPerson(350000);
      setMinCapacity(4);
      setMaxCapacity(20);
      setLodgingType('Homestay Desa Wisata');
      setTransportationType('Shuttle / Mobil Antar-Jemput');
      setContactPhone('0812-3456-7890');
      setContactEmail('wisata@sakapariwisata.id');
      setStatus('APPROVED_PUBLISHED');
      setFacilityList([
        'Pemandu Berlisensi Saka Pariwisata',
        'Tiket Masuk Daya Tarik Wisata',
        'Makan & Minum Tradisional',
        'Dokumentasi Perjalanan'
      ]);
      setItineraries([
        { day: 1, title: 'Kedatangan & Eksplorasi Kawasan Wisata', description: 'Briefing, sambutan hangat, dan jelajah destinasi utama.', timeRange: '08:00 - 17:00' },
        { day: 2, title: 'Workshop Budaya & Kepulangan', description: 'Mencicipi kuliner khas, belanja cinderamata, dan foto bersama.', timeRange: '08:00 - 12:00' }
      ]);
    }
  }, [editTour, isOpen]);

  useEffect(() => {
    if (selectedProvinceId) {
      const regs = storage.getRegencies(selectedProvinceId);
      setRegencies(regs);
      if (regs.length > 0 && !regs.some(r => r.id === selectedRegencyId)) {
        setSelectedRegencyId(regs[0].id);
      }
    }
  }, [selectedProvinceId]);

  if (!isOpen) return null;

  const categories: TourCategory[] = [
    'Wisata Alam',
    'Wisata Budaya',
    'Wisata Kuliner',
    'Desa Wisata',
    'Ekowisata',
    'Adventure',
    'Eduwisata',
    'Bahari',
    'Heritage & Sejarah',
    'MICE & Event'
  ];

  const isOperatorOrAdmin = [
    'SUPER_ADMIN', 
    'ADMIN_PROVINCE', 
    'ADMIN_REGENCY', 
    'ADMIN_BRANCH',
    'OPERATOR'
  ].includes(currentUser.role);

  const handleAddFacility = () => {
    if (newFacilityInput.trim()) {
      setFacilityList([...facilityList, newFacilityInput.trim()]);
      setNewFacilityInput('');
    }
  };

  const handleRemoveFacility = (idx: number) => {
    setFacilityList(facilityList.filter((_, i) => i !== idx));
  };

  const handleAddItineraryDay = () => {
    const nextDay = itineraries.length + 1;
    setItineraries([
      ...itineraries,
      { day: nextDay, title: `Aktivitas Hari ke-${nextDay}`, description: '', timeRange: '09:00 - 16:00' }
    ]);
  };

  const handleRemoveItineraryDay = (index: number) => {
    if (itineraries.length <= 1) return;
    const updated = itineraries.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      day: idx + 1
    }));
    setItineraries(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title || !description || !locationAddress) {
      alert('Harap isi judul, deskripsi, dan alamat lokasi wisata.');
      return;
    }

    setIsSubmitting(true);

    const currentProvince = provinces.find(p => p.id === selectedProvinceId);
    const currentRegency = regencies.find(r => r.id === selectedRegencyId);

    const ownerType: TourOwnerType = 
      currentUser.role === 'MEMBER' ? 'MEMBER' :
      currentUser.role === 'ADMIN_BRANCH' ? 'BRANCH' :
      currentUser.role === 'ADMIN_REGENCY' ? 'REGENCY' :
      currentUser.role === 'ADMIN_PROVINCE' ? 'PROVINCE' : 'PARTNER';

    try {
      if (editTour) {
        storage.updateTourPackage(
          editTour.id,
          {
            title,
            description,
            category,
            coverImage,
            provinceId: selectedProvinceId,
            provinceName: currentProvince?.name || editTour.provinceName || 'Jawa Barat',
            regencyId: selectedRegencyId,
            regencyName: currentRegency?.name || editTour.regencyName || 'Tasikmalaya',
            locationAddress,
            durationDays,
            pricePerPerson,
            minCapacity,
            maxCapacity,
            facilities: facilityList,
            lodgingType,
            transportationType,
            contactPhone,
            contactEmail,
            itinerary: itineraries,
            status: isOperatorOrAdmin ? status : editTour.status
          },
          currentUser
        );
        alert(`Perubahan paket wisata "${title}" berhasil disimpan!`);
      } else {
        storage.createTourPackage({
          title,
          description,
          category,
          coverImage,
          galleryImages: [],
          ownerType,
          ownerId: currentUser.memberId || currentUser.id,
          ownerName: currentUser.name,
          provinceId: selectedProvinceId,
          provinceName: currentProvince?.name || 'Jawa Barat',
          regencyId: selectedRegencyId,
          regencyName: currentRegency?.name || 'Tasikmalaya',
          districtName: 'Wilayah Terkait',
          branchName: currentUser.jurisdictionName,
          locationAddress,
          durationDays,
          pricePerPerson,
          minCapacity,
          maxCapacity,
          facilities: facilityList,
          lodgingType,
          transportationType,
          guideProvided: true,
          contactPhone,
          contactEmail,
          itinerary: itineraries
        });
        alert('Paket wisata berhasil diajukan!');
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      alert('Gagal memproses paket wisata: ' + err.message);
    }
  };

  const sampleCoverImages = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-heading">Ajukan Paket Wisata Saka Pariwisata</h3>
              <p className="text-xs text-slate-300">Direktori Pariwisata Komunitas Berbasis Potensi Daerah</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-xs">
          {/* Judul & Kategori */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Judul Paket Wisata *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Eksplorasi Desa Wisata & Tea Walk Priangan Timur"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-800 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Wisata *</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold text-emerald-900"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Harga per Peserta (Rp) *</label>
                <input
                  type="number"
                  required
                  value={pricePerPerson}
                  onChange={(e) => setPricePerPerson(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono font-bold text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deskripsi Lengkap Daya Tarik *</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ceritakan keunikan destinasi, kearifan lokal, dan pengalaman istimewa yang didapat wisatawan..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Lokasi Wilayah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Provinsi *</label>
              <select
                value={selectedProvinceId}
                onChange={(e) => setSelectedProvinceId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              >
                {provinces.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kabupaten/Kota *</label>
              <select
                value={selectedRegencyId}
                onChange={(e) => setSelectedRegencyId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              >
                {regencies.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Titik Lokasi / Meeting Point *</label>
              <input
                type="text"
                required
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="Desa Taraju, Kec. Taraju, Kab. Tasikmalaya"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Detail Operasional & Kontak */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Durasi (Hari)</label>
              <input
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Min. Peserta</label>
              <input
                type="number"
                min={1}
                value={minCapacity}
                onChange={(e) => setMinCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Maks. Peserta</label>
              <input
                type="number"
                min={1}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">WhatsApp Reservasi</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              />
            </div>
          </div>

          {/* Fasilitas */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block font-semibold text-slate-700">Fasilitas Termasuk</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFacilityInput}
                onChange={(e) => setNewFacilityInput(e.target.value)}
                placeholder="Tambah fasilitas (e.g. Asuransi Perjalanan, Tiket Masuk)"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
              />
              <button
                type="button"
                onClick={handleAddFacility}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold"
              >
                + Tambah
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {facilityList.map((fac, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs flex items-center gap-1.5 font-medium">
                  <span>{fac}</span>
                  <button type="button" onClick={() => handleRemoveFacility(idx)} className="text-emerald-700 hover:text-red-600">✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* Itinerary Rundown */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700">Rundown Per Hari (Itinerary)</label>
              <button
                type="button"
                onClick={handleAddItineraryDay}
                className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Hari</span>
              </button>
            </div>

            {itineraries.map((it, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900">Hari ke-{it.day}</span>
                  <input
                    type="text"
                    value={it.timeRange}
                    onChange={(e) => {
                      const updated = [...itineraries];
                      updated[idx].timeRange = e.target.value;
                      setItineraries(updated);
                    }}
                    placeholder="Waktu e.g. 08:00 - 17:00"
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs w-36"
                  />
                  {itineraries.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItineraryDay(idx)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={it.title}
                  onChange={(e) => {
                    const updated = [...itineraries];
                    updated[idx].title = e.target.value;
                    setItineraries(updated);
                  }}
                  placeholder="Judul kegiatan hari ini"
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                />
                <textarea
                  rows={2}
                  value={it.description}
                  onChange={(e) => {
                    const updated = [...itineraries];
                    updated[idx].description = e.target.value;
                    setItineraries(updated);
                  }}
                  placeholder="Rincian aktivitas & destinasi yang dikunjungi"
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            ))}
          </div>

          {/* Cover Image Picker & Google Drive Integration */}
          <div className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700">Foto Utama / Banner Paket</label>
              <a
                href={GOOGLE_DRIVE_MAIN_FOLDER.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
              >
                <FolderOpen className="w-3 h-3 text-emerald-600" />
                <span>Buka Google Drive Wisata</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Custom URL / Drive Input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => {
                  const val = e.target.value;
                  setCoverImage(formatGoogleDriveUrl(val));
                }}
                placeholder="Tempel link Google Drive atau URL gambar..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-800 text-xs"
              />
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-[10px] text-slate-400 font-medium">Pilihan Preset:</span>
              <div className="flex gap-2 flex-1">
                {sampleCoverImages.map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setCoverImage(img)}
                    className={`h-12 flex-1 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      coverImage === img ? 'border-emerald-600 scale-102 shadow-sm' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Cover option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Mengajukan...' : 'Ajukan Paket Wisata'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
