import React, { useState, useEffect } from 'react';
import { 
  Award, 
  X, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  ExternalLink, 
  Sparkles, 
  Search, 
  FileText, 
  Briefcase, 
  Link as LinkIcon,
  Check,
  UserCheck,
  BookOpen,
  Filter
} from 'lucide-react';
import { Member, MemberSkill, SkillProficiency, CurrentUser, Skill } from '../../types';
import { storage } from '../../services/storage';
import { formatDriveImageUrl, getDriveDirectFallbackUrl, getValidAvatarUrl } from '../common/SakaLogo';

interface MemberSkillManagementModalProps {
  isOpen: boolean;
  member: Member | null;
  currentUser: CurrentUser;
  onClose: () => void;
  onSuccess?: (updatedMember: Member) => void;
}

export const MemberSkillManagementModal: React.FC<MemberSkillManagementModalProps> = ({
  isOpen,
  member: initialMember,
  currentUser,
  onClose,
  onSuccess
}) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(initialMember);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [masterSkills, setMasterSkills] = useState<Skill[]>([]);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');

  // Form states
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  const [selectedMasterSkillId, setSelectedMasterSkillId] = useState('CUSTOM');
  const [skillName, setSkillName] = useState('');
  const [category, setCategory] = useState<string>('Pemanduan & Tour Guide');
  const [proficiency, setProficiency] = useState<SkillProficiency>('INTERMEDIATE');
  const [yearsOfExperience, setYearsOfExperience] = useState(2);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [certificateIssuer, setCertificateIssuer] = useState('');
  const [certificateFileUrl, setCertificateFileUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isApprovedByAdmin, setIsApprovedByAdmin] = useState(true);

  const [approvalNotesPrompt, setApprovalNotesPrompt] = useState<{ skillId: string; skillName: string } | null>(null);
  const [customApprovalNotes, setCustomApprovalNotes] = useState('');

  const isAdminOrOperator = ['SUPER_ADMIN', 'ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(currentUser.role);

  useEffect(() => {
    if (isOpen) {
      const membersList = storage.getMembers();
      setAllMembers(membersList);
      setMasterSkills(storage.getSkills());

      if (initialMember) {
        // Refresh fresh member from storage
        const fresh = membersList.find(m => m.id === initialMember.id) || initialMember;
        setSelectedMember(fresh);
      } else if (currentUser.role === 'MEMBER' && currentUser.memberId) {
        const myMember = membersList.find(m => m.id === currentUser.memberId);
        if (myMember) setSelectedMember(myMember);
      }
      resetForm();
    }
  }, [isOpen, initialMember, currentUser]);

  const resetForm = () => {
    setIsAddingNew(false);
    setEditingSkillId(null);
    setSelectedMasterSkillId('CUSTOM');
    setSkillName('');
    setCategory('Pemanduan & Tour Guide');
    setProficiency('INTERMEDIATE');
    setYearsOfExperience(2);
    setPortfolioUrl('');
    setCertificateNumber('');
    setCertificateIssuer('');
    setCertificateFileUrl('');
    setNotes('');
    setIsApprovedByAdmin(isAdminOrOperator);
    setApprovalNotesPrompt(null);
  };

  const handleSelectMasterSkill = (id: string) => {
    setSelectedMasterSkillId(id);
    if (id === 'CUSTOM') {
      setSkillName('');
    } else {
      const found = masterSkills.find(s => s.id === id);
      if (found) {
        setSkillName(found.name);
        setCategory(found.category);
      }
    }
  };

  const handleStartEdit = (skill: MemberSkill) => {
    setIsAddingNew(true);
    setEditingSkillId(skill.id);
    
    // Check if matches master skill
    const matchMaster = masterSkills.find(s => s.name.toLowerCase() === skill.skillName.toLowerCase());
    setSelectedMasterSkillId(matchMaster ? matchMaster.id : 'CUSTOM');
    
    setSkillName(skill.skillName);
    setCategory(skill.category);
    setProficiency(skill.proficiency);
    setYearsOfExperience(skill.yearsOfExperience || 1);
    setPortfolioUrl(skill.portfolioUrl || '');
    setCertificateNumber(skill.certificateNumber || '');
    setCertificateIssuer(skill.certificateIssuer || '');
    setCertificateFileUrl(skill.certificateFileUrl || '');
    setNotes(skill.notes || '');
    setIsApprovedByAdmin(skill.isVerified);
  };

  const handleSaveSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    if (!skillName.trim()) {
      alert('Mohon masukkan nama keahlian atau pilih dari daftar master keahlian.');
      return;
    }

    const currentSkills = selectedMember.skills ? [...selectedMember.skills] : [];

    if (editingSkillId) {
      // Edit existing skill
      const idx = currentSkills.findIndex(s => s.id === editingSkillId);
      if (idx !== -1) {
        const updatedSkill: MemberSkill = {
          ...currentSkills[idx],
          skillName: skillName.trim(),
          category,
          proficiency,
          yearsOfExperience: Number(yearsOfExperience),
          portfolioUrl: portfolioUrl.trim() || undefined,
          certificateNumber: certificateNumber.trim() || undefined,
          certificateIssuer: certificateIssuer.trim() || undefined,
          certificateFileUrl: certificateFileUrl.trim() || undefined,
          notes: notes.trim() || undefined,
          isVerified: isAdminOrOperator ? isApprovedByAdmin : currentSkills[idx].isVerified,
          verifiedBy: isAdminOrOperator && isApprovedByAdmin ? currentUser.name : currentSkills[idx].verifiedBy,
          verifiedAt: isAdminOrOperator && isApprovedByAdmin ? (currentSkills[idx].verifiedAt || new Date().toISOString()) : currentSkills[idx].verifiedAt
        };
        currentSkills[idx] = updatedSkill;
      }
    } else {
      // Create new skill
      const newSkill: MemberSkill = {
        id: `skill-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        skillId: selectedMasterSkillId !== 'CUSTOM' ? selectedMasterSkillId : `custom-${Date.now()}`,
        skillName: skillName.trim(),
        category,
        proficiency,
        yearsOfExperience: Number(yearsOfExperience),
        portfolioUrl: portfolioUrl.trim() || undefined,
        certificateNumber: certificateNumber.trim() || undefined,
        certificateIssuer: certificateIssuer.trim() || undefined,
        certificateFileUrl: certificateFileUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        isVerified: isAdminOrOperator ? isApprovedByAdmin : false,
        verifiedBy: isAdminOrOperator && isApprovedByAdmin ? currentUser.name : undefined,
        verifiedAt: isAdminOrOperator && isApprovedByAdmin ? new Date().toISOString() : undefined
      };
      currentSkills.push(newSkill);
    }

    const updated = storage.updateMemberSkills(
      selectedMember.id,
      currentSkills,
      undefined,
      currentUser,
      editingSkillId ? `Mengedit keahlian "${skillName}"` : `Menambahkan keahlian "${skillName}"`
    );

    if (updated) {
      setSelectedMember(updated);
      if (onSuccess) onSuccess(updated);
      resetForm();
    }
  };

  const handleApproveSkill = (skillId: string, skillName: string) => {
    if (!selectedMember || !isAdminOrOperator) return;
    setApprovalNotesPrompt({ skillId, skillName });
    setCustomApprovalNotes('Telah diverifikasi sesuai standar SKK Pramuka Pariwisata dan portofolio.');
  };

  const handleConfirmApproval = () => {
    if (!selectedMember || !approvalNotesPrompt) return;
    const updated = storage.approveMemberSkill(
      selectedMember.id,
      approvalNotesPrompt.skillId,
      currentUser,
      customApprovalNotes.trim() || undefined
    );
    if (updated) {
      setSelectedMember(updated);
      if (onSuccess) onSuccess(updated);
      setApprovalNotesPrompt(null);
    }
  };

  const handleRevokeApproval = (skillId: string) => {
    if (!selectedMember || !isAdminOrOperator) return;
    if (!confirm('Apakah Anda yakin ingin membatalkan status verifikasi keahlian ini? Keahlian akan berstatus pending dan tidak tampil di publik sampai disetujui kembali.')) return;

    const currentSkills = selectedMember.skills ? [...selectedMember.skills] : [];
    const idx = currentSkills.findIndex(s => s.id === skillId);
    if (idx !== -1) {
      currentSkills[idx].isVerified = false;
      currentSkills[idx].verifiedBy = undefined;
      currentSkills[idx].verifiedAt = undefined;
      const updated = storage.updateMemberSkills(
        selectedMember.id,
        currentSkills,
        undefined,
        currentUser,
        `Membatalkan persetujuan keahlian "${currentSkills[idx].skillName}"`
      );
      if (updated) {
        setSelectedMember(updated);
        if (onSuccess) onSuccess(updated);
      }
    }
  };

  const handleDeleteSkill = (skillId: string, name: string) => {
    if (!selectedMember) return;
    if (!confirm(`Hapus keahlian "${name}" dari data profil anggota ini?`)) return;

    const updated = storage.rejectOrDeleteMemberSkill(selectedMember.id, skillId, currentUser);
    if (updated) {
      setSelectedMember(updated);
      if (onSuccess) onSuccess(updated);
      if (editingSkillId === skillId) resetForm();
    }
  };

  if (!isOpen) return null;

  // Filter members for selection
  const filteredCandidates = allMembers.filter(m => {
    if (!searchMemberQuery) return true;
    const q = searchMemberQuery.toLowerCase();
    return (
      (m.fullName || '').toLowerCase().includes(q) ||
      (m.nationalMemberNumber || '').toLowerCase().includes(q) ||
      (m.regencyName || '').toLowerCase().includes(q) ||
      (m.provinceName || '').toLowerCase().includes(q)
    );
  });

  const getProficiencyLabel = (p: SkillProficiency) => {
    switch (p) {
      case 'BEGINNER': return { label: 'Dasar / Pemula', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      case 'INTERMEDIATE': return { label: 'Menengah / Kompeten', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ADVANCED': return { label: 'Mahir / Teruji', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'EXPERT': return { label: 'Ahli / Spesialis', color: 'bg-amber-50 text-amber-800 border-amber-300' };
      default: return { label: p, color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-900 text-white p-5 sm:p-6 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-300/30 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                  Talent Pool Pariwisata
                </span>
                {isAdminOrOperator && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-md text-[10px] font-bold">
                    Otoritas Verifikasi Aktif
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black font-heading mt-0.5">
                Direktori Keahlian & Manajemen Kompetensi Anggota
              </h3>
              <p className="text-xs text-purple-200/80">
                Pencatatan, pengeditan, dan persetujuan resmi talenta Saka Pariwisata se-Indonesia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Member Selector Bar (If Admin wants to switch member) */}
        {isAdminOrOperator && (
          <div className="bg-slate-50 border-b border-slate-200 p-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="font-bold text-slate-600 whitespace-nowrap">Pilih Anggota:</span>
              <select
                value={selectedMember?.id || ''}
                onChange={(e) => {
                  const m = allMembers.find(item => item.id === e.target.value);
                  if (m) {
                    setSelectedMember(m);
                    resetForm();
                  }
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800 outline-none w-full sm:w-72"
              >
                <option value="">-- Pilih Anggota dari Database --</option>
                {allMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.nationalMemberNumber || 'Belum NTA'}) - {m.regencyName}
                  </option>
                ))}
              </select>
            </div>

            {selectedMember && (
              <div className="flex items-center gap-2 text-slate-500">
                <span className="text-[11px]">
                  Total Keahlian: <strong className="text-purple-900">{selectedMember.skills?.length || 0}</strong> (
                  <strong className="text-emerald-600">{selectedMember.skills?.filter(s => s.isVerified).length || 0} Disetujui</strong>)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          
          {/* Active Member Card Summary */}
          {selectedMember ? (
            <div className="flex items-center justify-between gap-4 p-4 bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50/50 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={selectedMember.avatarUrl ? (formatDriveImageUrl(selectedMember.avatarUrl) || selectedMember.avatarUrl) : getValidAvatarUrl('', selectedMember.gender)}
                  alt={selectedMember.fullName}
                  referrerPolicy="no-referrer"
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-purple-600 shadow-sm flex-shrink-0 bg-slate-900"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const direct = getDriveDirectFallbackUrl(selectedMember.avatarUrl);
                    if (direct && img.src !== direct) img.src = direct;
                    else img.src = getValidAvatarUrl('', selectedMember.gender);
                  }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-extrabold text-base text-slate-900 truncate font-heading">
                      {selectedMember.fullName}
                    </h4>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded-md text-[10px] font-bold font-mono">
                      {selectedMember.nationalMemberNumber || 'Nomor NTA Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">
                    <strong>{selectedMember.krida || 'Krida Pemandu'}</strong> • {selectedMember.branchName}, {selectedMember.regencyName} ({selectedMember.provinceName})
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                {!isAddingNew && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setIsAddingNew(true);
                    }}
                    className="px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Keahlian</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400">
              <UserCheck className="w-10 h-10 mx-auto text-slate-300 stroke-1 mb-2" />
              <p className="font-bold text-slate-700">Silakan pilih anggota terlebih dahulu untuk mengelola data keahlian.</p>
            </div>
          )}

          {/* Form Section (Add / Edit Skill) */}
          {selectedMember && isAddingNew && (
            <form onSubmit={handleSaveSkill} className="bg-white p-5 rounded-2xl border-2 border-purple-200 shadow-sm space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-700" />
                  <h4 className="font-bold text-sm text-purple-950 font-heading">
                    {editingSkillId ? 'Edit Data Keahlian & Kompetensi' : 'Formulir Input Keahlian Baru'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Batal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Master Skill Preset */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pilih Preset Keahlian Resmi (SKK Pramuka / SKKNI)
                  </label>
                  <select
                    value={selectedMasterSkillId}
                    onChange={(e) => handleSelectMasterSkill(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-medium outline-none focus:border-purple-500 focus:bg-white"
                  >
                    <option value="CUSTOM">-- Input Keahlian Kustom / Khusus --</option>
                    {masterSkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Skill Name */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Keahlian / Kompetensi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    placeholder="Contoh: Pemandu Wisata Arung Jeram, Fotografi Satwa Liar..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Bidang Pariwisata <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-purple-500 focus:bg-white font-medium"
                  >
                    <option value="Pemanduan & Tour Guide">Pemanduan & Tour Guide</option>
                    <option value="Fotografi & Media">Fotografi & Media</option>
                    <option value="Ekowisata & Alam">Ekowisata & Alam</option>
                    <option value="Hospitality & Kuliner">Hospitality & Kuliner</option>
                    <option value="Digital Marketing & UMKM">Digital Marketing & UMKM</option>
                    <option value="Budaya & Storytelling">Budaya & Storytelling</option>
                    <option value="MICE & Event">MICE & Event</option>
                  </select>
                </div>

                {/* Proficiency */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tingkat Kemahiran (Proficiency) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value as SkillProficiency)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-purple-500 focus:bg-white font-medium"
                  >
                    <option value="BEGINNER">BEGINNER (Dasar / Pemula / Tingkat Purwa)</option>
                    <option value="INTERMEDIATE">INTERMEDIATE (Menengah / Kompeten / Madya)</option>
                    <option value="ADVANCED">ADVANCED (Mahir / Teruji / Utama)</option>
                    <option value="EXPERT">EXPERT (Ahli / Spesialis / Instruktur / BNSP)</option>
                  </select>
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lama Pengalaman (Tahun)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                {/* Portfolio URL */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tautan Portofolio / Link Karya (Opsional)
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://instagram.com/..., https://drive.google.com/..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Certificate Section */}
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/70 space-y-3 text-xs">
                <div className="flex items-center gap-1.5 text-purple-950 font-bold">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Sertifikasi Resmi (BNSP / LSP Pariwisata / Kemenparekraf / Kwartir)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Nomor Sertifikat</label>
                    <input
                      type="text"
                      value={certificateNumber}
                      onChange={(e) => setCertificateNumber(e.target.value)}
                      placeholder="Contoh: BNSP-PAR-123456"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Lembaga Penerbit</label>
                    <input
                      type="text"
                      value={certificateIssuer}
                      onChange={(e) => setCertificateIssuer(e.target.value)}
                      placeholder="LSP Pramuka / BNSP / Kemenparekraf"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Link Berkas Sertifikat</label>
                    <input
                      type="url"
                      value={certificateFileUrl}
                      onChange={(e) => setCertificateFileUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Verification Toggle (For Admin / Operator) */}
              {isAdminOrOperator && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-950">Status Persetujuan Otoritas:</span>
                      <p className="text-[11px] text-emerald-700">
                        Keahlian yang disetujui langsung tampil di Direktori Keahlian & Talent Pool Pariwisata Publik
                      </p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 font-bold text-emerald-900 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isApprovedByAdmin}
                      onChange={(e) => setIsApprovedByAdmin(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span>Disetujui & Terverifikasi</span>
                  </label>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-xl font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingSkillId ? 'Simpan Perubahan Keahlian' : 'Tambahkan Keahlian Anggota'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Existing Skills List */}
          {selectedMember && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-800 font-heading flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-700" />
                  <span>Daftar Keahlian Terdaftar ({selectedMember.skills?.length || 0})</span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  {selectedMember.skills?.filter(s => s.isVerified).length || 0} Terverifikasi • {selectedMember.skills?.filter(s => !s.isVerified).length || 0} Menunggu Persetujuan
                </span>
              </div>

              {(!selectedMember.skills || selectedMember.skills.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 space-y-2">
                  <Award className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                  <p className="font-bold text-slate-700">Belum ada keahlian yang didaftarkan untuk anggota ini.</p>
                  <p className="text-xs text-slate-500">
                    Klik tombol <strong>"Tambah Keahlian"</strong> di atas untuk menginput kompetensi pariwisata.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {selectedMember.skills.map((skill) => {
                    const prof = getProficiencyLabel(skill.proficiency);
                    return (
                      <div
                        key={skill.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          skill.isVerified 
                            ? 'bg-white border-emerald-200/80 shadow-xs hover:border-emerald-300' 
                            : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-extrabold text-sm text-slate-900 font-heading">
                              {skill.skillName}
                            </h5>
                            
                            {/* Category Badge */}
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold">
                              {skill.category}
                            </span>

                            {/* Proficiency Badge */}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${prof.color}`}>
                              {prof.label}
                            </span>

                            {/* Approval Status Badge */}
                            {skill.isVerified ? (
                              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Disetujui Kwartir</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Menunggu Persetujuan</span>
                              </span>
                            )}
                          </div>

                          {/* Skill Details */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                            <span>Pengalaman: <strong>{skill.yearsOfExperience || 1} Tahun</strong></span>
                            
                            {skill.certificateNumber && (
                              <span>Sertifikat: <strong className="text-purple-900">{skill.certificateNumber}</strong> ({skill.certificateIssuer || 'BNSP'})</span>
                            )}

                            {skill.verifiedBy && (
                              <span className="text-emerald-700 text-[11px]">
                                Diverifikasi oleh: <strong>{skill.verifiedBy}</strong>
                              </span>
                            )}
                          </div>

                          {/* Notes / Portfolio link */}
                          <div className="flex items-center gap-3 pt-0.5">
                            {skill.portfolioUrl && (
                              <a
                                href={skill.portfolioUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Lihat Portofolio</span>
                              </a>
                            )}

                            {skill.certificateFileUrl && (
                              <a
                                href={skill.certificateFileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Berkas Sertifikat</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Action Controls for Admin/Operator */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                          {isAdminOrOperator && (
                            <>
                              {!skill.isVerified ? (
                                <button
                                  type="button"
                                  onClick={() => handleApproveSkill(skill.id, skill.skillName)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                                  title="Setujui keahlian ini agar masuk Talent Pool publik"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Setujui</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeApproval(skill.id)}
                                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                  title="Batalkan verifikasi (kembalikan ke pending)"
                                >
                                  <span>Batalkan</span>
                                </button>
                              )}
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleStartEdit(skill)}
                            className="p-2 hover:bg-purple-100 text-purple-800 rounded-xl transition-colors cursor-pointer"
                            title="Edit data keahlian"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteSkill(skill.id, skill.skillName)}
                            className="p-2 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors cursor-pointer"
                            title="Hapus keahlian"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quick Info Box */}
          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 text-xs text-purple-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-purple-700" />
              <span>Standarisasi Talent Pool Gerakan Pramuka Pariwisata</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Direktori Keahlian & Talent Pool Pariwisata merupakan pangkalan data resmi tenaga terampil kepariwisataan anggota Saka Pariwisata se-Indonesia. Keahlian yang telah <strong>Disetujui</strong> oleh Kwartir (Super Admin / Admin Daerah / Cabang / Ranting) dapat diakses oleh dinas pariwisata, industri travel, dan mitra kepariwisataan untuk penugasan event, pemanduan wisata, promosi digital, dan pemberdayaan ekonomi kreatif.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            {selectedMember ? `ID Anggota: ${selectedMember.id}` : 'Pilih anggota untuk mulai'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Approval Confirmation Dialog with Notes */}
      {approvalNotesPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 animate-in fade-in duration-100">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
              <h4 className="font-bold text-sm font-heading">
                Setujui Keahlian "{approvalNotesPrompt.skillName}"
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Dengan menyetujui keahlian ini, profil Kak <strong>{selectedMember?.fullName}</strong> akan secara resmi terverifikasi dan tampil pada <strong>Direktori Keahlian & Talent Pool Pariwisata</strong> tingkat nasional.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Verifikasi / Rekomendasi (Opsional)
              </label>
              <textarea
                rows={2}
                value={customApprovalNotes}
                onChange={(e) => setCustomApprovalNotes(e.target.value)}
                placeholder="Tuliskan catatan verifikasi atau rekomendasi penugasan..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApprovalNotesPrompt(null)}
                className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Konfirmasi & Setujui</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
