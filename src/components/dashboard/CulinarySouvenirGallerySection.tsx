import React from "react";
import {
  MapPin,
  ShoppingBag,
  ChevronRight,
  Plus
} from "lucide-react";

interface CulinarySouvenirGallerySectionProps {
  items?: any[];
  currentUser?: any;
  members?: any[];
  onSelectItemDetail?: (item: any) => void;
  onOpenFormModal?: () => void;
  [key: string]: any;
}

export const CulinarySouvenirGallerySection:
React.FC<CulinarySouvenirGallerySectionProps> = ({
  items = [],
  currentUser,
  onSelectItemDetail,
  onOpenFormModal
}) => {

  const products = Array.isArray(items)
    ? items
    : [];

  const isAdmin =
    currentUser?.role === "admin" ||
    currentUser?.isAdmin === true;

  return (
    <section className="space-y-5">

      <div className="
        flex items-start
        justify-between
        gap-4
      ">
        <div>
          <h2 className="
            text-xl md:text-2xl
            font-black
            text-slate-900
          ">
            Kuliner & Cinderamata Nusantara
          </h2>

          <p className="
            text-sm
            text-slate-500
            mt-1
          ">
            Produk kreatif daerah karya anggota Saka Pariwisata
          </p>
        </div>


        {isAdmin && onOpenFormModal && (
          <button
            onClick={onOpenFormModal}
            className="
              flex items-center gap-2
              rounded-2xl
              bg-red-600
              text-white
              px-4 py-2
              font-bold text-sm
              shadow-sm
            "
          >
            <Plus size={16}/>
            Tambah
          </button>
        )}

      </div>


      {products.length === 0 ? (

        <div className="
          rounded-[2rem]
          border border-dashed
          border-slate-300
          p-10
          text-center
          bg-white
        ">
          <ShoppingBag
            className="mx-auto text-slate-300"
            size={42}
          />

          <p className="
            mt-3
            font-bold
            text-slate-500
          ">
            Belum ada produk kuliner atau cinderamata
          </p>
        </div>

      ) : (

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-5
        ">

          {products.map((item:any,index:number)=>(

            <button
              key={item?.id || index}
              onClick={() => onSelectItemDetail?.(item)}
              className="
                text-left
                overflow-hidden
                rounded-[2rem]
                bg-white
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
                flex items-center
                justify-center
              ">

                {item?.image ? (
                  <img
                    src={item.image}
                    alt={item?.name || "Produk"}
                    className="
                      w-full h-full
                      object-cover
                    "
                  />
                ) : (
                  <ShoppingBag
                    size={42}
                    className="text-orange-400"
                  />
                )}

              </div>


              <div className="p-5">

                <span className="
                  inline-flex
                  rounded-full
                  bg-amber-50
                  text-amber-700
                  px-3 py-1
                  text-xs
                  font-bold
                ">
                  {item?.category || "Produk Lokal"}
                </span>


                <h3 className="
                  mt-3
                  font-black
                  text-slate-900
                  line-clamp-2
                ">
                  {item?.name ||
                   item?.title ||
                   "Produk Nusantara"}
                </h3>


                <div className="
                  mt-3
                  flex items-center
                  gap-1
                  text-xs
                  text-slate-500
                ">
                  <MapPin size={14}/>
                  {item?.region ||
                   item?.location ||
                   "Indonesia"}
                </div>


                <div className="
                  mt-4
                  flex items-center
                  gap-1
                  text-sm
                  font-bold
                  text-red-600
                ">
                  Detail Produk
                  <ChevronRight size={15}/>
                </div>

              </div>

            </button>

          ))}

        </div>

      )}

    </section>
  );
};

export default CulinarySouvenirGallerySection;
