import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  ChevronDown,
  Compass,
  Image as ImageIcon,
  Megaphone,
  Save,
  Settings2,
  Sparkles,
  Utensils,
  X,
  CalendarDays,
} from 'lucide-react';
import { CurrentUser, KridaId, KridaModuleItem } from '../types';
import { KRIDA_CATEGORIES } from '../data/kridaData';
import { storage } from '../services/storage';
import { KridaExplorerModal } from '../components/krida/KridaExplorerModal';

interface KridaModulesViewProps {
  currentUser: CurrentUser;
}

type KridaVisualConfig = {
  imageUrl: string;
  downloadUrl: string;
};

const CONFIG_KEY = 'spwn_krida_visual_config_v1';

const readConfig = (): Record<string, KridaVisualConfig> => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeConfig = (config: Record<string, KridaVisualConfig>) => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch {
    // Browser storage can be unavailable; keep the UI usable.
  }
};

const KRIDA_ICONS: Record<KridaId, React.ComponentType<{ className?: string }>> = {
  pemandu: Compass,
  penyuluh: Megaphone,
  mice: CalendarDays,
  kuliner: Utensils,
};

export const KridaModulesView: React.FC<KridaModulesViewProps> = ({ currentUser }) => {
  const [modules, setModules] = useState<KridaModuleItem[]>(() => storage.getKridaModules());
  const [config, setConfig] = useState<Record<string, KridaVisualConfig>>(readConfig);
  const [openKrida, setOpenKrida] = useState<KridaId | null>(null);
  const [settingsKrida, setSettingsKrida] = useState<KridaId | null>(null);
  const [explorerKrida, setExplorerKrida] = useState<KridaId>('pemandu');
  const [explorerModule, setExplorerModule] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState<KridaVisualConfig>({ imageUrl: '', downloadUrl: '' });

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => setModules(storage.getKridaModules()));
    return () => unsubscribe();
  }, []);

  const cards = useMemo(() => {
    return KRIDA_CATEGORIES.map((category) => {
      const categoryModules = modules.filter((m) => m.kridaId === category.id);
      const first = categoryModules[0];
      const configured = config[category.id];
      const fallbackImage = first?.images?.find((i) => i.url)?.url || '';
      const fallbackDownload = first?.downloads?.find((d) => d.fileUrl)?.fileUrl || '';
      return {
        category,
        modules: categoryModules,
        imageUrl: configured?.imageUrl?.trim() || fallbackImage,
        downloadUrl: configured?.downloadUrl?.trim() || fallbackDownload,
      };
    });
  }, [modules, config]);

  const openExplorer = (kridaId: KridaId, moduleId?: string) => {
    setExplorerKrida(kridaId);
    setExplorerModule(moduleId);
  };

  const openSettings = (kridaId: KridaId) => {
    const card = cards.find((item) => item.category.id === kridaId);
    setDraft({
      imageUrl: config[kridaId]?.imageUrl || card?.imageUrl || '',
      downloadUrl: config[kridaId]?.downloadUrl || card?.downloadUrl || '',
    });
    setSettingsKrida(kridaId);
    setOpenKrida(null);
  };

  const saveSettings = () => {
    if (!settingsKrida) return;
    const next = {
      ...config,
      [settingsKrida]: {
        imageUrl: draft.imageUrl.trim(),
        downloadUrl: draft.downloadUrl.trim(),
      },
    };
    setConfig(next);
    writeConfig(next);
    setSettingsKrida(null);
  };

  return (
    <div className="h-full min-h-0 flex flex-col gap-5 overflow-hidden">
      <header className="shrink-0 flex items-center justify-between gap-4 px-1">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-[0.18em] text-purple-700 uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Pusat Krida & SKK
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Pilih Krida
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Pilih salah satu dari 4 Krida untuk membuka mata krida, naskah/materi, dan instrumen uji SKK.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-3 py-2 text-xs text-slate-500 shadow-sm">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span><b className="text-slate-900">{modules.length}</b> mata krida</span>
        </div>
      </header>

      <main className="min-h-0 flex-1 grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {cards.map(({ category, modules: categoryModules, imageUrl }) => {
          const Icon = KRIDA_ICONS[category.id];
          const expanded = openKrida === category.id;

          return (
            <section
              key={category.id}
              className={`relative min-h-0 rounded-3xl border bg-white shadow-sm transition-all ${expanded ? 'border-purple-300 shadow-lg shadow-purple-100/60' : 'border-slate-200 hover:border-purple-200 hover:shadow-md'}`}
            >
              <button
                type="button"
                onClick={() => setOpenKrida(expanded ? null : category.id)}
                className="w-full h-full min-h-[220px] sm:min-h-[270px] flex flex-col items-center justify-center p-4 sm:p-6 text-center cursor-pointer"
                aria-expanded={expanded}
              >
                <span className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] bg-gradient-to-br ${category.color} flex items-center justify-center text-white shadow-lg ring-4 ring-white`}>
                  <Icon className="w-8 h-8 sm:w-9 sm:h-9" />
                  {imageUrl && (
                    <span className="absolute -right-1 -bottom-1 w-7 h-7 rounded-full bg-white text-purple-700 border border-slate-200 flex items-center justify-center shadow-sm">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </span>
                  )}
                </span>
                <h2 className="mt-4 text-sm sm:text-base font-extrabold text-slate-900 leading-tight">{category.shortTitle}</h2>
                <p className="mt-1 text-[10px] sm:text-xs font-semibold text-slate-500 line-clamp-2">{category.subtitle}</p>
                <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200 px-3 py-1.5 text-[10px] font-extrabold text-slate-600">
                  <Award className="w-3 h-3 text-purple-600" />
                  {category.topicsCount} Mata Krida
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </span>
              </button>

              {expanded && (
                <div className="absolute z-20 left-2 right-2 bottom-2 sm:left-3 sm:right-3 sm:bottom-3 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-xl shadow-2xl p-2 max-h-[min(62vh,430px)] overflow-y-auto">
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-1">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Mata Krida</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{category.name}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {isSuperAdmin && (
                        <button type="button" onClick={() => openSettings(category.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-700" title="Pengaturan gambar & link">
                          <Settings2 className="w-4 h-4" />
                        </button>
                      )}
                      <button type="button" onClick={() => setOpenKrida(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400" title="Tutup">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {categoryModules.length === 0 ? (
                    <div className="px-3 py-5 text-center text-xs text-slate-400">Belum ada mata krida.</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1.5">
                      {categoryModules.map((mod, index) => (
                        <button
                          type="button"
                          key={mod.id}
                          onClick={() => openExplorer(category.id, mod.id)}
                          className="min-w-0 rounded-xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 px-2 py-2 text-left group transition-all"
                          title={`${mod.code} — ${mod.title}`}
                        >
                          <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${category.color} text-white flex items-center justify-center shadow-sm`}>
                            <BookOpen className="w-3.5 h-3.5" />
                          </span>
                          <span className="mt-1.5 block text-[9px] font-black text-purple-600">{mod.code}</span>
                          <span className="mt-0.5 block text-[10px] leading-4 font-extrabold text-slate-800 line-clamp-2">{mod.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </main>

      {settingsKrida && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4" onMouseDown={() => setSettingsKrida(null)}>
          <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-200 shadow-2xl p-5" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600">Super Admin</p>
                <h3 className="text-base font-extrabold text-slate-900">Pengaturan Krida</h3>
              </div>
              <button type="button" onClick={() => setSettingsKrida(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="block mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Image URL</span>
                <input value={draft.imageUrl} onChange={(e) => setDraft((v) => ({ ...v, imageUrl: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-200" placeholder="https://..." />
              </label>
              <label className="block">
                <span className="block mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Download Modul / PDF URL</span>
                <input value={draft.downloadUrl} onChange={(e) => setDraft((v) => ({ ...v, downloadUrl: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-purple-200" placeholder="https://..." />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSettingsKrida(null)} className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500" title="Batal"><X className="w-4 h-4" /></button>
              <button type="button" onClick={saveSettings} className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-sm" title="Simpan"><Save className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}

      <KridaExplorerModal
        isOpen={!!explorerModule}
        onClose={() => setExplorerModule(undefined)}
        modules={modules}
        initialKridaId={explorerKrida}
        initialModuleId={explorerModule}
        onOpenEditor={() => undefined}
      />
    </div>
  );
};
