import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  FileDown, 
  Sliders, 
  Camera, 
  Edit3, 
  Share2, 
  QrCode, 
  Copy, 
  Check, 
  Send,
  UserCheck
} from 'lucide-react';
import { Member, CurrentUser, ProductKind } from '../types';
import { DigitalMemberCard } from '../components/member/DigitalMemberCard';
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
  onOpenCulinaryFormModal?: (kind?: ProductKind) => void;
}

export const MyCardView: React.FC<MyCardViewProps> = ({
  currentUser,
  members = [],
  onOpenVerifyModal,
  onOpenEditCardModal,
  onOpenEditPhotoModal,
  onOpenEditMemberModal,
  onOpenPrintPdfModal,
  onOpenQuickShareModal,
  onOpenCulinaryFormModal
}) => {
  // 1. Deteksi identitas anggota dari query parameter hasil scan Google Lens / kamera HP
  const targetMember = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const scannedId = (
        params.get('memberId') || 
        params.get('verifyId') || 
        params.get('nta') || 
        params.get('id') || 
        params.get('kta') || 
        ''
      ).trim().toLowerCase();

      if (scannedId && members.length > 0) {
        // Cari anggota yang cocok dengan ID atau Nomor NTA/KTA
        const matched = members.find(m => {
          const mId = String(m.id || '').trim().toLowerCase();
          const mNta = String(m.nationalMemberNumber || '').trim().toLowerCase();
          const mToken = String(m.verificationToken || '').trim().toLowerCase();
          return mId === scannedId || mNta === scannedId || mToken === scannedId;
        });

        if (matched) return matched;
      }
    }

    // 2. Jika tidak ada parameter scan, tampilkan profil user yang sedang login
    if (currentUser?.memberId) {
      const userMember = members.find(m => m.id === currentUser.memberId);
      if (userMember) return userMember;
    }

    // 3. Fallback jika user login memiliki nama yang sama
    if (currentUser?.fullName || currentUser?.name) {
      const curName = String(currentUser.fullName || currentUser.name).trim().toLowerCase();
      const userByName = members.find(m => String(m.fullName || '').trim().toLowerCase() === curName);
      if (userByName) return userByName;
    }

    // 4. Fallback terakhir: anggota pertama yang berstatus ACTIVE
    return members.find(m => m.status === 'ACTIVE') || members[0] || null;
  }, [members, currentUser]);

  const member = targetMember;
  const isOwner = Boolean(
    member && currentUser && (
      member.id === currentUser.memberId || 
      member.userId === currentUser.id ||
      (member.fullName && currentUser.name && member.fullName.toLowerCase() === currentUser.name.toLowerCase())
    )
  );
  // Untuk tindakan edit, wajib gunakan relasi memberId yang pasti.
  // Jangan gunakan fallback nama karena dua anggota dapat memiliki nama sama.
  const isStrictOwner = Boolean(
    member && currentUser?.memberId && member.id === currentUser.memberId
  );
  const isAdmin = currentUser?.role !== 'MEMBER' && currentUser?.role !== 'PUBLIC';

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedNta, setCopiedNta] = useState(false);

  if (!member) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-2">
        <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
        <p className="text-sm font-semibold">Data KTA Anggota Tidak Ditemukan</p>
        <p className="text-xs text-slate-500">Pastikan anggota sudah terdaftar dan tersinkronisasi di Google Spreadsheet.</p>
      </div>
    );
  }

  const nta = member.nationalMemberNumber || member.id;
  const profileUrl = getMemberVerificationUrl(member);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = profileUrl;
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
      `Profil KTA Resmi Saka Pariwisata:\n\n*${member.fullName}*\nNTA: ${nta}\nKrida: ${member.krida}\nWilayah: Kwarcab ${member.regencyName}, Kwarda ${member.provinceName}\n\nLihat KTA Digital lengkap:\n${profileUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
  };

  const handleDownloadQuickQr = async () => {
    try {
      const qrUrl = await QRCode.toDataURL(profileUrl, {
        width: 800,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: { dark: '#1e0842', light: '#ffffff' }
      });

      const cleanNta = String(nta).replace(/[^a-zA-Z0-9]/g, '-');
      const link = document.createElement('a');
      link.download = `QR-Profil-KTA-${cleanNta}.png`;
      link.href = qrUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download QR error:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-900 text-[11px] font-extrabold uppercase tracking-widest rounded-full">
              Profil Anggota & KTA Elektronik
            </span>
            {isOwner && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Akun Anda
              </span>
            )}
            {isAdmin && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md">
                Admin View
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            {member.fullName}
          </h2>
          <p className="text-xs text-slate-500">
            {member.krida} • Kwartir Cabang {member.regencyName}, Kwarda {member.provinceName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          {onOpenQuickShareModal && (
            <button
              onClick={() => onOpenQuickShareModal(member)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-purple-700 to-indigo-900 hover:from-amber-600 hover:to-indigo-950 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-amber-300" />
              <span>Bagikan Profil</span>
            </button>
          )}

          {onOpenPrintPdfModal && (
            <button
              onClick={() => onOpenPrintPdfModal(member)}
              className="px-4 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-purple-300" />
              <span>Cetak / Unduh PDF</span>
            </button>
          )}

          {(isStrictOwner || isAdmin) && onOpenEditMemberModal && (
            <button
              onClick={() => onOpenEditMemberModal(member)}
              className="px-4 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-indigo-300" />
              <span>{isStrictOwner && !isAdmin ? 'Edit Profil Saya' : 'Koreksi Data'}</span>
            </button>
          )}

          {(isOwner || isAdmin) && onOpenEditPhotoModal && (
            <button
              onClick={() => onOpenEditPhotoModal(member)}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-purple-600" />
              <span>Ubah Foto</span>
            </button>
          )}

          {isAdmin && onOpenEditCardModal && (
            <button
              onClick={onOpenEditCardModal}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Desain KTA</span>
            </button>
          )}

          {isStrictOwner && onOpenCulinaryFormModal && (
            <>
              <button
                type="button"
                onClick={() => onOpenCulinaryFormModal('KULINER')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>🍽️</span>
                <span>Ajukan Kuliner</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenCulinaryFormModal('CINDERAMATA')}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>🎁</span>
                <span>Ajukan Cinderamata</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Kartu 3D KTA Interaktif */}
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
          <p>Klik kartu di atas untuk membalik dan melihat barcode, data wilayah, serta pengesahan Kwartir Nasional.</p>
        </div>
      </div>

      {/* Detail Data Profil Anggota */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Informasi Keanggotaan Terdaftar</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            member.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}>
            {member.status === 'ACTIVE' ? '✓ Aktif Terdaftar' : 'Menunggu Validasi'}
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Nomor Tanda Anggota (NTA)</span>
            <p className="font-mono font-bold text-slate-800 text-sm">{nta}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Pilihan Krida Utama</span>
            <p className="font-bold text-emerald-800 text-sm">{member.krida}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Kecamatan</span>
            <p className="font-semibold text-slate-800">{'' || '-'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Wilayah Kwartir</span>
            <p className="font-semibold text-slate-800">Kwarcab {member.regencyName}, Kwarda {member.provinceName}</p>
          </div>
        </div>

        {member.bio && (
          <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Bio / Catatan Pengabdian</span>
            <p className="text-slate-700 italic">"{member.bio}"</p>
          </div>
        )}
      </div>

      {/* Bagikan Profil & Akses Cepat */}
      <div className="bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-purple-800/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Bagikan Profil Anggota Ini</h3>
            <p className="text-xs text-purple-200/80">Tautan langsung untuk verifikasi profil di lapangan</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim WhatsApp</span>
            </button>
            <button
              onClick={handleDownloadQuickQr}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-300" />
              <span>Unduh QR</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={handleCopyLink}
            className="p-2.5 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/40 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-purple-200"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-300" />}
            <span className="font-medium">{copiedLink ? 'Tautan Profil Tersalin!' : 'Salin Tautan Profil KTA'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopyNta}
            className="p-2.5 bg-purple-900/40 hover:bg-purple-900/70 border border-purple-700/40 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer text-purple-200"
          >
            {copiedNta ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-300" />}
            <span className="font-medium">{copiedNta ? 'NTA Tersalin!' : 'Salin Nomor NTA'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
