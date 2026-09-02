import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileDown, 
  CreditCard, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  RotateCw, 
  Info,
  Sparkles,
  Scissors,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { Member, KtaCardSettings } from '../../types';
import { storage } from '../../services/storage';
import { 
  CR80_WIDTH_MM, 
  CR80_HEIGHT_MM, 
  downloadKtaPdfFile, 
  KtaPdfFormat 
} from '../../services/ktaPdfGenerator';
import { DigitalMemberCard } from './DigitalMemberCard';

interface KtaPrintPdfModalProps {
  isOpen: boolean;
  member: Member | null;
  settings?: KtaCardSettings;
  onClose: () => void;
  onOpenEditCard?: () => void;
}

export const KtaPrintPdfModal: React.FC<KtaPrintPdfModalProps> = ({
  isOpen,
  member,
  settings: propSettings,
  onClose,
  onOpenEditCard
}) => {
  const [selectedFormat, setSelectedFormat] = useState<KtaPdfFormat>('CR80_STANDARD');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !member) return null;

  const currentSettings = propSettings || storage.getKtaSettings();

  const handleDownloadPdf = async (formatToDownload: KtaPdfFormat = selectedFormat) => {
    setIsGenerating(true);
    setDownloadSuccess(false);
    setProgressStep('Mempersiapkan render KTA...');

    try {
      await downloadKtaPdfFile(member, currentSettings, formatToDownload, (step) => {
        setProgressStep(step);
      });
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Terjadi kendala saat membuat file PDF. Silakan coba lagi.');
    } finally {
      setIsGenerating(false);
      setProgressStep('');
    }
  };

  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base font-heading">Cetak & Ekspor KTA ke PDF</h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold rounded-full">
                  ISO/IEC 7810 ID-1 Standard
                </span>
              </div>
              <p className="text-xs text-purple-200/80">
                Konversi otomatis Kartu Tanda Anggota {member.fullName} ke format cetak standar global
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Interactive Card Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Pratinjau KTA 3D
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full font-bold">
                  {CR80_WIDTH_MM} × {CR80_HEIGHT_MM} mm
                </span>
              </div>

              {/* Digital Member Card */}
              <div className="flex justify-center p-2 bg-slate-50 rounded-2xl border border-slate-200">
                <DigitalMemberCard
                  member={member}
                  previewSettings={currentSettings}
                  showControls={false}
                />
              </div>

              {/* Dimension Specs Pill */}
              <div className="p-3 bg-purple-50/70 border border-purple-200/60 rounded-2xl text-xs space-y-1 text-purple-950">
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span>Standar Dimensi Global:</span>
                  <span className="font-mono text-purple-800">ISO/IEC 7810 ID-1 (CR80)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-900/80 pt-1 border-t border-purple-200/40">
                  <div>• Panjang: <strong>85.60 mm</strong></div>
                  <div>• Lebar: <strong>53.98 mm</strong></div>
                  <div>• Radius Sudut: <strong>3.18 mm</strong></div>
                  <div>• Resolusi: <strong>300+ DPI Crisp</strong></div>
                </div>
              </div>

              {onOpenEditCard && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEditCard();
                  }}
                  className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-purple-700" />
                  <span>Kustomisasi Tampilan & Desain KTA</span>
                </button>
              )}
            </div>

            {/* Right Column: PDF Format Selection & Export Options (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Pilih Format Cetak PDF
                </h4>
                <span className="text-[11px] text-slate-400">Siap Cetak & Potong</span>
              </div>

              {/* Format Card 1: CR80 Direct Card */}
              <div
                onClick={() => setSelectedFormat('CR80_STANDARD')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedFormat === 'CR80_STANDARD'
                    ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-600/20 shadow-sm'
                    : 'border-slate-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    selectedFormat === 'CR80_STANDARD' ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm text-slate-900 font-heading">
                        Format Kartu CR80 Standar Global (2 Halaman)
                      </h5>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-bold rounded-full">
                        85.6 × 54 mm
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Format ukuran pas kartu PVC standar internasional. Halaman 1 memuat sisi depan dan Halaman 2 memuat sisi belakang.
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-purple-900 font-medium">
                      <span>✓ Mesin Cetak PVC (Fargo/Zebra/Evolis)</span>
                      <span>✓ Digital Wallet</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Format Card 2: A4 Ready to Print Sheet */}
              <div
                onClick={() => setSelectedFormat('A4_PRINT_SHEET')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  selectedFormat === 'A4_PRINT_SHEET'
                    ? 'border-purple-600 bg-purple-50/40 ring-2 ring-purple-600/20 shadow-sm'
                    : 'border-slate-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    selectedFormat === 'A4_PRINT_SHEET' ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-sm text-slate-900 font-heading">
                        Lembar Cetak Dokumen A4 (Siap Potong & Lipat)
                      </h5>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-bold rounded-full">
                        210 × 297 mm
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Memuat sisi depan & belakang bersisian dan model lipat vertikal, dilengkapi <strong>garis potong (crop marks)</strong> dan <strong>garis lipat</strong> untuk printer kertas/glossy biasa lalu dilaminasi.
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-blue-900 font-medium">
                      <span className="flex items-center gap-1"><Scissors className="w-3.5 h-3.5" /> Garis Potong Presisi</span>
                      <span>✓ Printer Kertas Biasa / Photo Paper</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Printing Tips Box */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                  <Info className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span>Petunjuk Penting Percetakan KTA:</span>
                </div>
                <ul className="text-[11px] text-amber-800/90 space-y-1 list-disc list-inside">
                  <li>Saat mencetak PDF, pilih skala <strong>"Actual Size" / 100%</strong> (bukan Fit to Page).</li>
                  <li>Untuk hasil terbaik, gunakan kertas <em>PVC Card</em> atau <em>Photo Paper Glossy 230-260 gsm</em>.</li>
                  <li>QR Code dan Barcode telah di-render dengan resolusi 300+ DPI agar terbaca cepat oleh scanner.</li>
                </ul>
              </div>

              {/* Progress / Status banner */}
              {isGenerating && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center gap-3 text-purple-900 text-xs font-semibold animate-pulse">
                  <RotateCw className="w-4 h-4 animate-spin text-purple-700 flex-shrink-0" />
                  <span>{progressStep || 'Membuat file PDF KTA standar global...'}</span>
                </div>
              )}

              {downloadSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-900 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>File PDF KTA berhasil dikonversi dan diunduh ke perangkat Anda!</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Dokumen PDF dilengkapi QR Code Verifikasi Online & Barcode Resmi.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDirectPrint}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Cetak Cepat</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadPdf(selectedFormat)}
              disabled={isGenerating}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-purple-900 hover:bg-purple-950 active:bg-purple-900 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Mengonversi PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Berhasil Diunduh!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Unduh PDF KTA ({selectedFormat === 'CR80_STANDARD' ? 'CR80' : 'Lembar A4'})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
