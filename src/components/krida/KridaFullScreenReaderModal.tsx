import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FolderOpen,
  Award,
  CheckCircle2,
  FileText,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Compass,
  FileCheck,
  Bookmark,
  CheckSquare
} from 'lucide-react';
import { KridaModuleItem, KridaCategoryInfo, KridaId } from '../../types';
import { KRIDA_CATEGORIES } from '../../data/kridaData';

export type ReaderTheme = 'dark' | 'sepia' | 'light';
export type TextSize = 'sm' | 'base' | 'lg';

interface KridaFullScreenReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: KridaModuleItem[];
  initialModuleId?: string;
  initialDocumentId?: string;
}

// Additional Official Saka Pariwisata Regulatory Documents
interface OfficialDocument {
  id: string;
  category: 'REGULASI' | 'PANDUAN' | 'ETIKA';
  title: string;
  subtitle: string;
  code: string;
  badge: string;
  description: string;
  slides: {
    title: string;
    sectionTitle: string;
    tag: string;
    contentParagraphs: string[];
    bulletPoints?: string[];
    keyHighlights?: { label: string; value: string }[];
  }[];
}

const OFFICIAL_DOCUMENTS: OfficialDocument[] = [
  {
    id: 'doc-juklak-177',
    category: 'REGULASI',
    title: 'Petunjuk Penyelenggaraan Satuan Karya Pramuka Pariwisata',
    subtitle: 'Keputusan Kwartir Nasional Gerakan Pramuka No. 177',
    code: 'SK-177',
    badge: 'Juklak Kwarnas',
    description: 'Pedoman pokok pembentukan, struktur kepengurusan, tata kelola, dan pembinaan Saka Pariwisata tingkat Nasional, Daerah, Cabang, hingga Ranting.',
    slides: [
      {
        title: 'Bab I: Ketentuan Pokok & Latar Belakang',
        sectionTitle: 'Dasar Hukum & Falsafah Pembinaan',
        tag: 'Ketentuan Pokok',
        contentParagraphs: [
          'Satuan Karya Pramuka Pariwisata (Saka Pariwisata) adalah wadah pendidikan dan pembinaan bagi Pramuka Penegak dan Pandega untuk menyalurkan minat, mengembangkan bakat, kemampuan, dan pengalaman dalam bidang kepariwisataan.',
          'Kerjasama strategis antara Gerakan Pramuka dan Kementerian Pariwisata dan Ekonomi Kreatif RI untuk mencetak kader muda pariwisata yang berjiwa Pancasila dan berwawasan kebangsaan luas.'
        ],
        keyHighlights: [
          { label: 'Target Sasaran', value: 'Pramuka Penegak (16-20 th) & Pandega (21-25 th)' },
          { label: 'Mitra Pembina', value: 'Dinas Kebudayaan & Pariwisata / Pelaku Industri' },
          { label: 'Tujuan Pokok', value: 'Menciptakan Duta & Penggerak Sadar Wisata Indonesia' }
        ]
      },
      {
        title: 'Bab II: Struktur 4 Krida & 23 Kecakapan Khusus',
        sectionTitle: 'Pilar Bidang Kegiatan & Kategori Keahlian',
        tag: 'Spesialisasi Krida',
        contentParagraphs: [
          'Saka Pariwisata memiliki 4 (empat) Krida spesialisasi yang menaungi 23 mata Syarat Kecakapan Khusus (SKK):',
          '1. Krida Pemandu Wisata (8 SKK) - Fokus pada pemanduan wisata alam, budaya, susur sejarah, dan interpretasi atraksi.',
          '2. Krida Penyuluh Wisata (6 SKK) - Fokus pada edukasi Sadar Wisata, Sapta Pesona, ekowisata, dan konservasi alam.',
          '3. Krida Kuliner & Cinderamata (5 SKK) - Fokus pada gastronomi lokal, panganan khas daerah, dan kerajinan kriya UMKM.',
          '4. Krida MICE & Event Wisata (4 SKK) - Fokus pada perencanaan pameran, festival, konvensi, dan promosi multimedia.'
        ],
        bulletPoints: [
          'Tingkatan Uji: Purwa (Dasar), Madya (Menengah), dan Utama (Instruktur).',
          'Penganugerahan Tanda Kecakapan Khusus (TKK) disematkan di lengan kanan seragam pramuka.'
        ]
      },
      {
        title: 'Bab III: Tata Cara Ujian & Pelantikan TKK',
        sectionTitle: 'Pedoman Teknis Penguji & Penganugerahan',
        tag: 'Sertifikasi TKK',
        contentParagraphs: [
          'Pengujian SKK dilakukan oleh Tim Penguji yang terdiri dari Pamong Saka, Instruktur Saka dari dinas/industri pariwisata, dan tokoh profesional kepariwisataan bersertifikasi.',
          'Ujian bersifat teori terapan, simulasi peran, dan praktik nyata di destinasi pariwisata atau kegiatan kepramukaan daerah.'
        ],
        keyHighlights: [
          { label: 'Syarat Purwa', value: 'Penguasaan konsep dasar & observasi mandiri' },
          { label: 'Syarat Madya', value: 'Simulasi lapangan & penyusunan laporan operasional' },
          { label: 'Syarat Utama', value: 'Kemampuan melatih adik angkatan & memimpin giat' }
        ]
      }
    ]
  },
  {
    id: 'doc-sapta-pesona',
    category: 'PANDUAN',
    title: 'Pedoman Sadar Wisata & 7 Unsur Sapta Pesona',
    subtitle: 'Standar Budaya Pelayanan & Citra Destinasi Pariwisata Indonesia',
    code: 'SP-07',
    badge: 'Sadar Wisata',
    description: 'Panduan operasional penerapan 7 unsur Sapta Pesona di destinasi wisata, desa wisata, dan kegiatan komunitas masyarakat.',
    slides: [
      {
        title: 'Sapta Pesona: 7 Pilar Citra Wisata Ramah',
        sectionTitle: 'Prinsip Sadar Wisata',
        tag: 'Konsep Dasar',
        contentParagraphs: [
          'Sapta Pesona merupakan kondisi yang harus diwujudkan dalam rangka menarik minat wisatawan berkunjung ke suatu daerah/destinasi di Indonesia.',
          'Pramuka Saka Pariwisata bertindak sebagai pelopor dan teladan dalam mengedukasi masyarakat lokal agar destinasi menjadi tempat yang menyenangkan dan berdaya saing global.'
        ],
        bulletPoints: [
          '1. Aman: Wisatawan merasa bebas dari rasa takut, kejahatan, penipuan, dan marabahaya.',
          '2. Tertib: Destinasi teratur, disiplin antrean, taat aturan lalu lintas, dan manajemen waktu tepat.',
          '3. Bersih: Lingkungan bebas sampah, sanitasi toilet bersih, dan higienitas makanan terjamin.'
        ]
      },
      {
        title: 'Lanjutan 4 Unsur Sapta Pesona',
        sectionTitle: 'Estetika, Keramahan & Daya Ingat Destinasi',
        tag: 'Karakter & Etika',
        contentParagraphs: [
          'Empat unsur berikutnya berfokus pada atmosfer destinasi serta interaksi antar manusia yang meninggalkan impresi mendalam:',
          '4. Sejuk: Lingkungan asri, penghijauan terawat, ventilasi nyaman, dan pelestarian alam rindang.',
          '5. Indah: Tata ruang estetis, harmoni arsitektur tradisional, dan pemandangan tertata elok.',
          '6. Ramah Tamah: Senyum, salam, sapa, sopan, dan santun (5S) kepada setiap tamu.',
          '7. Kenangan: Pengalaman autentik, cinderamata unik, dan keramahan yang membekas di hati.'
        ],
        keyHighlights: [
          { label: 'Peran Saka', value: 'Edukator & Relawan Aksi Bersih Destinasi' },
          { label: 'Dampak Nyata', value: 'Peningkatan Kunjungan & Lama Tinggal (Length of Stay)' }
        ]
      }
    ]
  },
  {
    id: 'doc-kode-etik-unwto',
    category: 'ETIKA',
    title: 'Kode Etik Kepariwisataan Dunia (UNWTO Global Code of Ethics)',
    subtitle: 'Pedoman Perilaku Bertanggung Jawab bagi Insan Pariwisata Global',
    code: 'UNWTO-CE',
    badge: 'Standar Global',
    description: 'Prinsip universal pengembangan pariwisata yang berkelanjutan, adil, menghormati hak asasi, melestarikan warisan budaya, dan menjaga ekosistem bumi.',
    slides: [
      {
        title: 'Prinsip I: Pemahaman & Saling Menghormati',
        sectionTitle: 'Pariwisata sebagai Jembatan Perdamaian Antar Bangsa',
        tag: 'Pariwisata Damai',
        contentParagraphs: [
          'Pariwisata berkontribusi pada saling pengertian dan saling menghormati antara manusia dan masyarakat.',
          'Kegiatan kepariwisataan harus dilaksanakan dalam harmoni dengan tradisi, adat istiadat, serta hukum setempat. Wisatawan berkewajiban mempelajari dan menghormati norma daerah tujuan.'
        ],
        keyHighlights: [
          { label: 'Inklusivitas', value: 'Terbuka bagi seluruh lapisan tanpa diskriminasi' },
          { label: 'Toleransi', value: 'Menghargai keragaman religi, suku, dan budaya' }
        ]
      },
      {
        title: 'Prinsip II: Keberlanjutan Lingkungan Hidup',
        sectionTitle: 'Pariwisata Hijau & Konservasi Sumber Daya Alam',
        tag: 'Green Tourism',
        contentParagraphs: [
          'Pengembangan pariwisata wajib melestarikan lingkungan hidup dan sumber daya alam demi memenuhi kebutuhan generasi saat ini dan generasi masa depan secara berkeadilan.',
          'Pramuka Saka Pariwisata mengusung gerakan "Leave No Trace" (Tidak meninggalkan apapun selain jejak, tidak mengambil apapun selain foto, tidak membunuh apapun selain waktu).'
        ],
        bulletPoints: [
          'Pengurangan jejak karbon dan larangan penggunaan plastik sekali pakai di destinasi.',
          'Konservasi flora fauna endemik dan perlindungan situs cagar budaya nasional.'
        ]
      }
    ]
  }
];

export const KridaFullScreenReaderModal: React.FC<KridaFullScreenReaderModalProps> = ({
  isOpen,
  onClose,
  modules,
  initialModuleId,
  initialDocumentId
}) => {
  // Mode selection: either a Krida Module or an Official Regulatory Document
  const [activeType, setActiveType] = useState<'MODULE' | 'OFFICIAL_DOC'>('MODULE');
  const [selectedModuleId, setSelectedModuleId] = useState<string>(() => {
    return initialModuleId || (modules[0]?.id ?? '');
  });
  const [selectedDocId, setSelectedDocId] = useState<string>(() => {
    return initialDocumentId || OFFICIAL_DOCUMENTS[0].id;
  });

  // Current page / slide index within the active item
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Reader Preferences
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [textSize, setTextSize] = useState<TextSize>('base');
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Sync initial module if prop changes
  useEffect(() => {
    if (initialDocumentId) {
      setActiveType('OFFICIAL_DOC');
      setSelectedDocId(initialDocumentId);
      setCurrentSlideIndex(0);
    } else if (initialModuleId) {
      setActiveType('MODULE');
      setSelectedModuleId(initialModuleId);
      setCurrentSlideIndex(0);
    }
  }, [initialModuleId, initialDocumentId]);

  const currentModule = useMemo(() => {
    return modules.find(m => m.id === selectedModuleId) || modules[0];
  }, [modules, selectedModuleId]);

  const currentDoc = useMemo(() => {
    return OFFICIAL_DOCUMENTS.find(d => d.id === selectedDocId) || OFFICIAL_DOCUMENTS[0];
  }, [selectedDocId]);

  // Generate strictly bounded, no-scroll slides for the current module
  const moduleSlides = useMemo(() => {
    if (!currentModule) return [];

    const slides: {
      type: 'COVER' | 'SYLLABUS_1' | 'SYLLABUS_2' | 'CONTENT_1' | 'CONTENT_2' | 'SKK_PURWA' | 'SKK_MADYA' | 'SKK_UTAMA' | 'MATRIX' | 'DOWNLOADS';
      title: string;
      sectionSubtitle: string;
      badgeText: string;
    }[] = [
      {
        type: 'COVER',
        title: currentModule.title,
        sectionSubtitle: 'Identitas & Ikhtisar Kompetensi Modul',
        badgeText: `SKK ${currentModule.kridaName}`
      },
      {
        type: 'SYLLABUS_1',
        title: 'Silabus Pelatihan: Sesi 1 & 2 (Teori & Orientasi)',
        sectionSubtitle: 'Pembelajaran Tatap Muka & Pengenalan Konsep',
        badgeText: 'Kurikulum Resmi'
      },
      {
        type: 'SYLLABUS_2',
        title: 'Silabus Pelatihan: Sesi 3 & 4 (Praktik & Evaluasi)',
        sectionSubtitle: 'Simulasi Lapangan & Pengujian Kompetensi',
        badgeText: 'Kurikulum Resmi'
      },
      {
        type: 'CONTENT_1',
        title: 'Naskah Materi Inti: Konsep & Prinsip Pokok',
        sectionSubtitle: 'Dasar Keahlian Mata Krida Saka Pariwisata',
        badgeText: 'Naskah Teori Terapan'
      },
      {
        type: 'CONTENT_2',
        title: 'Naskah Materi Inti: Panduan Kerja & Prosedur Teknis',
        sectionSubtitle: 'Standar Operasional Lapangan di Destinasi',
        badgeText: 'Naskah Teori Terapan'
      },
      {
        type: 'SKK_PURWA',
        title: 'Syarat Kecakapan Khusus (SKK) - Tingkat Purwa',
        sectionSubtitle: 'TKK Segitiga Merah: Kualifikasi Dasar Penegak & Pandega',
        badgeText: 'Uji SKK Purwa'
      },
      {
        type: 'SKK_MADYA',
        title: 'Syarat Kecakapan Khusus (SKK) - Tingkat Madya',
        sectionSubtitle: 'TKK Persegi Merah: Kualifikasi Terampil & Simulasi Mandiri',
        badgeText: 'Uji SKK Madya'
      },
      {
        type: 'SKK_UTAMA',
        title: 'Syarat Kecakapan Khusus (SKK) - Tingkat Utama',
        sectionSubtitle: 'TKK Segilima Merah: Kualifikasi Ahli & Asisten Instruktur',
        badgeText: 'Uji SKK Utama'
      },
      {
        type: 'MATRIX',
        title: 'Matriks Indikator Kecakapan Antar Tingkat',
        sectionSubtitle: 'Perbandingan Aspek Teori, Praktik, dan Etika Krida',
        badgeText: 'Matriks Asesmen'
      },
      {
        type: 'DOWNLOADS',
        title: 'Dokumen Resmi, Berkas SKK & Tautan Regulasi',
        sectionSubtitle: 'Arsip Digital Siap Unduh untuk Pelatihan',
        badgeText: 'Dokumen Terlampir'
      }
    ];

    return slides;
  }, [currentModule]);

  // Total slides for current active selection
  const totalSlides = activeType === 'MODULE' 
    ? moduleSlides.length 
    : (currentDoc?.slides.length || 1);

  // Keep slide in bounds when switching
  useEffect(() => {
    if (currentSlideIndex >= totalSlides) {
      setCurrentSlideIndex(0);
    }
  }, [totalSlides, currentSlideIndex]);

  // Navigation handlers
  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    } else {
      // If at page 0, jump to previous module if in MODULE mode
      if (activeType === 'MODULE') {
        const currentIndex = modules.findIndex(m => m.id === selectedModuleId);
        if (currentIndex > 0) {
          setSelectedModuleId(modules[currentIndex - 1].id);
          setCurrentSlideIndex(0);
        }
      }
    }
  }, [currentSlideIndex, activeType, modules, selectedModuleId]);

  const handleNextSlide = useCallback(() => {
    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      // If at last page, jump to next module if in MODULE mode
      if (activeType === 'MODULE') {
        const currentIndex = modules.findIndex(m => m.id === selectedModuleId);
        if (currentIndex < modules.length - 1) {
          setSelectedModuleId(modules[currentIndex + 1].id);
          setCurrentSlideIndex(0);
        }
      }
    }
  }, [currentSlideIndex, totalSlides, activeType, modules, selectedModuleId]);

  // Keyboard navigation: ArrowLeft, ArrowRight, Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isPickerOpen) {
          setIsPickerOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNextSlide, handlePrevSlide, isPickerOpen, onClose]);

  // Toggle browser fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsBrowserFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsBrowserFullscreen(false);
    }
  };

  if (!isOpen) return null;

  // Visual Theme Classes
  const themeClasses = {
    dark: {
      bg: 'bg-slate-950 text-slate-100',
      headerBg: 'bg-slate-900/90 border-slate-800 text-slate-100',
      cardBg: 'bg-slate-900/70 border-slate-800 text-slate-200',
      subCardBg: 'bg-slate-950 border-slate-800/80',
      footerBg: 'bg-slate-900/90 border-slate-800 text-slate-200',
      accentText: 'text-purple-400',
      badgeBg: 'bg-purple-950/80 text-purple-300 border-purple-800/80',
      mutedText: 'text-slate-400',
      highlightBorder: 'border-purple-500/40',
      progressTrack: 'bg-slate-800',
      progressFill: 'bg-gradient-to-r from-purple-500 to-indigo-500'
    },
    sepia: {
      bg: 'bg-[#FAF4E8] text-[#3D2C1F]',
      headerBg: 'bg-[#EFE5D0] border-[#DFCBB5] text-[#3D2C1F]',
      cardBg: 'bg-[#F4EBDB] border-[#DFCBB5] text-[#3D2C1F]',
      subCardBg: 'bg-[#EAE0CD] border-[#DFCBB5]',
      footerBg: 'bg-[#EFE5D0] border-[#DFCBB5] text-[#3D2C1F]',
      accentText: 'text-[#8A4A1C]',
      badgeBg: 'bg-[#E3D1BA] text-[#5C3214] border-[#DFCBB5]',
      mutedText: 'text-[#6D5A4A]',
      highlightBorder: 'border-[#B88755]',
      progressTrack: 'bg-[#DFCBB5]',
      progressFill: 'bg-[#8A4A1C]'
    },
    light: {
      bg: 'bg-slate-50 text-slate-900',
      headerBg: 'bg-white border-slate-200 text-slate-900 shadow-xs',
      cardBg: 'bg-white border-slate-200 text-slate-800 shadow-sm',
      subCardBg: 'bg-slate-50 border-slate-200',
      footerBg: 'bg-white border-slate-200 text-slate-800 shadow-xs',
      accentText: 'text-purple-700',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
      mutedText: 'text-slate-600',
      highlightBorder: 'border-purple-300',
      progressTrack: 'bg-slate-200',
      progressFill: 'bg-purple-600'
    }
  }[theme];

  // Font size classes
  const fontClasses = {
    sm: 'text-xs sm:text-sm',
    base: 'text-xs sm:text-base',
    lg: 'text-sm sm:text-lg'
  }[textSize];

  // Render individual slide for Krida Module (Strictly No Scrolling)
  const renderModuleSlideContent = (slideType: string) => {
    if (!currentModule) return null;

    const purwaList = (currentModule.testRequirements?.purwa?.length ? currentModule.testRequirements.purwa : currentModule.competencies?.purwa) || [];
    const madyaList = (currentModule.testRequirements?.madya?.length ? currentModule.testRequirements.madya : currentModule.competencies?.madya) || [];
    const utamaList = (currentModule.testRequirements?.utama?.length ? currentModule.testRequirements.utama : currentModule.competencies?.utama) || [];
    const syllabusList = currentModule.syllabus || [];
    const downloadsList = (currentModule.materials?.downloads?.length ? currentModule.materials.downloads : currentModule.downloads) || [];

    switch (slideType) {
      case 'COVER':
        return (
          <div className="h-full flex flex-col justify-between py-2 sm:py-4">
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${themeClasses.badgeBg}`}>
                  {currentModule.kridaName}
                </span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold ${themeClasses.badgeBg}`}>
                  Kode Mata Krida {currentModule.code}
                </span>
                <span className={`text-xs font-semibold ${themeClasses.mutedText}`}>
                  Standar Uji: {currentModule.levelSKK}
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold font-heading tracking-tight leading-tight">
                {currentModule.title}
              </h2>
              
              {currentModule.subtitle && (
                <p className={`text-sm sm:text-base font-medium ${themeClasses.accentText}`}>
                  {currentModule.subtitle}
                </p>
              )}

              <p className={`leading-relaxed line-clamp-3 sm:line-clamp-4 ${fontClasses} ${themeClasses.mutedText}`}>
                {currentModule.description}
              </p>
            </div>

            {/* Quick Overview Bento Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-2">
              <div className={`p-3 rounded-2xl border ${themeClasses.subCardBg}`}>
                <div className={`text-[10px] font-bold uppercase ${themeClasses.mutedText}`}>Alokasi Pelatihan</div>
                <div className="text-base sm:text-lg font-bold mt-1">4 Pertemuan</div>
                <div className={`text-[10px] ${themeClasses.mutedText}`}>± {currentModule.estimatedHours || 12} Jam Pelajaran</div>
              </div>
              <div className={`p-3 rounded-2xl border ${themeClasses.subCardBg}`}>
                <div className={`text-[10px] font-bold uppercase ${themeClasses.mutedText}`}>Jenjang SKK</div>
                <div className="text-base sm:text-lg font-bold mt-1 text-emerald-500">Purwa • Madya • Utama</div>
                <div className={`text-[10px] ${themeClasses.mutedText}`}>Tanda Kecakapan Khusus</div>
              </div>
              <div className={`p-3 rounded-2xl border ${themeClasses.subCardBg}`}>
                <div className={`text-[10px] font-bold uppercase ${themeClasses.mutedText}`}>Format Bahan</div>
                <div className="text-base sm:text-lg font-bold mt-1 text-purple-400">Modul & Dokumen</div>
                <div className={`text-[10px] ${themeClasses.mutedText}`}>Silabus & Panduan Lapangan</div>
              </div>
              <div className={`p-3 rounded-2xl border ${themeClasses.subCardBg}`}>
                <div className={`text-[10px] font-bold uppercase ${themeClasses.mutedText}`}>Kelulusan Uji</div>
                <div className="text-base sm:text-lg font-bold mt-1 text-amber-400">TKK Resmi</div>
                <div className={`text-[10px] ${themeClasses.mutedText}`}>Pamong & Tim Penguji</div>
              </div>
            </div>

            {/* Hint for navigation */}
            <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${themeClasses.subCardBg}`}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium">
                  Gunakan tombol <strong>Next &gt;&gt;</strong> di bawah untuk membuka silabus dan materi lengkap tanpa scrolling.
                </span>
              </div>
              <span className={`text-[10px] font-mono shrink-0 hidden sm:inline ${themeClasses.mutedText}`}>
                [Bisa gunakan tombol panah keyboard]
              </span>
            </div>
          </div>
        );

      case 'SYLLABUS_1': {
        const s1 = syllabusList[0];
        const s2 = syllabusList[1];
        return (
          <div className="h-full flex flex-col justify-between py-1 sm:py-2">
            <div className="space-y-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${themeClasses.accentText}`}>
                Bagian 1 dari 2: Pembelajaran Tatap Muka
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-heading">
                Silabus Kurikulum & Sesi Latihan Tatap Muka
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2 flex-1 items-stretch">
              {/* Sesi 1 */}
              <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between ${themeClasses.subCardBg}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-purple-600 text-white font-mono text-[11px] font-bold">
                      Sesi 01: {s1 ? `${s1.sessionNumber}` : '1'}
                    </span>
                    <span className={`text-xs font-mono ${themeClasses.mutedText}`}>{s1?.duration || '120 Menit'}</span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base leading-snug">
                    {s1?.topic || 'Pengantar Konsep & Landasan Teori Mata Krida'}
                  </h4>
                  <div className={`text-xs space-y-1.5 pt-1 ${themeClasses.mutedText}`}>
                    <p><strong>Metode:</strong> {s1?.method || 'Presentasi, Diskusi Interaktif & Telaah Studi Kasus'}</p>
                    <p><strong>Capaian:</strong> {s1?.competencies || 'Memahami definisi operasional, regulasi pendukung, dan etika kepariwisataan.'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/50 text-[11px] text-emerald-400 font-medium">
                  ✓ Target: Penguasaan dasar teori SKK Purwa
                </div>
              </div>

              {/* Sesi 2 */}
              <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between ${themeClasses.subCardBg}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-600 text-white font-mono text-[11px] font-bold">
                      Sesi 02: {s2 ? `${s2.sessionNumber}` : '2'}
                    </span>
                    <span className={`text-xs font-mono ${themeClasses.mutedText}`}>{s2?.duration || '120 Menit'}</span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base leading-snug">
                    {s2?.topic || 'Pendalaman Materi & Standar Operasional Pelayanan'}
                  </h4>
                  <div className={`text-xs space-y-1.5 pt-1 ${themeClasses.mutedText}`}>
                    <p><strong>Metode:</strong> {s2?.method || 'Simulasi Peran (Role Play), Bedah Lembar Kerja & Diskusi Tim'}</p>
                    <p><strong>Capaian:</strong> {s2?.competencies || 'Mampu mengidentifikasi instrumen teknis dan prosedur keselamatan kerja.'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/50 text-[11px] text-emerald-400 font-medium">
                  ✓ Target: Kesiapan simulasi lapangan SKK Madya
                </div>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${themeClasses.subCardBg}`}>
              <span>Lanjut ke sesi simulasi praktik lapangan &amp; pengujian kelulusan:</span>
              <span className={`font-bold ${themeClasses.accentText}`}>Klik &quot;Next &gt;&gt;&quot;</span>
            </div>
          </div>
        );
      }

      case 'SYLLABUS_2': {
        const s3 = syllabusList[2];
        const s4 = syllabusList[3];
        return (
          <div className="h-full flex flex-col justify-between py-1 sm:py-2">
            <div className="space-y-1">
              <span className={`text-xs font-bold uppercase tracking-wider text-indigo-400`}>
                Bagian 2 dari 2: Simulasi Praktik & Evaluasi
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-heading">
                Silabus Sesi Praktik Lapangan & Asesmen Akhir
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-2 flex-1 items-stretch">
              {/* Sesi 3 */}
              <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between ${themeClasses.subCardBg}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-600 text-white font-mono text-[11px] font-bold">
                      Sesi 03: {s3 ? `${s3.sessionNumber}` : '3'}
                    </span>
                    <span className={`text-xs font-mono ${themeClasses.mutedText}`}>{s3?.duration || '180 Menit'}</span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base leading-snug">
                    {s3?.topic || 'Simulasi Lapangan & Ekskursi Destinasi Wisata'}
                  </h4>
                  <div className={`text-xs space-y-1.5 pt-1 ${themeClasses.mutedText}`}>
                    <p><strong>Metode:</strong> {s3?.method || 'Praktik Langsung di Daya Tarik Wisata / Mitra Usaha Kepariwisataan'}</p>
                    <p><strong>Aktivitas:</strong> {s3?.activities || 'Praktek pemanduan, pengamatan Sapta Pesona, atau simulasi produksi kuliner/event.'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/50 text-[11px] text-amber-400 font-medium">
                  ✓ Target: Penguasaan keterampilan nyata & pengamatan mandiri
                </div>
              </div>

              {/* Sesi 4 */}
              <div className={`p-3.5 sm:p-4 rounded-2xl border flex flex-col justify-between ${themeClasses.subCardBg}`}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[11px] font-bold">
                      Sesi 04: {s4 ? `${s4.sessionNumber}` : '4'}
                    </span>
                    <span className={`text-xs font-mono ${themeClasses.mutedText}`}>{s4?.duration || '120 Menit'}</span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base leading-snug">
                    {s4?.topic || 'Ujian SKK, Refleksi Pembelajaran & Pengukuhan TKK'}
                  </h4>
                  <div className={`text-xs space-y-1.5 pt-1 ${themeClasses.mutedText}`}>
                    <p><strong>Metode:</strong> {s4?.method || 'Uji Kompetensi di Hadapan Pamong & Instruktur Kejuruan Saka'}</p>
                    <p><strong>Capaian:</strong> {s4?.competencies || 'Evaluasi kelayakan SKK Purwa, Madya, atau Utama sesuai kriteria penilaian.'}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-800/50 text-[11px] text-emerald-400 font-medium">
                  ✓ Target: Penganugerahan Tanda Kecakapan Khusus (TKK)
                </div>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${themeClasses.subCardBg}`}>
              <span>Berikutnya naskah materi modul yang disajikan secara ringkas per bab:</span>
              <span className={`font-bold ${themeClasses.accentText}`}>Klik &quot;Next &gt;&gt;&quot;</span>
            </div>
          </div>
        );
      }

      case 'CONTENT_1': {
        // First half of content (Definition and Core Principles)
        return (
          <div className="h-full flex flex-col justify-between py-1 sm:py-2">
            <div className="space-y-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${themeClasses.accentText}`}>
                Naskah Materi Modul - Bagian 1
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-heading">
                Konsep Inti, Definisi &amp; Urgensi Mata Krida
              </h3>
            </div>

            <div className={`p-4 sm:p-6 rounded-2xl border my-2 flex-1 flex flex-col justify-between ${themeClasses.subCardBg}`}>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Bookmark className="w-4 h-4" />
                  <span>Landasan Keahlian &amp; Standar Kompetensi Nasional</span>
                </div>
                <p className={`leading-relaxed ${fontClasses}`}>
                  Materi <strong>{currentModule.title}</strong> dirumuskan untuk membekali Pramuka Penegak dan Pandega dengan pengetahuan terapan yang selaras dengan Standar Kompetensi Kerja Nasional Indonesia (SKKNI) sektor pariwisata.
                </p>
                <div className={`p-3.5 rounded-xl border space-y-2 text-xs sm:text-sm ${themeClasses.cardBg}`}>
                  <h5 className="font-bold text-purple-400">Poin Kunci yang Wajib Dikuasai:</h5>
                  <ul className="space-y-1.5 pl-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                      <span>Pemahaman menyeluruh mengenai ruang lingkup dan etika kerja mata krida {currentModule.title}.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                      <span>Kemampuan berkomunikasi efektif, ramah, dan solutif kepada wisatawan lokal maupun mancanegara.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                      <span>Penerapan 7 unsur Sapta Pesona dan keselamatan kerja di setiap aktivitas kepariwisataan.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className={`text-xs pt-2 border-t border-slate-800/60 flex items-center justify-between ${themeClasses.mutedText}`}>
                <span>Standar Pembinaan Saka Pariwisata Indonesia</span>
                <span>Halaman Materi 1/2</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${themeClasses.subCardBg}`}>
              <span>Lanjut ke prosedur teknis dan penerapan lapangan:</span>
              <span className={`font-bold ${themeClasses.accentText}`}>Klik &quot;Next &gt;&gt;&quot;</span>
            </div>
          </div>
        );
      }

      case 'CONTENT_2': {
        // Second half of content (Practical guidelines and implementation)
        return (
          <div className="h-full flex flex-col justify-between py-1 sm:py-2">
            <div className="space-y-1">
              <span className={`text-xs font-bold uppercase tracking-wider text-indigo-400`}>
                Naskah Materi Modul - Bagian 2
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-heading">
                Prosedur Teknis &amp; Panduan Tindakan Lapangan
              </h3>
            </div>

            <div className={`p-4 sm:p-6 rounded-2xl border my-2 flex-1 flex flex-col justify-between ${themeClasses.subCardBg}`}>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckSquare className="w-4 h-4" />
                  <span>Langkah Operasional &amp; Manajemen Risiko</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-3 rounded-xl border ${themeClasses.cardBg}`}>
                    <span className="text-[11px] font-bold text-purple-400 block mb-1">Tahap 1: Persiapan</span>
                    <p className="text-xs leading-relaxed text-slate-300">
                      Riset daya tarik objek wisata, kelengkapan peralatan teknis, kesiapan fisik, serta koordinasi tim pemandu/pelaksana.
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${themeClasses.cardBg}`}>
                    <span className="text-[11px] font-bold text-indigo-400 block mb-1">Tahap 2: Pelaksanaan</span>
                    <p className="text-xs leading-relaxed text-slate-300">
                      Eksekusi kegiatan ramah tamu, kepatuhan jadwal waktu, manajemen dinamika rombongan, dan mitigasi kondisi darurat.
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl border ${themeClasses.cardBg}`}>
                    <span className="text-[11px] font-bold text-emerald-400 block mb-1">Tahap 3: Pasca Kegiatan</span>
                    <p className="text-xs leading-relaxed text-slate-300">
                      Evaluasi umpan balik kepuasan peserta, pembersihan area (Leave No Trace), dan pelaporan administrasi ke Pamong.
                    </p>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-xs leading-relaxed ${themeClasses.cardBg}`}>
                  <strong className="text-amber-400">Pesan Pamong Saka:</strong> Seluruh anggota Saka Pariwisata wajib menjaga martabat Gerakan Pramuka dan citra pariwisata Indonesia dengan tidak memungut biaya tidak resmi dan senantiasa bersikap jujur.
                </div>
              </div>

              <div className={`text-xs pt-2 border-t border-slate-800/60 flex items-center justify-between ${themeClasses.mutedText}`}>
                <span>Standar Pembinaan Saka Pariwisata Indonesia</span>
                <span>Halaman Materi 2/2</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${themeClasses.subCardBg}`}>
              <span>Lanjut ke lembar instrumen uji SKK Purwa, Madya, dan Utama:</span>
              <span className={`font-bold ${themeClasses.accentText}`}>Klik &quot;Next &gt;&gt;&quot;</span>
            </div>
          </div>
        );
      }

      case 'SKK_PURWA': {
        return (
          <div className="h-full flex flex-col justify-between py-1 sm:py-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-red-600 rotate-45 inline-block" />
                <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Jenjang Pertama • TKK Segitiga Merah
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-heading">
                Instrumen Syarat Kecakapan Khusus (SKK) Tingkat Purwa
              </h3>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border my-2 flex-1 flex flex-col justify-between ${themeClasses.subCardBg}`}>
              <div className="space-y-3">
                <p className={`text-xs sm:text-sm ${themeClasses.mutedText}`}>
                  Kriteria pengujian tingkat dasar yang wajib dipenuhi oleh Pramuka Penegak/Pandega untuk memperoleh TKK Purwa:
                </p>

                <div className="space-y-2.5">
                  {purwaList.slice(0, 4).map((req, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex items-start gap-3 ${themeClasses.cardBg}`}>
                      <span className="w-5 h-5 rounded-md bg-red-600/20 text-red-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-red-500/40 font-mono">
                        {idx + 1}
                      </span>
                      <div className="flex-1 text-xs sm:text-sm leading-snug">
                        {req}
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    </div>
                  ))}
                  {purwaList.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Kriteria uji kompetensi Purwa mengacu pada pedoman standar Saka Pariwisata Nasional.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-xs text-red-200 flex items-center justify-between">
                <span>Penguji: Pamong Saka atau Instruktur Kejuruan yang ditunjuk</span>
                <span className="font-bold">Standar Purwa: Minimal 80% Penguasaan</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${themeClasses.subCardBg}`}>
              <span>Berikutnya instrumen uji SKK Tingkat Madya:</span>
              <span className={`font-bold ${themeClasses.accentText}`}>Klik &quot;Next &gt;&gt;&quot;</span>
            </div>
          </div>
        );
      }

      case 'SKK_MADYA': {
        return (
          <div className="h-full flex flex-col justify-between py-1 sm:py-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-xs bg-red-600 inline-block" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Jenjang Menengah • TKK Bujur Sangkar Merah
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-heading">
                Instrumen Syarat Kecakapan Khusus (SKK) Tingkat Madya
              </h3>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border my-2 flex-1 flex flex-col justify-between ${themeClasses.subCardBg}`}>
              <div className="space-y-3">
                <p className={`text-xs sm:text-sm ${themeClasses.mutedText}`}>
                  Kriteria pengujian tingkat menengah berorientasi pada simulasi mandiri dan pemecahan kasus lapangan:
                </p>

                <div className="space-y-2.5">
                  {madyaList.slice(0, 4).map((req, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex items-start gap-3 ${themeClasses.cardBg}`}>
                      <span className="w-5 h-5 rounded-md bg-amber-600/20 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/40 font-mono">
                        {idx + 1}
                      </span>
                      <div className="flex-1 text-xs sm:text-sm leading-snug">
                        {req}
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    </div>
                  ))}
                  {madyaList.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Kriteria uji kompetensi Madya mengacu pada pedoman standar Saka Pariwisata Nasional.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900/50 text-xs text-amber-200 flex items-center justify-between">
                <span>Prasyarat: Telah lulus SKK Purwa minimal 3 bulan sebelumnya</span>
                <span className="font-bold">Standar Madya: Praktik Lapangan Mandiri</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${themeClasses.subCardBg}`}>
              <span>Berikutnya instrumen uji SKK Tingkat Utama:</span>
              <span className={`font-bold ${themeClasses.accentText}`}>Klik &quot;Next &gt;&gt;&quot;</span>
            </div>
          </div>
        );
      }

      case 'SKK_UTAMA': {
        return (
          <div className="h-full flex flex-col justify-between py-1 sm:py-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-red-600 inline-block" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Jenjang Tertinggi • TKK Segilima Merah
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold font-heading">
                Instrumen Syarat Kecakapan Khusus (SKK) Tingkat Utama
              </h3>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border my-2 flex-1 flex flex-col justify-between ${themeClasses.subCardBg}`}>
              <div className="space-y-3">
                <p className={`text-xs sm:text-sm ${themeClasses.mutedText}`}>
                  Kriteria pengujian jenjang tertinggi dengan kapabilitas melatih, memimpin, dan membina anggota lainnya:
                </p>

                <div className="space-y-2.5">
                  {utamaList.slice(0, 4).map((req, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex items-start gap-3 ${themeClasses.cardBg}`}>
                      <span className="w-5 h-5 rounded-md bg-emerald-600/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/40 font-mono">
                        {idx + 1}
                      </span>
                      <div className="flex-1 text-xs sm:text-sm leading-snug">
                        {req}
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    </div>
                  ))}
                  {utamaList.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500">
                      Kriteria uji kompetensi Utama mengacu pada pedoman standar Saka Pariwisata Nasional.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/50 text-xs text-emerald-200 flex items-center justify-between">
                <span>Prasyarat: Telah aktif melatih anggota Purwa &amp; Madya di pangkalan Saka</span>
                <span className="font-bold">Standar Utama: Instruktur Muda Bersertifikat</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${themeClasses.subCardBg}`}>
              <span>Berikutnya matriks komparasi 3 aspek kompetensi:</span>
              <span className={`font-bold ${themeClasses.accentText}`}>Klik &quot;Next &gt;&gt;&quot;</span>
            </div>
          </div>
        );
      }

      case 'MATRIX': {
        return (
          <div className="h-full flex flex-col justify-between py-1 sm:py-2">
            <div className="space-y-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${themeClasses.accentText}`}>
                Matriks Asesmen Kompetensi
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-heading">
                Komparasi Tingkat Purwa, Madya &amp; Utama
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2 flex-1 items-stretch">
              <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${themeClasses.subCardBg}`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-red-600 rotate-45" />
                    <h5 className="font-bold text-sm text-red-400">Tingkat Purwa</h5>
                  </div>
                  <div className={`text-xs space-y-2 leading-relaxed ${themeClasses.mutedText}`}>
                    <p><strong>Teori (30%):</strong> Memahami konsep dan batasan materi pokok.</p>
                    <p><strong>Praktik (50%):</strong> Mampu melakukan demonstrasi dasar di bawah supervisi instruktur.</p>
                    <p><strong>Etika (20%):</strong> Menunjukkan sikap ramah, santun, dan disiplin waktu.</p>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-purple-400 pt-2 border-t border-slate-800">
                  Target: Penguasaan Dasar
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${themeClasses.subCardBg}`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-xs bg-amber-500" />
                    <h5 className="font-bold text-sm text-amber-400">Tingkat Madya</h5>
                  </div>
                  <div className={`text-xs space-y-2 leading-relaxed ${themeClasses.mutedText}`}>
                    <p><strong>Teori (20%):</strong> Mampu menganalisis kendala dan alternatif solusi lapangan.</p>
                    <p><strong>Praktik (60%):</strong> Eksekusi penugasan mandiri tanpa ketergantungan instruktur.</p>
                    <p><strong>Etika (20%):</strong> Berinisiatif membantu tim dan tanggap situasi darurat.</p>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-amber-400 pt-2 border-t border-slate-800">
                  Target: Keterampilan Mandiri
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${themeClasses.subCardBg}`}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                    <h5 className="font-bold text-sm text-emerald-400">Tingkat Utama</h5>
                  </div>
                  <div className={`text-xs space-y-2 leading-relaxed ${themeClasses.mutedText}`}>
                    <p><strong>Teori (20%):</strong> Merancang program kerja dan skenario pelatihan.</p>
                    <p><strong>Praktik (50%):</strong> Memimpin giat nyata di objek wisata serta menguji peserta.</p>
                    <p><strong>Etika (30%):</strong> Berjiwa teladan kepemimpinan dan berwawasan pelestarian budaya.</p>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-slate-800">
                  Target: Instruktur &amp; Pemimpin
                </div>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${themeClasses.subCardBg}`}>
              <span>Berikutnya dokumen digital dan lampiran berkas resmi:</span>
              <span className={`font-bold ${themeClasses.accentText}`}>Klik &quot;Next &gt;&gt;&quot;</span>
            </div>
          </div>
        );
      }

      case 'DOWNLOADS': {
        return (
          <div className="h-full flex flex-col justify-between py-1 sm:py-2">
            <div className="space-y-1">
              <span className={`text-xs font-bold uppercase tracking-wider text-emerald-400`}>
                Arsip Modul &amp; Lampiran Resmi
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-heading">
                Berkas Unduhan &amp; Tautan Regulasi Terkait
              </h3>
            </div>

            <div className={`p-4 sm:p-5 rounded-2xl border my-2 flex-1 flex flex-col justify-between ${themeClasses.subCardBg}`}>
              <div className="space-y-3">
                <p className={`text-xs sm:text-sm ${themeClasses.mutedText}`}>
                  Dokumen resmi dan petunjuk teknis yang dapat diunduh untuk bahan pembinaan di Gugus Depan dan Pangkalan Saka:
                </p>

                <div className="space-y-2.5">
                  {downloadsList.map((dl, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${themeClasses.cardBg}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h6 className="font-bold text-xs sm:text-sm truncate">{dl.title}</h6>
                          <p className={`text-[10px] font-mono ${themeClasses.mutedText}`}>
                            Format: {dl.fileType || 'PDF'} • Ukuran: {dl.fileSize || '1.8 MB'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={dl.url || dl.fileUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh PDF</span>
                      </a>
                    </div>
                  ))}

                  {/* Fallback general download */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${themeClasses.cardBg}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h6 className="font-bold text-xs sm:text-sm truncate">Lembar Instrumen Uji Kecakapan Khusus (Formulir SKK)</h6>
                        <p className={`text-[10px] font-mono ${themeClasses.mutedText}`}>
                          Format: PDF / Cetak Siap Pakai • Ukuran: 520 KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border border-slate-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Cetak Lembar</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-900/50 text-xs text-purple-200 flex items-center justify-between">
                <span>Anda telah membaca seluruh halaman untuk modul ini!</span>
                <span className="font-bold">Klik &quot;Next &gt;&gt;&quot; untuk modul berikutnya</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${themeClasses.subCardBg}`}>
              <span>Selesai membaca modul ini. Ingin pindah ke mata krida lain?</span>
              <span className={`font-bold ${themeClasses.accentText}`}>Gunakan Menu Pilih Dokumen di atas atau tombol Next</span>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Render Official Regulatory Document Slide
  const renderDocSlideContent = () => {
    if (!currentDoc) return null;
    const currentSlide = currentDoc.slides[currentSlideIndex] || currentDoc.slides[0];

    return (
      <div className="h-full flex flex-col justify-between py-1 sm:py-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${themeClasses.badgeBg}`}>
              {currentDoc.badge}
            </span>
            <span className={`text-xs font-mono font-bold ${themeClasses.mutedText}`}>
              {currentDoc.code}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-heading">
            {currentSlide.title}
          </h3>
          <p className={`text-xs sm:text-sm font-medium ${themeClasses.accentText}`}>
            {currentSlide.sectionTitle}
          </p>
        </div>

        <div className={`p-4 sm:p-5 rounded-2xl border my-2 flex-1 flex flex-col justify-between ${themeClasses.subCardBg}`}>
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              {currentSlide.contentParagraphs.map((para, idx) => (
                <p key={idx} className={`leading-relaxed ${fontClasses}`}>
                  {para}
                </p>
              ))}
            </div>

            {currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 && (
              <div className={`p-3 rounded-xl border space-y-1.5 text-xs sm:text-sm ${themeClasses.cardBg}`}>
                <h6 className="font-bold text-amber-400">Poin Penting:</h6>
                {currentSlide.bulletPoints.map((bp, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{bp}</span>
                  </div>
                ))}
              </div>
            )}

            {currentSlide.keyHighlights && currentSlide.keyHighlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {currentSlide.keyHighlights.map((kh, idx) => (
                  <div key={idx} className={`p-2.5 rounded-xl border ${themeClasses.cardBg}`}>
                    <div className={`text-[10px] font-bold uppercase ${themeClasses.mutedText}`}>{kh.label}</div>
                    <div className="text-xs sm:text-sm font-bold mt-0.5">{kh.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`text-xs pt-2 border-t border-slate-800/60 flex items-center justify-between ${themeClasses.mutedText}`}>
            <span>{currentDoc.title}</span>
            <span className="font-mono">Bagian {currentSlideIndex + 1} dari {currentDoc.slides.length}</span>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${themeClasses.subCardBg}`}>
          <span>Lanjut ke lembar berikutnya tanpa scroll:</span>
          <span className={`font-bold ${themeClasses.accentText}`}>Gunakan tombol &quot;Next &gt;&gt;&quot; di bawah</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col h-screen w-screen overflow-hidden select-none transition-colors duration-200 ${themeClasses.bg}`}>
      {/* 1. TOP HEADER (Navigation & Display Controls) */}
      <header className={`px-4 sm:px-6 py-3 border-b flex items-center justify-between gap-3 shrink-0 ${themeClasses.headerBg}`}>
        {/* Left: Document / Module Picker Drawer Toggle */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <button
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
              title="Pilih materi krida atau dokumen lain untuk dibaca"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Pilih Dokumen / SKK</span>
              <span className="sm:hidden">Pilih Materi</span>
            </button>

            {/* Dropdown / Picker Drawer Modal */}
            {isPickerOpen && (
              <div 
                className={`absolute left-0 top-full mt-2 w-72 sm:w-84 rounded-2xl border shadow-2xl p-3 z-50 space-y-3 ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                  <span className="text-xs font-bold uppercase tracking-wider">Daftar Materi Bacaan:</span>
                  <button 
                    onClick={() => setIsPickerOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Switch Category tabs: 23 SKK vs Dokumen Regulasi */}
                <div className="flex rounded-xl bg-slate-800/80 p-1 text-xs">
                  <button
                    onClick={() => setActiveType('MODULE')}
                    className={`flex-1 py-1 px-2 rounded-lg font-bold cursor-pointer transition-all ${
                      activeType === 'MODULE' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    23 Modul SKK
                  </button>
                  <button
                    onClick={() => setActiveType('OFFICIAL_DOC')}
                    className={`flex-1 py-1 px-2 rounded-lg font-bold cursor-pointer transition-all ${
                      activeType === 'OFFICIAL_DOC' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Dokumen Juklak
                  </button>
                </div>

                {/* List of items */}
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {activeType === 'MODULE' ? (
                    modules.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModuleId(m.id);
                          setCurrentSlideIndex(0);
                          setIsPickerOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          selectedModuleId === m.id
                            ? 'bg-purple-600 text-white font-bold'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{m.code} {m.title}</span>
                        <span className="text-[10px] opacity-70 shrink-0 font-mono ml-2">
                          {m.kridaId.substring(0, 3).toUpperCase()}
                        </span>
                      </button>
                    ))
                  ) : (
                    OFFICIAL_DOCUMENTS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setSelectedDocId(d.id);
                          setCurrentSlideIndex(0);
                          setIsPickerOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          selectedDocId === d.id
                            ? 'bg-purple-600 text-white font-bold'
                            : 'hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{d.title}</span>
                        <span className="text-[10px] opacity-70 shrink-0 font-mono ml-2">
                          {d.code}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current Document Indicator */}
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold truncate">
              {activeType === 'MODULE' ? currentModule?.title : currentDoc?.title}
            </h1>
            <p className={`text-[10px] truncate ${themeClasses.mutedText}`}>
              {activeType === 'MODULE' ? `${currentModule?.kridaName} • ${currentModule?.levelSKK}` : currentDoc?.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Preferences (Theme, Font, Fullscreen, Close) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme switcher */}
          <div className="flex items-center bg-slate-800/60 rounded-xl p-0.5 border border-slate-700/50">
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                theme === 'dark' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mode Gelap (OLED/Malam)"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('sepia')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                theme === 'sepia' ? 'bg-[#8A4A1C] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mode Buku Sepia (Kertas Lembut)"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                theme === 'light' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mode Terang (Siang Hari)"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Size Selector */}
          <div className="hidden sm:flex items-center bg-slate-800/60 rounded-xl p-0.5 border border-slate-700/50 text-[11px] font-bold font-mono">
            <button
              onClick={() => setTextSize('sm')}
              className={`px-2 py-1 rounded-lg cursor-pointer ${textSize === 'sm' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
              title="Ukuran Teks Ringkas"
            >
              A-
            </button>
            <button
              onClick={() => setTextSize('base')}
              className={`px-2 py-1 rounded-lg cursor-pointer ${textSize === 'base' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
              title="Ukuran Teks Standar"
            >
              A
            </button>
            <button
              onClick={() => setTextSize('lg')}
              className={`px-2 py-1 rounded-lg cursor-pointer ${textSize === 'lg' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
              title="Ukuran Teks Nyaman/Besar"
            >
              A+
            </button>
          </div>

          {/* Browser Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
            title="Toggle Layar Penuh Perangkat"
          >
            {isBrowserFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isBrowserFullscreen ? 'Keluar Full' : 'Layar Penuh'}</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            title="Tutup Mode Layar Penuh (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. PROGRESS BAR (Shows reading progress without any scrolling) */}
      <div className={`h-1.5 w-full ${themeClasses.progressTrack}`}>
        <div
          className={`h-full transition-all duration-300 ${themeClasses.progressFill}`}
          style={{ width: `${((currentSlideIndex + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* 3. MAIN READING CANVAS (Strictly 100% Viewport-Fitted, ZERO Scrolling) */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-3 sm:py-5 overflow-hidden flex flex-col justify-center">
        <div className={`h-full rounded-3xl border p-4 sm:p-7 flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${themeClasses.cardBg}`}>
          {activeType === 'MODULE' 
            ? renderModuleSlideContent(moduleSlides[currentSlideIndex]?.type || 'COVER')
            : renderDocSlideContent()
          }
        </div>
      </main>

      {/* 4. BOTTOM CONTROL BAR (ONLY next >> or back << navigation, NO scrolling) */}
      <footer className={`px-4 sm:px-8 py-3.5 sm:py-4 border-t shrink-0 flex items-center justify-between gap-3 ${themeClasses.footerBg}`}>
        {/* Button: back << */}
        <button
          type="button"
          onClick={handlePrevSlide}
          disabled={currentSlideIndex === 0 && (activeType !== 'MODULE' || modules.findIndex(m => m.id === selectedModuleId) === 0)}
          className={`flex items-center gap-2 px-5 sm:px-7 py-3 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${
            theme === 'sepia'
              ? 'bg-[#E3D1BA] hover:bg-[#D5BF9F] text-[#3D2C1F] border border-[#DFCBB5]'
              : theme === 'light'
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
          title="Halaman Sebelumnya (Tombol Panah Kiri)"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          <span>&lt;&lt; Kembali</span>
        </button>

        {/* Center: Slide Index / Status indicator */}
        <div className="text-center px-2">
          <div className="flex items-center justify-center gap-2">
            <span className={`text-xs sm:text-sm font-bold font-mono px-3 py-1 rounded-full border ${themeClasses.subCardBg}`}>
              Halaman {currentSlideIndex + 1} dari {totalSlides}
            </span>
          </div>
          <div className={`text-[10px] mt-1 font-medium hidden sm:block ${themeClasses.mutedText}`}>
            {activeType === 'MODULE' ? moduleSlides[currentSlideIndex]?.title : currentDoc?.slides[currentSlideIndex]?.title}
          </div>
        </div>

        {/* Button: next >> */}
        <button
          type="button"
          onClick={handleNextSlide}
          disabled={currentSlideIndex === totalSlides - 1 && (activeType !== 'MODULE' || modules.findIndex(m => m.id === selectedModuleId) === modules.length - 1)}
          className={`flex items-center gap-2 px-6 sm:px-8 py-3 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-lg active:scale-95 cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${
            theme === 'sepia'
              ? 'bg-[#8A4A1C] hover:bg-[#733B14] text-white shadow-[#8A4A1C]/20'
              : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-900/40'
          }`}
          title="Halaman Berikutnya (Tombol Panah Kanan)"
        >
          <span>
            {currentSlideIndex === totalSlides - 1 ? 'Lanjut Modul &gt;&gt;' : 'Next &gt;&gt;'}
          </span>
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </footer>
    </div>
  );
};
