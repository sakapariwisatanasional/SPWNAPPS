import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  FileText, 
  Download, 
  Table as TableIcon, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { KridaModuleItem, CurrentUser, CompetencyRow, ModuleImage, ModuleLink, DownloadableResource, CurriculumSession } from '../../types';

interface KridaMaterialEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleItem: KridaModuleItem | null;
  currentUser?: CurrentUser;
  onSave: (updatedItem: KridaModuleItem) => void;
}

export const KridaMaterialEditorModal: React.FC<KridaMaterialEditorModalProps> = ({
  isOpen,
  onClose,
  moduleItem,
  currentUser,
  onSave
}) => {
  if (!isOpen || !moduleItem) return null;

  const [activeSubTab, setActiveSubTab] = useState<'TEXT' | 'IMAGES' | 'TABLE' | 'LINKS' | 'DOWNLOADS' | 'CURRICULUM' | 'TESTS'>('TEXT');
  const [formData, setFormData] = useState<KridaModuleItem>({ ...moduleItem });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Text formatting helpers
  const handleInsertText = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('module-content-textarea') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end) || 'Teks contoh';
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  // Image helpers
  const handleAddImage = () => {
    const newImg: ModuleImage = {
      id: `img-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1000&auto=format&fit=crop&q=80',
      caption: 'Ilustrasi materi pembelajaran baru'
    };
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), newImg]
    }));
  };

  const handleUpdateImage = (idx: number, field: keyof ModuleImage, val: string) => {
    setFormData(prev => {
      const imgs = [...(prev.images || [])];
      imgs[idx] = { ...imgs[idx], [field]: val };
      return { ...prev, images: imgs };
    });
  };

  const handleRemoveImage = (idx: number) => {
    setFormData(prev => {
      const imgs = [...(prev.images || [])];
      imgs.splice(idx, 1);
      return { ...prev, images: imgs };
    });
  };

  // Table helpers
  const handleAddTableRow = () => {
    const newRow: CompetencyRow = {
      code: `PAR.${formData.code.replace(/[()]/g, '').toUpperCase()}.0${((formData.competencyTable?.length || 0) + 1)}.01`,
      element: 'Elemen kompetensi baru',
      indicator: 'Mampu menjelaskan dan mempraktikkan materi sesuai SOP',
      assessment: 'Tes Tertulis & Simulasi Praktik Lapangan'
    };
    setFormData(prev => ({
      ...prev,
      competencyTable: [...(prev.competencyTable || []), newRow]
    }));
  };

  const handleUpdateTableRow = (idx: number, field: keyof CompetencyRow, val: string) => {
    setFormData(prev => {
      const rows = [...(prev.competencyTable || [])];
      rows[idx] = { ...rows[idx], [field]: val };
      return { ...prev, competencyTable: rows };
    });
  };

  const handleRemoveTableRow = (idx: number) => {
    setFormData(prev => {
      const rows = [...(prev.competencyTable || [])];
      rows.splice(idx, 1);
      return { ...prev, competencyTable: rows };
    });
  };

  // Link helpers
  const handleAddLink = () => {
    const newLink: ModuleLink = {
      id: `link-${Date.now()}`,
      title: 'Regulasi Resmi / Panduan Pembelajaran',
      url: 'https://kemenparekraf.go.id',
      type: 'REFERENCE'
    };
    setFormData(prev => ({
      ...prev,
      links: [...(prev.links || []), newLink]
    }));
  };

  const handleUpdateLink = (idx: number, field: keyof ModuleLink, val: string) => {
    setFormData(prev => {
      const links = [...(prev.links || [])];
      links[idx] = { ...links[idx], [field]: val };
      return { ...prev, links };
    });
  };

  const handleRemoveLink = (idx: number) => {
    setFormData(prev => {
      const links = [...(prev.links || [])];
      links.splice(idx, 1);
      return { ...prev, links };
    });
  };

  // Download helpers
  const handleAddDownload = () => {
    const newDl: DownloadableResource = {
      id: `dl-${Date.now()}`,
      title: `Modul Pembelajaran ${formData.title}.pdf`,
      fileUrl: '#',
      fileType: 'PDF',
      fileSize: '2.4 MB'
    };
    setFormData(prev => ({
      ...prev,
      downloads: [...(prev.downloads || []), newDl]
    }));
  };

  const handleUpdateDownload = (idx: number, field: keyof DownloadableResource, val: string) => {
    setFormData(prev => {
      const dls = [...(prev.downloads || [])];
      dls[idx] = { ...dls[idx], [field]: val };
      return { ...prev, downloads: dls };
    });
  };

  const handleRemoveDownload = (idx: number) => {
    setFormData(prev => {
      const dls = [...(prev.downloads || [])];
      dls.splice(idx, 1);
      return { ...prev, downloads: dls };
    });
  };

  // Curriculum helpers
  const handleAddSession = () => {
    const newSession: CurriculumSession = {
      sessionNumber: (formData.curriculum?.length || 0) + 1,
      title: 'Materi Pembelajaran Baru',
      duration: '4 JP (180 Menit)',
      competency: 'Penguasaan konsep dan teknik pelaksanaan di lapangan.',
      method: 'Teori 40% & Praktik 60%'
    };
    setFormData(prev => ({
      ...prev,
      curriculum: [...(prev.curriculum || []), newSession]
    }));
  };

  const handleUpdateSession = (idx: number, field: keyof CurriculumSession, val: any) => {
    setFormData(prev => {
      const sess = [...(prev.curriculum || [])];
      sess[idx] = { ...sess[idx], [field]: val };
      return { ...prev, curriculum: sess };
    });
  };

  const handleRemoveSession = (idx: number) => {
    setFormData(prev => {
      const sess = [...(prev.curriculum || [])];
      sess.splice(idx, 1);
      return { ...prev, curriculum: sess };
    });
  };

  // SKK Tests helpers
  const handleUpdateTestItem = (level: 'purwa' | 'madya' | 'utama', idx: number, val: string) => {
    setFormData(prev => {
      const currentList = [...(prev.testRequirements?.[level] || [])];
      currentList[idx] = val;
      return {
        ...prev,
        testRequirements: {
          purwa: level === 'purwa' ? currentList : (prev.testRequirements?.purwa || []),
          madya: level === 'madya' ? currentList : (prev.testRequirements?.madya || []),
          utama: level === 'utama' ? currentList : (prev.testRequirements?.utama || [])
        }
      };
    });
  };

  const handleAddTestItem = (level: 'purwa' | 'madya' | 'utama') => {
    setFormData(prev => {
      const currentList = [...(prev.testRequirements?.[level] || []), 'Kriteria pengujian kecakapan baru...'];
      return {
        ...prev,
        testRequirements: {
          purwa: level === 'purwa' ? currentList : (prev.testRequirements?.purwa || []),
          madya: level === 'madya' ? currentList : (prev.testRequirements?.madya || []),
          utama: level === 'utama' ? currentList : (prev.testRequirements?.utama || [])
        }
      };
    });
  };

  const handleRemoveTestItem = (level: 'purwa' | 'madya' | 'utama', idx: number) => {
    setFormData(prev => {
      const currentList = [...(prev.testRequirements?.[level] || [])];
      currentList.splice(idx, 1);
      return {
        ...prev,
        testRequirements: {
          purwa: level === 'purwa' ? currentList : (prev.testRequirements?.purwa || []),
          madya: level === 'madya' ? currentList : (prev.testRequirements?.madya || []),
          utama: level === 'utama' ? currentList : (prev.testRequirements?.utama || [])
        }
      };
    });
  };

  // Submit
  const handleSave = () => {
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-slate-950 border border-purple-500/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-800">
                  SUPER ADMIN CMS
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white font-heading">
                  Editor Materi Krida: {formData.code} {formData.title}
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Kelola naskah modul, galeri gambar, tabel kompetensi, tautan referensi, dan berkas unduhan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saveSuccess ? 'Tersimpan!' : 'Simpan Perubahan'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SUB-TABS NAVIGATION */}
        <div className="px-6 py-2.5 border-b border-slate-800/80 bg-slate-900/50 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveSubTab('TEXT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'TEXT'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>1. Naskah & Teks Modul</span>
          </button>

          <button
            onClick={() => setActiveSubTab('IMAGES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'IMAGES'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>2. Galeri Gambar ({formData.images?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('TABLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'TABLE'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>3. Matriks Tabel Kompetensi ({formData.competencyTable?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('LINKS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'LINKS'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>4. Tautan Referensi ({formData.links?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('DOWNLOADS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'DOWNLOADS'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>5. Berkas Download ({formData.downloads?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('CURRICULUM')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'CURRICULUM'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>6. Silabus ({formData.curriculum?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('TESTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'TESTS'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>7. Syarat Uji SKK</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950">
          
          {/* TAB 1: TEXT / NASKAH */}
          {activeSubTab === 'TEXT' && (
            <div className="space-y-4 max-w-4xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Judul Mata Krida
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Kode & Huruf SKK
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Deskripsi Singkat / Ringkasan
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Text formatting bar */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/40">
                <div className="p-2 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                  <span className="text-[11px] font-bold text-slate-400 mr-2">Sisipkan Format:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertText('## ')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-600 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    Judul H2 (##)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertText('### ')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-600 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    Subjudul H3 (###)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertText('**', '**')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-600 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    Tebal (**)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertText('- ')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-600 hover:text-white text-xs cursor-pointer"
                  >
                    Poin Bullet (- )
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertText('1. ')}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-purple-600 hover:text-white text-xs cursor-pointer"
                  >
                    Nomor (1. )
                  </button>
                </div>

                <textarea
                  id="module-content-textarea"
                  rows={16}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-4 bg-slate-950 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none resize-y"
                  placeholder="Ketikkan naskah materi lengkap di sini..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: IMAGES */}
          {activeSubTab === 'IMAGES' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Daftar Foto & Ilustrasi Modul</h3>
                  <p className="text-xs text-slate-400">Sisipkan tautan gambar langsung (Google Drive direct / Unsplash / CDN resmi).</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Gambar</span>
                </button>
              </div>

              <div className="space-y-3">
                {(formData.images || []).map((img, idx) => (
                  <div key={img.id || idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-4 items-start">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                      <img
                        src={img.url}
                        alt={img.caption}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          URL Gambar
                        </label>
                        <input
                          type="text"
                          value={img.url}
                          onChange={(e) => handleUpdateImage(idx, 'url', e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Keterangan / Kepsyen
                        </label>
                        <input
                          type="text"
                          value={img.caption}
                          onChange={(e) => handleUpdateImage(idx, 'caption', e.target.value)}
                          placeholder="Tulis keterangan foto..."
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-400 hover:text-white transition-colors cursor-pointer self-end sm:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {(!formData.images || formData.images.length === 0) && (
                  <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                    Belum ada gambar yang disisipkan. Klik "Tambah Gambar" untuk menambahkan ilustrasi.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TABLE */}
          {activeSubTab === 'TABLE' && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Matriks Standar Kompetensi & Evaluasi</h3>
                  <p className="text-xs text-slate-400">Tabel acuan uji kecakapan unit standar kepariwisataan.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddTableRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris Kompetensi</span>
                </button>
              </div>

              <div className="space-y-3">
                {(formData.competencyTable || []).map((row, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 font-mono">
                        Baris #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTableRow(idx)}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Kode Unit
                        </label>
                        <input
                          type="text"
                          value={row.code}
                          onChange={(e) => handleUpdateTableRow(idx, 'code', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-purple-300 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Elemen Kompetensi
                        </label>
                        <input
                          type="text"
                          value={row.element}
                          onChange={(e) => handleUpdateTableRow(idx, 'element', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Indikator Kinerja
                        </label>
                        <input
                          type="text"
                          value={row.indicator}
                          onChange={(e) => handleUpdateTableRow(idx, 'indicator', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Metode Evaluasi
                        </label>
                        <input
                          type="text"
                          value={row.assessment}
                          onChange={(e) => handleUpdateTableRow(idx, 'assessment', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {(!formData.competencyTable || formData.competencyTable.length === 0) && (
                  <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                    Belum ada baris tabel kompetensi. Klik "Tambah Baris Kompetensi" untuk memasukkan data.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LINKS */}
          {activeSubTab === 'LINKS' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Tautan Referensi Eksternal</h3>
                  <p className="text-xs text-slate-400">Masukkan pranala materi dari Kemenparekraf, BNSP, atau video tutorial.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Tautan</span>
                </button>
              </div>

              <div className="space-y-3">
                {(formData.links || []).map((link, idx) => (
                  <div key={link.id || idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Judul Tautan</label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => handleUpdateLink(idx, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">URL / Link Target</label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateLink(idx, 'url', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-purple-300 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Kategori Tipe</label>
                        <select
                          value={link.type}
                          onChange={(e) => handleUpdateLink(idx, 'type', e.target.value as any)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        >
                          <option value="REFERENCE">Referensi Umum</option>
                          <option value="REGULATION">Regulasi / Juknis</option>
                          <option value="VIDEO">Video Tutorial</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="p-2 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DOWNLOADS */}
          {activeSubTab === 'DOWNLOADS' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Berkas Unduhan (PDF / Modul)</h3>
                  <p className="text-xs text-slate-400">Sediakan file panduan cetak yang dapat langsung diunduh siswa/anggota.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Berkas</span>
                </button>
              </div>

              <div className="space-y-3">
                {(formData.downloads || []).map((dl, idx) => (
                  <div key={dl.id || idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Nama Dokumen</label>
                        <input
                          type="text"
                          value={dl.title}
                          onChange={(e) => handleUpdateDownload(idx, 'title', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Format</label>
                        <select
                          value={dl.fileType}
                          onChange={(e) => handleUpdateDownload(idx, 'fileType', e.target.value as any)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        >
                          <option value="PDF">PDF</option>
                          <option value="DOCX">DOCX</option>
                          <option value="XLSX">XLSX</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Ukuran File</label>
                        <input
                          type="text"
                          value={dl.fileSize}
                          onChange={(e) => handleUpdateDownload(idx, 'fileSize', e.target.value)}
                          placeholder="2.5 MB"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDownload(idx)}
                      className="p-2 rounded-xl bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CURRICULUM */}
          {activeSubTab === 'CURRICULUM' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Silabus Sesi Pertemuan</h3>
                  <p className="text-xs text-slate-400">Atur tahapan jam pelajaran dan materi tiap pertemuan.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSession}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sesi</span>
                </button>
              </div>

              <div className="space-y-3">
                {(formData.curriculum || []).map((sess, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">
                        Sesi Pertemuan #{sess.sessionNumber || idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSession(idx)}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Judul Topik Sesi</label>
                        <input
                          type="text"
                          value={sess.title}
                          onChange={(e) => handleUpdateSession(idx, 'title', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Durasi Jam Pelajaran</label>
                        <input
                          type="text"
                          value={sess.duration}
                          onChange={(e) => handleUpdateSession(idx, 'duration', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Metode Pembelajaran</label>
                        <input
                          type="text"
                          value={sess.method}
                          onChange={(e) => handleUpdateSession(idx, 'method', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Target Capaian Kompetensi</label>
                      <textarea
                        rows={2}
                        value={sess.competency}
                        onChange={(e) => handleUpdateSession(idx, 'competency', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SKK TESTS */}
          {activeSubTab === 'TESTS' && (
            <div className="space-y-6 max-w-4xl">
              {/* PURWA */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Syarat Uji Tingkat Purwa
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleAddTestItem('purwa')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Butir Purwa</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.testRequirements?.purwa || []).map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleUpdateTestItem('purwa', idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTestItem('purwa', idx)}
                        className="p-1.5 text-red-400 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* MADYA */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Syarat Uji Tingkat Madya
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleAddTestItem('madya')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Butir Madya</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.testRequirements?.madya || []).map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleUpdateTestItem('madya', idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTestItem('madya', idx)}
                        className="p-1.5 text-red-400 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* UTAMA */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    Syarat Uji Tingkat Utama
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleAddTestItem('utama')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-800 text-[11px] font-bold cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Butir Utama</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {(formData.testRequirements?.utama || []).map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleUpdateTestItem('utama', idx, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTestItem('utama', idx)}
                        className="p-1.5 text-red-400 hover:text-white"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Perubahan materi akan langsung otomatis disinkronkan ke seluruh pengguna dan perangkat lain secara live.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {saveSuccess ? 'Tersimpan!' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
