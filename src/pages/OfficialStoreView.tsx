import React, { useMemo, useState } from "react";
import { Search, ShoppingBag, Star, Tag } from "lucide-react";
import { OFFICIAL_MERCHANDISE_PRODUCTS } from "../data/officialMerchandiseData";

interface OfficialStoreViewProps {
  onSelectProduct?: (item: any) => void;
}

export const OfficialStoreView: React.FC<OfficialStoreViewProps> = ({
  onSelectProduct
}) => {

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return OFFICIAL_MERCHANDISE_PRODUCTS.filter((item: any) =>
      String(item?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);


  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">

      <section
        className="
          rounded-[2rem]
          p-8
          text-white
          bg-gradient-to-br
          from-amber-500
          via-orange-500
          to-red-600
        "
      >
        <div className="flex items-center gap-3">
          <ShoppingBag size={34} />

          <h1 className="text-3xl font-black">
            Official Store Saka Pariwisata
          </h1>
        </div>

        <p className="mt-3 text-white/90 max-w-xl">
          Official Merchandise Saka Pariwisata Nasional.
          Apparel, identitas, dan perlengkapan kegiatan anggota.
        </p>

        <div
          className="
            mt-6
            bg-white
            rounded-2xl
            flex
            items-center
            px-4
            py-3
            text-slate-700
          "
        >
          <Search size={18} />

          <input
            className="ml-3 flex-1 outline-none"
            placeholder="Cari merchandise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </section>


      <section
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-5
        "
      >

        {filtered.map((item: any) => (

          <button
            key={item.id}
            onClick={() => onSelectProduct?.(item)}
            className="
              text-left
              bg-white
              rounded-[2rem]
              overflow-hidden
              border
              border-slate-200
              hover:-translate-y-1
              hover:shadow-xl
              transition
            "
          >

            <div
              className={`
                h-48
                bg-gradient-to-br
                ${item.accentClass || "from-slate-700 to-slate-400"}
                flex
                items-center
                justify-center
              `}
            >

              <ShoppingBag
                size={64}
                className="text-white"
              />

            </div>


            <div className="p-5">

              <h3 className="font-black text-lg">
                {item.name}
              </h3>


              <div
                className="
                  flex
                  items-center
                  gap-1
                  text-amber-500
                  mt-3
                  text-sm
                "
              >
                <Star size={14} fill="currentColor" />
                Produk Official
              </div>


              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  text-slate-500
                  mt-3
                "
              >
                <Tag size={14} />
                {item.category || "Merchandise"}
              </div>


              <div className="mt-4 font-bold text-orange-600">
                Rp {Number(item.price || 0).toLocaleString("id-ID")}
              </div>


            </div>

          </button>

        ))}

      </section>

    </main>
  );
};


export default OfficialStoreView;
