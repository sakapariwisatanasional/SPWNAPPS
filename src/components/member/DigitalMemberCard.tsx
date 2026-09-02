import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  RotateCw, 
  Download, 
  Printer, 
  FileDown,
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Compass, 
  Eye, 
  Sliders, 
  Check,
  Camera,
  Layers,
  Edit3
} from 'lucide-react';
import { Member, KtaCardSettings } from '../../types';
import { SakaLogo, SAKA_CARD_BG_DRIVE_DIRECT_URL, formatDriveImageUrl } from '../common/SakaLogo';
import { Barcode } from '../common/Barcode';
import { storage, DEFAULT_KTA_SETTINGS } from '../../services/storage';
import { KtaPrintPdfModal } from './KtaPrintPdfModal';
import { KtaQrCode } from './KtaQrCode';
import { downloadKtaPdfFile } from '../../services/ktaPdfGenerator';

interface DigitalMemberCardProps {
  member: Member;
  onVerifyClick?: (member: Member) => void;
  onEditCard?: () => void;
  onEditPhoto?: (member: Member) => void;
  onEditMemberProfile?: (member: Member) => void;
  onPrintPdf?: (member: Member) => void;
  showControls?: boolean;
  allowAdminEdit?: boolean;
  previewSettings?: KtaCardSettings;
}

export const DigitalMemberCard: React.FC<DigitalMemberCardProps> = ({
  member,
  onVerifyClick,
  onEditCard,
  onEditPhoto,
  onEditMemberProfile,
  onPrintPdf,
  showControls = true,
  allowAdminEdit = false,
  previewSettings
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [settings, setSettings] = useState<KtaCardSettings>(previewSettings || storage.getKtaSettings());
  const [isLocalPrintModalOpen, setIsLocalPrintModalOpen] = useState(false);
  const [isQuickExporting, setIsQuickExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Sync settings with storage or preview settings
  useEffect(() => {
    if (previewSettings) {
      setSettings(previewSettings);
      return;
    }
    const update = () => {
      setSettings(storage.getKtaSettings());
    };
    update();
    return storage.subscribe(update);
  }, [previewSettings]);

  const handlePrint = () => {
    window.print();
  };

  // Theme styling resolution
  const getThemeClasses = () => {
    switch (settings.cardTheme) {
      case 'emerald_pesona':
        return {
          frontBg: 'bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 border-emerald-500/30',
          backBg: 'bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 border-emerald-900/60',
          accentText: 'text-emerald-300',
          accentLight: 'text-emerald-200',
          badgeBg: 'bg-emerald-400 text-emerald-950',
          borderDim: 'border-emerald-500/30',
          boxBg: 'bg-emerald-950/80 border-emerald-500/40',
          photoBorder: 'border-emerald-400/80',
          photoTick: 'bg-emerald-500',
          backDivider: 'border-emerald-800/60'
        };
      case 'indigo_navy':
        return {
          frontBg: 'bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 border-blue-500/30',
          backBg: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-indigo-900/60',
          accentText: 'text-blue-300',
          accentLight: 'text-blue-200',
          badgeBg: 'bg-blue-400 text-blue-950',
          borderDim: 'border-blue-500/30',
          boxBg: 'bg-indigo-950/80 border-blue-500/40',
          photoBorder: 'border-blue-400/80',
          photoTick: 'bg-blue-500',
          backDivider: 'border-indigo-800/60'
        };
      case 'dark_slate':
        return {
          frontBg: 'bg-gradient-to-br from-slate-850 via-slate-900 to-black border-slate-600/30',
          backBg: 'bg-gradient-to-br from-black via-slate-900 to-slate-950 border-slate-700/60',
          accentText: 'text-slate-300',
          accentLight: 'text-slate-200',
          badgeBg: 'bg-white text-slate-950',
          borderDim: 'border-slate-600/30',
          boxBg: 'bg-slate-900/90 border-slate-600/40',
          photoBorder: 'border-slate-400/80',
          photoTick: 'bg-slate-600',
          backDivider: 'border-slate-800/60'
        };
      case 'gold_amber':
        return {
          frontBg: 'bg-gradient-to-br from-amber-900 via-stone-950 to-black border-amber-500/30',
          backBg: 'bg-gradient-to-br from-black via-amber-950 to-stone-900 border-amber-800/60',
          accentText: 'text-amber-300',
          accentLight: 'text-amber-200',
          badgeBg: 'bg-amber-400 text-amber-950',
          borderDim: 'border-amber-500/30',
          boxBg: 'bg-amber-950/80 border-amber-500/40',
          photoBorder: 'border-amber-400/80',
          photoTick: 'bg-amber-500',
          backDivider: 'border-amber-800/60'
        };
      case 'purple_saka':
      default:
        return {
          frontBg: 'bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 border-purple-500/30',
          backBg: 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 border-purple-900/60',
          accentText: 'text-purple-300',
          accentLight: 'text-purple-200',
          badgeBg: 'bg-purple-400 text-purple-950',
          borderDim: 'border-purple-500/30',
          boxBg: 'bg-purple-950/80 border-purple-500/40',
          photoBorder: 'border-purple-400/80',
          photoTick: 'bg-purple-500',
          backDivider: 'border-purple-800/60'
        };
    }
  };

  const theme = getThemeClasses();
  const barcodeValue = settings.barcodeCustomValue?.trim() || member.nationalMemberNumber || member.id;

  return (
    <div className="flex flex-col items-center select-none" ref={cardRef}>
      {/* 3D Card Container */}
      <div 
        className="w-full max-w-[420px] h-[260px] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div 
          className={`w-full h-full relative duration-700 transform-style-3d transition-transform rounded-2xl shadow-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= FRONT SIDE ================= */}
          <div className={`absolute inset-0 w-full h-full ${theme.frontBg} rounded-2xl p-5 text-white shadow-2xl border backface-hidden flex flex-col justify-between overflow-hidden`}>
            {/* Custom Google Drive Background Artwork (10% Default Opacity) */}
            {(settings.bgImageUrl || SAKA_CARD_BG_DRIVE_DIRECT_URL) && (
              <div 
                className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden rounded-2xl"
                style={{ opacity: settings.bgOpacity ?? 0.10 }}
              >
                <img
                  src={formatDriveImageUrl(settings.bgImageUrl || SAKA_CARD_BG_DRIVE_DIRECT_URL)}
                  alt="Latar Belakang KTA"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Ambient Background Accents */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className={`flex items-center justify-between z-10 border-b ${theme.borderDim} pb-2.5`}>
              <div className="flex items-center gap-2.5">
                <SakaLogo size={36} id={`kta-logo-${member.id}`} />
                <div>
                  <h3 className="font-extrabold text-xs tracking-wider uppercase leading-none font-heading text-white">
                    {settings.frontOrganizationTitle || 'SAKA PARIWISATA'}
                  </h3>
                  <p className={`text-[9px] ${theme.accentText} font-medium tracking-tight mt-0.5`}>
                    {settings.frontOrganizationSubtitle || 'GERAKAN PRAMUKA INDONESIA'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${theme.badgeBg} shadow-xs inline-flex items-center gap-1`}>
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {member.status === 'ACTIVE' ? 'KTA AKTIF' : member.status}
                </span>
                <p className={`text-[8px] ${theme.accentLight} mt-0.5 font-mono`}>
                  {member.provinceName}
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="flex gap-4 items-center z-10 my-auto">
              {/* Photo */}
              <div className="relative flex-shrink-0 group">
                <img
                  src={formatDriveImageUrl(member.avatarUrl) || member.avatarUrl || (member.gender === 'PEREMPUAN' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80')}
                  alt={member.fullName}
                  referrerPolicy="no-referrer"
                  className={`w-20 h-24 object-cover rounded-xl border-2 ${theme.photoBorder} shadow-md bg-slate-900`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = member.gender === 'PEREMPUAN'
                      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';
                  }}
                />
                <div className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 ${theme.photoTick} rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold`}>
                  ✓
                </div>
                {(onEditPhoto || allowAdminEdit) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onEditPhoto) onEditPhoto(member);
                    }}
                    className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 rounded-xl flex flex-col items-center justify-center text-white transition-all cursor-pointer backdrop-blur-[1px] p-1 text-center"
                    title="Perbaiki Pas Foto Resmi KTA"
                  >
                    <Camera className="w-4 h-4 text-purple-300 mb-0.5" />
                    <span className="text-[8px] font-bold leading-tight text-purple-200">Ubah Foto</span>
                  </button>
                )}
              </div>

              {/* Identity Details (Urutan: 1. Nomor Urut Anggota, 2. Nama Lengkap, 3. Jabatan, 4. Kwartir) */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* 1. [Nomor Urut Anggota] */}
                <div className={`${theme.boxBg} border rounded-lg px-2 py-0.5 inline-block max-w-full`}>
                  <p className={`text-[7.5px] ${theme.accentText} uppercase font-semibold leading-none`}>
                    Nomor Urut Anggota
                  </p>
                  <p className={`text-[11px] font-mono font-bold ${theme.accentLight} tracking-wider truncate mt-0.5`}>
                    {member.nationalMemberNumber || 'MENUNGGU VERIFIKASI'}
                  </p>
                </div>

                {/* 2. [Nama Lengkap dari Anggota] */}
                <p className="font-extrabold text-[13px] text-white tracking-wide truncate font-heading uppercase leading-snug">
                  {member.fullName}
                </p>

                {/* 3. [Jabatan dari Anggota] */}
                <p className={`text-[10px] font-bold ${theme.accentLight} tracking-wide truncate leading-tight`}>
                  {member.currentPosition || 'Anggota Saka Pariwisata'}
                </p>

                {/* 4. [Kwartir Nasional/Daerah/Cabang] */}
                <div className="text-[9px] text-slate-200 truncate space-y-0.5 pt-0.5">
                  {member.provinceId === '00' || member.provinceName?.toLowerCase().includes('nasional') ? (
                    <>
                      <p className="truncate font-medium text-white">
                        Kwartir Nasional Gerakan Pramuka
                      </p>
                      <p className={`text-[8px] ${theme.accentText} truncate leading-none`}>
                        Pimpinan Saka Pariwisata Nasional
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="truncate font-medium">
                        {member.regencyName 
                          ? `Kwartir Cabang ${member.regencyName}` 
                          : (member.provinceName ? `Kwartir Daerah ${member.provinceName}` : 'Kwartir Nasional')}
                      </p>
                      {member.provinceName && member.regencyName && (
                        <p className={`text-[8px] ${theme.accentText} truncate leading-none`}>
                          Kwartir Daerah {member.provinceName}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* QR Code for Verification with Encoded NTA */}
              <KtaQrCode 
                member={member} 
                size={58} 
                showLabel={true}
                interactive={true}
                onVerifyClick={onVerifyClick}
              />
            </div>

            {/* Card Footer */}
            <div className={`flex justify-between items-center z-10 pt-2 border-t ${theme.borderDim} text-[8px] ${theme.accentLight}/90 font-mono`}>
              <span>{settings.frontValidityText || 'Masa Berlaku: Selama Menjadi Anggota'}</span>
              <span className={`${theme.accentText} italic`}>Klik kartu untuk membalik ↻</span>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div className={`absolute inset-0 w-full h-full ${theme.backBg} rounded-2xl p-5 text-white shadow-2xl border backface-hidden rotate-y-180 flex flex-col justify-between overflow-hidden`}>
            {/* Custom Google Drive Background Artwork (10% Default Opacity) */}
            {(settings.bgImageUrl || SAKA_CARD_BG_DRIVE_DIRECT_URL) && (
              <div 
                className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden rounded-2xl"
                style={{ opacity: (settings.bgOpacity ?? 0.10) * 0.85 }}
              >
                <img
                  src={formatDriveImageUrl(settings.bgImageUrl || SAKA_CARD_BG_DRIVE_DIRECT_URL)}
                  alt="Latar Belakang KTA"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Back Header */}
            <div className={`border-b ${theme.backDivider} pb-2 flex items-center justify-between z-10`}>
              <div className="flex items-center gap-2">
                <SakaLogo size={24} />
                <div>
                  <h4 className={`text-[11px] font-bold tracking-wider uppercase ${theme.accentText} font-heading leading-tight`}>
                    {settings.backHeaderTitle || 'KETENTUAN KTA DIGITAL SAKA PARIWISATA'}
                  </h4>
                  <p className="text-[8px] text-slate-400">{settings.backHeaderSubtitle || 'Kwartir Nasional Gerakan Pramuka'}</p>
                </div>
              </div>
              <Compass className={`w-5 h-5 ${theme.accentText}`} />
            </div>

            {/* Terms Content */}
            <div className="text-[8px] text-slate-300 space-y-1.5 my-auto leading-relaxed z-10 pr-1">
              {settings.terms && settings.terms.length > 0 ? (
                settings.terms.map((term, i) => (
                  <p key={i} className="leading-snug">{term}</p>
                ))
              ) : (
                <>
                  <p>1. Kartu ini merupakan tanda pengenal sah anggota Satuan Karya Pramuka Pariwisata tingkat Nasional.</p>
                  <p>2. Keaslian data kartu dapat diverifikasi kapan pun secara publik melalui pemindaian QR Code di bagian depan.</p>
                  <p>3. Anggota wajib menjunjung tinggi Tri Satya, Dasa Darma Pramuka, serta Sapta Pesona Pariwisata Indonesia.</p>
                  <p>4. Apabila menemukan kartu ini tercecer, harap diserahkan ke Sekretariat Kwartir terdekat.</p>
                </>
              )}
            </div>

            {/* Back Footer: Location/Date, Barcode, Signer Name, Signer Title */}
            <div className={`pt-2 border-t ${theme.backDivider} flex justify-between items-end z-10`}>
              {/* Left Info */}
              <div className="text-[8px] text-slate-400 space-y-0.5">
                <p>ID Anggota: <span className="font-mono text-slate-300">{member.id}</span></p>
                <p>Terdaftar Sejak: <span className={`${theme.accentText} font-medium`}>{new Date(member.registeredAt).toLocaleDateString('id-ID')}</span></p>
                <div className="inline-flex items-center gap-1 text-[7px] text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded mt-0.5 border border-slate-700/50">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Sistem Otorisasi KTA Nasional</span>
                </div>
              </div>

              {/* Right Box: Jakarta Date + Barcode + Signer Name + Signer Title */}
              <div className="flex flex-col items-center text-center">
                {/* Location & Date */}
                <p className="text-[8px] text-slate-300 font-medium tracking-tight mb-1">
                  {settings.issueLocationDate || 'Jakarta, 14 Agustus 2026'}
                </p>

                {/* High Quality Barcode Box */}
                <div className="bg-white/95 px-2 py-0.5 rounded-sm shadow-xs border border-white/40 flex items-center justify-center">
                  <Barcode
                    value={barcodeValue}
                    width={110}
                    height={20}
                    barColor="#0f172a"
                    showText={false}
                  />
                </div>

                {/* Signer Name (Under Barcode) */}
                <p className="font-bold text-[8.5px] text-white mt-1 leading-tight tracking-wide">
                  {settings.signerName || 'Rohadi Wijaya'}
                </p>

                {/* Signer Title (Under Name) */}
                <p className={`text-[7px] ${theme.accentText} font-medium leading-none tracking-tight mt-0.5 max-w-[160px]`}>
                  {settings.signerTitle || 'Ketua Pimpinan Saka Pariwisata Nasional'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions Bar */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/60 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isFlipped ? 'Lihat Bagian Depan' : 'Lihat Bagian Belakang'}</span>
          </button>

          {onVerifyClick && (
            <button
              onClick={() => onVerifyClick(member)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-950 rounded-xl text-xs font-semibold transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Cek Verifikasi Publik</span>
            </button>
          )}

          {/* Primary PDF & Print Action */}
          <button
            onClick={() => {
              if (onPrintPdf) {
                onPrintPdf(member);
              } else {
                setIsLocalPrintModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-950 hover:to-indigo-950 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-950/20 cursor-pointer"
            title="Cetak & Konversi KTA ke PDF Standar ISO/IEC 7810 ID-1"
          >
            <FileDown className="w-3.5 h-3.5 text-purple-300" />
            <span>Cetak / Unduh PDF</span>
          </button>

          {(allowAdminEdit || onEditPhoto) && (
            <button
              onClick={() => onEditPhoto && onEditPhoto(member)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/90 hover:bg-purple-950 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              title="Unggah berkas atau ganti link pas foto KTA"
            >
              <Camera className="w-3.5 h-3.5 text-purple-300" />
              <span>Ubah / Upload Foto KTA</span>
            </button>
          )}

          {(allowAdminEdit || onEditMemberProfile) && (
            <button
              onClick={() => onEditMemberProfile && onEditMemberProfile(member)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
              title="Koreksi nama lengkap, gelar, domisili, atau identitas anggota"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Koreksi Profil & Nama</span>
            </button>
          )}

          {(allowAdminEdit || onEditCard) && (
            <button
              onClick={onEditCard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit Tampilan KTA</span>
            </button>
          )}
        </div>
      )}

      {/* Internal Print & PDF Export Modal */}
      <KtaPrintPdfModal
        isOpen={isLocalPrintModalOpen}
        member={member}
        settings={settings}
        onClose={() => setIsLocalPrintModalOpen(false)}
        onOpenEditCard={onEditCard}
      />
    </div>
  );
};
