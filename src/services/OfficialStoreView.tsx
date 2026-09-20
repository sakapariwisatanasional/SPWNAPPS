import React, { useEffect, useState } from "react";
import { getStoreProducts } from "../services/storeService";

interface OfficialStoreProps {
  products?: any[];
  currentUser?: any;
  members?: any[];
}

export function OfficialStoreView({
  products: fallbackProducts = [],
}: OfficialStoreProps) {

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadProducts();
  }, []);


  async function loadProducts() {

    try {

      const data = await getStoreProducts();

      if (data && data.length > 0) {

        setProducts(data);

      } else {

        setProducts(fallbackProducts);

      }

    } catch (error) {

      console.error(
        "[Official Store] Load error",
        error
      );

      setProducts(fallbackProducts);

    } finally {

      setLoading(false);

    }

  }



  function formatRupiah(value:any){

    return new Intl.NumberFormat(
      "id-ID",
      {
        style:"currency",
        currency:"IDR",
        maximumFractionDigits:0
      }
    ).format(Number(value || 0));

  }



  return (

    <div className="p-6">

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-blue-900">
          Official Store
        </h1>

        <p className="text-gray-500 mt-2">
          Merchandise resmi Saka Pariwisata
        </p>

      </div>


      {loading && (
        <p className="text-gray-500">
          Memuat produk...
        </p>
      )}



      {!loading && products.length === 0 && (

        <p className="text-gray-500">
          Belum ada produk tersedia.
        </p>

      )}



      <div className="grid md:grid-cols-3 gap-6">

        {products.map((product:any)=>(

          <div
            key={product.id || product.ID}
            className="bg-white rounded-xl shadow overflow-hidden"
          >


            <div className="aspect-square bg-gray-100">

              {product.imageUrl ? (

                <img

                  src={product.imageUrl}

                  className="w-full h-full object-cover"

                  alt={product.name}

                  onError={(e)=>{

                    e.currentTarget.style.display="none";

                  }}

                />

              ) : (

                <div className="w-full h-full flex items-center justify-center text-gray-400">

                  No Image

                </div>

              )}

            </div>



            <div className="p-5">


              <h3 className="font-bold text-lg">

                {product.name}

              </h3>


              <p className="text-sm text-gray-500 mt-1">

                {product.category}

              </p>


              <p className="text-blue-700 font-bold mt-3">

                {formatRupiah(product.price)}

              </p>


              <p className="text-sm text-gray-500 mt-2">

                Stok: {product.stock}

              </p>


            </div>


          </div>

        ))}

      </div>


    </div>

  );

}
