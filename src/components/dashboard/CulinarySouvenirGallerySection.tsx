import React, { useMemo } from 'react';
import { UtensilsCrossed, MapPin, Tag, ChevronRight, ShoppingBag, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { storage } from '../../services/storage';
import { ProductKind } from '../../types';

export interface CulinarySouvenirGallerySectionProps {
  items?: any[];
  culinaryItems?: any[];
  onSelectItem?: (item: any) => void;
  onOpenFormModal?: (item?: any, kind?: ProductKind) => void;
  [key: string]: any;
}

export const CulinarySouvenirGallerySection: React.FC<CulinarySouvenirGallerySectionProps> = ({
  items = [],
  culinaryItems = [],
  onSelectItem,
  onOpenFormModal,
  currentUser,
}) => {
  // Normalisasi data aman
  const safeItems = useMemo(() => {
    const rawList = Array.isArray(items) && items.length > 0 ? items : culinaryItems;
    return (Array.isArray(rawList) ? rawList : []).filter((item) => {
      if (!item) return false;
      const role = currentUser?.role;
      if (role === 'SUPER_ADMIN' || ['ADMIN_PROVINCE','ADMIN_REGENCY','ADMIN_BRANCH'].includes(role)) return true;
      if (role === 'MEMBER') {
        return item.status === 'APPROVED' || item.authorMemberId === (currentUser.memberId || currentUser.id);
      }
      return item.status === 'APPROVED';
    });
  }, [items, culinaryItems, currentUser]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Sentra Kuliner & Cendera Mata
            </h3>
            <p className="text-[11px] text-slate-400">
              Produk ekonomi kreatif binaan Krida Kuliner Saka Pariwisata
            </p>
          </div>
        </div>
        {String(currentUser?.role || '').toUpperCase() === 'MEMBER' && onOpenFormModal && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenFormModal(undefined, 'KULINER')}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Ajukan Kuliner
            </button>
            <button
              type="button"
              onClick={() => onOpenFormModal(undefined, 'CINDERAMATA')}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Ajukan Kriya
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {safeItems.length > 0 ? (
          safeItems.slice(0, 4).map((item, idx) => (
            <div
              key={item?.id || idx}
              onClick={() => onSelectItem && onSelectItem(item)}
              className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-amber-50/30 hover:border-amber-200 transition cursor-pointer flex flex-col justify-between space-y-2 group"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    <Tag className="w-2.5 h-2.5" />
                    {item?.type || item?.category || 'Cendera Mata'}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {item?.price ? `Rp ${Number(item.price).toLocaleString('id-ID')}` : 'Hubungi Perajin'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition line-clamp-1">
                  {item?.name || item?.title || 'Produk Kreatif Saka'}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {item?.description || 'Hasil karya anggota pramuka penegak dan pandega pariwisata.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {item?.origin || item?.kwarcab || 'Lokal'}
                </span>
                <span className="text-amber-600 font-semibold flex items-center group-hover:translate-x-0.5 transition">
                  Detail <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              {currentUser && ['SUPER_ADMIN','ADMIN_PROVINCE','ADMIN_REGENCY','ADMIN_BRANCH'].includes(currentUser.role) && item?.status === 'PENDING_APPROVAL' && (
                <div className="flex gap-1.5 pt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={async () => {
                      const action = currentUser.role === 'SUPER_ADMIN' && item?.adminApprovalStatus === 'APPROVED'
                        ? 'APPROVE_SUPER_ADMIN'
                        : 'APPROVE_ADMIN';
                      const ok = await storage.moderateCulinary(item.id, action, currentUser);
                      if (!ok) alert('Gagal memproses persetujuan produk.');
                    }}
                    className="flex-1 px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {currentUser.role === 'SUPER_ADMIN' && item?.adminApprovalStatus === 'APPROVED' ? 'Terbitkan' : 'Setujui Admin'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const reason = prompt('Alasan penolakan (opsional):') || 'Posting ditolak oleh reviewer.';
                      const ok = await storage.moderateCulinary(item.id, 'REJECT', currentUser, reason);
                      if (!ok) alert('Gagal menolak produk.');
                    }}
                    className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-bold"
                    title="Tolak"
                  >
                    <XCircle className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center space-y-1">
            <ShoppingBag className="w-7 h-7 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600">Belum ada produk kuliner & suvenir</p>
            <p className="text-[11px] text-slate-400">Produk yang didaftarkan akan tampil di sini.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CulinarySouvenirGallerySection;
