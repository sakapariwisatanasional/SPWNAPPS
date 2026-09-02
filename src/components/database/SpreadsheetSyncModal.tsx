import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  FileSpreadsheet, 
  Code2, 
  Download, 
  UploadCloud,
  ShieldCheck,
  Sparkles,
  Link2,
  HelpCircle,
  Zap,
  Info,
  FolderOpen
} from 'lucide-react';
import { spreadsheetService, DEFAULT_SPREADSHEET_ID, DEFAULT_SPREADSHEET_URL, SpreadsheetConfig } from '../../services/spreadsheetService';
import { storage } from '../../services/storage';

interface SpreadsheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpreadsheetSyncModal: React.FC<SpreadsheetSyncModalProps> = ({
  isOpen,
  onClose
}) => {
  const [config, setConfig] = useState<SpreadsheetConfig>(spreadsheetService.getConfig());
  const [scriptUrlInput, setScriptUrlInput] = useState(config.scriptUrl || '');
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState(config.spreadsheetId || DEFAULT_SPREADSHEET_ID);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isSettingUpDrive, setIsSettingUpDrive] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'setup' | 'guide' | 'export'>('status');

  useEffect(() => {
    if (isOpen) {
      const cfg = spreadsheetService.getConfig();
      setConfig(cfg);
      setScriptUrlInput(cfg.scriptUrl || '');
      setSpreadsheetIdInput(cfg.spreadsheetId || DEFAULT_SPREADSHEET_ID);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const membersCount = storage.getMembers().length;
  const toursCount = storage.getTourPackages().length;
  const culinaryCount = storage.getCulinarySouvenirs().length;
  const activitiesCount = storage.getActivities().length;

  const isScriptConnected = Boolean(config.scriptUrl && config.scriptUrl.startsWith('http'));

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncResult(null);

    // Save ID if changed
    spreadsheetService.saveConfig({
      spreadsheetId: spreadsheetIdInput.trim() || DEFAULT_SPREADSHEET_ID,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetIdInput.trim() || DEFAULT_SPREADSHEET_ID}/edit?usp=sharing`,
      scriptUrl: scriptUrlInput.trim()
    });

    const result = await spreadsheetService.syncFromSpreadsheet();
    setIsSyncing(false);
    setSyncResult({
      success: result.success,
      message: result.message
    });
    setConfig(spreadsheetService.getConfig());
  };

  const handleSetupDrive = async () => {
    if (!scriptUrlInput.trim() && !config.scriptUrl) {
      alert('Silakan pasang Google Apps Script Web App URL di tab "Pengaturan API" terlebih dahulu.');
      setActiveTab('setup');
      return;
    }

    setIsSettingUpDrive(true);
    setSyncResult(null);

    // Save updated scriptUrl first
    if (scriptUrlInput.trim()) {
      spreadsheetService.saveConfig({
        scriptUrl: scriptUrlInput.trim()
      });
    }

    const res = await spreadsheetService.setupDriveFolders();
    setIsSettingUpDrive(false);
    
    const targetScriptUrl = scriptUrlInput.trim() || config.scriptUrl;
    const directUrl = res.directActionUrl || (targetScriptUrl ? `${targetScriptUrl}?action=SETUP_DRIVE_FOLDERS` : '');

    setSyncResult({
      success: res.success,
      message: res.success 
        ? 'Perintah inisialisasi telah dikirim ke Google Apps Script. Jika folder belum langsung muncul, silakan klik tombol "Buka & Jalankan di Tab Baru" di bawah atau jalankan fungsi inisialisasiFolderGoogleDrive di Apps Script.'
        : res.message
    });

    if (directUrl && window) {
      // Buka tab baru untuk memastikan eksekusi jika no-cors tertahan
      try {
        window.open(directUrl, '_blank');
      } catch (e) {
        // Pop-up mungkin terblokir, tombol manual sudah disediakan
      }
    }
  };

  const handlePushAllToSheets = async () => {
    setIsPushing(true);
    setSyncResult(null);

    // Save updated scriptUrl first
    if (scriptUrlInput.trim()) {
      spreadsheetService.saveConfig({
        scriptUrl: scriptUrlInput.trim()
      });
    }

    const result = await spreadsheetService.pushAllDataToSpreadsheet();
    setIsPushing(false);
    setSyncResult({
      success: result.success,
      message: result.message
    });
    setConfig(spreadsheetService.getConfig());
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = spreadsheetService.saveConfig({
      spreadsheetId: spreadsheetIdInput.trim() || DEFAULT_SPREADSHEET_ID,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetIdInput.trim() || DEFAULT_SPREADSHEET_ID}/edit?usp=sharing`,
      scriptUrl: scriptUrlInput.trim()
    });
    setConfig(updated);
    alert('Pengaturan database Google Spreadsheet & Web App URL berhasil disimpan.');
  };

  const handleCopyScript = () => {
    const code = spreadsheetService.getGoogleAppsScriptTemplate();
    navigator.clipboard.writeText(code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadCsv = () => {
    const members = storage.getMembers();
    const headers = ['ID', 'Nomor Anggota', 'Nama Lengkap', 'NIK', 'Email', 'No WA', 'Provinsi', 'Kabupaten/Kota', 'Kecamatan/Kwarran', 'Gudep', 'Krida', 'Status', 'Tanggal Daftar', 'Foto URL'];
    const rows = members.map(m => [
      m.id,
      m.nationalMemberNumber || '',
      `"${m.fullName}"`,
      m.nikMasked,
      m.email,
      m.phone,
      `"${m.provinceName}"`,
      `"${m.regencyName}"`,
      `"${m.branchName}"`,
      `"${m.gugusDepan}"`,
      `"${m.krida || ''}"`,
      m.status,
      m.registeredAt,
      m.avatarUrl
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Database_Saka_Pariwisata_Anggota_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 overflow-hidden">
        
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-purple-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
            <FileSpreadsheet className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <span>Database Google Spreadsheet & Drive</span>
              <span className={`px-2 py-0.5 text-[10px] rounded-md font-bold border ${
                isScriptConnected
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}>
                {isScriptConnected ? '⚡ Web App Aktif (Bisa Menulis)' : '⚠️ Mode Baca / Perlu URL Web App'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Sinkronisasi data anggota, paket wisata, kuliner/kriya, agenda kegiatan, dan berkas foto dengan Google Spreadsheet & Google Drive
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'status' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Status & Sinkronisasi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'setup' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pengaturan API
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'guide' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📖 Panduan Deploy (Kenapa Belum Berubah?)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'export' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ekspor CSV
          </button>
        </div>

        {/* TAB 1: STATUS & SYNC */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {/* Connected Sheet Card */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Google Spreadsheet Master Terhubung</span>
                </div>
                <a
                  href={config.spreadsheetUrl || DEFAULT_SPREADSHEET_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                >
                  <span>Buka di Google Sheets</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded-xl border border-emerald-100 break-all select-all">
                ID Spreadsheet: {config.spreadsheetId || DEFAULT_SPREADSHEET_ID}
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Anggota</p>
                  <p className="text-base font-extrabold text-slate-900 font-heading">{membersCount}</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Paket Wisata</p>
                  <p className="text-base font-extrabold text-slate-900 font-heading">{toursCount}</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Kuliner/Karya</p>
                  <p className="text-base font-extrabold text-slate-900 font-heading">{culinaryCount}</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Agenda Event</p>
                  <p className="text-base font-extrabold text-slate-900 font-heading">{activitiesCount}</p>
                </div>
              </div>
            </div>

            {/* Auto-Save & Auto-Refresh Real-Time Status Banner & Frequency Selector */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${config.autoSync !== false ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                      <span>Auto-Refresh & Auto-Save Real-Time</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold ${config.autoSync !== false ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'}`}>
                        {config.autoSync !== false ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                      {config.autoSync !== false 
                        ? 'Data dari Google Spreadsheet & Google Drive otomatis diperbarui di layar pengguna, dan setiap input admin langsung disinkronkan.'
                        : 'Pembaruan otomatis nonaktif. Data hanya diperbarui saat tombol refresh manual diklik.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const updated = spreadsheetService.saveConfig({
                      autoSync: !(config.autoSync !== false)
                    });
                    setConfig(updated);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 border ${
                    config.autoSync !== false
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  {config.autoSync !== false ? 'Aktif' : 'Aktifkan'}
                </button>
              </div>

              {/* Interval Selector */}
              {config.autoSync !== false && (
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Frekuensi Auto-Refresh:</span>
                  <div className="flex gap-1.5">
                    {[5, 10, 30, 60].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          const updated = spreadsheetService.saveConfig({
                            autoRefreshIntervalSeconds: sec
                          });
                          spreadsheetService.startLiveSyncEngine(sec * 1000);
                          setConfig(updated);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                          (config.autoRefreshIntervalSeconds || 6) === sec
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-emerald-100/50 border-slate-200'
                        }`}
                      >
                        {sec} detik
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Google Drive Folder Card */}
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Google Drive Repositori Media Terhubung</span>
                </div>
                <a
                  href="https://drive.google.com/drive/folders/16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 underline"
                >
                  <span>Buka di Google Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-xs text-purple-900 font-mono bg-white p-2.5 rounded-xl border border-purple-100 break-all select-all flex items-center justify-between">
                <span>Folder ID: 16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">5 Subfolder</span>
              </div>
            </div>

            {/* Warning if scriptUrl is not set */}
            {!isScriptConnected && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Penulisan Otomatis Belum Terhubung</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Data baru tersimpan di browser lokal. Agar perubahan dapat ditulis langsung ke Google Spreadsheet & Google Drive, silakan pasang kode Apps Script di tab <strong>"Pengaturan API"</strong> atau baca tab <strong>"Panduan Deploy"</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Sync Feedback Message */}
            {syncResult && (
              <div className={`p-3.5 rounded-xl text-xs space-y-2 border ${
                syncResult.success 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-start gap-2">
                  {syncResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 leading-relaxed">
                    <p className="font-semibold">{syncResult.message}</p>
                  </div>
                </div>

                {config.scriptUrl && (
                  <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center gap-2">
                    <a
                      href={config.scriptUrl.includes('?') ? `${config.scriptUrl}&action=SETUP_DRIVE_FOLDERS` : `${config.scriptUrl}?action=SETUP_DRIVE_FOLDERS`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Buka Eksekusi Drive di Tab Baru</span>
                    </a>
                    <a
                      href="https://drive.google.com/drive/folders/16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors"
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>Periksa Folder Google Drive</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Quick 1-Click Apps Script Tip */}
            <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 text-xs text-purple-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <span>Tips Tercepat & Pasti Berhasil (1-Klik di Apps Script):</span>
              </div>
              <p className="text-[11px] text-purple-900 leading-relaxed">
                Di editor Apps Script spreadsheet Anda, di samping tombol Debug terdapat menu dropdown fungsi. Pilih fungsi <strong><code>inisialisasiFolderGoogleDrive</code></strong>, lalu klik tombol <strong>▶ Jalankan (Run)</strong>. Seluruh 5 subfolder dan file status akan langsung terbuat dalam 2 detik!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handlePushAllToSheets}
                disabled={isPushing}
                className="py-3 px-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
                <span>{isPushing ? 'Menyinkronkan Data & Foto...' : 'Kirim Data & Foto ke Spreadsheet & Drive'}</span>
              </button>

              <button
                type="button"
                onClick={handleSetupDrive}
                disabled={isSettingUpDrive}
                className="py-3 px-3 bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSettingUpDrive ? 'animate-spin' : ''}`} />
                <span>{isSettingUpDrive ? 'Membuat Struktur Folder...' : 'Inisialisasi Folder di Google Drive'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Tarik Data Terbaru dari Sheets</span>
              </button>
            </div>

            {config.lastSyncedAt && !isNaN(new Date(config.lastSyncedAt).getTime()) && (
              <p className="text-[11px] text-slate-400 text-center">
                Terakhir disinkronkan: {new Date(config.lastSyncedAt).toLocaleString('id-ID')}
              </p>
            )}
          </div>
        )}

        {/* TAB 2: SETUP & GOOGLE APPS SCRIPT */}
        {activeTab === 'setup' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Spreadsheet ID (Google Sheets)
                </label>
                <input
                  type="text"
                  value={spreadsheetIdInput}
                  onChange={(e) => setSpreadsheetIdInput(e.target.value)}
                  placeholder="ID Spreadsheet Google"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Apps Script Web App URL (Wajib untuk Penulisan Otomatis)
                </label>
                <input
                  type="url"
                  value={scriptUrlInput}
                  onChange={(e) => setScriptUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Salin URL Web App yang berakhiran <code>/exec</code> setelah men-deploy skrip di bawah dengan izin "Who has access: Anyone".
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </form>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-purple-700" />
                  <span>Kode Google Apps Script Master (Multi-Sheet & Drive):</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3 text-purple-700" />
                  <span>{copiedScript ? 'Tersalin!' : 'Salin Kode Script'}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[10px] font-mono overflow-x-auto max-h-48 custom-scrollbar">
                {spreadsheetService.getGoogleAppsScriptTemplate()}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: PANDUAN DEPLOY LENGKAP */}
        {activeTab === 'guide' && (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar text-xs">
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl space-y-2 text-purple-950">
              <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-700" />
                <span>Kenapa Folder Google Drive Belum Muncul?</span>
              </h4>
              <p className="text-xs text-purple-900 leading-relaxed">
                Di Google Apps Script, jika Anda hanya menyalin kode dan menekan tombol Save <strong>tanpa melakukan "New Deployment" atau tanpa menjalankan fungsi inisialisasi</strong>, Google Drive belum terhubung.
              </p>
              <p className="text-xs text-purple-900 leading-relaxed font-semibold">
                Berikut 2 cara mudah agar folder langsung muncul dan aktif:
              </p>
            </div>

            {/* METODE 1: 1-KLIK DI APPS SCRIPT */}
            <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-700 text-white font-black text-[10px] rounded">CARA 1 (TERCEPAT)</span>
                <h4 className="font-bold text-slate-900 text-xs">1-Klik Jalankan Fungsi Inisialisasi di Apps Script</h4>
              </div>
              <p className="text-[11px] text-slate-600">
                Cara ini langsung membuat 5 subfolder dan file status di Google Drive dalam 2 detik:
              </p>
              <ol className="list-decimal list-inside text-[11px] text-slate-700 space-y-1.5 ml-1">
                <li>Buka editor Google Apps Script di tab browser Anda.</li>
                <li>Di toolbar atas (di samping tombol <em>Debug</em>), klik menu dropdown fungsi yang saat ini terpilih.</li>
                <li>Pilih fungsi: <strong><code>jalankanTesKoneksiLengkap</code></strong> atau <strong><code>inisialisasiFolderGoogleDrive</code></strong> (jangan pilih <em>syncSheetData</em> karena fungsi tersebut dijalankan otomatis oleh sistem).</li>
                <li>Klik tombol <strong>▶ Jalankan (Run)</strong>.</li>
                <li>Jika diminta izin (<em>Authorization required</em>): Klik <em>Review permissions</em> &gt; Pilih akun Google &gt; <em>Advanced</em> &gt; <em>Go to Saka Pariwisata API (unsafe)</em> &gt; <em>Allow</em>.</li>
                <li><strong>Selesai!</strong> Di log eksekusi akan tertulis bahwa seluruh koneksi Google Drive & Spreadsheet berhasil, dan 5 subfolder langsung aktif di Google Drive!</li>
              </ol>
            </div>

            {/* METODE 2: DEPLOY WEB APP */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-700 text-white font-black text-[10px] rounded">CARA 2 (WEB APP DEPLOYMENT)</span>
                <h4 className="font-bold text-slate-900 text-xs">Deploy Web App untuk Penulisan Otomatis</h4>
              </div>
              <p className="text-[11px] text-slate-600">
                Lakukan ini agar setiap ada anggota baru mendaftar di web, datanya otomatis tersimpan ke Google Sheets & Google Drive:
              </p>
              <ol className="list-decimal list-inside text-[11px] text-slate-700 space-y-1.5 ml-1">
                <li>Di Apps Script, klik tombol biru <strong>Deploy (Terapkan)</strong> di kanan atas &gt; pilih <strong>New deployment (Penerapan baru)</strong>.</li>
                <li>Pilih jenis (ikon roda gigi): <strong>Web app (Aplikasi Web)</strong>.</li>
                <li>Konfigurasi wajib:
                  <div className="my-1 p-2 bg-white rounded border border-slate-200 text-[10px] font-mono text-slate-800 space-y-0.5">
                    <p>• Execute as: <strong>Me (Saya)</strong></p>
                    <p>• Who has access: <strong className="text-red-600">Anyone (Siapa saja)</strong></p>
                  </div>
                </li>
                <li>Klik <strong>Deploy</strong>, lalu salin <strong>Web App URL</strong> (berakhiran <code>/exec</code>).</li>
                <li>Tempelkan ke tab <strong>"Pengaturan API"</strong> di aplikasi ini &gt; klik <strong>Simpan Pengaturan</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 4: EXPORT CSV */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-900">Cadangkan Data ke File CSV / Excel</h4>
              <p className="text-xs text-slate-500">
                Unduh seluruh data anggota terdaftar untuk diimpor secara langsung ke Google Spreadsheet atau arsip Kwartir Nasional.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh CSV Data Anggota Lengkap ({membersCount} Data)</span>
            </button>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

