import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sliders, 
  CheckCircle2, 
  RotateCcw, 
  Save, 
  Sparkles, 
  Palette, 
  FileText, 
  Barcode as BarcodeIcon, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  RotateCw,
  HelpCircle,
  Image as ImageIcon,
  UploadCloud,
  Check,
  Info,
  Layers,
  Eye
} from 'lucide-react';
import { KtaCardSettings, KtaCardTheme, Member, CurrentUser } from '../../types';
import { storage, DEFAULT_KTA_SETTINGS } from '../../services/storage';
import { SAKA_CARD_BG_DRIVE_DIRECT_URL } from '../common/SakaLogo';
import { DigitalMemberCard } from './DigitalMemberCard';

interface KtaCardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser;
  sampleMember?: Member;
  onSaved?: (settings: KtaCardSettings) => void;
}

// Preset Background Artwork Designs for Saka Pariwisata
export const CARD_BACKGROUND_PRESETS: {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  recommendedOpacity: number;
}[] = [
  {
    id: 'saka_official_drive',
    name: 'Latar Resmi Saka Pariwisata (Google Drive)',
    category: 'Resmi Nasional',
    url: SAKA_CARD_BG_DRIVE_DIRECT_URL,
    description: 'Aset grafis resmi KTA Saka Pariwisata Kwartir Nasional (Standar Default Transparansi 10%)',
    recommendedOpacity: 0.10
  },
  {
    id: 'nature_ecotourism',
    name: 'Pesona Ekowisata & Hutan Tropis',
    category: 'Wisata Alam',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    description: 'Nuansa hutan tropis zamrud & pegunungan nusantara',
    recommendedOpacity: 0.10
  },
  {
    id: 'marine_archipelago',
    name: 'Bahari Nusantara & Kepulauan',
    category: 'Wisata Bahari',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
    description: 'Gradasi perairan biru toska pesisir Indonesia',
    recommendedOpacity: 0.10
  },
  {
    id: 'heritage_culture',
    name: 'Warisan Budaya & Siluet Candi',
    category: 'Wisata Budaya',
    url: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=1200&auto=format&fit=crop&q=80',
    description: 'Siluet kemegahan candi & arsitektur nusantara',
    recommendedOpacity: 0.10
  },
  {
    id: 'security_mesh',
    name: 'Gelombang Guilloche Modern',
    category: 'Pola Sekuriti',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    description: 'Pola sekuriti modern anti-pemalsuan bertekstur halus',
    recommendedOpacity: 0.10
  },
  {
    id: 'clean_gradient',
    name: 'Minimalis Elegan (Tanpa Gambar)',
    category: 'Warna Tema',
    url: '',
    description: 'Hanya menggunakan gradasi warna tema resmi KTA',
    recommendedOpacity: 0.0
  }
];

export const KtaCardCustomizerModal: React.FC<KtaCardCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  sampleMember,
  onSaved
}) => {
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');
  const [formSettings, setFormSettings] = useState<KtaCardSettings>(storage.getKtaSettings());
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fallback sample member for preview
  const previewMember: Member = sampleMember || storage.getMembers()[0] || {
    id: 'sample-001',
    fullName: 'M. Rizky Pratama',
    nationalMemberNumber: '32.06.01.202601',
    status: 'ACTIVE',
    provinceName: 'Jawa Barat',
    regencyName: 'Kab. Tasikmalaya',
    branchName: 'Kwarran Ciawi',
    gugusDepan: '04.091 - 04.092',
    krida: 'Krida Pemandu',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    registeredAt: '2026-01-15T08:00:00.000Z',
    provinceId: '32',
    regencyId: '32.06',
    branchId: 'b-01',
    gender: 'L',
    pob: 'Tasikmalaya',
    dob: '2004-05-12',
    nik: '3206011205040001',
    phone: '081234567890',
    email: 'rizky@sakapariwisata.id',
    address: 'Jl. Pariwisata No. 10',
    bloodType: 'O',
    religion: 'ISLAM',
    educationLevel: 'SMA/SMK',
    currentPosition: 'Anggota Aktif Krida Pemandu',
    joinYear: 2024,
    skills: [],
    certifications: [],
    verificationToken: 'VERIF-SAMPLE'
  };

  useEffect(() => {
    if (isOpen) {
      setFormSettings(storage.getKtaSettings());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Ukuran gambar latar maksimal 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setFormSettings(prev => ({
            ...prev,
            bgImageUrl: base64,
            bgOpacity: prev.bgOpacity ?? 0.10
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: typeof CARD_BACKGROUND_PRESETS[0]) => {
    setFormSettings(prev => ({
      ...prev,
      bgImageUrl: preset.url,
      bgOpacity: preset.recommendedOpacity > 0 ? preset.recommendedOpacity : 0.10
    }));
  };

  const handleTermChange = (index: number, value: string) => {
    const updated = [...formSettings.terms];
    updated[index] = value;
    setFormSettings({ ...formSettings, terms: updated });
  };

  const handleAddTerm = () => {
    const nextNum = formSettings.terms.length + 1;
    setFormSettings({
      ...formSettings,
      terms: [...formSettings.terms, `${nextNum}. Ketentuan baru KTA digital...`]
    });
  };

  const handleRemoveTerm = (index: number) => {
    const updated = formSettings.terms.filter((_, i) => i !== index);
    setFormSettings({ ...formSettings, terms: updated });
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan seluruh format tampilan KTA ke Standar Nasional resmi (Transparansi Latar 10%)?')) {
      setFormSettings(DEFAULT_KTA_SETTINGS);
    }
  };

  const handleSave = () => {
    const saved = storage.updateKtaSettings(formSettings, `${currentUser.name} (${currentUser.role})`);
    storage.addAuditLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'UPDATE_KTA_TEMPLATE',
      'MEMBER',
      'KTA_TEMPLATE',
      `Admin memperbarui desain latar belakang KTA (${formSettings.bgImageUrl ? 'Kustom' : 'Standar'}), transparansi (${Math.round((formSettings.bgOpacity ?? 0.10) * 100)}%), dan format otorisasi (${formSettings.signerName})`
    );

    setShowSuccessToast(true);
    if (onSaved) onSaved(saved);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 1200);
  };

  const themes: { id: KtaCardTheme; name: string; gradient: string; desc: string }[] = [
    {
      id: 'purple_saka',
      name: 'Ungu Saka Pariwisata (Standar Resmi)',
      gradient: 'from-purple-900 via-indigo-950 to-slate-950',
      desc: 'Warna identitas resmi Saka Pariwisata Kwartir Nasional'
    },
    {
      id: 'emerald_pesona',
      name: 'Hijau Pesona Alam & Ekowisata',
      gradient: 'from-emerald-900 via-teal-950 to-slate-950',
      desc: 'Gradien hijau zamrud bertema pariwisata berkelanjutan'
    },
    {
      id: 'indigo_navy',
      name: 'Biru Bahari & Maritim Nusantara',
      gradient: 'from-blue-900 via-indigo-950 to-slate-950',
      desc: 'Nuansa biru navy pariwisata bahari dan kepulauan'
    },
    {
      id: 'dark_slate',
      name: 'Hitam Slate Modern & Elegan',
      gradient: 'from-slate-800 via-slate-900 to-black',
      desc: 'Desain minimalis monokrom berkesan premium'
    },
    {
      id: 'gold_amber',
      name: 'Emas Kehormatan & Warisan Budaya',
      gradient: 'from-amber-900 via-stone-950 to-black',
      desc: 'Sentuhan keemasan khas warisan budaya nusantara'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-950 via-slate-900 to-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading">
                Pengaturan Desain & Tampilan KTA Digital
              </h2>
              <p className="text-xs text-purple-200/80">
                Sesuaikan tanggal penerbitan, penandatangan, kode barcode, ketentuan, dan tema KTA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Split View (Editor & Real-Time Preview) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* LEFT: Configuration Forms */}
          <div className="lg:col-span-7 p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Tabs Selector */}
            <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('back')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'back'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarcodeIcon className="w-4 h-4 text-purple-600" />
                <span>Bagian Belakang & Penandatangan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('front')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'front'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Palette className="w-4 h-4 text-purple-600" />
                <span>Bagian Depan & Tema Warna</span>
              </button>
            </div>

            {/* TAB 1: BACK SIDE (Penandatangan, Tanggal, Barcode, Ketentuan) */}
            {activeTab === 'back' && (
              <div className="space-y-5">
                <div className="bg-purple-50/70 border border-purple-200/70 rounded-2xl p-4 text-xs text-purple-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    Format Resmi Bagian Belakang KTA
                  </p>
                  <p className="text-purple-800/90 text-[11px] leading-relaxed">
                    Bagian belakang KTA memuat ketentuan resmi, tanggal penetapan, kode barcode verifikasi identitas, serta nama & jabatan Ketua Pimpinan Saka Pariwisata Nasional.
                  </p>
                </div>

                {/* 1. Lokasi & Tanggal */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-heading">
                    Lokasi & Tanggal Penerbitan (Di atas Barcode)
                  </label>
                  <input
                    type="text"
                    value={formSettings.issueLocationDate}
                    onChange={(e) => setFormSettings({ ...formSettings, issueLocationDate: e.target.value })}
                    placeholder="Contoh: Jakarta, 14 Agustus 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Teks ini tampil tepat di atas kode barcode pada sudut kanan bawah belakang KTA.
                  </p>
                </div>

                {/* 2. Pejabat Penandatangan & Jabatan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 font-heading">
                      Nama Penandatangan (Di Bawah Barcode)
                    </label>
                    <input
                      type="text"
                      value={formSettings.signerName}
                      onChange={(e) => setFormSettings({ ...formSettings, signerName: e.target.value })}
                      placeholder="Contoh: Rohadi Wijaya"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 font-heading">
                      Jabatan Penandatangan (Di Bawah Nama)
                    </label>
                    <input
                      type="text"
                      value={formSettings.signerTitle}
                      onChange={(e) => setFormSettings({ ...formSettings, signerTitle: e.target.value })}
                      placeholder="Contoh: Ketua Pimpinan Saka Pariwisata Nasional"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* 3. Barcode Settings */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-slate-800 font-heading">
                    Kustomisasi Nilai Barcode (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formSettings.barcodeCustomValue || ''}
                    onChange={(e) => setFormSettings({ ...formSettings, barcodeCustomValue: e.target.value })}
                    placeholder="Kosongkan untuk otomatis menggunakan Nomor Anggota Nasional (KTA)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-500">
                    Jika dikosongkan, setiap anggota akan memiliki barcode unik otomatis dari Nomor KTA masing-masing.
                  </p>
                </div>

                {/* 4. Ketentuan KTA */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 font-heading">
                      Teks Ketentuan & Tata Tertib KTA ({formSettings.terms.length} Butir)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddTerm}
                      className="text-xs text-purple-700 hover:text-purple-900 font-bold inline-flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Butir</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formSettings.terms.map((term, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-5 text-center text-xs font-bold text-slate-400 font-mono">
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          value={term}
                          onChange={(e) => handleTermChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        {formSettings.terms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTerm(index)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Header Belakang */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Judul Header Belakang
                    </label>
                    <input
                      type="text"
                      value={formSettings.backHeaderTitle}
                      onChange={(e) => setFormSettings({ ...formSettings, backHeaderTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Subjudul Header Belakang
                    </label>
                    <input
                      type="text"
                      value={formSettings.backHeaderSubtitle}
                      onChange={(e) => setFormSettings({ ...formSettings, backHeaderSubtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: FRONT SIDE & BACKGROUND DESIGN */}
            {activeTab === 'front' && (
              <div className="space-y-6">
                {/* 1. Background Artwork & Transparency Setting - PRIMARY SECTION */}
                <div className="bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-purple-50/90 p-5 rounded-3xl border border-purple-200/90 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-purple-950 font-heading">
                          Desain Gambar Latar Belakang Kartu (Card Background)
                        </h3>
                        <p className="text-[10px] text-purple-800/80">
                          Pilih template resmi, unggah karya grafis sendiri, atau gunakan tautan Google Drive
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[10px] font-semibold text-purple-900">Transparansi Latar:</span>
                      <span className="font-mono font-extrabold text-xs text-white bg-purple-700 px-2.5 py-0.5 rounded-full shadow-xs">
                        {Math.round((formSettings.bgOpacity ?? 0.90) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Preset Background Gallery */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-800 font-heading flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-600" />
                        <span>Pilihan Desain Latar Belakang KTA</span>
                      </label>
                      <span className="text-[10px] text-slate-500">Klik untuk langsung menerapkan</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {CARD_BACKGROUND_PRESETS.map((preset) => {
                        const isSelected = formSettings.bgImageUrl === preset.url || 
                          (!formSettings.bgImageUrl && preset.url === '') ||
                          (preset.id === 'saka_official_drive' && (!formSettings.bgImageUrl || formSettings.bgImageUrl === SAKA_CARD_BG_DRIVE_DIRECT_URL));

                        return (
                          <div
                            key={preset.id}
                            onClick={() => handleSelectPreset(preset)}
                            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 relative overflow-hidden group ${
                              isSelected
                                ? 'border-purple-600 bg-white ring-2 ring-purple-500/20 shadow-md'
                                : 'border-slate-200 bg-white/80 hover:bg-white hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {preset.url ? (
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-200 relative">
                                  <img
                                    src={preset.url}
                                    alt={preset.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-900 to-indigo-950 flex-shrink-0 flex items-center justify-center text-[10px] text-purple-300 font-bold border border-purple-500/40">
                                  Polos
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-800">
                                    {preset.category}
                                  </span>
                                </div>
                                <p className="text-[11px] font-bold text-slate-900 truncate mt-0.5">
                                  {preset.name}
                                </p>
                              </div>
                            </div>

                            <p className="text-[9.5px] text-slate-500 line-clamp-1 leading-snug">
                              {preset.description}
                            </p>

                            {isSelected && (
                              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Upload Custom File & URL Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                    {/* Direct File Upload */}
                    <div className="sm:col-span-5 bg-white p-3 rounded-2xl border border-purple-200/80 flex flex-col justify-between space-y-2">
                      <label className="block text-[11px] font-bold text-slate-800 font-heading">
                        Unggah Desain Sendiri
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-3 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-300/80 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                      >
                        <UploadCloud className="w-4 h-4 text-purple-700" />
                        <span>Pilih Gambar dari Perangkat</span>
                      </button>
                      <p className="text-[9px] text-slate-400 text-center">
                        Mendukung format PNG, JPG, WEBP (Maks 8MB)
                      </p>
                    </div>

                    {/* Google Drive / Image URL */}
                    <div className="sm:col-span-7 bg-white p-3 rounded-2xl border border-purple-200/80 space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-800 font-heading">
                        Tautan Google Drive / URL Gambar
                      </label>
                      <input
                        type="text"
                        value={formSettings.bgImageUrl || ''}
                        onChange={(e) => setFormSettings({ ...formSettings, bgImageUrl: e.target.value })}
                        placeholder="Tempel tautan Google Drive atau URL gambar..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                      <p className="text-[9.5px] text-purple-900/70 leading-tight">
                        💡 Tautan Google Drive publik akan otomatis dikonversi ke gambar resolusi tinggi.
                      </p>
                    </div>
                  </div>

                  {/* Transparency & Opacity Control (Default 90%) */}
                  <div className="bg-white p-4 rounded-2xl border border-purple-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-900 font-heading">
                            Tingkat Transparansi / Opasitas Latar Belakang
                          </label>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded-md">
                            Default: 10%
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Mengontrol kejernihan motif latar belakang terhadap keterbacaan data teks anggota.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-purple-700">
                          {Math.round((formSettings.bgOpacity ?? 0.10) * 100)}%
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormSettings({ ...formSettings, bgOpacity: 0.10 })}
                          className="text-[10px] font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-lg border border-purple-200 transition-colors"
                        >
                          Set ke 10% (Default Standar)
                        </button>
                      </div>
                    </div>

                    {/* Range Slider */}
                    <div className="space-y-1">
                      <input
                        type="range"
                        min="0.05"
                        max="1.0"
                        step="0.05"
                        value={formSettings.bgOpacity ?? 0.10}
                        onChange={(e) => setFormSettings({ ...formSettings, bgOpacity: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span className="font-bold text-purple-700">10% (Standar Default)</span>
                        <span>30% (Halus)</span>
                        <span>50% (Sedang)</span>
                        <span>75% (Tegas)</span>
                        <span>100% (Penuh)</span>
                      </div>
                    </div>

                    {/* Quick Preset Opacity Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-500 font-semibold mr-1">Pilihan Cepat:</span>
                      {[0.10, 0.20, 0.35, 0.50, 0.75, 0.90, 1.0].map((val) => {
                        const isCurrent = Math.abs((formSettings.bgOpacity ?? 0.10) - val) < 0.01;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setFormSettings({ ...formSettings, bgOpacity: val })}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-purple-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {Math.round(val * 100)}%{val === 0.10 && ' ⭐ (Default 10%)'}
                          </button>
                        );
                      })}
                    </div>

                    {/* Legibility Notice Box */}
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-950">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5 text-[11px] leading-relaxed">
                        <p className="font-bold text-emerald-900">
                          Jaminan Keterbacaan Data Anggota
                        </p>
                        <p className="text-emerald-800">
                          Transparansi default <strong>90%</strong> dirancang presisi untuk menjaga visibilitas detail gambar latar belakang sembari menjamin seluruh identitas (Nama Lengkap, NTA, Gudep, Ranting, Krida) dan QR Code verifikasi dapat dipindai dengan kontras tinggi tanpa silau.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Theme Selection */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold text-slate-800 font-heading">
                    Pilih Tema Warna Dasar & Gradien KTA
                  </label>
                  <div className="space-y-2">
                    {themes.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setFormSettings({ ...formSettings, cardTheme: t.id })}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          formSettings.cardTheme === t.id
                            ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${t.gradient} shadow-xs border border-white/20`} />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{t.name}</p>
                            <p className="text-[10px] text-slate-500">{t.desc}</p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          formSettings.cardTheme === t.id
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : 'border-slate-300'
                        }`}>
                          {formSettings.cardTheme === t.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Text Organisasi Depan & Validitas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 font-heading">
                      Judul Organisasi Depan
                    </label>
                    <input
                      type="text"
                      value={formSettings.frontOrganizationTitle}
                      onChange={(e) => setFormSettings({ ...formSettings, frontOrganizationTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5 font-heading">
                      Subjudul Organisasi Depan
                    </label>
                    <input
                      type="text"
                      value={formSettings.frontOrganizationSubtitle}
                      onChange={(e) => setFormSettings({ ...formSettings, frontOrganizationSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                {/* 4. Validity Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5 font-heading">
                    Teks Masa Berlaku
                  </label>
                  <input
                    type="text"
                    value={formSettings.frontValidityText}
                    onChange={(e) => setFormSettings({ ...formSettings, frontValidityText: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Real-Time Interactive Live Preview */}
          <div className="lg:col-span-5 p-6 bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
            <div className="text-center space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/30 text-purple-300 border border-purple-400/30 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-300" />
                Pratinjau Langsung (Live Preview)
              </span>
              <p className="text-[11px] text-slate-400">
                Klik kartu untuk membalik dan melihat bagian depan / belakang
              </p>
            </div>

            {/* Live 3D Card */}
            <div className="w-full flex justify-center py-2">
              <DigitalMemberCard
                member={previewMember}
                showControls={true}
                previewSettings={formSettings}
              />
            </div>

            <div className="text-[11px] text-slate-400 text-center max-w-xs space-y-1 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <p className="font-semibold text-purple-300">💡 Informasi Otoritas Admin</p>
              <p className="text-[10px] text-slate-400 leading-snug">
                Perubahan pada template ini akan langsung diterapkan pada seluruh KTA Digital anggota terdaftar di seluruh Indonesia.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar Nasional</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 active:bg-purple-900 rounded-xl transition-all shadow-md inline-flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan KTA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-xs font-bold font-heading">Berhasil Disimpan!</p>
            <p className="text-[10px] text-emerald-200">Format KTA Digital Nasional telah diperbarui.</p>
          </div>
        </div>
      )}
    </div>
  );
};
