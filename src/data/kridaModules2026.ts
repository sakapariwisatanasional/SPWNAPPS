// ============================================================================
// MODUL MATERI PEMBELAJARAN & KURIKULUM SKK 2026
// Berdasarkan: BUKU PANDUAN KRIDA DAN SYARAT KECAKAPAN KHUSUS SAKA PARIWISATA 2026
// Tim Penyusun: Rohadi Wijaya | Asrul Roza | H. Agus Sulaiman, SE.
// ============================================================================

import { KridaModuleItem } from '../types';

export const OFFICIAL_2026_KRIDA_MODULES: KridaModuleItem[] = [
  // =========================================================================
  // 1. KRIDA PEMANDU WISATA (8 SKK: PM-01 s/d PM-08)
  // =========================================================================
  {
    id: 'skk-pemandu-a',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: 'PM-01',
    title: 'Pengetahuan Daya Tarik Wisata',
    badge: 'SKK Pemandu (PM-01)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Pengenalan dan identifikasi daya tarik wisata alam, budaya, dan buatan, sejarah lokal, etika berkunjung, Sapta Pesona, serta teknik dasar interpretasi narasi wisata.',
    skkniReference: 'Standar Kompetensi Pemanduan & Pengelolaan Destinasi Wisata',
    specialSafetyNotes: 'Mematuhi etika kunjungan cagar budaya & konservasi alam.',
    practiceProduct: {
      purwa: 'Profil Sederhana Satu Daya Tarik Wisata Lokal (Fact Sheet, Etika Berkunjung, & Rute Akses)',
      madya: 'Profil Lengkap Daya Tarik Wisata Lokal disertai Materi Presentasi Wisata',
      utama: 'Paket Informasi dan Interpretasi Daya Tarik Wisata Komprehensif (Storytelling Kit)'
    },
    portfolioItems: [
      'Fact Sheet Objek Wisata',
      'Naskah Storytelling Interpretasi',
      'Foto/Video Simulasi Pemanduan',
      'Lembar Penilaian Uji SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Pengantar & Konsep Daya Tarik Wisata
Pengetahuan Daya Tarik Wisata adalah fondasi utama seorang pemandu wisata. Berdasarkan Buku Panduan SKK Saka Pariwisata 2026, pemandu berperan sebagai Duta Budaya dan Narator Wisata (Storyteller).

### Klasifikasi Daya Tarik Wisata (DTW):
1. **Daya Tarik Wisata Alam:** Keanekaragaman hayati, bentang alam pegunungan, pantai, kawah, dan kawasan konservasi.
2. **Daya Tarik Wisata Budaya:** Peninggalan sejarah purbakala, candi, keraton, arsitektur tradisional, upacara adat, dan kearifan lokal.
3. **Daya Tarik Wisata Buatan:** Museum, taman rekreasi tematik, sentra agrowisata, dan desa wisata binaan.

## 2. Teknik Interpretasi T-O-R-E
- **Theme (Tema Pokok):** Satu pesan inti yang mengikat narasi pemanduan.
- **Organized (Terstruktur):** Alur runtut dari pembuka, pengantar objek, keunikan, hingga pesan penutup.
- **Relevant (Relevan):** Mengaitkan fakta objek dengan kehidupan dan pengalaman wisatawan.
- **Enjoyable (Menyenangkan):** Dialog dua arah yang interaktif, santun, dan hangat.

## 3. Sistem Penilaian Ujian SKK
- Bobot: Pengetahuan 20%, Keterampilan 40%, Sikap Kerja 20%, Produk/Praktik 20%.
- Kelulusan: Nilai Akhir ≥ 80 dinyatakan MEMENUHI.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Pemetaan Potensi Daya Tarik Wisata Lokal & Sapta Pesona',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu mengidentifikasi 3 pilar daya tarik wisata (alam, budaya, buatan) dan prinsip Sapta Pesona.',
        method: 'Teori & Diskusi Interaktif'
      },
      {
        sessionNumber: 2,
        title: 'Riset Informasi & Penyusunan Fact Sheet Destinasi',
        duration: '4 JP (180 Menit)',
        competency: 'Menyusun lembar fakta sejarah, keunikan, dan etika berkunjung lokal secara akurat.',
        method: 'Praktik Studi Pustaka & Wawancara'
      },
      {
        sessionNumber: 3,
        title: 'Teknik Storytelling & Narasi Wisata Metode T-O-R-E',
        duration: '6 JP (270 Menit)',
        competency: 'Mendemonstrasikan narasi interpretasi 10 menit di depan wisatawan simulasi.',
        method: 'Simulasi Lapangan'
      }
    ],
    testRequirements: {
      purwa: [
        'Dapat menyebutkan dan menjelaskan minimal 5 daya tarik wisata di wilayah ranting/cabangnya.',
        'Mampu menceritakan sejarah singkat dan asal-usul salah satu destinasi budaya lokal dengan runtut.',
        'Mengetahui jam buka, aturan etika kunjungan, dan larangan adat pada destinasi yang dipelajari.',
        'Menghasilkan produk: Profil Sederhana Satu Daya Tarik Wisata Lokal.'
      ],
      madya: [
        'Telah memiliki TKK Pengetahuan Daya Tarik Wisata Tingkat Purwa.',
        'Mampu menyusun Fact Sheet komprehensif untuk minimal 3 objek wisata lintas wilayah.',
        'Mampu memandu simulasi perjalanan wisata selama 30 menit dengan narasi storytelling yang komunikatif.',
        'Menghasilkan produk: Profil Lengkap Daya Tarik Wisata Lokal disertai Materi Presentasi.'
      ],
      utama: [
        'Telah memiliki TKK Pengetahuan Daya Tarik Wisata Tingkat Madya.',
        'Mampu menyusun buku saku interpretasi panduan destinasi wisata binaan Saka Pariwisata.',
        'Mampu melatih dan menguji calon pramuka penegak/pandega untuk TKK Tingkat Purwa.',
        'Menghasilkan produk: Paket Informasi dan Interpretasi Daya Tarik Wisata Lengkap.'
      ]
    },
    competencyTable: [
      {
        code: 'PM01.001.01',
        element: 'Mengidentifikasi Potensi Daya Tarik Wisata',
        indicator: 'Data geografis, sejarah, dan keunikan daya tarik dikumpulkan secara sistematis.',
        assessment: 'Uji Lisan & Portofolio Fact Sheet'
      },
      {
        code: 'PM01.002.01',
        element: 'Mengembangkan Materi Interpretasi Wisata',
        indicator: 'Tema narasi disusun dengan teknik T-O-R-E tanpa distorsi fakta sejarah.',
        assessment: 'Simulasi Pemanduan Praktik'
      }
    ],
    images: [
      {
        id: 'img-p1',
        url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&auto=format&fit=crop&q=80',
        caption: 'Pemandu Saka Pariwisata memberikan interpretasi sejarah peninggalan budaya.'
      }
    ],
    links: [
      {
        id: 'lnk-p1',
        title: 'Buku Panduan SKK Saka Pariwisata 2026 - Kemnaker & Kwarnas',
        url: 'https://kemenparekraf.go.id',
        type: 'REGULATION'
      }
    ],
    downloads: [
      {
        id: 'dl-p1',
        title: 'Modul-PM01-Pengetahuan-Daya-Tarik-Wisata.pdf',
        fileUrl: 'https://docs.google.com/document/d/1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E/export?format=pdf',
        fileType: 'PDF',
        fileSize: '2.5 MB'
      }
    ],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-pemandu-b',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: 'PM-02',
    title: 'Perencanaan Program Perjalanan Wisata',
    badge: 'SKK Pemandu (PM-02)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Perancangan rencana perjalanan (itinerary), analisis kebutuhan wisatawan, manajemen rute perjalanan (routing), jadwal waktu, kalkulasi biaya (tour costing), dan mitigasi risiko logistik.',
    skkniReference: 'Kepmenaker Nomor 221 Tahun 2023 tentang Pemimpin Perjalanan Wisata',
    practiceProduct: {
      purwa: 'Itinerary Perjalanan Wisata 1 Hari (One Day Tour) beserta Estimasi Waktu & Biaya Pokok',
      madya: 'Program Perjalanan Wisata 2–3 Hari disertai Routing Peta, Estimasi Biaya (Costing), dan Titik Singgah',
      utama: 'Paket Program Perjalanan Wisata Lengkap (RAB Lengkap, Manajemen Risiko, & Rute Alternatif)'
    },
    portfolioItems: [
      'Dokumen Itinerary Wisata Rinci',
      'Tabel Kalkulasi Biaya (Costing Sheet)',
      'Peta Rute & Rencana Kontingensi',
      'Lembar Hasil Uji SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Dasar-Dasar Perencanaan Perjalanan Wisata
Mengacu pada Kepmenaker No. 221 Tahun 2023, perencana perjalanan wisata merancang program terpadu yang memadukan atraksi, aksesibilitas, amenitas, dan ancillaries (4A).

### Komponen Pokok Itinerary:
1. **Analisis Wisatawan:** Profil umur, ketahanan fisik, minat khusus, dan pantangan makan.
2. **Routing & Alur Waktu:** Waktu tempuh riil, waktu jeda istirahat (buffer time), dan jam operasional destinasi.
3. **Tour Costing:** Biaya tetap (transport, pemandu) dan biaya variabel (tiket masuk, konsumsi per orang).
4. **Contingency Planning:** Rute cadangan dan protokol cuaca buruk.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Prinsip Dasar Anatomi Itinerary & Formula 4A',
        duration: '4 JP (180 Menit)',
        competency: 'Menyusun urutan kunjungan rasional dan menghitung estimasi waktu tempuh riil.',
        method: 'Teori & Bedah Kasus'
      },
      {
        sessionNumber: 2,
        title: 'Kalkulasi Biaya Paket Wisata (Tour Costing & Pricing)',
        duration: '6 JP (270 Menit)',
        competency: 'Menyusun tabel biaya komponen wisata dan menentukan harga jual paket per peserta.',
        method: 'Praktik Spreadsheet'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu menyusun jadwal perjalanan 1 hari (One Day Tour) untuk rombongan lokal.',
        'Dapat menghitung estimasi biaya tiket dan konsumsi per orang.',
        'Menghasilkan produk: Itinerary Perjalanan Wisata 1 Hari.'
      ],
      madya: [
        'Mampu menyusun paket perjalanan wisata 2-3 hari dengan rincian biaya lengkap.',
        'Mampu mengoordinasikan jadwal transportasi dan akomodasi.',
        'Menghasilkan produk: Program Perjalanan Wisata 2–3 Hari beserta Costing.'
      ],
      utama: [
        'Mampu merancang paket wisata minat khusus lintas kabupaten/provinsi.',
        'Menyusun analisis risiko dan rencana mitigasi rute perjalanan.',
        'Menghasilkan produk: Paket Program Perjalanan Wisata Lengkap.'
      ]
    },
    competencyTable: [
      {
        code: 'PM02.001.01',
        element: 'Menyusun Rencana Perjalanan Wisata',
        indicator: 'Rute logis, waktu singgah proporsional, dan memperhatikan keselamatan.',
        assessment: 'Penilaian Dokumen Itinerary'
      }
    ],
    images: [
      {
        id: 'img-p2',
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000&auto=format&fit=crop&q=80',
        caption: 'Penyusunan peta rute perjalanan dan jadwal singgah tur.'
      }
    ],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-pemandu-c',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: 'PM-03',
    title: 'Pemandu Perjalanan Wisata',
    badge: 'SKK Pemandu (PM-03)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Praktik pemanduan perjalanan langsung, penyambutan wisatawan, public speaking, pengelolaan dinamika kelompok, pelayanan prima (hospitality), dan penanganan keluhan.',
    skkniReference: 'Standar Kompetensi Nasional Pemanduan Perjalanan Wisata',
    practiceProduct: {
      purwa: 'Praktik Pemanduan Wisata Sederhana (Penyambutan, Perkenalan, & Briefing Singkat)',
      madya: 'Praktik Pemanduan Perjalanan Wisata Terstruktur (Storytelling & Penanganan Keluhan)',
      utama: 'Praktik Pemanduan Perjalanan Wisata Lengkap (Interpretasi Mendalam & Evaluasi Kepuasan)'
    },
    portfolioItems: [
      'Rekaman Video Pemanduan Langsung',
      'Naskah Komentari Pemanduan',
      'Lembar Checklist Hospitality',
      'Lembar Nilai Penguji'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Standar Hospitality & Sikap Kerja Pemandu
Pemandu wisata mencerminkan citra kepariwisataan Indonesia. Sikap kerja yang dituntut:
- Berbusana rapi, bersih, mengenakan atribut resmi Saka Pariwisata.
- Tepat waktu, ramah, dan tanggap terhadap kebutuhan wisatawan.
- Menjunjung tinggi netralitas dan tidak menyinggung isu SARA.

## 2. Teknik Pemanduan Interaktif
- Memberikan briefing keselamatan sebelum kegiatan dimulai.
- Menguasai teknik komunikasi dua arah dan narasi on-coach pemanduan di kendaraan.
- Menangani keluhan dengan pendekatan L-A-S-T (Listen, Apologize, Solve, Thank).`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Etika Pelayanan & Grooming Pemandu Wisata',
        duration: '4 JP (180 Menit)',
        competency: 'Menerapkan standar penampilan, etika berbicara, dan salam Sapta Pesona.',
        method: 'Roleplay'
      },
      {
        sessionNumber: 2,
        title: 'Simulasi Pemanduan Lapangan & Penanganan Keluhan',
        duration: '6 JP (270 Menit)',
        competency: 'Mendemonstrasikan pemanduan wisata dan menyelesaikan simulasi komplain.',
        method: 'Praktik Lapangan'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu memandu rombongan minimal 10 orang selama kunjungan setengah hari di destinasi lokal.',
        'Mampu menyampaikan safety briefing secara lugas dan jelas.',
        'Menghasilkan produk: Praktik Pemanduan Sederhana.'
      ],
      madya: [
        'Telah memandu minimal 3 perjalanan wisata resmi tingkat ranting/cabang.',
        'Mampu menangani keluhan wisatawan dengan solusi cepat dan memuaskan.',
        'Menghasilkan produk: Praktik Pemanduan Terstruktur.'
      ],
      utama: [
        'Mampu memandu dalam bahasa asing (minimal percakapan wisata dasar).',
        'Mampu membimbing dan mengevaluasi pemandu pemula.',
        'Menghasilkan produk: Praktik Pemanduan Wisata Lengkap.'
      ]
    },
    competencyTable: [
      {
        code: 'PM03.001.01',
        element: 'Melaksanakan Pemanduan Wisata',
        indicator: 'Informasi disampaikan sistematis dan memperhatikan kenyamanan grup.',
        assessment: 'Uji Praktik Lapangan Langsung'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-pemandu-d',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: 'PM-04',
    title: 'Pemimpin Perjalanan Wisata',
    badge: 'SKK Pemandu (PM-04)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Pengelolaan dan koordinasi rombongan wisata dari pra-tur hingga pasca-tur, koordinasi vendor akomodasi dan transportasi, pengendalian jadwal, dan penanganan situasi darurat.',
    skkniReference: 'Kepmenaker Nomor 221 Tahun 2023 tentang Pemimpin Perjalanan Wisata (Tour Leader)',
    practiceProduct: {
      purwa: 'Praktik Briefing dan Pengelolaan Keberangkatan Wisata Sederhana',
      madya: 'Praktik Pengelolaan Perjalanan Wisata Terstruktur (Checklist Kesiapan & Rundown)',
      utama: 'Praktik Pemimpin Perjalanan Wisata Lengkap (Kepemimpinan Tur & Laporan LPJ)'
    },
    portfolioItems: [
      'Master Rundown Acara Tur',
      'Checklist Kesiapan & Manifest Peserta',
      'Laporan Operasional Perjalanan (Tour Report)',
      'Lembar Uji SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Peran Tour Leader (TL)
Mengacu pada Kepmenaker No. 221/2023, Tour Leader bertanggung jawab atas kelancaran seluruh operasional tur dari keberangkatan hingga kepulangan.

### Tanggung Jawab TL:
- Mengelola pergerakan rombongan di bandara, stasiun, hotel, dan destinasi.
- Memastikan fasilitas peserta sesuai dengan perjanjian paket.
- Mengoordinasikan mitra penyedia jasa (bus, hotel, restoran, guide lokal).
- Mengambil keputusan cepat saat terjadi kendala darurat (keterlambatan penerbangan, cuaca buruk).`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'SOP Pre-Tour, On-Tour, dan Post-Tour Reporting',
        duration: '4 JP (180 Menit)',
        competency: 'Menguasai alur kerja verifikasi voucher, manifest rombongan, dan checklist kesiapan.',
        method: 'Teori & Simulasi Dokumen'
      },
      {
        sessionNumber: 2,
        title: 'Manajemen Rombongan & Kontingensi Lapangan',
        duration: '6 JP (270 Menit)',
        competency: 'Mampu mengatur pergerakan rombongan dan merespons kendala logistik.',
        method: 'Simulasi Lapangan'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu mendampingi kepemimpinan tur 1 hari dengan jumlah peserta minimal 20 orang.',
        'Mampu melakukan absensi manifest dan briefing keberangkatan.',
        'Menghasilkan produk: Praktik Briefing Keberangkatan.'
      ],
      madya: [
        'Mampu memimpin tur luar kota minimal 2 hari 1 malam dengan koordinasi vendor.',
        'Menyusun laporan operasional tur (Tour Report).',
        'Menghasilkan produk: Praktik Pengelolaan Tur Terstruktur.'
      ],
      utama: [
        'Mampu mengelola tur delegasi resmi kwartir atau tur lintas provinsi zero-incident.',
        'Menghasilkan produk: Praktik Pemimpin Perjalanan Wisata Lengkap & LPJ.'
      ]
    },
    competencyTable: [
      {
        code: 'PM04.001.01',
        element: 'Mengelola Operasional Perjalanan Wisata',
        indicator: 'Voucher diperiksa cermat, manifest sinkron, jadwal terpenuhi.',
        assessment: 'Portofolio Tour Report'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-pemandu-e',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: 'PM-05',
    title: 'Pemandu Wisata Selam',
    badge: 'SKK Pemandu (PM-05)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Keahlian kepemanduan wisata selam dan snorkeling rekreasi, pengenalan alat selam, prosedur pemeriksaan buddy check, komunikasi isyarat tangan bawah air, dan konservasi terumbu karang.',
    skkniReference: 'Kepmenaker Nomor 18 Tahun 2024 tentang Pemanduan Wisata Selam',
    specialSafetyNotes: 'KETENTUAN KESELAMATAN KHUSUS: Uji SKK ini merupakan standar pendidikan kepramukaan, bukan sertifikasi profesi dive master mandiri. Seluruh praktik di lingkungan perairan terbuka wajib didampingi instruktur selam berlisensi resmi.',
    practiceProduct: {
      purwa: 'Praktik Briefing Keselamatan Wisata Selam & Pengenalan Alat Dasar (Masker, Snorkel, Fin)',
      madya: 'Praktik Persiapan dan Briefing Selam (Pemeriksaan Alat, Arus, & Isyarat Tangan)',
      utama: 'Praktik Perencanaan dan Pengelolaan Kegiatan Selam (Analisis Risiko & Konservasi Karang)'
    },
    portfolioItems: [
      'Checklist Pemeriksaan Alat Selam',
      'Lembar Briefing Keselamatan Selam',
      'Dokumentasi Simulasi Isyarat Tangan',
      'Lembar Evaluasi Penguji'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Ruang Lingkup Pemanduan Wisata Selam
Berdasarkan Kepmenaker No. 18 Tahun 2024, pemandu wisata selam bertugas memastikan keselamatan penyelaman rekreasi serta mengedukasi pelestarian terumbu karang.

### Prosedur Keselamatan:
- Melakukan pemeriksaan perlengkapan pasangan (Buddy Check).
- Menguasai isyarat tangan bawah air (Hand Signals).
- Menerapkan prinsip *Look but Do Not Touch* pada terumbu karang.
- Memahami tabel dekompresi dasar dan aturan ascending rate aman.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Pengenalan Alat Selam & Fisiologi Dasar Bawah Air',
        duration: '4 JP (180 Menit)',
        competency: 'Mengenal fungsi masker, snorkel, fin, BCD, tabung udara, dan teknik equalizing telinga.',
        method: 'Teori & Demonstrasi Alat'
      },
      {
        sessionNumber: 2,
        title: 'Protokol Buddy System & Briefing Keselamatan',
        duration: '6 JP (270 Menit)',
        competency: 'Mempraktikkan buddy check dan menyampaikan briefing keselamatan pra-penyelaman.',
        method: 'Simulasi Kolam / Pesisir Terkontrol'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu mengenali fungsi dan memeriksa kondisi fisik alat snorkeling/selam dasar.',
        'Mampu mendemonstrasikan 10 isyarat tangan keselamatan bawah air.',
        'Menghasilkan produk: Briefing Keselamatan Selam Sederhana.'
      ],
      madya: [
        'Mampu melakukan inspeksi peralatan selam dengan checklist lengkap.',
        'Mengetahui analisis arus dan kondisi perairan sebelum masuk air.',
        'Menghasilkan produk: Praktik Persiapan dan Briefing Selam.'
      ],
      utama: [
        'Memiliki sertifikasi selam rekreasi dasar (Open Water) dari lembaga terakreditasi.',
        'Mampu menyusun rencana pemanduan wisata bahari berkelanjutan.',
        'Menghasilkan produk: Perencanaan dan Pengelolaan Kegiatan Selam.'
      ]
    },
    competencyTable: [
      {
        code: 'PM05.001.01',
        element: 'Menyiapkan Peralatan Wisata Selam',
        indicator: 'Peralatan dicek kelayakannya sesuai standar keselamatan perairan.',
        assessment: 'Uji Praktik Observasi Alat'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-pemandu-f',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: 'PM-06',
    title: 'Pemandu Wisata Gunung',
    badge: 'SKK Pemandu (PM-06)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Kepemanduan perjalanan wisata gunung, navigasi darat peta-kompas, persiapan perlengkapan pendakian (layering & survival), mitigasi cuaca dan hipotermia, serta etika Leave No Trace.',
    skkniReference: 'Kepmenaker Nomor 74 Tahun 2024 tentang Pemanduan Wisata Gunung',
    specialSafetyNotes: 'KETENTUAN KESELAMATAN KHUSUS: Mengingat risiko medan ketinggian, hipotermia, dan cuaca ekstrem, seluruh kegiatan wajib mengutamakan SOP keselamatan, perlengkapan standar gunung, dan pendampingan pemandu berpengalaman.',
    practiceProduct: {
      purwa: 'Praktik Persiapan Perjalanan Wisata Gunung (Perlengkapan, Peta Jalur Dasar, & Etika Gunung)',
      madya: 'Praktik Perencanaan dan Pendampingan Gunung (Navigasi Darat Peta-Kompas & Mitigasi Cuaca)',
      utama: 'Praktik Perencanaan dan Pelaksanaan Pemanduan Gunung (SOP Ekspedisi, Evakuasi, & Tanggap Darurat)'
    },
    portfolioItems: [
      'Rencana Perjalanan Pendakian Gunung',
      'Peta Jalur & Plotting Kontur',
      'Checklist Perlengkapan Tim',
      'Lembar Uji SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Pemanduan Wisata Gunung Berkelanjutan
Mengacu pada Kepmenaker No. 74 Tahun 2024, pemandu gunung bertanggung jawab atas keselamatan rute, kebugaran tim, dan pelestarian ekosistem gunung.

### Pokok Keahlian:
- Sistem pakaian layering (base layer, insulating layer, shell layer).
- Navigasi darat (peta topografi, kompas bidik, orientasi tanda alam).
- Pencegahan dan penanganan dini Mountain Sickness & Hipotermia.
- Etika lingkungan Leave No Trace (bawa turun kembali seluruh sampah).`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Manajemen Perlengkapan & Logistik Pendakian Gunung',
        duration: '4 JP (180 Menit)',
        competency: 'Menyusun checklist perlengkapan tim dan menghitung kebutuhan kalori pendakian.',
        method: 'Teori & Workshop Packing'
      },
      {
        sessionNumber: 2,
        title: 'Navigasi Darat & Manajemen Bahaya Gunung',
        duration: '6 JP (270 Menit)',
        competency: 'Membaca peta kontur, menentukan posisi dengan resection, dan merespons cuaca buruk.',
        method: 'Praktik Lapangan'
      }
    ],
    testRequirements: {
      purwa: [
        'Mengetahui standar perlengkapan pendakian gunung dan sistem pakaian layering.',
        'Mampu membaca peta jalur wisata gunung dan aturan konservasi taman nasional.',
        'Menghasilkan produk: Persiapan Perjalanan Wisata Gunung.'
      ],
      madya: [
        'Mampu bernavigasi menggunakan kompas bidik dan peta topografi.',
        'Mengetahui langkah pertolongan pertama pada hipotermia dan cedera gunung.',
        'Menghasilkan produk: Perencanaan dan Pendampingan Perjalanan Gunung.'
      ],
      utama: [
        'Mampu memimpin tim pendakian gunung dengan menerapkan SOP keselamatan resmi.',
        'Menyusun jalur evakuasi dan rencana tanggap darurat gunung.',
        'Menghasilkan produk: Pemanduan Wisata Gunung Lengkap.'
      ]
    },
    competencyTable: [
      {
        code: 'PM06.001.01',
        element: 'Merencanakan Perjalanan Wisata Gunung',
        indicator: 'Rute jalur, waktu tempuh, dan logistik dihitung cermat dengan mempertimbangkan risiko cuaca.',
        assessment: 'Penilaian Rencana Perjalanan Gunung'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-pemandu-g',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: 'PM-07',
    title: 'Pemandu Wisata Outbond',
    badge: 'SKK Pemandu (PM-07)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Fasilitasi kegiatan pembelajaran berbasis pengalaman (experiential learning), dinamika kelompok, permainan ice breaking, trust building, team building, instruksi keselamatan, dan refleksi/debrief.',
    skkniReference: 'Kepmenaker Nomor 119 Tahun 2024 tentang Pemanduan Outbond / Experiential Learning',
    specialSafetyNotes: 'KETENTUAN KESELAMATAN KHUSUS: Penggunaan wahana tantangan fisik/ketinggian (high ropes/flying fox) wajib mengacu pada sertifikasi kelayakan alat dan SOP instruktur resmi.',
    practiceProduct: {
      purwa: 'Praktik Memandu Permainan Outbond Sederhana (Ice Breaking & Fun Games)',
      madya: 'Praktik Perencanaan dan Pelaksanaan Kegiatan Outbond (Rundown Team Building & Debrief)',
      utama: 'Praktik Perencanaan dan Pelaksanaan Pemanduan Outbond (Desain Program Tematik & Safety Management)'
    },
    portfolioItems: [
      'Buku Skenario Permainan Outbond',
      'Rundown Pelatihan Lapangan',
      'Video Panduan Ice Breaking',
      'Lembar Hasil Uji SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Experiential Learning dalam Outbond
Mengacu pada Kepmenaker No. 119 Tahun 2024, pemandu outbond memfasilitasi dinamika kelompok melalui siklus pembelajaran: Mengalami (Do) → Merefleksikan (Reflect) → Menerapkan (Apply).

### Struktur Aktivitas:
1. **Ice Breaking:** Mencairkan kebekuan dan membangun keakraban peserta.
2. **Trust Building:** Menumbuhkan rasa saling percaya antar anggota regu.
3. **Problem Solving & Team Building:** Mengasah komunikasi dan kolaborasi regu.
4. **Debriefing:** Membimbing peserta mengambil hikmah dan nilai kehidupan dari setiap permainan.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Konsep Experiential Learning & Dinamika Kelompok',
        duration: '4 JP (180 Menit)',
        competency: 'Memahami psikologi kelompok, instruksi aman, dan pengelolaan energi audiens.',
        method: 'Teori & Workshop Games'
      },
      {
        sessionNumber: 2,
        title: 'Fasilitasi Simulasi Permainan & Teknik Debriefing',
        duration: '6 JP (270 Menit)',
        competency: 'Mampu memimpin permainan tim dan memandu sesi refleksi kelompok.',
        method: 'Praktik Lapangan'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu memandu minimal 3 jenis permainan ice breaking untuk regu pramuka.',
        'Menyampaikan instruksi permainan dengan bahasa santun dan lugas.',
        'Menghasilkan produk: Memandu Permainan Outbond Sederhana.'
      ],
      madya: [
        'Mampu merancang rundown kegiatan outbond setengah hari.',
        'Mampu memfasilitasi sesi debriefing sederhana setelah permainan selesai.',
        'Menghasilkan produk: Pelaksanaan Kegiatan Outbond & Debrief.'
      ],
      utama: [
        'Mampu merancang program outbond tematik kepemimpinan.',
        'Menguasai manajemen risiko keselamatan alat dan arena permainan outbond.',
        'Menghasilkan produk: Pemanduan Wisata Outbond Lengkap.'
      ]
    },
    competencyTable: [
      {
        code: 'PM07.001.01',
        element: 'Memfasilitasi Aktivitas Outbond',
        indicator: 'Permainan dipandu antusias, instruksi aman, dan dinamika peserta terpantau.',
        assessment: 'Uji Praktik Lapangan'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-pemandu-h',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: 'PM-08',
    title: 'Pemandu Keselamatan Wisata (Lifeguard)',
    badge: 'SKK Pemandu (PM-08)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Kewaspadaan dini, pemantauan kawasan wisata perairan (pantai, danau, sungai, kolam renang), penggunaan peralatan penyelamat (life jacket, ring buoy), rambu bahaya, dan edukasi keselamatan wisatawan.',
    skkniReference: 'Kepmenaker Nomor 266 Tahun 2023 tentang Pemanduan Keselamatan Wisata Tirta',
    specialSafetyNotes: 'KETENTUAN KHUSUS: SKK ini berfokus pada deteksi dini bahaya, pencegahan kecelakaan di kawasan air, dan panduan keselamatan bagi wisatawan. Tidak menggantikan peran tim SAR dan paramedis resmi.',
    practiceProduct: {
      purwa: 'Praktik Pemeriksaan Keselamatan Wisata Tirta (Pemeriksaan Pelampung, Ring Buoy, & Rambu)',
      madya: 'Praktik Perencanaan dan Pelaksanaan Keselamatan Wisata Tirta (Pengawasan & Respon Bahaya)',
      utama: 'Praktik Pengelolaan Keselamatan Wisata Tirta (SOP Tanggap Darurat & Koordinasi Evakuasi)'
    },
    portfolioItems: [
      'Peta Zonasi Keselamatan Perairan',
      'Checklist Alat Pertolongan Pertama',
      'Laporan Simulasi Penyelamatan Tirta',
      'Lembar Uji SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Keselamatan Wisata Tirta (Lifeguard)
Mengacu pada Kepmenaker No. 266 Tahun 2023, pengawasan keselamatan perairan bertujuan mencegah insiden tenggelam dan kecelakaan di perairan wisata.

### Prinsip Penyelamatan Perairan:
1. **Pencegahan:** Memasang bendera penanda zona aman/bahaya dan menegur wisatawan yang melanggar.
2. **Pengawasan Aktif:** Memindai area perairan secara teratur (scanning technique).
3. **Urutan Penyelamatan Non-Contact:** Reach (jangkau) → Throw (lempar alat apung) → Row (dayung) → Go (masuk air dengan alat apung).
4. **Bantuan Pertama:** Teknik pemulihan napas buatan dan posisi pemulihan.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Zonasi Perairan & Pemeriksaan Alat Penyelamat',
        duration: '4 JP (180 Menit)',
        competency: 'Mengidentifikasi arus balik (rip current), pasang surut, dan kelayakan ring buoy serta pelampung.',
        method: 'Teori & Praktik Pengenalan Alat'
      },
      {
        sessionNumber: 2,
        title: 'Simulasi Pengawasan & Teknik Lempar Alat Apung',
        duration: '6 JP (270 Menit)',
        competency: 'Mendemonstrasikan pelemparan ring buoy ke target korban air dan penarikan aman.',
        method: 'Praktik Perairan Terkontrol'
      }
    ],
    testRequirements: {
      purwa: [
        'Mengenali arti bendera warna keselamatan pantai (merah, kuning, hijau).',
        'Mampu melempar ring buoy sejauh minimal 10 meter dengan tepat sasaran.',
        'Menghasilkan produk: Pemeriksaan Keselamatan Tirta.'
      ],
      madya: [
        'Mampu melakukan scanning pengawasan perairan selama 30 menit tanpa terdistraksi.',
        'Mampu mendemonstrasikan pertolongan reach & throw di tepi kolam/perairan tenang.',
        'Menghasilkan produk: Praktik Pengawasan Keselamatan Tirta.'
      ],
      utama: [
        'Menyusun SOP keselamatan kawasan wisata air dan rencana jalur evakuasi medis.',
        'Menguasai simulasi bantuan hidup dasar (BHD/CPR) bersertifikat.',
        'Menghasilkan produk: Pengelolaan Keselamatan Wisata Tirta Lengkap.'
      ]
    },
    competencyTable: [
      {
        code: 'PM08.001.01',
        element: 'Mengawasi Kawasan Wisata Tirta',
        indicator: 'Zona berbahaya dipantau terus-menerus dan wisatawan diperingatkan saat mendekati risiko.',
        assessment: 'Uji Observasi Lapangan'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },

  // =========================================================================
  // 2. KRIDA PENYULUH WISATA (6 SKK: PY-01 s/d PY-06)
  // =========================================================================
  {
    id: 'skk-penyuluh-a',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: 'PY-01',
    title: 'Penyuluh Sadar Wisata',
    badge: 'SKK Penyuluh (PY-01)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Penyuluhan kesadaran masyarakat sebagai tuan rumah destinasi wisata, pengenalan 7 unsur Sapta Pesona (Aman, Tertib, Bersih, Sejuk, Indah, Ramah, Kenangan), dan etika pelayanan pariwisata.',
    skkniReference: 'Pedoman Nasional Sadar Wisata & 7 Unsur Sapta Pesona Kemenparekraf RI',
    practiceProduct: {
      purwa: 'Praktik Kampanye Sadar Wisata Sederhana (Poster/Leaflet 7 Unsur Sapta Pesona)',
      madya: 'Praktik Perencanaan dan Pelaksanaan Penyuluhan Sadar Wisata (Materi Edukasi Komunitas)',
      utama: 'Praktik Perencanaan dan Pelaksanaan Program Penyuluhan Sadar Wisata (Program Aksi Desa Wisata)'
    },
    portfolioItems: [
      'Desain Poster/Leaflet Sapta Pesona',
      'Slide Presentasi Penyuluhan Warga',
      'Laporan Kegiatan Sosialisasi Komunitas',
      'Lembar Hasil Uji Penguji'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Gerakan Sadar Wisata & Sapta Pesona
Berdasarkan Buku Panduan SKK 2026, Sadar Wisata adalah konsep partisipasi masyarakat dalam mewujudkan iklim kondusif bagi tumbuhnya pariwisata nasional.

### 7 Unsur Sapta Pesona:
1. **Aman:** Bebas dari ancaman, kecemasan, tindak kriminal, dan penipuan.
2. **Tertib:** Suasana rapi, disiplin waktu, antrean teratur, dan taat aturan lalu lintas.
3. **Bersih:** Lingkungan higienis, bebas sampah berserakan, dan toilet bersih.
4. **Sejuk:** Rindang oleh pepohonan, sirkulasi udara baik, dan penataan hijau asri.
5. **Indah:** Estetika visual tata ruang menarik dan selaras dengan alam/budaya lokal.
6. **Ramah:** Senyum, salam, sapa, sopan, santun kepada setiap tamu wisata.
7. **Kenangan:** Kesan manis yang membuat wisatawan rindu untuk berkunjung kembali.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Pemahaman 7 Unsur Sapta Pesona & Peran Tuan Rumah',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu menjabarkan implementasi 7 unsur Sapta Pesona di lingkungan terdekat.',
        method: 'Teori & Diskusi'
      },
      {
        sessionNumber: 2,
        title: 'Pembuatan Media Kampanye & Simulasi Penyuluhan',
        duration: '6 JP (270 Menit)',
        competency: 'Membuat materi visual dan menyimulasikan penyuluhan di hadapan warga.',
        method: 'Praktik Produksi Media & Roleplay'
      }
    ],
    testRequirements: {
      purwa: [
        'Dapat menghafal dan menjelaskan 7 unsur Sapta Pesona dengan contoh nyata.',
        'Mampu membuat media kampanye sederhana (poster/flyer sadar wisata).',
        'Menghasilkan produk: Kampanye Sadar Wisata Sederhana.'
      ],
      madya: [
        'Mampu merancang materi presentasi penyuluhan bagi kelompok sadar wisata (Pokdarwis).',
        'Mampu memimpin diskusi warga tentang kebersihan destinasi.',
        'Menghasilkan produk: Pelaksanaan Penyuluhan Sadar Wisata.'
      ],
      utama: [
        'Mampu merancang program pembinaan desa wisata berbasis Sapta Pesona.',
        'Menghasilkan produk: Program Aksi Penyuluhan Sadar Wisata Komprehensif.'
      ]
    },
    competencyTable: [
      {
        code: 'PY01.001.01',
        element: 'Menyosialisasikan Sadar Wisata dan Sapta Pesona',
        indicator: 'Pesan disampaikan lugas, persuasif, dan memotivasi partisipasi warga lokal.',
        assessment: 'Uji Presentasi & Portofolio Media Kampanye'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-penyuluh-b',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: 'PY-02',
    title: 'Penyuluh Ekowisata',
    badge: 'SKK Penyuluh (PY-02)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Penyuluhan prinsip-prinsip ekowisata berbasis konservasi, perlindungan keanekaragaman hayati, edukasi lingkungan bagi wisatawan, daya dukung lingkungan (carrying capacity), dan pemberdayaan masyarakat lokal.',
    skkniReference: 'Kepmenaker Nomor 234 Tahun 2023 tentang Ekowisata',
    practiceProduct: {
      purwa: 'Praktik Kampanye Ekowisata Sederhana (Edukasi Pilah Sampah & Konservasi Alam)',
      madya: 'Praktik Perencanaan dan Pelaksanaan Penyuluhan Ekowisata (Prinsip Daya Dukung Lingkungan)',
      utama: 'Praktik Perencanaan dan Pelaksanaan Program Ekowisata (Desain Rencana Aksi Konservasi Hijau)'
    },
    portfolioItems: [
      'Modul Saku Kampanye Konservasi',
      'Peta Jalur Interpretasi Alam Ekowisata',
      'Laporan Edukasi Wisata Berkelanjutan',
      'Lembar Penilaian SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Prinsip Pokok Ekowisata
Mengacu pada Kepmenaker No. 234 Tahun 2023, ekowisata memadukan:
1. **Konservasi:** Melindungi ekosistem dan keanekaragaman hayati.
2. **Edukasi:** Membuka wawasan wisatawan tentang pentingnya menjaga alam.
3. **Pemberdayaan Ekonomi:** Keuntungan ekonomi pariwisata kembali kepada masyarakat sekitar.
4. **Daya Dukung Lingkungan:** Membatasi jumlah pengunjung agar tidak melebihi kapasitas ekologis (carrying capacity).`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Prinsip Konservasi Alam & Ekowisata Berkelanjutan',
        duration: '4 JP (180 Menit)',
        competency: 'Memahami prinsip ramah lingkungan dan batas toleransi alam terhadap jejak wisatawan.',
        method: 'Teori & Kajian Alam'
      },
      {
        sessionNumber: 2,
        title: 'Penyusunan Materi Penyuluhan Lingkungan Destinasi',
        duration: '6 JP (270 Menit)',
        competency: 'Menyusun naskah penyuluhan pilah sampah dan perlindungan satwa/flora endemik.',
        method: 'Praktik Edukasi Lapangan'
      }
    ],
    testRequirements: {
      purwa: [
        'Mengetahui pengertian ekowisata dan 3 pilar utamanya.',
        'Mampu mempraktikkan pemilahan sampah organik dan anorganik di lokasi wisata.',
        'Menghasilkan produk: Kampanye Ekowisata Sederhana.'
      ],
      madya: [
        'Mampu menjelaskan konsep daya dukung lingkungan (carrying capacity).',
        'Mampu menyusun panduan etika wisata ramah lingkungan bagi wisatawan.',
        'Menghasilkan produk: Pelaksanaan Penyuluhan Ekowisata.'
      ],
      utama: [
        'Mampu menyusun rencana aksi advokasi konservasi ekowisata bersama komunitas lokal.',
        'Menghasilkan produk: Program Aksi Ekowisata Berkelanjutan.'
      ]
    },
    competencyTable: [
      {
        code: 'PY02.001.01',
        element: 'Melakukan Edukasi Konservasi Ekowisata',
        indicator: 'Prinsip pelestarian lingkungan disampaikan dengan pendekatan partisipatif.',
        assessment: 'Uji Modul Edukasi Lingkungan'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-penyuluh-c',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: 'PY-03',
    title: 'Penyuluh Wisata Tirta',
    badge: 'SKK Penyuluh (PY-03)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Penyuluhan keselamatan dan kelestarian ekosistem perairan (laut, pantai, sungai, danau), perlindungan terumbu karang dan mangrove, serta pencegahan pencemaran sampah perairan.',
    skkniReference: 'Kepmenaker Nomor 266/2023, 18/2024, dan 87/2024 tentang Wisata Tirta Berkelanjutan',
    practiceProduct: {
      purwa: 'Praktik Kampanye Keselamatan dan Kelestarian Wisata Tirta (Kebersihan Pesisir & Rambu Perairan)',
      madya: 'Praktik Perencanaan dan Pelaksanaan Penyuluhan Wisata Tirta (Edukasi Pelaku Usaha Tirta)',
      utama: 'Praktik Pengelolaan Program Wisata Tirta Berkelanjutan'
    },
    portfolioItems: [
      'Brosur Perlindungan Pesisir & Terumbu Karang',
      'Peta Rambu Bahaya Perairan',
      'Laporan Aksi Bersih Pesisir/Sungai',
      'Lembar Uji SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Edukasi Kelestarian Kawasan Perairan
Penyuluh wisata tirta bertindak sebagai penggerak perlindungan pesisir, perairan tawar, dan laut dari ancaman limbah plastik dan kerusakan fisik habitat air.

### Fokus Penyuluhan:
- Konservasi terumbu karang dan hutan bakau (mangrove).
- Kesadaran pemakaian jaket keselamatan di setiap wahana perahu/kapal rekreasi.
- Larangan membuang limbah minyak, deterjen, dan sampah botol plastik ke badan air.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Ekologi Perairan & Regulasi Wisata Tirta',
        duration: '4 JP (180 Menit)',
        competency: 'Mengidentifikasi potensi kerusakan ekosistem perairan dan dasar hukum perlindungannya.',
        method: 'Teori & Kajian Masalah'
      },
      {
        sessionNumber: 2,
        title: 'Aksi Edukasi Wisata Bahari & Pesisir',
        duration: '6 JP (270 Menit)',
        competency: 'Melakukan aksi sosialisasi kebersihan dan keselamatan kepada pengunjung perairan.',
        method: 'Aksi Lapangan'
      }
    ],
    testRequirements: {
      purwa: [
        'Mengetahui pentingnya mangrove dan terumbu karang bagi ekosistem.',
        'Mampu membuat ajakan keselamatan wisata perairan bagi anak-anak dan remaja.',
        'Menghasilkan produk: Kampanye Keselamatan Wisata Tirta.'
      ],
      madya: [
        'Mampu menyosialisasikan kewajiban alat keselamatan bagi penyedia sewa perahu lokal.',
        'Menghasilkan produk: Pelaksanaan Penyuluhan Wisata Tirta.'
      ],
      utama: [
        'Menyusun rencana kemitraan pelestarian pesisir ramah lingkungan dengan Pokdarwis.',
        'Menghasilkan produk: Program Wisata Tirta Berkelanjutan.'
      ]
    },
    competencyTable: [
      {
        code: 'PY03.001.01',
        element: 'Menyuluh Keselamatan dan Kelestarian Tirta',
        indicator: 'Materi edukasi disampaikan secara jelas dengan bukti data kondisi perairan.',
        assessment: 'Uji Materi Penyuluhan'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-penyuluh-d',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: 'PY-04',
    title: 'Penyuluh Wisata Minat Khusus',
    badge: 'SKK Penyuluh (PY-04)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Penyuluhan potensi, persiapan fisik-mental, etika penjelajahan, dan edukasi risiko pada destinasi wisata minat khusus (geowisata, petualangan alam, susur gua, dan budaya mendalam).',
    skkniReference: 'Kepmenaker Nomor 234/2023, 74/2024, 18/2024, 87/2024, 266/2023 tentang Wisata Minat Khusus',
    specialSafetyNotes: 'Fokus pada penyuluhan risiko, etika petualangan, dan persiapan wisatawan; bukan uji kompetensi manuver fisik ekstrem.',
    practiceProduct: {
      purwa: 'Profil Potensi Wisata Minat Khusus Lokal dan Panduan Keselamatan Dasarnya',
      madya: 'Praktik Perencanaan dan Pelaksanaan Penyuluhan Wisata Minat Khusus (Edukasi Perlengkapan)',
      utama: 'Praktik Perencanaan Program Destinasi Wisata Minat Khusus Aman'
    },
    portfolioItems: [
      'Fact Sheet Wisata Minat Khusus Daerah',
      'Pedoman Edukasi Wisatawan Petualang',
      'Dokumentasi Kegiatan Penyuluhan',
      'Lembar Penilaian SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Karakteristik Wisata Minat Khusus
Wisata minat khusus mencakup wisata petualangan, geowisata, susur goa, dan wisata ilmiah yang membutuhkan ketahanan fisik serta ketaatan tinggi terhadap keselamatan.

### Peran Penyuluh:
- Mengedukasi wisatawan mengenai kesiapan fisik dan peralatan khusus yang wajib dibawa.
- Memberikan pemahaman etika speleologi (goa), geoconservation, dan aturan cagar alam.
- Mengingatkan agar wisatawan selalu menggunakan pemandu profesional berlisensi saat beraktivitas ekstrem.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Klasifikasi Wisata Petualangan & Analisis Risiko',
        duration: '4 JP (180 Menit)',
        competency: 'Mengidentifikasi jenis wisata minat khusus di daerah dan tingkat risiko masing-masing.',
        method: 'Teori & Studi Kasus'
      },
      {
        sessionNumber: 2,
        title: 'Penyusunan Lembar Fakta Edukasi Keselamatan Khusus',
        duration: '6 JP (270 Menit)',
        competency: 'Menyusun petunjuk teknis kesiapan pengunjung wisata minat khusus.',
        method: 'Praktik Penyusunan Modul'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu menyebutkan 3 jenis wisata minat khusus di provinsinya beserta faktor risikonya.',
        'Menghasilkan produk: Profil Potensi Wisata Minat Khusus Lokal.'
      ],
      madya: [
        'Mampu menyusun panduan persiapan fisik dan perlengkapan untuk wisata minat khusus.',
        'Menghasilkan produk: Penyuluhan Wisata Minat Khusus.'
      ],
      utama: [
        'Mampu menyusun strategi edukasi pariwisata petualangan berkelanjutan.',
        'Menghasilkan produk: Program Wisata Minat Khusus Aman.'
      ]
    },
    competencyTable: [
      {
        code: 'PY04.001.01',
        element: 'Menyampaikan Edukasi Wisata Minat Khusus',
        indicator: 'Faktor bahaya dianalisis jujur dan solusi mitigasi diterangkan dengan runtut.',
        assessment: 'Portofolio Lembar Fakta Edukasi'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-penyuluh-e',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: 'PY-05',
    title: 'Penyuluh Wisata Religi',
    badge: 'SKK Penyuluh (PY-05)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Penyuluhan etika berkunjung ke destinasi religi dan cagar budaya keagamaan, tata krama berpakaian, sikap sopan santun, toleransi kerukunan umat beragama, dan pelestarian nilai luhur sejarah.',
    skkniReference: 'Pedoman Etika, Perlindungan Cagar Budaya & Wisata Religi Nusantara',
    specialSafetyNotes: 'BATASAN TEGAS: Bukan kecakapan fatwa/ajaran agama. Fokus murni pada etika berkunjung, sopan santun berpakaian, toleransi keberagaman, dan perlindungan situs sakral bersejarah.',
    practiceProduct: {
      purwa: 'Profil Destinasi Wisata Religi (Tata Tertib, Etika Busana, & Nilai Toleransi Kerukunan)',
      madya: 'Praktik Perencanaan dan Pelaksanaan Penyuluhan Wisata Religi (Panduan Kunjungan Rombongan)',
      utama: 'Praktik Perencanaan dan Pelaksanaan Program Edukasi Nilai Luhur Budaya Religi'
    },
    portfolioItems: [
      'Panduan Tata Tertib Destinasi Religi',
      'Materi Penyuluhan Toleransi Berwisata',
      'Dokumentasi Pendampingan Peziarah',
      'Lembar Evaluasi Penguji'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Etika dan Tata Krama Wisata Religi
Destinasi wisata religi memiliki kesakralan yang wajib dihormati oleh setiap pengunjung lintas latar belakang.

### Prinsip Etika Kunjungan:
1. **Busana Sopan:** Mematuhi aturan busana penutup aurat/selendang sesuai kaidah pengelola situs suci.
2. **Ketenangan:** Menjaga ketertiban suara, tidak mengganggu jalannya ibadah warga lokal.
3. **Toleransi:** Menghormati keragaman adat peribadatan dan memperkuat moderasi beragama.
4. **Cagar Budaya:** Tidak mencoret-coret (vandalisme), tidak menyentuh artefak rapuh sembarangan.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Sejarah Cagar Budaya Religi & Kerukunan Beragama',
        duration: '4 JP (180 Menit)',
        competency: 'Mengetahui latar belakang nilai sejarah dan nilai spiritual situs cagar budaya keagamaan.',
        method: 'Teori & Kajian Budaya'
      },
      {
        sessionNumber: 2,
        title: 'Penyusunan Panduan Etika Kunjungan Wisata Religi',
        duration: '6 JP (270 Menit)',
        competency: 'Menyusun brosur etika berkunjung yang santun dan menghargai keragaman.',
        method: 'Praktik Penyusunan Panduan'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu menjelaskan etika berpakaian dan bertutur kata saat berkunjung ke situs suci/candi/masjid/gereja bersejarah.',
        'Menghasilkan produk: Profil Destinasi Wisata Religi.'
      ],
      madya: [
        'Mampu memandu rombongan peziarah dengan mematuhi tata tertib pengelola tempat ibadah.',
        'Menghasilkan produk: Penyuluhan Wisata Religi.'
      ],
      utama: [
        'Mampu menyusun modul edukasi moderasi kerukunan dan pelestarian cagar budaya religi.',
        'Menghasilkan produk: Program Edukasi Budaya Religi.'
      ]
    },
    competencyTable: [
      {
        code: 'PY05.001.01',
        element: 'Menyosialisasikan Etika Wisata Religi',
        indicator: 'Tata tertib dan nilai toleransi disampaikan secara santun tanpa mendiskreditkan kelompok lain.',
        assessment: 'Uji Materi Panduan Etika'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-penyuluh-f',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: 'PY-06',
    title: 'Penyuluh Mitigasi dan Manajemen Krisis Destinasi',
    badge: 'SKK Penyuluh (PY-06)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Penyuluhan kesiapsiagaan darurat di destinasi wisata, pemetaan jalur evakuasi dan titik kumpul (assembly point), komunikasi krisis yang benar dan terverifikasi (anti-hoaks), serta simulasi tanggap darurat.',
    skkniReference: 'Kepmenaker Nomor 266 Tahun 2023 & Pedoman Kesiapsiagaan Krisis Bencana Destinasi',
    specialSafetyNotes: 'BATASAN: Berperan dalam edukasi masyarakat dan informasi keselamatan dini bagi wisatawan, bukan mengambil alih fungsi komando resmi BPBD/Basarnas/tenaga medis.',
    practiceProduct: {
      purwa: 'Pemetaan Sederhana Informasi Keselamatan Destinasi (Peta Jalur Evakuasi & Titik Kumpul)',
      madya: 'Praktik Perencanaan dan Pelaksanaan Penyuluhan Mitigasi Destinasi (Komunikasi Anti-Hoaks)',
      utama: 'Praktik Rencana Kontingensi Destinasi Wisata Tanggap Krisis'
    },
    portfolioItems: [
      'Peta Jalur Evakuasi Destinasi Lokal',
      'Prosedur Komunikasi Tanggap Krisis',
      'Laporan Simulasi Kesiapsiagaan Warga',
      'Lembar Hasil Uji SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Kesiapsiagaan dan Mitigasi Krisis Destinasi
Destinasi wisata harus memiliki ketahanan terhadap risiko bencana alam (gempa, tsunami, banjir, longsor) dan insiden darurat.

### Pilar Kesiapsiagaan:
1. **Pemetaan Risiko:** Mengidentifikasi titik rawan bencana dan rute aman.
2. **Jalur Evakuasi:** Memastikan rambu evakuasi jelas terbaca di siang dan malam hari.
3. **Titik Kumpul (Assembly Point):** Area lapang yang aman dari bahaya runtuhan atau gelombang.
4. **Komunikasi Krisis:** Menyebarkan informasi resmi dari instansi berwenang (BMKG, BPBD) dan meredam kepanikan massal serta berita hoaks.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Pengenalan Potensi Bahaya Destinasi & Peta Evakuasi',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu memetakan jalur evakuasi menuju titik kumpul pada objek wisata terdekat.',
        method: 'Teori & Pemetaan Lapangan'
      },
      {
        sessionNumber: 2,
        title: 'Komunikasi Krisis & Simulasi Tanggap Bencana',
        duration: '6 JP (270 Menit)',
        competency: 'Mempraktikkan alur komunikasi darurat dan tata cara mengarahkan kerumunan wisatawan.',
        method: 'Simulasi Tanggap Bencana'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu menggambar peta sederhana yang memuat letak jalur evakuasi dan titik kumpul salah satu destinasi lokal.',
        'Menghasilkan produk: Pemetaan Sederhana Informasi Keselamatan Destinasi.'
      ],
      madya: [
        'Mampu menyusun panduan komunikasi tanggap krisis anti-hoaks saat terjadi insiden di objek wisata.',
        'Menghasilkan produk: Penyuluhan Mitigasi Destinasi.'
      ],
      utama: [
        'Mampu merancang rencana kontingensi kesiapsiagaan destinasi wisata bekerja sama dengan BPBD.',
        'Menghasilkan produk: Rencana Kontingensi Tanggap Krisis Lengkap.'
      ]
    },
    competencyTable: [
      {
        code: 'PY06.001.01',
        element: 'Menyosialisasikan Kesiapsiagaan Krisis Destinasi',
        indicator: 'Informasi jalur evakuasi dan mitigasi bencana disampaikan lugas dan menenangkan.',
        assessment: 'Penilaian Peta & Prosedur Evakuasi'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },

  // =========================================================================
  // 3. KRIDA MICE & EVENT WISATA (4 SKK: ME-01 s/d ME-04)
  // =========================================================================
  {
    id: 'skk-mice-a',
    kridaId: 'mice',
    kridaName: 'Krida MICE & Event Wisata',
    code: 'ME-01',
    title: 'Promosi MICE/Event Pariwisata',
    badge: 'SKK MICE (ME-01)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Perancangan strategi promosi dan publikasi acara pariwisata, pembuatan media promosi digital dan cetak, pengelolaan konten media sosial, penulisan siaran pers (copywriting), dan kemitraan sponsorship.',
    skkniReference: 'Kepmenaker Nomor 123 Tahun 2024 (MICE) & Nomor 120 Tahun 2024 (Event Pariwisata)',
    practiceProduct: {
      purwa: 'Membuat Media Promosi Event Sederhana (Flyer Digital / Konten Promosi Media Sosial)',
      madya: 'Perencanaan dan Pelaksanaan Promosi Event Pariwisata (Kalender Publikasi & Multi-Channel)',
      utama: 'Kampanye Promosi MICE/Event Pariwisata Terpadu (Strategi & Kemitraan Sponsorship)'
    },
    portfolioItems: [
      'Desain Flyer & Poster Acara',
      'Rencana Kalender Publikasi Medsos',
      'Siaran Pers / Dokumen Penawaran Sponsor',
      'Lembar Ujian SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Dasar Promosi MICE & Event
Mengacu pada Kepmenaker No. 123 dan 120 Tahun 2024, promosi event bertugas menciptakan awareness, minat, dan partisipasi publik terhadap festival atau konvensi pariwisata.

### Strategi Promosi:
- **Visual Branding:** Logo, color palette, tagline, dan poster promosi yang kuat.
- **Copywriting:** Naskah publikasi yang memicu daya tarik audiens sasaran.
- **Kalender Publikasi:** Pengaturan jadwal teaser, peluncuran jadwal, countdown, hingga hari-H.
- **Sponsorship:** Menyusun proposal penawaran nilai tambah bagi calon sponsor.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Dasar Copywriting & Desain Grafis Promosi Event',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu membuat visual poster dan naskah ajakan promosi festival budaya.',
        method: 'Workshop Digital'
      },
      {
        sessionNumber: 2,
        title: 'Manajemen Kampanye Multi-Platform & Kemitraan',
        duration: '6 JP (270 Menit)',
        competency: 'Menyusun kalender publikasi dan strategi promosi kemitraan sponsor.',
        method: 'Praktik Penyusunan Kampanye'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu mendesain flyer digital sederhana untuk acara kepramukaan/pariwisata lokal.',
        'Menghasilkan produk: Media Promosi Event Sederhana.'
      ],
      madya: [
        'Mampu menyusun rencana jadwal konten promosi media sosial selama 1 bulan pre-event.',
        'Menghasilkan produk: Pelaksanaan Promosi Event Multi-Channel.'
      ],
      utama: [
        'Mampu merancang strategi promosi festival terpadu beserta dokumen proposal sponsor.',
        'Menghasilkan produk: Kampanye Promosi MICE Terpadu.'
      ]
    },
    competencyTable: [
      {
        code: 'ME01.001.01',
        element: 'Merancang Media Promosi Event',
        indicator: 'Informasi tanggal, lokasi, pengisi acara, dan harga tiket disampaikan jelas dan menarik.',
        assessment: 'Penilaian Karya Media Promosi'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-mice-b',
    kridaId: 'mice',
    kridaName: 'Krida MICE & Event Wisata',
    code: 'ME-02',
    title: 'Fotografi, Videografi & Dokumentasi Udara MICE/Event',
    badge: 'SKK MICE (ME-02)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Dokumentasi visual rangkaian acara dan festival, komposisi shot list, video highlight promosi, etika privasi publik, pengarsipan aset digital, serta kepatuhan regulasi keselamatan dokumentasi udara (drone).',
    skkniReference: 'Kepmenaker Nomor 123/2024, 120/2024 & Regulasi Keselamatan Ruang Udara Drone',
    specialSafetyNotes: 'KETENTUAN DRONE: Pengoperasian drone wajib menaati batas ketinggian maksimal, menjauhi zona steril/kawasan militer (no-fly zone), memperhatikan keselamatan penonton, dan menghormati privasi publik.',
    practiceProduct: {
      purwa: 'Membuat Dokumentasi Foto dan Video Event Sederhana (Set Foto & Video Teaser 30 Detik)',
      madya: 'Perencanaan dan Produksi Dokumentasi MICE/Event (Shot List & Video Highlight)',
      utama: 'Sistem Manajemen Dokumentasi MICE/Event & SOP Dokumentasi Udara'
    },
    portfolioItems: [
      'Album Portofolio Foto Event',
      'Video Highlight 60 Detik',
      'Shot List & Logbook Dokumentasi',
      'Lembar Hasil Uji Penguji'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Dokumentasi MICE & Event
Dokumentasi visual berfungsi sebagai arsip akuntabilitas, materi laporan LPJ, dan materi promosi event edisi mendatang.

### Standar Kerja:
- **Shot List Event:** Registrasi tamu, pembukaan VIP, pemotongan pita/gong, interaksi peserta, suasana kerumunan, dan penutupan.
- **Komposisi & Audio:** Framing proporsional (Rule of Thirds), pencahayaan stabil, dan kualitas audio jernih.
- **Regulasi Drone:** Wajib memahami batas ketinggian terbang (maksimal 120 meter), tidak terbang tepat di atas kerumunan padat, dan menghindari zona terlarang penerbangan (KKOP).`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Komposisi Fotografi & Videografi Acara Lapangan',
        duration: '4 JP (180 Menit)',
        competency: 'Menguasai segitiga eksposur (ISO, Shutter, Aperture) dan penyusunan shot list.',
        method: 'Teori & Praktik Kamera'
      },
      {
        sessionNumber: 2,
        title: 'Editing Video Teaser & Keselamatan Dokumentasi Drone',
        duration: '6 JP (270 Menit)',
        competency: 'Menyunting video highlight 30-60 detik dan memahami SOP keselamatan terbang drone.',
        method: 'Workshop Editing'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu mendokumentasikan minimal 10 foto momen kunci sebuah kegiatan pramuka/event lokal.',
        'Menghasilkan produk: Dokumentasi Foto dan Video Sederhana.'
      ],
      madya: [
        'Mampu memproduksi video rekap event berdurasi 1 menit dengan alur cerita menarik dan audio jernih.',
        'Menghasilkan produk: Produksi Dokumentasi MICE/Event Terstruktur.'
      ],
      utama: [
        'Mampu mengoordinasikan tim liputan multimedia event dan menyusun SOP dokumentasi udara aman.',
        'Menghasilkan produk: Sistem Manajemen Dokumentasi MICE/Event.'
      ]
    },
    competencyTable: [
      {
        code: 'ME02.001.01',
        element: 'Memproduksi Dokumentasi Visual Event',
        indicator: 'Momen penting terekam fokus, eksposur tepat, dan hasil terarsip sistematis.',
        assessment: 'Penilaian Album Portofolio & Video'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-mice-c',
    kridaId: 'mice',
    kridaName: 'Krida MICE & Event Wisata',
    code: 'ME-03',
    title: 'Perencanaan MICE/Event Pariwisata',
    badge: 'SKK MICE (ME-03)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Penyusunan konsep tema acara pariwisata, pembuatan proposal kegiatan, rencana anggaran biaya (RAB), tata letak venue (floor plan), struktur kepanitiaan, timeline persiapan, dan analisis risiko.',
    skkniReference: 'Kepmenaker Nomor 120 Tahun 2024 (Event) & Nomor 123 Tahun 2024 (MICE)',
    practiceProduct: {
      purwa: 'Rencana Event Pariwisata Sederhana (Konsep Acara, Jadwal, & Kebutuhan Logistik)',
      madya: 'Proposal Perencanaan MICE/Event Pariwisata (RAB Rinci, Tata Letak Venue, & Mitigasi Risiko)',
      utama: 'Master Plan MICE/Event Pariwisata Lengkap (Production Plan, Event Brief, & Kontingensi)'
    },
    portfolioItems: [
      'Proposal Lengkap Event MICE',
      'Rencana Anggaran Biaya (RAB Spreadsheet)',
      'Site Map / Tata Letak Venue Acara',
      'Lembar Evaluasi Penguji'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Anatomi Perencanaan Event Pariwisata
Mengacu pada Kepmenaker No. 120/2024, perencanaan event mencakup proses sistematis dari gagasan awal hingga cetak biru produksi.

### Dokumen Pokok Perencanaan:
1. **Event Concept & Theme:** Latar belakang, tujuan, audiens target, dan pesan kunci.
2. **Timeline Produksi:** Rangkaian tahapan pre-event, loading in, gladi resik, hari-H, dan loading out.
3. **Rencana Anggaran Biaya (RAB):** Pos venue, panggung & rigging, sound & lighting, artis/narasumber, konsumsi, dan tak terduga.
4. **Venue Layout (Floor Plan):** Alur sirkulasi pengunjung, pintu darurat, toilet, dan stan pameran.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Penyusunan Konsep Event & Proposal MICE',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu merumuskan tema event dan menyusun dokumen proposal penawaran.',
        method: 'Teori & Diskusi'
      },
      {
        sessionNumber: 2,
        title: 'Kalkulasi Anggaran (RAB) & Perancangan Tata Letak Venue',
        duration: '6 JP (270 Menit)',
        competency: 'Menyusun spreadsheet anggaran kegiatan dan sketsa tata ruang pameran.',
        method: 'Workshop Perencanaan'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu menyusun rencana acara sederhana (lomba/pameran) di tingkat gugusdepan/ranting.',
        'Menghasilkan produk: Rencana Event Pariwisata Sederhana.'
      ],
      madya: [
        'Mampu menyusun proposal lengkap MICE/event pariwisata beranggaran terperinci.',
        'Menghasilkan produk: Proposal Perencanaan MICE/Event.'
      ],
      utama: [
        'Mampu merancang Master Plan festival budaya tingkat kota/kabupaten dengan analisis risiko komprehensif.',
        'Menghasilkan produk: Master Plan MICE/Event Pariwisata.'
      ]
    },
    competencyTable: [
      {
        code: 'ME03.001.01',
        element: 'Menyusun Proposal Perencanaan Event',
        indicator: 'Konsep terstruktur, breakdown biaya realistis, dan layout venue logis.',
        assessment: 'Penilaian Dokumen Proposal'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-mice-d',
    kridaId: 'mice',
    kridaName: 'Krida MICE & Event Wisata',
    code: 'ME-04',
    title: 'Manajemen Pelaksanaan MICE/Event',
    badge: 'SKK MICE (ME-04)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Operasional hari-H penyelenggaraan acara pariwisata, briefing tim kerja, manajemen registrasi tamu, alur kerumunan (crowd management), koordinasi panggung dan teknis, serta evaluasi pasca-event.',
    skkniReference: 'Kepmenaker Nomor 120 Tahun 2024 (Event) & Nomor 123 Tahun 2024 (MICE)',
    practiceProduct: {
      purwa: 'Praktik Membantu Pelaksanaan Event Pariwisata Sederhana (Registrasi & Logistik)',
      madya: 'Praktik Operasional Pelaksanaan MICE/Event (Rundown & Manajemen Alur Tamu)',
      utama: 'Praktik Manajemen Pelaksanaan MICE/Event (Show Management & Evaluasi)'
    },
    portfolioItems: [
      'Master Cue Card & Rundown Hari-H',
      'Checklist Kesiapan Perlengkapan Acara',
      'Laporan Evaluasi Pelaksanaan (Post-Event Report)',
      'Lembar Penilaian SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Operasional Pelaksanaan Event Hari-H
Kunci sukses pelaksanaan event berada pada koordinasi lapangan, ketepatan waktu rundown, dan kesigapan mengatasi kendala teknis.

### Aspek Manajemen Pelaksanaan:
1. **Briefing Tim & Cue Card:** Memastikan setiap panitia memahami tugas di pos masing-masing.
2. **Registrasi & Hospitality Tamu:** Meja pendaftaran tertib, pembagian seminar kit, dan penataan VIP.
3. **Crowd Management:** Menjaga agar tidak terjadi penumpukan kerumunan pada pintu masuk/keluar.
4. **Stage Management:** Mengatur pergantian penampil, gladi kotor/bersih, dan sinkronisasi audio-visual.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Manajemen Alur Panggung & Pengendalian Rundown',
        duration: '4 JP (180 Menit)',
        competency: 'Menguasai pembacaan cue card dan komunikasi handy-talkie (HT) antardivisi.',
        method: 'Simulasi Peran'
      },
      {
        sessionNumber: 2,
        title: 'Operasional Lapangan & Manajemen Insiden Lapangan',
        duration: '6 JP (270 Menit)',
        competency: 'Mampu mengatasi insiden keterlambatan penampil atau gangguan teknis.',
        method: 'Praktik Operasional Nyata'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu bertugas sebagai petugas meja registrasi atau penata perlengkapan kegiatan.',
        'Menghasilkan produk: Membantu Pelaksanaan Event Sederhana.'
      ],
      madya: [
        'Mampu bertindak sebagai Stage Manager atau Floor Manager dalam sebuah pertunjukan seni.',
        'Menghasilkan produk: Operasional Pelaksanaan MICE/Event.'
      ],
      utama: [
        'Mampu memimpin keseluruhan operasional pelaksanaan festival pariwisata (Event Director).',
        'Menyusun laporan evaluasi pasca-event (Post-Event Report).',
        'Menghasilkan produk: Manajemen Pelaksanaan MICE/Event Lengkap.'
      ]
    },
    competencyTable: [
      {
        code: 'ME04.001.01',
        element: 'Mengendalikan Operasional Hari-H Event',
        indicator: 'Rundown berjalan tepat waktu dan koordinasi kepanitiaan berjalan lancar.',
        assessment: 'Uji Praktik Observasi Lapangan'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },

  // =========================================================================
  // 4. KRIDA KULINER & CINDERAMATA (5 SKK: KC-01 s/d KC-05)
  // =========================================================================
  {
    id: 'skk-kuliner-a',
    kridaId: 'kuliner',
    kridaName: 'Krida Kuliner & Cinderamata',
    code: 'KC-01',
    title: 'Masakan Khas Lokal',
    badge: 'SKK Kuliner (KC-01)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Pengolahan masakan autentik daerah, seleksi bahan segar lokal, standar kebersihan/higiene & sanitasi, keamanan pangan (food safety), penataan porsi (food plating), dan filosofi kearifan gastronomi.',
    skkniReference: 'Kepmenaker Nomor 107 Tahun 2024 tentang Jasa Boga / Gastronomi Lokal',
    practiceProduct: {
      purwa: 'Membuat Satu Masakan Khas Lokal Sesuai Resep Baku (Higiene, Sanitasi, & Cerita Filosofi)',
      madya: 'Produksi dan Penyajian Masakan Khas Lokal (Standardisasi Porsi, Food Plating, & Kalkulasi Harga)',
      utama: 'Pengembangan Produk Masakan Khas Lokal sebagai Produk Pariwisata (Inovasi & Kemasan Vakum)'
    },
    portfolioItems: [
      'Resep Standar Masakan Khas Daerah',
      'Dokumentasi Foto/Video Memasak Higienis',
      'Kalkulasi Biaya Bahan & Harga Menu',
      'Lembar Uji Rasa & Sanitasi Penguji'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Gastronomi & Masakan Tradisional Nusantara
Mengacu pada Kepmenaker No. 107 Tahun 2024, masakan khas daerah merupakan aset budaya berharga dan daya tarik utama pariwisata gastronomi.

### Standar Keamanan & Pengolahan:
1. **Higiene Personal & Dapur:** Mencuci tangan, memakai celemek dan penutup kepala, menjaga kebersihan talenan dan pisau.
2. **Kualitas Bahan Baku:** Memilih bahan lokal segar tanpa pengawet sintetis berbahaya.
3. **Resep Standar:** Takaran bumbu seimbang untuk menjaga konsistensi cita rasa autentik.
4. **Food Storytelling:** Mengetahui makna historis dan tradisi budaya di balik sajian hidangan.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Higiene Sanitasi Pangan & Resep Warisan Kuliner',
        duration: '4 JP (180 Menit)',
        competency: 'Memahami prinsip keamanan pangan (food safety) dan identifikasi bumbu rempah lokal.',
        method: 'Teori & Bedah Resep'
      },
      {
        sessionNumber: 2,
        title: 'Praktik Memasak & Penataan Hidangan (Plating)',
        duration: '6 JP (270 Menit)',
        competency: 'Mengolah masakan khas daerah dan menyajikannya secara higienis dan artistik.',
        method: 'Praktik Memasak'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu memasak 1 jenis hidangan khas lokal sesuai resep baku dengan menjaga kebersihan.',
        'Mampu menjelaskan asal-usul masakan tersebut.',
        'Menghasilkan produk: Satu Masakan Khas Lokal.'
      ],
      madya: [
        'Mampu memasak untuk porsi rombongan minimal 10 orang dengan rasa konsisten.',
        'Menghitung harga pokok produksi (HPP) dan harga jual per porsi.',
        'Menghasilkan produk: Produksi dan Penyajian Masakan Khas Lokal.'
      ],
      utama: [
        'Mampu mengembangkan varian produk kuliner oleh-oleh siap saji (misal: bumbu siap pakai/kemasan vakum).',
        'Menghasilkan produk: Pengembangan Produk Masakan Khas Lokal Pariwisata.'
      ]
    },
    competencyTable: [
      {
        code: 'KC01.001.01',
        element: 'Mengolah Masakan Khas Lokal',
        indicator: 'Teknik memasak benar, bumbu meresap, higienis, dan cita rasa autentik.',
        assessment: 'Uji Organoleptik (Rasa, Aroma, Tampilan)'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-kuliner-b',
    kridaId: 'kuliner',
    kridaName: 'Krida Kuliner & Cinderamata',
    code: 'KC-02',
    title: 'Makanan/Minuman Ringan Khas Lokal',
    badge: 'SKK Kuliner (KC-02)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Pembuatan panganan ringan tradisional (kudapan basah/kering) dan minuman rempah/herbal khas nusantara, pengemasan higienis, uji daya tahan pangan, serta kemasan oleh-oleh ramah lingkungan.',
    skkniReference: 'Kepmenaker Nomor 107/2024 (Jasa Boga) & Nomor 16/2024 (Rumah Minum/Kafe)',
    practiceProduct: {
      purwa: 'Membuat Satu Makanan atau Minuman Ringan Khas Lokal (Kudapan Tradisional / Herbal)',
      madya: 'Produksi dan Penyajian Makanan/Minuman Ringan Khas Lokal (Kemasan Kedap Udara)',
      utama: 'Pengembangan Makanan/Minuman Ringan Khas Lokal (Kemasan Ramah Lingkungan & Edukasi)'
    },
    portfolioItems: [
      'Resep Makanan/Minuman Ringan',
      'Sampel Produk dengan Label Komposisi',
      'Dokumentasi Proses Pengemasan',
      'Lembar Penilaian SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Kudapan Tradisional & Minuman Herbal
Ciri khas oleh-oleh pariwisata seringkali berupa jajanan pasar tradisional, keripik khas, atau minuman seduhan rempah (wedang jahe, beras kencur, bir pletok, dsb).

### Aspek Kualitas Produk:
- Ketepatan takaran bahan agar tekstur renyah/kenyal terjaga.
- Pengeringan atau perebusan steril untuk memperpanjang daya simpan alami.
- Pengemasan dengan segel rapat dan label informasi tanggal kadaluarsa serta komposisi bahan.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Teknologi Pengolahan Kudapan & Minuman Tradisional',
        duration: '4 JP (180 Menit)',
        competency: 'Mengenal teknik pembuatan panganan ringan dan ekstraksi minuman herbal.',
        method: 'Teori & Demonstrasi'
      },
      {
        sessionNumber: 2,
        title: 'Standardisasi Pengemasan & Uji Daya Tahan Produk',
        duration: '6 JP (270 Menit)',
        competency: 'Mempraktikkan pengemasan kedap udara dan perancangan stiker label produk.',
        method: 'Praktik Pengemasan'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu membuat 1 jenis kudapan basah/kering atau minuman rempah khas lokal.',
        'Menghasilkan produk: Satu Makanan/Minuman Ringan Khas Lokal.'
      ],
      madya: [
        'Mampu memproduksi batch makanan ringan dengan kemasan menarik dan bersegel.',
        'Menghasilkan produk: Produksi dan Penyajian Makanan/Minuman Ringan.'
      ],
      utama: [
        'Mampu mengembangkan inovasi rasa dan kemasan ramah lingkungan bernilai oleh-oleh premium.',
        'Menghasilkan produk: Pengembangan Makanan/Minuman Ringan Pariwisata.'
      ]
    },
    competencyTable: [
      {
        code: 'KC02.001.01',
        element: 'Membuat Makanan/Minuman Ringan Lokal',
        indicator: 'Rasa khas, higienis, kemasan rapi, dan mencantumkan informasi produk.',
        assessment: 'Uji Organoleptik & Penilaian Kemasan'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-kuliner-c',
    kridaId: 'kuliner',
    kridaName: 'Krida Kuliner & Cinderamata',
    code: 'KC-03',
    title: 'Desain & Kerajinan Cinderamata',
    badge: 'SKK Cinderamata (KC-03)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Perancangan dan pembuatan kerajinan kriya cinderamata berciri khas identitas kedaerahan, pembuatan sketsa desain, penguasaan teknik kriya (anyam, pahat, ukir, batik, rajut), finishing rapi, dan kontrol kualitas.',
    skkniReference: 'Standar Kompetensi Nasional Bidang Kriya & Desain Produk Kreatif Ekraf',
    practiceProduct: {
      purwa: 'Membuat Satu Cinderamata Sederhana Berbasis Identitas Lokal (Gantungan Kunci / Pembatas Buku)',
      madya: 'Membuat Satu Produk Cinderamata Berbasis Identitas Lokal (Produk Fungsional & Rapi)',
      utama: 'Pengembangan Produk Cinderamata sebagai Produk Pariwisata (Inovasi Kriya Kontemporer)'
    },
    portfolioItems: [
      'Sketsa Desain Kerajinan Cinderamata',
      'Produk Fisik Prototipe Cinderamata',
      'Foto Rangkaian Proses Pembuatan',
      'Lembar Uji Kualitas Penguji'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Kriya & Desain Cinderamata Pariwisata
Cinderamata yang diminati wisatawan adalah cinderamata yang mudah dibawa (portable), memiliki nilai guna (functional), dan memancarkan identitas budaya lokal yang otentik.

### Tahapan Penciptaan Cinderamata:
1. **Riset Ikon Budaya:** Mengadopsi ornamen rumah adat, flora-fauna khas, atau motif kain daerah.
2. **Sketsa & Prototipe:** Menggambar rancangan ukuran dan memilih teknik kriya yang tepat.
3. **Produksi & Finishing:** Memotong, menganyam, mengukir, menghaluskan permukaan, dan memberi lapisan pelindung (varnish/coating).
4. **Kontrol Kualitas:** Memastikan tidak ada bagian tajam yang membahayakan atau sambungan rapuh.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Eksplorasi Ikon Budaya & Pembuatan Sketsa Kriya',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu menggambar pola cinderamata berbasis ragam hias daerah.',
        method: 'Praktik Menggambar'
      },
      {
        sessionNumber: 2,
        title: 'Teknik Pembuatan & Finishing Produk Cinderamata',
        duration: '6 JP (270 Menit)',
        competency: 'Menyelesaikan 1 karya cinderamata dengan teknik finishing rapi.',
        method: 'Workshop Kriya'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu membuat 1 cinderamata sederhana (gantungan kunci, pembatas buku, gelang etnik).',
        'Menghasilkan produk: Satu Cinderamata Sederhana.'
      ],
      madya: [
        'Mampu memproduksi cinderamata fungsional (tempat pulpen, dompet batik, ornamen meja).',
        'Menghasilkan produk: Produk Cinderamata Identitas Lokal.'
      ],
      utama: [
        'Mampu merancang lini produk cinderamata tematik berdaya saing pasar modern.',
        'Menghasilkan produk: Pengembangan Produk Cinderamata Pariwisata.'
      ]
    },
    competencyTable: [
      {
        code: 'KC03.001.01',
        element: 'Membuat Cinderamata Berbasis Identitas Lokal',
        indicator: 'Bentuk proporsional, finishing halus, dan mencerminkan ikon daerah.',
        assessment: 'Uji Kualitas Fisik Produk Kriya'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-kuliner-d',
    kridaId: 'kuliner',
    kridaName: 'Krida Kuliner & Cinderamata',
    code: 'KC-04',
    title: 'Pemanfaatan Bahan Lokal untuk Cinderamata',
    badge: 'SKK Cinderamata (KC-04)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Eksplorasi dan pemanfaatan bahan baku alam terbarukan lokal (bambu, batok kelapa, daun pandan, rotan, limbah kayu daur ulang) secara legal, ramah lingkungan, dan prinsip kriya nir-sampah (zero waste).',
    skkniReference: 'Prinsip Kriya Berkelanjutan, Zero Waste, & Pemanfaatan Bahan Lokal Ramah Lingkungan',
    specialSafetyNotes: 'KETENTUAN LINGKUNGAN: Dilarang keras memanfaatkan bagian flora/fauna yang dilindungi regulasi (seperti karang hidup, cangkang penyu, kayu langka terlindungi). Wajib menggunakan bahan terbarukan dan legal.',
    practiceProduct: {
      purwa: 'Membuat Satu Cinderamata Sederhana Menggunakan Bahan Lokal (Batok Kelapa, Bambu, Pandan)',
      madya: 'Membuat Satu Produk Cinderamata Berbasis Bahan Lokal (Pengolahan Alami & Efisiensi)',
      utama: 'Mengembangkan Produk Cinderamata Berbasis Bahan Lokal Berkelanjutan (Zero Waste Kriya)'
    },
    portfolioItems: [
      'Inventarisasi Bahan Baku Ramah Lingkungan',
      'Produk Cinderamata Bahan Lokal',
      'Catatan Efisiensi Limbah Produksi',
      'Lembar Uji SKK'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Pemanfaatan Sumber Daya Alam Berkelanjutan
Mengacu pada Buku Panduan 2026, Saka Pariwisata mempelopori kriya ramah lingkungan yang memanfaatkan potensi bahan alam sekitar tanpa merusak ekosistem.

### Bahan Baku Lokal Unggulan:
- Batok dan sabut kelapa.
- Bambu dan rotan budidaya.
- Daun pandan duri, mendong, enceng gondok.
- Limbah potongan kayu industri mebel lokal.
- Kulit kerang hasil budidaya konsumsi (bukan kerang langka dilindungi).`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Identifikasi Bahan Terbarukan & Regulasi Konservasi',
        duration: '4 JP (180 Menit)',
        competency: 'Membedakan bahan alam yang aman dimanfaatkan dari jenis flora-fauna terlarang.',
        method: 'Teori & Observasi'
      },
      {
        sessionNumber: 2,
        title: 'Teknik Pengolahan Bahan Baku Alami & Perakitan Kriya',
        duration: '6 JP (270 Menit)',
        competency: 'Mengolah serat bambu/batok kelapa menjadi produk kerajinan bernilai guna.',
        method: 'Praktik Kriya'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu membuat kerajinan sederhana dari bahan alam yang ditemukan di lingkungan sekitarnya.',
        'Menghasilkan produk: Cinderamata Sederhana Bahan Lokal.'
      ],
      madya: [
        'Mampu mengolah bahan baku lokal dengan pengawetan alami bebas racun kimia.',
        'Menghasilkan produk: Produk Cinderamata Bahan Lokal.'
      ],
      utama: [
        'Mampu merancang lini kriya zero waste dan melatih pengrajin pemula di desa wisata.',
        'Menghasilkan produk: Cinderamata Berkelanjutan Zero Waste.'
      ]
    },
    competencyTable: [
      {
        code: 'KC04.001.01',
        element: 'Memanfaatkan Bahan Alam Terbarukan',
        indicator: 'Bahan diperoleh secara legal, diproses efisien, dan minim sisa limbah.',
        assessment: 'Penilaian Proses & Karya Kriya Bahan Lokal'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  },
  {
    id: 'skk-kuliner-e',
    kridaId: 'kuliner',
    kridaName: 'Krida Kuliner & Cinderamata',
    code: 'KC-05',
    title: 'Pemasaran Produk Cinderamata',
    badge: 'SKK Cinderamata (KC-05)',
    levelSKK: 'Purwa (7-15 Thn) • Madya (15-20 Thn) • Utama (21-25 Thn)',
    description: 'Strategi penetapan harga (costing & pricing), display produk di gerai sentra oleh-oleh wisata, pengemasan menarik dan aman, katalog foto produk, pemasaran digital (marketplace/medsos), dan pelayanan konsumen.',
    skkniReference: 'Kepmenaker Nomor 80 Tahun 2024 tentang Jasa Konsultansi Pemasaran Pariwisata',
    practiceProduct: {
      purwa: 'Melakukan Pemasaran Sederhana Satu Produk Cinderamata (Display Produk & Pelayanan Ramah)',
      madya: 'Menyusun dan Melaksanakan Pemasaran Satu Produk Cinderamata (Katalog Foto & Toko Digital)',
      utama: 'Menyusun dan Melaksanakan Kampanye Pemasaran Produk Cinderamata (Kemitraan Omnichannel)'
    },
    portfolioItems: [
      'Katalog Foto & Deskripsi Produk',
      'Tabel Kalkulasi HPP dan Margin Laba',
      'Dokumentasi Display / Toko Digital',
      'Lembar Evaluasi Penguji'
    ],
    scoringWeights: { knowledge: 20, skill: 40, attitude: 20, product: 20, passingGrade: 80 },
    content: `## 1. Pemasaran Produk Cinderamata & UMKM
Mengacu pada Kepmenaker No. 80 Tahun 2024, pemasaran produk cinderamata mengombinasikan saluran luring (sentra oleh-oleh) dan daring (e-commerce & media sosial).

### Komponen Pemasaran:
1. **Penetapan Harga:** Menghitung biaya bahan, upah tenaga kerja, dan margin laba wajar.
2. **Visual Merchandising:** Menata display etalase yang rapi dengan pencahayaan dan label harga jelas.
3. **Katalog Digital:** Foto produk berlatar belakang bersih dengan keterangan dimensi, bahan, dan cara perawatan.
4. **Hospitality Penjualan:** Melayani wisatawan dengan ramah, komunikatif, dan menyediakan pilihan pembayaran digital (QRIS).`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Penetapan Harga Pokok & Visual Merchandising Gerai',
        duration: '4 JP (180 Menit)',
        competency: 'Menghitung HPP cinderamata dan menata etalase stan cinderamata.',
        method: 'Teori & Simulasi Penataan'
      },
      {
        sessionNumber: 2,
        title: 'Katalog Produk Digital & Layanan Pelanggan Ramah',
        duration: '6 JP (270 Menit)',
        competency: 'Membuat foto katalog produk dengan ponsel dan menyimulasikan transaksi ramah.',
        method: 'Praktik Pembuatan Katalog'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu menata stan display produk cinderamata dengan rapi dan mempraktikkan salam Sapta Pesona kepada pembeli.',
        'Menghasilkan produk: Pemasaran Sederhana Satu Produk Cinderamata.'
      ],
      madya: [
        'Mampu membuat katalog digital berisi minimal 5 produk kerajinan lengkap dengan harga dan deskripsi.',
        'Menghasilkan produk: Pemasaran Satu Produk Cinderamata.'
      ],
      utama: [
        'Mampu merancang strategi pemasaran kemitraan dengan hotel, agen tur, atau toko daring.',
        'Menghasilkan produk: Kampanye Pemasaran Cinderamata Pariwisata.'
      ]
    },
    competencyTable: [
      {
        code: 'KC05.001.01',
        element: 'Memasarkan Produk Cinderamata',
        indicator: 'Display menarik, harga transparan, komunikasi ramah, dan pembukuan penjualan tercatat rapi.',
        assessment: 'Uji Simulasi Penjualan & Portofolio Katalog'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-03T10:00:00.000Z',
    updatedBy: 'Tim Penyusun Buku Panduan 2026'
  }
];
