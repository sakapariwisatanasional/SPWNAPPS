import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  Sparkles, 
  Filter, 
  Phone, 
  Mail, 
  ExternalLink, 
  ChevronRight,
  Clock,
  Plus,
  Edit3,
  Sliders,
  Check,
  Building,
  UserCheck
} from 'lucide-react';
import { Member, Skill, CurrentUser, MemberSkill } from '../types';
import { formatDriveImageUrl, getDriveDirectFallbackUrl, getValidAvatarUrl } from '../components/common/SakaLogo';

interface SkillDirectoryViewProps {
  currentUser: CurrentUser;
  members: Member[];
  skills: Skill[];
  onOpenVerifyModal: (member: Member) => void;
  onOpenSkillManagementModal?: (member?: Member) => void;
}

export const SkillDirectoryView: React.FC<SkillDirectoryViewProps> = ({
  currentUser,
  members,
  skills,
  onOpenVerifyModal,
  onOpenSkillManagementModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSkillId, setSelectedSkillId] = useState<string>('ALL');
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<'ALL' | 'VERIFIED_ONLY' | 'PENDING_ONLY'>('ALL');

  const isAdminOrOperator = ['SUPER_ADMIN', 'ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(currentUser.role);
  const loggedInMember = members.find(m => m.id === currentUser.memberId);

  // Categories extracted
  const categories = useMemo(() => {
    const list = Array.from(new Set(skills.map(s => s.category)));
    return list;
  }, [skills]);

  // Statistics calculation
  const stats = useMemo(() => {
    let totalSkillsCount = 0;
    let verifiedSkillsCount = 0;
    let pendingSkillsCount = 0;
    let verifiedMembersCount = 0;

    members.forEach(m => {
      if (m.skills && m.skills.length > 0) {
        let hasVerified = false;
        m.skills.forEach(s => {
          totalSkillsCount++;
          if (s.isVerified) {
            verifiedSkillsCount++;
            hasVerified = true;
          } else {
            pendingSkillsCount++;
          }
        });
        if (hasVerified) verifiedMembersCount++;
      }
    });

    return { totalSkillsCount, verifiedSkillsCount, pendingSkillsCount, verifiedMembersCount };
  }, [members]);

  // Filter skills and matching members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (!m.skills || m.skills.length === 0) return false;

      // Search Query
      const q = (searchQuery || '').toLowerCase();
      const matchSearch = 
        (m.fullName || '').toLowerCase().includes(q) ||
        (m.nationalMemberNumber && m.nationalMemberNumber.toLowerCase().includes(q)) ||
        (m.skills && m.skills.some(s => (s.skillName || '').toLowerCase().includes(q))) ||
        (m.provinceName || '').toLowerCase().includes(q) ||
        (m.regencyName || '').toLowerCase().includes(q) ||
        (m.krida && m.krida.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Category filter
      if (selectedCategory !== 'ALL') {
        const hasCat = m.skills.some(s => s.category === selectedCategory);
        if (!hasCat) return false;
      }

      // Specific Skill filter
      if (selectedSkillId !== 'ALL') {
        const hasSkill = m.skills.some(s => s.skillId === selectedSkillId || s.skillName.toLowerCase().includes(selectedSkillId.toLowerCase()));
        if (!hasSkill) return false;
      }

      // Approval Status filter
      if (selectedApprovalStatus === 'VERIFIED_ONLY') {
        const hasVerified = m.skills.some(s => s.isVerified);
        if (!hasVerified) return false;
      } else if (selectedApprovalStatus === 'PENDING_ONLY') {
        const hasPending = m.skills.some(s => !s.isVerified);
        if (!hasPending) return false;
      }

      return true;
    });
  }, [members, searchQuery, selectedCategory, selectedSkillId, selectedApprovalStatus]);

  const handleOpenManageSkills = (member?: Member) => {
    if (onOpenSkillManagementModal) {
      onOpenSkillManagementModal(member);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-300/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
              Talent Pool & Kompetensi
            </span>
            <span className="text-purple-300 text-xs font-mono">
              Standar SKK Saka Pariwisata & SKKNI BNSP
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-white">
            Direktori Keahlian & Talent Pool Pariwisata
          </h2>
          <p className="text-xs text-purple-200/80 leading-relaxed">
            Pangkalan data resmi talenta pemanduan, fotografi wisata, kuliner kriya, ekowisata, promosi digital, dan penyelenggara event pariwisata se-Indonesia yang disetujui & diverifikasi oleh Kwartir.
          </p>
        </div>

        {/* Action Hub */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-2.5 flex-shrink-0">
          {isAdminOrOperator ? (
            <button
              type="button"
              onClick={() => handleOpenManageSkills()}
              className="px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-heading"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>Kelola & Setujui Keahlian</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenManageSkills(loggedInMember || undefined)}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Keahlian / Sertifikat Saya</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Talenta Terdaftar</span>
          <p className="text-xl font-black text-slate-900 mt-1 font-heading">{filteredMembers.length} Orang</p>
          <span className="text-[11px] text-slate-500">Anggota berkeahlian</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Keahlian Disetujui</span>
          <p className="text-xl font-black text-emerald-700 mt-1 font-heading">{stats.verifiedSkillsCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Terverifikasi Kwartir</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Menunggu Persetujuan</span>
          <p className="text-xl font-black text-amber-700 mt-1 font-heading">{stats.pendingSkillsCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">Perlu review admin</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Total Portofolio Keahlian</span>
          <p className="text-xl font-black text-purple-900 mt-1 font-heading">{stats.totalSkillsCount}</p>
          <span className="text-[11px] text-purple-600 font-medium">Keahlian terdata</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari talenta, nama, wilayah, keahlian..."
              className="bg-transparent outline-none w-full text-slate-800"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSkillId('ALL');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium text-slate-700"
            >
              <option value="ALL">Semua Kategori Bidang</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Specific Skill */}
          <div>
            <select
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium text-slate-700"
            >
              <option value="ALL">Semua Jenis Keahlian Khusus</option>
              {skills
                .filter(s => selectedCategory === 'ALL' || s.category === selectedCategory)
                .map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
          </div>

          {/* Approval Status Filter */}
          <div>
            <select
              value={selectedApprovalStatus}
              onChange={(e) => setSelectedApprovalStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium text-slate-700"
            >
              <option value="ALL">Semua Status Verifikasi</option>
              <option value="VERIFIED_ONLY">Hanya yang Disetujui (Terverifikasi Resmi)</option>
              <option value="PENDING_ONLY">Menunggu Persetujuan (Pending Review)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Member Talent Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
          <Award className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <p className="font-bold text-slate-700">Tidak ada talenta keahlian yang cocok dengan filter yang dipilih.</p>
          {isAdminOrOperator && (
            <button
              type="button"
              onClick={() => handleOpenManageSkills()}
              className="px-4 py-2 bg-purple-900 text-white rounded-xl text-xs font-bold hover:bg-purple-800 transition-colors"
            >
              Input Keahlian Anggota Baru
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const verifiedSkills = (member.skills || []).filter(s => s.isVerified);
            const pendingSkills = (member.skills || []).filter(s => !s.isVerified);

            return (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Header Profile */}
                  <div className="flex items-start gap-3">
                    <img
                      src={formatDriveImageUrl(member.avatarUrl) || member.avatarUrl || getValidAvatarUrl('', member.gender)}
                      alt={member.fullName}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-purple-600 shadow-xs flex-shrink-0 bg-slate-900"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        const direct = getDriveDirectFallbackUrl(member.avatarUrl);
                        if (direct && img.src !== direct) img.src = direct;
                        else img.src = getValidAvatarUrl('', member.gender);
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-900 truncate font-heading">
                        {member.fullName}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-purple-900 font-mono font-bold">
                        <CheckCircle2 className="w-3 h-3 text-purple-600" />
                        <span>{member.nationalMemberNumber || 'Dalam Proses Verifikasi'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{member.regencyName}, {member.provinceName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio or Position */}
                  <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-purple-900">{member.krida || 'Krida Pemandu'}</span> • {member.bio || 'Kader aktif Saka Pariwisata berdaya saing tinggi.'}
                  </div>

                  {/* Skills Badges (Verified) */}
                  {verifiedSkills.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Keahlian Disetujui ({verifiedSkills.length}):</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {verifiedSkills.map((sk) => (
                          <span
                            key={sk.id}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-[10px] font-semibold flex items-center gap-1"
                            title={`${sk.skillName} • ${sk.proficiency} • ${sk.yearsOfExperience || 1} Tahun Pengalaman`}
                          >
                            <Award className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{sk.skillName}</span>
                            <span className="text-[9px] text-emerald-600 font-bold">({sk.proficiency})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pending Skills Badges */}
                  {pendingSkills.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Menunggu Persetujuan ({pendingSkills.length}):</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {pendingSkills.map((sk) => (
                          <span
                            key={sk.id}
                            className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-semibold flex items-center gap-1"
                            title="Keahlian ini sedang menunggu verifikasi/persetujuan dari Kwartir"
                          >
                            <span>{sk.skillName}</span>
                            <span className="text-[9px] text-amber-700 font-bold">({sk.proficiency})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenManageSkills(member)}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Input, edit, atau setujui keahlian anggota ini"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-700" />
                    <span>{isAdminOrOperator ? 'Kelola Keahlian' : 'Keahlian'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenVerifyModal(member)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Profil & KTA</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
