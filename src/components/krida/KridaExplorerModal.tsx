import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Layers, 
  Download, 
  ExternalLink, 
  Printer, 
  Edit3, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  X, 
  Compass, 
  Award, 
  Clock, 
  Video, 
  FileText, 
  Globe, 
  Sparkles, 
  FolderOpen,
  CheckSquare,
  Square,
  Share2,
  Table as TableIcon,
  AlertTriangle,
  ChevronDown,
  List
} from 'lucide-react';
import { KridaCategoryInfo, KridaId, KridaModuleItem, CurrentUser } from '../../types';
import { KRIDA_CATEGORIES } from '../../data/kridaData';

interface KridaExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: KridaModuleItem[];
  currentUser?: CurrentUser;
  initialKridaId?: KridaId;
  initialModuleId?: string;
  onOpenEditor: (moduleItem: KridaModuleItem) => void;
}

export const KridaExplorerModal: React.FC<KridaExplorerModalProps> = ({
  isOpen,
  onClose,
  modules,
  currentUser,
  initialKridaId = 'pemandu',
  initialModuleId,
  onOpenEditor
}) => {
  const [selectedKridaId, setSelectedKridaId] = useState<KridaId>(initialKridaId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'CURRICULUM' | 'TEST' | 'DOWNLOADS'>('CONTENT');
  const [checkedPurwa, setCheckedPurwa] = useState<Record<string, boolean>>({});
  const [checkedMadya, setCheckedMadya] = useState<Record<string, boolean>>({});
  const [checkedUtama, setCheckedUtama] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<'KRIDA' | 'SKK' | 'MATERI' | null>(null);

  // Filter modules by active category
  const categoryModules = useMemo(() => {
    return modules.filter(m => m.kridaId === selectedKridaId);
  }, [modules, selectedKridaId]);

  // Selected module state
  const [selectedModuleId, setSelectedModuleId] = useState<string>(() => {
    if (initialModuleId) return initialModuleId;
    const initialForCategory = modules.find(m => m.kridaId === initialKridaId);
    return initialForCategory ? initialForCategory.id : (modules[0]?.id || '');
  });

  // Current active module
  const currentModule = useMemo(() => {
    const found = modules.find(m => m.id === selectedModuleId);
    if (found) return found;
    return categoryModules[0] || modules[0];
  }, [modules, selectedModuleId, categoryModules]);

  // Handle switching category
  const handleSelectCategory = (kId: KridaId) => {
    setSearchQuery('');
    setSelectedKridaId(kId);
    const firstInCat = modules.find(m => m.kridaId === kId);
    if (firstInCat) setSelectedModuleId(firstInCat.id);
    setActiveTab('CONTENT');
    setMobileMenu(null);
  };

  const handleSelectModule = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    setSelectedModuleId(moduleId);
    setSelectedKridaId(mod.kridaId);
    setSearchQuery('');
    setActiveTab('CONTENT');
    setMobileMenu(null);
  };

  const handleSelectMobileTab = (tab: 'CONTENT' | 'CURRICULUM' | 'TEST' | 'DOWNLOADS') => {
    setActiveTab(tab);
    setMobileMenu(null);
  };

  // Filtered list when searching across all or category
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) {
      return categoryModules;
    }
    const q = searchQuery.toLowerCase();
    return modules.filter(m => 
      m.title.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.kridaName.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  }, [categoryModules, modules, searchQuery]);

  const activeCategoryInfo = KRIDA_CATEGORIES.find(c => c.id === (searchQuery ? currentModule?.kridaId : selectedKridaId)) || KRIDA_CATEGORIES[0];
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const shareUrl = `${window.location.origin}/?krida=${currentModule?.kridaId}&skk=${currentModule?.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const renderFormattedContent = (rawText: string) => {
    if (!rawText) return null;
    const lines = rawText.split('\n');

    return (
      <div className="space-y-4 text-slate-300 leading-relaxed text-sm sm:text-base">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-2" />;

          // Heading 2
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-lg sm:text-xl font-bold text-white font-heading mt-6 pt-2 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                <span>{trimmed.replace('## ', '')}</span>
              </h2>
            );
          }

          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-base sm:text-lg font-bold text-purple-300 font-heading mt-4">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2.5 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shrink-0" />
                <p className="flex-1">{trimmed.substring(2)}</p>
              </div>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(trimmed)) {
            const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
            if (numMatch) {
              return (
                <div key={idx} className="flex items-start gap-2.5 pl-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 text-xs font-mono font-bold shrink-0 mt-0.5">
                    {numMatch[1]}
                  </span>
                  <p className="flex-1">{numMatch[2]}</p>
                </div>
              );
            }
          }

          // Normal paragraph with basic bold handling
          return (
            <p key={idx} className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="px-3 py-3 sm:px-6 sm:py-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${activeCategoryInfo.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-extrabold text-white font-heading leading-tight">
                  Folder Kurikulum & Modul SKK 4 Krida
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
                  23 Mata Krida Terakreditasi
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-400">
                Pusat materi pembelajaran, silabus pertemuan, dan standar uji kecakapan khusus Saka Pariwisata Nasional.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSuperAdmin && currentModule && (
              <button
                onClick={() => onOpenEditor(currentModule)}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                title="Super Admin: Edit naskah, gambar, tabel & link modul ini"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Materi (Admin)</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Tutup Jendela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* UNIVERSAL DROPDOWN NAVIGATION: KRIDA -> SKK -> MATERI SKK */}
        <div className="shrink-0 border-b border-slate-800 bg-slate-950/95 px-3 py-3 sm:px-5">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-5xl mx-auto">
            {[
              { key: 'KRIDA' as const, icon: Compass, label: 'Krida', value: activeCategoryInfo.shortTitle },
              { key: 'SKK' as const, icon: Award, label: 'SKK', value: currentModule?.code || 'Pilih SKK' },
              { key: 'MATERI' as const, icon: Layers, label: 'Materi SKK', value: activeTab === 'CONTENT' ? 'Materi & Naskah' : activeTab === 'CURRICULUM' ? 'Silabus' : activeTab === 'TEST' ? 'Materi Uji' : 'Dokumen' }
            ].map((item) => {
              const Icon = item.icon;
              const open = mobileMenu === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  aria-expanded={open}
                  onClick={() => setMobileMenu(open ? null : item.key)}
                  className={`min-w-0 rounded-xl sm:rounded-2xl border px-2.5 py-2 sm:px-4 sm:py-3 text-left transition-all ${open ? 'border-purple-500/60 bg-purple-600/20 text-white ring-1 ring-purple-500/20' : 'border-slate-800 bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${open ? 'text-purple-300' : 'text-slate-400'}`} />
                      <span className="text-[10px] sm:text-xs font-extrabold truncate">{item.label}</span>
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-transform ${open ? 'rotate-180 text-purple-300' : 'text-slate-500'}`} />
                  </div>
                  <span className="mt-1 block truncate text-[9px] sm:text-[11px] font-medium text-slate-500">{item.value}</span>
                </button>
              );
            })}
          </div>

          {mobileMenu === 'KRIDA' && (
            <div className="mt-2 sm:mt-3 mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 p-2 sm:p-3 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {KRIDA_CATEGORIES.map((cat, idx) => {
                  const selected = selectedKridaId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`flex items-center gap-2 rounded-xl border p-2.5 sm:p-3 text-left transition-all ${selected ? 'border-purple-500/60 bg-purple-600/20' : 'border-slate-800 bg-slate-950 hover:bg-slate-800'}`}
                    >
                      <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 ${selected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{idx + 1}</span>
                      <span className="min-w-0">
                        <span className={`block text-[10px] sm:text-xs font-bold truncate ${selected ? 'text-white' : 'text-slate-200'}`}>{cat.name}</span>
                        <span className="block text-[9px] sm:text-[10px] text-slate-500 mt-0.5">{cat.topicsCount} SKK</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mobileMenu === 'SKK' && (
            <div className="mt-2 sm:mt-3 mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="p-2.5 sm:p-3 border-b border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <List className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-extrabold text-white truncate">{activeCategoryInfo.name}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-500 shrink-0">{categoryModules.length} Mata Krida</span>
              </div>
              <div className="p-2 border-b border-slate-800/80">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari kode atau nama SKK..."
                    className="w-full pl-9 pr-9 py-2 sm:py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-72 sm:max-h-80 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
                {filteredList.map((mod) => {
                  const selected = currentModule?.id === mod.id;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => handleSelectModule(mod.id)}
                      className={`w-full flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 text-left transition-all ${selected ? 'border-purple-500/60 bg-purple-600/15' : 'border-slate-800 bg-slate-950 hover:bg-slate-800'}`}
                    >
                      <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-[9px] font-bold font-mono shrink-0 ${selected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>{mod.code}</span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[11px] sm:text-xs font-bold ${selected ? 'text-purple-200' : 'text-slate-200'}`}>{mod.title}</span>
                        <span className="block text-[9px] sm:text-[10px] text-slate-500 truncate mt-0.5">{mod.levelSKK}</span>
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                    </button>
                  );
                })}
                {filteredList.length === 0 && <div className="p-6 text-center text-slate-500 text-xs">Tidak ada SKK yang sesuai pencarian.</div>}
              </div>
            </div>
          )}

          {mobileMenu === 'MATERI' && (
            <div className="mt-2 sm:mt-3 mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 p-2 sm:p-3 shadow-xl animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { tab: 'CONTENT' as const, icon: BookOpen, label: 'Materi & Naskah' },
                  { tab: 'CURRICULUM' as const, icon: Layers, label: `Silabus (${currentModule?.curriculum?.length || 0})` },
                  { tab: 'TEST' as const, icon: CheckCircle2, label: 'Materi Uji SKK' },
                  { tab: 'DOWNLOADS' as const, icon: Download, label: `Dokumen (${currentModule?.downloads?.length || 0})` }
                ].map((item) => {
                  const Icon = item.icon;
                  const selected = activeTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => handleSelectMobileTab(item.tab)}
                      className={`flex items-center gap-2 rounded-xl border p-2.5 sm:p-3 text-left text-[10px] sm:text-xs font-bold transition-all ${selected ? 'border-purple-500/60 bg-purple-600 text-white' : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* MAIN BODY: SINGLE CONTENT PANE */}
        <div className="flex-1 flex flex-col overflow-hidden">
                    {/* CONTENT PANE */}
          <div className="flex-1 flex flex-col bg-slate-900/30 overflow-hidden min-w-0">
            {currentModule ? (
              <>
                {/* DETAIL HEADER */}
                <div className="p-3 sm:p-6 border-b border-slate-800 bg-slate-950/60 shrink-0 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-purple-950/80 text-purple-300 text-xs font-bold border border-purple-800/60 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>Mata Krida {currentModule.code}</span>
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {currentModule.kridaName}
                      </span>
                      {currentModule.skkniReference && (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-800/60">
                          SKKNI: {currentModule.skkniReference}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isSuperAdmin && (
                        <button
                          onClick={() => onOpenEditor(currentModule)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      )}
                      
                      <button
                        onClick={handleShare}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        title="Salin Tautan Modul"
                      >
                        <Share2 className="w-3.5 h-3.5 text-purple-400" />
                        <span className="hidden sm:inline">{copiedLink ? 'Tersalin!' : 'Bagikan'}</span>
                      </button>

                      <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                        title="Cetak Materi Modul Ini"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Cetak</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-white font-heading leading-tight">
                      {currentModule.title}
                    </h1>
                    <p className="hidden sm:block text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                      {currentModule.description}
                    </p>
                  </div>

                </div>

                {/* DETAIL SCROLLABLE CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
                  
                  {/* TAB 1: CONTENT / NASKAH MODUL */}
                  {activeTab === 'CONTENT' && (
                    <div className="space-y-6 max-w-4xl">
                      {/* Formatted Text */}
                      <div className="bg-slate-950/80 border border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-lg">
                        {renderFormattedContent(currentModule.content)}
                      </div>

                      {/* Photo Gallery if any */}
                      {currentModule.images && currentModule.images.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <span>Galeri Ilustrasi & Dokumentasi Pemanduan</span>
                            <span className="text-xs text-purple-400 font-mono font-normal">({currentModule.images.length} Foto)</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentModule.images.map((img) => (
                              <div key={img.id} className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 group shadow-md">
                                <div className="h-48 overflow-hidden bg-slate-900">
                                  <img
                                    src={img.url}
                                    alt={img.caption}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="p-3 text-xs text-slate-300 font-medium">
                                  {img.caption}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Competency Table */}
                      {currentModule.competencyTable && currentModule.competencyTable.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <TableIcon className="w-4 h-4 text-purple-400" />
                            <span>Matriks Standar Kompetensi & Evaluasi</span>
                          </h3>
                          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                              <table className="w-full text-left text-xs text-slate-300">
                                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                                  <tr>
                                    <th className="p-3">Kode Unit</th>
                                    <th className="p-3">Elemen Kompetensi</th>
                                    <th className="p-3">Indikator Kinerja</th>
                                    <th className="p-3">Metode Uji</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/80">
                                  {currentModule.competencyTable.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-slate-900/50">
                                      <td className="p-3 font-mono text-purple-300 font-semibold">{row.code}</td>
                                      <td className="p-3 font-bold text-white">{row.element}</td>
                                      <td className="p-3 text-slate-300">{row.indicator}</td>
                                      <td className="p-3 text-emerald-400 font-medium">{row.assessment}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            {/* Mobile Cards (Zero Horizontal Scrolling) */}
                            <div className="md:hidden divide-y divide-slate-800/80">
                              {currentModule.competencyTable.map((row, rIdx) => (
                                <div key={rIdx} className="p-3.5 space-y-2 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono text-xs font-bold text-purple-300 bg-purple-950/70 px-2 py-0.5 rounded border border-purple-800/60">
                                      {row.code}
                                    </span>
                                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                                      {row.assessment}
                                    </span>
                                  </div>
                                  <p className="font-bold text-white text-[13px]">{row.element}</p>
                                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                                    <span className="text-[10px] text-slate-400 block font-semibold">Indikator Kinerja:</span>
                                    <p className="leading-relaxed">{row.indicator}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* External reference links */}
                      {currentModule.links && currentModule.links.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                            <Globe className="w-4 h-4 text-purple-400" />
                            <span>Tautan Referensi & Regulasi Resmi</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {currentModule.links.map((link) => (
                              <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition-all flex items-center justify-between gap-3 group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0">
                                    {link.type === 'VIDEO' ? <Video className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                                      {link.title}
                                    </p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                                      {link.type} • Tautan Eksternal
                                    </p>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: CURRICULUM SYLLABUS */}
                  {activeTab === 'CURRICULUM' && (
                    <div className="space-y-4 max-w-4xl">
                      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold">Total Silabus Pembelajaran</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">Disusun dalam jam pelajaran (JP) teori dan praktik lapangan terpadu.</p>
                        </div>
                        <span className="px-3 py-1 rounded-xl bg-purple-600 text-white font-bold text-xs">
                          {currentModule.curriculum?.length || 0} Sesi Pertemuan
                        </span>
                      </div>

                      <div className="space-y-3">
                        {(currentModule.curriculum || []).map((session, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2 hover:border-purple-500/40 transition-all"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                                  {session.sessionNumber || sIdx + 1}
                                </span>
                                <h4 className="text-sm sm:text-base font-bold text-white font-heading">
                                  {session.title}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="flex items-center gap-1 font-mono text-purple-300">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{session.duration}</span>
                                </span>
                                <span>•</span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                                  {session.method}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 pl-8 leading-relaxed">
                              {session.competency}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: SKK TEST REQUIREMENTS */}
                  {activeTab === 'TEST' && (
                    <div className="space-y-6 max-w-4xl">
                      {/* 2026 Standard Scoring Banner */}
                      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold flex items-center gap-2">
                            <Award className="w-4 h-4 text-amber-400" />
                            <span>Standar Pengujian SKK & TKK Saka Pariwisata 2026</span>
                          </p>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-500/30">
                            Passing Grade: Nilai Akhir ≥ 80
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Formula Penilaian 100%: <strong className="text-amber-300">Pengetahuan (20%)</strong> + <strong className="text-purple-300">Keterampilan (40%)</strong> + <strong className="text-blue-300">Sikap Kerja (20%)</strong> + <strong className="text-emerald-300">Produk/Praktik Nyata (20%)</strong>.
                        </p>
                      </div>

                      {/* PURWA */}
                      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-emerald-500" />
                            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                              Tingkat Purwa (7–15 Thn / Dasar)
                            </h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 text-[10px] font-bold border border-emerald-800/60 font-mono">
                            Bingkai Bulat
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Kriteria penguasaan materi dan simulasi awal bagi peserta didik:</p>
                        <div className="space-y-2 pt-1">
                          {((currentModule.testRequirements?.purwa && currentModule.testRequirements.purwa.length > 0)
                            ? currentModule.testRequirements.purwa
                            : (currentModule.competencies?.purwa || [])
                          ).map((req, rIdx) => {
                            const key = `${currentModule.id}-purwa-${rIdx}`;
                            const isChecked = !!checkedPurwa[key];
                            return (
                              <div
                                key={rIdx}
                                onClick={() => setCheckedPurwa(prev => ({ ...prev, [key]: !prev[key] }))}
                                className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 cursor-pointer transition-colors"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                )}
                                <span className={`text-xs leading-relaxed ${isChecked ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                  {req}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {currentModule.practiceProduct?.purwa && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-emerald-800/40 text-xs text-emerald-300">
                            <span className="font-bold text-emerald-400 block mb-1">📦 Produk Nyata / Bukti Uji Wajib Purwa:</span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{currentModule.practiceProduct.purwa}</p>
                          </div>
                        )}
                      </div>

                      {/* MADYA */}
                      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-amber-500" />
                            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                              Tingkat Madya (15–20 Thn / Penerapan)
                            </h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 text-[10px] font-bold border border-amber-800/60 font-mono">
                            Bingkai Persegi
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Penguasaan kecakapan tingkat praktik mandiri dan simulasi lapangan:</p>
                        <div className="space-y-2 pt-1">
                          {((currentModule.testRequirements?.madya && currentModule.testRequirements.madya.length > 0)
                            ? currentModule.testRequirements.madya
                            : (currentModule.competencies?.madya || [])
                          ).map((req, rIdx) => {
                            const key = `${currentModule.id}-madya-${rIdx}`;
                            const isChecked = !!checkedMadya[key];
                            return (
                              <div
                                key={rIdx}
                                onClick={() => setCheckedMadya(prev => ({ ...prev, [key]: !prev[key] }))}
                                className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 cursor-pointer transition-colors"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                )}
                                <span className={`text-xs leading-relaxed ${isChecked ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                  {req}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {currentModule.practiceProduct?.madya && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-amber-800/40 text-xs text-amber-300">
                            <span className="font-bold text-amber-400 block mb-1">📦 Produk Nyata / Bukti Uji Wajib Madya:</span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{currentModule.practiceProduct.madya}</p>
                          </div>
                        )}
                      </div>

                      {/* UTAMA */}
                      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-500" />
                            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                              Tingkat Utama (21–25 Thn / Pengembangan)
                            </h4>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 text-[10px] font-bold border border-purple-800/60 font-mono">
                            Bingkai Segilima
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Tingkat tertinggi dengan kemampuan membimbing, evaluasi, dan inovasi:</p>
                        <div className="space-y-2 pt-1">
                          {((currentModule.testRequirements?.utama && currentModule.testRequirements.utama.length > 0)
                            ? currentModule.testRequirements.utama
                            : (currentModule.competencies?.utama || [])
                          ).map((req, rIdx) => {
                            const key = `${currentModule.id}-utama-${rIdx}`;
                            const isChecked = !!checkedUtama[key];
                            return (
                              <div
                                key={rIdx}
                                onClick={() => setCheckedUtama(prev => ({ ...prev, [key]: !prev[key] }))}
                                className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 cursor-pointer transition-colors"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                                )}
                                <span className={`text-xs leading-relaxed ${isChecked ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                                  {req}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {currentModule.practiceProduct?.utama && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-purple-800/40 text-xs text-purple-300">
                            <span className="font-bold text-purple-400 block mb-1">📦 Produk Nyata / Bukti Uji Wajib Utama:</span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{currentModule.practiceProduct.utama}</p>
                          </div>
                        )}
                      </div>

                      {/* Special Safety Notes */}
                      {currentModule.specialSafetyNotes && (
                        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-xs text-rose-200 flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-sm text-rose-400 block">Prosedur Keselamatan Kerja & Etika Wisata (K3 Wisata):</span>
                            <p className="text-slate-300 text-xs leading-relaxed mt-1">{currentModule.specialSafetyNotes}</p>
                          </div>
                        </div>
                      )}

                      {/* 8 Components Portfolio */}
                      {currentModule.portfolioItems && currentModule.portfolioItems.length > 0 && (
                        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
                          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2 font-heading">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>8 Komponen Bukti Portofolio Uji Resmi 2026</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {currentModule.portfolioItems.map((item, idx) => (
                              <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70 text-slate-300 flex items-start gap-2">
                                <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="text-[11px] leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: DOWNLOADS */}
                  {activeTab === 'DOWNLOADS' && (
                    <div className="space-y-4 max-w-4xl">
                      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold">Dokumen Modul & Lembar Kerja Uji</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">Berkas resmi dapat diunduh untuk kebutuhan belajar mandiri dan kegiatan perkemahan.</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {((currentModule.materials?.downloads && currentModule.materials.downloads.length > 0) 
                          ? currentModule.materials.downloads 
                          : (currentModule.downloads || [])
                        ).map((dl) => (
                          <div
                            key={dl.id}
                            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                                  {dl.title}
                                </h4>
                                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                                  Format: {dl.fileType || 'PDF'} • Ukuran: {dl.fileSize}
                                </p>
                              </div>
                            </div>

                            <a
                              href={dl.url || dl.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh</span>
                            </a>
                          </div>
                        ))}

                        {(!currentModule.materials?.downloads?.length && !currentModule.downloads?.length) && (
                          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs space-y-2">
                            <Download className="w-8 h-8 mx-auto text-slate-600" />
                            <p>Dokumen PDF sedang dalam proses digitalisasi oleh Pimpinan Saka Pariwisata Nasional.</p>
                            <p className="text-[11px] text-slate-600">Gunakan tombol "Cetak" di atas untuk menyimpan naskah modul ini sebagai dokumen PDF lokal.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-sm">
                Pilih SKK melalui tombol navigasi di atas untuk melihat materi lengkap.
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="hidden sm:flex px-5 py-3 border-t border-slate-800 bg-slate-950/80 flex-wrap items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Terakhir disinkronkan: {currentModule?.updatedAt ? new Date(currentModule.updatedAt).toLocaleDateString('id-ID') : 'Terbaru'}</span>
            <span>•</span>
            <span>Oleh: {currentModule?.updatedBy || 'Pimpinan Saka Pariwisata'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
