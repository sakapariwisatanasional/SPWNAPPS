import React, { useMemo } from 'react';
import { UtensilsCrossed, MapPin, Tag, ChevronRight, ShoppingBag } from 'lucide-react';

export interface CulinarySouvenirGallerySectionProps {
  items?: any[];
  culinaryItems?: any[];
  onSelectItem?: (item: any) => void;
  [key: string]: any;
}

export const CulinarySouvenirGallerySection: React.FC<CulinarySouvenirGallerySectionProps> = ({
  items = [],
  culinaryItems = [],
  onSelectItem,
}) => {
  // Normalisasi data aman
  const safeItems = useMemo(() => {
    const rawList = Array.isArray(items) && items.length > 0 ? items : culinaryItems;
    return (Array.isArray(rawList) ? rawList : []).filter((item) => Boolean(item));
  }, [items, culinaryItems]);

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
