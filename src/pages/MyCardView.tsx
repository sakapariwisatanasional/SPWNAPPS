import React, { useState } from 'react';
import { 
  CreditCard, 
  Download, 
  Printer, 
  FileDown,
  Eye, 
  MapPin, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  History, 
  Calendar, 
  Sliders, 
  Camera, 
  Edit3,
  Share2,
  QrCode,
  Copy,
  Check,
  Send,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Member, CurrentUser } from '../types';
import { DigitalMemberCard } from '../components/member/DigitalMemberCard';
import { QuickShareBadgeModal } from '../components/member/QuickShareBadgeModal';
import { getMemberVerificationUrl } from '../components/member/KtaQrCode';
import QRCode from 'qrcode';

interface MyCardViewProps {
  currentUser: CurrentUser;
  members: Member[];
  onOpenVerifyModal: (member: Member) => void;
  onOpenEditCardModal?: () => void;
  onOpenEditPhotoModal?: (member: Member) => void;
  onOpenEditMemberModal?: (member: Member) => void;
  onOpenPrintPdfModal?: (member: Member) => void;
  onOpenQuickShareModal?: (member: Member) => void;
}

export const MyCardView: React.FC<MyCardViewProps> = ({
  currentUser,
  members,
  onOpenVerifyModal,
  onOpenEditCardModal,
  onOpenEditPhotoModal,
  onOpenEditMemberModal,
  onOpenPrintPdfModal,
  onOpenQuickShareModal
}) => {
  const member = members.find(m => m.id === currentUser.memberId) || members[0];
  const isAdmin = currentUser.role !== 'MEMBER' && currentUser.role !== 'PUBLIC';
  
  const [isQuickShareOpen, setIsQuickShareOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNta, setCopiedNta] = useState(false);

  if (!member) {
    return (
      <div className="p-12 text-center text-slate-400">
        Data KTA anggota tidak ditemukan.
      </div>
    );
  }

  const nta = member.nationalMemberNumber || member.verificationToken || member.id;
  const verificationUrl = getMemberVerificationUrl(member);

  const handleOpenBadge = () => {
    if (onOpenQuickShareModal) {
      onOpenQuickShareModal(member);
    } else {
      setIsQuickShareOpen(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(verificationUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = verificationUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Copy link error:', err);
    }
  };

  const handleCopyNta = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(nta);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = nta;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedNta(true);
      setTimeout(() => setCopiedNta(false), 2000);
    } catch (err) {
      console.error('Copy NTA error:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const waText = encodeURIComponent(
      `Halo! Ini tanda pengenal & profil digital Saka Pariwisata saya:\n\n*${member.fullName}*\nNTA: ${nta}\nJabatan: ${member.currentPosition || 'Anggota'}\nWilayah: ${member.regencyName ? `Kwarcab ${member.regencyName}, ` : ''}${member.provinceName}\n\nLihat profil & verifikasi resmi di sini:\n${verificationUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
  };

  const handleDownloadQuickQr = async () => {
    try {
      const qrUrl = await QRCode.toDataURL(verificationUrl, {
        width: 800,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#1e0842',
          light: '#ffffff'
        }
      });

      const cleanNta = (member.nationalMemberNumber || member.id).replace(/[^a-zA-Z0-9]/g, '-');
      const link = document.createElement('a');
      link.download = `QR-NTA-SakaPariwisata-${cleanNta}.png`;
      link.href = qrUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Quick QR download error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-900 text-[11px] font-extrabold uppercase tracking-widest rounded-full">
              Kartu Tanda Anggota Elektronik
            </span>
            {isAdmin && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                Admin Mode
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            KTA Digital Saka Pariwisata
          </h2>
          <p className="text-xs text-slate-500">
            Tanda pengenal resmi tingkat nasional dengan konversi PDF standar cetak global ISO/IEC 7810 ID-1
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {/* Quick Share / Event Badge Button (Prominent) */}
          <button
            onClick={handleOpenBadge}
            className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-amber-500 via-purple-700 to-indigo-900 hover:from-amber-600 hover:to-indigo-950 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-950/20 transition-all inline-flex items-center gap-2 cursor-pointer group hover:scale-[1.02]"
            title="Buka badge event & QR Code jejaring instan"
          >
            <Share2 className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span>Quick Share & Badge Event</span>
            <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full">
              BARU
            </span>
          </button>

          {onOpenPrintPdfModal && (
            <button
              onClick={() => onOpenPrintPdfModal(member)}
              className="flex-shrink-0 px-4 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-2xl text-xs font-bold shadow-md shadow-purple-950/20 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-purple-300" />
              <span>Cetak / Unduh PDF KTA</span>
            </button>
          )}

          {isAdmin && onOpenEditMemberModal && (
            <button
              onClick={() => onOpenEditMemberModal(member)}
              className="flex-shrink-0 px-4 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-2xl text-xs font-bold shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
              title="Koreksi nama, gelar, data profil atau domisili kwartir"
            >
              <Edit3 className="w-4 h-4 text-indigo-300" />
              <span>Koreksi Profil & Domisili</span>
            </button>
          )}

          {onOpenEditPhotoModal && (
            <button
              onClick={() => onOpenEditPhotoModal(member)}
              className="flex-shrink-0 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
              title="Unggah berkas atau ganti link pas foto resmi KTA Anda"
            >
              <Camera className="w-4 h-4 text-purple-600" />
              <span>Ubah Foto KTA</span>
            </button>
          )}

          {isAdmin && onOpenEditCardModal && (
            <button
              onClick={onOpenEditCardModal}
              className="flex-shrink-0 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Edit Tampilan KTA</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 3D Card Display */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center space-y-6">
        <DigitalMemberCard
          member={member}
          onVerifyClick={onOpenVerifyModal}
          onEditCard={isAdmin ? onOpenEditCardModal : undefined}
          onEditPhoto={onOpenEditPhotoModal ? () => onOpenEditPhotoModal(member) : undefined}
          onEditMemberProfile={isAdmin && onOpenEditMemberModal ? () => onOpenEditMemberModal(member) : undefined}
          onPrintPdf={onOpenPrintPdfModal ? () => onOpenPrintPdfModal(member) : undefined}
          showControls={true}
          allowAdminEdit={isAdmin}
        />

        <div className="text-center text-xs text-slate-400 max-w-md">
          <p>Klik kartu di atas untuk membalik dan melihat ketentuan, barcode, serta pengesahan Kwartir Nasional.</p>
        </div>
      </div>

      {/* NEW FEATURE: Quick Share & Networking Event Badge Card */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-purple-800/40 shadow-xl relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 bg-amber-400/20 border border-amber-300/30 text-amber-300 text-[10px] font-extrabold tracking-wider uppercase rounded-full">
                Fitur Jejaring & Acara
              </span>
              <span className="text-purple-300 text-xs font-mono">
                NTA: {nta}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black font-heading text-white">
              Quick Share: Badge Pengenal & QR Portofolio Instan
            </h3>

            <p className="text-xs text-purple-200/80 leading-relaxed">
              Buat tanda pengenal berformat vertikal ID-Card (A6) atau kartu nama networking (A5) lengkap dengan NTA dan QR Code beresolusi tinggi. Sangat cocok untuk kegiatan <strong>Kemah Wisata, Jambore, Munas, Rakernas,</strong> atau pertukaran kontak antar pramuka se-Indonesia.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch gap-2.5 w-full md:w-auto flex-shrink-0">
            <button
              type="button"
              onClick={handleOpenBadge}
              className="px-4 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-heading"
            >
              <Share2 className="w-4 h-4 text-slate-950" />
              <span>Buka Generator Badge</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadQuickQr}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-purple-300" />
              <span>Unduh QR Cepat</span>
            </button>
          </div>
        </div>

        {/* Quick Copy & WhatsApp Bar */}
        <div className="mt-5 pt-4 border-t border-purple-800/40 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2.5 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/40 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-purple-200"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-300" />}
            <span className="font-medium">{copiedLink ? 'Tautan Profil Tersalin!' : 'Salin Tautan Profil'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyNta}
            className="p-2.5 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/40 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-purple-200"
          >
            {copiedNta ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-300" />}
            <span className="font-medium">{copiedNta ? 'NTA Tersalin!' : 'Salin NTA Nomor'}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="p-2.5 bg-emerald-900/40 hover:bg-emerald-900/70 border border-emerald-700/40 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-emerald-200"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Bagikan ke WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Profile & Credentials Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detail Kepramukaan */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Informasi Keanggotaan</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Nomor Anggota</span>
              <span className="font-mono font-bold text-emerald-800">{member.nationalMemberNumber}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Pangkalan Ranting</span>
              <span className="font-semibold text-slate-800">{member.branchName}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Kwartir Cabang</span>
              <span className="font-semibold text-slate-800">{member.regencyName}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Kwartir Daerah</span>
              <span className="font-semibold text-slate-800">{member.provinceName}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Gugus Depan</span>
              <span className="font-semibold text-slate-800">{member.gugusDepan}</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500">Krida Utama</span>
              <span className="font-bold text-emerald-700">{member.krida}</span>
            </div>
          </div>
        </div>

        {/* Keahlian & Riwayat */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 font-heading flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Keahlian & Sertifikasi Terdaftar</span>
          </h3>

          <div className="space-y-2">
            {member.skills && member.skills.length > 0 ? (
              member.skills.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{s.skillName}</p>
                    <p className="text-[10px] text-slate-400">{s.category}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                    {s.proficiency}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Belum ada keahlian terverifikasi.</p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onOpenVerifyModal(member)}
              className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Buka Tampilan Verifikasi Publik (QR)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Self-contained Quick Share Modal */}
      <QuickShareBadgeModal
        isOpen={isQuickShareOpen}
        member={member}
        onClose={() => setIsQuickShareOpen(false)}
        onOpenVerifyModal={onOpenVerifyModal}
      />
    </div>
  );
};
