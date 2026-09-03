import React, { useState, useMemo } from 'react';
import { 
  Utensils, 
  Gift, 
  MapPin, 
  Heart, 
  Plus, 
  Search, 
  Sparkles, 
  ArrowRight, 
  Store, 
  Phone, 
  ChevronRight, 
  Filter, 
  CheckCircle2, 
  Compass, 
  Camera, 
  Tent, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  ThumbsUp,
  User,
  SlidersHorizontal,
  Check,
  X,
  Edit3,
  Trash2
} from 'lucide-react';
import { CulinarySouvenirItem, CurrentUser, KridaType, ProductModerationStatus } from '../../types';
import { storage } from '../../services/storage';

interface CulinarySouvenirGallerySectionProps {
  items: CulinarySouvenirItem[];
  currentUser: CurrentUser;
  onOpenFormModal: (itemToEdit?: CulinarySouvenirItem) => void;
  onSelectItemDetail: (item: CulinarySouvenirItem) => void;
}

export const CulinarySouvenirGallerySection: React.FC<CulinarySouvenirGallerySectionProps> = ({
  items,
  currentUser,
  onOpenFormModal,
  onSelectItemDetail
}) => {
  // Tabs: 'PUBLISHED' | 'PENDING' | 'MY_ITEMS'
  const [activeTab, setActiveTab] = useState<'PUBLISHED' | 'PENDING' | 'MY_ITEMS'>('PUBLISHED');
  
  // Krida Filter: 'ALL' | KridaType
  const [selectedKrida, setSelectedKrida] = useState<'ALL' | KridaType>('ALL');
  
  // Search & Territory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');

  // Likes local state tracking
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});

  const isOperator = [
    'SUPER_ADMIN', 
    'ADMIN_PROVINCE', 
    'ADMIN_REGENCY', 
    'ADMIN_BRANCH'
  ].includes(currentUser.role);

  const isMember = currentUser.role === 'MEMBER';

  const handleQuickLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!likedIds[id]) {
      storage.likeCulinarySouvenir(id);
      setLikedIds(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleQuickApprove = (e: React.MouseEvent, item: CulinarySouvenirItem) => {
    e.stopPropagation();
    if (confirm(`Setujui dan terbitkan "${item.name}" ke Galeri Nasional?`)) {
      storage.approveCulinarySouvenir(item.id, currentUser);
    }
  };

  const handleQuickReject = (e: React.MouseEvent, item: CulinarySouvenirItem) => {
    e.stopPropagation();
    const reason = prompt(`Alasan penolakan / catatan revisi untuk "${item.name}":`, 'Mohon lengkapi rincian deskripsi produk.');
    if (reason && reason.trim()) {
      storage.rejectCulinarySouvenir(item.id, reason.trim(), currentUser);
    }
  };

  // Extract unique provinces
  const provinces = useMemo(() => {
    return Array.from(new Set(items.map(i => i.provinceName).filter(Boolean)));
  }, [items]);

  // Counts
  const publishedCount = useMemo(() => items.filter(i => (i.status || 'APPROVED') === 'APPROVED').length, [items]);
  const pendingCount = useMemo(() => items.filter(i => i.status === 'PENDING_APPROVAL').length, [items]);
  const myItemsCount = useMemo(() => {
    return items.filter(i => 
      i.authorMemberId === currentUser.memberId || 
      i.authorMemberId === currentUser.id || 
      i.authorName === currentUser.name
    ).length;
  }, [items, currentUser]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const itemStatus: ProductModerationStatus = item.status || 'APPROVED';

      // Tab filter
      if (activeTab === 'PUBLISHED') {
        if (itemStatus !== 'APPROVED') return false;
      } else if (activeTab === 'PENDING') {
        if (itemStatus !== 'PENDING_APPROVAL') return false;
      } else if (activeTab === 'MY_ITEMS') {
        const isMine = 
          item.authorMemberId === currentUser.memberId || 
          item.authorMemberId === currentUser.id || 
          item.authorName === currentUser.name;
        if (!isMine) return false;
      }

      // Krida filter
      if (selectedKrida !== 'ALL' && item.krida !== selectedKrida) {
        return false;
      }

      // Province filter
      if (selectedProvince !== 'ALL' && item.provinceName !== selectedProvince) {
        return false;
      }

      // Search query
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchName = item.name.toLowerCase().includes(q);
        const matchDist = item.districtName?.toLowerCase().includes(q);
        const matchReg = item.regencyName?.toLowerCase().includes(q);
        const matchProv = item.provinceName?.toLowerCase().includes(q);
        const matchCat = item.categoryLabel?.toLowerCase().includes(q);
        const matchAuthor = item.authorName?.toLowerCase().includes(q);
        const matchUmkm = item.umkmName?.toLowerCase().includes(q);
        const matchTags = item.tags?.some(t => t.toLowerCase().includes(q));

        if (!matchName && !matchDist && !matchReg && !matchProv && !matchCat && !matchAuthor && !matchUmkm && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTab, selectedKrida, selectedProvince, searchQuery, currentUser]);

  const getKridaIcon = (krida?: KridaType) => {
    switch (krida) {
      case 'Krida Pemandu': return Compass;
      case 'Krida Penyuluh': return Camera;
      case 'Krida Mice & Event': return Tent;
      default: return Utensils;
    }
  };

  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden space-y-4 sm:space-y-6">
      {/* Decorative Gradient Background Highlights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-teal-600/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Showcase Section */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-5">
        <div className="space-y-1 sm:space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 bg-purple-50 border border-purple-200 rounded-full text-purple-900 text-[11px] sm:text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Etalase Karya & Produk 4 Krida Nusantara</span>
          </div>

          <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight">
            Galeri Produk & Jasa 4 Krida Saka Pariwisata
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Himpunan produk kriya, kuliner khas, jasa pemanduan, dokumentasi wisata, dan paket atraksi perkemahan yang diinput mandiri oleh anggota Saka di tingkat <strong className="text-purple-900 font-bold">Kwartir Ranting</strong> dan telah melalui persetujuan operator wilayah.
          </p>
        </div>

        {/* Action Button: Unggah Produk Anggota */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onOpenFormModal()}
            className="w-full sm:w-auto px-4 sm:px-5 py-3 bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/20 active:scale-95 transition-all cursor-pointer group min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-amber-300 group-hover:rotate-90 transition-transform duration-200" />
            <span>+ Input Produk / Jasa Anggota</span>
          </button>
        </div>
      </div>

      {/* Main Workflow View Selector: Etalase Publik vs Menunggu Persetujuan Operator vs Karya Saya */}
      <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          
          {/* Tab 1: Etalase Publik */}
          <button
            onClick={() => setActiveTab('PUBLISHED')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'PUBLISHED'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${activeTab === 'PUBLISHED' ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Galeri Terbit</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-200 text-slate-600'
            }`}>
              {publishedCount}
            </span>
          </button>

          {/* Tab 2: Menunggu Persetujuan Operator */}
          {isOperator && (
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'PENDING'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                  : 'text-amber-900 hover:bg-amber-100/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Antrean Operator</span>
              {pendingCount > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === 'PENDING' ? 'bg-slate-950 text-amber-300' : 'bg-amber-200 text-amber-900'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Tab 3: Karya Saya */}
          <button
            onClick={() => setActiveTab('MY_ITEMS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'MY_ITEMS'
                ? 'bg-purple-700 text-white shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Karya Saya</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'MY_ITEMS' ? 'bg-purple-950 text-purple-200' : 'bg-slate-200 text-slate-600'
            }`}>
              {myItemsCount}
            </span>
          </button>
        </div>

        {/* Informative Label for Current Tab */}
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          {activeTab === 'PUBLISHED' && (
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Menampilkan produk yang telah disetujui & aktif untuk publik
            </span>
          )}
          {activeTab === 'PENDING' && (
            <span className="flex items-center gap-1 text-amber-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Mode Operator: Verifikasi dan setujui produk dari anggota di wilayah Anda
            </span>
          )}
          {activeTab === 'MY_ITEMS' && (
            <span className="flex items-center gap-1 text-purple-800 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Daftar seluruh karya yang diajukan oleh akun Anda
            </span>
          )}
        </div>
      </div>

      {/* Krida Categories & Search Filters */}
      <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Krida Filter Pills (Naturally Wrapped - Zero Horizontal Scroll) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedKrida('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedKrida === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Semua 4 Krida</span>
          </button>

          {[
            { id: 'Krida Pemandu' as KridaType, label: 'Pemandu Wisata', icon: Compass, activeClass: 'bg-teal-600 text-white' },
            { id: 'Krida Penyuluh' as KridaType, label: 'Penyuluh Wisata', icon: Camera, activeClass: 'bg-indigo-600 text-white' },
            { id: 'Krida Mice & Event' as KridaType, label: 'MICE & Atraksi', icon: Tent, activeClass: 'bg-emerald-600 text-white' },
            { id: 'Krida Kuliner & Cinderamata' as KridaType, label: 'Kuliner & Cinderamata', icon: Utensils, activeClass: 'bg-amber-600 text-white' },
          ].map(k => {
            const Icon = k.icon;
            const isSel = selectedKrida === k.id;
            return (
              <button
                key={k.id}
                onClick={() => setSelectedKrida(k.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSel ? `${k.activeClass} shadow-xs` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{k.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Province Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 lg:max-w-md">
          {/* Province Filter Dropdown */}
          <div className="w-full sm:w-44 flex-shrink-0">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl sm:rounded-2xl text-xs text-slate-700 font-semibold outline-none focus:border-purple-600 cursor-pointer min-h-[40px]"
            >
              <option value="ALL">Semua Wilayah</option>
              {provinces.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3 py-2 focus-within:bg-white focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-500/20 min-h-[40px]">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk, jasa, NTA, Kwarran..."
              className="bg-transparent outline-none text-xs w-full text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of 4 Krida Product Cards */}
      {filteredItems.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-slate-50/80 border border-dashed border-slate-200 rounded-2xl sm:rounded-3xl space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-slate-800">
              {activeTab === 'PENDING'
                ? 'Tidak Ada Antrean Persetujuan'
                : activeTab === 'MY_ITEMS'
                ? 'Anda Belum Memasukkan Karya'
                : 'Belum Ada Produk yang Sesuai Filter'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {activeTab === 'PENDING'
                ? 'Semua pengajuan produk anggota dari wilayah Anda telah selesai diverifikasi.'
                : activeTab === 'MY_ITEMS'
                ? 'Gunakan tombol "+ Input Produk / Jasa Anggota" untuk mempromosikan karya Anda ke pengunjung web.'
                : 'Coba ubah kata kunci pencarian, filter Krida, atau pilih opsi wilayah lain.'}
            </p>
          </div>
          <button
            onClick={() => onOpenFormModal()}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Input Produk Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 relative z-10">
          {filteredItems.map((item) => {
            const isLiked = likedIds[item.id];
            const KridaCardIcon = getKridaIcon(item.krida);
            const isPending = item.status === 'PENDING_APPROVAL';
            const isRejected = item.status === 'REJECTED';
            const isMine = currentUser.role === 'MEMBER' && (item.authorId === currentUser.memberId || item.authorId === currentUser.id);

            return (
              <div
                key={item.id}
                onClick={() => onSelectItemDetail(item)}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col group cursor-pointer hover:shadow-lg ${
                  isPending
                    ? 'border-amber-300 ring-2 ring-amber-400/20'
                    : isRejected
                    ? 'border-rose-200'
                    : 'border-slate-200/90 hover:border-purple-300'
                }`}
              >
                {/* Image Container */}
                <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                  {/* Krida Tag Badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1 backdrop-blur-md shadow-md ${
                      item.krida === 'Krida Pemandu' ? 'bg-teal-600/95 text-white' :
                      item.krida === 'Krida Penyuluh' ? 'bg-indigo-600/95 text-white' :
                      item.krida === 'Krida Mice & Event' ? 'bg-emerald-600/95 text-white' :
                      'bg-amber-500/95 text-slate-950'
                    }`}>
                      <KridaCardIcon className="w-3 h-3" />
                      <span>{item.krida || (item.kind === 'KULINER' ? 'Kuliner' : 'Cinderamata')}</span>
                    </span>
                  </div>

                  {/* Status Overlay Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    {isPending ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 border border-white flex items-center gap-1 shadow-sm">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Menunggu Operator</span>
                      </span>
                    ) : isRejected ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 shadow-sm">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>Perlu Revisi</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600/90 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-200" />
                        <span>Terverifikasi</span>
                      </span>
                    )}
                  </div>

                  {/* Location & Category on image */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-amber-200 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0 text-amber-400" />
                      {item.districtName}
                    </span>
                    <span className="text-[10px] bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-white/10">
                      {item.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-purple-700 transition-colors leading-snug">
                      {item.name}
                    </h3>
                    
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Contributor Profile */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.authorAvatarUrl ? (
                        <img
                          src={item.authorAvatarUrl}
                          alt={item.authorName}
                          className="w-6 h-6 rounded-full object-cover border border-purple-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {item.authorName.charAt(0)}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{item.authorName}</p>
                        <p className="text-[10px] text-slate-400 truncate">NTA: {item.authorNta || 'Terdaftar'}</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleQuickLike(e, item.id)}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer ${
                        isLiked 
                          ? 'bg-rose-50 border-rose-200 text-rose-600' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                      title="Sukai Karya Ini"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                      <span className="text-[10px] font-bold">{item.likesCount + (isLiked ? 1 : 0)}</span>
                    </button>
                  </div>

                  {/* Price & Operator Quick Action Bar */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block leading-tight">Estimasi Biaya</span>
                        <span className="text-xs font-extrabold font-mono text-emerald-700">
                          Rp {(item.priceEstimate ?? 0).toLocaleString('id-ID')}
                          <span className="text-[10px] font-normal text-slate-500 ml-0.5">/{item.priceUnit || 'unit'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Quick Edit for Super Admin / Operator / Author */}
                        {(isOperator || isMine) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenFormModal(item);
                            }}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Edit Data Produk / Karya"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                          </button>
                        )}

                        {/* Quick Delete for Super Admin / Operator / Author */}
                        {(isOperator || isMine) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Apakah Anda yakin ingin menghapus produk "${item.name}"?`)) {
                                storage.deleteCulinarySouvenir(item.id, currentUser);
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Hapus Produk / Karya"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </button>
                        )}

                        <span className="text-xs font-bold text-purple-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 ml-1">
                          <span>Rincian</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>

                    {/* Operator Action Bar for Pending Items */}
                    {isOperator && isPending && (
                      <div className="pt-2 border-t border-amber-200/80 flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleQuickApprove(e, item)}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={(e) => handleQuickReject(e, item)}
                          className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
