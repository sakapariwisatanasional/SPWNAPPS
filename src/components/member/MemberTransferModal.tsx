import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Member, Province, Regency, District, Branch, CurrentUser } from '../../types';
import { storage } from '../../services/storage';

interface MemberTransferModalProps {
  member: Member | null;
  currentUser: CurrentUser;
  onClose: () => void;
  onSuccess: () => void;
}

export const MemberTransferModal: React.FC<MemberTransferModalProps> = ({
  member,
  currentUser,
  onClose,
  onSuccess
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [targetProvinceId, setTargetProvinceId] = useState('32');
  const [targetRegencyId, setTargetRegencyId] = useState('32.01');
  const [targetDistrictId, setTargetDistrictId] = useState('32.01.24');
  const [targetBranchId, setTargetBranchId] = useState('branch-32-01-24');
  const [reason, setReason] = useState('');

  useEffect(() => {
    setProvinces(storage.getProvinces());
  }, []);

  useEffect(() => {
    if (targetProvinceId) {
      const regs = storage.getRegencies(targetProvinceId);
      setRegencies(regs);
      if (regs.length > 0) setTargetRegencyId(regs[0].id);
    }
  }, [targetProvinceId]);

  useEffect(() => {
    if (targetRegencyId) {
      const dists = storage.getDistricts(targetRegencyId);
      setDistricts(dists);
      if (dists.length > 0) setTargetDistrictId(dists[0].id);
    }
  }, [targetRegencyId]);

  useEffect(() => {
    if (targetDistrictId) {
      const brs = storage.getBranches(targetDistrictId);
      setBranches(brs);
      if (brs.length > 0) setTargetBranchId(brs[0].id);
      else setTargetBranchId('');
    }
  }, [targetDistrictId]);

  if (!member) return null;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Harap tuliskan alasan perpindahan wilayah / mutasi keanggotaan.');
      return;
    }

    const p = provinces.find(x => x.id === targetProvinceId);
    const r = regencies.find(x => x.id === targetRegencyId);
    const d = districts.find(x => x.id === targetDistrictId);
    const b = branches.find(x => x.id === targetBranchId) || {
      id: `branch-auto-${Date.now()}`,
      name: `Kwarran ${d?.name || 'Wilayah Baru'}`,
      code: '01',
      districtId: targetDistrictId,
      regencyId: targetRegencyId,
      provinceId: targetProvinceId,
      address: 'Wilayah Kwartir',
      contactPerson: 'Pengurus Kwarran',
      phone: '-'
    };

    if (p && r && d) {
      storage.transferMemberLocation(
        member.id,
        b,
        d,
        r,
        p,
        reason,
        `${currentUser.name} (${currentUser.role})`
      );
      alert(`Perpindahan wilayah untuk ${member.fullName} berhasil dicatat ke dalam audit trail & histori mutasi.`);
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-heading">Mutasi & Perpindahan Wilayah Anggota</h3>
              <p className="text-xs text-slate-300">Riwayat Mutasi & Pembaruan Nomor Anggota</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleTransfer} className="p-6 space-y-4 text-xs overflow-y-auto custom-scrollbar">
          {/* Member Summary */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-slate-400 font-bold uppercase text-[10px]">Anggota Yang Dimutasi</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">{member.fullName}</p>
            <p className="font-mono text-emerald-700 font-bold">{member.nationalMemberNumber}</p>
            <p className="text-slate-600 mt-1">
              <span className="font-medium">Lokasi Asal:</span> {member.branchName}, {member.regencyName}, {member.provinceName}
            </p>
          </div>

          {/* New Location Selectors */}
          <div className="space-y-3 pt-2">
            <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Pilih Kwartir & Wilayah Baru</span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provinsi Baru *</label>
                <select
                  value={targetProvinceId}
                  onChange={(e) => setTargetProvinceId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                >
                  {provinces.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kab/Kota Baru *</label>
                <select
                  value={targetRegencyId}
                  onChange={(e) => setTargetRegencyId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                >
                  {regencies.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kecamatan Baru *</label>
                <select
                  value={targetDistrictId}
                  onChange={(e) => setTargetDistrictId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none"
                >
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pangkalan Ranting Baru *</label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold text-emerald-900"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alasan Perpindahan & Dasar Surat Tugas *</label>
              <textarea
                rows={2}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Pindah domisili kuliah/pekerjaan, serta penugasan koordinasi Saka Pariwisata."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-800"
              />
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
            <span className="font-bold">Ketentuan Mutasi:</span> UUID identitas anggota, portofolio skill, dan sertifikat tetap utuh. Sistem otomatis memperbarui kode wilayah Nomor Anggota Nasional dan mencatat riwayat ke tabel mutasi.
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors"
            >
              Proses Mutasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
