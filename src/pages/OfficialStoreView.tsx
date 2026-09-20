import React, { useEffect, useState } from "react";
import { getOfficialStoreProducts } from "../services/officialStoreService";


interface Props {
  currentUser?: any;
}


function normalizeImageUrl(url:string){

  if(!url) return "";

  if(url.includes("lh3.googleusercontent.com")){
    return url;
  }

  const match = url.match(/\/d\/([^/]+)/);

  if(match){
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }

  return url;

}



export function OfficialStoreView({
  currentUser
}:Props){

  const [products,setProducts] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);


  useEffect(()=>{

    async function load(){

      const data = await getOfficialStoreProducts();

      setProducts(data || []);

      setLoading(false);

    }

    load();

  },[]);



  const rupiah=(value:any)=>{

    return new Intl.NumberFormat(
      "id-ID",
      {
        style:"currency",
        currency:"IDR",
        maximumFractionDigits:0
      }
    ).format(Number(value || 0));

  };


  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold text-blue-900">
        Official Store
      </h1>

      <p className="text-gray-500 mb-6">
        Merchandise resmi Saka Pariwisata
      </p>


      {loading && (
        <p className="text-gray-500">
          Memuat produk...
        </p>
      )}


      {!loading && products.length===0 && (
        <p className="text-gray-500">
          Belum ada merchandise tersedia.
        </p>
      )}



      <div className="grid md:grid-cols-3 gap-6">

        {products.map((product)=>(

          <div
            key={product.id}
            className="bg-white rounded-2xl shadow overflow-hidden"
          >

            <div className="aspect-square bg-gray-100">

              {product.imageUrl ? (

                <img
                  src={normalizeImageUrl(product.imageUrl)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e)=>{
                    e.currentTarget.style.display="none";
                  }}
                />

              ) : (

                <div className="h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>

              )}

            </div>


            <div className="p-5">

              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                Official
              </span>


              <h3 className="font-bold text-lg mt-3">
                {product.name}
              </h3>


              <p className="text-blue-700 font-bold mt-3">
                {rupiah(product.price)}
              </p>


              <p className="text-sm text-gray-500 mt-2">
                Stok tersedia: {product.stock}
              </p>


              <button className="mt-4 w-full rounded-lg bg-blue-900 text-white py-2">
                Detail Produk
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}
