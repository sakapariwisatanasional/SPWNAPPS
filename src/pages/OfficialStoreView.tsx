import React, { useEffect, useMemo, useState } from "react";
import { Search, ShoppingBag, Star, Tag, CheckCircle2 } from "lucide-react";
import { OFFICIAL_MERCHANDISE_PRODUCTS } from "../data/officialMerchandiseData";
import { spreadsheetService } from "../services/spreadsheetService";
import { OfficialMerchandiseDetailModal } from "../components/store/OfficialMerchandiseDetailModal";


const normalizeImageUrl = (raw: unknown): string => {
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value) return "";
  if (value.startsWith("data:image/") || value.startsWith("blob:") || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
    const idMatch = value.match(/(?:\/file\/d\/|[?&]id=|\/d\/)([a-zA-Z0-9_-]{10,})/);
    if (idMatch?.[1] && value.includes("drive.google.com")) return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    return value;
  }
  const idMatch = value.match(/^[a-zA-Z0-9_-]{10,}$/);
  return idMatch?.[0] ? `https://lh3.googleusercontent.com/d/${idMatch[0]}` : value;
};

const firstImage = (...values: unknown[]): string => {
  for (const value of values) {
    const normalized = normalizeImageUrl(value);
    if (normalized) return normalized;
  }
  return "";
};

interface OfficialStoreViewProps {
  onSelectProduct?: (item: any) => void;
  [key: string]: any;
}

export const OfficialStoreView: React.FC<OfficialStoreViewProps> = ({
  onSelectProduct
}) => {

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>(OFFICIAL_MERCHANDISE_PRODUCTS);


  useEffect(() => {
    loadOfficialStore();
  }, []);

  const loadOfficialStore = async () => {
    try {
      const rows = await spreadsheetService.fetchSheetRows("Official_Store");

      if (Array.isArray(rows) && rows.length > 0) {
        const mapped = rows.map((item:any)=>({
          id: item.ID,
          name: item["Nama Produk"],
          category: item.Kategori,
          description: item.Deskripsi,
          price: item.Harga,
          material: item.Material,
          imageUrl: firstImage(item["Foto Produk"], item.image, item.thumbnail, item["Image URL"]),
          image: firstImage(item["Foto Produk"], item.image, item.thumbnail, item["Image URL"]),
          gallery: String(item.Gallery || "")
            .split(/[,|\n]+/)
            .map((value: string) => normalizeImageUrl(value))
            .filter(Boolean),
          stock: item.Stok,
          featured: item.Featured === true || item.Featured === "TRUE",
          purchaseEnabled: item.Status === "ACTIVE",
          accentClass: "from-emerald-700 to-teal-400"
        }));

        setProducts(mapped);
      }
    } catch(error) {
      console.warn("Official Store memakai fallback lokal:", error);
    }
  };


  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase();

    return products.filter((item:any) =>
      String(item?.name || "")
        .toLowerCase()
        .includes(keyword)
    );

  }, [search, products]);


  const handleSelectProduct = (item:any) => {
    setSelectedProduct(item);
    onSelectProduct?.(item);
  };


  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };


  return (
    <main className="
      min-h-screen
      bg-slate-50
      p-4 md:p-8
      space-y-6
    ">


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

            <h1 className="
              text-3xl md:text-4xl
              font-black
            ">
              Official Store Saka Pariwisata
            </h1>

            <p className="mt-2 text-white/90">
              Official merchandise Saka Pariwisata Nasional.
              Apparel, identitas, dan perlengkapan kegiatan anggota.
            </p>

          </div>

        </div>


        <div className="
          mt-6
          flex items-center
          rounded-2xl
          bg-white
          px-4 py-3
          text-slate-700
        ">

          <Search size={18}/>

          <input
            className="
              ml-3
              flex-1
              outline-none
            "
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
            key={item?.id}
            onClick={()=>handleSelectProduct(item)}
            className="
              overflow-hidden
              rounded-[2rem]
              border
              border-slate-200
              bg-white
              text-left
              shadow-sm
              transition-all
              hover:-translate-y-2
              hover:shadow-2xl
            "
          >

            <div className={`
              relative
              flex
              h-56
              items-center
              justify-center
              overflow-hidden
              bg-gradient-to-br
              ${item?.accentClass || "from-emerald-700 to-teal-400"}
            `}>

              {firstImage(item?.imageUrl, item?.image, item?.thumbnail) ? (

                <img
                  src={firstImage(item?.imageUrl, item?.image, item?.thumbnail)}
                  alt={item?.name || "Produk"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/saka_logo.png";
                    e.currentTarget.className = "h-32 w-32 object-contain";
                  }}
                  className="h-full w-full object-cover"
                />

              ) : (

                <ShoppingBag
                  size={72}
                  className="text-white/90"
                />

              )}

            </div>


            <div className="p-5">

              <div className="mb-3 flex flex-wrap gap-2">

                {item?.featured && (
                  <span className="
                    rounded-full
                    bg-amber-100
                    px-3 py-1
                    text-xs
                    font-bold
                    text-amber-700
                  ">
                    Featured
                  </span>
                )}


                <span className="
                  rounded-full
                  bg-emerald-100
                  px-3 py-1
                  text-xs
                  font-bold
                  text-emerald-700
                ">
                  Official
                </span>


                {item?.purchaseEnabled && (
                  <span className="
                    flex items-center gap-1
                    rounded-full
                    bg-green-100
                    px-3 py-1
                    text-xs
                    font-bold
                    text-green-700
                  ">
                    <CheckCircle2 size={12}/>
                    Ready Stock
                  </span>
                )}

              </div>



              <h3 className="
                min-h-[3.5rem]
                line-clamp-2
                text-lg
                font-black
              ">
                {item?.name || "Produk Merchandise"}
              </h3>



              <div className="
                mt-3
                flex items-center gap-1
                text-sm
                text-amber-500
              ">
                <Star size={14} fill="currentColor"/>
                Merchandise Resmi
              </div>



              <div className="
                mt-3
                flex items-center gap-2
                text-xs
                text-slate-500
              ">
                <Tag size={14}/>
                {item?.category || "Merchandise"}
              </div>



              <div className="
                mt-4
                flex
                items-center
                justify-between
              ">

                <span className="
                  font-black
                  text-orange-600
                ">
                  Rp {Number(item?.price || 0).toLocaleString("id-ID")}
                </span>


                <span className="
                  rounded-full
                  bg-slate-100
                  px-3 py-1
                  text-xs
                  font-bold
                  text-slate-700
                ">
                  Detail
                </span>

              </div>

            </div>


          </button>

        ))}

      </section>


      {selectedProduct && (

        <OfficialMerchandiseDetailModal
          item={selectedProduct}
          onClose={handleCloseDetail}
        />

      )}


    </main>
  );
};


export default OfficialStoreView;
