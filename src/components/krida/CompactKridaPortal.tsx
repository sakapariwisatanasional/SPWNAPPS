import React, { useState, useMemo } from 'react';
import { 
  FolderOpen, 
  BookOpen, 
  Award, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  Edit3, 
  FileText, 
  Layers, 
  Table as TableIcon,
  ChevronDown,
  X,
  Printer,
  Compass,
  CheckSquare,
  Square,
  Maximize2
} from 'lucide-react';
import { KridaCategoryInfo, KridaId, KridaModuleItem, CurrentUser } from '../../types';
import { KRIDA_CATEGORIES } from '../../data/kridaData';
import { KridaFullScreenReaderModal } from './KridaFullScreenReaderModal';

interface CompactKridaPortalProps {
  modules: KridaModuleItem[];
  currentUser?: CurrentUser;
  onOpenFullExplorer?: (kridaId: KridaId, moduleId?: string) => void;
  onOpenFullScreenReader?: (moduleId?: string) => void;
  onOpenEditor?: (moduleItem: KridaModuleItem) => void;
  variant?: 'dark' | 'light';
  initialKridaId?: KridaId;
}

type ActiveDetailSection = 'NONE' | 'CONTENT' | 'CURRICULUM' | 'SKK' | 'RELATED_MATERIALS';

export const CompactKridaPortal: React.FC<CompactKridaPortalProps> = ({
  modules,
  currentUser,
  onOpenFullExplorer,
  onOpenFullScreenReader,
  onOpenEditor,
  variant = 'dark',
  initialKridaId = 'pemandu'
}) => {
  const [selectedKridaId, setSelectedKridaId] = useState<KridaId>(initialKridaId);
  const [isInternalReaderOpen, setIsInternalReaderOpen] = useState(false);
  const [readerModuleId, setReaderModuleId] = useState<string | undefined>();
  
  // Filter modules by category
  const categoryModules = useMemo(() => {
    return modules.filter(m => m.kridaId === selectedKridaId);
  }, [modules, selectedKridaId]);

  // Selected module state (default to first module in category)
  const [selectedModuleId, setSelectedModuleId] = useState<string>(() => {
    return categoryModules[0]?.id || modules[0]?.id || '';
  });

  const handleTriggerFullScreenReader = (modId?: string) => {
    const targetId = modId || selectedModuleId;
    if (onOpenFullScreenReader) {
      onOpenFullScreenReader(targetId);
    } else {
      setReaderModuleId(targetId);
      setIsInternalReaderOpen(true);
    }
  };

  // Keep track of which detail section is currently opened by user click
  const [activeSection, setActiveSection] = useState<ActiveDetailSection>('NONE');

  // SKK checklist state
  const [checkedPurwa, setCheckedPurwa] = useState<Record<string, boolean>>({});
  const [checkedMadya, setCheckedMadya] = useState<Record<string, boolean>>({});
  const [checkedUtama, setCheckedUtama] = useState<Record<string, boolean>>({});

  // Active Category Info
  const activeCategory = useMemo(() => {
    return KRIDA_CATEGORIES.find(c => c.id === selectedKridaId) || KRIDA_CATEGORIES[0];
  }, [selectedKridaId]);

  // Current selected module item
  const currentModule = useMemo(() => {
    const found = categoryModules.find(m => m.id === selectedModuleId);
    if (found) return found;
    return categoryModules[0] || modules[0];
  }, [categoryModules, selectedModuleId, modules]);

  // Switch category
  const handleSelectCategory = (kId: KridaId) => {
    setSelectedKridaId(kId);
    const firstInCat = modules.find(m => m.kridaId === kId);
    if (firstInCat) {
      setSelectedModuleId(firstInCat.id);
    }
    // Reset or keep section
  };

  // Switch module
  const handleSelectModule = (modId: string) => {
    setSelectedModuleId(modId);
  };

  // Toggle detail section on demand
  const handleToggleSection = (section: ActiveDetailSection) => {
    setActiveSection(prev => prev === section ? 'NONE' : section);
  };

  const isDark = variant === 'dark';
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Format markdown helper
  const renderFormattedMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className={`space-y-3 leading-relaxed text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;
          if (trimmed.startsWith('## ')) {
            return (
              <h4 key={idx} className={`font-bold font-heading text-sm sm:text-base pt-2 pb-1 border-b flex items-center gap-2 ${
                isDark ? 'text-purple-300 border-slate-800' : 'text-purple-800 border-slate-200'
              }`}>
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{trimmed.replace('## ', '')}</span>
              </h4>
            );
          }
          if (trimmed.startsWith('### ')) {
            return (
              <h5 key={idx} className={`font-bold text-xs sm:text-sm mt-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                {trimmed.replace('### ', '')}
              </h5>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <p className="flex-1">{trimmed.substring(2)}</p>
              </div>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
            if (numMatch) {
              return (
                <div key={idx} className="flex items-start gap-2 pl-2">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold mt-0.5 shrink-0 ${
                    isDark ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {numMatch[1]}
                  </span>
                  <p className="flex-1">{numMatch[2]}</p>
                </div>
              );
            }
          }
          return <p key={idx}>{trimmed}</p>;
        })}
      </div>
    );
  };

  return (
    <div className={`rounded-3xl border transition-all ${
      isDark 
        ? 'bg-slate-950/95 border-slate-800 text-slate-100 shadow-2xl' 
        : 'bg-white border-slate-200/90 text-slate-900 shadow-md'
    }`}>
      {/* 1. TINGKAT 1: FOLDER 4 KRIDA UTAMA (Simpel, Horizontal/Tab Bar Ringkas) */}
      <div className={`p-4 sm:p-6 border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/70'} rounded-t-3xl`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-xl ${isDark ? 'bg-purple-950/80 text-amber-400 border border-purple-800/60' : 'bg-purple-100 text-purple-700'}`}>
              <FolderOpen className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold font-heading tracking-tight">
                Pilih Folder Krida & Mata Kurikulum
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Klik folder untuk melihat daftar mata krida, lalu klik mata krida untuk membuka materinya.
              </p>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleTriggerFullScreenReader(selectedModuleId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/40 cursor-pointer"
              title="Baca naskah & kurikulum dalam mode layar penuh (tanpa scroll, kendali next >> dan back <<)"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>Layar Penuh (Next &gt;&gt; / Back &lt;&lt;)</span>
            </button>

            {onOpenFullExplorer && (
              <button
                type="button"
                onClick={() => onOpenFullExplorer(selectedKridaId, selectedModuleId)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                }`}
                title="Buka Penjelajah Lengkap (Mode Modal)"
              >
                <Maximize2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Penjelajah</span>
              </button>
            )}

            {isSuperAdmin && onOpenEditor && currentModule && (
              <button
                type="button"
                onClick={() => onOpenEditor(currentModule)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                title="Super Admin: Edit materi ini"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Materi</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 FOLDER BUTTONS TABS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {KRIDA_CATEGORIES.map((cat) => {
            const isSelected = selectedKridaId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectCategory(cat.id)}
                className={`relative p-3 rounded-2xl text-left transition-all border cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? isDark
                      ? 'bg-purple-950/60 border-purple-500/70 shadow-lg shadow-purple-950/50 ring-1 ring-purple-500/40'
                      : 'bg-purple-50 border-purple-400 shadow-sm ring-1 ring-purple-300'
                    : isDark
                      ? 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700 text-slate-400'
                      : 'bg-white hover:bg-slate-100 border-slate-200/80 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? `bg-gradient-to-br ${cat.color} text-white shadow-xs`
                      : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <FolderOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? isDark ? 'bg-purple-900/80 text-purple-200' : 'bg-purple-200 text-purple-800'
                      : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {cat.topicsCount} SKK
                  </span>
                </div>

                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${
                    isSelected 
                      ? isDark ? 'text-white' : 'text-purple-900' 
                      : isDark ? 'text-slate-300' : 'text-slate-800'
                  }`}>
                    {cat.shortTitle || cat.name}
                  </div>
                  <div className={`text-[10px] truncate ${
                    isSelected 
                      ? isDark ? 'text-purple-300 font-medium' : 'text-purple-700 font-medium' 
                      : isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {cat.badge}
                  </div>
                </div>

                {isSelected && (
                  <div className={`absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r ${cat.color} rounded-full`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TINGKAT 2: DAFTAR MATA KRIDA / SKK (Ringkas, Berbentuk Barisan Pilihan) */}
      <div className={`p-4 sm:p-5 border-b ${isDark ? 'border-slate-800/80 bg-slate-900/30' : 'border-slate-100 bg-slate-50/40'}`}>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Mata Krida dalam <span className={isDark ? 'text-purple-300 font-bold' : 'text-purple-700 font-bold'}>{activeCategory.name}</span>:
          </span>
          <span className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Klik salah satu mata krida di bawah:
          </span>
        </div>

        {/* COMPACT PILL BUTTONS FOR MATA KRIDA */}
        <div className="flex flex-wrap gap-2">
          {categoryModules.map((mod) => {
            const isModSelected = currentModule?.id === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => handleSelectModule(mod.id)}
                className={`group/btn px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer border ${
                  isModSelected
                    ? isDark
                      ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950/50 ring-2 ring-purple-400/40'
                      : 'bg-purple-600 text-white border-purple-600 shadow-sm ring-2 ring-purple-300'
                    : isDark
                      ? 'bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                      : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200/90 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <span className={`w-5 h-5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                  isModSelected
                    ? 'bg-white/20 text-white'
                    : isDark ? 'bg-slate-800 text-purple-400 group-hover/btn:bg-slate-700' : 'bg-slate-100 text-purple-700'
                }`}>
                  {mod.code.replace(/[()]/g, '')}
                </span>
                <span className="truncate max-w-[200px] sm:max-w-[280px]">
                  {mod.title}
                </span>
                {isModSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TINGKAT 3: PANEL MATERI TERPILIH (Apa yang diklik itu yang dilihat) */}
      {currentModule && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* Header Info Mata Krida Terpilih */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-purple-50/50 border-purple-100'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                    isDark ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-purple-100 text-purple-800 border border-purple-200'
                  }`}>
                    MATA KRIDA {currentModule.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                    isDark ? 'bg-slate-800 text-amber-300' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentModule.badge || currentModule.levelSKK}
                  </span>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Tingkat: <span className="font-semibold">{currentModule.levelSKK}</span>
                  </span>
                </div>

                <h3 className={`text-base sm:text-lg font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentModule.title}
                </h3>
                {currentModule.subtitle && (
                  <p className={`text-xs font-medium ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                    {currentModule.subtitle}
                  </p>
                )}
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {currentModule.description}
                </p>
              </div>

              {/* Status Pill & Fullscreen Reader Button */}
              <div className={`shrink-0 text-right sm:border-l sm:pl-4 flex flex-col justify-between items-end gap-2 ${isDark ? 'border-slate-800' : 'border-purple-200'}`}>
                <div>
                  <div className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Kelengkapan
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Siap Dipelajari</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerFullScreenReader(currentModule.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-900/30 transition-all cursor-pointer"
                  title="Baca materi modul ini dalam tampilan layar penuh tanpa sistem scrolling (tombol next >> dan back <<)"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>Baca Layar Penuh</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4. TOMBOL-TOMBOL BUKA MATERI BERKAITAN (Hanya dibuka jika diklik/dipilih pengguna) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilih Bagian Materi yang Ingin Dibuka:</span>
              </span>
              {activeSection !== 'NONE' && (
                <button
                  type="button"
                  onClick={() => setActiveSection('NONE')}
                  className={`text-xs font-medium flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  <X className="w-3 h-3" />
                  <span>Tutup Tampilan Materi</span>
                </button>
              )}
            </div>

            {/* 4 INTERACTIVE SECTION BUTTONS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Button A: Naskah Materi */}
              <button
                type="button"
                onClick={() => handleToggleSection('CONTENT')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeSection === 'CONTENT'
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30 ring-2 ring-purple-400/40'
                    : isDark
                      ? 'bg-slate-900/90 hover:bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeSection === 'CONTENT' ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-purple-400' : 'bg-purple-100 text-purple-700'
                  }`}>
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeSection === 'CONTENT' ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                </div>
                <div>
                  <div className="text-xs font-bold">Naskah Materi Modul</div>
                  <div className={`text-[10px] mt-0.5 ${activeSection === 'CONTENT' ? 'text-purple-100' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Konsep & pedoman teknis
                  </div>
                </div>
              </button>

              {/* Button B: Silabus Kurikulum */}
              <button
                type="button"
                onClick={() => handleToggleSection('CURRICULUM')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeSection === 'CURRICULUM'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-900/30 ring-2 ring-indigo-400/40'
                    : isDark
                      ? 'bg-slate-900/90 hover:bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeSection === 'CURRICULUM' ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeSection === 'CURRICULUM' ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                </div>
                <div>
                  <div className="text-xs font-bold">Silabus 4 Pertemuan</div>
                  <div className={`text-[10px] mt-0.5 ${activeSection === 'CURRICULUM' ? 'text-indigo-100' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {currentModule.curriculum?.length || 4} Sesi Pelatihan
                  </div>
                </div>
              </button>

              {/* Button C: Uji SKK Purwa, Madya, Utama */}
              <button
                type="button"
                onClick={() => handleToggleSection('SKK')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeSection === 'SKK'
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md shadow-amber-900/30 ring-2 ring-amber-400/40'
                    : isDark
                      ? 'bg-slate-900/90 hover:bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeSection === 'SKK' ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-amber-400' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeSection === 'SKK' ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                </div>
                <div>
                  <div className="text-xs font-bold">Instrumen Uji SKK</div>
                  <div className={`text-[10px] mt-0.5 ${activeSection === 'SKK' ? 'text-amber-100' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Purwa • Madya • Utama
                  </div>
                </div>
              </button>

              {/* Button D: Materi Terkait & Berkas Unduhan (FITUR UTAMA: Baru dibuka saat diklik) */}
              <button
                type="button"
                onClick={() => handleToggleSection('RELATED_MATERIALS')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  activeSection === 'RELATED_MATERIALS'
                    ? 'bg-teal-600 text-white border-teal-500 shadow-md shadow-teal-900/30 ring-2 ring-teal-400/40'
                    : isDark
                      ? 'bg-slate-900/90 hover:bg-slate-900 text-slate-300 hover:text-white border-slate-800'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    activeSection === 'RELATED_MATERIALS' ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-teal-400' : 'bg-teal-100 text-teal-700'
                  }`}>
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      activeSection === 'RELATED_MATERIALS' ? 'bg-white/20 text-white' : 'bg-teal-500/20 text-teal-400'
                    }`}>
                      {(currentModule.materials?.downloads?.length || 0) + (currentModule.materials?.tables?.length || 0) + (currentModule.materials?.images?.length || 0)} File
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSection === 'RELATED_MATERIALS' ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold">Materi Terkait & Unduhan</div>
                  <div className={`text-[10px] mt-0.5 ${activeSection === 'RELATED_MATERIALS' ? 'text-teal-100' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Berkas PDF, Bagan & Tabel
                  </div>
                </div>
              </button>
            </div>

            {/* DETAIL VIEWER CONTAINER: Hanya muncul jika diklik pengguna */}
            {activeSection !== 'NONE' && (
              <div className={`mt-4 p-4 sm:p-6 rounded-2xl border transition-all animate-fadeIn ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                {/* SECTION 1: NASKAH MATERI */}
                {activeSection === 'CONTENT' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        <h4 className={`text-sm sm:text-base font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Naskah Lengkap: {currentModule.title}
                        </h4>
                      </div>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Diperbarui oleh: <strong className="text-purple-400">{currentModule.updatedBy || 'Super Admin Saka'}</strong>
                      </span>
                    </div>

                    <div className="py-2">
                      {renderFormattedMarkdown(currentModule.content)}
                    </div>
                  </div>
                )}

                {/* SECTION 2: SILABUS KURIKULUM */}
                {activeSection === 'CURRICULUM' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        <h4 className={`text-sm sm:text-base font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Silabus & Rencana Pelatihan (4 Sesi Tatap Muka)
                        </h4>
                      </div>
                      <span className="text-[11px] text-indigo-400 font-semibold">
                        Standar Nasional Saka Pariwisata
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {currentModule.curriculum?.map((sess) => (
                        <div
                          key={sess.session}
                          className={`p-3.5 rounded-xl border ${
                            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                          } space-y-2`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-[10px] font-bold">
                              SESI {sess.session}
                            </span>
                            <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              ⏱️ {sess.duration}
                            </span>
                          </div>
                          <h5 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {sess.topic}
                          </h5>
                          <ul className="space-y-1 text-[11px] pt-1">
                            {sess.objectives?.map((obj, i) => (
                              <li key={i} className={`flex items-start gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                <span className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SECTION 3: UJI SKK */}
                {activeSection === 'SKK' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <h4 className={`text-sm sm:text-base font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Syarat Kecakapan Khusus (SKK) & Lembar Uji
                        </h4>
                      </div>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Tandai kriteria yang telah dikuasai
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      {/* Purwa */}
                      <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                            Tingkat Purwa (Dasar)
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {currentModule.competencies?.purwa?.map((item, i) => {
                            const key = `purwa-${i}`;
                            const isChecked = !!checkedPurwa[key];
                            return (
                              <div
                                key={i}
                                onClick={() => setCheckedPurwa(prev => ({ ...prev, [key]: !prev[key] }))}
                                className={`p-2 rounded-lg text-[11px] flex items-start gap-2 cursor-pointer transition-colors ${
                                  isChecked 
                                    ? isDark ? 'bg-amber-950/40 text-amber-200' : 'bg-amber-100 text-amber-900'
                                    : isDark ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-white text-slate-700'
                                }`}
                              >
                                {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" /> : <Square className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />}
                                <span className="flex-1">{item}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Madya */}
                      <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                            Tingkat Madya (Menengah)
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {currentModule.competencies?.madya?.map((item, i) => {
                            const key = `madya-${i}`;
                            const isChecked = !!checkedMadya[key];
                            return (
                              <div
                                key={i}
                                onClick={() => setCheckedMadya(prev => ({ ...prev, [key]: !prev[key] }))}
                                className={`p-2 rounded-lg text-[11px] flex items-start gap-2 cursor-pointer transition-colors ${
                                  isChecked 
                                    ? isDark ? 'bg-purple-950/40 text-purple-200' : 'bg-purple-100 text-purple-900'
                                    : isDark ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-white text-slate-700'
                                }`}
                              >
                                {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" /> : <Square className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />}
                                <span className="flex-1">{item}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Utama */}
                      <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            Tingkat Utama (Lanjutan)
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {currentModule.competencies?.utama?.map((item, i) => {
                            const key = `utama-${i}`;
                            const isChecked = !!checkedUtama[key];
                            return (
                              <div
                                key={i}
                                onClick={() => setCheckedUtama(prev => ({ ...prev, [key]: !prev[key] }))}
                                className={`p-2 rounded-lg text-[11px] flex items-start gap-2 cursor-pointer transition-colors ${
                                  isChecked 
                                    ? isDark ? 'bg-emerald-950/40 text-emerald-200' : 'bg-emerald-100 text-emerald-900'
                                    : isDark ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-white text-slate-700'
                                }`}
                              >
                                {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> : <Square className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />}
                                <span className="flex-1">{item}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SECTION 4: MATERI TERKAIT & BERKAS UNDUHAN (FITUR UTAMA) */}
                {activeSection === 'RELATED_MATERIALS' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-teal-400" />
                        <h4 className={`text-sm sm:text-base font-bold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Materi Terkait, Bahan Ajar & Lampiran Resmi
                        </h4>
                      </div>
                      <span className="text-[11px] text-teal-400 font-semibold">
                        Akses Terbuka untuk Anggota & Pembina
                      </span>
                    </div>

                    {/* Sub-A: Berkas Panduan & Modul PDF */}
                    <div className="space-y-2">
                      <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        📄 Berkas Panduan & Lembar Kerja PDF:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {currentModule.materials?.downloads?.map((file) => (
                          <div
                            key={file.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 font-bold text-xs">
                                PDF
                              </span>
                              <div className="min-w-0">
                                <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {file.title}
                                </p>
                                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {file.fileSize || 'Dokumen Resmi'} • Terverifikasi
                                </p>
                              </div>
                            </div>

                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                            >
                              <Download className="w-3 h-3" />
                              <span>Unduh</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sub-B: Matriks Tabel Kompetensi Khusus */}
                    {currentModule.materials?.tables && currentModule.materials.tables.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                          <TableIcon className="w-3.5 h-3.5" />
                          <span>Matriks Indikator Kecakapan Krida:</span>
                        </div>
                        <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                          <table className="w-full text-left text-xs">
                            <thead className={isDark ? 'bg-slate-950 text-slate-300 font-bold' : 'bg-slate-100 text-slate-700 font-bold'}>
                              <tr>
                                <th className="p-2.5 border-b border-slate-800">Aspek / Unsur</th>
                                <th className="p-2.5 border-b border-slate-800">Tingkat Purwa</th>
                                <th className="p-2.5 border-b border-slate-800">Tingkat Madya</th>
                                <th className="p-2.5 border-b border-slate-800">Tingkat Utama</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                              {currentModule.materials.tables.map((row, rIdx) => (
                                <tr key={rIdx} className={isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}>
                                  <td className="p-2.5 font-semibold text-purple-400">{row.aspect}</td>
                                  <td className="p-2.5">{row.purwa}</td>
                                  <td className="p-2.5">{row.madya}</td>
                                  <td className="p-2.5">{row.utama}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Sub-C: Referensi Tautan Eksternal & Video Terkait */}
                    {currentModule.materials?.links && currentModule.materials.links.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        <div className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          🌐 Tautan Referensi & Video Pendukung:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentModule.materials.links.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-3 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 transition-all ${
                                isDark
                                  ? 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <ExternalLink className="w-3 h-3 text-purple-400" />
                              <span>{link.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Fullscreen Reader Modal (No Scrolling, Only Next >> & Back <<) */}
      <KridaFullScreenReaderModal
        isOpen={isInternalReaderOpen}
        onClose={() => setIsInternalReaderOpen(false)}
        modules={modules}
        initialModuleId={readerModuleId || selectedModuleId}
      />
    </div>
  );
};
