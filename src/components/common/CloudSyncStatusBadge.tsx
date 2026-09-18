import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Cloud,
  CloudCheck,
  Database,
  ExternalLink,
  FolderOpen,
  RefreshCw,
} from 'lucide-react';
import { spreadsheetService } from '../../services/spreadsheetService';
import { storage } from '../../services/storage';
import { GOOGLE_DRIVE_MAIN_FOLDER } from '../../services/driveRepository';

interface CloudSyncStatusBadgeProps {
  className?: string;
  variant?: 'badge' | 'button' | 'compact' | 'full';
  showDetailsOnClick?: boolean;
}

type FeedbackType = 'success' | 'warning' | 'error';

interface SyncFeedback {
  type: FeedbackType;
  message: string;
}

export const CloudSyncStatusBadge: React.FC<
  CloudSyncStatusBadgeProps
> = ({
  className = '',
  variant = 'badge',
  showDetailsOnClick = true,
}) => {
  const [syncState, setSyncState] = useState(
    spreadsheetService.getSyncState()
  );

  const [config, setConfig] = useState(
    spreadsheetService.getConfig()
  );

  const [isManualSyncing, setIsManualSyncing] =
    useState(false);

  const [showDropdown, setShowDropdown] = useState(false);

  const [syncFeedback, setSyncFeedback] =
    useState<SyncFeedback | null>(null);

  useEffect(() => {
    const unsubscribe =
      spreadsheetService.subscribeSyncState(() => {
        setSyncState(
          spreadsheetService.getSyncState()
        );

        setConfig(
          spreadsheetService.getConfig()
        );
      });

    return unsubscribe;
  }, []);

  /**
   * Close dropdown with Escape.
   */
  useEffect(() => {
    if (!showDropdown) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [showDropdown]);

  /**
   * Clear temporary feedback after a few seconds.
   */
  useEffect(() => {
    if (!syncFeedback) return;

    const timer = window.setTimeout(() => {
      setSyncFeedback(null);
    }, 4500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [syncFeedback]);

  const hasScript = Boolean(
    config.scriptUrl &&
      config.scriptUrl.trim().length > 0
  );

  const isSaving =
    syncState.isSaving || isManualSyncing;

  const memberCount = storage.getMembers().length;

  const productCount =
    storage.getTourPackages().length +
    storage.getCulinarySouvenirs().length;

  /**
   * Manual full sync.
   */
  const handleManualSave = async (
    event?: React.MouseEvent
  ) => {
    event?.stopPropagation();

    if (isSaving) return;

    setIsManualSyncing(true);

    setSyncFeedback({
      type: 'warning',
      message:
        'Menyimpan seluruh data ke Google Spreadsheet & Drive...',
    });

    try {
      const result =
        await spreadsheetService.pushAllDataToSpreadsheet();

      if (result.success) {
        setSyncFeedback({
          type: 'success',
          message:
            result.message ||
            'Seluruh data berhasil disimpan.',
        });
      } else {
        setSyncFeedback({
          type: 'warning',
          message:
            result.message ||
            'Data belum seluruhnya berhasil disimpan.',
        });
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan data.';

      setSyncFeedback({
        type: 'error',
        message: `Gagal: ${message}`,
      });
    } finally {
      setIsManualSyncing(false);
    }
  };

  const handleToggleDropdown = () => {
    if (!showDetailsOnClick) return;

    setShowDropdown((current) => !current);
  };

  const getFeedbackClasses = () => {
    if (!syncFeedback) return '';

    if (syncFeedback.type === 'success') {
      return 'border-emerald-800 bg-emerald-950 text-emerald-100';
    }

    if (syncFeedback.type === 'error') {
      return 'border-rose-800 bg-rose-950 text-rose-100';
    }

    return 'border-amber-800 bg-amber-950 text-amber-100';
  };

  const getFeedbackIcon = () => {
    if (!syncFeedback) return null;

    if (syncFeedback.type === 'success') {
      return (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
      );
    }

    if (syncFeedback.type === 'error') {
      return (
        <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
      );
    }

    return (
      <RefreshCw className="w-3.5 h-3.5 shrink-0 text-amber-400" />
    );
  };

  /**
   * BUTTON VARIANT
   */
  if (variant === 'button') {
    return (
      <div
        className={`relative inline-block ${className}`}
      >
        <button
          type="button"
          onClick={handleManualSave}
          disabled={isSaving}
          aria-busy={isSaving}
          title={
            hasScript
              ? 'Simpan dan sinkronkan semua data sekarang'
              : 'Hubungkan Web App URL di Pengaturan untuk sinkronisasi cloud'
          }
          className={`
            inline-flex items-center justify-center gap-2
            min-h-9 px-3.5 py-2
            rounded-xl border
            text-xs font-bold
            transition-colors
            disabled:cursor-wait disabled:opacity-70
            ${
              isSaving
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : hasScript
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
            }
          `}
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
              ? 'Menyimpan...'
              : hasScript
                ? 'Simpan ke Cloud'
                : 'Tersimpan Lokal'}
          </span>
        </button>

        {syncFeedback && (
          <div
            role="status"
            aria-live="polite"
            className={`
              absolute right-0 top-full mt-2
              z-[60] w-[min(360px,calc(100vw-2rem))]
              rounded-xl border px-3 py-2.5
              shadow-xl
              animate-in fade-in slide-in-from-top-1
              ${getFeedbackClasses()}
            `}
          >
            <div className="flex items-start gap-2">
              {getFeedbackIcon()}

              <span className="text-[11px] leading-relaxed">
                {syncFeedback.message}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  /**
   * COMPACT VARIANT
   */
  if (variant === 'compact') {
    return (
      <div
        className={`relative inline-block ${className}`}
      >
        <button
          type="button"
          onClick={handleToggleDropdown}
          disabled={!showDetailsOnClick}
          aria-label={
            hasScript
              ? 'Status sinkronisasi cloud aktif'
              : 'Data tersimpan secara lokal'
          }
          aria-expanded={
            showDetailsOnClick
              ? showDropdown
              : undefined
          }
          className={`
            inline-flex items-center gap-2
            min-h-8 px-2.5 py-1.5
            rounded-lg border
            text-[11px] font-semibold
            transition-colors
            disabled:cursor-default
            ${
              isSaving
                ? 'bg-purple-50 text-purple-800 border-purple-200'
                : hasScript
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }
          `}
        >
          {isSaving ? (
            <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" />
          ) : hasScript ? (
            <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Cloud className="w-3.5 h-3.5 text-amber-600" />
          )}

          <span>
            {isSaving
              ? 'Menyimpan'
              : hasScript
                ? 'Cloud Aktif'
                : 'Lokal'}
          </span>
        </button>

        {showDropdown &&
          showDetailsOnClick &&
          renderDropdown()}
      </div>
    );
  }

  /**
   * DEFAULT / BADGE / FULL
   */
  function renderDropdown() {
    return (
      <>
        <button
          type="button"
          aria-label="Tutup detail sinkronisasi"
          className="fixed inset-0 z-40 cursor-default"
          onClick={() => setShowDropdown(false)}
        />

        <div
          role="dialog"
          aria-label="Detail status sinkronisasi"
          className="
            absolute right-0 top-full mt-2
            z-50
            w-[min(340px,calc(100vw-2rem))]
            rounded-2xl
            bg-white
            border border-slate-200
            shadow-2xl
            p-4
            text-left
            animate-in fade-in slide-in-from-top-2
          "
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`
                  p-2 rounded-xl shrink-0
                  ${
                    hasScript
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }
                `}
              >
                {hasScript ? (
                  <CloudCheck className="w-4 h-4" />
                ) : (
                  <Cloud className="w-4 h-4" />
                )}
              </div>

              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-slate-900">
                  Status Sinkronisasi
                </h4>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Google Spreadsheet & Drive
                </p>
              </div>
            </div>

            <span
              className={`
                shrink-0
                px-2 py-1
                rounded-full
                text-[9px]
                font-extrabold
                uppercase
                tracking-wide
                ${
                  hasScript
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }
              `}
            >
              {hasScript ? 'Terhubung' : 'Lokal'}
            </span>
          </div>

          {/* Current state */}
          <div className="mt-3">
            <div
              className={`
                flex items-start gap-2.5
                p-3
                rounded-xl
                border
                ${
                  isSaving
                    ? 'bg-purple-50 border-purple-100'
                    : hasScript
                      ? 'bg-emerald-50 border-emerald-100'
                      : 'bg-amber-50 border-amber-100'
                }
              `}
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 shrink-0 text-purple-600 animate-spin" />
              ) : hasScript ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              )}

              <div className="min-w-0">
                <p
                  className={`
                    text-[11px] font-bold
                    ${
                      isSaving
                        ? 'text-purple-900'
                        : hasScript
                          ? 'text-emerald-900'
                          : 'text-amber-900'
                    }
                  `}
                >
                  {isSaving
                    ? 'Sedang menyimpan data'
                    : hasScript
                      ? 'Sinkronisasi cloud aktif'
                      : 'Data tersimpan lokal'}
                </p>

                <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500">
                  {isSaving
                    ? 'Perubahan sedang dikirim ke layanan cloud.'
                    : hasScript
                      ? syncState.lastSavedTime
                        ? `Terakhir tersimpan ${syncState.lastSavedTime}.`
                        : 'Data siap disinkronkan ke cloud.'
                      : 'Hubungkan Web App URL untuk mengaktifkan sinkronisasi cloud.'}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mt-3 space-y-2.5">
            <div className="flex items-center justify-between gap-4 text-[11px]">
              <span className="text-slate-500">
                Auto-Save
              </span>

              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3 h-3" />
                Aktif
              </span>
            </div>

            {syncState.lastSavedAction && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                  Aksi terakhir
                </p>

                <p className="mt-1 text-[11px] leading-relaxed font-medium text-slate-700">
                  {syncState.lastSavedAction}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Database className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-wide">
                    Anggota
                  </span>
                </div>

                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  {memberCount}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <FolderOpen className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-wide">
                    Wisata & Produk
                  </span>
                </div>

                <p className="mt-1 text-sm font-extrabold text-slate-900">
                  {productCount}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {syncFeedback && (
            <div
              role="status"
              aria-live="polite"
              className={`
                mt-3
                rounded-xl
                border
                p-2.5
                ${getFeedbackClasses()}
              `}
            >
              <div className="flex items-start gap-2">
                {getFeedbackIcon()}

                <span className="text-[10px] leading-relaxed">
                  {syncFeedback.message}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={handleManualSave}
              disabled={isSaving}
              aria-busy={isSaving}
              className="
                w-full
                min-h-10
                flex items-center justify-center gap-2
                px-3
                rounded-xl
                bg-purple-900
                hover:bg-purple-950
                text-white
                text-xs
                font-bold
                transition-colors
                disabled:opacity-50
                disabled:cursor-wait
              "
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isSaving ? 'animate-spin' : ''
                }`}
              />

              <span>
                {isSaving
                  ? 'Sedang Menyimpan...'
                  : 'Simpan Semua Data Sekarang'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={
                  config.spreadsheetUrl ||
                  `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="
                  min-h-9
                  flex items-center justify-center gap-1.5
                  px-2.5
                  rounded-xl
                  bg-slate-100
                  hover:bg-slate-200
                  text-slate-700
                  text-[10px]
                  font-bold
                  transition-colors
                "
              >
                <Database className="w-3 h-3 text-emerald-600" />
                <span>Spreadsheet</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </a>

              <a
                href={GOOGLE_DRIVE_MAIN_FOLDER.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  min-h-9
                  flex items-center justify-center gap-1.5
                  px-2.5
                  rounded-xl
                  bg-slate-100
                  hover:bg-slate-200
                  text-slate-700
                  text-[10px]
                  font-bold
                  transition-colors
                "
              >
                <FolderOpen className="w-3 h-3 text-blue-600" />
                <span>Google Drive</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={`relative inline-block ${className}`}
    >
      <button
        type="button"
        onClick={handleToggleDropdown}
        disabled={!showDetailsOnClick}
        aria-label="Lihat status sinkronisasi cloud"
        aria-expanded={
          showDetailsOnClick
            ? showDropdown
            : undefined
        }
        className={`
          inline-flex items-center gap-2
          min-h-8
          px-3 py-1.5
          rounded-full
          border
          text-xs
          transition-colors
          disabled:cursor-default
          ${
            isSaving
              ? 'bg-purple-50 text-purple-800 border-purple-200'
              : hasScript
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }
        `}
      >
        <span className="relative flex items-center justify-center shrink-0">
          {isSaving ? (
            <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" />
          ) : hasScript ? (
            <>
              <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-30 animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
            </>
          ) : (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </span>

        <span className="font-semibold text-[10px] sm:text-[11px]">
          {isSaving
            ? 'Menyimpan...'
            : hasScript
              ? 'Auto-Save Aktif'
              : 'Tersimpan Lokal'}
        </span>

        {hasScript &&
          syncState.lastSavedTime && (
            <span className="hidden md:inline text-[9px] font-normal text-emerald-700/70">
              · {syncState.lastSavedTime}
            </span>
          )}

        {showDetailsOnClick && (
          <ChevronDown
            className={`
              w-3 h-3
              text-slate-400
              transition-transform
              ${showDropdown ? 'rotate-180' : ''}
            `}
          />
        )}
      </button>

      {showDropdown &&
        showDetailsOnClick &&
        renderDropdown()}
    </div>
  );
};

export default CloudSyncStatusBadge;
