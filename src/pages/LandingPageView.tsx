import React, { useState, useMemo } from 'react';
import {
  Compass, Users, ShoppingBag, MapPin, Sparkles, ArrowRight,
  ShieldCheck, Award, UtensilsCrossed, Calendar, ChevronRight,
  Search, Heart, ExternalLink, Star, Tag, CheckCircle2,
  PhoneCall, Eye, Layers, BookOpen, Coffee, Landmark
} from 'lucide-react';
import { CurrentUser, KridaType } from '../../types';

interface LandingPageProps {
  onOpenAuth: (tab?: 'login' | 'register') => void;
  currentUser?: CurrentUser;
  onNavigateKrida?: (krida: KridaType) => void;
  onNavigateStore?: () => void;
}

interface MemberUploadItem {
  id: string;
  title: string;
  category: 'WISATA' | 'KULINER' | 'CINDERAMATA';
  province: string;
  regency: string;
  price: string;
  imageUrl: string;
  uploadedBy: {
    name: string;
    avatar: string;
    krida: KridaType;
    verified: boolean;
  };
  likes: number;
  rating: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  currentUser,
  onNavigateKrida,
  onNavigateStore,
}) => {
  const [galleryFilter, setGalleryFilter] = useState<'ALL' | 'WISATA' | 'KULINER' | 'CINDERAMATA'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // -------------------------------------------------------------
  // DATA DUMMY MEMBER UPLOADS (Seluruh Nusantara)
  // -------------------------------------------------------------
  const memberUploads: MemberUploadItem[] = useMemo(() => [
    {
      id: 'MW-01',
      title: 'Eksplorasi Geopark Ciletuh & Pesisir Pelabuhanratu',
      category: 'WISATA',
      province: 'Jawa Barat',
      regency: 'Kab. Sukabumi',
      price: 'Rp 450.000 / pax',
      imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      uploadedBy: {
        name: 'Ahmad Fauzi',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        krida: 'Krida Pemandu',
        verified: true,
      },
      likes: 124,
      rating: 4.9,
    },
    {
      id: 'MK-01',
      title: 'Kopi Robusta Puntang & Camilan Sale Pisang Tradisional',
      category: 'KULINER',
      province: 'Jawa Barat',
      regency: 'Kab. Bandung',
      price: 'Rp 55.000',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      uploadedBy: {
        name: 'Siti Rahmawati',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
        krida: 'Krida Kuliner & Cinderamata',
        verified: true,
      },
      likes: 98,
      rating: 4.8,
    },
    {
      id: 'MC-01',
      title: 'Kerajinan Anyaman Bambu Motif Pandu Khas Priangan',
      category: 'CINDERAMATA',
      province: 'Jawa Barat',
      regency: 'Kab. Tasikmalaya',
      price: 'Rp 85.000',
      imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
      uploadedBy: {
        name: 'Rian Pratama',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
        krida: 'Krida Kuliner & Cinderamata',
        verified: true,
      },
      likes: 76,
      rating: 4.7,
    },
    {
      id: 'MW-02',
      title: 'Susur Jalur Edukasi Mangrove & Sejarah Maritim',
      category: 'WISATA',
      province: 'Jawa Tengah',
      regency: 'Kab. Cilacap',
      price: 'Rp 280.000 / pax',
      imageUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80',
      uploadedBy: {
        name: 'Budi Santoso',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        krida: 'Krida Penyuluh',
        verified: true,
      },
      likes: 142,
      rating: 4.9,
    },
    {
      id: 'MK-02',
      title: 'Paket Kuliner Ingkung Tradisional Desa Wisata',
      category: 'KULINER',
      province: 'D.I. Yogyakarta',
      regency: 'Kab. Bantul',
      price: 'Rp 140.000 / porsi',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
      uploadedBy: {
        name: 'Dewi Lestari',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
        krida: 'Krida Kuliner & Cinderamata',
        verified: true,
      },
      likes: 215,
      rating: 5.0,
    },
    {
      id: 'MC-02',
      title: 'Kain Tenun Lurik Pewarna Alam Ramah Lingkungan',
      category: 'CINDERAMATA',
      province: 'Jawa Tengah',
      regency: 'Kab. Klaten',
      price: 'Rp 220.000',
      imageUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&auto=format&fit=crop&q=80',
      uploadedBy: {
        name: 'Hendra Gunawan',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
        krida: 'Krida Mice & Event',
        verified: true,
      },
      likes: 189,
      rating: 4.9,
    },
  ], []);

  const filteredGallery = useMemo(() => {
    return memberUploads.filter(item => {
      const matchCat = galleryFilter === 'ALL' || item.category === galleryFilter;
      const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.regency.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.uploadedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [memberUploads, galleryFilter, searchQuery]);

  return (
    <div className="w-full bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white overflow-hidden">

      {/* =========================================================
          1. HERO SECTION DINAMIS DENGAN OVERLAY
      ========================================================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4 md:px-8">
        {/* Background Image & Multi-layer Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-gatara-borobudur.png"
            alt="Saka Pariwisata Nasional"
            className="w-full h-full object-cover object-center opacity-40 scale-105 transform animate-pulse duration-10000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-blue-950/60" />
          <div className="absolute inset-0 bg-radial-at-c from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs md:text-sm font-semibold shadow-lg backdrop-blur-md animate-bounce duration-3000">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Sistem Informasi & Data Terpadu Saka Pariwisata Nasional</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white max-w-4xl mx-auto">
            Kader Pandu Unggul, <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              Pesona Wisata Nusantara
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Platform resmi Gerakan Pramuka Satuan Karya Pariwisata dalam pendataan anggota,
            pengembangan keahlian 4 Krida, dan promosi potensi wisata lokal se-Indonesia.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {!currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm md:text-base shadow-xl shadow-emerald-900/30 hover:shadow-emerald-700/50 hover:scale-105 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
                >
                  <span>Daftar Jadi Kader Baru</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 font-bold text-sm md:text-base backdrop-blur-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Masuk ke Akun Saya</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 px-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <span className="font-semibold">Selamat Datang, Kak {currentUser.name || currentUser.username}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================
          2. STATISTIK ANGGOTA & WILAYAH TERINTEGRASI
      ========================================================= */}
      <section className="relative z-20 -mt-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Anggota Terdaftar', value: '12.450+', desc: 'Kader Pramuka Aktif', icon: Users, color: 'from-blue-600 to-cyan-600' },
            { label: 'Kwarda & Kwarcab', value: '38 Prov', desc: 'Wilayah Terkoneksi', icon: MapPin, color: 'from-emerald-600 to-teal-600' },
            { label: 'Produk & Potensi', value: '3.800+', desc: 'Paket & Cinderamata', icon: Tag, color: 'from-amber-600 to-orange-600' },
            { label: 'Pelatihan & Uji Krida', value: '150+', desc: 'Giat Rutin Nasional', icon: Award, color: 'from-purple-600 to-indigo-600' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-5 md:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col items-start justify-between hover:border-slate-700 hover:translate-y-[-2px] transition-all"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-4 shadow-md`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-xs md:text-sm font-bold text-slate-200 mt-0.5">{stat.label}</p>
                <p className="text-[11px] text-slate-400 font-medium">{stat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          3. CARD 4 PILAR KRIDA SAKA PARIWISATA
      ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>Spesialisasi Kompetensi</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Empat Krida Saka Pariwisata
          </h2>
          <p className="text-sm md:text-base text-slate-400">
            Pusat pendidikan vokasi kepanduan untuk mengasah keterampilan teknis di bidang kepariwisataan nasional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Krida Pemandu Wisata',
              type: 'Krida Pemandu' as KridaType,
              icon: Landmark,
              badge: 'SKK Pemandu',
              desc: 'Keahlian interpretasi cagar budaya, pemanduan destinasi, pertolongan pertama, dan tata bahasa ramah pramuka.',
              color: 'border-blue-500/30 hover:border-blue-500 bg-blue-950/20 text-blue-400',
              accent: 'bg-blue-500',
            },
            {
              name: 'Krida Penyuluh Wisata',
              type: 'Krida Penyuluh' as KridaType,
              icon: BookOpen,
              badge: 'SKK Sapta Pesona',
              desc: 'Sosialisasi Sadar Wisata, Sapta Pesona, komunikasi masyarakat, dan edukasi konservasi lingkungan alam.',
              color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/20 text-emerald-400',
              accent: 'bg-emerald-500',
            },
            {
              name: 'Krida Kuliner & Cinderamata',
              type: 'Krida Kuliner & Cinderamata' as KridaType,
              icon: UtensilsCrossed,
              badge: 'SKK Tata Boga & Kriya',
              desc: 'Pengembangan kuliner tradisional khas daerah, standarisasi kemasan higienis, dan kriya cinderamata khas lokal.',
              color: 'border-amber-500/30 hover:border-amber-500 bg-amber-950/20 text-amber-400',
              accent: 'bg-amber-500',
            },
            {
              name: 'Krida MICE & Event',
              type: 'Krida Mice & Event' as KridaType,
              icon: Calendar,
              badge: 'SKK Manajemen Event',
              desc: 'Manajemen perkemahan akbar, pameran expo wisata, pengelolaan karnaval festival budaya, dan logistik pertemuan.',
              color: 'border-purple-500/30 hover:border-purple-500 bg-purple-950/20 text-purple-400',
              accent: 'bg-purple-500',
            },
          ].map((krida, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${krida.color} backdrop-blur-sm flex flex-col justify-between group hover:scale-[1.02] transition-all`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-inner">
                    <krida.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    {krida.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {krida.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {krida.desc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigateKrida && onNavigateKrida(krida.type)}
                className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white cursor-pointer"
              >
                <span>Pelajari Silabus</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          4. OFFICIAL STORE (MERCHANDISE RESMI SAKA PARIWISATA)
      ========================================================= */}
      <section className="bg-slate-900/50 border-y border-slate-800/80 py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Koperasi & Toko Atribut Resmi</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Official Merchandise Saka
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Lengkapi atribut resmi Pramuka Saka Pariwisata standar Kwartir Nasional.
              </p>
            </div>

            <button
              type="button"
              onClick={onNavigateStore}
              className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <span>Lihat Semua Katalog Toko</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                id: 'MERCH-01',
                title: 'Rompi Resmi Saka Pariwisata Bordir Timbul',
                price: 'Rp 185.000',
                stock: 'Tersedia',
                image: '/images/merchandise/Pose-4-1759933670813-3.png',
                category: 'Pakaian Lapangan',
              },
              {
                id: 'MERCH-02',
                title: 'Scarf & Hasduk Bordir Khas Saka Pariwisata',
                price: 'Rp 45.000',
                stock: 'Tersedia',
                image: 'https://images.unsplash.com/photo-1607344645866-009c320b5ab8?w=500&auto=format&fit=crop&q=80',
                category: 'Atribut Wajib',
              },
              {
                id: 'MERCH-03',
                title: 'Topi Rimba Lapangan Pandu Adventure',
                price: 'Rp 60.000',
                stock: 'Tersedia',
                image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&auto=format&fit=crop&q=80',
                category: 'Perlengkapan',
              },
              {
                id: 'MERCH-04',
                title: 'Lencana Logam Krida Kuningan Cor Emas',
                price: 'Rp 35.000',
                stock: 'Tersedia',
                image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
                category: 'Tanda Jabatan',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    {item.category}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-sm text-white line-clamp-2 group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-base font-black text-emerald-400">{item.price}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.stock}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateStore}
                    className="w-full mt-3 py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Pesan Produk</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          5. GALERI POTENSI WISATA, KULINER & CINDERAMATA MEMBER
      ========================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>Karya & Kontribusi Anggota</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Galeri Wisata, Kuliner & Cinderamata
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Etalase promosi potensi lokal yang diunggah langsung oleh anggota Saka Pariwisata se-Nusantara.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari daerah, kuliner, wisata..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { key: 'ALL', label: 'Semua Kategori' },
            { key: 'WISATA', label: 'Paket & Daya Tarik Wisata' },
            { key: 'KULINER', label: 'Kuliner Khas Daerah' },
            { key: 'CINDERAMATA', label: 'Kriya & Cinderamata' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setGalleryFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                galleryFilter === tab.key
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid Galeri */}
        {filteredGallery.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
            <Compass className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-400">Tidak ada item yang sesuai pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 hover:scale-[1.01] transition-all flex flex-col justify-between group"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
                    {item.category}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-bold text-amber-300 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    <span>{item.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.regency}, {item.province}</span>
                    </div>
                    <h3 className="font-bold text-base text-white line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    {/* Member Uploader */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.uploadedBy.avatar}
                          alt={item.uploadedBy.name}
                          className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-200 flex items-center gap-1">
                            <span>{item.uploadedBy.name}</span>
                            {item.uploadedBy.verified && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 fill-emerald-400/20" />
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">{item.uploadedBy.krida}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-400">{item.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* =========================================================
          FOOTER PROMOSI CALL TO ACTION
      ========================================================= */}
      <section className="bg-gradient-to-b from-slate-900 to-blue-950 py-16 px-4 text-center space-y-6">
        <h3 className="text-2xl md:text-3xl font-black text-white">
          Punya Usaha Desa Wisata, Kuliner, atau Kriya?
        </h3>
        <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto">
          Daftarkan diri Anda sebagai kader Pramuka Saka Pariwisata dan unggah potensi wisata daerah Anda ke portal nasional kami.
        </p>
        <button
          type="button"
          onClick={() => onOpenAuth(currentUser ? undefined : 'register')}
          className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-xl shadow-emerald-950/40 transition-all cursor-pointer"
        >
          {currentUser ? 'Kelola Konten di Dashboard' : 'Gabung & Pasang Produk Sekarang'}
        </button>
      </section>

    </div>
  );
};
