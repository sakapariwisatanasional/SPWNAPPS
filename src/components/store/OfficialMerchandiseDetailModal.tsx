import React from "react";
import { X, ShoppingBag, Tag, Star, CheckCircle2 } from "lucide-react";

interface Props {
  item?: any;
  onClose?: () => void;
}

export const OfficialMerchandiseDetailModal: React.FC<Props> = ({
  item,
  onClose
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl rounded-[2rem] overflow-hidden shadow-2xl">

        <div className="grid md:grid-cols-2">

          <div className={`
            min-h-[320px]
            flex items-center justify-center
            bg-gradient-to-br
            ${item.accentClass || "from-emerald-900 to-teal-500"}
          `}>
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingBag size={90} className="text-white"/>
            )}
          </div>

          <div className="p-7 space-y-5">

            <button
              onClick={onClose}
              className="float-right rounded-full bg-slate-100 p-2"
            >
              <X size={18}/>
            </button>

            <div className="flex gap-2 flex-wrap">
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                Official
              </span>

              {item.featured && (
                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                  Featured
                </span>
              )}
            </div>

            <h2 className="text-3xl font-black">
              {item.name}
            </h2>

            <p className="text-slate-500">
              {item.description}
            </p>

            <div className="text-2xl font-black text-orange-600">
              Rp {Number(item.price || 0).toLocaleString("id-ID")}
            </div>

            {item.material && (
              <div className="rounded-2xl bg-slate-50 p-4">
                <b>Material</b>
                <p className="text-slate-500 mt-1">{item.material}</p>
              </div>
            )}

            <div className="flex gap-2 text-sm">
              <Tag size={16}/>
              {item.category}
            </div>

            {item.stockStatus === "READY_STOCK" && (
              <div className="flex items-center gap-2 text-green-700 font-bold">
                <CheckCircle2 size={16}/>
                Ready Stock
              </div>
            )}

            <button className="w-full rounded-2xl bg-emerald-700 py-3 text-white font-black">
              Pesan Merchandise
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficialMerchandiseDetailModal;
