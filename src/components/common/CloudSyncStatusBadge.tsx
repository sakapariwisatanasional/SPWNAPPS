import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  Database,
  FolderOpen,
  Settings,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { spreadsheetService } from '../../services/spreadsheetService';
import { storage } from '../../services/storage';
import { GOOGLE_DRIVE_MAIN_FOLDER } from '../../services/driveRepository';

interface CloudSyncStatusBadgeProps {
  className?: string;
  variant?: 'badge' | 'button' | 'compact' | 'full';
  showDetailsOnClick?: boolean;
}

export const CloudSyncStatusBadge: React.FC<CloudSyncStatusBadgeProps> = ({
  className = '',
  variant = 'badge',
  showDetailsOnClick = true
}) => {
  const [syncState, setSyncState] = useState(spreadsheetService.getSyncState());
  const [config, setConfig] = useState(spreadsheetService.getConfig());
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = spreadsheetService.subscribeSyncState(() => {
      setSyncState(spreadsheetService.getSyncState());
      setConfig(spreadsheetService.getConfig());
    });
    return unsub;
  }, []);

  const handleManualSave = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isManualSyncing) return;

    setIsManualSyncing(true);
    setSyncFeedback('Menyimpan seluruh data ke Google Spreadsheet & Drive...');

    try {
      const res = await spreadsheetService.pushAllDataToSpreadsheet();
      if (res.success) {
        setSyncFeedback('✅ ' + res.message);
      } else {
        setSyncFeedback('⚠️ ' + res.message);
      }
    } catch (err: any) {
      setSyncFeedback('❌ Gagal: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsManualSyncing(false);
      setTimeout(() => {
        setSyncFeedback(null);
      }, 4000);
    }
  };

  const hasScript = Boolean(config.scriptUrl && config.scriptUrl.trim().length > 0);
  const isSaving = syncState.isSaving || isManualSyncing;

  if (variant === 'button') {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleManualSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition-all border ${
            isSaving
              ? 'bg-purple-50 text-purple-700 border-purple-300 animate-pulse cursor-wait'
              : hasScript
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400'
              : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
          } ${className}`}
          title={hasScript ? 'Klik untuk simpan & sinkronkan data ke Spreadsheet & Drive sekarang' : 'Hubungkan Web App URL di Pengaturan'}
        >
          {isSaving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
          ) : hasScript ? (
            <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Cloud className="w-3.5 h-3.5 text-amber-600" />
          )}

          <span>
            {isSaving
              ? 'Menyimpan ke Cloud...'
              : hasScript
              ? 'Simpan ke Spreadsheet & Drive'
              : 'Simpan Lokal'}
          </span>
        </button>

        {syncFeedback && (
          <div className="absolute right-0 top-full mt-1.5 z-50 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-xl border border-slate-800 whitespace-nowrap animate-in fade-in slide-in-from-top-1">
            {syncFeedback}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => showDetailsOnClick && setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
          isSaving
            ? 'bg-purple-100/90 text-purple-900 border-purple-300 animate-pulse'
            : hasScript
            ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100'
            : 'bg-amber-50/90 text-amber-800 border-amber-200/80 hover:bg-amber-100'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {isSaving ? (
            <RefreshCw className="w-3 h-3 text-purple-600 animate-spin" />
          ) : hasScript ? (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
          )}
        </div>

        <span className="font-medium text-[11px] flex items-center gap-1">
          {isSaving ? (
            'Menyimpan otomatis...'
          ) : hasScript ? (
            <>
              <span>Auto-Save Aktif</span>
              {syncState.lastSavedTime && (
                <span className="text-[10px] text-emerald-600/80 font-normal hidden sm:inline">
                  ({syncState.lastSavedTime})
                </span>
              )}
            </>
          ) : (
            'Tersimpan Lokal'
          )}
        </span>

        {showDetailsOnClick && (
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown Menu Details */}
      {showDropdown && showDetailsOnClick && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-left animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${hasScript ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Status Sinkronisasi Cloud</h4>
                  <p className="text-[10px] text-slate-500">Google Spreadsheet & Drive</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hasScript ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {hasScript ? 'Terhubung' : 'Lokal'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 mb-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Auto-Save Otomatis:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Aktif (Setiap Perubahan)
                </span>
              </div>

              {syncState.lastSavedAction && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                  <p className="text-slate-500 font-medium text-[10px] uppercase tracking-wider mb-0.5">Aksi Terakhir:</p>
                  <p className="text-slate-700 font-medium leading-snug">{syncState.lastSavedAction}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Total Anggota:</span>
                <span className="font-bold text-slate-900">{storage.getMembers().length} Anggota</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Paket Wisata & Produk:</span>
                <span className="font-bold text-slate-900">
                  {storage.getTourPackages().length + storage.getCulinarySouvenirs().length} Data
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleManualSave}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                <span>{isSaving ? 'Sedang Menyimpan...' : 'Simpan Semua Data Sekarang'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={config.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold transition-all"
                >
                  <Database className="w-3 h-3 text-emerald-600" />
                  <span>Spreadsheet</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>

                <a
                  href={GOOGLE_DRIVE_MAIN_FOLDER.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-semibold transition-all"
                >
                  <FolderOpen className="w-3 h-3 text-blue-600" />
                  <span>Google Drive</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                </a>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
