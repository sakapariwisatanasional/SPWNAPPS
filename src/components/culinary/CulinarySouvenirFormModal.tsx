import React, { useState, useEffect } from 'react';
import { 
  X, 
  Utensils, 
  Gift, 
  MapPin, 
  CheckCircle, 
  Sparkles, 
  Phone, 
  Tag, 
  BookOpen, 
  Store, 
  Image as ImageIcon,
  FolderOpen,
  ExternalLink,
  Compass,
  Camera,
  Tent,
  ShoppingBag,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { 
  CulinarySouvenirItem, 
  CurrentUser, 
  ProductKind, 
  KridaType, 
  KridaProductCategory, 
  Province, 
  Regency, 
  District 
} from '../../types';
import { storage } from '../../services/storage';
import { PROVINCES_DATA, REGENCIES_DATA, getDistrictsForRegency } from '../../data/indonesiaTerritories';
import { GOOGLE_DRIVE_MAIN_FOLDER, formatGoogleDriveUrl } from '../../services/driveRepository';

interface CulinarySouvenirFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  editItem?: CulinarySouvenirItem | null;
  onSuccess: (savedItem: CulinarySouvenirItem) => void;
}

// Preset photo selections across all 4 Krida categories
const PRESET_PHOTOS_BY_KRIDA: Record<string, Array<{ label: string; url: string; category: KridaProductCategory; kind: ProductKind }>> = {
  'Krida Pemandu': [
    { label: 'Walking Tour Heritage & Kota Tua', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80', category: 'Pemanduan & Paket Wisata', kind: 'CINDERAMATA' },
    { label: 'Pemanduan Ekowisata & Trekking Hutan', url: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&auto=format&fit=crop&q=80', category: 'Pemanduan & Paket Wisata', kind: 'CINDERAMATA' },
    { label: 'Local Tour Guide Sejarah & Geopark', url: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&auto=format&fit=crop&q=80', category: 'Pemanduan & Paket Wisata', kind: 'CINDERAMATA' },
    { label: 'Tur Susur Sungai & Eko Bahari', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80', category: 'Pemanduan & Paket Wisata', kind: 'CINDERAMATA' },
  ],
  'Krida Penyuluh': [
    { label: 'Jasa Dokumentasi & Drone Wisata', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', category: 'Fotografi & Media Wisata', kind: 'CINDERAMATA' },
    { label: 'Fine Art Foto Lanskap & Kartu Pos', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80', category: 'Fotografi & Media Wisata', kind: 'CINDERAMATA' },
    { label: 'Peta Panduan Saku & Buklet Wisata', url: 'https://images.unsplash.com/photo-1524654458049-e36be0721fa2?w=800&auto=format&fit=crop&q=80', category: 'Jasa & Edukasi Wisata', kind: 'CINDERAMATA' },
    { label: 'Pelatihan Sapta Pesona & Edukasi Desa', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80', category: 'Jasa & Edukasi Wisata', kind: 'CINDERAMATA' },
  ],
  'Krida Mice & Event': [
    { label: 'Scout Camp & Glamping Edukasi', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80', category: 'MICE, Kemah & Atraksi', kind: 'CINDERAMATA' },
    { label: 'Tiket Sanggar Seni & Tari Tradisional', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80', category: 'MICE, Kemah & Atraksi', kind: 'CINDERAMATA' },
    { label: 'Paket Outbound & Team Building Saka', url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop&q=80', category: 'MICE, Kemah & Atraksi', kind: 'CINDERAMATA' },
    { label: 'Festival Wisata & Expo Kreatif', url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80', category: 'MICE, Kemah & Atraksi', kind: 'CINDERAMATA' },
  ],
  'Krida Kuliner & Cinderamata': [
    { label: 'Nasi Tutug Oncom & Masakan Tradisi', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80', category: 'Kuliner & Minuman Daerah', kind: 'KULINER' },
    { label: 'Minuman Herbal Rempah & Jamu Khas', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&auto=format&fit=crop&q=80', category: 'Kuliner & Minuman Daerah', kind: 'KULINER' },
    { label: 'Batik Tulis Motif Khas Daerah', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80', category: 'Kriya & Cinderamata Khas', kind: 'CINDERAMATA' },
    { label: 'Kriya Anyaman Bambu & Payung Geulis', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80', category: 'Kriya & Cinderamata Khas', kind: 'CINDERAMATA' },
    { label: 'Kain Tenun Ikat & Aksesoris Lokal', url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80', category: 'Kriya & Cinderamata Khas', kind: 'CINDERAMATA' },
    { label: 'Kopi Robusta/Arabika Single Origin', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80', category: 'Kuliner & Minuman Daerah', kind: 'KULINER' },
  ]
};

export const CulinarySouvenirFormModal: React.FC<CulinarySouvenirFormModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  editItem,
  onSuccess
}) => {
  const members = storage.getMembers();
  const currentMember = members.find(m => m.id === currentUser.memberId || m.userId === currentUser.id);

  // Form State
  const [selectedKrida, setSelectedKrida] = useState<KridaType>('Krida Kuliner & Cinderamata');
  const [kridaCategory, setKridaCategory] = useState<KridaProductCategory>('Kuliner & Minuman Daerah');
  const [kind, setKind] = useState<ProductKind>('KULINER');
  const [name, setName] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('Makanan Tradisional Khas');
  const [description, setDescription] = useState('');
  const [storyOrigin, setStoryOrigin] = useState('');
  const [priceEstimate, setPriceEstimate] = useState<number>(25000);
  const [priceUnit, setPriceUnit] = useState('per porsi');
  const [imageUrl, setImageUrl] = useState('');
  const [umkmName, setUmkmName] = useState('');
  const [contactPhone, setContactPhone] = useState('0812-3456-7890');
  const [address, setAddress] = useState('');
  const [tagInput, setTagInput] = useState('Halal, Khas Daerah, Binaan Saka');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Territory Selection
  const [provinceId, setProvinceId] = useState('32'); // Default Jawa Barat
  const [regencyId, setRegencyId] = useState('32.06'); // Default Kab. Tasikmalaya
  const [districtId, setDistrictId] = useState('32.06.01'); // Default Kwarran Ciawi
  const [gudepOrPangkalan, setGudepOrPangkalan] = useState('');

  // Available Regencies & Districts
  const [availableRegencies, setAvailableRegencies] = useState<Regency[]>([]);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);

  // Initialize or Reset Form
  useEffect(() => {
    if (!isOpen) return;

    if (editItem) {
      setSelectedKrida(editItem.krida || 'Krida Kuliner & Cinderamata');
      setKridaCategory(editItem.kridaCategory || 'Kuliner & Minuman Daerah');
      setKind(editItem.kind);
      setName(editItem.name);
      setCategoryLabel(editItem.categoryLabel);
      setDescription(editItem.description);
      setStoryOrigin(editItem.storyOrigin || '');
      setPriceEstimate(editItem.priceEstimate);
      setPriceUnit(editItem.priceUnit || 'per porsi');
      setImageUrl(editItem.imageUrl);
      setUmkmName(editItem.umkmName || '');
      setContactPhone(editItem.contactPhone || '');
      setAddress(editItem.address || '');
      setTagInput(editItem.tags.join(', '));
      setProvinceId(editItem.provinceId || '32');
      setRegencyId(editItem.regencyId || '32.06');
      setDistrictId(editItem.districtId || '32.06.01');
      setGudepOrPangkalan(editItem.gudepOrPangkalan || '');
    } else {
      const memberKrida = currentMember?.krida || 'Krida Kuliner & Cinderamata';
      setSelectedKrida(memberKrida);
      
      let initCategory: KridaProductCategory = 'Kuliner & Minuman Daerah';
      let initKind: ProductKind = 'KULINER';
      let initUnit = 'per porsi';
      let initPrice = 25000;
      let initLabel = 'Makanan Tradisional Khas';

      if (memberKrida === 'Krida Pemandu') {
        initCategory = 'Pemanduan & Paket Wisata';
        initKind = 'CINDERAMATA';
        initUnit = 'per grup / trip';
        initPrice = 150000;
        initLabel = 'Jasa Pemanduan Wisata Sejarah & Alam';
      } else if (memberKrida === 'Krida Penyuluh') {
        initCategory = 'Fotografi & Media Wisata';
        initKind = 'CINDERAMATA';
        initUnit = 'per sesi foto';
        initPrice = 200000;
        initLabel = 'Dokumentasi & Travel Content';
      } else if (memberKrida === 'Krida Mice & Event') {
        initCategory = 'MICE, Kemah & Atraksi';
        initKind = 'CINDERAMATA';
        initUnit = 'per pax / tiket';
        initPrice = 75000;
        initLabel = 'Tiket Atraksi & Paket Edukasi Kemah';
      }

      setKridaCategory(initCategory);
      setKind(initKind);
      setName('');
      setCategoryLabel(initLabel);
      setDescription('');
      setStoryOrigin('');
      setPriceEstimate(initPrice);
      setPriceUnit(initUnit);

      const presets = PRESET_PHOTOS_BY_KRIDA[memberKrida] || PRESET_PHOTOS_BY_KRIDA['Krida Kuliner & Cinderamata'];
      setImageUrl(presets[0]?.url || '');
      
      setUmkmName('');
      setContactPhone(currentMember?.phone || '0812-3456-7890');
      setAddress(currentMember?.address || '');
      setTagInput('Khas Daerah, Karya Anggota Saka, Ramah Wisatawan');
      
      const initProv = currentMember?.provinceId || (currentUser.jurisdictionId ? currentUser.jurisdictionId.split('.')[0] : '32');
      const initReg = currentMember?.regencyId || (currentUser.jurisdictionId?.length === 5 ? currentUser.jurisdictionId : '32.06');
      const initDist = currentMember?.districtId || '32.06.01';

      setProvinceId(initProv);
      setRegencyId(initReg);
      setDistrictId(initDist);
      setGudepOrPangkalan(currentMember?.gugusDepan || `Pangkalan Saka Pariwisata ${currentMember?.branchName || 'Kwarran Ciawi'}`);
    }
  }, [isOpen, editItem, currentMember, currentUser]);

  // Update regencies when province changes
  useEffect(() => {
    const regList = REGENCIES_DATA.filter(r => r.provinceId === provinceId);
    setAvailableRegencies(regList);
    if (regList.length > 0 && !regList.some(r => r.id === regencyId)) {
      setRegencyId(regList[0].id);
    }
  }, [provinceId]);

  // Update districts when regency changes
  useEffect(() => {
    const distList = getDistrictsForRegency(regencyId);
    setAvailableDistricts(distList);
    if (distList.length > 0 && !distList.some(d => d.id === districtId)) {
      setDistrictId(distList[0].id);
    }
  }, [regencyId]);

  if (!isOpen) return null;

  const currentProvObj = PROVINCES_DATA.find(p => p.id === provinceId);
  const currentRegObj = REGENCIES_DATA.find(r => r.id === regencyId);
  const currentDistObj = availableDistricts.find(d => d.id === districtId);

  const isOperator = ['SUPER_ADMIN', 'ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(currentUser.role);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name.trim()) {
      alert('Mohon isi nama produk atau layanan karya anggota.');
      return;
    }
    if (!description.trim()) {
      alert('Mohon isi rincian deskripsi produk atau spesifikasi layanan.');
      return;
    }
    if (!imageUrl.trim()) {
      alert('Mohon sertakan foto/media produk.');
      return;
    }

    setIsSubmitting(true);

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      name: name.trim(),
      kind,
      krida: selectedKrida,
      kridaCategory,
      categoryLabel: categoryLabel.trim(),
      description: description.trim(),
      storyOrigin: storyOrigin.trim() || undefined,
      priceEstimate: Number(priceEstimate) || 0,
      priceUnit: priceUnit.trim() || 'per unit',
      imageUrl: imageUrl.trim(),
      provinceId,
      provinceName: currentProvObj?.name || 'Jawa Barat',
      regencyId,
      regencyName: currentRegObj?.name || 'Kabupaten Tasikmalaya',
      districtId,
      districtName: currentDistObj ? `Kwarran ${currentDistObj.name}` : (currentMember?.branchName || 'Kwarran Ciawi'),
      gudepOrPangkalan: gudepOrPangkalan.trim() || undefined,
      authorMemberId: currentMember?.id || currentUser.memberId || currentUser.id,
      authorName: currentMember?.fullName || currentUser.name,
      authorNta: currentMember?.nationalMemberNumber || '00.00.00.000001',
      authorAvatarUrl: currentMember?.avatarUrl || currentUser.avatarUrl,
      authorRole: currentMember?.currentPosition || (isOperator ? 'Operator Wilayah' : 'Anggota Saka'),
      umkmName: umkmName.trim() || undefined,
      contactPhone: contactPhone.trim() || '0812-3456-7890',
      address: address.trim() || undefined,
      tags: tags.length > 0 ? tags : ['Khas Daerah', 'Karya Saka Pariwisata'],
      status: editItem?.status || (isOperator ? 'APPROVED' : 'PENDING_APPROVAL')
    };

    try {
      if (editItem) {
        const updated = storage.updateCulinarySouvenir(editItem.id, payload, currentUser);
        if (updated) {
          setIsSubmitting(false);
          onSuccess(updated);
          onClose();
        }
      } else {
        const created = storage.addCulinarySouvenir(payload, currentUser);
        setIsSubmitting(false);
        onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      setIsSubmitting(false);
      alert('Gagal menyimpan produk: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 text-white flex items-center justify-between flex-shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-3.5 z-10">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 bg-white/10 rounded-full text-purple-200">
                  Etalase 4 Krida Saka Pariwisata
                </span>
                {!isOperator && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Perlu Persetujuan Operator</span>
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold font-heading text-white mt-0.5">
                {editItem ? 'Edit Produk / Jasa Anggota' : 'Unggah Produk & Jasa Karya Anggota'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice for Member Submissions */}
        {!isOperator && (
          <div className="bg-purple-50/80 border-b border-purple-100 px-6 py-2.5 flex items-center gap-2 text-xs text-purple-900">
            <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>
              <strong>Alur Verifikasi:</strong> Produk yang Anda input akan masuk ke antrean persetujuan Operator Kwartir Wilayah setempat sebelum tayang di Galeri Nasional.
            </span>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* 1. Pilih 4 Krida Saka Pariwisata */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Krida Saka Pariwisata <span className="text-rose-500">*</span></span>
              <span className="text-[11px] font-normal text-slate-500">Pilih rumpun keahlian karya Anda</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { krida: 'Krida Pemandu' as KridaType, icon: Compass, title: 'Krida Pemandu', desc: 'Tour & Local Guide', color: 'border-blue-500 bg-blue-50/60 text-blue-900', defCat: 'Pemanduan & Paket Wisata' as KridaProductCategory, defKind: 'CINDERAMATA' as ProductKind, defUnit: 'per trip', defLabel: 'Pemanduan Wisata Lokal' },
                { krida: 'Krida Penyuluh' as KridaType, icon: Camera, title: 'Krida Penyuluh', desc: 'Foto, Video & Media', color: 'border-emerald-500 bg-emerald-50/60 text-emerald-900', defCat: 'Fotografi & Media Wisata' as KridaProductCategory, defKind: 'CINDERAMATA' as ProductKind, defUnit: 'per sesi', defLabel: 'Jasa Dokumentasi Wisata' },
                { krida: 'Krida Mice & Event' as KridaType, icon: Tent, title: 'Krida MICE', desc: 'Kemah & Atraksi', color: 'border-orange-500 bg-orange-50/60 text-orange-900', defCat: 'MICE, Kemah & Atraksi' as KridaProductCategory, defKind: 'CINDERAMATA' as ProductKind, defUnit: 'per tiket/pax', defLabel: 'Paket Kemah & Pertunjukan' },
                { krida: 'Krida Kuliner & Cinderamata' as KridaType, icon: Utensils, title: 'Kuliner & Kriya', desc: 'Makanan & Suvenir', color: 'border-amber-500 bg-amber-50/60 text-amber-900', defCat: 'Kuliner & Minuman Daerah' as KridaProductCategory, defKind: 'KULINER' as ProductKind, defUnit: 'per porsi/pcs', defLabel: 'Makanan Tradisional Khas' },
              ].map(kItem => {
                const Icon = kItem.icon;
                const isSelected = selectedKrida === kItem.krida;
                return (
                  <button
                    type="button"
                    key={kItem.krida}
                    onClick={() => {
                      setSelectedKrida(kItem.krida);
                      setKridaCategory(kItem.defCat);
                      setKind(kItem.defKind);
                      setPriceUnit(kItem.defUnit);
                      setCategoryLabel(kItem.defLabel);
                      const presets = PRESET_PHOTOS_BY_KRIDA[kItem.krida];
                      if (presets && presets.length > 0) {
                        setImageUrl(presets[0].url);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? `ring-2 ring-purple-600 border-purple-600 bg-purple-50/80`
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-purple-700" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{kItem.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{kItem.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Informasi Utama Produk */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span>Nama Produk, Jasa, atau Karya Wisata</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  selectedKrida === 'Krida Pemandu' ? 'Contoh: Walking Tour Sejarah Kota Tua & Cagar Budaya' :
                  selectedKrida === 'Krida Penyuluh' ? 'Contoh: Sesi Dokumentasi Drone & Travel Photography' :
                  selectedKrida === 'Krida Mice & Event' ? 'Contoh: Paket Edukasi Kemah Scout Glamping Pine Forest' :
                  'Contoh: Nasi Tutug Oncom Khas / Batik Tulis Pewarna Alami'
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Kategori Spesifik
              </label>
              <input
                type="text"
                value={categoryLabel}
                onChange={(e) => setCategoryLabel(e.target.value)}
                placeholder="Contoh: Tur Bersejarah / Makanan Tradisional / Kriya Bambu"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-purple-600 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Estimasi Biaya / Harga (Rp)
                </label>
                <input
                  type="number"
                  value={priceEstimate}
                  onChange={(e) => setPriceEstimate(Number(e.target.value))}
                  placeholder="25000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-purple-600 outline-none font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Satuan Harga
                </label>
                <input
                  type="text"
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  placeholder="per porsi / per pax / per trip / per pcs"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-purple-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Wilayah Kwartir Ranting & Cabang */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-800">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Wilayah Pangkalan / Kwartir Ranting Asal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kwarda (Provinsi)</label>
                <select
                  value={provinceId}
                  onChange={(e) => setProvinceId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                >
                  {PROVINCES_DATA.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kwarcab (Kab/Kota)</label>
                <select
                  value={regencyId}
                  onChange={(e) => setRegencyId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                >
                  {availableRegencies.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Kwarran (Kecamatan)</label>
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                >
                  {availableDistricts.map(d => (
                    <option key={d.id} value={d.id}>Kwarran {d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Pangkalan / Gugus Depan Penginput</label>
              <input
                type="text"
                value={gudepOrPangkalan}
                onChange={(e) => setGudepOrPangkalan(e.target.value)}
                placeholder="Contoh: Pangkalan Saka Pariwisata Kwarran Ciawi"
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none"
              />
            </div>
          </div>

          {/* 4. Foto Produk & Preset Cepat */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Foto Produk / Portofolio Jasa</span>
                <span className="text-rose-500">*</span>
              </label>
              <a
                href={GOOGLE_DRIVE_MAIN_FOLDER.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
              >
                <FolderOpen className="w-3 h-3 text-purple-600" />
                <span>Google Drive Repositori</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Quick Preset Selector for the chosen Krida */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(PRESET_PHOTOS_BY_KRIDA[selectedKrida] || PRESET_PHOTOS_BY_KRIDA['Krida Kuliner & Cinderamata']).map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setImageUrl(item.url)}
                  className={`group relative rounded-xl overflow-hidden border text-left cursor-pointer transition-all aspect-video ${
                    imageUrl === item.url ? 'ring-2 ring-purple-600 border-transparent' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end p-1.5">
                    <span className="text-[9px] font-bold text-white leading-tight line-clamp-1">{item.label}</span>
                  </div>
                  {imageUrl === item.url && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center shadow-xs">
                      <CheckCircle className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  const val = e.target.value;
                  setImageUrl(formatGoogleDriveUrl(val));
                }}
                placeholder="Tempel tautan Google Drive atau URL foto (e.g. https://drive.google.com/file/d/...)"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-purple-600"
                required
              />
            </div>
          </div>

          {/* 5. Deskripsi & Filosofi/Fasilitas */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Deskripsi Lengkap / Rincian Layanan / Spesifikasi <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan fasilitas yang termasuk, keunggulan, cita rasa bahan, durasi pemanduan, atau nilai tambah produk..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-purple-600 outline-none leading-relaxed"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Sejarah, Filosofi Budaya, atau Nilai Kearifan Lokal</span>
                <span className="text-[11px] font-normal text-slate-400">(Opsional)</span>
              </label>
              <textarea
                rows={2}
                value={storyOrigin}
                onChange={(e) => setStoryOrigin(e.target.value)}
                placeholder="Ceritakan latar belakang sejarah tradisi, filosofi motif kriya, atau keunikan destinasi lokal..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-purple-600 outline-none leading-relaxed"
              />
            </div>
          </div>

          {/* 6. Info Sentra / UMKM & WhatsApp Transaksi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-slate-500" />
                <span>Nama Sentra UMKM / Pangkalan Saka / Brand</span>
              </label>
              <input
                type="text"
                value={umkmName}
                onChange={(e) => setUmkmName(e.target.value)}
                placeholder="Contoh: Unit Usaha Mandiri Krida Saka"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Kontak Pemesanan Pengunjung</span>
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span>Tagar / Label Pencarian</span>
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Pemanduan, Ekowisata, Suvenir Lokal, Halal, Karya Saka"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="text-[11px] text-slate-500">
            Kreator: <strong className="text-slate-800">{currentMember?.fullName || currentUser.name}</strong> ({selectedKrida})
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 rounded-xl shadow-md shadow-purple-950/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {isSubmitting
                  ? 'Menyimpan...'
                  : editItem 
                    ? 'Simpan Perubahan' 
                    : isOperator 
                      ? 'Terbitkan Langsung ke Galeri' 
                      : 'Ajukan ke Operator Wilayah'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
