import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  Eye, 
  Sparkles, 
  X, 
  Maximize2,
  ScanLine,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Member } from '../../types';
import { SakaLogo } from '../common/SakaLogo';

export interface KtaQrCodeProps {
  member: Member;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  showLabel?: boolean;
  interactive?: boolean;
  onVerifyClick?: (member: Member) => void;
}

/**
 * Builds the canonical public verification URL for a member's NTA (Nomor Tanda Anggota)
 */
export function getMemberVerificationUrl(member: Member): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const nta = member.nationalMemberNumber || member.verificationToken || member.id;
  // Encodes NTA as query parameter and tab router so any scanned device lands directly on the verification view
  return `${origin}/?verifyId=${encodeURIComponent(nta)}&tab=verify-portal`;
}

export const KtaQrCode: React.FC<KtaQrCodeProps> = ({
  member,
  size = 64,
  className = '',
  darkColor = '#1e0842',
  lightColor = '#ffffff',
  showLabel = true,
  interactive = true,
  onVerifyClick
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [highResQrUrl, setHighResQrUrl] = useState<string>('');

  const nta = member.nationalMemberNumber || member.verificationToken || member.id;
  const verificationUrl = getMemberVerificationUrl(member);
  const isVerified = member.status === 'ACTIVE';

  // Generate thumbnail QR Code
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(verificationUrl, {
      width: Math.max(128, size * 2),
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: darkColor,
        light: lightColor
      }
    })
      .then(url => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(err => {
        console.error('KTA QR Generation Error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [verificationUrl, size, darkColor, lightColor]);

  // Generate High-Res QR for Modal and Download
  useEffect(() => {
    if (!isModalOpen) return;
    let isMounted = true;

    QRCode.toDataURL(verificationUrl, {
      width: 512,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#1e0842',
        light: '#ffffff'
      }
    })
      .then(url => {
        if (isMounted) setHighResQrUrl(url);
      })
      .catch(err => console.error('High-Res QR Error:', err));

    return () => {
      isMounted = false;
    };
  }, [isModalOpen, verificationUrl]);

  // Copy Verification URL to Clipboard
  const handleCopyLink = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Gagal menyalin tautan:', err);
    }
  };

  // Download QR Code as Standalone PNG
  const handleDownloadQrPng = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloading(true);

    try {
      const cleanNta = (member.nationalMemberNumber || member.id).replace(/[^a-zA-Z0-9]/g, '-');
      const cleanName = member.fullName.replace(/[^a-zA-Z0-9]/g, '-');
      const filename = `QR-KTA-SakaPariwisata-${cleanNta}-${cleanName}.png`;

      const downloadUrl = highResQrUrl || qrDataUrl;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download QR PNG error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 800);
    }
  };

  // Open Direct Verification
  const handleOpenVerification = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVerifyClick) {
      onVerifyClick(member);
      setIsModalOpen(false);
    } else {
      window.open(verificationUrl, '_blank');
    }
  };

  return (
    <>
      {/* Visual QR Container on KTA Card */}
      <div 
        className={`flex flex-col items-center flex-shrink-0 bg-white p-1 rounded-xl shadow-lg border border-purple-200/50 transition-all ${
          interactive ? 'hover:scale-105 hover:shadow-xl hover:border-purple-400 cursor-pointer group/qr relative' : ''
        } ${className}`}
        onClick={(e) => {
          if (interactive) {
            e.stopPropagation();
            setIsModalOpen(true);
          }
        }}
        title={interactive ? 'Klik untuk memperbesar QR & Tautan Verifikasi Publik' : 'QR Verifikasi NTA'}
      >
        {qrDataUrl ? (
          <div className="relative">
            <img 
              src={qrDataUrl} 
              alt={`QR Verifikasi ${member.fullName}`} 
              style={{ width: `${size}px`, height: `${size}px` }}
              className="rounded-sm object-contain" 
            />
            {interactive && (
              <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover/qr:opacity-100 rounded-sm flex items-center justify-center transition-opacity text-white">
                <Maximize2 className="w-3.5 h-3.5 text-purple-200 drop-shadow" />
              </div>
            )}
          </div>
        ) : (
          <div 
            style={{ width: `${size}px`, height: `${size}px` }}
            className="bg-slate-100 animate-pulse rounded flex items-center justify-center text-[9px] text-slate-400 font-mono"
          >
            QR NTA
          </div>
        )}

        {showLabel && (
          <span className="text-[7px] text-purple-950 font-extrabold uppercase mt-0.5 tracking-tighter leading-tight text-center flex items-center gap-0.5">
            <ScanLine className="w-2 h-2 text-purple-700 inline" />
            <span>Scan Verifikasi</span>
          </span>
        )}
      </div>

      {/* Interactive QR Code Modal & Portal Access */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-slate-900 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white relative">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold tracking-wider uppercase text-purple-300">
                      QR Code KTA Digital
                    </span>
                    <span className="px-2 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-400/30">
                      Resmi
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-heading">
                    Verifikasi NTA Saka Pariwisata
                  </h3>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Member Brief Banner */}
              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <img 
                  src={member.avatarUrl} 
                  alt={member.fullName} 
                  className="w-12 h-14 object-cover rounded-xl border border-purple-300 shadow-xs"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate font-heading uppercase">
                    {member.fullName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-purple-900 font-mono font-bold mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span className="truncate">NTA: {member.nationalMemberNumber || 'Nomor Belum Terbit'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {member.currentPosition || 'Anggota'} • {member.branchName ? `Kwarcab ${member.regencyName}` : member.provinceName}
                  </p>
                </div>
              </div>

              {/* High-Resolution QR Canvas Box */}
              <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-purple-50/50 to-indigo-50/30 rounded-2xl border border-purple-100 shadow-inner space-y-3">
                <div className="p-3 bg-white rounded-2xl shadow-md border border-purple-100 flex items-center justify-center relative">
                  {highResQrUrl || qrDataUrl ? (
                    <img 
                      src={highResQrUrl || qrDataUrl} 
                      alt="QR Code KTA" 
                      className="w-48 h-48 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                      Membuat QR Code...
                    </div>
                  )}
                  {/* Central Saka Badge Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 bg-white rounded-full p-1 shadow-md border border-purple-200 flex items-center justify-center">
                      <SakaLogo size={28} />
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-950 rounded-full text-xs font-mono font-bold">
                    <span>{nta}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Pindai dengan kamera smartphone atau Google Lens untuk membuka laman verifikasi resmi
                  </p>
                </div>
              </div>

              {/* Public Verification Link Field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Tautan Verifikasi Publik:
                </label>
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
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      copied 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDownloadQrPng}
                  disabled={downloading}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>{downloading ? 'Mengunduh...' : 'Unduh QR (PNG)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenVerification}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-950 hover:to-indigo-950 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-950/20 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-300" />
                  <span>Buka Portal Verifikasi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
