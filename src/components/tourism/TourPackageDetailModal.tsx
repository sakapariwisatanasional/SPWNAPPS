import React from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Users, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Navigation, 
  Compass, 
  Building2, 
  Car, 
  Calendar,
  Share2,
  Sparkles,
  Edit3,
  Trash2
} from 'lucide-react';
import { TourPackage, CurrentUser } from '../../types';
import { formatDriveImageUrl } from '../common/SakaLogo';

interface TourPackageDetailModalProps {
  tour: TourPackage | null;
  currentUser?: CurrentUser;
  onClose: () => void;
  onEdit?: (tour: TourPackage) => void;
  onDelete?: (tourId: string) => void;
}

export const TourPackageDetailModal: React.FC<TourPackageDetailModalProps> = ({
  tour,
  currentUser,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!tour) return null;

  const isOperatorOrAdmin = currentUser && [
    'SUPER_ADMIN', 
    'ADMIN_PROVINCE', 
    'ADMIN_REGENCY', 
    'ADMIN_BRANCH',
    'OPERATOR'
  ].includes(currentUser.role);

  const isOwner = currentUser && (
    currentUser.memberId === tour.ownerId || 
    currentUser.id === tour.ownerId ||
    currentUser.name === tour.ownerName
  );

  const canEdit = isOperatorOrAdmin || isOwner;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const coverImg = formatDriveImageUrl(tour.coverImage || (tour as any).coverImageUrl) || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cover & Header */}
        <div className="relative h-64 bg-slate-900 flex-shrink-0">
          <img
            src={coverImg}
            alt={tour.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Title Overlay */}
          <div className="absolute bottom-5 left-6 right-6 text-white z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-extrabold uppercase">
                {tour.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-xs text-white text-[11px] font-medium">
                {tour.durationDays} Hari Perjalanan
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight leading-tight">
              {tour.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-emerald-300 mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{tour.locationAddress}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar text-xs">
          {/* Key Facts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Harga Paket</p>
              <p className="text-sm font-extrabold text-emerald-700 font-heading mt-0.5">
                {formatRupiah(tour.pricePerPerson)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Kapasitas</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                {tour.minCapacity} - {tour.maxCapacity} Orang
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Akomodasi</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                {tour.lodgingType || 'Homestay / Hotel'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[10px]">Pemandu</p>
              <p className="text-xs font-bold text-emerald-800 mt-0.5">
                {tour.guideProvided ? '✓ Berlisensi Saka' : 'Mandiri'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2 font-heading">Deskripsi Paket Wisata</h4>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-xs">
              {tour.description}
            </p>
          </div>

          {/* Itinerary Timeline */}
          {tour.itinerary && tour.itinerary.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-3 font-heading flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Rundown / Itinerary Kegiatan</span>
              </h4>
              <div className="space-y-3 pl-2 border-l-2 border-emerald-500">
                {tour.itinerary.map((item, idx) => (
                  <div key={idx} className="relative pl-4">
                    <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-xs">
                          Hari ke-{item.day}: {item.title}
                        </span>
                        {item.timeRange && (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-mono font-medium">
                            {item.timeRange}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facilities List */}
          {tour.facilities && tour.facilities.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2 font-heading">Fasilitas Termasuk</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tour.facilities.map((fac, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100 text-emerald-950 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pengelola & Kontak */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pengelola Paket</p>
              <p className="text-sm font-bold text-white font-heading mt-0.5">{tour.ownerName}</p>
              <p className="text-xs text-emerald-400 font-medium">
                {tour.branchName || `${tour.regencyName}, ${tour.provinceName}`}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`https://wa.me/${tour.contactPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Hubungi via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(tour);
                  onClose();
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Paket Wisata</span>
              </button>
            )}

            {canEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Apakah Anda yakin ingin menghapus paket wisata "${tour.title}"?`)) {
                    onDelete(tour.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                title="Hapus Paket Wisata"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            )}

            {!canEdit && (
              <span className="text-[10px] text-slate-400">
                Ditinjau oleh Saka Pariwisata Indonesia
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
