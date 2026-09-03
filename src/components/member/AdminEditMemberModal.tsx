import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UserCheck, 
  MapPin, 
  Award, 
  Building, 
  Phone, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  RefreshCw,
  Edit3,
  Calendar,
  Layers,
  GraduationCap,
  Briefcase,
  Lock,
  ShieldAlert,
  Camera,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  FolderOpen,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  Clock
} from 'lucide-react';
import { storage } from '../../services/storage';
import { Member, CurrentUser, Province, Regency, District, Branch, KridaType, MemberStatus, MemberSkill, SkillProficiency, Skill } from '../../types';
import { formatDriveImageUrl, getDriveDirectFallbackUrl, getValidAvatarUrl } from '../common/SakaLogo';
import { GOOGLE_DRIVE_MAIN_FOLDER } from '../../services/driveRepository';

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

interface AdminEditMemberModalProps {
  isOpen: boolean;
  member: Member | null;
  currentUser: CurrentUser;
  onClose: () => void;
  onSuccess: (updatedMember: Member) => void;
}

export const AdminEditMemberModal: React.FC<AdminEditMemberModalProps> = ({
  isOpen,
  member,
  currentUser,
  onClose,
  onSuccess
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Form States
  const [fullName, setFullName] = useState('');
  const [nikMasked, setNikMasked] = useState('');
  const [gender, setGender] = useState<'LAKI_LAKI' | 'PEREMPUAN'>('LAKI_LAKI');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Domicile / Hierarchy
  const [selectedProvinceId, setSelectedProvinceId] = useState('');
  const [selectedRegencyId, setSelectedRegencyId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [gugusDepan, setGugusDepan] = useState('');

  // Saka Position & Status
  const [krida, setKrida] = useState<KridaType>('Krida Pemandu');
  const [currentPosition, setCurrentPosition] = useState('');
  const [joinYear, setJoinYear] = useState(2024);
  const [status, setStatus] = useState<MemberStatus>('ACTIVE');
  const [educationLevel, setEducationLevel] = useState('');
  const [occupation, setOccupation] = useState('');
  const [bio, setBio] = useState('');

  // National Member Number (NTA)
  const [nationalMemberNumber, setNationalMemberNumber] = useState('');
  const [autoRegenerateNta, setAutoRegenerateNta] = useState(false);

  // Pas Foto KTA State
  const [avatarUrl, setAvatarUrl] = useState('');
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // Administrative Notes
  const [updateReason, setUpdateReason] = useState('Koreksi penulisan nama, gelar, dan penyesuaian domisili');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'PHOTO' | 'DOMICILE' | 'SAKA' | 'SKILLS' | 'REASON'>('IDENTITY');

  // Skills & Competencies State
  const [memberSkills, setMemberSkills] = useState<MemberSkill[]>([]);
  const [masterSkills, setMasterSkills] = useState<Skill[]>([]);
  const [isAddingSkillInline, setIsAddingSkillInline] = useState(false);
  const [selectedMasterSkillId, setSelectedMasterSkillId] = useState('CUSTOM');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Pemanduan & Tour Guide');
  const [newSkillProficiency, setNewSkillProficiency] = useState<SkillProficiency>('INTERMEDIATE');
  const [newSkillYears, setNewSkillYears] = useState(2);
  const [newSkillPortfolio, setNewSkillPortfolio] = useState('');
  const [newSkillCertNo, setNewSkillCertNo] = useState('');
  const [newSkillCertIssuer, setNewSkillCertIssuer] = useState('');
  const [newSkillCertFile, setNewSkillCertFile] = useState('');
  const [newSkillIsVerified, setNewSkillIsVerified] = useState(true);

  // Handle Photo File Upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (JPG/PNG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarUrl(base64);
      setIsUploadingPhoto(false);
    };
    reader.onerror = () => {
      alert('Gagal memproses file foto.');
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  // Load Territory Data
  useEffect(() => {
    setProvinces(storage.getProvinces());
  }, []);

  // Populate Member Data when Opened
  useEffect(() => {
    if (member && isOpen) {
      setFullName(member.fullName || '');
      setNikMasked(member.nikMasked || '');
      setGender(member.gender || 'LAKI_LAKI');
      setBirthPlace(member.birthPlace || '');
      setBirthDate(member.birthDate || '');
      setPhone(member.phone || '');
      setEmail(member.email || '');
      setAddress(member.address || '');

      setAvatarUrl(member.avatarUrl || '');
      setCustomPhotoUrl(member.avatarUrl?.startsWith('http') ? member.avatarUrl : '');

      setSelectedProvinceId(member.provinceId || '32');
      setSelectedRegencyId(member.regencyId || '32.06');
      setSelectedDistrictId(member.districtId || '32.06.12');
      setSelectedBranchId(member.branchId || '');

      setGugusDepan(member.gugusDepan || '');
      setKrida(member.krida || 'Krida Pemandu');
      setCurrentPosition(member.currentPosition || 'Anggota Krida Pemandu');
      setJoinYear(member.joinYear || 2024);
      setStatus(member.status || 'ACTIVE');
      setEducationLevel(member.educationLevel || 'SMA / Sederajat');
      setOccupation(member.occupation || 'Pelajar / Mahasiswa');
      setBio(member.bio || '');

      setNationalMemberNumber(member.nationalMemberNumber || '');
      setAutoRegenerateNta(false);
      setUpdateReason('Koreksi data profil dan domisili anggota oleh Operator');
      setMemberSkills(member.skills ? [...member.skills] : []);
      setMasterSkills(storage.getSkills());
      setIsAddingSkillInline(false);
      setActiveTab('IDENTITY');
    }
  }, [member, isOpen]);

  // Load Regencies when Province changes
  useEffect(() => {
    if (selectedProvinceId) {
      const regs = storage.getRegencies(selectedProvinceId);
      setRegencies(regs);
      // Only reset if current selected regency doesn't belong to this province
      if (regs.length > 0 && !regs.some(r => r.id === selectedRegencyId)) {
        setSelectedRegencyId(regs[0].id);
      }
    }
  }, [selectedProvinceId]);

  // Load Districts when Regency changes
  useEffect(() => {
    if (selectedRegencyId) {
      const dists = storage.getDistricts(selectedRegencyId);
      setDistricts(dists);
      if (dists.length > 0 && !dists.some(d => d.id === selectedDistrictId)) {
        setSelectedDistrictId(dists[0].id);
      }
    }
  }, [selectedRegencyId]);

  // Load Branches when District changes
  useEffect(() => {
    if (selectedDistrictId) {
      const brs = storage.getBranches(selectedDistrictId);
      setBranches(brs);
      if (brs.length > 0 && !brs.some(b => b.id === selectedBranchId)) {
        setSelectedBranchId(brs[0].id);
      }
    }
  }, [selectedDistrictId]);

  if (!isOpen || !member) return null;

  const isRegencyOperator = currentUser.role === 'ADMIN_REGENCY';
  const isProvinceAdmin = currentUser.role === 'ADMIN_PROVINCE';
  const isBranchAdmin = currentUser.role === 'ADMIN_BRANCH';

  // Check if this Operator has permission to edit this member
  const isDeniedForRegency = isRegencyOperator && currentUser.jurisdictionId && member.regencyId !== currentUser.jurisdictionId;
  const isDeniedForProvince = isProvinceAdmin && currentUser.jurisdictionId && member.provinceId !== currentUser.jurisdictionId;
  const isDeniedForBranch = isBranchAdmin && currentUser.jurisdictionId && member.branchId !== currentUser.jurisdictionId;
  const isUnauthorized = isDeniedForRegency || isDeniedForProvince || isDeniedForBranch;

  const currentProvince = provinces.find(p => p.id === selectedProvinceId);
  const currentRegency = regencies.find(r => r.id === selectedRegencyId);
  const currentDistrict = districts.find(d => d.id === selectedDistrictId);
  const currentBranch = branches.find(b => b.id === selectedBranchId);

  const handleGenerateNewNta = () => {
    if (currentProvince && currentRegency && currentDistrict) {
      const newNta = storage.generateNationalMemberNumber(
        currentProvince.code,
        currentRegency.code,
        currentDistrict.code
      );
      setNationalMemberNumber(newNta);
    }
  };

  const handleSelectMasterSkillInline = (id: string) => {
    setSelectedMasterSkillId(id);
    if (id === 'CUSTOM') {
      setNewSkillName('');
    } else {
      const found = masterSkills.find(s => s.id === id);
      if (found) {
        setNewSkillName(found.name);
        setNewSkillCategory(found.category);
      }
    }
  };

  const handleAddSkillInline = () => {
    if (!newSkillName.trim()) {
      alert('Mohon masukkan nama keahlian terlebih dahulu.');
      return;
    }
    const newSkill: MemberSkill = {
      id: `skill-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      skillId: selectedMasterSkillId !== 'CUSTOM' ? selectedMasterSkillId : `custom-${Date.now()}`,
      skillName: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProficiency,
      yearsOfExperience: Number(newSkillYears) || 1,
      portfolioUrl: newSkillPortfolio.trim() || undefined,
      certificateNumber: newSkillCertNo.trim() || undefined,
      certificateIssuer: newSkillCertIssuer.trim() || undefined,
      certificateFileUrl: newSkillCertFile.trim() || undefined,
      isVerified: newSkillIsVerified,
      verifiedBy: newSkillIsVerified ? currentUser.name : undefined,
      verifiedAt: newSkillIsVerified ? new Date().toISOString() : undefined
    };

    setMemberSkills(prev => [...prev, newSkill]);
    setIsAddingSkillInline(false);
    setSelectedMasterSkillId('CUSTOM');
    setNewSkillName('');
    setNewSkillCategory('Pemanduan & Tour Guide');
    setNewSkillProficiency('INTERMEDIATE');
    setNewSkillYears(2);
    setNewSkillPortfolio('');
    setNewSkillCertNo('');
    setNewSkillCertIssuer('');
    setNewSkillCertFile('');
    setNewSkillIsVerified(true);
  };

  const handleToggleSkillVerification = (skillId: string) => {
    setMemberSkills(prev => prev.map(s => {
      if (s.id === skillId) {
        const nextVerified = !s.isVerified;
        return {
          ...s,
          isVerified: nextVerified,
          verifiedBy: nextVerified ? currentUser.name : undefined,
          verifiedAt: nextVerified ? new Date().toISOString() : undefined
        };
      }
      return s;
    }));
  };

  const handleDeleteSkillInline = (skillId: string) => {
    setMemberSkills(prev => prev.filter(s => s.id !== skillId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (isUnauthorized) {
      alert('Akses Ditolak: Anda tidak memiliki wewenang untuk mengedit data anggota di luar wilayah Kwartir Anda.');
      return;
    }

    if (isRegencyOperator && currentUser.jurisdictionId && selectedRegencyId !== currentUser.jurisdictionId) {
      alert('Akses Dibatasi: Operator Kwartir Cabang tidak diizinkan memindahkan anggota ke Kwartir Cabang lain.');
      return;
    }

    if (!fullName.trim()) {
      alert('Nama lengkap tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);

    try {
      // Determine final NTA
      let finalNta = nationalMemberNumber;
      if (autoRegenerateNta && currentProvince && currentRegency && currentDistrict) {
        finalNta = storage.generateNationalMemberNumber(
          currentProvince.code,
          currentRegency.code,
          currentDistrict.code
        );
      }

      const updatedPayload: Partial<Member> = {
        fullName: fullName.trim(),
        nikMasked: nikMasked.trim(),
        gender,
        birthPlace: birthPlace.trim(),
        birthDate,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),

        provinceId: selectedProvinceId,
        provinceName: currentProvince?.name || member.provinceName,
        regencyId: selectedRegencyId,
        regencyName: currentRegency?.name || member.regencyName,
        districtId: selectedDistrictId,
        districtName: currentDistrict?.name || member.districtName,
        branchId: selectedBranchId || member.branchId,
        branchName: currentBranch?.name || `Kwarran ${currentDistrict?.name || 'Pariwisata'}`,

        gugusDepan: gugusDepan.trim(),
        krida,
        currentPosition: currentPosition.trim() || `Anggota ${krida}`,
        joinYear: Number(joinYear),
        status,
        educationLevel,
        occupation: occupation.trim(),
        bio: bio.trim(),

        avatarUrl: avatarUrl.trim() || member.avatarUrl,

        nationalMemberNumber: finalNta || member.nationalMemberNumber,
        skills: memberSkills
      };

      const result = storage.adminUpdateMember(
        member.id,
        updatedPayload,
        currentUser,
        updateReason.trim() || 'Perbaikan profil oleh Operator Kwartir'
      );

      if (result) {
        onSuccess(result);
        onClose();
      }
    } catch (err) {
      console.error('Error updating member:', err);
      alert('Terjadi kesalahan saat menyimpan perubahan profil anggota.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If unauthorized to edit this member, render an access restriction barrier
  if (isUnauthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-rose-200 overflow-hidden">
          <div className="p-5 bg-rose-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-rose-300" />
              <h3 className="font-bold text-base font-heading">Akses Ditolak (Isolasi Cabang)</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-rose-800 hover:bg-rose-700 flex items-center justify-center text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 space-y-4 text-xs text-slate-700">
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
              <p className="font-semibold text-rose-900 leading-relaxed">
                Anda sedang masuk sebagai <strong>{currentUser.name}</strong> ({currentUser.jurisdictionName}).
              </p>
              <p className="text-slate-600 leading-relaxed">
                Anggota <strong>{member.fullName}</strong> terdaftar pada <strong>{member.regencyName} ({member.provinceName})</strong>. Sebagai Operator Khusus Cabang, Anda hanya memiliki hak akses untuk menginput dan mengedit data anggota di dalam Kwartir Cabang Anda sendiri.
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-colors"
              >
                Kembali ke Daftar Anggota
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-purple-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-heading">Koreksi & Pembaruan Profil Anggota</h3>
                <span className="px-2 py-0.5 bg-purple-500/30 text-purple-200 border border-purple-400/30 rounded-md text-[10px] font-mono font-bold">
                  {isRegencyOperator ? 'Operator Cabang' : 'Hak Akses Admin'}
                </span>
              </div>
              <p className="text-xs text-purple-200/80">
                Ubah nama lengkap, gelar akademis/kepramukaan, kontak, peminatan krida, dan gudep
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Member Quick Info Bar */}
        <div className="px-6 py-3 bg-purple-50/60 border-b border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              className="w-9 h-9 rounded-xl object-cover border border-purple-200 shadow-xs"
            />
            <div>
              <span className="font-bold text-slate-900 text-sm">{member.fullName}</span>
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <span className="font-mono">{member.nationalMemberNumber || 'Belum Ada NTA'}</span>
                <span>•</span>
                <span>{member.regencyName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-purple-200/70 shadow-xs">
            <span className="text-[11px] text-slate-500">Operator:</span>
            <span className="font-bold text-purple-950">{currentUser.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50/70 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('IDENTITY')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'IDENTITY'
                ? 'border-purple-900 text-purple-950 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1. Identitas & Gelar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PHOTO')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'PHOTO'
                ? 'border-purple-900 text-purple-950 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Pas Foto KTA</span>
            {avatarUrl && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DOMICILE')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'DOMICILE'
                ? 'border-purple-900 text-purple-950 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>3. Domisili & Kwartir</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SAKA')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'SAKA'
                ? 'border-purple-900 text-purple-950 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>4. Krida & Status KTA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SKILLS')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'SKILLS'
                ? 'border-purple-900 text-purple-950 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>5. Keahlian & Talenta</span>
            {memberSkills.length > 0 && (
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-900 rounded-full text-[10px] font-bold">
                {memberSkills.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('REASON')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'REASON'
                ? 'border-purple-900 text-purple-950 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>6. Catatan Perubahan</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar text-xs">
          
          {/* TAB 1: IDENTITAS & GELAR */}
          {activeTab === 'IDENTITY' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Perubahan nama lengkap dan gelar akan langsung otomatis diperbarui pada <strong>Kartu Tanda Anggota (KTA) Digital</strong>, <strong>sertifikat keahlian</strong>, dan <strong>dokumen cetak PDF</strong>.
                </p>
              </div>

              {/* Photo Shortcut in Tab 1 */}
              <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-14 rounded-xl overflow-hidden border-2 border-purple-500/60 bg-slate-900 flex-shrink-0 shadow-xs">
                    <img
                      src={formatDriveImageUrl(avatarUrl) || avatarUrl || getValidAvatarUrl(avatarUrl, gender)}
                      alt="Pas Foto"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = getValidAvatarUrl('', gender);
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Pas Foto Resmi KTA</p>
                    <p className="text-[10px] text-slate-500">Pas foto standar format 3x4 berseragam resmi</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('PHOTO')}
                  className="px-3 py-1.5 bg-purple-900 hover:bg-purple-800 text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Ubah Pas Foto</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">
                    Nama Lengkap & Gelar Resmi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Muhammad Farhan, S.Par. / Kak Siti Nurhaliza, M.Pd."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-900 font-semibold text-sm"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Termasuk gelar akademis, gelar keagamaan, atau sebutan kepanduan resmi.
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">NIK (Nomor Induk Kependudukan)</label>
                  <input
                    type="text"
                    value={nikMasked}
                    onChange={(e) => setNikMasked(e.target.value)}
                    placeholder="320612******0001"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                  >
                    <option value="LAKI_LAKI">Laki-laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="Contoh: Tasikmalaya"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tingkat Pendidikan</label>
                  <input
                    type="text"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    placeholder="SMA / Diploma / S1 Pariwisata"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Pekerjaan / Aktivitas</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Pemandu Wisata / Mahasiswa / Wirausaha"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Ringkasan Profil / Bio</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Pengalaman, ketertarikan wisata, atau deskripsi singkat..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAS FOTO KTA */}
          {activeTab === 'PHOTO' && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-emerald-900">
                <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Pas foto anggota ini akan langsung ditampilkan di <strong>Kartu Tanda Anggota (KTA) Digital</strong>, <strong>Halaman Utama (Landing Page)</strong>, dan <strong>Direktori Pemandu Berkompeten</strong>.
                </p>
              </div>

              {/* Main Photo Editor Box */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                {/* Left: 3x4 Photo Preview Frame */}
                <div className="md:col-span-4 flex flex-col items-center p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white shadow-md">
                  <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pratinjau KTA 3x4</span>
                  </div>
                  
                  <div className="relative w-32 h-44 rounded-2xl overflow-hidden border-2 border-emerald-400/80 shadow-2xl bg-slate-950 flex items-center justify-center">
                    <img
                      src={formatDriveImageUrl(avatarUrl) || avatarUrl || getValidAvatarUrl(avatarUrl, gender)}
                      alt="Pas Foto Anggota"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        const fallback = getDriveDirectFallbackUrl(avatarUrl);
                        if (fallback && img.src !== fallback) {
                          img.src = fallback;
                        } else {
                          img.src = getValidAvatarUrl('', gender);
                        }
                      }}
                    />
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white text-xs font-bold gap-2">
                        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </div>
                    )}
                  </div>

                  <span className="mt-2 text-[10px] text-emerald-400 font-semibold">
                    Format Standar KTA Resmi
                  </span>
                </div>

                {/* Right: Upload, Link, & Presets */}
                <div className="md:col-span-8 space-y-4">
                  {/* Action 1: Upload File */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-purple-700" />
                      <span>1. Upload File Foto Langsung (JPG / PNG)</span>
                    </span>
                    <input
                      type="file"
                      ref={photoFileInputRef}
                      onChange={handlePhotoFileUpload}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoFileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-purple-950 font-bold border border-purple-300 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-purple-700" />
                      <span>{isUploadingPhoto ? 'Mengunggah...' : 'Pilih Foto dari Galeri / Komputer'}</span>
                    </button>
                    <p className="text-[10px] text-slate-500">Maksimal 5MB. Direkomendasikan rasio 3:4 dengan pakaian rapi / seragam.</p>
                  </div>

                  {/* Action 2: Google Drive / Direct Image URL */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5 text-indigo-700" />
                      <span>2. Tautan Google Drive / URL Gambar</span>
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={customPhotoUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomPhotoUrl(val);
                          if (val.trim()) {
                            setAvatarUrl(val.trim());
                          }
                        }}
                        placeholder="https://drive.google.com/file/d/... atau https://..."
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customPhotoUrl.trim()) {
                            setAvatarUrl(formatDriveImageUrl(customPhotoUrl.trim()));
                          }
                        }}
                        className="px-3 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl font-bold text-xs cursor-pointer"
                      >
                        Terapkan
                      </button>
                    </div>
                  </div>

                  {/* Action 3: Official Preset Selector */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                      <span>3. Preset Resmi Pas Foto Seragam Pramuka / Saka</span>
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {OFFICIAL_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAvatarUrl(preset.url);
                            setCustomPhotoUrl(preset.url);
                          }}
                          className={`p-1.5 rounded-xl border text-left flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            avatarUrl === preset.url
                              ? 'bg-purple-100 border-purple-600 ring-2 ring-purple-600/30'
                              : 'bg-white border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-12 h-16 object-cover rounded-lg shadow-xs"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[9px] font-bold text-slate-700 text-center line-clamp-1">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOMISILI & KWARTIR */}
          {activeTab === 'DOMICILE' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {isRegencyOperator ? (
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-amber-900">
                  <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong>Hak Khusus Operator Cabang ({currentUser.jurisdictionName}):</strong> Anda dapat mengubah data kontak, alamat, gugus depan, dan ranting di dalam cabang ini. Pilihan Kwartir Cabang dikunci.
                  </p>
                </div>
              ) : (
                <div className="bg-purple-50 border border-purple-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-purple-900">
                  <MapPin className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Perubahan domisili akan memindahkan keanggotaan ke Kwartir baru dan secara otomatis tercatat dalam <strong>Riwayat Mutasi / Lokasi Anggota</strong>.
                  </p>
                </div>
              )}

              {/* Kontak */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nomor Telepon / WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Alamat Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-slate-800 mb-1">Alamat Lengkap Domisili</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nama Jalan, RT/RW, Dusun/Kelurahan..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800 resize-none"
                  />
                </div>
              </div>

              {/* Struktur Wilayah Kwartir */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-800" />
                    <span>Struktur Organisasi & Kwartir Wilayah</span>
                  </span>
                  {isRegencyOperator && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-300">
                      <Lock className="w-3 h-3 text-amber-700" />
                      Kwarcab Terkunci
                    </span>
                  )}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Kwartir Daerah (Provinsi) {isRegencyOperator && <span className="text-amber-700 text-[10px]">(Terkunci)</span>}
                    </label>
                    <select
                      disabled={isRegencyOperator || isProvinceAdmin || isBranchAdmin}
                      value={selectedProvinceId}
                      onChange={(e) => setSelectedProvinceId(e.target.value)}
                      className={`w-full px-3.5 py-2 border rounded-xl outline-none text-slate-800 ${
                        isRegencyOperator || isProvinceAdmin || isBranchAdmin
                          ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600'
                      }`}
                    >
                      {provinces.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Kwartir Cabang (Kabupaten / Kota) {isRegencyOperator && <span className="text-amber-700 text-[10px]">(Khusus Wilayah Anda)</span>}
                    </label>
                    <select
                      disabled={isRegencyOperator || isBranchAdmin}
                      value={selectedRegencyId}
                      onChange={(e) => setSelectedRegencyId(e.target.value)}
                      className={`w-full px-3.5 py-2 border rounded-xl outline-none ${
                        isRegencyOperator || isBranchAdmin
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold cursor-not-allowed'
                          : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 text-slate-800'
                      }`}
                    >
                      {regencies.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Kecamatan (Distrik / Kwarran)</label>
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => setSelectedDistrictId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                    >
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Pangkalan Saka / Kwarran</label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-800 mb-1">Gugus Depan (Gudep) & Pangkalan</label>
                    <input
                      type="text"
                      value={gugusDepan}
                      onChange={(e) => setGugusDepan(e.target.value)}
                      placeholder="Contoh: 06.12.01-02 Pangkalan SMK Negeri 1 Pariwisata"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KRIDA & STATUS KTA */}
          {activeTab === 'SAKA' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Peminatan Krida Saka</label>
                  <select
                    value={krida}
                    onChange={(e: any) => setKrida(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800 font-semibold"
                  >
                    <option value="Krida Pemandu">Krida Pemandu (Tour Guiding & Ekowisata)</option>
                    <option value="Krida Penyuluh">Krida Penyuluh (Sadarlah Sapta Pesona & Edukasi)</option>
                    <option value="Krida Mice & Event">Krida MICE & Event (Manajemen Acara & Atraksi)</option>
                    <option value="Krida Kuliner & Cinderamata">Krida Kuliner & Cinderamata (UMKM & Budaya)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Posisi / Jabatan Kepengurusan</label>
                  <input
                    type="text"
                    value={currentPosition}
                    onChange={(e) => setCurrentPosition(e.target.value)}
                    placeholder="Contoh: Anggota Krida / Dewan Saka / Instruktur"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Status Keanggotaan</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800 font-bold"
                  >
                    <option value="ACTIVE">AKTIF (KTA Terverifikasi Penuh)</option>
                    <option value="PENDING">PENDING (Menunggu Verifikasi)</option>
                    <option value="REVISION_REQUIRED">PERLU PERBAIKAN DOKUMEN</option>
                    <option value="SUSPENDED">SUSPENDED (Ditangguhkan)</option>
                    <option value="INACTIVE">NONAKTIF</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tahun Bergabung Saka</label>
                  <input
                    type="number"
                    value={joinYear}
                    onChange={(e) => setJoinYear(Number(e.target.value))}
                    min={2000}
                    max={2030}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800"
                  />
                </div>

                {/* Nomor Anggota Nasional (NTA) */}
                <div className="md:col-span-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-800">Nomor Tanda Anggota (NTA)</label>
                    <button
                      type="button"
                      onClick={handleGenerateNewNta}
                      className="text-[11px] text-purple-900 hover:text-purple-950 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Generate Sesuai Kode Wilayah Terpilih</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={nationalMemberNumber}
                    onChange={(e) => setNationalMemberNumber(e.target.value)}
                    placeholder="Contoh: 32.06.12.000001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-purple-950 font-mono font-bold text-sm tracking-wider"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Format Standar Nasional: [Kode Prov].[Kode Kab/Kota].[Kode Kec].[Urutan 6 Digit]
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: KEAHLIAN & SERTIFIKASI */}
          {activeTab === 'SKILLS' && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
                <div>
                  <h4 className="font-bold text-sm font-heading flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Direktori Keahlian & Talent Pool Anggota</span>
                  </h4>
                  <p className="text-[11px] text-purple-200 mt-0.5">
                    Kelola data keahlian, sertifikasi kompetensi, serta persetujuan resmi Kwartir.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingSkillInline(!isAddingSkillInline)}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingSkillInline ? 'Tutup Form' : 'Tambah Keahlian'}</span>
                </button>
              </div>

              {/* Inline Add Skill Form */}
              {isAddingSkillInline && (
                <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-4">
                  <h5 className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-purple-700" />
                    <span>Input Keahlian & Sertifikat Baru</span>
                  </h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Pilih dari Master Keahlian Standar</label>
                      <select
                        value={selectedMasterSkillId}
                        onChange={(e) => handleSelectMasterSkillInline(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                      >
                        <option value="CUSTOM">-- Input Manual / Keahlian Khusus --</option>
                        {masterSkills.map(ms => (
                          <option key={ms.id} value={ms.id}>{ms.name} ({ms.category})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Nama Keahlian / Kompetensi <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        placeholder="Contoh: Pemandu Wisata Arung Jeram / Fotografi Budaya"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Kategori Bidang</label>
                      <select
                        value={newSkillCategory}
                        onChange={(e) => setNewSkillCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                      >
                        <option value="Pemanduan & Tour Guide">Pemanduan & Tour Guide</option>
                        <option value="Hospitality & Layanan Wisata">Hospitality & Layanan Wisata</option>
                        <option value="Fotografi & Videografi Wisata">Fotografi & Videografi Wisata</option>
                        <option value="Promosi & Digital Marketing Pariwisata">Promosi & Digital Marketing Pariwisata</option>
                        <option value="Konservasi, Ekowisata & Alam">Konservasi, Ekowisata & Alam</option>
                        <option value="Kuliner Tradisional & Kriya">Kuliner Tradisional & Kriya</option>
                        <option value="Event, MICE & Atraksi Budaya">Event, MICE & Atraksi Budaya</option>
                        <option value="Kepramukaan & Kepemimpinan Saka">Kepramukaan & Kepemimpinan Saka</option>
                        <option value="Keahlian Khusus Lainnya">Keahlian Khusus Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Tingkat Kemahiran (Proficiency)</label>
                      <select
                        value={newSkillProficiency}
                        onChange={(e) => setNewSkillProficiency(e.target.value as SkillProficiency)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                      >
                        <option value="BEGINNER">BEGINNER (Dasar / Pemula)</option>
                        <option value="INTERMEDIATE">INTERMEDIATE (Menengah / Terampil)</option>
                        <option value="ADVANCED">ADVANCED (Mahir / Berpengalaman)</option>
                        <option value="EXPERT">EXPERT (Ahli / Instruktur / Asesor)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Pengalaman (Tahun)</label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={newSkillYears}
                        onChange={(e) => setNewSkillYears(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Nomor Sertifikat / Lisensi (Opsional)</label>
                      <input
                        type="text"
                        value={newSkillCertNo}
                        onChange={(e) => setNewSkillCertNo(e.target.value)}
                        placeholder="Contoh: BNSP-PAR-2024-9988"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Lembaga Penerbit Sertifikat (Opsional)</label>
                      <input
                        type="text"
                        value={newSkillCertIssuer}
                        onChange={(e) => setNewSkillCertIssuer(e.target.value)}
                        placeholder="Contoh: LSP Pariwisata / BNSP / Dispar"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Link Portofolio / Berkas Pendukung (Opsional)</label>
                      <input
                        type="url"
                        value={newSkillPortfolio}
                        onChange={(e) => setNewSkillPortfolio(e.target.value)}
                        placeholder="https://drive.google.com/... atau link website"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-purple-200 flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSkillIsVerified}
                        onChange={(e) => setNewSkillIsVerified(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="font-bold text-slate-800 text-xs">
                        Langsung Setujui & Verifikasi Keahlian Ini (Disetujui Kwartir)
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleAddSkillInline}
                      className="px-4 py-1.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Tambahkan ke Daftar
                    </button>
                  </div>
                </div>
              )}

              {/* Skills List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider">
                    Daftar Keahlian ({memberSkills.length}):
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Klik tombol centang untuk menyetujui / membatalkan verifikasi
                  </span>
                </div>

                {memberSkills.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-2">
                    <Award className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-bold text-xs text-slate-600">Belum ada keahlian terdaftar untuk anggota ini.</p>
                    <p className="text-[11px] text-slate-400">Klik "Tambah Keahlian" di atas untuk menambahkan portofolio kompetensi.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {memberSkills.map((sk) => (
                      <div
                        key={sk.id}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          sk.isVerified 
                            ? 'bg-emerald-50/50 border-emerald-200' 
                            : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-xs">{sk.skillName}</span>
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700">
                              {sk.proficiency}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {sk.yearsOfExperience || 1} Th Pengalaman
                            </span>
                            {sk.isVerified ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-[10px] font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Disetujui Kwartir</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-md text-[10px] font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Menunggu Persetujuan</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
                            <span className="text-slate-400">Kategori: <strong>{sk.category}</strong></span>
                            {sk.certificateNumber && (
                              <span>• No Sertifikat: <strong className="font-mono text-purple-900">{sk.certificateNumber}</strong> ({sk.certificateIssuer || 'Lembaga Terkait'})</span>
                            )}
                            {sk.portfolioUrl && (
                              <a
                                href={sk.portfolioUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-700 hover:text-purple-900 flex items-center gap-0.5 underline font-medium"
                              >
                                <span>Portofolio</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {sk.verifiedBy && (
                            <p className="text-[10px] text-emerald-700 font-medium">
                              Diverifikasi oleh: {sk.verifiedBy} {sk.verifiedAt ? `(${new Date(sk.verifiedAt).toLocaleDateString('id-ID')})` : ''}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleSkillVerification(sk.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              sk.isVerified
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                            title={sk.isVerified ? 'Batalkan status persetujuan' : 'Setujui keahlian ini'}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{sk.isVerified ? 'Batal Setujui' : 'Setujui Keahlian'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSkillInline(sk.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                            title="Hapus keahlian dari daftar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CATATAN PERUBAHAN & AUDIT TRAIL */}
          {activeTab === 'REASON' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <label className="block font-bold text-slate-900 mb-1.5 text-xs">
                  Alasan / Catatan Perubahan Data Administratif <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  placeholder="Contoh: Koreksi penulisan ejaan nama dan penambahan gelar S.Par. berdasarkan verifikasi ijazah..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none text-slate-800 text-xs"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  Catatan ini akan tersimpan permanen pada sistem <strong>Audit Trail Kwartir</strong> dan disampaikan melalui notifikasi aplikasi kepada anggota yang bersangkutan.
                </p>
              </div>

              {/* Summary of What Will Be Saved */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
                <h5 className="font-bold text-purple-950 text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ringkasan Data yang Akan Disimpan:</span>
                </h5>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div>
                    <span className="text-slate-500">Nama:</span> <strong className="text-slate-900">{fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Krida:</span> <strong className="text-purple-950">{krida}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Wilayah:</span> <strong>{currentRegency?.name || member.regencyName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Status:</span> <strong className="text-emerald-700">{status}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Tab aktif: {activeTab === 'IDENTITY' ? 'Identitas' : activeTab === 'DOMICILE' ? 'Domisili' : activeTab === 'SAKA' ? 'Krida' : 'Catatan'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-950 hover:to-indigo-950 text-white rounded-xl font-bold transition-all shadow-md shadow-purple-950/20 flex items-center gap-2 cursor-pointer text-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-purple-300" />
                <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Data'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
