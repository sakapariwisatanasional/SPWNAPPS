import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sliders, 
  Check, 
  Save, 
  RotateCcw, 
  Sparkles, 
  CreditCard,
  Building,
  Calendar,
  Layers,
  FileDown,
  Eye,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { KtaCardSettings, Member } from '../../types';
import { storage, DEFAULT_KTA_SETTINGS } from '../../services/storage';
import { DigitalMemberCard } from './DigitalMemberCard';

interface KtaCardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const KtaCardCustomizerModal: React.FC<KtaCardCustomizerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'BACK' | 'FRONT'>('BACK');
  const [settings, setSettings] = useState<KtaCardSettings>(storage.getKtaSettings());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [regionProvinceId, setRegionProvinceId] = useState('');
  const [regionRegencyId, setRegionRegencyId] = useState('');
  const [regionDistrictId, setRegionDistrictId] = useState('');
  const [regionBusy, setRegionBusy] = useState(false);

  const provinces = storage.getProvinces();
  const regencies = regionProvinceId ? storage.getRegencies(regionProvinceId) : [];
  const districts = regionRegencyId ? storage.getDistricts(regionRegencyId) : [];

  const handleGenerateByRegion = () => {
    if (!regionProvinceId) {
      alert('Pilih minimal Provinsi terlebih dahulu.');
      return;
    }
    if (!confirm('Generate NTA untuk anggota yang belum memiliki nomor pada wilayah terpilih? Nomor NTA yang sudah ada tidak akan diubah.')) return;

    setRegionBusy(true);
    try {
      const result = storage.generateNationalMemberNumbersByRegion(
        regionProvinceId,
        regionRegencyId || undefined,
        regionDistrictId || undefined
      );
      alert(`Generate NTA selesai. ${result.updated} anggota mendapatkan nomor baru. ${result.skipped} anggota sudah memiliki NTA.`);
      onSuccess?.();
    } finally {
      setRegionBusy(false);
    }
  };

  const selectedProvince = provinces.find(p => p.id === regionProvinceId);
  const selectedRegency = regencies.find(r => r.id === regionRegencyId);
  const selectedDistrict = districts.find(d => d.id === regionDistrictId);

  // Ambil salah satu anggota untuk pratinjau kartu KTA
  const previewMember: Member = storage.getMembers()[0] || {
    id: 'member-01',
    userId: 'user-01',
    nationalMemberNumber: '00.00.00.000001',
    fullName: 'Rohadi Wijaya',
    nikMasked: '3200******0001',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    gender: 'LAKI_LAKI',
    birthPlace: 'Jakarta',
    birthDate: '2000-08-14',
    phone: '081234567890',
    email: 'admin@sakapariwisata.id',
    address: 'Kwarnas Gerakan Pramuka',
    provinceId: '00',
    provinceName: 'Kwartir Nasional',
    regencyId: '00.00',
    regencyName: 'Kwartir Nasional (Pusat)',
    districtId: '00.00.00',
    districtName: 'Pusat',
    branchId: 'branch-nasional',
    branchName: 'Pimpinan Saka Nasional',
    gugusDepan: 'Gudep Pariwisata Nasional',
    joinYear: 2024,
    currentPosition: 'Andalan Nasional',
    krida: 'Krida Bina Wisata',
    status: 'ACTIVE',
    educationLevel: 'S1',
    occupation: 'Pimpinan Saka',
    bio: 'Pramuka Pengabdi Pariwisata Indonesia.',
    skills: [],
    certifications: [],
    registeredAt: '2026-08-14T00:00:00.000Z'
  };

  useEffect(() => {
    if (isOpen) {
      setSettings(storage.getKtaSettings());
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    storage.saveKtaSettings(settings);
    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      setSaveSuccess(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 800);
  };

  const handleReset = () => {
    if (confirm('Kembalikan semua pengaturan desain KTA ke standar baku nasional?')) {
      setSettings(DEFAULT_KTA_SETTINGS);
      storage.saveKtaSettings(DEFAULT_KTA_SETTINGS);
      alert('Pengaturan KTA berhasil direset ke standar nasional.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-heading">Pengaturan Desain & Tampilan KTA Digital</h3>
              <p className="text-xs text-slate-300">
                Sesuaikan tanggal penerbitan, penandatanganan, kode barcode, ketentuan, dan tema KTA
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Kolom Kiri: Form Pengaturan (7 Cols) */}
          <div className="lg:col-span-7 p-6 overflow-y-auto custom-scrollbar space-y-6 border-r border-slate-100 text-xs">
            
            {/* Tab Navigasi Pengaturan */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('BACK')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'BACK' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bagian Belakang & Penandatangan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('FRONT')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                  activeTab === 'FRONT' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bagian Depan & Tema Warna
              </button>
            </div>

            {/* Penerbitan NTA berdasarkan wilayah */}
            <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/70 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-900 text-white flex items-center justify-center shrink-0"><MapPin className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-purple-950">Penerbitan Nomor Anggota Berdasarkan Wilayah</p>
                  <p className="text-[10px] text-purple-800 mt-0.5">Super Admin dapat menerbitkan NTA untuk anggota yang belum memiliki nomor. Format: PP.KK.KC.NNNNNN.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select value={regionProvinceId} onChange={e => { setRegionProvinceId(e.target.value); setRegionRegencyId(''); setRegionDistrictId(''); }} className="w-full px-3 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold">
                  <option value="">Pilih Provinsi</option>
                  {provinces.filter(p => p.id !== '00').map(p => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
                </select>
                <select value={regionRegencyId} disabled={!regionProvinceId} onChange={e => { setRegionRegencyId(e.target.value); setRegionDistrictId(''); }} className="w-full px-3 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold disabled:opacity-50">
                  <option value="">Semua Kabupaten/Kota</option>
                  {regencies.map(r => <option key={r.id} value={r.id}>{r.id} — {r.name}</option>)}
                </select>
                <select value={regionDistrictId} disabled={!regionRegencyId} onChange={e => setRegionDistrictId(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-purple-200 rounded-xl text-xs font-semibold disabled:opacity-50">
                  <option value="">Semua Kecamatan</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.id} — {d.name}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] text-purple-700">Wilayah: {selectedDistrict?.name || selectedRegency?.name || selectedProvince?.name || 'Belum dipilih'}</p>
                <button type="button" onClick={handleGenerateByRegion} disabled={!regionProvinceId || regionBusy} className="px-3.5 py-2 rounded-xl bg-purple-900 text-white font-bold text-[11px] hover:bg-purple-950 disabled:opacity-50 flex items-center gap-2">
                  <RefreshCw className={`w-3.5 h-3.5 ${regionBusy ? 'animate-spin' : ''}`} />
                  Generate NTA Wilayah
                </button>
              </div>
            </div>

            {activeTab === 'BACK' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-emerald-900">
                  <p className="font-bold">Format Resmi Bagian Belakang KTA</p>
                  <p className="text-[11px] text-emerald-800">
                    Bagian belakang KTA memuat ketentuan resmi, tanggal penetapan, kode barcode verifikasi identitas, serta nama & jabatan Ketua Pimpinan Saka Pariwisata Nasional.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lokasi & Tanggal Penerbitan (Di atas Barcode)
                  </label>
                  <input
                    type="text"
                    value={settings.issueLocationDate || ''}
                    onChange={(e) => setSettings({ ...settings, issueLocationDate: e.target.value })}
                    placeholder="Contoh: Jakarta, 14 Agustus 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Teks ini tampil tepat di atas kode barcode pada sudut kanan bawah belakang KTA.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nama Penandatangan (Di Bawah Barcode)
                    </label>
                    <input
                      type="text"
                      value={settings.signerName || ''}
                      onChange={(e) => setSettings({ ...settings, signerName: e.target.value })}
                      placeholder="Contoh: Reza Pahlevi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Jabatan Penandatangan (Di Bawah Nama)
                    </label>
                    <input
                      type="text"
                      value={settings.signerTitle || ''}
                      onChange={(e) => setSettings({ ...settings, signerTitle: e.target.value })}
                      placeholder="Contoh: Ketua Pimpinan Saka Pariwisata Nasional"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kustomisasi Nilai Barcode (Opsional)
                  </label>
                  <input
                    type="text"
                    value={settings.barcodeCustomValue || ''}
                    onChange={(e) => setSettings({ ...settings, barcodeCustomValue: e.target.value })}
                    placeholder="Kosongkan agar otomatis mengikuti NTA masing-masing anggota"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900 font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Jika dikosongkan, barcode di belakang KTA akan secara otomatis membaca nomor NTA resmi anggota pemilik kartu.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'FRONT' && (
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Teks Masa Berlaku Bagian Depan
                  </label>
                  <input
                    type="text"
                    value={settings.frontValidityText || ''}
                    onChange={(e) => setSettings({ ...settings, frontValidityText: e.target.value })}
                    placeholder="Contoh: Masa Berlaku: Selama Menjadi Anggota"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Opasitas Logo Latar Belakang Kartu</label>
                    <span className="font-mono font-bold text-emerald-700">
                      {Math.round((settings.bgOpacity ?? 0.10) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.40"
                    step="0.02"
                    value={settings.bgOpacity ?? 0.10}
                    onChange={(e) => setSettings({ ...settings, bgOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    URL Gambar Latar Belakang Kustom (Opsional)
                  </label>
                  <input
                    type="url"
                    value={settings.bgImageUrl || ''}
                    onChange={(e) => setSettings({ ...settings, bgImageUrl: e.target.value })}
                    placeholder="https://... (Kosongkan untuk latar lambang Saka resmi)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Pratinjau Kartu Interaktif (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 p-6 flex flex-col items-center justify-center space-y-4 text-white">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>PRATINJAU LANGSUNG (LIVE PREVIEW)</span>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Klik kartu untuk membalik dan melihat bagian depan / belakang
            </p>

            <div className="scale-95 sm:scale-100 transition-transform">
              <DigitalMemberCard
                member={previewMember}
                previewSettings={settings}
                showControls={false}
              />
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Standar Nasional</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan KTA</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
