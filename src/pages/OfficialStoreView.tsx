import React, { useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  Star,
  Tag,
  Shirt,
  Compass,
  Package,
  X
} from "lucide-react";

import {
  OFFICIAL_MERCHANDISE_PRODUCTS
} from "../data/officialMerchandise";

import type {
  OfficialMerchandiseProduct
} from "../types";


interface OfficialStoreViewProps {
  onSelectProduct?: (product: OfficialMerchandiseProduct) => void;
}


const iconMap:any = {
  shirt: Shirt,
  jacket: Package,
  cap: Package,
  bottle: Package,
  lanyard: Tag,
  compass: Compass
};


export const OfficialStoreView:React.FC<
  OfficialStoreViewProps
> = ({
  onSelectProduct
}) => {

  const [search,setSearch] = useState("");


  const products = useMemo(()=>{

    return OFFICIAL_MERCHANDISE_PRODUCTS.filter(
      product =>
        product.active &&
        (
          product.name
          .toLowerCase()
          .includes(search.toLowerCase())
          ||
          product.category
          .toLowerCase()
          .includes(search.toLowerCase())
        )
    );

  },[search]);



  return (

    <main className="min-h-screen bg-slate-50 p-6 space-y-8">


      {/* HEADER */}

      <section
        className="
        rounded-[2rem]
        p-8
        text-white
        bg-gradient-to-br
        from-orange-600
        via-orange-500
        to-teal-500
        shadow-xl
        "
      >

        <div className="flex items-center gap-3">

          <ShoppingBag size={40}/>

          <div>

            <h1 className="
              text-4xl
              font-black
            ">
              Official Store
              Saka Pariwisata
            </h1>

            <p className="mt-2">
              Produk resmi,
              merchandise,
              apparel dan identitas
              Saka Pariwisata Nasional.
            </p>

          </div>

        </div>



        <div
          className="
          mt-6
          bg-white
          rounded-2xl
          flex
          items-center
          px-5
          py-3
          "
        >

          <Search
            className="text-slate-400"
          />

          <input
            value={search}
            onChange={
              e=>setSearch(e.target.value)
            }
            placeholder="
              Cari merchandise...
            "
            className="
            ml-3
            flex-1
            outline-none
            text-slate-700
            "
          />

        </div>


      </section>



      {/* PRODUCT GRID */}


      <section>

        <div
          className="
          grid
          md:grid-cols-3
          gap-6
          "
        >

        {
          products.map(product=>{


            const Icon =
              iconMap[
                product.iconName
              ] || Package;


            return (

              <article
                key={product.id}
                className="
                bg-white
                rounded-3xl
                border
                overflow-hidden
                shadow-sm
                hover:shadow-xl
                transition
                "
              >


                <div
                  className={`
                  h-48
                  bg-gradient-to-br
                  ${product.accentClass}
                  flex
                  items-center
                  justify-center
                  text-white
                  `}
                >

                  <Icon size={70}/>

                </div>



                <div
                  className="
                  p-5
                  "
                >

                  <div
                    className="
                    flex
                    justify-between
                    "
                  >

                    <h2
                      className="
                      font-black
                      text-lg
                      "
                    >
                      {product.name}
                    </h2>


                    {
                      product.featured &&
                      <Star
                        className="
                        text-yellow-500
                        fill-yellow-500
                        "
                      />
                    }

                  </div>



                  <p
                    className="
                    text-sm
                    text-slate-500
                    mt-2
                    "
                  >
                    {product.description}
                  </p>



                  <div
                    className="
                    mt-4
                    flex
                    flex-wrap
                    gap-2
                    "
                  >

                  {
                    product.tags?.map(tag=>(

                      <span
                        key={tag}
                        className="
                        text-xs
                        bg-slate-100
                        px-3
                        py-1
                        rounded-full
                        "
                      >
                        {tag}
                      </span>

                    ))
                  }

                  </div>



                  <button
                    onClick={()=>
                      onSelectProduct?.(product)
                    }
                    className="
                    mt-5
                    w-full
                    rounded-xl
                    bg-red-600
                    text-white
                    py-3
                    font-bold
                    hover:bg-red-700
                    "
                  >

                    Detail Produk

                  </button>


                </div>


              </article>

            )

          })
        }


        </div>


      </section>



    </main>

  )

}


export default OfficialStoreView;
