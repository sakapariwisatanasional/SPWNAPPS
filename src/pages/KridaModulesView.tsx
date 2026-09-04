import React, { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, Image as ImageIcon, Link as LinkIcon, Save, Sparkles } from 'lucide-react';
import { CurrentUser, KridaId, KridaModuleItem } from '../types';
import { KRIDA_CATEGORIES } from '../data/kridaData';
import { storage } from '../services/storage';

interface KridaModulesViewProps {
  currentUser: CurrentUser;
}

type KridaVisualConfig = {
  imageUrl: string;
  downloadUrl: string;
};

const CONFIG_KEY = 'spwn_krida_visual_config_v1';

const DEFAULT_CONFIG: Record<string, KridaVisualConfig> = {};

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
    // Keep the page usable even if browser storage is unavailable.
  }
};

export const KridaModulesView: React.FC<KridaModulesViewProps> = ({ currentUser }) => {
  const [modules, setModules] = useState<KridaModuleItem[]>(() => storage.getKridaModules());
  const [config, setConfig] = useState<Record<string, KridaVisualConfig>>(readConfig);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<KridaVisualConfig>({ imageUrl: '', downloadUrl: '' });

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => setModules(storage.getKridaModules()));
    return () => unsubscribe();
  }, []);

  const cards = useMemo(() => {
    return KRIDA_CATEGORIES.map((category) => {
      const categoryModules = modules.filter(m => m.kridaId === category.id);
      const first = categoryModules[0];
      const configured = config[category.id];

      const fallbackImage = first?.images?.find(i => i.url)?.url || '';
      const fallbackDownload = first?.downloads?.find(d => d.fileUrl)?.fileUrl || '';

      return {
        category,
        imageUrl: configured?.imageUrl?.trim() || fallbackImage,
        downloadUrl: configured?.downloadUrl?.trim() || fallbackDownload,
        moduleCount: categoryModules.length,
      };
    });
  }, [modules, config]);

  const startEdit = (id: string) => {
    const card = cards.find(c => c.category.id === id);
    const current = config[id] || {
      imageUrl: card?.imageUrl || '',
      downloadUrl: card?.downloadUrl || '',
    };
    setEditingId(id);
    setDraft({ imageUrl: current.imageUrl, downloadUrl: current.downloadUrl });
  };

  const saveEdit = (id: string) => {
    const next = {
      ...config,
      [id]: {
        imageUrl: draft.imageUrl.trim(),
        downloadUrl: draft.downloadUrl.trim(),
      },
    };
    setConfig(next);
    writeConfig(next);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-100/60 blur-3xl pointer-events-none" />
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold text-purple-700">
                <Sparkles className="h-3.5 w-3.5" />
                PUSAT MODUL SAKA PARIWISATA
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                4 Krida Saka Pariwisata
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Pilih krida untuk melihat sampul materi dan mengunduh modul pembelajaran. Tampilan ini menggantikan tampilan naskah/draft lama.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-600">
              <b className="text-slate-900">{cards.length}</b> Krida tersedia
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(({ category, imageUrl, downloadUrl, moduleCount }) => {
          const isEditing = editingId === category.id;
          return (
            <article key={category.id} className="group overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={`Sampul ${category.name}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.removeAttribute('hidden');
                    }}
                  />
                ) : null}
                <div hidden={!!imageUrl} className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="h-10 w-10 mb-2" />
                  <span className="text-xs font-semibold">Image URL belum diisi</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent pointer-events-none" />
                <div className="absolute left-4 bottom-4 rounded-full bg-white/90 backdrop-blur px-3 py-1 text-[10px] font-extrabold text-purple-700">
                  {moduleCount} MATERI
                </div>
              </div>

              <div className="p-5">
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">{category.name}</h2>
                <p className="mt-1 text-xs font-semibold text-purple-600">{category.subtitle}</p>
                <p className="mt-3 text-xs leading-5 text-slate-600 line-clamp-4">{category.description}</p>

                <div className="mt-5 grid grid-cols-1 gap-2">
                  {downloadUrl ? (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-4 py-2.5 text-xs font-extrabold text-white transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      DOWNLOAD MODUL
                    </a>
                  ) : (
                    <button disabled className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-400 cursor-not-allowed">
                      <Download className="h-4 w-4" />
                      LINK DOWNLOAD BELUM TERSEDIA
                    </button>
                  )}

                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      BUKA LINK
                    </a>
                  )}
                </div>

                {isSuperAdmin && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    {!isEditing ? (
                      <button onClick={() => startEdit(category.id)} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-2.5 text-xs font-extrabold text-amber-800">
                        <LinkIcon className="h-4 w-4" />
                        ATUR IMAGE & DOWNLOAD URL
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block mb-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Image URL</label>
                          <input value={draft.imageUrl} onChange={e => setDraft(v => ({ ...v, imageUrl: e.target.value }))} placeholder="https://.../cover.jpg" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-300" />
                        </div>
                        <div>
                          <label className="block mb-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Download URL</label>
                          <input value={draft.downloadUrl} onChange={e => setDraft(v => ({ ...v, downloadUrl: e.target.value }))} placeholder="https://.../modul.pdf" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-purple-300" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(category.id)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-extrabold text-white"><Save className="h-3.5 w-3.5" /> SIMPAN</button>
                          <button onClick={() => setEditingId(null)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">BATAL</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
        <b>Catatan:</b> Image URL dan Download URL disimpan pada konfigurasi katalog Krida tersendiri di browser, sehingga perubahan ini tidak mengubah data anggota, login, sinkronisasi, atau modul sistem lainnya.
      </div>
    </div>
  );
};
