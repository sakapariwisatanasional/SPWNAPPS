import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldOff, 
  UserCheck, 
  UserX, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Clock, 
  Info,
  Sparkles,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Member, CurrentUser, UserRole, Province, Regency } from '../../types';
import { storage } from '../../services/storage';

interface OperatorRoleModalProps {
  member: Member | null;
  currentUser: CurrentUser;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OperatorRoleModal: React.FC<OperatorRoleModalProps> = ({
  member,
  currentUser,
  isOpen,
  onClose,
  onSuccess
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const provinces = storage.getProvinces();
  const allRegencies = storage.getRegencies();

  // Form State
  const [selectedRole, setSelectedRole] = useState<UserRole>(
    member?.operatorRole || 'ADMIN_REGENCY'
  );
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(
    member?.provinceId || '32'
  );
  const [selectedRegencyId, setSelectedRegencyId] = useState<string>(
    member?.operatorJurisdictionId || member?.regencyId || '32.06'
  );
  const [assignmentNotes, setAssignmentNotes] = useState<string>(
    member?.operatorNotes || `Surat Keputusan Penugasan Operator Kwartir No. SK-${member?.regencyId ? member.regencyId.replace('.', '') : '3206'}-${new Date().getFullYear()}/01`
  );
  const [revokeReason, setRevokeReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'assign' | 'revoke'>('assign');

  // Synchronize when member or isOpen changes
  useEffect(() => {
    if (member && isOpen) {
      setSelectedRole(member.operatorRole || 'ADMIN_REGENCY');
      setSelectedProvinceId(member.provinceId || '32');
      setSelectedRegencyId(member.operatorJurisdictionId || member.regencyId || '32.06');
      setAssignmentNotes(
        member.operatorNotes || `Surat Tugas Operator Kwarcab No. ST-${member.regencyId ? member.regencyId.replace('.', '') : '3206'}/${new Date().getFullYear()}/042`
      );
      setRevokeReason('');
      setActiveTab('assign');
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const regenciesForProvince = storage.getRegencies(selectedProvinceId);

  const handleAssignOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Hanya Super Admin Kwartir Nasional yang berwenang menetapkan operator.');
      return;
    }

    setIsSubmitting(true);
    try {
      let jurisdictionId = selectedRegencyId;
      let jurisdictionName = '';

      if (selectedRole === 'ADMIN_PROVINCE') {
        jurisdictionId = selectedProvinceId;
        const prov = provinces.find(p => p.id === selectedProvinceId);
        jurisdictionName = prov ? `Kwarda ${prov.name}` : `Kwarda ID ${selectedProvinceId}`;
      } else if (selectedRole === 'ADMIN_REGENCY') {
        jurisdictionId = selectedRegencyId;
        const reg = allRegencies.find(r => r.id === selectedRegencyId);
        jurisdictionName = reg ? `Kwarcab ${reg.name}` : `Kwarcab ID ${selectedRegencyId}`;
      } else if (selectedRole === 'ADMIN_BRANCH') {
        jurisdictionId = member.branchId;
        jurisdictionName = `Kwarran ${member.branchName}`;
      } else {
        jurisdictionId = selectedRegencyId;
        jurisdictionName = `Kwarcab ${member.regencyName}`;
      }

      storage.assignMemberAsOperator(
        member.id,
        selectedRole,
        jurisdictionId,
        jurisdictionName,
        assignmentNotes,
        currentUser
      );

      alert(`Sukses! ${member.fullName} telah resmi ditetapkan sebagai Operator (${jurisdictionName}). Akun ini sekarang memiliki wewenang pengelolaan di wilayah tersebut.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menetapkan operator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Hanya Super Admin Kwartir Nasional yang berwenang membatalkan wewenang operator.');
      return;
    }

    const confirmRevoke = window.confirm(
      `PERHATIAN: Anda yakin ingin MEMBATALKAN wewenang Operator dari ${member.fullName}?\n\nAnggota ini tidak lagi dapat menginput atau mengedit data anggota di kwartirnya.`
    );
    if (!confirmRevoke) return;

    setIsSubmitting(true);
    try {
      storage.revokeMemberOperator(
        member.id,
        currentUser,
        revokeReason || 'Pembatalan wewenang operator oleh Super Admin'
      );

      alert(`Sukses! Hak operator ${member.fullName} telah dicabut. Status akun dikembalikan sebagai Anggota Reguler.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat membatalkan wewenang operator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs ${
              member.isOperator 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              {member.isOperator ? (
                <ShieldCheck className="w-6 h-6 text-purple-700" />
              ) : (
                <Shield className="w-6 h-6 text-emerald-700" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 font-heading">
                  Pengelolaan Wewenang Operator
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Hak Khusus Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tetapkan atau batalkan wewenang anggota sebagai Operator Kwartir (Kwarcab / Kwarda)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Member Profile Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              className="w-13 h-13 rounded-2xl object-cover border-2 border-white shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-sm text-slate-900 font-heading">{member.fullName}</h4>
                {member.isOperator && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-300 rounded-md font-extrabold text-[10px] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-700" />
                    OPERATOR RESMI
                  </span>
                )}
              </div>
              <p className="text-xs font-mono font-bold text-emerald-800 mt-0.5">
                NTA: {member.nationalMemberNumber || 'Belum Terbit'}
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{member.regencyName} • {member.branchName}</span>
              </p>
            </div>
          </div>

          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-right w-full sm:w-auto">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Hak Akses</p>
            <p className={`text-xs font-extrabold ${member.isOperator ? 'text-purple-700' : 'text-slate-700'}`}>
              {member.isOperator 
                ? (member.operatorRole === 'ADMIN_REGENCY' ? 'Operator Kwarcab' :
                   member.operatorRole === 'ADMIN_PROVINCE' ? 'Operator Kwarda' : 'Operator Kwarran')
                : 'Anggota Reguler'}
            </p>
          </div>
        </div>

        {/* Current Operator Status Information */}
        {member.isOperator ? (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-purple-950 font-bold">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>Anggota Sedang Aktif Memegang Wewenang Operator</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-purple-900 pt-1">
              <div>
                <span className="text-purple-700 font-medium">Wilayah Yurisdiksi:</span>{' '}
                <strong>{member.operatorJurisdictionName || member.regencyName}</strong>
              </div>
              <div>
                <span className="text-purple-700 font-medium">Ditetapkan Oleh:</span>{' '}
                <strong>{member.operatorAssignedBy || 'Super Admin'}</strong>
              </div>
              <div>
                <span className="text-purple-700 font-medium">Waktu Penetapan:</span>{' '}
                <strong>{member.operatorAssignedAt ? new Date(member.operatorAssignedAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}</strong>
              </div>
              <div>
                <span className="text-purple-700 font-medium">Nomor SK / Catatan:</span>{' '}
                <strong>{member.operatorNotes || '-'}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Anggota Belum Memiliki Wewenang Operator</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Dengan menetapkan anggota ini sebagai Operator, beliau dapat masuk dengan peran Operator dan memiliki wewenang mendaftarkan serta mengoreksi data anggota di Kwartir Cabangnya.
              </p>
            </div>
          </div>
        )}

        {/* Tab Selector if already operator (Tetapkan / Perbarui vs Batalkan) */}
        {member.isOperator && (
          <div className="flex border-b border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('assign')}
              className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'assign'
                  ? 'border-purple-600 text-purple-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Perbarui Wewenang Operator</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('revoke')}
              className={`pb-2.5 px-4 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'revoke'
                  ? 'border-red-600 text-red-700'
                  : 'border-transparent text-slate-500 hover:text-red-600'
              }`}
            >
              <ShieldOff className="w-4 h-4" />
              <span>Batalkan / Cabut Hak Operator</span>
            </button>
          </div>
        )}

        {/* TAB 1: FORM PENETAPAN / PERBARUI OPERATOR */}
        {(activeTab === 'assign' || !member.isOperator) && (
          <form onSubmit={handleAssignOperator} className="space-y-4 text-xs">
            <div className="space-y-3">
              {/* Tingkat Wewenang / Role Selection */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  1. Tingkat Wewenang Operator <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <label className={`p-3 rounded-2xl border flex flex-col gap-1 cursor-pointer transition-all ${
                    selectedRole === 'ADMIN_REGENCY' 
                      ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 text-purple-950' 
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">Kwarcab (Cabang)</span>
                      <input
                        type="radio"
                        name="operatorRole"
                        value="ADMIN_REGENCY"
                        checked={selectedRole === 'ADMIN_REGENCY'}
                        onChange={() => setSelectedRole('ADMIN_REGENCY')}
                        className="accent-purple-600"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Operator Kabupaten / Kota (Wewenang kelola anggota 1 Kwarcab)
                    </p>
                  </label>

                  <label className={`p-3 rounded-2xl border flex flex-col gap-1 cursor-pointer transition-all ${
                    selectedRole === 'ADMIN_PROVINCE' 
                      ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 text-purple-950' 
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">Kwarda (Daerah)</span>
                      <input
                        type="radio"
                        name="operatorRole"
                        value="ADMIN_PROVINCE"
                        checked={selectedRole === 'ADMIN_PROVINCE'}
                        onChange={() => setSelectedRole('ADMIN_PROVINCE')}
                        className="accent-purple-600"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Operator Provinsi (Supervisi & data anggota 1 Kwarda)
                    </p>
                  </label>

                  <label className={`p-3 rounded-2xl border flex flex-col gap-1 cursor-pointer transition-all ${
                    selectedRole === 'ADMIN_BRANCH' 
                      ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 text-purple-950' 
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs">Kwarran (Ranting)</span>
                      <input
                        type="radio"
                        name="operatorRole"
                        value="ADMIN_BRANCH"
                        checked={selectedRole === 'ADMIN_BRANCH'}
                        onChange={() => setSelectedRole('ADMIN_BRANCH')}
                        className="accent-purple-600"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Operator Kecamatan / Pangkalan Saka Pariwisata
                    </p>
                  </label>
                </div>
              </div>

              {/* Wilayah Yurisdiksi Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Kwartir Daerah (Provinsi) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedProvinceId}
                    onChange={(e) => {
                      const newP = e.target.value;
                      setSelectedProvinceId(newP);
                      const regs = storage.getRegencies(newP);
                      if (regs.length > 0) setSelectedRegencyId(regs[0].id);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium text-slate-800 focus:border-purple-500 focus:bg-white"
                  >
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                    ))}
                  </select>
                </div>

                {selectedRole !== 'ADMIN_PROVINCE' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Kwartir Cabang (Kab/Kota Target) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedRegencyId}
                      onChange={(e) => setSelectedRegencyId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium text-slate-800 focus:border-purple-500 focus:bg-white"
                    >
                      {regenciesForProvince.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Surat Keputusan / Catatan Penugasan */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nomor SK / Surat Tugas Penugasan Resmi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="Contoh: SK-KWARNAS/08/2026/041 atau Surat Tugas Kwarcab"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 outline-none font-medium text-slate-800 focus:border-purple-500 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Nomor SK ini akan tercatat dalam log audit resmi dan diteruskan ke riwayat notifikasi anggota.
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-purple-950/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{member.isOperator ? 'Simpan Perubahan Operator' : 'Tetapkan Sebagai Operator'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: PEMBATALAN / PENCABUTAN WEWENANG OPERATOR */}
        {member.isOperator && activeTab === 'revoke' && (
          <form onSubmit={handleRevokeOperator} className="space-y-4 text-xs">
            <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 text-red-950 space-y-2">
              <div className="flex items-center gap-2 font-extrabold text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>Konfirmasi Pembatalan Wewenang Operator</span>
              </div>
              <p className="text-[11px] text-red-900 leading-relaxed">
                Tindakan ini akan <strong>mencabut seluruh hak wewenang operator</strong> dari <strong>{member.fullName}</strong>. Akun ini tidak lagi dapat menginput pendaftaran anggota baru atau mengedit data anggota di <strong>{member.operatorJurisdictionName || member.regencyName}</strong>. Status akun akan dikembalikan sebagai Anggota Biasa (Reguler).
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Alasan Pembatalan / Pencabutan Wewenang <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Contoh: Masa bakti kepengurusan telah selesai / Rotasi penugasan wilayah / Permintaan pengunduran diri"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none font-medium text-slate-800 focus:border-red-500 focus:bg-white resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-red-950/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <ShieldOff className="w-4 h-4" />
                <span>Batalkan Wewenang Operator Sekarang</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
