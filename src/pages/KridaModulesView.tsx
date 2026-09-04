import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Download,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  X,
} from 'lucide-react';
import { CurrentUser, KridaId, KridaModuleItem } from '../types';
import { KRIDA_CATEGORIES } from '../data/kridaData';
import { storage } from '../services/storage';

interface KridaModulesViewProps {
  currentUser: CurrentUser;
}

type EditableKridaModule = KridaModuleItem & {
  coverImageUrl?: string;
  downloadUrl?: string;
};

const getCoverImageUrl = (module: KridaModuleItem) =>
  String((module as EditableKridaModule).coverImageUrl || module.images?.[0]?.url || '').trim();

const getDownloadUrl = (module: KridaModuleItem) =>
  String((module as EditableKridaModule).downloadUrl || module.downloads?.[0]?.fileUrl || '').trim();

const getCategory = (kridaId: KridaId) => KRIDA_CATEGORIES.find((category) => category.id === kridaId);

const makePlaceholder = (module: KridaModuleItem) => {
  const category = getCategory(module.kridaId);
  const label = encodeURIComponent(category?.shortTitle || module.kridaName || 'Saka Pariwisata');
  return `https://placehold.co/1200x675/e9d5ff/581c87?text=${label}`;
};

export const KridaModulesView: React.FC<KridaModulesViewProps> = ({ currentUser }) => {
  const [modules, setModules] = useState<KridaModuleItem[]>(() => storage.getKridaModules());
  const [selectedKrida, setSelectedKrida] = useState<'ALL' | KridaId>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingModule, setEditingModule] = useState<KridaModuleItem | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setModules(storage.getKridaModules());
    });
    return () => unsubscribe();
  }, []);

  const filteredModules = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return modules.filter((module) => {
      const categoryMatch = selectedKrida === 'ALL' || module.kridaId === selectedKrida;
      if (!categoryMatch) return false;
      if (!query) return true;

      return [
        module.title,
        module.code,
        module.kridaName,
        module.description,
      ].some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [modules, searchQuery, selectedKrida]);

  const openEditor = (module: KridaModuleItem) => {
    setEditingModule(module);
    setImageUrl(getCoverImageUrl(module));
    setDownloadUrl(getDownloadUrl(module));
    setSaveMessage('');
  };

  const closeEditor = () => {
    setEditingModule(null);
    setImageUrl('');
    setDownloadUrl('');
    setSaveMessage('');
  };

  const saveLinks = () => {
    if (!editingModule) return;

    const nextImages = [...(editingModule.images || [])];
    if (imageUrl.trim()) {
      const existing = nextImages[0];
      nextImages[0] = existing
        ? { ...existing, url: imageUrl.trim(), caption: existing.caption || editingModule.title }
        : { id: `img-${editingModule.id}`, url: imageUrl.trim(), caption: editingModule.title };
    } else {
      nextImages.shift();
    }

    const nextDownloads = [...(editingModule.downloads || [])];
    if (downloadUrl.trim()) {
      const existing = nextDownloads[0];
      nextDownloads[0] = existing
        ? { ...existing, fileUrl: downloadUrl.trim(), title: existing.title || `${editingModule.title} - Modul` }
        : {
            id: `download-${editingModule.id}`,
            title: `${editingModule.title} - Modul`,
            fileUrl: downloadUrl.trim(),
            fileType: 'PDF',
            fileSize: '',
          };
    } else {
      nextDownloads.shift();
    }

    const updated: KridaModuleItem = {
      ...editingModule,
      images: nextImages,
      downloads: nextDownloads,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name || 'Super Admin',
    };

    // Backward-compatible aliases are stored only in the module object.
    // Existing Krida data and all other application storage remain untouched.
    const updatedWithAliases = updated as EditableKridaModule;
    updatedWithAliases.coverImageUrl = imageUrl.trim();
    updatedWithAliases.downloadUrl = downloadUrl.trim();

    storage.updateKridaModule(updatedWithAliases, currentUser.name);
    setModules(storage.getKridaModules());
    setSaveMessage('Tautan berhasil disimpan.');
  };

  return (
    <div className="space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-purple-100/60 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
              <BookOpen className="h-3.5 w-3.5" />
              Katalog Modul Krida Saka Pariwisata
            </div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Modul Krida & Materi Pembelajaran
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Akses materi melalui gambar sampul dan tautan unduhan resmi. Tampilan ini menggantikan tampilan draft/naskah lama tanpa mengubah sistem anggota, autentikasi, atau sinkronisasi aplikasi.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari modul atau krida..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10"
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KRIDA_CATEGORIES.map((category) => {
          const count = modules.filter((module) => module.kridaId === category.id).length;
          const active = selectedKrida === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedKrida(active ? 'ALL' : category.id)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                active
                  ? 'border-purple-300 bg-purple-50 ring-2 ring-purple-400/20'
                  : 'border-slate-200 bg-white hover:border-purple-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs font-bold text-slate-800">{category.shortTitle}</span>
                <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-bold text-purple-700 shadow-2xs">
                  {count}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-slate-500">{category.subtitle}</p>
            </button>
          );
        })}
      </section>

      <section className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Katalog Modul</h2>
          <p className="text-xs text-slate-500">{filteredModules.length} modul ditampilkan</p>
        </div>
        {isSuperAdmin && (
          <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800">
            Super Admin · Kelola Image URL & Download URL
          </span>
        )}
      </section>

      {filteredModules.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">Modul tidak ditemukan.</p>
          <p className="mt-1 text-xs text-slate-400">Coba ubah pencarian atau pilih krida lainnya.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredModules.map((module) => {
            const category = getCategory(module.kridaId);
            const coverUrl = getCoverImageUrl(module) || makePlaceholder(module);
            const moduleDownloadUrl = getDownloadUrl(module);

            return (
              <article
                key={module.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-all hover:-translate-y-0.5 hover:border-purple-300 hover:shadow-lg"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  <img
                    src={coverUrl}
                    alt={`Sampul ${module.title}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                    loading="lazy"
                    onError={(event) => {
                      const image = event.currentTarget;
                      if (image.src !== makePlaceholder(module)) image.src = makePlaceholder(module);
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                    <span className="inline-flex rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-extrabold text-purple-800 backdrop-blur-sm">
                      {category?.shortTitle || module.kridaName}
                    </span>
                  </div>
                  <span className="absolute right-3 top-3 rounded-lg bg-slate-950/75 px-2 py-1 font-mono text-[10px] font-bold text-white backdrop-blur-sm">
                    {module.code}
                  </span>
                </div>

                <div className="flex min-h-[250px] flex-col p-5">
                  <div className="flex-1">
                    <h3 className="text-base font-extrabold leading-snug text-slate-900 transition-colors group-hover:text-purple-700">
                      {module.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">
                      {module.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Sampul Modul
                      </span>
                      {moduleDownloadUrl && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700">
                          <Download className="h-3.5 w-3.5" />
                          Tersedia untuk diunduh
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                    {moduleDownloadUrl ? (
                      <a
                        href={moduleDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-3 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-purple-700"
                      >
                        <Download className="h-4 w-4" />
                        Download Modul
                      </a>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-400"
                      >
                        <LinkIcon className="h-4 w-4" />
                        Link Belum Tersedia
                      </button>
                    )}

                    {moduleDownloadUrl && (
                      <a
                        href={moduleDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Buka modul"
                        title="Buka modul"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}

                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => openEditor(module)}
                        title="Kelola Image URL & Download URL"
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editingModule && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">Super Admin · Katalog Krida</p>
                <h3 className="mt-1 text-lg font-extrabold text-slate-900">{editingModule.title}</h3>
              </div>
              <button type="button" onClick={closeEditor} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">Image URL / URL Sampul</label>
                <div className="flex gap-2">
                  <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                    <ImageIcon className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                    <input
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      placeholder="https://.../cover.jpg"
                      className="w-full bg-transparent py-3 text-xs text-slate-800 outline-none"
                    />
                  </div>
                  {imageUrl && (
                    <img src={imageUrl} alt="Preview" className="h-12 w-20 rounded-xl border border-slate-200 object-cover" />
                  )}
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">Masukkan URL gambar publik. Tidak ada file gambar yang diunggah ke server aplikasi.</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">Download URL / Link Modul</label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
                  <Download className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    value={downloadUrl}
                    onChange={(event) => setDownloadUrl(event.target.value)}
                    placeholder="https://.../modul.pdf"
                    className="w-full bg-transparent py-3 text-xs text-slate-800 outline-none"
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">Link dibuka di tab baru. Bisa berupa URL PDF, Google Drive, atau sumber dokumen resmi lainnya.</p>
              </div>

              {saveMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                  {saveMessage}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button type="button" onClick={closeEditor} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100">
                Tutup
              </button>
              <button type="button" onClick={saveLinks} className="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-purple-700">
                Simpan URL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
