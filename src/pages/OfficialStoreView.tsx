import React, { useMemo, useState } from "react";
import { Search, ShoppingBag, Star, Tag, CheckCircle2 } from "lucide-react";
import { OFFICIAL_MERCHANDISE_PRODUCTS } from "../data/officialMerchandiseData";
import { OfficialMerchandiseDetailModal } from "../components/store/OfficialMerchandiseDetailModal";

interface OfficialStoreViewProps {
  onSelectProduct?: (item: any) => void;
  [key: string]: any;
}

export const OfficialStoreView: React.FC<OfficialStoreViewProps> = ({
  onSelectProduct
}) => {

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const filteredProducts = useMemo(() => {
    return OFFICIAL_MERCHANDISE_PRODUCTS.filter((item: any) =>
      String(item?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);


  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">

      <section className="
        rounded-[2.5rem]
        p-8 md:p-10
        text-white
        shadow-xl
        bg-gradient-to-br
        from-emerald-950
        via-teal-700
        to-amber-500
      ">
        <div className="flex items-center gap-4">
          <ShoppingBag size={40}/>

          <div>
            <h1 className="text-3xl md:text-4xl font-black">
              Official Store Saka Pariwisata
            </h1>

            <p className="mt-2 text-white/90">
              Official merchandise Saka Pariwisata Nasional.
              Apparel, identitas, dan perlengkapan kegiatan anggota.
            </p>
          </div>
        </div>

        <div className="
          mt-6 bg-white rounded-2xl
          flex items-center px-4 py-3
          text-slate-700
        ">
          <Search size={18}/>

          <input
            className="ml-3 flex-1 outline-none"
            placeholder="Cari merchandise..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />
        </div>
      </section>


      <section className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
        gap-6
      ">

        {filteredProducts.map((item:any)=>(

          <button
            key={item.id}
            onClick={()=>{
              setSelectedProduct(item);
              onSelectProduct?.(item);
            }}
            className="
              text-left
              bg-white
              rounded-[2rem]
              overflow-hidden
              border border-slate-200
              shadow-sm
              hover:-translate-y-2
              hover:shadow-2xl
              transition-all duration-300
            "
          >

            <div className={`
              h-56
              overflow-hidden
              relative
              flex items-center justify-center
              bg-gradient-to-br
              ${item.accentClass || "from-emerald-900 to-teal-500"}
            `}>

              {(item.image || item.imageUrl) ? (
                <img
                  src={item.image || item.imageUrl}
                  alt={item.name}
                  className="
                    w-full h-full object-cover
                    transition-transform duration-500
                    hover:scale-110
                  "
                />
              ) : (
                <ShoppingBag
                  size={72}
                  className="text-white/90"
                />
              )}

            </div>


            <div className="p-5">

              <div className="flex flex-wrap gap-2 mb-3">

                {item.featured && (
                  <span className="
                    rounded-full bg-amber-100
                    px-3 py-1
                    text-xs font-bold text-amber-700
                  ">
                    Featured
                  </span>
                )}

                <span className="
                  rounded-full bg-emerald-100
                  px-3 py-1
                  text-xs font-bold text-emerald-700
                ">
                  Official
                </span>

                {item.purchaseEnabled && (
                  <span className="
                    flex items-center gap-1
                    rounded-full bg-green-100
                    px-3 py-1
                    text-xs font-bold text-green-700
                  ">
                    <CheckCircle2 size={12}/>
                    Ready Stock
                  </span>
                )}

              </div>


              <h3 className="
                font-black text-lg
                leading-tight
                line-clamp-2
                min-h-[3.5rem]
              ">
                {item.name}
              </h3>


              <div className="
                flex items-center gap-1
                text-amber-500
                mt-3 text-sm
              ">
                <Star size={14} fill="currentColor"/>
                Merchandise Resmi
              </div>


              <div className="
                flex items-center gap-2
                text-xs text-slate-500
                mt-3
              ">
                <Tag size={14}/>
                {item.category || "Merchandise"}
              </div>


              <div className="
                mt-4 flex items-center justify-between
              ">
                <div className="font-black text-orange-600">
                  Rp {Number(item.price || 0).toLocaleString("id-ID")}
                </div>

                <span className="
                  rounded-full
                  bg-slate-100
                  px-3 py-1
                  text-xs font-bold
                  text-slate-700
                ">
                  Detail
                </span>
              </div>

            </div>

          </button>

        ))}

      </section>


      <OfficialMerchandiseDetailModal
        item={selectedProduct}
        onClose={()=>setSelectedProduct(null)}
      />

    </main>
  );
};

export default OfficialStoreView;
