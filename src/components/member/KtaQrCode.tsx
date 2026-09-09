import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
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
  onVerifyClick?: (member: Member) => void;
}

/**
 * URL verifikasi anggota yang disimpan di dalam QR Code.
 * QR selalu menunjuk ke halaman /verify agar dapat dibuka langsung
 * dari kamera smartphone tanpa harus membuka aplikasi terlebih dahulu.
 */
export function getMemberVerificationUrl(member: Member): string {
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://spwnapps.vercel.app';

  const verificationId =
    member.verificationToken ||
    member.id ||
    member.nationalMemberNumber ||
    '';

  return (
    origin +
    '/verify?verifyId=' +
    encodeURIComponent(verificationId)
  );
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [highResQrUrl, setHighResQrUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const profileUrl = getMemberVerificationUrl(member);
  const nta = member.nationalMemberNumber || member.id || '-';

  useEffect(() => {
    let mounted = true;

    setQrDataUrl('');
    setHighResQrUrl('');

    const generate = async () => {
      try {
        // QR untuk kartu.
        // Margin 4 module menjaga quiet-zone agar kamera
        // smartphone lebih mudah mengenali batas QR pada ukuran kecil.
        const cardUrl = await QRCode.toDataURL(profileUrl, {
          width: Math.max(256, Math.round(size * 5)),
          margin: 4,
          errorCorrectionLevel: 'H',
          color: {
            dark: darkColor,
            light: lightColor
          }
        });

        // QR resolusi tinggi untuk modal/download.
        const largeUrl = await QRCode.toDataURL(profileUrl, {
          width: 1024,
          margin: 4,
          errorCorrectionLevel: 'H',
          color: {
            dark: darkColor,
            light: lightColor
          }
        });

        if (!mounted) return;

        setQrDataUrl(cardUrl);
        setHighResQrUrl(largeUrl);
      } catch (error) {
        console.error('Gagal membuat QR Code KTA:', error);
      }
    };

    generate();

    return () => {
      mounted = false;
    };
  }, [profileUrl, size, darkColor, lightColor]);

  /*
   * Logo tengah dibuat kecil.
   *
   * QR menggunakan error correction level H sehingga masih toleran
   * terhadap area tengah yang tertutup logo.
   */
  const logoSize = clamp(Math.round(size * 0.12), 7, 12);
  const modalLogoSize = 30;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) {
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

      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (error) {
      console.error('Gagal menyalin tautan profil:', error);
    }
  };

  const handleDownloadQrPng = (event?: React.MouseEvent) => {
    event?.stopPropagation();

    setDownloading(true);

    try {
      const cleanNta = String(nta).replace(
        /[^a-zA-Z0-9]/g,
        '-'
      );

      const cleanName = String(
        member.fullName || 'Anggota'
      ).replace(
        /[^a-zA-Z0-9]/g,
        '-'
      );

      const filename =
        'QR-Profil-KTA-' +
        cleanNta +
        '-' +
        cleanName +
        '.png';

      const downloadUrl =
        highResQrUrl || qrDataUrl;

      if (!downloadUrl) {
        return;
      }

      const link =
        document.createElement('a');

      link.href = downloadUrl;
      link.download = filename;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (error) {
      console.error(
        'Download QR error:',
        error
      );
    } finally {
      window.setTimeout(() => {
        setDownloading(false);
      }, 600);
    }
  };

  const handleOpenProfile = (
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    setIsModalOpen(false);

    if (onVerifyClick) {
      onVerifyClick(member);
      return;
    }

    window.location.href = profileUrl;
  };

  const cardClassName =
    'flex flex-col items-center flex-shrink-0 bg-white p-1 rounded-xl shadow-md border border-purple-200/50 transition-all ' +
    (interactive
      ? 'hover:scale-105 hover:shadow-lg cursor-pointer group/qr relative '
      : '') +
    className;

  return (
    <>
      <div
        className={cardClassName}
        onClick={(event) => {
          if (!interactive) return;

          event.stopPropagation();
          setIsModalOpen(true);
        }}
        title="Klik untuk membuka QR Profil Anggota"
      >
        <div className="relative flex items-center justify-center">

          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code KTA"
              width={size}
              height={size}
              style={{
                width: size,
                height: size
              }}
              className="object-contain rounded-lg"
            />
          ) : (
            <div
              style={{
                width: size,
                height: size
              }}
              className="bg-slate-100 rounded-lg flex items-center justify-center animate-pulse"
            >
              <QrCode className="w-4 h-4 text-slate-400" />
            </div>
          )}

          {/*
            Logo tengah dibuat kecil agar tidak menutup
            terlalu banyak modul QR.
          */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className="bg-white rounded-full shadow-sm border border-purple-100 flex items-center justify-center"
              style={{
                width: logoSize + 4,
                height: logoSize + 4,
                padding: 2
              }}
            >
              <SakaLogo size={logoSize} />
            </div>
          </div>
        </div>

        {showLabel ? (
          <span className="text-[7px] font-bold text-purple-900 tracking-wider font-mono mt-0.5 uppercase">
            Profil KTA
          </span>
        ) : null}
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-4 text-slate-800"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() =>
                setIsModalOpen(false)
              }
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pr-8 pb-3 border-b border-slate-100">
              <img
                src={member.avatarUrl}
                alt={member.fullName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-xs flex-shrink-0"
              />

              <div className="truncate">
                <h4 className="font-bold text-sm text-slate-900 truncate font-heading">
                  {member.fullName}
                </h4>

                <p className="text-[11px] font-mono text-purple-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />

                  <span>
                    NTA: {nta}
                  </span>
                </p>

                <p className="text-[10px] text-slate-500 truncate">
                  {member.krida} • {member.regencyName}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-2 py-1">
              <div className="relative p-3 bg-white rounded-2xl shadow-md border border-slate-200">

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
                  <div
                    className="bg-white rounded-full shadow-md border border-purple-200 flex items-center justify-center"
                    style={{
                      width: 40,
                      height: 40,
                      padding: 4
                    }}
                  >
                    <SakaLogo
                      size={modalLogoSize}
                    />
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
                  className={
                    'px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ' +
                    (
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
                    )
                  }
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}

                  <span>
                    {copied
                      ? 'Tersalin'
                      : 'Salin'}
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleDownloadQrPng}
                disabled={
                  downloading ||
                  !highResQrUrl
                }
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />

                <span>
                  {downloading
                    ? 'Mengunduh...'
                    : 'Unduh QR (PNG)'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleOpenProfile}
                className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-200" />

                <span>
                  Buka Profil Anggota
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default KtaQrCode;
