import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Image as ImageIcon, 
  RotateCw, 
  User, 
  Info,
  Sliders,
  ZoomIn,
  ZoomOut,
  FolderOpen,
  ExternalLink
} from 'lucide-react';
import { Member, CurrentUser } from '../../types';
import { storage } from '../../services/storage';
import { spreadsheetService } from '../../services/spreadsheetService';
import { SakaLogo } from '../common/SakaLogo';
import { GOOGLE_DRIVE_MAIN_FOLDER, formatGoogleDriveUrl } from '../../services/driveRepository';

interface MemberPhotoEditModalProps {
  isOpen: boolean;
  member: Member | null;
  currentUser: CurrentUser;
  onClose: () => void;
  onSuccess?: (updatedMember: Member) => void;
}

// Koleksi preset pas foto resmi berlatar belakang standar KTA / Pramuka
const OFFICIAL_PRESETS = [
  {
    name: 'Seragam Pramuka Pria (Latar Merah)',
    gender: 'Laki-laki',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Seragam Pramuka Pria (Latar Biru)',
    gender: 'Laki-laki',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Seragam Saka Wanita (Latar Merah)',
    gender: 'Perempuan',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Seragam Saka Wanita Berhijab',
    gender: 'Perempuan',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Seragam Pembina Pria',
    gender: 'Laki-laki',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Seragam Pimpinan Saka',
    gender: 'Laki-laki',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Seragam Pramuka Putri (Latar Biru)',
    gender: 'Perempuan',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80'
  },
  {
    name: 'Seragam Saka Pariwisata Muda',
    gender: 'Laki-laki',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80'
  }
];

export const MemberPhotoEditModal: React.FC<MemberPhotoEditModalProps> = ({
  isOpen,
  member,
  currentUser,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (member) {
      setSelectedPhoto(member.avatarUrl);
      setCustomUrl(member.avatarUrl.startsWith('http') ? member.avatarUrl : '');
      setSaveSuccess(false);
      setZoomLevel(100);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSelectedPhoto(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!selectedPhoto) {
      alert('Silakan pilih atau unggah foto terlebih dahulu.');
      return;
    }

    setIsSaving(true);

    // Jika berupa base64 dan Google Apps Script aktif, kirim juga ke Drive
    if (selectedPhoto.startsWith('data:image')) {
      const cleanName = member.fullName.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `KTA_${member.nationalMemberNumber || member.id}_${cleanName}.jpg`;
      spreadsheetService.uploadImageToDrive(selectedPhoto, filename, 'MEMBER_AVATAR').catch(console.error);
    }

    const updated = storage.updateMemberPhoto(member.id, selectedPhoto, currentUser);
    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      if (updated && onSuccess) {
        onSuccess(updated);
      }
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-heading">Perbaiki Pas Foto Resmi KTA</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold rounded-full">
                  Sinkronisasi Profil User
                </span>
              </div>
              <p className="text-xs text-purple-200/80">
                Ubah atau sesuaikan pas foto {member.fullName} ({member.nationalMemberNumber || 'Anggota'})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Photo Selectors (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              {/* Tab Navigation */}
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'upload'
                      ? 'bg-white text-purple-950 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Unggah Berkas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('preset')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'preset'
                      ? 'bg-white text-purple-950 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Preset Resmi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('url')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'url'
                      ? 'bg-white text-purple-950 shadow-xs border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Tautan URL</span>
                </button>
              </div>

              {/* Tab 1: Upload File */}
              {activeTab === 'upload' && (
                <div className="space-y-3">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-purple-600 bg-purple-50' 
                        : 'border-slate-300 hover:border-purple-400 bg-slate-50/70 hover:bg-purple-50/30'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Klik untuk memilih file pas foto atau tarik berkas ke sini
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Format: PNG, JPG, JPEG, WEBP (Rasio standar 3x4 / 4x6, Maks. 5MB)
                    </p>
                  </div>

                  {/* Zoom / Framing Controls */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-700" />
                      Penyesuaian Skala Foto
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setZoomLevel(Math.max(80, zoomLevel - 10))}
                        className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Perkecil"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-slate-700 w-10 text-center">{zoomLevel}%</span>
                      <button
                        type="button"
                        onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
                        className="p-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Perbesar"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoomLevel(100)}
                        className="text-[10px] text-purple-700 font-bold px-2 py-1 bg-purple-50 rounded-lg hover:bg-purple-100"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Official Presets */}
              {activeTab === 'preset' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Pilih pas foto seragam resmi Pramuka & Saka:</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-mono">
                      {OFFICIAL_PRESETS.length} Pilihan
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 custom-scrollbar">
                    {OFFICIAL_PRESETS.map((preset, idx) => {
                      const isSelected = selectedPhoto === preset.url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedPhoto(preset.url)}
                          className={`relative group rounded-2xl overflow-hidden border-2 text-left transition-all aspect-[3/4] ${
                            isSelected 
                              ? 'border-purple-600 ring-2 ring-purple-600/30 scale-95 shadow-md' 
                              : 'border-slate-200 hover:border-purple-300 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5 text-white">
                            <p className="text-[8.5px] font-bold leading-tight line-clamp-1">{preset.gender}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Custom URL & Google Drive */}
              {activeTab === 'url' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        URL Tautan Pas Foto / Google Drive
                      </label>
                      <a
                        href={GOOGLE_DRIVE_MAIN_FOLDER.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                      >
                        <FolderOpen className="w-3 h-3 text-purple-600" />
                        <span>Buka Folder Drive Anggota</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/... atau https://domain.com/photo.jpg"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customUrl.trim()) {
                            const formatted = formatGoogleDriveUrl(customUrl.trim());
                            setSelectedPhoto(formatted);
                          }
                        }}
                        className="px-4 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Terapkan
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      💡 <strong>Dukungan Google Drive Otomatis:</strong> Anda dapat langsung menempelkan link share Google Drive. Pastikan opsi izin file di Drive disetel ke <em>"Anyone with the link"</em>.
                    </p>
                  </div>
                </div>
              )}

              {/* Official Photo Guidelines Box */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <Info className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span>Pedoman Pas Foto KTA Pramuka & Saka Pariwisata:</span>
                </div>
                <ul className="text-[11px] text-amber-800/90 space-y-1 list-disc list-inside">
                  <li>Mengenakan pakaian seragam Pramuka atau kemeja Saka Pariwisata resmi.</li>
                  <li>Latar belakang warna polos (Merah / Biru standar KTA Nasional).</li>
                  <li>Posisi kepala simetris menghadap lurus ke depan dengan pencahayaan yang jelas.</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Real-time Live Previews (5 cols) */}
            <div className="md:col-span-5 space-y-4 bg-slate-50 p-4 rounded-3xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Pratinjau Tampilan KTA
                </p>
                <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                  Live Preview
                </span>
              </div>

              {/* 1. Mini Card Preview Frame */}
              <div className="relative bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 rounded-2xl p-4 text-white shadow-lg overflow-hidden border border-purple-800/50">
                {/* Background Watermark */}
                <div className="absolute right-1 top-2 pointer-events-none opacity-15 transform rotate-12 scale-110">
                  <SakaLogo size={110} />
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-purple-500/20 text-[8px] tracking-wider text-purple-200 uppercase font-bold">
                  <span>SAKA PARIWISATA</span>
                  <span className="bg-purple-500/30 px-1.5 py-0.5 rounded font-mono">KTA DIGITAL</span>
                </div>

                {/* Card Body Preview */}
                <div className="flex gap-3 items-center my-3 relative z-10">
                  {/* Photo with Frame & Verified Badge */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-20 rounded-xl overflow-hidden border-2 border-purple-400/80 bg-slate-900 shadow-md">
                      <img
                        src={selectedPhoto || member.avatarUrl}
                        alt="Preview Foto KTA"
                        className="w-full h-full object-cover transition-transform duration-200"
                        style={{ transform: `scale(${zoomLevel / 100})` }}
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full border border-slate-900 flex items-center justify-center text-[8px] text-white font-bold">
                      ✓
                    </div>
                  </div>

                  {/* Member Details Preview (Urutan: 1. Nomor urut, 2. Nama, 3. Jabatan, 4. Kwartir) */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-[9px] font-mono font-bold text-purple-300 truncate">
                      {member.nationalMemberNumber || 'PP.KK.KC.000000'}
                    </p>
                    <p className="font-bold text-xs text-white uppercase truncate font-heading">
                      {member.fullName}
                    </p>
                    <p className="text-[8.5px] text-purple-200 font-semibold truncate">
                      {member.currentPosition || 'Anggota Saka Pariwisata'}
                    </p>
                    <p className="text-[8px] text-slate-300 truncate">
                      {member.provinceId === '00' || member.provinceName?.toLowerCase().includes('nasional')
                        ? 'Kwartir Nasional'
                        : (member.regencyName ? `Kwarcab ${member.regencyName}` : `Kwarda ${member.provinceName}`)}
                    </p>
                  </div>
                </div>

                <div className="text-[7.5px] text-purple-200/80 pt-1.5 border-t border-purple-500/20 flex justify-between">
                  <span>Masa Berlaku: Aktif</span>
                  <span className="font-mono">{member.provinceName}</span>
                </div>
              </div>

              {/* 2. User Profile Avatar Sync Preview */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Sinkronisasi Foto Profil User
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedPhoto || member.avatarUrl}
                    alt="Avatar sync preview"
                    className="w-10 h-10 rounded-xl object-cover border-2 border-emerald-500 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{member.fullName}</p>
                    <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Tersinkronisasi Otomatis
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Perubahan foto akan otomatis dicatat di Audit Trail & Log Kwartir.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-purple-900 hover:bg-purple-950 active:bg-purple-900 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Simpan & Terapkan ke KTA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
