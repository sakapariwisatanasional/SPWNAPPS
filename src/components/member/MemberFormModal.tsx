import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UserPlus, 
  MapPin, 
  Award, 
  BookOpen, 
  Building, 
  Camera, 
  Check, 
  Sparkles,
  ShieldCheck,
  Lock,
  AlertCircle,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { storage } from '../../services/storage';
import { formatGoogleDriveUrl } from '../../services/driveRepository';
import { Province, Regency, District, Branch, Skill, MemberSkill, SkillProficiency, KridaType, CurrentUser } from '../../types';

interface MemberFormModalProps {
  isOpen: boolean;
  currentUser?: CurrentUser;
  onClose: () => void;
  onSuccess: () => void;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSuccess
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);

  // Form State
  const [fullName, setFullName] = useState('');
  const [nik, setNik] = useState('');
  const [gender, setGender] = useState<'LAKI_LAKI' | 'PEREMPUAN'>('LAKI_LAKI');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('2002-05-15');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  const [selectedProvinceId, setSelectedProvinceId] = useState('32');
  const [selectedRegencyId, setSelectedRegencyId] = useState('32.06');
  const [selectedDistrictId, setSelectedDistrictId] = useState('32.06.12');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  const [gugusDepan, setGugusDepan] = useState('');
  const [krida, setKrida] = useState<KridaType>('Krida Pemandu');
  const [joinYear, setJoinYear] = useState(2024);
  const [educationLevel, setEducationLevel] = useState('SMA / SMK / Sederajat');
  const [occupation, setOccupation] = useState('Pelajar / Mahasiswa');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80');
  const [photoInputUrl, setPhotoInputUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [photoUploadSource, setPhotoUploadSource] = useState<'FILE' | 'URL'>('FILE');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processAndCompressFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar yang valid (JPG, PNG, WEBP).');
      return;
    }
    setIsUploadingPhoto(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setAvatarUrl(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          setAvatarUrl(event.target?.result as string);
        }
        setIsUploadingPhoto(false);
      };
      img.onerror = () => {
        setAvatarUrl(event.target?.result as string);
        setIsUploadingPhoto(false);
      };
    };
    reader.onerror = () => {
      alert('Gagal membaca berkas foto.');
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndCompressFile(file);
    }
  };

  const handlePhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAndCompressFile(file);
    }
  };

  // Selected Skills
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(['skill-tour-guide']);
  const [skillProficiency, setSkillProficiency] = useState<SkillProficiency>('INTERMEDIATE');

  // Initialize territory data and default selections based on currentUser role
  useEffect(() => {
    const allProvinces = storage.getProvinces();
    setProvinces(allProvinces);
    setSkillsList(storage.getSkills());

    if (currentUser) {
      if (currentUser.role === 'ADMIN_REGENCY' && currentUser.jurisdictionId) {
        // Operator Cabang: Find province that contains this regency
        const regencyId = currentUser.jurisdictionId;
        const allRegs = storage.getRegencies();
        const targetReg = allRegs.find(r => r.id === regencyId);
        const provId = targetReg ? targetReg.provinceId : regencyId.split('.')[0] || '32';
        
        setSelectedProvinceId(provId);
        setSelectedRegencyId(regencyId);
        
        const dists = storage.getDistricts(regencyId);
        setDistricts(dists);
        if (dists.length > 0) {
          setSelectedDistrictId(dists[0].id);
          const brs = storage.getBranches(dists[0].id);
          setBranches(brs);
          if (brs.length > 0) setSelectedBranchId(brs[0].id);
        }
      } else if (currentUser.role === 'ADMIN_PROVINCE' && currentUser.jurisdictionId) {
        setSelectedProvinceId(currentUser.jurisdictionId);
        const regs = storage.getRegencies(currentUser.jurisdictionId);
        setRegencies(regs);
        if (regs.length > 0) {
          setSelectedRegencyId(regs[0].id);
          const dists = storage.getDistricts(regs[0].id);
          setDistricts(dists);
          if (dists.length > 0) {
            setSelectedDistrictId(dists[0].id);
            const brs = storage.getBranches(dists[0].id);
            setBranches(brs);
            if (brs.length > 0) setSelectedBranchId(brs[0].id);
          }
        }
      } else if (currentUser.role === 'ADMIN_BRANCH' && currentUser.jurisdictionId) {
        const branchId = currentUser.jurisdictionId;
        const allDists = storage.getDistricts();
        const targetDist = allDists.find(d => d.id === branchId || branchId.startsWith(d.id));
        if (targetDist) {
          const parentReg = storage.getRegencies().find(r => r.id === targetDist.regencyId);
          if (parentReg) {
            setSelectedProvinceId(parentReg.provinceId);
          }
          setSelectedRegencyId(targetDist.regencyId);
          setSelectedDistrictId(targetDist.id);
          const brs = storage.getBranches(targetDist.id);
          setBranches(brs);
          if (brs.length > 0) setSelectedBranchId(brs[0].id);
        }
      }
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    if (selectedProvinceId) {
      // If role is ADMIN_REGENCY, keep regencies filtered to their jurisdiction or loaded
      const regs = storage.getRegencies(selectedProvinceId);
      setRegencies(regs);
      if (currentUser?.role === 'ADMIN_REGENCY' && currentUser.jurisdictionId) {
        setSelectedRegencyId(currentUser.jurisdictionId);
      } else if (regs.length > 0 && !regs.some(r => r.id === selectedRegencyId)) {
        setSelectedRegencyId(regs[0].id);
      }
    }
  }, [selectedProvinceId]);

  useEffect(() => {
    if (selectedRegencyId) {
      const dists = storage.getDistricts(selectedRegencyId);
      setDistricts(dists);
      if (dists.length > 0 && !dists.some(d => d.id === selectedDistrictId)) {
        setSelectedDistrictId(dists[0].id);
      }
    }
  }, [selectedRegencyId]);

  useEffect(() => {
    if (selectedDistrictId) {
      const brs = storage.getBranches(selectedDistrictId);
      setBranches(brs);
      if (brs.length > 0 && !brs.some(b => b.id === selectedBranchId)) {
        setSelectedBranchId(brs[0].id);
      } else if (brs.length === 0) {
        setSelectedBranchId('');
      }
    }
  }, [selectedDistrictId]);

  if (!isOpen) return null;

  const isRegencyOperator = currentUser?.role === 'ADMIN_REGENCY';
  const isProvinceAdmin = currentUser?.role === 'ADMIN_PROVINCE';
  const isBranchAdmin = currentUser?.role === 'ADMIN_BRANCH';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!fullName || !nik || !email || !phone || !gugusDepan) {
      alert('Harap lengkapi semua data wajib yang ditandai bintang (*)');
      return;
    }

    // Strict validation for Operator Cabang
    if (isRegencyOperator && currentUser?.jurisdictionId && selectedRegencyId !== currentUser.jurisdictionId) {
      alert(`Peringatan Akses: Anda hanya diizinkan mendaftarkan anggota pada Kwartir Cabang Anda (${currentUser.jurisdictionName}).`);
      return;
    }

    setIsSubmitting(true);

    const currentProvince = provinces.find(p => p.id === selectedProvinceId);
    const currentRegency = regencies.find(r => r.id === selectedRegencyId);
    const currentDistrict = districts.find(d => d.id === selectedDistrictId);
    const currentBranch = branches.find(b => b.id === selectedBranchId);

    // Mask NIK for security
    const maskedNik = nik.length >= 10 
      ? nik.substring(0, 6) + '******' + nik.substring(nik.length - 4)
      : nik;

    // Build skills array
    const memberSkills: MemberSkill[] = selectedSkillIds.map((sId, idx) => {
      const sObj = skillsList.find(s => s.id === sId);
      return {
        id: `ms-new-${idx}-${Date.now()}`,
        skillId: sId,
        skillName: sObj?.name || 'Keahlian Wisata',
        category: sObj?.category || 'Umum',
        proficiency: skillProficiency,
        yearsOfExperience: 2,
        isVerified: false
      };
    });

    try {
      storage.registerMember({
        userId: `user-${Date.now()}`,
        fullName,
        nikMasked: maskedNik,
        avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        gender,
        birthPlace: birthPlace || 'Tasikmalaya',
        birthDate,
        phone,
        email,
        address: address || 'Jl. Pramuka Raya',
        
        provinceId: selectedProvinceId,
        provinceName: currentProvince?.name || 'Jawa Barat',
        regencyId: selectedRegencyId,
        regencyName: currentRegency?.name || 'Kwartir Cabang',
        districtId: selectedDistrictId,
        districtName: currentDistrict?.name || 'Kecamatan',
        branchId: selectedBranchId || 'branch-default',
        branchName: currentBranch?.name || `Kwarran ${currentDistrict?.name || 'Pariwisata'}`,
        
        gugusDepan,
        joinYear,
        currentPosition: `Calon Anggota ${krida}`,
        krida,
        educationLevel,
        occupation,
        bio: bio || 'Calon anggota Saka Pariwisata yang siap berkontribusi untuk pariwisata nusantara.',
        skills: memberSkills,
        certifications: []
      });

      alert('Pendaftaran berhasil diajukan! Data anggota telah dicatat khusus pada Kwartir Cabang Anda.');
      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      alert('Gagal mendaftarkan anggota: ' + err.message);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-heading">Formulir Registrasi Anggota Saka Pariwisata</h3>
              <p className="text-xs text-slate-300">
                {isRegencyOperator ? `Operator Khusus: ${currentUser?.jurisdictionName}` : 'Pendataan Keanggotaan Berbasis Struktur Wilayah Nasional'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Operator Cabang Isolation Notice */}
        {isRegencyOperator && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2.5 text-amber-900 text-xs">
            <Lock className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              <strong>Mode Operator Khusus Cabang:</strong> Anda memiliki hak pendaftaran khusus untuk <strong>{currentUser?.jurisdictionName}</strong>. Pilihan Provinsi dan Cabang dikunci untuk menjamin isolasi data antar cabang.
            </span>
          </div>
        )}

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
          {/* Section 1: Identitas Pribadi */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-slate-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>1. Identitas Anggota</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan, S.Par."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIK (16 Digit) *</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Contoh: 3206121405020001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800 font-mono"
                />
                <span className="text-[10px] text-slate-400">Data NIK dienkripsi & dilindungi (UU PDP).</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                >
                  <option value="LAKI_LAKI">Laki-laki</option>
                  <option value="PEREMPUAN">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir *</label>
                <input
                  type="text"
                  required
                  value={birthPlace}
                  onChange={(e) => setBirthPlace(e.target.value)}
                  placeholder="Tasikmalaya"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir *</label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Aktif *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-3456-7890"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                />
              </div>
            </div>

            {/* Avatar Picker with Upload, Drag&Drop, Camera, and URL Support */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-900 font-heading">
                    Pas Foto Resmi Anggota (KTA Digital & Fisik)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Gunakan foto setengah badan berpakaian seragam Pramuka / rapi
                  </p>
                </div>
                <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPhotoUploadSource('FILE')}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      photoUploadSource === 'FILE' 
                        ? 'bg-white text-emerald-900 shadow-xs font-extrabold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUploadSource('URL')}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      photoUploadSource === 'URL' 
                        ? 'bg-white text-emerald-900 shadow-xs font-extrabold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Link URL / Drive
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-1">
                {/* Photo Preview Badge */}
                <div className="relative group flex-shrink-0">
                  <div className="w-24 h-32 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md bg-slate-900 relative">
                    <img
                      src={avatarUrl}
                      alt="Preview Foto Anggota"
                      className="w-full h-full object-cover"
                    />
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1">
                        <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center text-white transition-opacity cursor-pointer"
                    >
                      <Camera className="w-5 h-5 mb-1 text-emerald-300" />
                      <span className="text-[9px] font-bold">Ganti Foto</span>
                    </button>
                  </div>
                  <span className="absolute -bottom-2 inset-x-0 mx-auto w-max px-2 py-0.5 bg-emerald-600 text-white text-[9px] font-extrabold rounded-full shadow-xs">
                    Format KTA 3x4
                  </span>
                </div>

                {/* Upload Controls & Drop Area */}
                <div className="flex-1 w-full space-y-2.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handlePhotoFileUpload}
                    className="hidden"
                  />

                  {photoUploadSource === 'FILE' ? (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingPhoto(true);
                      }}
                      onDragLeave={() => setIsDraggingPhoto(false)}
                      onDrop={handlePhotoDrop}
                      className={`border-2 border-dashed rounded-2xl p-3.5 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        isDraggingPhoto 
                          ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]' 
                          : 'border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30'
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-800">
                          Klik untuk memilih foto dari perangkat atau seret foto ke sini
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Mendukung JPG, PNG, WEBP (Kompresi otomatis hingga optimal)
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Pilih / Ambil Foto</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Tautan Foto Google Drive atau URL Web
                      </label>
                      <div className="relative">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={photoInputUrl}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPhotoInputUrl(val);
                            if (val.trim()) {
                              setAvatarUrl(formatGoogleDriveUrl(val.trim()));
                            }
                          }}
                          placeholder="https://drive.google.com/file/d/... atau https://..."
                          className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        *Jika menggunakan Google Drive, pastikan izin akses tautan disetel ke "Siapa saja yang memiliki link".
                      </p>
                    </div>
                  )}

                  {/* Sample Quick Avatars */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
                    <span className="text-[10px] font-semibold text-slate-500">Contoh Foto Resmi:</span>
                    <div className="flex items-center gap-1.5">
                      {sampleAvatars.map((url, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => {
                            setAvatarUrl(url);
                            setPhotoInputUrl('');
                          }}
                          className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            avatarUrl === url ? 'border-emerald-600 scale-105 shadow-xs' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          title={`Gunakan contoh foto ${i + 1}`}
                        >
                          <img src={url} alt="Option" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Struktur Wilayah Organisasi */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>2. Wilayah Kwartir & Ranting</span>
              </div>
              {isRegencyOperator && (
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                  <Lock className="w-3 h-3 text-amber-700" />
                  Kwartir Cabang Terkunci
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Provinsi (Kwarda) {isRegencyOperator && <span className="text-amber-700 text-[10px]">(Terkunci)</span>} *
                </label>
                <select
                  disabled={isRegencyOperator || isProvinceAdmin || isBranchAdmin}
                  value={selectedProvinceId}
                  onChange={(e) => setSelectedProvinceId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl outline-none text-slate-800 ${
                    isRegencyOperator || isProvinceAdmin || isBranchAdmin
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                >
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Kode {p.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kabupaten/Kota (Kwarcab) {isRegencyOperator && <span className="text-amber-700 text-[10px] font-bold">(Khusus Wilayah Anda)</span>} *
                </label>
                <select
                  disabled={isRegencyOperator || isBranchAdmin}
                  value={selectedRegencyId}
                  onChange={(e) => setSelectedRegencyId(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl outline-none font-semibold ${
                    isRegencyOperator || isBranchAdmin
                      ? 'bg-amber-50/80 border-amber-300 text-amber-950 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800'
                  }`}
                >
                  {regencies.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} (Kode {r.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kecamatan (Kwarran) *</label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                >
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} (Kode {d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pangkalan Saka / Ranting *</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800 font-semibold text-emerald-900"
                >
                  {branches.length > 0 ? (
                    branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))
                  ) : (
                    <option value="">Ranting Umum Kecamatan Terkait</option>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Kepramukaan & Krida */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-slate-900 font-bold text-sm">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>3. Data Kepramukaan & Krida Saka Pariwisata</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Gugus Depan Asal *</label>
                <input
                  type="text"
                  required
                  value={gugusDepan}
                  onChange={(e) => setGugusDepan(e.target.value)}
                  placeholder="Contoh: Gudep 06.121 SMKN 1 Pariwisata"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilihan Krida Utama *</label>
                <select
                  value={krida}
                  onChange={(e: any) => setKrida(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800 font-semibold"
                >
                  <option value="Krida Pemandu">Krida Pemandu</option>
                  <option value="Krida Penyuluh">Krida Penyuluh</option>
                  <option value="Krida Mice & Event">Krida Mice & Event</option>
                  <option value="Krida Kuliner & Cinderamata">Krida Kuliner & Cinderamata</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pendidikan Terakhir</label>
                <input
                  type="text"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pekerjaan / Aktivitas</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bio Singkat & Motivasi Bergabung</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan minat dan kontribusi Anda untuk pariwisata nusantara..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Section 4: Pilihan Keahlian */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-slate-900 font-bold text-sm">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>4. Kompetensi & Minat Keahlian</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {skillsList.map((s) => {
                const isSelected = selectedSkillIds.includes(s.id);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedSkillIds(selectedSkillIds.filter(id => id !== s.id));
                      } else {
                        setSelectedSkillIds([...selectedSkillIds, s.id]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left flex items-start justify-between gap-1 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs' 
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[11px] leading-tight">{s.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Kirim Pendaftaran'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

