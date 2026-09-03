// ============================================================================
// BUKU PANDUAN KRIDA DAN SYARAT KECAKAPAN KHUSUS SAKA PARIWISATA 2026
// Tim Penyusun: Rohadi Wijaya | Asrul Roza | H. Agus Sulaiman, SE.
// Standar Nasional: Satu Standar Nasional, Dapat Diterapkan Secara Kontekstual di Daerah
// ============================================================================

import { KridaModuleItem } from '../types';

export interface HandbookMetadata {
  title: string;
  edition: string;
  year: number;
  authors: string[];
  motto: string;
  corePrinciple: string;
  description: string;
  totalKrida: number;
  totalSKK: number;
}

export const HANDBOOK_METADATA_2026: HandbookMetadata = {
  title: 'Buku Panduan Krida dan Syarat Kecakapan Khusus Saka Pariwisata 2026',
  edition: 'Edisi Standar Nasional 2026',
  year: 2026,
  authors: ['Rohadi Wijaya', 'Asrul Roza', 'H. Agus Sulaiman, SE.'],
  motto: 'Belajar – Berlatih – Berkarya – Mengabdi',
  corePrinciple: 'Satu Standar Nasional, Dapat Diterapkan Secara Kontekstual di Daerah',
  description: 'Pedoman resmi penyelenggaraan pembelajaran, pelatihan, dan pengujian Syarat Kecakapan Khusus (SKK) untuk 4 Krida dan 23 Mata Kecakapan Saka Pariwisata.',
  totalKrida: 4,
  totalSKK: 23
};

export const OFFICIAL_AGE_TIERS = {
  purwa: {
    tier: 'Purwa',
    ageRange: '7–15 tahun',
    levelClassification: 'DASAR',
    badgeShape: 'Segitiga (Pita Merah)',
    learningStages: 'Mengenal → Memahami → Berlatih → Mempraktikkan',
    focus: 'Penguasaan konsep pokok, aturan dasar keselamatan, dan simulasi keterampilan sederhana di bawah bimbingan pembina.'
  },
  madya: {
    tier: 'Madya',
    ageRange: '15–20 tahun',
    levelClassification: 'PENERAPAN',
    badgeShape: 'Persegi (Pita Merah)',
    learningStages: 'Memahami → Berlatih → Mempraktikkan → Menghasilkan → Mengevaluasi',
    focus: 'Penerapan mandiri keterampilan krida, menghasilkan karya/produk nyata, dan memecahkan kendala lapangan terstruktur.'
  },
  utama: {
    tier: 'Utama',
    ageRange: '21–25 tahun',
    levelClassification: 'PENGEMBANGAN',
    badgeShape: 'Segilima (Pita Merah)',
    learningStages: 'Memahami → Mempraktikkan → Menghasilkan → Mengelola → Mengevaluasi → Mengembangkan',
    focus: 'Kepemimpinan teknis, inovasi program, pendampingan anggota pemula (asisten instruktur), dan kemitraan pariwisata.'
  }
};

export const ASSESSMENT_SYSTEM_2026 = {
  weights: {
    knowledge: 20, // Pengetahuan 20%
    skill: 40,     // Keterampilan 40%
    attitude: 20,  // Sikap Kerja 20%
    product: 20    // Produk/Praktik 20%
  },
  passingGrade: 80, // Nilai Akhir >= 80 = MEMENUHI
  formula: 'Nilai Akhir = (Pengetahuan × 20%) + (Keterampilan × 40%) + (Sikap Kerja × 20%) + (Produk/Praktik × 20%)',
  predicates: [
    { range: '90 – 100', grade: 'Sangat Baik', status: 'MEMENUHI (Lulus Amat Memuaskan)' },
    { range: '80 – 89', grade: 'Baik', status: 'MEMENUHI (Lulus Memenuhi Standar)' },
    { range: '70 – 79', grade: 'Cukup', status: 'BELUM MEMENUHI (Remedial Keterampilan/Produk)' },
    { range: '60 – 69', grade: 'Kurang', status: 'BELUM MEMENUHI (Pendalaman Materi Ulang)' },
    { range: '0 – 59', grade: 'Belum Memenuhi', status: 'BELUM MEMENUHI (Wajib Pelatihan Ulang)' }
  ],
  portfolioEvidence: [
    'Bukti Produk (karya nyata: leaflet, naskah narasi, fact sheet, media promosi, cinderamata, kuliner)',
    'Bukti Hasil Praktik Lapangan (rekaman/lembar observasi simulasi peran)',
    'Bukti Foto Dokumentasi Pelaksanaan Kegiatan',
    'Bukti Video Praktik Lapangan / Demonstrasi Keterampilan',
    'Bukti Laporan Tertulis Pelaksanaan Tugas Krida',
    'Bukti Sertifikat / Surat Keterangan Penugasan',
    'Lembar Hasil Uji Terstandar yang Divalidasi Penguji',
    'Catatan Evaluasi & Rekomendasi Instruktur Penguji'
  ],
  accreditationNote: 'SKK Saka Pariwisata merupakan standar kecakapan pendidikan kepramukaan yang mengadopsi standar kompetensi kerja nasional (SKKNI), bukan sertifikasi kompetensi profesi langsung.'
};

export const OFFICIAL_SKKNI_REFERENCES: { [key: string]: string } = {
  'PM-01': 'Standar Kompetensi Pemanduan & Pengelolaan Informasi Destinasi Wisata',
  'PM-02': 'Kepmenaker Nomor 221 Tahun 2023 tentang Pemimpin Perjalanan Wisata',
  'PM-03': 'Standar Kompetensi Pemanduan Perjalanan Wisata Nusantara',
  'PM-04': 'Kepmenaker Nomor 221 Tahun 2023 tentang Pemimpin Perjalanan Wisata',
  'PM-05': 'Kepmenaker Nomor 18 Tahun 2024 tentang Pemanduan Wisata Selam',
  'PM-06': 'Kepmenaker Nomor 74 Tahun 2024 tentang Pemanduan Wisata Gunung',
  'PM-07': 'Kepmenaker Nomor 119 Tahun 2024 tentang Pemanduan Outbond / Experiential Learning',
  'PM-08': 'Kepmenaker Nomor 266 Tahun 2023 tentang Pemanduan Keselamatan Wisata Tirta (Lifeguard)',
  'PY-01': 'Pedoman Nasional Sadar Wisata & 7 Unsur Sapta Pesona Kemenparekraf RI',
  'PY-02': 'Kepmenaker Nomor 234 Tahun 2023 tentang Ekowisata',
  'PY-03': 'Kepmenaker Nomor 266/2023, 18/2024, dan 87/2024 tentang Wisata Tirta Berkelanjutan',
  'PY-04': 'Kepmenaker Nomor 234/2023, 74/2024, 18/2024, 87/2024, 266/2023 tentang Wisata Minat Khusus',
  'PY-05': 'Pedoman Etika, Perlindungan Cagar Budaya & Wisata Religi Nusantara',
  'PY-06': 'Kepmenaker Nomor 266 Tahun 2023 & Pedoman Kesiapsiagaan Krisis Bencana Destinasi',
  'ME-01': 'Kepmenaker Nomor 123 Tahun 2024 (MICE) & Nomor 120 Tahun 2024 (Event Pariwisata)',
  'ME-02': 'Kepmenaker Nomor 123/2024, 120/2024 & Regulasi Keselamatan Ruang Udara Drone',
  'ME-03': 'Kepmenaker Nomor 120 Tahun 2024 (Event) & Nomor 123 Tahun 2024 (MICE)',
  'ME-04': 'Kepmenaker Nomor 120 Tahun 2024 (Event) & Nomor 123 Tahun 2024 (MICE)',
  'KC-01': 'Kepmenaker Nomor 107 Tahun 2024 tentang Jasa Boga / Gastronomi Lokal',
  'KC-02': 'Kepmenaker Nomor 107/2024 (Jasa Boga) & Nomor 16/2024 (Rumah Minum/Kafe)',
  'KC-03': 'Standar Kompetensi Nasional Bidang Kriya & Desain Produk Kreatif Ekraf',
  'KC-04': 'Prinsip Kriya Berkelanjutan, Zero Waste, & Pemanfaatan Bahan Lokal Ramah Lingkungan',
  'KC-05': 'Kepmenaker Nomor 80 Tahun 2024 tentang Jasa Konsultansi Pemasaran Pariwisata'
};
