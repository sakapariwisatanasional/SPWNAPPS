import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  FolderOpen, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  FileText, 
  Download, 
  ExternalLink, 
  Award, 
  ChevronRight,
  Filter,
  Layers,
  Table as TableIcon
} from 'lucide-react';
import { CurrentUser, KridaId, KridaModuleItem } from '../types';
import { KRIDA_CATEGORIES } from '../data/kridaData';
import { storage } from '../services/storage';
import { KridaExplorerModal } from '../components/krida/KridaExplorerModal';
import { KridaMaterialEditorModal } from '../components/krida/KridaMaterialEditorModal';
import { CompactKridaPortal } from '../components/krida/CompactKridaPortal';
import { KridaFullScreenReaderModal } from '../components/krida/KridaFullScreenReaderModal';

interface KridaModulesViewProps {
  currentUser: CurrentUser;
}

export const KridaModulesView: React.FC<KridaModulesViewProps> = ({ currentUser }) => {
  const [modules, setModules] = useState<KridaModuleItem[]>(() => storage.getKridaModules());
  const [selectedKrida, setSelectedKrida] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'compact' | 'grid'>('compact');
  
  // Modals state
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [activeKridaId, setActiveKridaId] = useState<KridaId>('pemandu');
  const [activeModuleId, setActiveModuleId] = useState<string | undefined>(undefined);
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<KridaModuleItem | null>(null);

  const [isFullScreenReaderOpen, setIsFullScreenReaderOpen] = useState(false);
  const [readerModuleId, setReaderModuleId] = useState<string | undefined>();

  const handleOpenFullScreenReader = (moduleId?: string) => {
    setReaderModuleId(moduleId);
    setIsFullScreenReaderOpen(true);
  };

  // Auto-sync storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setModules(storage.getKridaModules());
    });
    return () => unsubscribe();
  }, []);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Filter modules
  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      const matchCategory = selectedKrida === 'ALL' || m.kridaId === selectedKrida;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        m.title.toLowerCase().includes(query) ||
        m.code.toLowerCase().includes(query) ||
        m.kridaTitle.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.competencies.purwa.some(c => c.toLowerCase().includes(query)) ||
        m.competencies.madya.some(c => c.toLowerCase().includes(query)) ||
        m.competencies.utama.some(c => c.toLowerCase().includes(query));

      return matchCategory && matchSearch;
    });
  }, [modules, selectedKrida, searchQuery]);

  const handleOpenExplorer = (kridaId: KridaId, moduleId?: string) => {
    setActiveKridaId(kridaId);
    setActiveModuleId(moduleId);
    setIsExplorerOpen(true);
  };

  const handleOpenEditor = (moduleItem: KridaModuleItem) => {
    setEditingModule(moduleItem);
    setIsEditorOpen(true);
  };

  const handleSaveModule = (updatedItem: KridaModuleItem) => {
    storage.updateKridaModule(updatedItem, currentUser.name);
    setModules(storage.getKridaModules());
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-100/50 to-amber-100/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold">
              <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Folder Pembelajaran & Kurikulum SKK Resmi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Modul & Kurikulum 4 Krida
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pusat referensi silabus, naskah materi, instrumen uji syarat kecakapan khusus (SKK) Purwa, Madya, dan Utama untuk 23 mata krida Saka Pariwisata Indonesia.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => handleOpenFullScreenReader(activeModuleId || modules[0]?.id)}
              className="px-4 py-2.5 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs border border-purple-200 flex items-center gap-2 cursor-pointer transition-all shadow-2xs"
              title="Buka naskah materi & SKK dalam mode layar penuh (tanpa scrolling, kendali next >> dan back <<)"
            >
              <BookOpen className="w-4 h-4 text-purple-700" />
              <span>Layar Penuh (Next &gt;&gt; / Back &lt;&lt;)</span>
            </button>

            <button
              onClick={() => handleOpenExplorer('pemandu')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-900/20 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Layers className="w-4 h-4 text-purple-200" />
              <span>Buka Penjelajah</span>
            </button>
            {isSuperAdmin && (
              <div className="px-3 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Super Admin: Mode Editor Aktif</span>
              </div>
            )}
          </div>
        </div>

        {/* 4 Krida Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          {KRIDA_CATEGORIES.map((cat) => {
            const count = modules.filter(m => m.kridaId === cat.id).length;
            const isSelected = selectedKrida === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedKrida(isSelected ? 'ALL' : cat.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-400/30' 
                    : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800 truncate">{cat.name}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white border text-[10px] font-mono font-bold text-purple-700 shadow-2xs">
                    {count} SKK
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{cat.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* View Mode Toggle & Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto pt-1 md:pt-0">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 mr-2 border border-slate-200">
            <button
              onClick={() => setViewMode('compact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'compact'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilan Simpel & Ringkas Tanpa Scrolling: Apa yang diklik itu yang dilihat"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Interaktif Ringkas</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan semua 23 kartu modul"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Daftar Kartu</span>
            </button>
          </div>

          {viewMode === 'grid' && (
            <>
              <button
                onClick={() => setSelectedKrida('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedKrida === 'ALL'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                Semua ({modules.length})
              </button>
              {KRIDA_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedKrida(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    selectedKrida === cat.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>{cat.name.replace('Krida ', '')}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    selectedKrida === cat.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cat.topicsCount}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim() && viewMode !== 'grid') {
                setViewMode('grid');
              }
            }}
            placeholder="Cari mata krida, materi, SKK..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'compact' && !searchQuery.trim() ? (
        <CompactKridaPortal
          modules={modules}
          currentUser={currentUser}
          onOpenFullExplorer={handleOpenExplorer}
          onOpenFullScreenReader={handleOpenFullScreenReader}
          onOpenEditor={handleOpenEditor}
          variant="light"
          initialKridaId={selectedKrida !== 'ALL' ? (selectedKrida as KridaId) : 'pemandu'}
        />
      ) : (
        /* Grid of Modules */
        filteredModules.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">Tidak ada modul yang cocok dengan pencarian Anda.</p>
            <p className="text-xs text-slate-400">Coba ubah kata kunci atau pilih kategori krida lainnya.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredModules.map((item) => {
            const cat = KRIDA_CATEGORIES.find(c => c.id === item.kridaId);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-purple-400/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r ${cat?.color || 'from-purple-600 to-indigo-600'} shadow-2xs`}>
                      {item.kridaTitle}
                    </span>
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs flex items-center justify-center">
                      {item.code.replace(/[()]/g, '')}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors text-sm sm:text-base leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-purple-700 font-semibold mt-0.5">{item.subtitle}</p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Badges / Features count */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] text-slate-600">
                      <Award className="w-3 h-3 text-amber-500" />
                      {item.competencies.purwa.length + item.competencies.madya.length + item.competencies.utama.length} Butir SKK
                    </span>
                    {item.materials.tables.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-mono text-[10px]">
                        <TableIcon className="w-3 h-3" />
                        {item.materials.tables.length} Tabel
                      </span>
                    )}
                    {item.materials.images.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-mono text-[10px]">
                        📷 {item.materials.images.length} Gambar
                      </span>
                    )}
                    {item.materials.downloads.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-mono text-[10px]">
                        <Download className="w-3 h-3" />
                        {item.materials.downloads.length} Berkas
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenExplorer(item.kridaId, item.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Pelajari Modul</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenFullScreenReader(item.id)}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Baca modul ini dalam mode layar penuh tanpa scrolling (Next >> dan Back <<)"
                  >
                    <span>Layar Penuh</span>
                  </button>

                  {isSuperAdmin && (
                    <button
                      onClick={() => handleOpenEditor(item)}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 hover:border-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      title="Super Admin: Edit naskah, gambar, tabel, link & berkas"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )
      )}

      {/* Krida Explorer Viewer Modal */}
      <KridaExplorerModal
        isOpen={isExplorerOpen}
        onClose={() => {
          setIsExplorerOpen(false);
          setActiveModuleId(undefined);
        }}
        modules={modules}
        currentUser={currentUser}
        initialKridaId={activeKridaId}
        initialModuleId={activeModuleId}
        onOpenEditor={handleOpenEditor}
      />

      {/* Super Admin Material Editor Modal */}
      <KridaMaterialEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingModule(null);
        }}
        moduleItem={editingModule}
        currentUser={currentUser}
        onSave={handleSaveModule}
      />

      {/* Fullscreen Reader Modal (No Scrolling, Only Next >> & Back << Navigation) */}
      <KridaFullScreenReaderModal
        isOpen={isFullScreenReaderOpen}
        onClose={() => setIsFullScreenReaderOpen(false)}
        modules={modules}
        initialModuleId={readerModuleId}
      />
    </div>
  );
};
