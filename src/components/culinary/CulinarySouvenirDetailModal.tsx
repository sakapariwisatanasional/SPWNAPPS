import React, { useState, useEffect } from 'react';
import { 
  X, 
  Utensils, 
  Gift, 
  MapPin, 
  Heart, 
  Phone, 
  Store, 
  BookOpen, 
  Tag, 
  Share2, 
  Edit3, 
  Trash2, 
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Compass,
  Camera,
  Tent,
  AlertCircle,
  Clock,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';
import { CulinarySouvenirItem, CurrentUser, KridaType } from '../../types';
import { storage } from '../../services/storage';
import { formatDriveImageUrl } from '../common/SakaLogo';

interface CulinarySouvenirDetailModalProps {
  item: CulinarySouvenirItem | null;
  onClose: () => void;
  currentUser: CurrentUser;
  onEdit?: (item: CulinarySouvenirItem) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (updatedItem: CulinarySouvenirItem) => void;
}

export const CulinarySouvenirDetailModal: React.FC<CulinarySouvenirDetailModalProps> = ({
  item: initialItem,
  onClose,
  currentUser,
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const [item, setItem] = useState<CulinarySouvenirItem | null>(initialItem);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialItem?.likesCount || 0);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    setItem(initialItem);
    setLikesCount(initialItem?.likesCount || 0);
    setLiked(false);
    setIsRejecting(false);
    setRejectReason('');
  }, [initialItem]);

  if (!item) return null;

  const isOperator = [
    'SUPER_ADMIN', 
    'ADMIN_PROVINCE', 
    'ADMIN_REGENCY', 
    'ADMIN_BRANCH',
    'OPERATOR'
  ].includes(currentUser.role);

  const isAuthor = 
    currentUser.memberId === item.authorMemberId ||
    currentUser.name === item.authorName ||
    currentUser.id === item.authorMemberId;

  const isAuthorOrAdmin = isOperator || isAuthor;

  const handleLike = () => {
    if (!liked) {
      const newCount = storage.likeCulinarySouvenir(item.id);
      setLikesCount(newCount);
      setLiked(true);
    }
  };

  const handleWhatsAppOrder = () => {
    const phone = item.contactPhone?.replace(/[^0-9]/g, '') || '6281234567890';
    const text = encodeURIComponent(
      `Salam Pramuka! Halo Kak ${item.authorName}, saya tertarik dengan produk/jasa "${item.name}" (${item.krida || 'Saka Pariwisata'}) di Galeri Saka Pariwisata (${item.districtName}, ${item.regencyName}). Apakah masih tersedia dan bagaimana proses pemesanannya? Terima kasih.`
    );
    window.open(`https://wa.me/${phone.startsWith('0') ? '62' + phone.slice(1) : phone}?text=${text}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert(`Tautan untuk "${item.name}" telah disalin ke papan klip.`);
    }
  };

  const handleApprove = () => {
    const updated = storage.approveCulinarySouvenir(item.id, currentUser);
    if (updated) {
      setItem(updated);
      if (onStatusChange) onStatusChange(updated);
      alert(`Produk "${item.name}" berhasil disetujui dan dipublikasikan ke Galeri Nasional!`);
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Mohon masukkan alasan penolakan atau catatan perbaikan bagi anggota.');
      return;
    }
    const updated = storage.rejectCulinarySouvenir(item.id, rejectReason.trim(), currentUser);
    if (updated) {
      setItem(updated);
      setIsRejecting(false);
      if (onStatusChange) onStatusChange(updated);
      alert(`Produk "${item.name}" ditandai perlu perbaikan.`);
    }
  };

  const getKridaIcon = (krida?: KridaType) => {
    switch (krida) {
      case 'Krida Pemandu': return Compass;
      case 'Krida Penyuluh': return Camera;
      case 'Krida Mice & Event': return Tent;
      default: return Utensils;
    }
  };

  const KridaIcon = getKridaIcon(item.krida);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-2 sm:my-6 max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cover Image & Category Badges */}
        <div className="relative h-52 sm:h-72 bg-slate-900 flex-shrink-0 overflow-hidden">
          <img
            src={formatDriveImageUrl(item.imageUrl) || (item.kind === 'KULINER' ? 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80')}
            alt={item.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = item.kind === 'KULINER' ? 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/40" />

          {/* Top Buttons */}
          <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between z-10">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className={`px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-extrabold flex items-center gap-1.5 backdrop-blur-md shadow-md ${
                item.krida === 'Krida Pemandu' ? 'bg-teal-600/90 text-white' :
                item.krida === 'Krida Penyuluh' ? 'bg-indigo-600/90 text-white' :
                item.krida === 'Krida Mice & Event' ? 'bg-emerald-600/90 text-white' :
                'bg-amber-500/95 text-slate-950'
              }`}>
                <KridaIcon className="w-3.5 h-3.5" />
                <span>{item.krida || (item.kind === 'KULINER' ? 'Kuliner Daerah' : 'Cinderamata')}</span>
              </span>

              <span className="px-2.5 sm:px-3 py-1 bg-black/60 backdrop-blur-md text-slate-200 rounded-xl text-[11px] sm:text-xs font-semibold border border-white/15">
                {item.categoryLabel}
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleShare}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                title="Bagikan"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Overlay Title & Location */}
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-5 sm:right-5 text-white z-10 space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-300 font-bold">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
              <span className="truncate">{item.districtName} • {item.regencyName}, {item.provinceName}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold font-heading text-white leading-tight">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Status Verification Bar */}
        <div className={`px-4 sm:px-6 py-2.5 border-b text-xs flex items-center justify-between gap-3 ${
          item.status === 'APPROVED' 
            ? 'bg-emerald-50 text-emerald-950 border-emerald-200' 
            : item.status === 'REJECTED'
            ? 'bg-rose-50 text-rose-950 border-rose-200'
            : 'bg-amber-50 text-amber-950 border-amber-200'
        }`}>
          <div className="flex items-center gap-2">
            {item.status === 'APPROVED' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>
                  <strong>Terverifikasi & Disetujui:</strong> Ditinjau oleh Operator Kwartir Wilayah ({item.approvedBy || 'Operator'})
                </span>
              </>
            ) : item.status === 'REJECTED' ? (
              <>
                <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>
                  <strong>Perlu Perbaikan / Ditolak:</strong> {item.rejectionReason || 'Silakan tinjau kembali data produk'}
                </span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>
                  <strong>Menunggu Persetujuan Operator:</strong> Produk sedang dalam antrean verifikasi Kwartir Wilayah setempat.
                </span>
              </>
            )}
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${
            item.status === 'APPROVED' ? 'bg-emerald-200/80 text-emerald-900' :
            item.status === 'REJECTED' ? 'bg-rose-200/80 text-rose-900' :
            'bg-amber-200/80 text-amber-900'
          }`}>
            {item.status === 'APPROVED' ? 'Disetujui' : item.status === 'REJECTED' ? 'Ditolak' : 'Menunggu Review'}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 sm:space-y-6">
          
          {/* Price & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Perkiraan Biaya / Harga</p>
              <p className="text-lg sm:text-xl font-extrabold font-heading text-slate-900">
                Rp {(item.priceEstimate ?? 0).toLocaleString('id-ID')}
                <span className="text-xs font-normal text-slate-500 ml-1">/{item.priceUnit || 'unit'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleLike}
                className={`flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
                  liked 
                    ? 'bg-rose-50 border-rose-200 text-rose-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                <span>{likesCount} Suka</span>
              </button>

              <button
                onClick={handleWhatsAppOrder}
                className="flex-2 sm:flex-none px-4 sm:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer min-h-[40px]"
              >
                <Phone className="w-4 h-4" />
                <span>Pesan / Hubungi via WA</span>
              </button>
            </div>
          </div>

          {/* Operator Moderation Box (If Operator and Item is Pending/Rejected) */}
          {isOperator && item.status !== 'APPROVED' && (
            <div className="p-4 bg-purple-50/70 border-2 border-purple-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-950 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Tindakan Operator Wilayah ({currentUser.jurisdictionName || currentUser.role}):</span>
                </div>
                <span className="text-[11px] text-purple-700 font-semibold">Moderasi Langsung</span>
              </div>

              {!isRejecting ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApprove}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Setujui & Terbitkan ke Galeri</span>
                  </button>

                  <button
                    onClick={() => setIsRejecting(true)}
                    className="px-4 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Tolak / Minta Revisi</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-2 border-t border-purple-200">
                  <label className="text-xs font-bold text-rose-900 block">
                    Alasan Penolakan / Catatan Perbaikan:
                  </label>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Foto kurang jelas / Harap cantumkan izin pangkalan / Perbaiki rincian harga..."
                    className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none text-slate-800"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsRejecting(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-xs"
                    >
                      Kirim Penolakan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Rincian Layanan, Keunikan & Komposisi
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Story & Cultural Origin */}
          {item.storyOrigin && (
            <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900">
                <BookOpen className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Sejarah, Filosofi & Nilai Tambah Daerah
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-amber-950/85 leading-relaxed italic">
                "{item.storyOrigin}"
              </p>
            </div>
          )}

          {/* UMKM & Lokasi Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {item.umkmName && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Store className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sentra UMKM / Unit Usaha Binaan</span>
                </div>
                <p className="text-xs font-bold text-slate-800">{item.umkmName}</p>
                {item.address && <p className="text-[11px] text-slate-500">{item.address}</p>}
              </div>
            )}

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kwartir Asal Pendataan</span>
              </div>
              <p className="text-xs font-bold text-slate-800">{item.districtName}</p>
              <p className="text-[11px] text-slate-500">{item.gudepOrPangkalan || 'Pangkalan Saka Pariwisata'}</p>
            </div>
          </div>

          {/* Contributor Profile */}
          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {item.authorAvatarUrl ? (
                <img
                  src={item.authorAvatarUrl}
                  alt={item.authorName}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-purple-300 flex-shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-purple-200 text-purple-800 font-bold flex items-center justify-center">
                  {item.authorName.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900">{item.authorName}</p>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-[11px] text-purple-700 font-medium">
                  {item.authorRole || 'Anggota Saka Pariwisata'} • NTA: {item.authorNta || 'Terdaftar'}
                </p>
                <p className="text-[10px] text-slate-400">
                  Diajukan pada {new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2.5 py-1 bg-purple-200/70 text-purple-900 rounded-full flex-shrink-0">
              Karya Anggota
            </span>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {item.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-medium flex items-center gap-1"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          <div>
            {isAuthorOrAdmin && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={() => {
                      onClose();
                      onEdit(item);
                    }}
                    className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Data</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm(`Apakah Anda yakin ingin menghapus "${item.name}"?`)) {
                        onDelete(item.id);
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

