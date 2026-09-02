import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Smartphone, 
  FileDown, 
  RotateCw, 
  CheckCircle2, 
  Info,
  Sliders,
  Layers,
  Palette,
  Phone,
  Mail,
  Send
} from 'lucide-react';
import { Member } from '../../types';
import { 
  BadgeOptions, 
  BadgeTheme, 
  BadgeFormat, 
  DEFAULT_BADGE_OPTIONS,
  renderVerticalLanyardCanvas,
  renderHorizontalBadgeCanvas,
  downloadBadgePng,
  downloadBadgePdf
} from '../../services/quickShareBadgeGenerator';
import { getMemberVerificationUrl } from './KtaQrCode';
import QRCode from 'qrcode';

interface QuickShareBadgeModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onOpenVerifyModal?: (member: Member) => void;
}

export const QuickShareBadgeModal: React.FC<QuickShareBadgeModalProps> = ({
  isOpen,
  member,
  onClose,
  onOpenVerifyModal
}) => {
  const [options, setOptions] = useState<BadgeOptions>(DEFAULT_BADGE_OPTIONS);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedNta, setCopiedNta] = useState<boolean>(false);
  const [downloadProgressText, setDownloadProgressText] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate preview whenever member or options change
  useEffect(() => {
    if (!isOpen || !member) return;

    let isMounted = true;
    setIsRendering(true);

    const generatePreview = async () => {
      try {
        const canvas = options.format === 'VERTICAL_LANYARD'
          ? await renderVerticalLanyardCanvas(member, options)
          : await renderHorizontalBadgeCanvas(member, options);

        if (isMounted) {
          canvasRef.current = canvas;
          setPreviewUrl(canvas.toDataURL('image/png'));
        }
      } catch (err) {
        console.error('Badge preview render error:', err);
      } finally {
        if (isMounted) setIsRendering(false);
      }
    };

    generatePreview();

    return () => {
      isMounted = false;
    };
  }, [isOpen, member, options]);

  if (!isOpen || !member) return null;

  const nta = member.nationalMemberNumber || member.verificationToken || member.id;
  const verificationUrl = getMemberVerificationUrl(member);

  // Copy Verification Link
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
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  // Copy NTA
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

  // Download Badge PNG
  const handleDownloadPng = async () => {
    setIsDownloading(true);
    setDownloadProgressText('Menghasilkan Badge resolusi tinggi HD...');
    try {
      await downloadBadgePng(member, options);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download PNG error:', err);
      alert('Gagal mengunduh gambar badge. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
      setDownloadProgressText('');
    }
  };

  // Download Badge PDF
  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setDownloadProgressText('Menyusun dokumen cetak PDF...');
    try {
      await downloadBadgePdf(member, options);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download PDF error:', err);
      alert('Gagal membuat file PDF. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
      setDownloadProgressText('');
    }
  };

  // Download Standalone QR Code
  const handleDownloadStandaloneQr = async () => {
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
      console.error('Download standalone QR error:', err);
    }
  };

  // Native Web Share or WhatsApp Fallback
  const handleNativeShare = async () => {
    const shareData = {
      title: `Profil KTA Saka Pariwisata - ${member.fullName}`,
      text: `Halo! Ini profil & KTA Digital Saka Pariwisata saya atas nama ${member.fullName} (NTA: ${nta}). Buka tautan berikut untuk melihat portofolio kepanduan & verifikasi resmi.`,
      url: verificationUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.warn('Share error:', err);
        }
      }
    } else {
      // Fallback to WhatsApp
      const waText = encodeURIComponent(
        `Halo! Ini tanda pengenal dan profil digital Saka Pariwisata saya:\n\n*${member.fullName}*\nNTA: ${nta}\nJabatan: ${member.currentPosition || 'Anggota'}\nWilayah: ${member.regencyName ? `Kwarcab ${member.regencyName}, ` : ''}${member.provinceName}\n\nLihat profil & verifikasi resmi di sini:\n${verificationUrl}`
      );
      window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
    }
  };

  // Direct WhatsApp Share
  const handleWhatsAppShare = () => {
    const waText = encodeURIComponent(
      `Halo! Ini tanda pengenal & profil digital Saka Pariwisata saya:\n\n*${member.fullName}*\nNTA: ${nta}\nJabatan: ${member.currentPosition || 'Anggota'}\nWilayah: ${member.regencyName ? `Kwarcab ${member.regencyName}, ` : ''}${member.provinceName}\n\nLihat profil & verifikasi resmi di sini:\n${verificationUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-purple-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/30 to-amber-500/20 border border-purple-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg font-heading text-white">
                  Quick Share & Event Networking Badge
                </h3>
                <span className="px-2 py-0.5 bg-amber-400/20 border border-amber-300/40 text-amber-300 text-[10px] font-bold rounded-full">
                  QR NTA Instant Pass
                </span>
              </div>
              <p className="text-xs text-purple-200/80">
                Badge pengenal acara & QR Code profil publik {member.fullName} siap cetak dan dibagikan saat temu jejaring
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Quick Notice Banner */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-2.5 text-xs text-purple-950">
            <Sparkles className="w-4 h-4 text-purple-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Solusi Praktis saat Kegiatan Kepramukaan & Pariwisata:</span>
              <p className="text-purple-900/80">
                Gunakan badge ini di acara Jambore, Kemah Wisata, Munas, Rakernas, Pelatihan Pemandu, atau pameran UMKM. Teman atau kolega cukup memindai QR Code untuk membuka profil lengkap, nomor NTA, dan portofolio resmi Anda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Live Badge Preview (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-3 flex flex-col items-center">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-700" />
                  <span>Pratinjau Badge Siap Unduh</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                  {options.format === 'VERTICAL_LANYARD' ? '900 × 1400 px (3:4.6)' : '1200 × 750 px (16:10)'}
                </span>
              </div>

              {/* Badge Preview Canvas Wrapper */}
              <div className="w-full bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center relative min-h-[380px] max-h-[460px] overflow-hidden">
                {isRendering ? (
                  <div className="flex flex-col items-center justify-center space-y-2 text-purple-300 animate-pulse">
                    <RotateCw className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-medium">Merender tampilan badge HD...</span>
                  </div>
                ) : previewUrl ? (
                  <div className="relative group/preview max-h-[430px] flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Networking Badge Preview"
                      className="max-h-[420px] w-auto object-contain rounded-2xl shadow-xl transition-transform duration-300 group-hover/preview:scale-[1.02]"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Gagal memuat pratinjau badge.</div>
                )}
              </div>

              {/* Instant Action Pills below preview */}
              <div className="w-full grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isDownloading || isRendering}
                  className="py-2.5 px-3 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-950 hover:to-indigo-950 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-950/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5 text-purple-300" />
                  <span>Unduh PNG HD</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-100" />
                  <span>Kirim WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Right Column: Customization & Instant Sharing Tools (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* 1. Theme Selector */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-purple-700" />
                  <span>Pilihan Tema Warna Badge:</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* Theme 1: Purple Gold */}
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, theme: 'purple_gold' })}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      options.theme === 'purple_gold'
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/30'
                        : 'border-slate-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-purple-950 border border-purple-400" />
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 leading-tight">Royal Purple</span>
                    <span className="text-[9px] text-slate-500">Khas Saka</span>
                  </button>

                  {/* Theme 2: Emerald Pesona */}
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, theme: 'emerald_pesona' })}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      options.theme === 'emerald_pesona'
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/30'
                        : 'border-slate-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-900 border border-emerald-400" />
                      <div className="w-3.5 h-3.5 rounded-full bg-teal-400 border border-teal-500" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 leading-tight">Emerald Pesona</span>
                    <span className="text-[9px] text-slate-500">Ekowisata</span>
                  </button>

                  {/* Theme 3: Midnight Slate */}
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, theme: 'midnight_slate' })}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      options.theme === 'midnight_slate'
                        ? 'border-slate-700 bg-slate-100 ring-2 ring-slate-700/30'
                        : 'border-slate-200 bg-white hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-500" />
                      <div className="w-3.5 h-3.5 rounded-full bg-sky-400 border border-sky-500" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 leading-tight">Midnight Slate</span>
                    <span className="text-[9px] text-slate-500">Executive</span>
                  </button>

                  {/* Theme 4: Clean White */}
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, theme: 'clean_white' })}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      options.theme === 'clean_white'
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/30'
                        : 'border-slate-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-white border border-slate-400" />
                      <div className="w-3.5 h-3.5 rounded-full bg-purple-600 border border-purple-700" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 leading-tight">Clean White</span>
                    <span className="text-[9px] text-slate-500">Hemat Tinta</span>
                  </button>
                </div>
              </div>

              {/* 2. Format & Layout Selector */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-700" />
                  <span>Format & Orientasi Badge:</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, format: 'VERTICAL_LANYARD' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      options.format === 'VERTICAL_LANYARD'
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20'
                        : 'border-slate-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="w-7 h-10 rounded-md bg-purple-900 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      ID
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">Vertical Lanyard Pass</h5>
                      <p className="text-[10px] text-slate-500">Format tali ID Card event (A6)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, format: 'HORIZONTAL_CARD' })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      options.format === 'HORIZONTAL_CARD'
                        ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20'
                        : 'border-slate-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="w-10 h-7 rounded-md bg-purple-900 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                      PASS
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">Horizontal Networking Card</h5>
                      <p className="text-[10px] text-slate-500">Format kartu nama digital (A5)</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Custom Event Title & Field Toggles */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Nama Acara / Subjudul Badge (Opsional):
                  </label>
                  <input
                    type="text"
                    value={options.eventName || ''}
                    onChange={(e) => setOptions({ ...options, eventName: e.target.value })}
                    placeholder="Contoh: Kemah Wisata Nusantara 2026 / Munas Pramuka"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                {/* Checkbox Options */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={options.showContactPhone}
                      onChange={(e) => setOptions({ ...options, showContactPhone: e.target.checked })}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Nomor WhatsApp</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={options.showEmail}
                      onChange={(e) => setOptions({ ...options, showEmail: e.target.checked })}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Alamat Email</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={options.showSkills}
                      onChange={(e) => setOptions({ ...options, showSkills: e.target.checked })}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>Keahlian Anggota</span>
                  </label>
                </div>
              </div>

              {/* 4. Public URL & Direct NTA Share Box */}
              <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-purple-700" />
                    <span>NTA & Tautan Profil Resmi:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNta}
                    className="text-[11px] font-mono font-bold text-purple-800 hover:text-purple-950 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Klik untuk menyalin NTA"
                  >
                    {copiedNta ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>NTA: {nta}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={verificationUrl}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 outline-none select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-900 hover:bg-purple-950 text-white'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress and Success Notices */}
              {isDownloading && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-2.5 text-purple-900 text-xs font-semibold animate-pulse">
                  <RotateCw className="w-4 h-4 animate-spin text-purple-700 flex-shrink-0" />
                  <span>{downloadProgressText || 'Memproses badge dan berkas...'}</span>
                </div>
              )}

              {downloadSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-900 text-xs font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Badge berhasil diunduh ke perangkat Anda! Siap dicetak atau dibagikan.</span>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Modal Footer: Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>QR Code Badge terhubung langsung ke basis data terverifikasi Kwartir Nasional.</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
            {/* Standalone QR Code Download */}
            <button
              type="button"
              onClick={handleDownloadStandaloneQr}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              title="Unduh file gambar QR Code saja"
            >
              <QrCode className="w-3.5 h-3.5 text-purple-700" />
              <span>QR Saja</span>
            </button>

            {/* Native Mobile Share */}
            <button
              type="button"
              onClick={handleNativeShare}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-700" />
              <span>Bagikan Link</span>
            </button>

            {/* Printable PDF Badge */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading || isRendering}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-600" />
              <span>Dokumen PDF ({options.format === 'VERTICAL_LANYARD' ? 'A6' : 'A5'})</span>
            </button>

            {/* Download High-Resolution Badge PNG */}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isDownloading || isRendering}
              className="px-5 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-950 hover:to-indigo-950 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-purple-300" />
              <span>Unduh Badge (PNG HD)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
