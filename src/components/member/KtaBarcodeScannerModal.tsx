import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  ScanLine, 
  Camera, 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck,
  SwitchCamera
} from 'lucide-react';
import { Member } from '../../types';
import { verifyMemberUniversal, normalizeNtaQuery, VerificationResult } from '../../services/ktaVerificationService';

interface KtaBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (member: Member, result: VerificationResult) => void;
  localMembers?: Member[];
}

export const KtaBarcodeScannerModal: React.FC<KtaBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  localMembers
}) => {
  const [activeTab, setActiveTab] = useState<'CAMERA' | 'FILE'>('CAMERA');
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerElementId = 'kta-barcode-html5-reader';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      setErrorMsg(null);
      setScannedResult(null);
      return;
    }

    if (activeTab === 'CAMERA') {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isOpen, activeTab, cameraFacing]);

  const startScanner = async () => {
    setErrorMsg(null);
    setScanning(true);

    try {
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(readerElementId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A
        ],
        verbose: false
      });
      scannerRef.current = html5QrCode;

      const qrConfig = {
        fps: 15,
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.33
      };

      await html5QrCode.start(
        { facingMode: cameraFacing },
        qrConfig,
        (decodedText) => {
          handleDecodedData(decodedText);
        },
        () => {
          // Scanning frames in progress...
        }
      );
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setScanning(false);
      setErrorMsg(
        err.message?.includes('NotAllowedError') || err.message?.includes('Permission')
          ? 'Izin akses kamera ditolak. Silakan izinkan akses kamera di browser Anda atau gunakan opsi "Upload Foto KTA".'
          : 'Tidak dapat mengaktifkan kamera perangkat. Silakan coba tombol "Upload Foto KTA" di bawah.'
      );
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleDecodedData = async (decodedText: string) => {
    if (!decodedText || isVerifying) return;

    // Hentikan pemindaian kamera agar tidak duplicate trigger
    stopScanner();
    setScannedResult(decodedText);
    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const result = await verifyMemberUniversal(decodedText, localMembers);
      setIsVerifying(false);

      if (result.found && result.member) {
        onScanSuccess(result.member, result);
        onClose();
      } else {
        const parsed = normalizeNtaQuery(decodedText);
        setErrorMsg(
          `Hasil scan: "${parsed.cleanQuery || decodedText}". ${
            result.message || 'Nomor Anggota tidak ditemukan di database lokal maupun Google Spreadsheet.'
          }`
        );
      }
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMsg(err.message || 'Terjadi kesalahan saat memvalidasi data KTA.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsVerifying(true);

    try {
      const html5QrCode = new Html5Qrcode('file-scanner-dummy', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13
        ],
        verbose: false
      });

      const decodedText = await html5QrCode.scanFile(file, true);
      await html5QrCode.clear();

      await handleDecodedData(decodedText);
    } catch (err: any) {
      setIsVerifying(false);
      setErrorMsg('Tidak dapat mendeteksi Barcode atau QR Code dari gambar yang diunggah. Pastikan gambar jelas dan tidak buram.');
    }
  };

  const toggleCamera = () => {
    setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/40 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-800/40 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/20 border border-purple-400/40 rounded-xl text-purple-300">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Pindai Barcode / QR Code KTA
              </h3>
              <p className="text-[11px] text-purple-200/70">
                Arahkan kamera ke Barcode 1D atau QR Code pada Kartu Anggota
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('CAMERA')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'CAMERA'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Kamera Langsung</span>
          </button>
          <button
            onClick={() => {
              stopScanner();
              setActiveTab('FILE');
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'FILE'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Foto KTA</span>
          </button>
        </div>

        {/* Body Container */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'CAMERA' && (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-purple-500/50 aspect-4/3 flex items-center justify-center shadow-inner">
                {/* HTML5 QR Code Container */}
                <div id={readerElementId} className="w-full h-full" />

                {/* Aiming Reticle Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-40 border-2 border-dashed border-emerald-400 rounded-xl bg-emerald-500/5 flex flex-col items-center justify-between p-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <div className="w-full flex justify-between">
                      <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 -mt-1 -ml-1" />
                      <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 -mt-1 -mr-1" />
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                      Posisikan Barcode / QR di Kotak Ini
                    </span>
                    <div className="w-full flex justify-between">
                      <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 -mb-1 -ml-1" />
                      <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 -mb-1 -mr-1" />
                    </div>
                  </div>
                </div>

                {isVerifying && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2 p-4 text-center">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                    <p className="font-bold text-sm text-purple-200">
                      Memverifikasi Data KTA...
                    </p>
                    <p className="text-xs text-slate-400">
                      Mengecek kecocokan di database nasional & Google Spreadsheet
                    </p>
                  </div>
                )}
              </div>

              {/* Camera Switcher Controls */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={toggleCamera}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ganti Kamera ({cameraFacing === 'environment' ? 'Belakang' : 'Depan'})</span>
                </button>

                <button
                  onClick={startScanner}
                  className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-900 text-purple-200 border border-purple-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ulangi Pindai</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'FILE' && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-purple-500/50 hover:border-purple-400 rounded-2xl bg-purple-950/20 hover:bg-purple-950/40 text-center cursor-pointer transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">
                    Pilih Foto KTA dari Galeri / File
                  </p>
                  <p className="text-xs text-purple-200/70 mt-1">
                    Mendukung format JPG, PNG, atau tangkapan layar KTA digital
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Pilih Berkas Foto
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              <div id="file-scanner-dummy" className="hidden" />
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-2xl text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{errorMsg}</p>
                <p className="text-[11px] text-rose-300/80">
                  Tip: Pastikan nomor anggota/barcode terlihat jelas atau masukkan nomor anggota secara manual pada kolom verifikasi.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Verifikasi Real-Time Satuan Karya Pariwisata</span>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
