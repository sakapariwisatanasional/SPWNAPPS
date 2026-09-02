import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  ArrowRightLeft, 
  Eye, 
  Download, 
  Printer, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Award,
  Sparkles,
  CreditCard,
  Sliders,
  Camera,
  FileDown,
  Edit3,
  Share2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Member, CurrentUser, Province, Regency } from '../types';
import { DigitalMemberCard } from '../components/member/DigitalMemberCard';
import { formatDriveImageUrl, getDriveDirectFallbackUrl, getValidAvatarUrl } from '../components/common/SakaLogo';

interface MemberManagementViewProps {
  currentUser: CurrentUser;
  members: Member[];
  provinces: Province[];
  onOpenRegisterModal: () => void;
  onOpenVerifyModal: (member: Member) => void;
  onOpenTransferModal: (member: Member) => void;
  onApproveMember: (memberId: string) => void;
  onRejectMember: (memberId: string) => void;
  onOpenEditCardModal?: () => void;
  onOpenEditPhotoModal?: (member: Member) => void;
  onOpenEditMemberModal?: (member: Member) => void;
  onOpenPrintPdfModal?: (member: Member) => void;
  onOpenQuickShareModal?: (member: Member) => void;
  onOpenOperatorModal?: (member: Member) => void;
  onDeleteMember?: (member: Member) => void;
  onDeleteAllDummyMembers?: () => void;
}

export const MemberManagementView: React.FC<MemberManagementViewProps> = ({
  currentUser,
  members,
  provinces,
  onOpenRegisterModal,
  onOpenVerifyModal,
  onOpenTransferModal,
  onApproveMember,
  onRejectMember,
  onOpenEditCardModal,
  onOpenEditPhotoModal,
  onOpenEditMemberModal,
  onOpenPrintPdfModal,
  onOpenQuickShareModal,
  onOpenOperatorModal,
  onDeleteMember,
  onDeleteAllDummyMembers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('ALL');
  const [selectedKrida, setSelectedKrida] = useState<string>('ALL');
  const [previewCardMember, setPreviewCardMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // Filter logic
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Role-based scoping
      if (currentUser.role === 'ADMIN_PROVINCE' && currentUser.jurisdictionId && m.provinceId !== currentUser.jurisdictionId) {
        return false;
      }
      if (currentUser.role === 'ADMIN_REGENCY' && currentUser.jurisdictionId && m.regencyId !== currentUser.jurisdictionId) {
        return false;
      }
      if (currentUser.role === 'ADMIN_BRANCH' && currentUser.jurisdictionId && m.branchId !== currentUser.jurisdictionId) {
        return false;
      }

      // Search Query
      const q = (searchQuery || '').toLowerCase();
      const matchSearch = 
        (m.fullName || '').toLowerCase().includes(q) ||
        (m.nationalMemberNumber && m.nationalMemberNumber.toLowerCase().includes(q)) ||
        (m.gugusDepan || '').toLowerCase().includes(q) ||
        (m.branchName || '').toLowerCase().includes(q) ||
        (m.regencyName || '').toLowerCase().includes(q) ||
        (m.provinceName || '').toLowerCase().includes(q) ||
        (m.operatorJurisdictionName && m.operatorJurisdictionName.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Status & Operator Filter
      if (selectedStatus === 'OPERATOR_ONLY') {
        if (!m.isOperator) return false;
      } else if (selectedStatus === 'NON_OPERATOR') {
        if (m.isOperator) return false;
      } else if (selectedStatus !== 'ALL' && m.status !== selectedStatus) {
        return false;
      }

      // Province
      if (selectedProvinceId !== 'ALL' && m.provinceId !== selectedProvinceId) return false;

      // Krida
      if (selectedKrida !== 'ALL' && m.krida !== selectedKrida) return false;

      return true;
    });
  }, [members, searchQuery, selectedStatus, selectedProvinceId, selectedKrida, currentUser]);

  const handleExportCSV = () => {
    const headers = ['Nomor Anggota', 'Nama Lengkap', 'Provinsi', 'Kabupaten/Kota', 'Ranting', 'Gudep', 'Krida', 'Status', 'Terdaftar'];
    const rows = filteredMembers.map(m => [
      m.nationalMemberNumber || '-',
      `"${m.fullName}"`,
      `"${m.provinceName}"`,
      `"${m.regencyName}"`,
      `"${m.branchName}"`,
      `"${m.gugusDepan}"`,
      `"${m.krida || '-'}"`,
      m.status,
      new Date(m.registeredAt).toLocaleDateString('id-ID')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Anggota_Saka_Pariwisata_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kridaOptions = [
    'Krida Pemandu',
    'Krida Penyuluh',
    'Krida Mice & Event',
    'Krida Kuliner & Cinderamata'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">
            Manajemen Keanggotaan Terpadu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pendataan, verifikasi berjenjang, dan penerbitan Nomor Anggota Nasional (PP.KK.KC.NNNNNN)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenEditCardModal && (
            <button
              onClick={onOpenEditCardModal}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-700" />
              <span>Edit Desain KTA</span>
            </button>
          )}

          {/* Tombol Hapus Dummy untuk Super Admin */}
          {currentUser.role === 'SUPER_ADMIN' && onDeleteAllDummyMembers && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Hapus / Bersihkan semua data dummy dari aplikasi"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Hapus Dummy</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Box */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, No KTA, gudep..."
              className="bg-transparent outline-none w-full text-slate-800"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium text-slate-700"
            >
              <option value="ALL">Semua Status (Aktif, Pending, Operator)</option>
              <option value="OPERATOR_ONLY">⭐ Hanya Operator Kwartir</option>
              <option value="NON_OPERATOR">Anggota Reguler (Bukan Operator)</option>
              <option value="ACTIVE">Status: AKTIF (KTA Terbit)</option>
              <option value="PENDING">Status: PENDING (Perlu Verifikasi)</option>
              <option value="SUSPENDED">Status: SUSPENDED / Non-aktif</option>
            </select>
          </div>

          {/* Province Filter */}
          <div>
            <select
              value={selectedProvinceId}
              onChange={(e) => setSelectedProvinceId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium text-slate-700"
            >
              <option value="ALL">Semua Wilayah (Kwarnas / Kwarda)</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Krida Filter */}
          <div>
            <select
              value={selectedKrida}
              onChange={(e) => setSelectedKrida(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium text-slate-700"
            >
              <option value="ALL">Semua Krida Saka</option>
              {kridaOptions.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary Tags */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>Menampilkan <strong className="text-slate-900">{filteredMembers.length}</strong> dari total <strong className="text-slate-900">{members.length}</strong> anggota terdaftar.</span>
          {(searchQuery || selectedStatus !== 'ALL' || selectedProvinceId !== 'ALL' || selectedKrida !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('ALL');
                setSelectedProvinceId('ALL');
                setSelectedKrida('ALL');
              }}
              className="text-emerald-700 font-bold hover:underline"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Members Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Identitas Anggota</th>
                <th className="py-3.5 px-4">No. Anggota Nasional</th>
                <th className="py-3.5 px-4">Wilayah & Kwartir</th>
                <th className="py-3.5 px-4">Krida & Gudep</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi & Administrasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ada data anggota yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Member Identity */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative group/avatar flex-shrink-0">
                          <img
                            src={formatDriveImageUrl(m.avatarUrl) || m.avatarUrl || getValidAvatarUrl(m.avatarUrl, m.gender)}
                            alt={m.fullName}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs bg-slate-800"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              const directFallback = getDriveDirectFallbackUrl(m.avatarUrl);
                              if (directFallback && img.src !== directFallback) {
                                img.src = directFallback;
                              } else {
                                img.src = getValidAvatarUrl('', m.gender);
                              }
                            }}
                          />
                          {onOpenEditPhotoModal && (
                            <button
                              type="button"
                              onClick={() => onOpenEditPhotoModal(m)}
                              className="absolute inset-0 bg-purple-950/80 opacity-0 group-hover/avatar:opacity-100 rounded-xl flex items-center justify-center text-white transition-opacity cursor-pointer shadow-xs"
                              title="Perbaiki Pas Foto Resmi KTA"
                            >
                              <Camera className="w-4 h-4 text-purple-200" />
                            </button>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-slate-900 truncate text-xs font-heading">{m.fullName}</p>
                            {m.isOperator && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-300 font-extrabold text-[9px] shadow-xs">
                                <ShieldCheck className="w-3 h-3 text-purple-700" />
                                <span>{m.operatorRole === 'ADMIN_REGENCY' ? 'Kwarcab' : m.operatorRole === 'ADMIN_PROVINCE' ? 'Kwarda' : 'Kwarran'}</span>
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{m.email}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{m.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* National Member Number */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {m.nationalMemberNumber ? (
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg font-mono font-bold text-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{m.nationalMemberNumber}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Belum Diterbitkan
                        </span>
                      )}
                    </td>

                    {/* Territory */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 truncate max-w-[160px]">{m.regencyName}</p>
                      <p className="text-[10px] text-emerald-700 font-medium truncate">{m.branchName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{m.provinceName}</p>
                    </td>

                    {/* Krida & Gudep */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800 truncate">{m.krida || 'Pramuka Saka'}</p>
                      <p className="text-[10px] text-slate-500 truncate">{m.gugusDepan}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {m.status === 'ACTIVE' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          AKTIF
                        </span>
                      ) : m.status === 'PENDING' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                          MENUNGGU
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          NONAKTIF
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview Digital KTA */}
                        <button
                          onClick={() => setPreviewCardMember(m)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Lihat KTA Digital"
                        >
                          <CreditCard className="w-4 h-4 text-emerald-700" />
                        </button>

                        {/* Cetak / Unduh PDF KTA */}
                        {onOpenPrintPdfModal && (
                          <button
                            onClick={() => onOpenPrintPdfModal(m)}
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg transition-colors border border-purple-200/60"
                            title="Cetak / Konversi KTA ke PDF (CR80 / A4)"
                          >
                            <FileDown className="w-4 h-4 text-purple-700" />
                          </button>
                        )}

                        {/* Quick Share / Badge Networking Event */}
                        {onOpenQuickShareModal && (
                          <button
                            onClick={() => onOpenQuickShareModal(m)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg transition-colors border border-amber-300/80 cursor-pointer"
                            title="Quick Share: Badge Event & QR Portofolio Instan"
                          >
                            <Share2 className="w-4 h-4 text-amber-700" />
                          </button>
                        )}

                        {/* Perbaiki Pas Foto KTA */}
                        {onOpenEditPhotoModal && (
                          <button
                            onClick={() => onOpenEditPhotoModal(m)}
                            className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 rounded-lg transition-colors cursor-pointer"
                            title="Perbaiki Pas Foto Resmi KTA & Profil"
                          >
                            <Camera className="w-4 h-4 text-slate-700" />
                          </button>
                        )}

                        {/* Koreksi Profil, Nama, Gelar, & Domisili (Hak Admin) */}
                        {onOpenEditMemberModal && (
                          <button
                            onClick={() => onOpenEditMemberModal(m)}
                            className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 rounded-lg transition-colors border border-indigo-200/60 cursor-pointer"
                            title="Koreksi Nama, Gelar, Profil & Domisili (Hak Admin)"
                          >
                            <Edit3 className="w-4 h-4 text-indigo-700" />
                          </button>
                        )}

                        {/* Kelola / Tetapkan / Batalkan Operator (Hak Khusus Super Admin) */}
                        {currentUser.role === 'SUPER_ADMIN' && onOpenOperatorModal && (
                          <button
                            type="button"
                            onClick={() => onOpenOperatorModal(m)}
                            className={`p-1.5 rounded-lg transition-colors border cursor-pointer ${
                              m.isOperator
                                ? 'bg-purple-100 hover:bg-purple-200 text-purple-900 border-purple-300 shadow-xs'
                                : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-800 border-slate-200/80'
                            }`}
                            title={
                              m.isOperator
                                ? `Kelola / Batalkan Wewenang Operator (${m.operatorJurisdictionName || m.regencyName})`
                                : `Tetapkan ${m.fullName} sebagai Operator Kwartir`
                            }
                          >
                            {m.isOperator ? (
                              <ShieldCheck className="w-4 h-4 text-purple-700" />
                            ) : (
                              <Shield className="w-4 h-4 text-slate-600 hover:text-purple-700" />
                            )}
                          </button>
                        )}

                        {/* Public Verifier Modal */}
                        <button
                          onClick={() => onOpenVerifyModal(m)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Verifikasi QR Publik"
                        >
                          <Eye className="w-4 h-4 text-slate-700" />
                        </button>

                        {/* Mutasi / Transfer Lokasi */}
                        <button
                          onClick={() => onOpenTransferModal(m)}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 rounded-lg transition-colors"
                          title="Mutasi / Pindah Wilayah Kwartir"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>

                        {/* Hapus Anggota (Hak Super Admin) */}
                        {currentUser.role === 'SUPER_ADMIN' && onDeleteMember && (
                          <button
                            onClick={() => setMemberToDelete(m)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 rounded-lg transition-colors border border-red-200 cursor-pointer"
                            title="Hapus Data Anggota Ini (Super Admin)"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        )}

                        {/* Approve Button for Pending */}
                        {m.status === 'PENDING' && (
                          <button
                            onClick={() => onApproveMember(m.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                            title="Setujui dan terbitkan Nomor Anggota"
                          >
                            Setujui
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digital KTA Preview Modal */}
      {previewCardMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-heading">
                  Kartu Tanda Anggota (KTA) Digital
                </h3>
                <p className="text-xs text-slate-500">{previewCardMember.fullName}</p>
              </div>
              <button
                onClick={() => setPreviewCardMember(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <DigitalMemberCard
              member={previewCardMember}
              onVerifyClick={onOpenVerifyModal}
              onEditCard={onOpenEditCardModal}
              onEditPhoto={onOpenEditPhotoModal ? (m) => onOpenEditPhotoModal(m) : undefined}
              onEditMemberProfile={onOpenEditMemberModal ? (m) => {
                setPreviewCardMember(null);
                onOpenEditMemberModal(m);
              } : undefined}
              onPrintPdf={onOpenPrintPdfModal ? (m) => onOpenPrintPdfModal(m) : undefined}
              showControls={true}
              allowAdminEdit={true}
            />

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewCardMember(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus 1 Anggota (Super Admin) */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-red-200 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-heading">
                  Konfirmasi Hapus Anggota
                </h3>
                <p className="text-xs text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={formatDriveImageUrl(memberToDelete.avatarUrl) || memberToDelete.avatarUrl || getValidAvatarUrl(memberToDelete.avatarUrl, memberToDelete.gender)}
                  alt={memberToDelete.fullName}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-300 bg-slate-800"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const directFallback = getDriveDirectFallbackUrl(memberToDelete.avatarUrl);
                    if (directFallback && img.src !== directFallback) {
                      img.src = directFallback;
                    } else {
                      img.src = getValidAvatarUrl('', memberToDelete.gender);
                    }
                  }}
                />
                <div>
                  <p className="font-bold text-slate-900 text-sm">{memberToDelete.fullName}</p>
                  <p className="text-[11px] text-purple-700 font-mono font-semibold">
                    {memberToDelete.nationalMemberNumber || 'Belum ada NTA'}
                  </p>
                  <p className="text-slate-500">{memberToDelete.branchName}, {memberToDelete.regencyName}</p>
                </div>
              </div>
              <p className="text-slate-600 pt-1 border-t border-slate-200 text-[11px]">
                Data keanggotaan, KTA Digital, serta riwayat akan dihapus secara permanen dari database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteMember) {
                    onDeleteMember(memberToDelete);
                  }
                  setMemberToDelete(null);
                }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Anggota Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Bersihkan Semua Data Dummy */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 shadow-2xl border border-red-200 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-heading">
                  Bersihkan Seluruh Anggota Dummy?
                </h3>
                <p className="text-xs text-red-600 font-medium">Pengaturan Basis Data Bersih</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda akan mengosongkan seluruh data anggota contoh/dummy dari database aplikasi untuk memulai pendataan resmi yang baru atau menyinkronkan dari Google Spreadsheet.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteAllDummyMembers) {
                    onDeleteAllDummyMembers();
                  }
                  setShowClearAllModal(false);
                }}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Seluruh Dummy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
