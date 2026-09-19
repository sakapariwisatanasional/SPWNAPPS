import React from "react";
import {
  X,
  ShoppingBag,
  Tag,
  CheckCircle2
} from "lucide-react";


const normalizeImageUrl = (raw: unknown): string => {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value) return "";
  const idMatch = value.match(/(?:\/file\/d\/|[?&]id=|\/d\/)([a-zA-Z0-9_-]{10,})/);
  if (idMatch?.[1] && value.includes("drive.google.com")) return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  if (/^[a-zA-Z0-9_-]{10,}$/.test(value)) return `https://lh3.googleusercontent.com/d/${value}`;
  return value;
};

interface OfficialMerchandiseDetailModalProps {
  item?: any;
  onClose?: () => void;
}

export const OfficialMerchandiseDetailModal: React.FC<OfficialMerchandiseDetailModalProps> = ({
  item,
  onClose
}) => {

  if (!item) return null;

  const productName = item?.name || "Produk Merchandise";
  const description = item?.description || "Official merchandise Saka Pariwisata Nasional.";
  const price = Number(item?.price || 0);
  const category = item?.category || "Merchandise";

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

        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-xl font-black">
            Detail Merchandise
          </h2>

          <button
            onClick={onClose}
            className="
              rounded-full
              bg-slate-100
              p-2
              hover:bg-slate-200
            "
          >
            <X size={20}/>
          </button>
        </div>


        <div className="grid md:grid-cols-2">

          <div
            className={`
              min-h-[320px]
              flex items-center justify-center
              bg-gradient-to-br
              ${item?.accentClass || "from-emerald-900 to-teal-500"}
            `}
          >

            {normalizeImageUrl(item?.["Foto Produk"] || item?.imageUrl || item?.image) ? (

              <img
                src={normalizeImageUrl(item?.["Foto Produk"] || item?.imageUrl || item?.image)}
                alt={productName}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/saka_logo.png";
                  e.currentTarget.className = "w-32 min-h-32 object-contain";
                }}
                className="w-full min-h-[320px] object-cover"
              />

            ) : (

              <ShoppingBag
                size={90}
                className="text-white/90"
              />

            )}

          </div>


          <div className="p-7 space-y-5">

            <div className="flex flex-wrap gap-2">

              <span
                className="
                  rounded-full
                  bg-emerald-100
                  px-3 py-1
                  text-xs font-bold
                  text-emerald-700
                "
              >
                Official
              </span>


              {item?.featured && (

                <span
                  className="
                    rounded-full
                    bg-amber-100
                    px-3 py-1
                    text-xs font-bold
                    text-amber-700
                  "
                >
                  Featured
                </span>

              )}

            </div>


            <h1 className="text-3xl font-black">
              {productName}
            </h1>


            <p className="text-slate-600">
              {description}
            </p>


            <div className="text-2xl font-black text-orange-600">
              Rp {price.toLocaleString("id-ID")}
            </div>


            {item?.material && (

              <div className="rounded-2xl bg-slate-50 p-4">
                <b>Material</b>
                <p className="mt-1 text-slate-500">
                  {item.material}
                </p>
              </div>

            )}


            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Tag size={16}/>
              {category}
            </div>


            {item?.purchaseEnabled && (

              <div
                className="
                  flex items-center gap-2
                  font-bold text-green-600
                "
              >
                <CheckCircle2 size={16}/>
                Ready Stock
              </div>

            )}


            {Array.isArray(item?.sizes) && item.sizes.length > 0 && (

              <div>
                <b>Pilihan Ukuran</b>

                <div className="mt-2 flex flex-wrap gap-2">
                  {item.sizes.map((size:string)=>(
                    <span
                      key={size}
                      className="
                        rounded-xl
                        border
                        px-3 py-2
                        text-sm font-bold
                      "
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
              "
            >
              Pesan Merchandise
            </button>


          </div>

        </div>

      </div>

    </div>
  );
};

export default OfficialMerchandiseDetailModal;
