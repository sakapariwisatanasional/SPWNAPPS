import React, { useEffect, useState } from "react";
import { getStoreProducts } from "../services/storeService";

interface OfficialStoreProps {
  products?: any[];
  currentUser?: any;
  members?: any[];
}

export function OfficialStoreView({
  products: fallbackProducts = [],
  currentUser,
  members
}: OfficialStoreProps) {

  const [products, setProducts] = useState<any[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  useEffect(() => {
    loadProducts();
  }, []);


  async function loadProducts() {

    try {

      setLoading(true);

      const data = await getStoreProducts();

      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(fallbackProducts);
      }

      setError(false);

    } catch (err) {

      console.error(
        "[Official Store] Failed loading products",
        err
      );

      setProducts(fallbackProducts);
      setError(true);

    } finally {

      setLoading(false);

    }

  }


  function formatRupiah(value: any) {

    const number = Number(value || 0);

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
      }
    ).format(number);

  }


  function handleImageError(
    e: React.SyntheticEvent<HTMLImageElement>
  ) {

    e.currentTarget.src =
      "/images/store/default-product.png";

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
        <div className="text-gray-500">
          Memuat produk...
        </div>
      )}


      {error && (
        <div className="mb-4 text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
          Data toko online menggunakan data cadangan sementara.
        </div>
      )}


      {!loading && products.length === 0 && (

        <div className="text-gray-500">
          Belum ada produk tersedia.
        </div>

      )}


      <div className="grid md:grid-cols-3 gap-5">

        {products.map((product) => (

          <div
            key={product.ID || product.id}
            className="bg-white rounded-xl shadow p-4"
          >

            <img
              src={
                product["Foto Produk"] ||
                product.image ||
                "/images/store/default-product.png"
              }

              onError={handleImageError}

              className="w-full aspect-square object-cover rounded-lg"

              alt={
                product["Nama Produk"] ||
                product.name ||
                "Produk"
              }

            />


            <h3 className="font-bold mt-3">

              {
                product["Nama Produk"] ||
                product.name ||
                "Produk"
              }

            </h3>


            <p className="text-blue-700 font-semibold mt-2">

              {
                formatRupiah(
                  product.Harga ||
                  product.price
                )
              }

            </p>


            {product.Stok !== undefined && (

              <p className="text-sm text-gray-500 mt-1">
                Stok: {product.Stok}
              </p>

            )}

          </div>

        ))}

      </div>

    </div>

  );

}
