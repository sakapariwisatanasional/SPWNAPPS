import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  X, 
  UserCheck
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
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  onVerifyClick?: (member: Member) => void;
}

/**
 * Membangun URL profil resmi anggota pemilik KTA.
 * Saat discan oleh kamera smartphone manapun, langsung membuka halaman profil KTA anggota ini.
 */
export function getMemberVerificationUrl(member: Member): string {
  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://sakapariwisata-nasional.vercel.app';

  // Sumber identitas QR harus sama dengan kolom verifikasi di Spreadsheet.
  // QR membuka route verifikasi langsung; identitas utama adalah Nomor KTA.
  const verifyId = String(member.nationalMemberNumber || member.id || '').trim();
  return `${origin}/verify?verifyId=${encodeURIComponent(verifyId)}`;
}

export const KtaQrCode: React.FC<KtaQrCodeProps> = ({
  member,
  size = 64,
  className = '',
  darkColor = '#1e0842',
  lightColor = '#ffffff',
  showLabel = true,
  interactive = true,
  borderWidth = 1,
  borderColor = '#c4b5fd',
  borderRadius = 12,
  onVerifyClick
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [highResQrUrl, setHighResQrUrl] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const profileUrl = getMemberVerificationUrl(member);
  const nta = member.nationalMemberNumber || member.id;

  // Generate QR Code
  useEffect(() => {
    let isMounted = true;

    // QR Kecil Kartu
    QRCode.toDataURL(profileUrl, {
      width: Math.max(256, Math.round(size * 5)),
      margin: 4,
      color: {
        dark: darkColor,
        light: lightColor
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => console.error('Error QR:', err));

    // QR Resolusi Tinggi
    QRCode.toDataURL(profileUrl, {
      width: 1024,
      margin: 4,
      color: {
        dark: darkColor,
        light: lightColor
      },
      errorCorrectionLevel: 'H'
    })
      .then((url) => {
        if (isMounted) setHighResQrUrl(url);
      })
      .catch((err) => console.error('Error High-Res QR:', err));

    return () => {
      isMounted = false;
    };
  }, [profileUrl, size, darkColor, lightColor]);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = profileUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Gagal menyalin:', err);
    }
  };

  const handleDownloadQrPng = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloading(true);

    try {
      const cleanNta = (member.nationalMemberNumber || member.id).replace(/[^a-zA-Z0-9]/g, '-');
      const cleanName = (member.fullName || 'Anggota').replace(/[^a-zA-Z0-9]/g, '-');
      const filename = `QR-Profil-KTA-${cleanNta}-${cleanName}.png`;

      const downloadUrl = highResQrUrl || qrDataUrl;
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download QR error:', err);
    } finally {
      setTimeout(() => setDownloading(false), 600);
    }
  };

  const handleOpenProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(false);
    if (onVerifyClick) {
      onVerifyClick(member);
    } else {
      window.location.href = profileUrl;
    }
  };

  return (
    <>
      {/* Container QR Code Kartu */}
      <div 
        className={`flex flex-col items-center flex-shrink-0 bg-white p-1 shadow-md transition-all ${
          interactive ? 'hover:scale-105 hover:shadow-lg cursor-pointer group/qr relative' : ''
        } ${className}`}
        style={{ border: `${Math.max(0, borderWidth)}px solid ${borderColor}`, borderRadius: `${Math.max(0, borderRadius)}px`, boxSizing: 'border-box' }}
        onClick={(e) => {
          if (!interactive) return;
          e.stopPropagation();
          setIsModalOpen(true);
        }}
        title="Klik untuk membuka QR Profil Anggota"
      >
        <div className="relative flex items-center justify-center">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt="QR Code KTA" 
              style={{ width: `${size}px`, height: `${size}px` }}
              className="object-contain"
            />
          ) : (
            <div 
              style={{ width: `${size}px`, height: `${size}px` }} 
              className="bg-slate-100 rounded-lg flex items-center justify-center animate-pulse"
            >
              <QrCode className="w-4 h-4 text-slate-400" />
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-full shadow-xs border border-purple-100 flex items-center justify-center" style={{ width: Math.max(12, Math.min(16, Math.round(size * 0.16))), height: Math.max(12, Math.min(16, Math.round(size * 0.16))), padding: 2 }}>
              <SakaLogo size={Math.max(8, Math.min(12, Math.round(size * 0.12)))} />
            </div>
          </div>
        </div>

        {showLabel && (
          <span className="text-[7px] font-bold text-purple-900 tracking-wider font-mono mt-0.5 uppercase">
            Profil KTA
          </span>
        )}
      </div>

      {/* POP-UP MODAL QR CODE */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Informasi Anggota */}
            <div className="flex items-center gap-3 pr-8 pb-3 border-b border-slate-100">
              <img 
                src={member.avatarUrl} 
                alt={member.fullName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-xs flex-shrink-0"
              />
              <div className="truncate">
                <h4 className="font-bold text-sm text-slate-900 truncate font-heading">{member.fullName}</h4>
                <p className="text-[11px] font-mono text-purple-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>NTA: {nta}</span>
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {member.krida} • {member.regencyName}
                </p>
              </div>
            </div>

            {/* Gambar QR Code */}
            <div className="flex flex-col items-center justify-center space-y-2 py-1">
              <div className="relative p-2 bg-white rounded-2xl shadow-md border border-slate-200">
                {highResQrUrl ? (
                  <img 
                    src={highResQrUrl} 
                    alt="QR Code Profil KTA" 
                    className="w-52 h-52 object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-52 h-52 bg-slate-100 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">
                    Memuat QR Code...
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white rounded-full p-1 shadow-md border border-purple-200 flex items-center justify-center" style={{ width: 40, height: 40 }}>
                    <SakaLogo size={28} />
                  </div>
                </div>
              </div>

              <div className="text-center space-y-0.5">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-950 rounded-full text-xs font-mono font-bold">
                  {nta}
                </span>
                <p className="text-[11px] text-slate-500">
                  Pindai dengan kamera smartphone untuk membuka langsung profil digital KTA anggota ini
                </p>
              </div>
            </div>

            {/* Tautan Langsung Profil */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Tautan Profil Digital KTA:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={profileUrl}
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
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* Tombol Aksi */}
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
                onClick={handleOpenProfile}
                className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-200" />
                <span>Buka Profil Anggota</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
