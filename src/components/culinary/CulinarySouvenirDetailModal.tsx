import React from "react";
import { X, ShoppingBag, Tag, CheckCircle2 } from "lucide-react";

interface CulinarySouvenirDetailModalProps {
  item?: any;
  onClose?: () => void;
}

export const CulinarySouvenirDetailModal: React.FC<CulinarySouvenirDetailModalProps> = ({
  item,
  onClose
}) => {

  if (!item) return null;

  const productName = item?.name || "Produk Kuliner Nusantara";
  const authorName = item?.authorName || "C";
  const description =
    item?.description ||
    "Produk kuliner khas Nusantara.";

  const category = item?.category || "Kuliner";

  return (
    <div
      className="
        fixed inset-0 z-[999]
        flex items-center justify-center
        bg-black/50 p-4
      "
    >

      <div
        className="
          w-full max-w-4xl
          overflow-hidden
          rounded-[2rem]
          bg-white
          shadow-2xl
        "
      >

        <div className="flex justify-between items-center border-b p-5">

          <div className="flex items-center gap-3">
            <div className="
              flex h-10 w-10 items-center justify-center
              rounded-full bg-emerald-100
              font-black text-emerald-700
            ">
              {String(authorName).charAt(0)}
            </div>

            <h2 className="text-xl font-black">
              Detail Produk
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2"
          >
            <X size={20}/>
          </button>

        </div>


        <div className="grid md:grid-cols-2">

          <div
            className="
              min-h-[320px]
              flex items-center justify-center
              bg-gradient-to-br
              from-orange-500
              via-amber-400
              to-emerald-600
            "
          >
            <ShoppingBag
              size={90}
              className="text-white/90"
            />
          </div>


          <div className="p-7 space-y-5">

            <h1 className="text-3xl font-black">
              {productName}
            </h1>

            <p className="text-slate-600">
              {description}
            </p>


            <div className="flex items-center gap-2 text-slate-500">
              <Tag size={16}/>
              {category}
            </div>


            {item?.price && (
              <div className="
                text-2xl font-black text-orange-600
              ">
                Rp {Number(item.price).toLocaleString("id-ID")}
              </div>
            )}


            {item?.purchaseEnabled && (
              <div className="
                flex items-center gap-2
                font-bold text-green-600
              ">
                <CheckCircle2 size={16}/>
                Ready Stock
              </div>
            )}


            <button
              className="
                w-full rounded-2xl
                bg-emerald-700
                py-3
                font-black
                text-white
              "
            >
              Lihat Produk
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CulinarySouvenirDetailModal;
