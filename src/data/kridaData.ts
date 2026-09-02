import { KridaCategoryInfo, KridaModuleItem } from '../types';

export const KRIDA_CATEGORIES: KridaCategoryInfo[] = [
  {
    id: 'pemandu',
    name: 'Krida Pemandu Wisata',
    shortTitle: 'Krida Pemandu',
    subtitle: 'Bina Pemandu Wisata & Storyteller',
    badge: 'Tour Guide & Storyteller',
    color: 'from-amber-500 via-orange-500 to-amber-600',
    borderGlow: 'border-amber-500/50 hover:border-amber-400 group-hover:shadow-amber-500/20',
    description: 'Keahlian kepemanduan wisata alam, sejarah, budaya, interpretasi objek wisata, manajemen tur, dan keselamatan perjalanan.',
    topicsCount: 8
  },
  {
    id: 'penyuluh',
    name: 'Krida Penyuluh Wisata',
    shortTitle: 'Krida Penyuluh',
    subtitle: 'Bina Sadar Wisata & Sapta Pesona',
    badge: 'Sapta Pesona & Edukasi',
    color: 'from-emerald-500 via-teal-500 to-emerald-600',
    borderGlow: 'border-emerald-500/50 hover:border-emerald-400 group-hover:shadow-emerald-500/20',
    description: 'Penyuluhan sadar wisata, penerapan 7 unsur Sapta Pesona, ekowisata, konservasi, wisata tirta, religi, dan mitigasi krisis destinasi.',
    topicsCount: 6
  },
  {
    id: 'kuliner',
    name: 'Krida Kuliner & Cinderamata',
    shortTitle: 'Krida Kuliner & Kriya',
    subtitle: 'Karya Khas Daerah & Gastronomi',
    badge: 'Gastronomi & Kriya UMKM',
    color: 'from-rose-500 via-pink-500 to-rose-600',
    borderGlow: 'border-rose-500/50 hover:border-rose-400 group-hover:shadow-rose-500/20',
    description: 'Pengembangan kuliner warisan lokal, panganan ringan tradisional, kriya kerajinan tangan, bahan baku lokal, dan pemasaran UMKM.',
    topicsCount: 5
  },
  {
    id: 'mice',
    name: 'Krida MICE & Event Wisata',
    shortTitle: 'Krida MICE & Event',
    subtitle: 'Bina Atraksi & Penyelenggaraan Event',
    badge: 'Event Organizer & Atraksi',
    color: 'from-purple-500 via-indigo-500 to-purple-600',
    borderGlow: 'border-purple-500/50 hover:border-purple-400 group-hover:shadow-purple-500/20',
    description: 'Pengelolaan atraksi budaya, festival kepemudaan, fotografi-videografi drone, perencanaan MICE, dan manajemen pelaksanaan event.',
    topicsCount: 4
  }
];

export const INITIAL_KRIDA_MODULES: KridaModuleItem[] = [
  // =========================================================================
  // 1. KRIDA PEMANDU WISATA (8 MATA KRIDA)
  // =========================================================================
  {
    id: 'skk-pemandu-a',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: '(a)',
    title: 'Pengetahuan Daya Tarik Wisata',
    badge: 'SKK Pemandu Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Penguasaan informasi mendalam mengenai daya tarik wisata alam, budaya, dan buatan, sejarah lokal, serta teknik interpretasi narasi wisata.',
    content: `## 1. Pengantar & Konsep Dasar
Pengetahuan Daya Tarik Wisata merupakan pondasi utama seorang pemandu wisata (tour guide). Pemandu bukan sekadar pengantar rute, melainkan seorang **Duta Budaya dan Narator Wisata (Storyteller)** yang menghubungkan wisatawan dengan jiwa dari suatu destinasi.

### Klasifikasi Daya Tarik Wisata (DTW) Berdasarkan UU Kepariwisataan:
1. **Daya Tarik Wisata Alam:** Keanekaragaman hayati, formasi geologis, lanskap pegunungan, pantai, kawah, dan kawasan konservasi.
2. **Daya Tarik Wisata Budaya:** Peninggalan sejarah purbakala, candi, keraton, arsitektur tradisional, upacara adat, dan kearifan lokal (*indigenous wisdom*).
3. **Daya Tarik Wisata Buatan (Man-made):** Taman rekreasi tematik, museum edukasi, sentra agro-wisata, dan pusat kebugaran tradisional.

## 2. Teknik Pengumpulan Data & Riset Destinasi
- Mempelajari naskah sejarah primer dan sekunder dari arsip daerah dan tetua adat.
- Menyusun **Fact Sheet Objek Wisata** yang mencakup aspek geografi, flora-fauna khas, serta legenda/mitos lokal yang berakar kuat.
- Memverifikasi keakuratan kronologi sejarah dan menghindari penyampaian fakta yang keliru atau menyinggung etika kearifan lokal.

## 3. Penerapan Storytelling & Interpretasi Warisan
Interpretasi wisata yang efektif menggunakan metode **T-O-R-E**:
- **Theme (Tema Pokok):** Tentukan satu pesan kunci dalam setiap sesi pemanduan.
- **Organized (Terstruktur):** Alur cerita mengalir dari awal pembuka, klimaks narasi, hingga penutup yang menyentuh.
- **Relevant (Relevan):** Menghubungkan informasi destinasi dengan pengalaman sehari-hari wisatawan.
- **Enjoyable (Menyenangkan):** Menyisipkan analogi santai, teka-teki budaya, dan interaksi dua arah yang hidup.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Pemetaan Potensi Daya Tarik Wisata Lokal & Nasional',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu mengidentifikasi 3 pilar daya tarik wisata (alam, budaya, buatan) di wilayah kwarcab masing-masing.',
        method: 'Teori & Diskusi Panel'
      },
      {
        sessionNumber: 2,
        title: 'Metode Riset & Penyusunan Fact Sheet Destinasi',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu menyusun lembar fakta sejarah dan legenda lokal yang akurat dan terverifikasi.',
        method: 'Praktik Studi Pustaka'
      },
      {
        sessionNumber: 3,
        title: 'Teknik Storytelling & Interpretasi Berbasis Nilai Kearifan Lokal',
        duration: '6 JP (270 Menit)',
        competency: 'Mampu mendemonstrasikan narasi interpretasi 10 menit di depan wisatawan tiruan (mock-up tour).',
        method: 'Simulasi Lapangan'
      }
    ],
    testRequirements: {
      purwa: [
        'Dapat menyebutkan dan menjelaskan minimal 5 daya tarik wisata di wilayah ranting/cabangnya.',
        'Mampu menceritakan sejarah singkat dan asal-usul salah satu destinasi budaya lokal dengan runtut.',
        'Mengetahui jam buka, aturan etika kunjungan, dan larangan adat pada destinasi yang dipelajari.'
      ],
      madya: [
        'Telah memiliki TKK Pengetahuan Daya Tarik Wisata Tingkat Purwa.',
        'Mampu menyusun Fact Sheet komprehensif untuk minimal 3 objek wisata lintas kabupaten/provinsi.',
        'Mampu memandu simulasi perjalanan wisata selama 30 menit dengan narasi storytelling yang komunikatif.'
      ],
      utama: [
        'Telah memiliki TKK Pengetahuan Daya Tarik Wisata Tingkat Madya.',
        'Mampu menyusun buku saku interpretasi panduan destinasi wisata provinsi binaan Saka Pariwisata.',
        'Mampu melatih dan menguji calon pramuka penegak/pandega untuk TKK Tingkat Purwa.'
      ]
    },
    competencyTable: [
      {
        code: 'PAR.PW01.001.01',
        element: 'Mengidentifikasi Potensi Objek dan Daya Tarik Wisata',
        indicator: 'Informasi geografi, sejarah, dan keunikan daya tarik dikumpulkan secara sistematis.',
        assessment: 'Uji Lisan & Portofolio Lembar Fakta'
      },
      {
        code: 'PAR.PW01.002.01',
        element: 'Mengembangkan Materi Interpretasi Wisata',
        indicator: 'Tema narasi disusun dengan teknik TORE tanpa distorsi fakta budaya.',
        assessment: 'Simulasi Pemanduan Praktik'
      },
      {
        code: 'PAR.PW01.003.01',
        element: 'Menyajikan Informasi Kepada Wisatawan',
        indicator: 'Penyampaian bahasa santun, artikulatif, dan menghargai keragaman wisatawan.',
        assessment: 'Observasi Langsung di Objek'
      }
    ],
    images: [
      {
        id: 'img-p1',
        url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&auto=format&fit=crop&q=80',
        caption: 'Pemandu Saka Pariwisata memberikan interpretasi sejarah candi dan peninggalan budaya.'
      },
      {
        id: 'img-p2',
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
        caption: 'Pengenalan daya tarik wisata bentang alam kawah dan konservasi geologi.'
      }
    ],
    links: [
      {
        id: 'lnk-p1',
        title: 'Standar Kompetensi Kerja Nasional Indonesia (SKKNI) Bidang Pemandu Wisata',
        url: 'https://kemenparekraf.go.id',
        type: 'REGULATION'
      },
      {
        id: 'lnk-p2',
        title: 'Panduan Storytelling Wisata Tematik Nusantara - Kemenparekraf RI',
        url: 'https://kemenparekraf.go.id/pustaka',
        type: 'REFERENCE'
      }
    ],
    downloads: [
      {
        id: 'dl-p1',
        title: 'Modul-01-Pengetahuan-Daya-Tarik-Wisata-Saka-Pariwisata.pdf',
        fileUrl: 'https://docs.google.com/document/d/1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E/export?format=pdf',
        fileType: 'PDF',
        fileSize: '3.2 MB'
      },
      {
        id: 'dl-p2',
        title: 'Formulir-Uji-SKK-Purwa-Pengetahuan-Wisata.docx',
        fileUrl: 'https://docs.google.com/document/d/1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E/export?format=docx',
        fileType: 'DOCX',
        fileSize: '450 KB'
      }
    ],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-pemandu-b',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: '(b)',
    title: 'Perencana Program Perjalanan Wisata (Tour Planner)',
    badge: 'SKK Pemandu Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Kemampuan merancang rencana perjalanan (itinerary), kalkulasi biaya tur (tour costing), manajemen rute, dan mitigasi risiko logistik perjalanan.',
    content: `## 1. Pengantar Tour Planning
Perencanaan program perjalanan (tour planning) adalah seni dan sains memadukan daya tarik wisata, transportasi, akomodasi, konsumsi, dan hiburan menjadi sebuah paket perjalanan yang berkesan, aman, serta layak secara finansial.

### Tahapan Perancangan Itinerary:
1. **Analisis Profil Wisatawan:** Minat, rentang usia, daya tahan fisik, serta kebutuhan khusus (pantangan makanan / ramah difabel).
2. **Penentuan Titik Singgah (Stop Points):** Memperhitungkan waktu tempuh riil (*travel time*), kemacetan, serta jam operasional destinasi.
3. **Penyusunan Runtutan Waktu (Timeline):** Menyediakan waktu istirahat yang cukup dan ruang gerak santai tanpa tergesa-gesa.
4. **Kalkulasi Biaya Paket (Tour Costing):** Komponen biaya tetap (*fixed cost*) dan biaya variabel (*variable cost*) per peserta.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Prinsip Dasar & Anatomi Itinerary Wisata Berkelanjutan',
        duration: '4 JP (180 Menit)',
        competency: 'Memahami komponen pokok itinerary: atraksi, aksesibilitas, amenitas, dan ancillaries (4A).',
        method: 'Teori & Bedah Kasus'
      },
      {
        sessionNumber: 2,
        title: 'Teknik Penghitungan Tour Costing & Pricing Table',
        duration: '6 JP (270 Menit)',
        competency: 'Mampu menyusun tabel kalkulasi harga paket wisata 2D1N beserta batas impas (break-even point).',
        method: 'Workshop Spreadsheet Komputer'
      },
      {
        sessionNumber: 3,
        title: 'Penyusunan Contingency Plan & Analisis Risiko Rute',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu menyusun rute alternatif saat terjadi hambatan cuaca atau penutupan jalur.',
        method: 'Simulasi Studi Kasus Lapangan'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu menyusun jadwal perjalanan 1 hari (One Day Tour) untuk rombongan keluarga di wilayah lokal.',
        'Dapat menghitung estimasi biaya tiket masuk dan konsumsi per orang dengan cermat.'
      ],
      madya: [
        'Mampu menyusun paket perjalanan wisata 3 Hari 2 Malam (3D2N) yang dilengkapi rincian biaya lengkap.',
        'Mampu mengoordinasikan reservasi penginapan dan armada transportasi darat.'
      ],
      utama: [
        'Mampu merancang paket wisata tematik minat khusus (geowisata/ekowisata lintas provinsi).',
        'Mampu mempresentasikan proposal penawaran paket wisata di hadapan calon mitra institusi/sekolah.'
      ]
    },
    competencyTable: [
      {
        code: 'PAR.PW02.001.01',
        element: 'Menyusun Rencana Perjalanan Wisata',
        indicator: 'Rute logis, waktu jeda proporsional, dan memperhatikan keselamatan perjalanan.',
        assessment: 'Penilaian Dokumen Itinerary'
      },
      {
        code: 'PAR.PW02.002.01',
        element: 'Menghitung Biaya Tur Wisata',
        indicator: 'Semua komponen pengeluaran (transport, makan, tiket, asuransi, fee guide) tercatat detail.',
        assessment: 'Uji Lembar Perhitungan Costing'
      }
    ],
    images: [
      {
        id: 'img-tp1',
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000&auto=format&fit=crop&q=80',
        caption: 'Penyusunan peta rute perjalanan dan jadwal singgah perjalanan wisata nusantara.'
      }
    ],
    links: [
      {
        id: 'lnk-tp1',
        title: 'Pedoman Penyusunan Pola Perjalanan Wisata - Kemenparekraf',
        url: 'https://kemenparekraf.go.id',
        type: 'REGULATION'
      }
    ],
    downloads: [
      {
        id: 'dl-tp1',
        title: 'Template-Spreadsheet-Kalkulasi-Tour-Costing-Saka.xlsx',
        fileUrl: 'https://docs.google.com/spreadsheets/d/1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E/export?format=xlsx',
        fileType: 'XLSX',
        fileSize: '1.1 MB'
      }
    ],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-pemandu-c',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: '(c)',
    title: 'Pemandu Perjalanan Wisata (Tour Guiding)',
    badge: 'SKK Pemandu Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Etika pemanduan, teknik berbicara di depan publik (public speaking), pengelolaan dinamika grup wisatawan, dan pelayanan prima (hospitality).',
    content: `## 1. Etika & Sikap Profesional Pemandu Wisata
Pemandu wisata memegang peran representasi martabat bangsa dan Pramuka. Sikap dasar yang wajib dimiliki:
- Berpakaian rapi, bersih, mengenakan atribut resmi Saka Pariwisata / lencana lisensi.
- Tepat waktu (*punctuality*) dan sigap dalam menangani perubahan situasi.
- Menjaga netralitas, tidak membicarakan isu SARA yang memecah belah, dan senantiasa santun.

## 2. Teknik Public Speaking & Komunikasi Efektif
- Mengatur intonasi, tempo, dan volume suara saat berbicara dengan mikrofon bus atau pengeras suara portabel (*megaphone*).
- Menghadap wisatawan secara berkala dan tidak berbicara sambil membelakangi audiens dalam durasi lama.
- Memberikan instruksi keselamatan (*safety briefing*) yang jelas dan mudah dipahami.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Standar Penampilan & Hospitality Pemandu Wisata',
        duration: '4 JP (180 Menit)',
        competency: 'Menerapkan standar grooming, etika berbicara, dan salam Sapta Pesona.',
        method: 'Praktik Roleplay'
      },
      {
        sessionNumber: 2,
        title: 'Pemanduan Selama di Kendaraan (On-Coach Guiding)',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu memberikan commentary interaktif selama perjalanan kendaraan berlangsung.',
        method: 'Simulasi On-Bus Guiding'
      },
      {
        sessionNumber: 3,
        title: 'Penanganan Komplain & Situasi Tak Terduga',
        duration: '4 JP (180 Menit)',
        competency: 'Menerapkan teknik L-A-S-T (Listen, Apologize, Solve, Thank) saat menangani keluhan.',
        method: 'Simulasi Penanganan Keluhan'
      }
    ],
    testRequirements: {
      purwa: [
        'Mampu memandu rombongan minimal 10 orang selama kunjungan setengah hari di destinasi lokal.',
        'Mampu menyampaikan safety briefing secara lugas dan percaya diri.'
      ],
      madya: [
        'Telah memandu minimal 3 perjalanan wisata resmi tingkat ranting/cabang.',
        'Mampu menangani keluhan wisatawan dengan solusi cepat dan memuaskan.'
      ],
      utama: [
        'Mampu memandu dalam bahasa asing (minimal Bahasa Inggris percakapan wisata).',
        'Tersertifikasi atau siap uji kompetensi BNSP skema Pemandu Wisata Muda.'
      ]
    },
    competencyTable: [
      {
        code: 'PAR.PW03.001.01',
        element: 'Melaksanakan Pemanduan Wisata',
        indicator: 'Informasi disampaikan sistematis, memperhatikan kenyamanan dan dinamika grup.',
        assessment: 'Uji Praktik Pemanduan Langsung'
      }
    ],
    images: [
      {
        id: 'img-tg1',
        url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1000&auto=format&fit=crop&q=80',
        caption: 'Pemandu Saka Pariwisata mendampingi interaksi wisatawan dengan pengrajin lokal.'
      }
    ],
    links: [
      {
        id: 'lnk-tg1',
        title: 'Kode Etik Himpunan Pramuwisata Indonesia (HPI)',
        url: 'https://hpi.or.id',
        type: 'REGULATION'
      }
    ],
    downloads: [
      {
        id: 'dl-tg1',
        title: 'Buku-Saku-Teknik-Pemanduan-Wisata-Pramuka.pdf',
        fileUrl: 'https://docs.google.com/document/d/1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E/export?format=pdf',
        fileType: 'PDF',
        fileSize: '2.8 MB'
      }
    ],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-pemandu-d',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: '(d)',
    title: 'Pemimpin Perjalanan Wisata (Tour Leader)',
    badge: 'SKK Pemandu Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Manajemen operasional perjalanan rombongan, koordinasi vendor akomodasi & transportasi, serta penyelesaian masalah di lapangan.',
    content: `## 1. Peran & Tanggung Jawab Tour Leader
Tour Leader (TL) bertindak sebagai nahkoda seluruh rangkaian operasional tur dari keberangkatan hingga kepulangan. Berbeda dari tour guide lokal yang fokus pada narasi objek, TL bertanggung jawab atas:
- Manajemen waktu, koordinasi check-in bandara/stasiun dan hotel.
- Memastikan hak setiap peserta wisata sesuai voucher perjanjian paket terpenuhi.
- Menjadi jembatan antara rombongan dengan penyedia jasa pihak ketiga (restoran, armada bus, pemandu lokal).`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Tugas Pokok & Prosedur Operasional Standar (SOP) Tour Leader',
        duration: '4 JP (180 Menit)',
        competency: 'Menguasai alur kerja pre-tour, on-tour, dan post-tour reporting.',
        method: 'Teori & Bedah Dokumen Voucher'
      },
      {
        sessionNumber: 2,
        title: 'Manajemen Rombongan Massal & Prosedur Transit',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu mengatur pergerakan rombongan 40+ orang di bandara, stasiun, dan rest area.',
        method: 'Simulasi Lapangan'
      }
    ],
    testRequirements: {
      purwa: ['Mampu mendampingi kepemimpinan tur 1 hari dengan jumlah peserta minimal 20 orang.'],
      madya: ['Mampu memimpin tur luar kota minimal 2 malam dengan koordinasi 3 vendor akomodasi/transportasi.'],
      utama: ['Mampu mengelola tur lintas pulau atau tur delegasi kehormatan kwartir dengan evaluasi zero-incident.']
    },
    competencyTable: [
      {
        code: 'PAR.TL01.001.01',
        element: 'Mengelola Operasional Perjalanan Wisata',
        indicator: 'Voucher diperiksa cermat, manifest rombongan sinkron, jadwal terpenuhi.',
        assessment: 'Portofolio Tour Report'
      }
    ],
    images: [
      {
        id: 'img-tl1',
        url: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=1000&auto=format&fit=crop&q=80',
        caption: 'Tour Leader Saka Pariwisata melakukan absensi dan briefing sebelum keberangkatan rombongan.'
      }
    ],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-pemandu-e',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: '(e)',
    title: 'Pemandu Wisata Selam',
    badge: 'SKK Pemandu Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Keahlian kepemanduan selam rekreasi (scuba diving & snorkeling), konservasi terumbu karang, pemahaman tabel dekompresi, dan protokol keselamatan bawah air.',
    content: `## 1. Pengenalan Wisata Bahari & Bawah Air
Indonesia adalah episentrum segitiga terumbu karang dunia (*Coral Triangle*). Pemandu wisata selam Saka Pariwisata memiliki mandat ganda: memberikan pengalaman visual memukau sekaligus menjadi benteng konservasi ekosistem laut.

### Kaidah Keselamatan Selam:
- Pemeriksaan kelayakan peralatan (*buddy check*: BCD, Weights, Releases, Air, Final check).
- Penerapan aturan *Look but Do Not Touch* untuk menjaga terumbu karang dari kerusakan fisik.
- Menguasai sinyal tangan bawah air (*hand signals*) untuk komunikasi darurat.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Fisika & Fisiologi Penyelaman Rekreasi',
        duration: '4 JP (180 Menit)',
        competency: 'Memahami hukum Boyle, penyesuaian tekanan telinga, dan batas kedalaman rekreasi.',
        method: 'Teori Kelas'
      },
      {
        sessionNumber: 2,
        title: 'Keterampilan Perairan Terbatas & Penggunaan Alat',
        duration: '6 JP (270 Menit)',
        competency: 'Mampu merakit SCUBA, masker clearing, dan regulator recovery.',
        method: 'Praktik Kolam Renang'
      },
      {
        sessionNumber: 3,
        title: 'Pemanduan Perairan Terbuka & Etika Konservasi Laut',
        duration: '8 JP (360 Menit)',
        competency: 'Memandu dive tour perairan dangkal serta mengidentifikasi biota laut yang dilindungi.',
        method: 'Praktik Laut Terbuka'
      }
    ],
    testRequirements: {
      purwa: ['Mampu berenang 200 meter tanpa alat bantu dan snorkeling 300 meter dengan benar.', 'Menguasai dasar sinyal komunikasi bawah air.'],
      madya: ['Memiliki lisensi Open Water Diver dari lembaga terakreditasi (POSSI/PADI/SSI).', 'Memandu penyelaman snorkeling rombongan pelajar.'],
      utama: ['Memiliki lisensi Rescue Diver atau Divemaster.', 'Mampu mengoordinasikan tim konservasi transplantasi terumbu karang.']
    },
    competencyTable: [
      {
        code: 'PAR.DIV01.001.01',
        element: 'Mempersiapkan Peralatan Selam Rekreasi',
        indicator: 'Peralatan terverifikasi aman, tabung terisi tekanan standar, O-ring utuh.',
        assessment: 'Uji Unjuk Kerja Alat'
      }
    ],
    images: [
      {
        id: 'img-dive1',
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000&auto=format&fit=crop&q=80',
        caption: 'Pemanduan wisata selam dan edukasi perlindungan terumbu karang nusantara.'
      }
    ],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-pemandu-f',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: '(f)',
    title: 'Pemandu Wisata Gunung',
    badge: 'SKK Pemandu Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Kecakapan pemanduan pendakian gunung, navigasi darat peta-kompas/GPS, manajemen bivak, pencegahan hipotermia, dan prinsip Zero Waste Mountaineering.',
    content: `## 1. Kode Etik Pemandu Wisata Gunung
Pemandu gunung memikul keselamatan hidup peserta pendakian di lingkungan berketinggian tinggi dan cuaca ekstrem. Prinsip mutlak:
- Tidak meninggalkan apapun kecuali jejak (*Leave No Trace*).
- Tidak mengambil apapun kecuali foto.
- Tidak membunuh apapun kecuali waktu.

## 2. Navigasi & Antisipasi Cuaca
- Membaca kontur peta topografi skala 1:25.000 / 1:50.000 dan membidik azimuth kompas prisma.
- Menentukan posisi koordinat darurat menggunakan GPS receiver dan aplikasi navigasi offline.
- Mengenali gejala awal penyakit ketinggian (AMS - Acute Mountain Sickness) dan hipotermia.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Navigasi Darat, Resection & Intersection Medan Hutan Gunung',
        duration: '6 JP (270 Menit)',
        competency: 'Mampu menentukan posisi koordinat pada peta topografi dalam waktu < 5 menit.',
        method: 'Praktik Lapangan'
      },
      {
        sessionNumber: 2,
        title: 'Pertolongan Pertama Hipotermia & Cedera Alam Bebas',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu membuat thermal wrap dan evakuasi tandu darurat.',
        method: 'Simulasi Penyelamatan'
      }
    ],
    testRequirements: {
      purwa: ['Mampu melakukan perjalanan jalan kaki hutan 15 km dengan beban ransel minimal 8 kg.', 'Menguasai pembuatan tenda darurat (bivak) dalam 15 menit.'],
      madya: ['Mampu memandu pendakian gunung berketinggian di atas 2.000 mdpl dengan minimal 5 peserta.', 'Memahami prosedur simaksi taman nasional.'],
      utama: ['Memiliki sertifikat pemandu gunung BNSP (APGI).', 'Mampu memimpin tim operasi pencarian dan evakuasi jalur gunung.']
    },
    competencyTable: [
      {
        code: 'PAR.MNT01.001.01',
        element: 'Memandu Perjalanan Wisata Gunung',
        indicator: 'Kecepatan jalan rombongan terkontrol, titik istirahat teratur, sampah terpantau dibawa turun.',
        assessment: 'Uji Ekspedisi Lapangan'
      }
    ],
    images: [
      {
        id: 'img-mnt1',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&auto=format&fit=crop&q=80',
        caption: 'Pemanduan pendakian gunung dan briefing keselamatan di pos pendakian.'
      }
    ],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-pemandu-g',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: '(g)',
    title: 'Pemandu Wisata Outbound',
    badge: 'SKK Pemandu Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Fasilitasi pelatihan luar ruang berbasis petualangan (experiential learning), dinamika kelompok, game ice breaking, dan instalasi tali tinggi (high ropes).',
    content: `## 1. Konsep Experiential Learning (Outbound)
Outbound bukan sekadar bermain di alam terbuka, melainkan metode pembelajaran pengalaman (*learning by doing*) yang bertujuan membangun karakter, kepemimpinan, dan kerja sama tim.

### Alur Sesi Outbound yang Efektif:
1. **Conditioning / Ice Breaking:** Mencairkan kebekuan, membangun tawa dan keterbukaan antar peserta.
2. **Team Building Challenge:** Permainan problem solving yang menuntut koordinasi dan komunikasi efektif.
3. **High Impact / High Ropes:** Uji keberanian personal (flying fox, spider web, two-line bridge).
4. **Debriefing / Processing:** Menggali makna filosofis dari aktivitas dan mengaitkannya dengan kehidupan nyata.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Manajemen Ice Breaking & Fun Games Dinamis',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu memimpin 10 variasi ice breaking untuk 50+ peserta dengan energetik.',
        method: 'Praktik Lapangan'
      },
      {
        sessionNumber: 2,
        title: 'Standard Safety Instalasi Tali Tinggi (High Ropes)',
        duration: '6 JP (270 Menit)',
        competency: 'Menguasai simpul jangkar, figur 8, prusik, dan inspeksi webbing/carabiner.',
        method: 'Praktik Tali Temali & Belaying'
      }
    ],
    testRequirements: {
      purwa: ['Mampu memimpin permainan ice breaking 30 menit dengan suasana gembira dan tertib.'],
      madya: ['Mampu merancang modul outbound 1 hari dengan 5 tahapan permainan terstruktur dan debrief bermakna.'],
      utama: ['Tersertifikasi instruktur outbound / fasilitator eksperiensial dari asosiasi resmi (AELI).']
    },
    competencyTable: [
      {
        code: 'PAR.OUT01.001.01',
        element: 'Memfasilitasi Program Outbound',
        indicator: 'Peserta terlibat aktif, keselamatan wahana terjaga, kesimpulan refleksi tercapai.',
        assessment: 'Observasi Pemfasilitasan Lapangan'
      }
    ],
    images: [
      {
        id: 'img-out1',
        url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1000&auto=format&fit=crop&q=80',
        caption: 'Aktivitas fasilitasi outbound team-building dan penguatan karakter kepanduan.'
      }
    ],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-pemandu-h',
    kridaId: 'pemandu',
    kridaName: 'Krida Pemandu Wisata',
    code: '(h)',
    title: 'Pemandu Keselamatan (LifeGuard)',
    badge: 'SKK Pemandu Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Kecakapan pertolongan kecelakaan air (water rescue), CPR (Resusitasi Jantung Paru), pemindaian bahaya ombak / rip current, dan evakuasi pantai-kolam.',
    content: `## 1. Peran Pokok LifeGuard Wisata
Penjaga keselamatan perairan (LifeGuard) bertugas mencegah terjadinya insiden di area wisata air (pantai, danau, sungai, kolam renang) serta melakukan aksi penyelamatan cepat tanpa membahayakan diri sendiri (*Reach, Throw, Row, Go, Tow*).

### Unsur Penilaian Bahaya Perairan:
- Mengenali arus balik mematikan (*Rip Current*) di pesisir pantai.
- Memasang rambu bendera zona aman (bendera merah = larangan berenang, bendera kuning = waspada).
- Menguasai teknik Cardiopulmonary Resuscitation (CPR) berstandar internasional.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Water Safety & Identifikasi Bahaya Perairan Pesisir/Danau',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu memetakan area berbahaya dan menentukan titik pos pantau penyelamat.',
        method: 'Teori & Pengamatan Lokasi'
      },
      {
        sessionNumber: 2,
        title: 'Teknik Defend & Release Saat Menolong Korban Panik',
        duration: '6 JP (270 Menit)',
        competency: 'Mampu melepaskan diri dari cengkeraman korban tenggelam di air dalam.',
        method: 'Praktik Air Dalam'
      },
      {
        sessionNumber: 3,
        title: 'Resusitasi Jantung Paru (CPR) & Penggunaan AED',
        duration: '4 JP (180 Menit)',
        competency: 'Melakukan kompresi dada 30:2 pada manekin dengan irama dan kedalaman presisi.',
        method: 'Simulasi Medis Medevac'
      }
    ],
    testRequirements: {
      purwa: ['Berenang gaya bebas 400 meter tanpa henti dan mengapung bertahan (water trappen) 10 menit.', 'Mendemonstrasikan kompresi dada CPR dengan benar.'],
      madya: ['Menyelam bebas mengambil beban 5 kg di kedalaman 3 meter.', 'Menarik korban sejauh 50 meter dengan teknik cross-chest carry.'],
      utama: ['Memiliki sertifikasi resmi Balawista / Basarnas.', 'Mampu mengoordinasikan tim penjagaan pantai saat lonjakan pengunjung libur nasional.']
    },
    competencyTable: [
      {
        code: 'PAR.LFG01.001.01',
        element: 'Melaksanakan Penyelamatan di Air',
        indicator: 'Waktu respon penyelamatan < 60 detik, korban dievakuasi ke darat dengan aman.',
        assessment: 'Uji Kecepatan & Ketepatan Rescue'
      }
    ],
    images: [
      {
        id: 'img-lg1',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
        caption: 'Penjagaan keselamatan pantai dan kesiapsiagaan LifeGuard Saka Pariwisata.'
      }
    ],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },

  // =========================================================================
  // 2. KRIDA PENYULUH WISATA (6 MATA KRIDA)
  // =========================================================================
  {
    id: 'skk-penyuluh-a',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: '(a)',
    title: 'Penyuluh Sadar Wisata',
    badge: 'SKK Penyuluh Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Penyuluhan nilai-nilai 7 Unsur Sapta Pesona (Aman, Tertib, Bersih, Sejuk, Indah, Ramah Tamah, Kenangan) kepada komunitas lokal dan pelaku usaha.',
    content: `## 1. Intisari Gerakan Sadar Wisata & Sapta Pesona
Sadar Wisata merupakan konsep yang menggambarkan kesadaran masyarakat untuk berperan aktif mewujudkan iklim kondusif bagi tumbuh kembangnya kepariwisataan di wilayahnya.

### 7 Unsur Sapta Pesona:
1. **Aman:** Lingkungan destinasi bebas dari tindak kriminalitas, pungutan liar, dan bahaya fisik.
2. **Tertib:** Pelayanan teratur, antrean disiplin, transparansi tarif harga.
3. **Bersih:** Pengelolaan sanitasi, ketersediaan tempat sampah terpilah, dan toilet higienis.
4. **Sejuk:** Penghijauan asri, pepohonan rindang, sirkulasi udara alami yang segar.
5. **Indah:** Penataan estetika visual tanpa polusi sampah visual atau spanduk liar.
6. **Ramah Tamah:** Senyum, sapa, salam, dan sikap hangat menjamu tamu dengan tulus.
7. **Kenangan:** Memberikan pengalaman emosional positif yang mendorong wisatawan untuk berkunjung kembali.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Filosofi & Nilai-Nilai 7 Unsur Sapta Pesona',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu menjelaskan indikator keberhasilan setiap unsur Sapta Pesona dalam kehidupan bermasyarakat.',
        method: 'Ceramah Interaktif & Diskusi Kelompok'
      },
      {
        sessionNumber: 2,
        title: 'Metodologi Penyuluhan Komunitas & Public Campaign',
        duration: '6 JP (270 Menit)',
        competency: 'Menyusun materi kampanye sadar wisata melalui media kreatif (poster, video reels, orasi desa).',
        method: 'Workshop Pembuatan Media'
      }
    ],
    testRequirements: {
      purwa: ['Mampu menjelaskan 7 unsur Sapta Pesona beserta contoh implementasinya di lingkungan gugus depan/sekolah.'],
      madya: ['Telah melaksanakan penyuluhan sadar wisata di hadapan minimal 20 warga desa wisata atau pedagang lokal.'],
      utama: ['Mampu membentuk dan membina Kelompok Sadar Wisata (Pokdarwis) di tingkat kelurahan/desa.']
    },
    competencyTable: [
      {
        code: 'PAR.PNY01.001.01',
        element: 'Menyampaikan Penyuluhan Sadar Wisata',
        indicator: 'Bahasa komunikatif, pesan Sapta Pesona tersampaikan lugas, audiens antusias.',
        assessment: 'Evaluasi Rekaman Video Penyuluhan'
      }
    ],
    images: [
      {
        id: 'img-py1',
        url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1000&auto=format&fit=crop&q=80',
        caption: 'Penyuluhan sadar wisata dan Sapta Pesona bersama masyarakat desa wisata binaan.'
      }
    ],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-penyuluh-b',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: '(b)',
    title: 'Penyuluh Ekowisata',
    badge: 'SKK Penyuluh Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Penyuluhan pariwisata berwawasan lingkungan, konservasi flora-fauna endemik, kalkulasi daya dukung lingkungan (carrying capacity), dan wisata rendah karbon.',
    content: `## 1. Definisi Ekowisata Berkelanjutan
Ekowisata adalah perjalanan bertanggung jawab ke daerah-daerah alami yang melestarikan lingkungan, menopang kesejahteraan masyarakat setempat, dan melibatkan interpretasi serta pendidikan.

### Prinsip Utama Ekowisata:
- Meminimalkan dampak fisik, sosial, perilaku, dan psikologis selama berkegiatan di alam.
- Membangun kesadaran lingkungan dan kultural.
- Memberikan manfaat finansial langsung bagi upaya konservasi hayati.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Prinsip Konservasi Alam & Daya Dukung Kawasan (Carrying Capacity)',
        duration: '4 JP (180 Menit)',
        competency: 'Menghitung batas jumlah pengunjung harian di zona rentan alam.',
        method: 'Analisis Data Kawasan'
      }
    ],
    testRequirements: {
      purwa: ['Mampu menyebutkan flora dan fauna endemik yang dilindungi di wilayah provinsinya.'],
      madya: ['Mampu menyusun rancangan jalur interpretasi ekowisata sepanjang minimal 1 km.'],
      utama: ['Mampu mengaudit implementasi prinsip ecotourism pada salah satu pengelola destinasi alam.']
    },
    competencyTable: [
      {
        code: 'PAR.EKO01.001.01',
        element: 'Melaksanakan Edukasi Ekowisata',
        indicator: 'Materi memuat edukasi konservasi hayati dan larangan perusakan ekosistem.',
        assessment: 'Uji Modul Edukasi'
      }
    ],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-penyuluh-c',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: '(c)',
    title: 'Penyuluh Wisata Tirta',
    badge: 'SKK Penyuluh Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Edukasi kelestarian perairan tawar dan laut, pencegahan pencemaran sampah plastik perairan, dan keselamatan wisata sungai, danau, serta bahari.',
    content: `## 1. Ruang Lingkup Wisata Tirta
Wisata tirta mencakup segala aktivitas rekreasi di perairan: arung jeram, selancar, pemancingan sportif, susur sungai, dan wisata danau. Penyuluh bertugas mengedukasi pengunjung dan operator agar menjaga kejernihan air serta keselamatan perahu.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Pengelolaan Daerah Aliran Sungai (DAS) & Sanitasi Perairan Wisata',
        duration: '4 JP (180 Menit)',
        competency: 'Mengidentifikasi sumber pencemaran air dan merancang gerakan bersih sungai.',
        method: 'Observasi Lapangan'
      }
    ],
    testRequirements: {
      purwa: ['Memahami aturan keselamatan pelampung (life jacket) pada kapal wisata tirta.'],
      madya: ['Memimpin aksi kampanye penolakan buang sampah di sungai destinasi wisata.'],
      utama: ['Menyusun dokumen SOP keselamatan wisata air terpadu untuk pengelola danau/sungai.']
    },
    competencyTable: [],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-penyuluh-d',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: '(d)',
    title: 'Penyuluh Wisata Minat Khusus',
    badge: 'SKK Penyuluh Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Penyuluhan dan pendampingan wisata bertema khusus: geowisata, penelusuran gua (caving), paralayang, wisata burung liar (bird watching), dan agrowisata.',
    content: `## 1. Karakteristik Wisata Minat Khusus
Wisata minat khusus menarik wisatawan yang mencari keahlian, hobi, atau tantangan intelektual dan fisik tertentu. Penyuluh harus menguasai regulasi keselamatan ketat dan pemahaman saintifik tentang objek yang disajikan.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Pemetaan Segmentasi Wisatawan Minat Khusus',
        duration: '4 JP (180 Menit)',
        competency: 'Menyusun profil pasar dan SOP keselamatan penjelajahan alam tematik.',
        method: 'Studi Kasus'
      }
    ],
    testRequirements: {
      purwa: ['Mampu menjelaskan minimal 2 jenis wisata minat khusus yang ada di daerahnya.'],
      madya: ['Menyusun materi panduan edukasi penjelajahan gua atau geowisata.'],
      utama: ['Menyelenggarakan kegiatan ekspedisi minat khusus tingkat kwarda/kwarnas.']
    },
    competencyTable: [],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-penyuluh-e',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: '(e)',
    title: 'Penyuluh Wisata Religi',
    badge: 'SKK Penyuluh Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Etika ziarah, penghormatan tempat ibadah bersejarah, tata krama busana, dan penguatan nilai toleransi antarumat beragama di destinasi sakral.',
    content: `## 1. Etika Berkunjung ke Destinasi Religi
Wisata religi bukan sekadar rekreasi mata, melainkan perjalanan spiritual dan kultural. Penyuluh memastikan wisatawan mematuhi:
- Adab berpakaian sopan dan melepaskan alas kaki pada zona yang disucikan.
- Tidak mengganggu kekhusyukan umat yang sedang beribadah.
- Memahami narasi sejarah para wali, ulama, tokoh pendiri spiritual bangsa dengan rasa hormat.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Adab Kunjungan Destinasi Bersejarah Religi Lintas Agama',
        duration: '4 JP (180 Menit)',
        competency: 'Menyusun buku panduan etika ziarah dan toleransi antarumat.',
        method: 'Diskusi & Kunjungan Lapangan'
      }
    ],
    testRequirements: {
      purwa: ['Mengetahui tata cara dan etika berkunjung ke tempat ibadah bersejarah di kotanya.'],
      madya: ['Mampu memandu rombongan ziarah budaya dengan narasi sejarah yang santun dan toleran.'],
      utama: ['Mampu menyusun kalender wisata religi tahunan terpadu untuk kwarda.']
    },
    competencyTable: [],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-penyuluh-f',
    kridaId: 'penyuluh',
    kridaName: 'Krida Penyuluh Wisata',
    code: '(f)',
    title: 'Penyuluh Manajemen Krisis Destinasi Wisata',
    badge: 'SKK Penyuluh Wisata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Kesiapsiagaan bencana alam, mitigasi risiko destinasi, komunikasi krisis publik, prosedur evakuasi darurat, dan pemulihan pasca-krisis pariwisata.',
    content: `## 1. Manajemen Krisis Pariwisata
Destinasi wisata rawan terhadap berbagai krisis: erupsi gunung api, gempa bumi, banjir bandang, kecelakaan transportasi, maupun epidemi kesehatan. Penyuluh berperan mengedukasi warga agar sigap, tanggap, dan tidak panik.

### 4 Fase Manajemen Krisis:
1. **Pencegahan & Mitigasi:** Pemasangan rambu jalur evakuasi, simulasi sirine, dan pemeriksaan kontur lereng.
2. **Kesiapsiagaan:** Membentuk tim tanggap darurat dan titik kumpul (*assembly point*).
3. **Respon Cepat:** Evakuasi korban, pendataan wisatawan, dan siaran pers terpusat anti-hoaks.
4. **Pemulihan (Recovery):** Kampanye citra positif untuk meyakinkan wisatawan bahwa destinasi telah aman kembali.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Penyusunan Rencana Kesiapsiagaan Bencana di Objek Wisata',
        duration: '6 JP (270 Menit)',
        competency: 'Mampu membuat peta zonasi bahaya dan jalur evakuasi objek wisata.',
        method: 'Workshop Pemetaan Mitigasi'
      }
    ],
    testRequirements: {
      purwa: ['Mampu mengenali rambu jalur evakuasi dan titik kumpul di objek wisata terdekat.'],
      madya: ['Mampu memimpin simulasi evakuasi darurat bagi pengelola desa wisata.'],
      utama: ['Menyusun dokumen Crisis Management Plan resmi bersama BPBD dan dinas pariwisata.']
    },
    competencyTable: [],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },

  // =========================================================================
  // 3. KRIDA KULINER DAN CINDERAMATA (5 MATA KRIDA)
  // =========================================================================
  {
    id: 'skk-kuliner-a',
    kridaId: 'kuliner',
    kridaName: 'Krida Kuliner dan Cinderamata',
    code: '(a)',
    title: 'Masakan Khas Lokal',
    badge: 'SKK Kuliner & Cinderamata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Pelestarian resep warisan kuliner tradisional, teknik memasak khas daerah, standar higienitas sanitasi dapur, dan filosofi gastronomi lokal.',
    content: `## 1. Gastronomi Warisan Nusantara
Kuliner Indonesia sarat akan rempah dan filosofi leluhur. Masakan khas bukan sekadar sajian pengisi perut, melainkan cerminan sejarah interaksi budaya, upacara adat, dan kearifan ekologi masyarakat setempat.

### Standar Higienitas & Pengolahan:
- Penerapan Good Manufacturing Practices (GMP) dan sistem jaminan halal.
- Menjaga orisinalitas bumbu lokal tanpa bahan pengawet sintesis berbahaya.
- Presentasi penyajian hidangan (*plating*) tradisional yang estetik dan menggugah selera.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Eksplorasi Rempah & Ragam Masakan Tradisional Nusantara',
        duration: '4 JP (180 Menit)',
        competency: 'Mengidentifikasi 15 jenis rempah utama dan teknik pengolahannya.',
        method: 'Praktik Dapur Rasa'
      },
      {
        sessionNumber: 2,
        title: 'Higiene Sanitasi Makanan & Uji Kelayakan Saji',
        duration: '4 JP (180 Menit)',
        competency: 'Menerapkan standar kebersihan alat masak dan penyimpanan bahan baku.',
        method: 'Uji Laboratorium Sederhana'
      }
    ],
    testRequirements: {
      purwa: ['Mampu memasak minimal 2 masakan khas daerahnya dengan bumbu rempah asli.'],
      madya: ['Mampu menyajikan hidangan lengkap khas daerah untuk jamuan kehormatan minimal 10 porsi.'],
      utama: ['Menulis buku panduan resep masakan tradisional langka beserta riwayat asal-usulnya.']
    },
    competencyTable: [
      {
        code: 'PAR.KUL01.001.01',
        element: 'Membuat Masakan Khas Tradisional',
        indicator: 'Rasa otentik, higienis, penyajian sesuai estetika budaya lokal.',
        assessment: 'Uji Cita Rasa & Kebersihan'
      }
    ],
    images: [
      {
        id: 'img-kl1',
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&auto=format&fit=crop&q=80',
        caption: 'Pengolahan dan penyajian masakan tradisional warisan kearifan lokal.'
      }
    ],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-kuliner-b',
    kridaId: 'kuliner',
    kridaName: 'Krida Kuliner dan Cinderamata',
    code: '(b)',
    title: 'Makanan/Minuman Ringan Khas Lokal',
    badge: 'SKK Kuliner & Cinderamata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Pembuatan jajanan pasar, penganan kering oleh-oleh, minuman rempah/herbal tradisional (jamu, wedang), dan ketahanan masa simpan alami.',
    content: `## 1. Potensi Industri Pangan Olahan Tradisional
Kue basah, keripik umbi lokal, dodol, dan minuman herbal tradisional memiliki pangsa pasar raksasa sebagai buah tangan wisata. Inovasi rasa dan kemasan higienis menjadi kunci daya saing global.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Formulasi & Pengolahan Minuman Herbal/Jamu Segar',
        duration: '4 JP (180 Menit)',
        competency: 'Mampu meracik minuman herbal tradisional dengan khasiat kesehatan terukur.',
        method: 'Praktik Peracikan'
      }
    ],
    testRequirements: {
      purwa: ['Mampu membuat 1 jenis penganan ringan khas daerah dan 1 jenis minuman rempah tradisional.'],
      madya: ['Mampu memproduksi snack kemasan oleh-oleh yang tahan minimal 1 bulan tanpa pengawet berbahaya.'],
      utama: ['Mendapatkan izin P-IRT dan sertifikasi halal untuk produk binaan Saka Pariwisata.']
    },
    competencyTable: [],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-kuliner-c',
    kridaId: 'kuliner',
    kridaName: 'Krida Kuliner dan Cinderamata',
    code: '(c)',
    title: 'Desain dan Kerajinan Cinderamata',
    badge: 'SKK Kuliner & Cinderamata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Kreativitas desain kriya, ukiran kayu, keramik gerabah, anyaman bambu/rotan, batik tulis, dan kerajinan ornamen bernilai seni tinggi.',
    content: `## 1. Seni Kriya Cinderamata
Cinderamata berkualitas tinggi adalah karya seni yang membawa kenangan abadi tentang destinasi. Unsur estetika, ergonomi, dan kekhasan motif daerah menjadi pembeda utama dari produk massal pabrikan.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Eksplorasi Motif Tradisional & Teknik Kriya Tangan',
        duration: '6 JP (270 Menit)',
        competency: 'Menciptakan purwarupa cinderamata dengan sentuhan motif ornamen lokal.',
        method: 'Workshop Kriya'
      }
    ],
    testRequirements: {
      purwa: ['Mampu membuat 1 produk kerajinan tangan sederhana berbahan dasar kayu, kain, atau serat alam.'],
      madya: ['Mampu mendesain dan menyelesaikan cinderamata fungsional (gantungan kunci, tas, ornamen meja).'],
      utama: ['Membina bengkel kriya pemuda dan menjual produk cinderamata ke toko oleh-oleh terakreditasi.']
    },
    competencyTable: [],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-kuliner-d',
    kridaId: 'kuliner',
    kridaName: 'Krida Kuliner dan Cinderamata',
    code: '(d)',
    title: 'Pemanfaatan Bahan Lokal untuk Produk Cinderamata',
    badge: 'SKK Kuliner & Cinderamata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Pemanfaatan limbah ramah lingkungan, serat daun nanas, pelepah pisang, batok kelapa, batu alam, dan bahan daur ulang menjadi produk berharga tinggi.',
    content: `## 1. Gerakan Ekonomi Sirkular & Green Souvenirs
Memanfaatkan material lokal yang terbarukan atau limbah organik (seperti batok kelapa, limbah gergaji kayu, eceng gondok) untuk mengurangi sampah destinasi sekaligus menghasilkan produk kriya bernilai jual tinggi.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Teknologi Pengolahan Serat Alami & Daur Ulang Ramah Lingkungan',
        duration: '4 JP (180 Menit)',
        competency: 'Mengolah limbah organik menjadi bahan siap rakit cinderamata.',
        method: 'Praktik Daur Ulang'
      }
    ],
    testRequirements: {
      purwa: ['Mampu mengolah bahan limbah lokal menjadi minimal 1 barang cinderamata yang layak pakai.'],
      madya: ['Menghasilkan 3 varian produk ramah lingkungan dari bahan alami terbarukan.'],
      utama: ['Memenangkan penghargaan kreasi kriya ramah lingkungan tingkat cabang/daerah.']
    },
    competencyTable: [],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-kuliner-e',
    kridaId: 'kuliner',
    kridaName: 'Krida Kuliner dan Cinderamata',
    code: '(e)',
    title: 'Pemasaran Produk Cinderamata',
    badge: 'SKK Kuliner & Cinderamata',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Strategi penentuan harga, branding kemasan (packaging), fotografi produk katalog, pemasaran digital di media sosial & marketplace, serta tata kelola display toko.',
    content: `## 1. Pemasaran Modern Produk Wisata
Sebagus apapun cinderamata dan kuliner, tanpa strategi pemasaran yang tepat produk tidak akan menjangkau pembeli. Anggota dilatih:
- Membuat desain kemasan ramah lingkungan (*eco-packaging*) yang menarik dan informatif.
- Menghitung harga pokok produksi (HPP) dan marjin keuntungan wajar.
- Membuka etalase digital melalui Google Bisnisku, media sosial, dan marketplace.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Branding, Kemasan & Digital Marketing UMKM Saka Pariwisata',
        duration: '6 JP (270 Menit)',
        competency: 'Mampu membuat logo, foto katalog produk profesional dengan smartphone, dan toko online.',
        method: 'Workshop Digital'
      }
    ],
    testRequirements: {
      purwa: ['Mampu membuat label kemasan produk yang memuat komposisi, tanggal kedaluwarsa, dan kontak produsen.'],
      madya: ['Berhasil memasarkan minimal 20 produk kuliner/kriya melalui kanal digital atau pameran Saka.'],
      utama: ['Mendirikan atau mengelola galeri koperasi cinderamata pangkalan Saka Pariwisata.']
    },
    competencyTable: [],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },

  // =========================================================================
  // 4. KRIDA MICE & EVENT WISATA (4 MATA KRIDA)
  // =========================================================================
  {
    id: 'skk-mice-a',
    kridaId: 'mice',
    kridaName: 'Krida MICE & Event Wisata',
    code: '(a)',
    title: 'Promosi MICE / Event Pariwisata',
    badge: 'SKK MICE & Event',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Strategi kampanye event pariwisata, pembuatan press release, media relations, kampanye konten viral media sosial, dan kemitraan sponsorship.',
    content: `## 1. Industri MICE & Event Kepariwisataan
MICE (Meeting, Incentive, Convention, Exhibition) adalah generator ekonomi pariwisata berbelanja tinggi. Promosi event yang sukses membutuhkan kombinasi narasi visual menarik, jangkauan media tepat sasaran, dan hubungan masyarakat yang solid.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Strategi Kampanye Media Terpadu Event Pariwisata',
        duration: '4 JP (180 Menit)',
        competency: 'Menyusun kalender konten publikasi dan proposal kemitraan media.',
        method: 'Studi Kasus'
      }
    ],
    testRequirements: {
      purwa: ['Mampu menulis siaran pers (press release) kegiatan kepramukaan/event pariwisata yang memenuhi kaidah 5W+1H.'],
      madya: ['Mengelola akun media sosial event resmi dengan kenaikan jangkauan audiens minimal 1.000 pemirsa.'],
      utama: ['Memimpin divisi publikasi pada festival pariwisata tingkat daerah/nasional.']
    },
    competencyTable: [],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-mice-b',
    kridaId: 'mice',
    kridaName: 'Krida MICE & Event Wisata',
    code: '(b)',
    title: 'Fotografi, Videografi / Drone MICE / Event Pariwisata',
    badge: 'SKK MICE & Event',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Komposisi visual dokumentasi acara, teknik pencahayaan indoor-outdoor, live streaming event, piloting drone udara legal dan aman, serta editing video sinematik.',
    content: `## 1. Dokumentasi Visual Profesional Event Wisata
Momen event pariwisata terjadi sekali dan tidak dapat diulang. Fotografer dan videografer Saka Pariwisata harus menguasai:
- Kecepatan tanggap (*quick reflex*) menangkap ekspresi panggung dan interaksi peserta.
- Pilot drone bersertifikat dengan mematuhi regulasi ruang udara aman (KKOP).
- Color grading dan editing video vertikal cepat untuk kebutuhan siaran pers harian.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Teknik Pencahayaan & Komposisi Foto Momen Event',
        duration: '4 JP (180 Menit)',
        competency: 'Menghasilkan foto tajam dalam kondisi minim cahaya panggung konser/seminar.',
        method: 'Praktik Kamera'
      },
      {
        sessionNumber: 2,
        title: 'Pengoperasian Drone Udara Aman & Etika Rekam Udara',
        duration: '6 JP (270 Menit)',
        competency: 'Menguasai manuver dasar drone dan prosedur keselamatan baterai.',
        method: 'Praktik Terbang Lapangan Terbuka'
      }
    ],
    testRequirements: {
      purwa: ['Mampu menghasilkan 10 foto jurnalistik event berkualitas tinggi dengan pencahayaan dan framing rapi.'],
      madya: ['Mampu membuat video recap aftermovie 60 detik dengan narasi audio dan grading sinematik.'],
      utama: ['Memiliki izin terbang drone dan memimpin tim produksi multimedia panggung konvensi.']
    },
    competencyTable: [],
    images: [
      {
        id: 'img-mc1',
        url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1000&auto=format&fit=crop&q=80',
        caption: 'Dokumentasi fotografi dan videografi profesional panggung event MICE pariwisata.'
      }
    ],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-mice-c',
    kridaId: 'mice',
    kridaName: 'Krida MICE & Event Wisata',
    code: '(c)',
    title: 'Perencanaan MICE / Event Pariwisata',
    badge: 'SKK MICE & Event',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Penyusunan konsep tema acara, pembuatan rundown menit demi menit, floorplan tata letak panggung & booth expo, anggaran belanja (RAB), dan perizinan.',
    content: `## 1. Arsitektur Perencanaan Event
Perencanaan yang matang adalah separuh dari keberhasilan event. Tour & Event Planner menyusun proposal komprehensif yang mencakup:
- Tujuan acara (KPI jumlah pengunjung dan dampak ekonomi).
- Rancangan jadwal teknis gladi bersih hingga penutupan.
- Pengurusan izin keramaian kepolisian, asuransi pengunjung, dan koordinasi keamanan satgas.`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Penyusunan Dokumen Proposal & Anggaran Biaya (RAB) Event',
        duration: '6 JP (270 Menit)',
        competency: 'Menyusun proposal event sponsorship yang profesional dan layak tawar.',
        method: 'Workshop Penyusunan Proposal'
      }
    ],
    testRequirements: {
      purwa: ['Mampu membuat rundown acara terperinci untuk kegiatan perkemahan atau seminar ranting.'],
      madya: ['Mampu merancang proposal penawaran event MICE lengkap dengan tata letak stan expo.'],
      utama: ['Memimpin perancangan festival pariwisata tahunan dengan melibatkan puluhan mitra pengisi acara.']
    },
    competencyTable: [],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  },
  {
    id: 'skk-mice-d',
    kridaId: 'mice',
    kridaName: 'Krida MICE & Event Wisata',
    code: '(d)',
    title: 'Manajemen Pelaksanaan MICE / Event Pariwisata',
    badge: 'SKK MICE & Event',
    levelSKK: 'Purwa • Madya • Utama',
    description: 'Kecakapan stage manager, pengendalian arus kerumunan (crowd control), koordinasi sound system-lighting panggung, registrasi VIP/delegasi, dan pasca-event.',
    content: `## 1. Eksekusi Lapangan & Stage Management
Pada hari pelaksanaan (H-Day), disiplin panggung dan koordinasi nirkabel (HT) adalah kunci utama. Stage manager memastikan setiap pengisi acara siap di *holding room* 15 menit sebelum tampil, tata cahaya tepat, dan keselamatan pengunjung terjaga dari potensi insiden kerumunan terinjak (*crowd crush*).`,
    curriculum: [
      {
        sessionNumber: 1,
        title: 'Stage Management & Komunikasi Nirkabel Lapangan (Walkie-Talkie Protocol)',
        duration: '4 JP (180 Menit)',
        competency: 'Menguasai kode komunikasi radio HT dan manajemen waktu pergantian pengisi acara.',
        method: 'Simulasi Panggung Langsung'
      }
    ],
    testRequirements: {
      purwa: ['Mampu bertugas sebagai liaison officer (LO) atau petugas registrasi tamu VIP dengan cekatan.'],
      madya: ['Mampu bertindak sebagai Stage Manager atau Floor Coordinator pada event skala 500+ pengunjung.'],
      utama: ['Mampu menjadi Project Director event festival kepemudaan atau pameran kepariwisataan nasional.']
    },
    competencyTable: [],
    images: [],
    links: [],
    downloads: [],
    updatedAt: '2026-09-02T10:00:00.000Z',
    updatedBy: 'Pimpinan Saka Pariwisata Nasional'
  }
];
