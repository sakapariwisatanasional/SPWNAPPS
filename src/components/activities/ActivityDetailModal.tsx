import React, { useState } from 'react';
import { 
  X, 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock, 
  ShieldCheck, 
  Phone, 
  Share2, 
  CheckCircle2, 
  Ticket, 
  Info, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Sparkles,
  Tag,
  Building2,
  FileCheck
} from 'lucide-react';
import { Activity, CurrentUser, Member } from '../../types';
import { storage } from '../../services/storage';

interface ActivityDetailModalProps {
  activity: Activity | null;
  currentUser: CurrentUser;
  onClose: () => void;
  onRegisterSuccess?: () => void;
  onEditActivity?: (activity: Activity) => void;
  onDeleteActivity?: (activityId: string) => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  currentUser,
  onClose,
  onRegisterSuccess,
  onEditActivity,
  onDeleteActivity
}) => {
  const [copied, setCopied] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  if (!activity) return null;

  const isOperatorOrAdmin = [
    'SUPER_ADMIN', 
    'ADMIN_PROVINCE', 
    'ADMIN_REGENCY', 
    'ADMIN_BRANCH',
    'OPERATOR'
  ].includes(currentUser.role);

  // Clean phone number for WhatsApp
  const rawPhone = (activity.contactPhone || '081299881122').replace(/[^0-9]/g, '');
  const waPhone = rawPhone.startsWith('0') 
    ? '62' + rawPhone.slice(1) 
    : rawPhone.startsWith('62') 
      ? rawPhone 
      : '62' + rawPhone;

  const waMessage = encodeURIComponent(
    `Salam Pramuka Kak ${activity.contactPerson || 'Panitia'},\n\nSaya tertarik dengan agenda kegiatan Saka Pariwisata:\n📌 *${activity.title}*\n📍 Lokasi: ${activity.locationName} (${activity.provinceName})\n📅 Waktu: ${activity.startDate} s.d ${activity.endDate}\n\nMohon informasi teknis pendaftaran dan ketentuan lebih lanjut. Terima kasih!`
  );

  const waUrl = `https://wa.me/${waPhone}?text=${waMessage}`;

  const handleCopyLink = () => {
    const textToCopy = `${activity.title}\n📍 ${activity.locationName}, ${activity.provinceName}\n📅 ${activity.startDate} - ${activity.endDate}\n📞 Narahubung: ${activity.contactPerson} (${activity.contactPhone})\n\nInfo lengkap di Aplikasi Saka Pariwisata.`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRegister = () => {
    setIsRegistering(true);
    setTimeout(() => {
      // Find current user's member profile or create mock profile for registration
      const members = storage.getMembers();
      const currentMember = members.find(m => m.userId === currentUser.id) || members[0];
      
      if (currentMember) {
        storage.registerForActivity(activity.id, currentMember);
      }
      
      setIsRegistering(false);
      setRegistered(true);
      if (onRegisterSuccess) onRegisterSuccess();
    }, 600);
  };

  const capacityPct = Math.min(100, Math.round((activity.registeredCount / Math.max(1, activity.capacity)) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header Banner */}
        <div className="relative h-56 sm:h-72 bg-slate-900 overflow-hidden flex-shrink-0">
          <img 
            src={activity.bannerUrl || activity.coverImage} 
            alt={activity.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Floating Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-600/90 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-md border border-purple-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                <span>{activity.category}</span>
              </span>
              <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-slate-200 text-xs font-bold rounded-full border border-slate-700">
                Tingkat {activity.organizerLevel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopyLink}
                title="Salin Rincian Agenda"
                className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full backdrop-blur-md transition-colors border border-white/10"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={onClose}
                title="Tutup"
                className="p-2 bg-slate-900/80 hover:bg-slate-800 text-white rounded-full backdrop-blur-md transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{activity.organizerName}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight font-heading drop-shadow-md">
              {activity.title}
            </h2>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Uploader & Verification Badge */}
          <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-purple-950">Agenda Resmi Terverifikasi</span>
                  <span className="px-2 py-0.2 bg-purple-200 text-purple-800 text-[10px] font-bold rounded-full">
                    {activity.uploadedByRole === 'SUPER_ADMIN' ? 'Super Admin Kwarnas' : 'Operator Wilayah'}
                  </span>
                </div>
                <p className="text-xs text-purple-700 mt-0.5">
                  Diupload oleh: <strong className="text-purple-950">{activity.uploadedByName || activity.organizerName}</strong>
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                activity.feeType === 'GRATIS' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                  : activity.feeType === 'SUBSIDI'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                <Tag className="w-3 h-3" />
                <span>
                  {activity.feeType === 'GRATIS' 
                    ? 'Gratis / Free' 
                    : activity.feeAmount 
                      ? `Rp ${activity.feeAmount.toLocaleString('id-ID')} (${activity.feeType})` 
                      : activity.feeType}
                </span>
              </span>
            </div>
          </div>

          {/* Quick Schedule & Location Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Waktu Pelaksanaan */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CalendarDays className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span>Jadwal Pelaksanaan</span>
              </div>
              <p className="text-sm font-bold text-slate-900 font-heading">
                {new Date(activity.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' — '}
                {new Date(activity.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{activity.timeString}</span>
              </p>
            </div>

            {/* Lokasi & Wilayah */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Lokasi & Wilayah</span>
              </div>
              <p className="text-sm font-bold text-slate-900 font-heading truncate">
                {activity.locationName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {activity.locationAddress ? `${activity.locationAddress}, ` : ''}{activity.regencyName ? `${activity.regencyName}, ` : ''}{activity.provinceName}
              </p>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Users className="w-4 h-4 text-purple-600" />
                <span>Kapasitas Peserta:</span>
              </div>
              <span className="font-bold text-slate-900">
                {activity.registeredCount} / {activity.capacity} Peserta Terdaftar ({capacityPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  capacityPct >= 90 ? 'bg-rose-500' : capacityPct >= 70 ? 'bg-amber-500' : 'bg-purple-600'
                }`}
                style={{ width: `${capacityPct}%` }}
              />
            </div>
          </div>

          {/* Deskripsi Lengkap */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Deskripsi & Gambaran Kegiatan
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-white p-4 rounded-2xl border border-slate-100">
              {activity.description}
            </p>
          </div>

          {/* Persyaratan & Ketentuan */}
          {activity.requirements && activity.requirements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-purple-600" />
                <span>Ketentuan & Persyaratan Partisipasi</span>
              </h3>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2">
                {activity.requirements.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DISCLAIMER ETALASE NON-TRANSAKSI & HUBUNGI LANGSUNG */}
          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4.5 space-y-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
              <Info className="w-4 h-4 text-amber-700 flex-shrink-0" />
              <span>Etalase Informasi & Kontak Langsung (Non-Transaksi Finansial)</span>
            </div>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              Aplikasi Saka Pariwisata berfungsi sebagai katalog etalase informasi dan direktori kegiatan resmi. <strong>Tidak ada pemrosesan pembayaran atau transaksi komersial di dalam aplikasi</strong>. Untuk koordinasi, konfirmasi pendaftaran, atau sewa stan, silakan hubungi langsung narahubung resmi pengunggah.
            </p>
          </div>

          {/* Kartu Narahubung Pengunggah */}
          <div className="bg-gradient-to-r from-slate-900 to-purple-950 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="text-[11px] text-purple-300 font-semibold uppercase tracking-wider">
                Narahubung Resmi Kegiatan
              </div>
              <div className="text-base font-bold font-heading text-white">
                {activity.contactPerson || 'Panitia Pelaksana'}
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-2">
                <span>📱 {activity.contactPhone || '081299881122'}</span>
                {activity.contactEmail && <span>• ✉️ {activity.contactEmail}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Hubungi via WhatsApp</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                title="Salin Kontak"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {isOperatorOrAdmin && onEditActivity && (
              <button
                onClick={() => {
                  onClose();
                  onEditActivity(activity);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Edit Agenda
              </button>
            )}
            {isOperatorOrAdmin && onDeleteActivity && (
              <button
                onClick={() => {
                  if (confirm(`Apakah Anda yakin ingin menghapus agenda kegiatan "${activity.title}"?`)) {
                    onDeleteActivity(activity.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                Hapus
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Tutup
            </button>

            {registered ? (
              <button
                disabled
                className="px-6 py-2.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 cursor-default border border-emerald-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Terdaftar di Agenda Ini</span>
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={isRegistering}
                className="px-6 py-2.5 bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                {isRegistering ? (
                  <span>Mendaftarkan...</span>
                ) : (
                  <>
                    <Ticket className="w-4 h-4 text-purple-200" />
                    <span>Daftar Sebagai Peserta</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
