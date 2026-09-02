import React from 'react';
import { 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  Edit3,
  Trash2
} from 'lucide-react';
import { TourPackage } from '../../types';
import { formatDriveImageUrl } from '../common/SakaLogo';

interface TourPackageCardProps {
  tour: TourPackage;
  onViewDetail: (tour: TourPackage) => void;
  onEdit?: (tour: TourPackage) => void;
  onDelete?: (tour: TourPackage) => void;
  canEdit?: boolean;
  onModerate?: (tour: TourPackage, action: 'APPROVE' | 'REJECT') => void;
  canModerate?: boolean;
}

export const TourPackageCard: React.FC<TourPackageCardProps> = ({
  tour,
  onViewDetail,
  onEdit,
  onDelete,
  canEdit = false,
  onModerate,
  canModerate = false
}) => {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED_PUBLISHED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">PUBLIK</span>;
      case 'SUBMITTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">MENUNGGU REVIEW</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300">DITOLAK</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">DRAFT</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
      {/* Cover Image & Category */}
      <div className="relative h-48 overflow-hidden bg-slate-900">
        <img
          src={formatDriveImageUrl(tour.coverImage || (tour as any).coverImageUrl) || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'}
          alt={tour.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-xs text-white rounded-lg text-xs font-bold border border-white/20">
            {tour.category}
          </span>
          <div>
            {getStatusBadge(tour.status)}
          </div>
        </div>

        {/* Bottom Price on Cover */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white z-10">
          <div>
            <p className="text-[10px] text-white/80 uppercase font-medium">Mulai dari</p>
            <p className="text-base font-extrabold font-heading text-emerald-300 leading-tight">
              {formatRupiah(tour.pricePerPerson)}
              <span className="text-[10px] font-normal text-white/80"> / org</span>
            </p>
          </div>

          <div className="flex items-center gap-1 text-[11px] bg-black/40 backdrop-blur-xs px-2 py-1 rounded-lg border border-white/10 font-medium">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>{tour.durationDays} Hari</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{tour.regencyName}, {tour.provinceName}</span>
          </div>

          <h3 
            onClick={() => onViewDetail(tour)}
            className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer font-heading leading-snug"
          >
            {tour.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {tour.description}
          </p>
        </div>

        {/* Owner Info & Details */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Pengelola / Owner:</span>
            <span className="font-semibold text-slate-700 truncate max-w-[170px]">
              {tour.ownerName}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>Kapasitas:</span>
            </span>
            <span className="font-semibold text-slate-700">
              {tour.minCapacity} - {tour.maxCapacity} Peserta
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => onViewDetail(tour)}
            className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat Detail & Itinerary</span>
          </button>

          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(tour)}
              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
              title="Edit Data Paket Wisata"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
            </button>
          )}

          {canEdit && onDelete && (
            <button
              onClick={() => {
                if (confirm(`Apakah Anda yakin ingin menghapus paket wisata "${tour.title}"?`)) {
                  onDelete(tour);
                }
              }}
              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center"
              title="Hapus Paket Wisata"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            </button>
          )}

          {canModerate && tour.status === 'SUBMITTED' && onModerate && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onModerate(tour, 'APPROVE')}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                title="Setujui & Publikasikan"
              >
                ✓
              </button>
              <button
                onClick={() => onModerate(tour, 'REJECT')}
                className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
                title="Tolak Paket"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
