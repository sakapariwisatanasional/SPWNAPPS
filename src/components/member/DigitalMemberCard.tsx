import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  RotateCw, 
  Download, 
  FileDown,
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Compass, 
  Sliders, 
  Camera, 
  Edit3
} from 'lucide-react';
import { Member, KtaCardSettings } from '../../types';
import { SakaLogo, SAKA_CARD_BG_DRIVE_DIRECT_URL, formatDriveImageUrl } from '../common/SakaLogo';
import { Barcode } from '../common/Barcode';
import { storage } from '../../services/storage';
import { KtaQrCode } from './KtaQrCode';

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

  // Dengarkan pembaruan pengaturan desain KTA dari Super Admin secara real-time
  useEffect(() => {
    if (previewSettings) {
      setSettings(previewSettings);
      return;
    }

    const refreshSettings = () => {
      setSettings(storage.getKtaSettings());
    };

    const unsubscribe = storage.subscribe(refreshSettings);
    const handleCustomEvent = (e: any) => {
      if (e.detail) setSettings(e.detail);
    };

    window.addEventListener('saka:kta-settings-updated', handleCustomEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('saka:kta-settings-updated', handleCustomEvent);
    };
  }, [previewSettings]);

  if (!member) return null;

  const nta = member.nationalMemberNumber || member.id;
  // Gunakan barcode custom jika diisi oleh Super Admin, jika tidak gunakan nomor NTA anggota
  const barcodeValue = settings.barcodeCustomValue?.trim() || nta;

  // Pastikan URL foto yang diupload anggota diproses secara benar
  const memberPhoto = formatDriveImageUrl(member.avatarUrl) || member.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80';

  return (
    <div className="flex flex-col items-center space-y-4 select-none">
      {/* Container Kartu KTA 3D Flip */}
      <div 
        className="w-[340px] sm:w-[380px] h-[215px] sm:h-[240px] perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
          
          {/* SISI DEPAN KTA */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 rounded-2xl p-4 text-white shadow-2xl border border-purple-800/40 backface-hidden flex flex-col justify-between overflow-hidden">
            {/* Latar Belakang Logo Lambang Saka */}
            <div 
              className="absolute inset-0 w-full h-full pointer-events-none z-0 flex items-center justify-center overflow-hidden"
              style={{ opacity: settings.bgOpacity ?? 0.10 }}
            >
              <SakaLogo size={280} />
            </div>

            {/* Header Depan */}
            <div className="flex items-center justify-between z-10 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <SakaLogo size={34} />
                <div>
                  <h4 className="font-extrabold text-[11px] sm:text-xs tracking-wider font-heading leading-tight uppercase text-amber-300">
                    Saka Pariwisata
                  </h4>
                  <p className="text-[8px] sm:text-[9px] text-purple-200 tracking-wider uppercase font-semibold">
                    Gerakan Pramuka Indonesia
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[8px] font-black rounded-full uppercase tracking-widest">
                  KTA DIGITAL
                </span>
              </div>
            </div>

            {/* Konten Tengah Depan (Pas Foto Asli + Data Anggota + QR Code) */}
            <div className="grid grid-cols-12 gap-3 items-center z-10 my-auto">
              {/* Pas Foto yang diupload pengguna */}
              <div className="col-span-3 flex flex-col items-center">
                <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-800">
                  <img 
                    src={memberPhoto} 
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Data Diri Anggota */}
              <div className="col-span-6 space-y-1 truncate pr-1">
                <h3 className="font-extrabold text-xs sm:text-sm text-white truncate font-heading">
                  {member.fullName}
                </h3>
                <p className="font-mono text-[9px] sm:text-[10px] text-amber-300 font-bold truncate">
                  NTA: {nta}
                </p>
                <div className="text-[8.5px] sm:text-[9.5px] text-slate-300 space-y-0.5">
                  <p className="truncate font-semibold text-emerald-400">{member.krida}</p>
                  <p className="truncate">{member.gugusDepan || 'Gugus Depan'}</p>
                  <p className="truncate text-slate-400">Kwarcab {member.regencyName}</p>
                </div>
              </div>

              {/* QR Code Khusus Anggota */}
              <div className="col-span-3 flex justify-end">
                <KtaQrCode 
                  member={member} 
                  size={54} 
                  showLabel={true}
                  interactive={false}
                />
              </div>
            </div>

            {/* Footer Depan */}
            <div className="flex items-center justify-between text-[8px] text-purple-300/80 z-10 pt-1.5 border-t border-white/10 font-mono">
              <span>{settings.frontValidityText || 'Masa Berlaku: Selama Menjadi Anggota'}</span>
              <span className="text-amber-300 flex items-center gap-1">
                <RotateCw className="w-2.5 h-2.5" /> Putar Kartu
              </span>
            </div>
          </div>

          {/* SISI BELAKANG KTA */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 rounded-2xl p-4 text-white shadow-2xl border border-purple-900/50 backface-hidden rotate-y-180 flex flex-col justify-between overflow-hidden">
            
            {/* Ketentuan Resmi KTA */}
            <div className="space-y-1 text-[7.5px] sm:text-[8px] text-slate-300 leading-tight">
              <p className="font-bold text-amber-300 uppercase tracking-wider text-[8px]">
                Ketentuan KTA Digital Saka Pariwisata:
              </p>
              <ol className="list-decimal pl-3 space-y-0.5 text-slate-400">
                <li>Kartu ini merupakan tanda pengenal sah anggota Satuan Karya Pramuka Pariwisata.</li>
                <li>Keaslian data dapat diverifikasi langsung melalui pemindaian QR Code di bagian depan.</li>
                <li>Anggota wajib menjunjung tinggi Tri Satya, Dasa Darma, dan Sapta Pesona Pariwisata.</li>
                <li>Apabila kartu ini ditemukan, harap diserahkan ke Sekretariat Kwartir terdekat.</li>
              </ol>
            </div>

            {/* Bagian Bawah: Penandatanganan & Barcode */}
            <div className="flex items-end justify-between pt-2 border-t border-white/10">
              <div className="space-y-1">
                <span className="text-[7.5px] text-slate-400 font-mono">ID Anggota: {member.id}</span>
                <p className="text-[7px] text-slate-500">Terdaftar sejak: {new Date(member.registeredAt).toLocaleDateString('id-ID')}</p>
                <div className="inline-flex items-center gap-1 text-[7.5px] text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Sistem Otorisasi KTA Nasional</span>
                </div>
              </div>

              {/* Tanggal, Barcode, dan Tanda Tangan */}
              <div className="flex flex-col items-center text-center">
                <p className="text-[8px] text-amber-200 font-semibold mb-0.5">
                  {settings.issueLocationDate || 'Jakarta, 14 Agustus 2026'}
                </p>

                {/* Komponen Barcode */}
                <div className="bg-white px-2 py-0.5 rounded shadow-xs">
                  <Barcode 
                    value={barcodeValue} 
                    width={100} 
                    height={22} 
                    barColor="#000000"
                    showText={false}
                  />
                </div>

                <p className="text-[8px] font-bold text-white mt-0.5 font-heading">
                  {settings.signerName || 'Reza Pahlevi'}
                </p>
                <p className="text-[6.5px] text-purple-300">
                  {settings.signerTitle || 'Ketua Pimpinan Saka Pariwisata Nasional'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Kontrol Cepat Di Bawah Kartu */}
      {showControls && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-300" />
            <span>Lihat {isFlipped ? 'Bagian Depan' : 'Bagian Belakang'}</span>
          </button>

          {onPrintPdf && (
            <button
              type="button"
              onClick={() => onPrintPdf(member)}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Cetak / Unduh PDF</span>
            </button>
          )}

          {allowAdminEdit && onEditCard && (
            <button
              type="button"
              onClick={onEditCard}
              className="px-3 py-1.5 bg-purple-800 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-300" />
              <span>Atur Desain</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
