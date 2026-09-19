import React from "react";
import { X, ShoppingBag, Tag, Star } from "lucide-react";

interface OfficialMerchandiseDetailModalProps {
  item?: any;
  onClose?: () => void;
}

export const OfficialMerchandiseDetailModal: React.FC<OfficialMerchandiseDetailModalProps> = ({
  item,
  onClose
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl overflow-hidden">

        <div
          className={`
            h-64
            bg-gradient-to-br
            ${item.accentClass || "from-emerald-900 to-teal-500"}
            flex items-center justify-center
            relative
          `}
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
          >
            <X size={20} />
          </button>

          <ShoppingBag
            size={90}
            className="text-white/90"
          />
        </div>


        <div className="p-6 md:p-8 space-y-5">

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                Official Merchandise
              </span>

              {item.featured && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  Featured
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-black">
              {item.name}
            </h2>

            <p className="mt-2 text-slate-500">
              {item.description}
            </p>
          </div>


          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <span className="text-slate-500">
              Harga
            </span>

            <strong className="text-xl text-orange-600">
              Rp {Number(item.price || 0).toLocaleString("id-ID")}
            </strong>
          </div>


          <div className="grid md:grid-cols-2 gap-4">

            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 font-bold">
                <Tag size={16}/>
                Kategori
              </div>

              <p className="mt-2 text-slate-500">
                {item.category || "-"}
              </p>
            </div>


            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 font-bold">
                <Star size={16}/>
                Tag
              </div>

              <p className="mt-2 text-slate-500">
                {(item.tags || []).join(", ")}
              </p>
            </div>

          </div>


          {item.sizes && (
            <div>
              <h3 className="font-bold mb-2">
                Pilihan Ukuran
              </h3>

              <div className="flex flex-wrap gap-2">
                {item.sizes.map((size:string) => (
                  <span
                    key={size}
                    className="rounded-xl border px-4 py-2 text-sm font-semibold"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}


          <button
            className="
              w-full
              rounded-2xl
              bg-emerald-700
              py-3
              font-black
              text-white
              hover:bg-emerald-800
              transition
            "
          >
            Pesan Merchandise
          </button>

        </div>

      </div>
    </div>
  );
};

export default OfficialMerchandiseDetailModal;
