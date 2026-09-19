import React from "react";
import { MapPin, ShoppingBag, ChevronRight } from "lucide-react";

interface CulinarySouvenirGallerySectionProps {
  products?: any[];
  onSelectProduct?: (item: any) => void;
  [key: string]: any;
}

export const CulinarySouvenirGallerySection:
React.FC<CulinarySouvenirGallerySectionProps> = ({
  products = [],
  onSelectProduct
}) => {

  const items = Array.isArray(products)
    ? products.slice(0, 8)
    : [];

  return (
    <section className="space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900">
            Kuliner & Cinderamata Nusantara
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Produk kreatif daerah karya anggota Saka Pariwisata
          </p>
        </div>

        <button className="
          hidden md:flex
          items-center gap-1
          text-red-600
          font-bold text-sm
        ">
          Lihat Semua
          <ChevronRight size={16}/>
        </button>
      </div>


      <div className="
        grid grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-5
      ">
        {items.map((item:any,index)=>(
          <button
            key={item?.id || index}
            onClick={() => onSelectProduct?.(item)}
            className="
              text-left
              bg-white
              rounded-[2rem]
              overflow-hidden
              border border-slate-200
              shadow-sm
              hover:-translate-y-1
              hover:shadow-xl
              transition-all
            "
          >

            <div className="
              h-44
              bg-gradient-to-br
              from-amber-100
              via-orange-50
              to-red-100
              flex items-center justify-center
            ">
              <ShoppingBag
                size={42}
                className="text-orange-400"
              />
            </div>


            <div className="p-5">

              <span className="
                inline-flex
                px-3 py-1
                rounded-full
                bg-amber-50
                text-amber-700
                text-xs
                font-bold
              ">
                {item?.category || "Cinderamata"}
              </span>


              <h3 className="
                mt-3
                font-black
                text-slate-900
                line-clamp-2
              ">
                {item?.name || item?.title || "Produk Nusantara"}
              </h3>


              <div className="
                flex items-center gap-1
                text-xs text-slate-500
                mt-3
              ">
                <MapPin size={14}/>
                {item?.region || "Indonesia"}
              </div>


              <div className="
                mt-4
                text-red-600
                font-bold
                text-sm
                flex items-center gap-1
              ">
                Detail Produk
                <ChevronRight size={15}/>
              </div>

            </div>

          </button>
        ))}
      </div>

    </section>
  );
};

export default CulinarySouvenirGallerySection;
