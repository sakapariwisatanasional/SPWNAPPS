import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, MapPin, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Member, Province, Regency, District, CurrentUser } from '../../types';
import { storage } from '../../services/storage';
import { spreadsheetService } from '../../services/spreadsheetService';

interface MemberTransferModalProps {
  isOpen: boolean;
  member: Member | null;
  currentUser: CurrentUser;
  onClose: () => void;
  onSuccess: () => void;
}

export const MemberTransferModal: React.FC<MemberTransferModalProps> = ({
  isOpen,
  member,
  currentUser,
  onClose,
  onSuccess
}) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [targetProvinceId, setTargetProvinceId] = useState('32');
  const [targetRegencyId, setTargetRegencyId] = useState('32.01');
  const [targetDistrictId, setTargetDistrictId] = useState('32.01.240');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const all = storage.getProvinces();
    setProvinces(all);
    setReason('');
    setIsSubmitting(false);
    if (member) {
      setTargetProvinceId(member.provinceId || '32');
      setTargetRegencyId(member.regencyId || '');
      setTargetDistrictId(member.districtId || '');
    }
  }, [isOpen, member?.id]);

  useEffect(() => {
    if (!targetProvinceId || targetProvinceId === '00') {
      setRegencies([]);
      setDistricts([]);
      setTargetRegencyId('');
      setTargetDistrictId('');
      return;
    }
    const regs = storage.getRegencies(targetProvinceId);
    setRegencies(regs);
    if (!regs.some(r => r.id === targetRegencyId)) {
      setTargetRegencyId(regs[0]?.id || '');
    }
  }, [targetProvinceId]);

  useEffect(() => {
    if (!targetRegencyId || targetProvinceId === '00') {
      setDistricts([]);
      setTargetDistrictId('');
      return;
    }
    const dists = storage.getDistricts(targetRegencyId);
    setDistricts(dists);
    if (!dists.some(d => d.id === targetDistrictId)) {
      setTargetDistrictId(dists[0]?.id || '');
    }
  }, [targetRegencyId, targetProvinceId]);



  if (!isOpen || !member) return null;

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || isSubmitting) return;

    if (!reason.trim()) {
      alert('Harap tuliskan alasan perpindahan wilayah / mutasi keanggotaan.');
      return;
    }

    const p = provinces.find(x => x.id === targetProvinceId);
    if (!p) {
      alert('Kwartir/Provinsi tujuan tidak valid.');
      return;
    }

    const isNationalTarget = targetProvinceId === '00';
    const r = isNationalTarget ? null : regencies.find(x => x.id === targetRegencyId);
    const d = isNationalTarget ? null : districts.find(x => x.id === targetDistrictId);

    if (!isNationalTarget && (!r || !d)) {
      alert('Kabupaten/Kota dan Kecamatan tujuan wajib dipilih.');
      return;
    }

    // Regional admin tidak boleh memindahkan anggota keluar dari yurisdiksinya.
    if (currentUser.role === 'ADMIN_PROVINCE' && currentUser.jurisdictionId && p.id !== currentUser.jurisdictionId) {
      alert('Akses ditolak: Admin Provinsi hanya dapat memindahkan anggota di dalam provinsinya.');
      return;
    }
    if (currentUser.role === 'ADMIN_REGENCY' && currentUser.jurisdictionId && (!r || r.id !== currentUser.jurisdictionId)) {
      alert('Akses ditolak: Admin Kabupaten/Kota hanya dapat memindahkan anggota di dalam Kwartir Cabangnya.');
      return;
    }
    if (currentUser.role === 'ADMIN_BRANCH' && currentUser.jurisdictionId && (!d || d.id !== currentUser.jurisdictionId)) {
      alert('Akses ditolak: Admin Ranting hanya dapat memindahkan anggota di dalam Kwartir Rantingnya.');
      return;
    }
    if (isNationalTarget && currentUser.role !== 'SUPER_ADMIN') {
      alert('Kwartir Nasional hanya dapat menjadi tujuan mutasi oleh Super Admin.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newRegencyId = isNationalTarget ? '' : String(r?.id || '');
      const newDistrictId = isNationalTarget ? '' : String(d?.id || '');
      const newRegencyName = isNationalTarget ? '' : String(r?.name || '');
      const newDistrictName = isNationalTarget ? '' : String(d?.name || '');
      const newNta = storage.generateNationalMemberNumber(
        p.code || p.id || '00',
        isNationalTarget ? '00' : (r?.code || r?.id || '00'),
        isNationalTarget ? '00' : (d?.code || d?.id || '00')
      );

      const history = {
        id: `history-${Date.now()}-${member.id}`,
        memberId: member.id,
        prevDistrictName: member.districtName || (member.provinceName === 'Kwartir Nasional' ? 'Kwartir Nasional' : ''),
        newDistrictName: newDistrictName || 'Kwartir Nasional',
        prevMemberNumber: member.nationalMemberNumber || '',
        newMemberNumber: newNta,
        transferDate: new Date().toISOString(),
        reason: reason.trim(),
        authorizedByName: `${currentUser.name} (${currentUser.role})`
      };

      const updated = await storage.adminUpdateMember(
        member.id,
        {
          provinceId: p.id,
          provinceName: p.name,
          regencyId: newRegencyId,
          regencyName: newRegencyName,
          districtId: newDistrictId,
          districtName: newDistrictName,
          nationalMemberNumber: newNta,
          kwartirLevel: isNationalTarget ? 'NASIONAL' : (newDistrictId ? 'RANTING' : 'CABANG'),
          kwartirName: isNationalTarget ? 'Kwartir Nasional' : (newDistrictName ? `Kwartir Ranting ${newDistrictName}` : `Kwartir Cabang ${newRegencyName}`),
          kwartirHierarchy: isNationalTarget ? 'Kwartir Nasional' : [
            p.name ? `Kwarda ${p.name}` : '',
            newRegencyName ? `Kwarcab ${newRegencyName}` : '',
            newDistrictName ? `Kwarran ${newDistrictName}` : ''
          ].filter(Boolean).join(' • '),
          locationHistory: [
            ...(member.locationHistory || []),
            history
          ]
        },
        currentUser,
        `MUTASI: ${member.provinceName || ''} / ${member.regencyName || ''} / ${member.districtName || ''} → ${p.name}${newRegencyName ? ` / ${newRegencyName}` : ''}${newDistrictName ? ` / ${newDistrictName}` : ''}. ${reason.trim()}`
      );

      if (!updated) throw new Error('Data anggota tidak ditemukan pada database aktif.');

      const syncResult = await spreadsheetService.saveMemberAndWaitForSync(updated);
      if (!syncResult.success || !syncResult.synced) {
        throw new Error(syncResult.message || 'Perubahan belum terverifikasi di Google Spreadsheet.');
      }

      alert(`Mutasi ${member.fullName} berhasil disimpan dan diverifikasi di Google Spreadsheet${syncResult.row ? ` (baris ${syncResult.row})` : ''}. Nomor anggota baru: ${newNta}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('[MemberTransferModal] Mutasi gagal:', error);
      alert(`Mutasi gagal disimpan: ${error?.message || 'Kesalahan tidak diketahui.'}`);
    } finally {
      setIsSubmitting(false);
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
              <span className="font-medium">Lokasi Asal:</span> {member.districtName}, {member.regencyName}, {member.provinceName}
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
                    <option key={p.id} value={p.id}>
                      {p.id === '00' ? 'Kwartir Nasional' : p.name}
                    </option>
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
                  {targetProvinceId === '00' && <option value="">Tidak berlaku untuk Kwartir Nasional</option>}
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
                  {targetProvinceId === '00' && <option value="">Tidak berlaku untuk Kwartir Nasional</option>}
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
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
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-wait text-white font-bold rounded-xl shadow-md transition-colors"
            >
              {isSubmitting ? 'Menyimpan Mutasi...' : 'Proses Mutasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
