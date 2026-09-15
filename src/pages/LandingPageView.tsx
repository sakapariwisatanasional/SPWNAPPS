import React, { useEffect, useState } from 'react';
import { X, Image as ImageIcon, UploadCloud, Save, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { LandingPageSettings } from '../../types';
import { DEFAULT_LANDING_PAGE_SETTINGS, spreadsheetService } from '../../services/spreadsheetService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (settings: LandingPageSettings) => void;
}

export const LandingPageSettingsModal: React.FC<Props> = ({ isOpen, onClose, onSaved }) => {
  const [settings, setSettings] = useState<LandingPageSettings>(DEFAULT_LANDING_PAGE_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setResult(null);
    setSettings(DEFAULT_LANDING_PAGE_SETTINGS);
    void spreadsheetService.refreshLandingPageSettings().then(remote => {
      if (remote) setSettings({ ...DEFAULT_LANDING_PAGE_SETTINGS, ...remote });
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const update = <K extends keyof LandingPageSettings>(key: K, value: LandingPageSettings[K]) =>
    setSettings(current => ({ ...current, [key]: value }));

  const handleUpload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setResult({ success: false, message: 'File harus berupa gambar.' }); return; }
    if (file.size > 4 * 1024 * 1024) { setResult({ success: false, message: 'Ukuran gambar maksimal 4 MB.' }); return; }
    setUploading(true); setResult(null);
    const ext = file.name.split('.').pop() || 'jpg';
    const upload = await spreadsheetService.uploadImageToDrive(file, `landing-hero-${Date.now()}.${ext}`, 'LANDING_HERO');
    setUploading(false);
    if (!upload.success || !upload.url) { setResult({ success: false, message: upload.message }); return; }
    update('heroImageUrl', upload.url);
    setResult({ success: true, message: 'Gambar berhasil diunggah. Klik Simpan & Publikasikan untuk menjadikannya aktif.' });
  };

  const handleSave = async () => {
    setSaving(true); setResult(null);
    const res = await spreadsheetService.saveLandingPageSettings(settings);
    setSaving(false);
    setResult({ success: res.success, message: res.message });
    if (res.success && res.settings) {
      setSettings(res.settings);
      onSaved?.(res.settings);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-5">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[2rem] bg-white shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 sm:px-7 py-4 bg-white/95 backdrop-blur border-b border-slate-200">
          <div><h2 className="text-lg sm:text-xl font-black text-slate-900">Pengaturan Landing Page</h2><p className="text-xs text-slate-500 mt-1">Kelola gambar dan konten Hero tanpa mengubah source code.</p></div>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-5 p-5 sm:p-7">
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 font-black text-slate-800"><ImageIcon className="w-5 h-5 text-violet-600" /> Gambar Hero</div>
              <div className="mt-4 aspect-[16/8] rounded-2xl overflow-hidden bg-slate-100 relative">
                <img src={settings.heroImageUrl || DEFAULT_LANDING_PAGE_SETTINGS.heroImageUrl} alt="Preview Hero" className="w-full h-full object-cover" style={{ objectPosition: `${settings.heroImagePosition} ${settings.heroImageY}`, opacity: settings.heroImageOpacity }} />
                {settings.heroOverlayEnabled && <div className="absolute inset-0 pointer-events-none" style={{ opacity: settings.heroOverlayOpacity, background: 'linear-gradient(115deg, rgba(70,34,169,.92), rgba(123,44,191,.68), rgba(217,38,169,.42))' }} />}
                <div className="absolute inset-x-4 bottom-4 text-white"><div className="text-[9px] uppercase tracking-widest font-black">{settings.heroBadge}</div><div className="mt-1 text-xl sm:text-3xl font-black whitespace-pre-line leading-[.95]">{settings.heroTitle}</div></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-violet-600 text-white text-xs font-black cursor-pointer hover:bg-violet-500">
                  <UploadCloud className="w-4 h-4" /> {uploading ? 'Mengunggah...' : 'Upload Gambar'}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={e => { void handleUpload(e.target.files?.[0]); e.currentTarget.value = ''; }} />
                </label>
                <button type="button" onClick={() => update('heroImageUrl', DEFAULT_LANDING_PAGE_SETTINGS.heroImageUrl)} className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"><RotateCcw className="w-4 h-4 inline mr-1" /> Gunakan Default</button>
              </div>
              <label className="block mt-4 text-[11px] font-bold text-slate-500">URL gambar (opsional)</label>
              <input value={settings.heroImageUrl} onChange={e => update('heroImageUrl', e.target.value)} className="mt-1 w-full h-11 rounded-2xl border border-slate-200 px-3 text-sm outline-none focus:ring-4 focus:ring-violet-100" />

              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <label className="text-xs font-bold text-slate-600">Posisi horizontal<select value={settings.heroImagePosition} onChange={e => update('heroImagePosition', e.target.value as LandingPageSettings['heroImagePosition'])} className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 font-medium"><option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option></select></label>
                <label className="text-xs font-bold text-slate-600">Posisi vertikal<select value={settings.heroImageY} onChange={e => update('heroImageY', e.target.value as LandingPageSettings['heroImageY'])} className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3 font-medium"><option value="top">Atas</option><option value="center">Tengah</option><option value="bottom">Bawah</option></select></label>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <label className="text-xs font-bold text-slate-600">Kekuatan gambar <input type="range" min="0" max="1" step="0.01" value={settings.heroImageOpacity} onChange={e => update('heroImageOpacity', Number(e.target.value))} className="w-full mt-2" /><span className="text-[10px] text-slate-400">{Math.round(settings.heroImageOpacity * 100)}%</span></label>
                <label className="text-xs font-bold text-slate-600">Kekuatan overlay <input type="range" min="0" max="1" step="0.01" value={settings.heroOverlayOpacity} onChange={e => update('heroOverlayOpacity', Number(e.target.value))} className="w-full mt-2" /><span className="text-[10px] text-slate-400">{Math.round(settings.heroOverlayOpacity * 100)}%</span></label>
              </div>
              <label className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-slate-700"><input type="checkbox" checked={settings.heroOverlayEnabled} onChange={e => update('heroOverlayEnabled', e.target.checked)} /> Aktifkan overlay gradasi agar teks tetap terbaca</label>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 p-4 sm:p-5">
              <div className="font-black text-slate-800">Konten Hero</div>
              <div className="space-y-3 mt-4">
                <label className="block text-xs font-bold text-slate-600">Badge<input value={settings.heroBadge} onChange={e => update('heroBadge', e.target.value)} className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3" /></label>
                <label className="block text-xs font-bold text-slate-600">Judul<textarea value={settings.heroTitle} onChange={e => update('heroTitle', e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 resize-none" /><span className="text-[10px] text-slate-400">Gunakan baris baru untuk memecah judul.</span></label>
                <label className="block text-xs font-bold text-slate-600">Deskripsi<textarea value={settings.heroDescription} onChange={e => update('heroDescription', e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 resize-none" /></label>
                <label className="block text-xs font-bold text-slate-600">Tombol utama<input value={settings.heroPrimaryText} onChange={e => update('heroPrimaryText', e.target.value)} className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3" /></label>
                <label className="block text-xs font-bold text-slate-600">Tombol verifikasi<input value={settings.heroSecondaryText} onChange={e => update('heroSecondaryText', e.target.value)} className="mt-1 w-full h-10 rounded-xl border border-slate-200 px-3" /></label>
              </div>
            </div>

            {result && <div className={`rounded-2xl px-4 py-3 text-xs font-bold flex gap-2 ${result.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>{result.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}{result.message}</div>}

            <button type="button" disabled={saving || uploading} onClick={() => void handleSave()} className="w-full h-12 rounded-2xl bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2"><Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan & Publikasikan'}</button>
            <p className="text-[10px] text-slate-400 leading-relaxed">Pengaturan yang disimpan menjadi konfigurasi pusat. Landing Page publik mengambilnya dari Google Spreadsheet melalui Google Apps Script. Jika koneksi pusat sedang bermasalah, aplikasi memakai konfigurasi terakhir yang tersimpan di perangkat sebagai fallback.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPageSettingsModal;
