import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Sparkles, 
  Layers, 
  SlidersHorizontal,
  CheckCircle2,
  Users,
  Award
} from 'lucide-react';
import { TourPackage, TourCategory, CurrentUser, Province, Member } from '../types';
import { TourPackageCard } from '../components/tourism/TourPackageCard';
import { storage } from '../services/storage';
import { CompetentGuidesSection } from '../components/common/CompetentGuidesSection';

interface TourismDirectoryViewProps {
  currentUser: CurrentUser;
  tours: TourPackage[];
  provinces: Province[];
  members: Member[];
  onOpenTourFormModal: () => void;
  onViewTourDetail: (tour: TourPackage) => void;
  onOpenVerifyModal: (member: Member) => void;
  onEditTour?: (tour: TourPackage) => void;
  onDeleteTour?: (tourId: string) => void;
}

export const TourismDirectoryView: React.FC<TourismDirectoryViewProps> = ({
  currentUser,
  tours,
  provinces,
  members,
  onOpenTourFormModal,
  onViewTourDetail,
  onOpenVerifyModal,
  onEditTour,
  onDeleteTour
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH'>('POPULAR');

  const categories: TourCategory[] = [
    'Wisata Alam',
    'Wisata Budaya',
    'Wisata Kuliner',
    'Desa Wisata',
    'Ekowisata',
    'Adventure',
    'Eduwisata',
    'Bahari',
    'Heritage & Sejarah'
  ];

  const filteredTours = useMemo(() => {
    return tours.filter((t) => {
      // Role scope for viewing pending
      if (t.status !== 'APPROVED_PUBLISHED' && currentUser.role === 'MEMBER' && t.ownerId !== (currentUser.memberId || currentUser.id)) {
        return false;
      }

      const q = (searchQuery || '').toLowerCase();
      const matchSearch = 
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.regencyName || '').toLowerCase().includes(q) ||
        (t.provinceName || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
      if (selectedProvinceId !== 'ALL' && t.provinceId !== selectedProvinceId) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'PRICE_LOW') return a.pricePerPerson - b.pricePerPerson;
      if (sortBy === 'PRICE_HIGH') return b.pricePerPerson - a.pricePerPerson;
      return 0;
    });
  }, [tours, searchQuery, selectedCategory, selectedProvinceId, sortBy, currentUser]);

  const handleModerate = (tour: TourPackage, action: 'APPROVE' | 'REJECT') => {
    if (action === 'APPROVE') {
      storage.updateTourStatus(tour.id, 'APPROVED_PUBLISHED');
      alert(`Paket wisata "${tour.title}" telah disetujui dan dipublikasikan.`);
    } else {
      storage.updateTourStatus(tour.id, 'REJECTED');
      alert(`Paket wisata "${tour.title}" telah ditolak.`);
    }
  };

  const isAdmin = ['SUPER_ADMIN', 'ADMIN_PROVINCE', 'ADMIN_REGENCY', 'ADMIN_BRANCH'].includes(currentUser.role);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900">
            Direktori Paket & Destinasi Wisata
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemberdayaan pariwisata nusantara dikelola oleh pangkalan Saka Pariwisata & pemandu bersertifikasi
          </p>
        </div>

        <button
          onClick={onOpenTourFormModal}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Paket Wisata Baru</span>
        </button>
      </div>

      {/* Category Pills & Filters */}
      <div className="space-y-3">
        {/* Category Carousel Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filter Bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari destinasi, daerah, kata kunci..."
              className="bg-transparent outline-none w-full text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Province Select */}
            <select
              value={selectedProvinceId}
              onChange={(e) => setSelectedProvinceId(e.target.value)}
              className="flex-1 md:flex-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium text-slate-700"
            >
              <option value="ALL">Semua Provinsi</option>
              {provinces.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="flex-1 md:flex-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-medium text-slate-700"
            >
              <option value="POPULAR">Rekomendasi</option>
              <option value="PRICE_LOW">Harga Termurah</option>
              <option value="PRICE_HIGH">Harga Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tour Cards Grid */}
      {filteredTours.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
          <Compass className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <p className="text-sm font-bold text-slate-700">Belum ada paket wisata yang cocok</p>
          <p className="text-xs">Coba ganti kata kunci pencarian atau reset filter kategori.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => {
            const canEdit = isAdmin || (currentUser.role === 'MEMBER' && tour.ownerId === (currentUser.memberId || currentUser.id));
            return (
              <TourPackageCard
                key={tour.id}
                tour={tour}
                onViewDetail={onViewTourDetail}
                onEdit={onEditTour}
                onDelete={(t) => {
                  if (onDeleteTour) {
                    onDeleteTour(t.id);
                  } else {
                    storage.deleteTourPackage(t.id, currentUser);
                  }
                }}
                canEdit={canEdit}
                onModerate={handleModerate}
                canModerate={isAdmin}
              />
            );
          })}
        </div>
      )}

      {/* Guide & Competent Members Section based on selected destination province */}
      <div className="mt-12 pt-10 border-t border-slate-200">
        <CompetentGuidesSection
          members={members}
          provinces={provinces}
          onOpenVerifyModal={onOpenVerifyModal}
          selectedProvinceId={selectedProvinceId}
          onProvinceChange={(pId) => setSelectedProvinceId(pId)}
          theme="light"
          title="Pemandu & Fasilitator Terdekat untuk Destinasi Anda"
          subtitle="Hubungi langsung kader Pramuka Saka Pariwisata di wilayah tujuan untuk pendampingan pemanduan, ekowisata, storytelling sejarah, dan informasi lokal."
        />
      </div>
    </div>
  );
};
