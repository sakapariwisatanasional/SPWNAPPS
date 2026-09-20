import React, { useEffect, useState } from "react";
import {
  getOfficialStoreProducts,
  createOfficialProduct,
  updateOfficialProduct,
  deleteOfficialProduct
} from "../../services/officialStoreService";


export function StoreManagementView(){

  const [products,setProducts] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);
  const [editing,setEditing] = useState<any>(null);

  const emptyForm = {
    name:"",
    category:"APPAREL",
    description:"",
    price:"",
    stock:"",
    imageUrl:"",
    status:"ACTIVE"
  };

  const [form,setForm] = useState<any>(emptyForm);


  async function loadProducts(){

    setLoading(true);

    const data = await getOfficialStoreProducts();

    setProducts(data || []);

    setLoading(false);

  }


  useEffect(()=>{
    loadProducts();
  },[]);



  function handleChange(e:any){

    setForm({
      ...form,
      [e.target.name]:e.target.value
    });

  }



  async function saveProduct(){

    const payload = {
      ...form,
      price:Number(form.price),
      stock:Number(form.stock)
    };


    if(editing){

      await updateOfficialProduct({
        id:editing.id,
        ...payload
      });

    }else{

      await createOfficialProduct(payload);

    }


    setEditing(null);
    setForm(emptyForm);

    loadProducts();

  }



  async function removeProduct(id:string){

    if(confirm("Hapus merchandise ini?")){

      await deleteOfficialProduct(id);

      loadProducts();

    }

  }



  function editProduct(product:any){

    setEditing(product);

    setForm({
      name:product.name || "",
      category:product.category || "APPAREL",
      description:product.description || "",
      price:product.price || "",
      stock:product.stock || "",
      imageUrl:product.imageUrl || "",
      status:product.status || "ACTIVE"
    });

  }



  return (

    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold text-blue-900">
            Official Store Management
          </h1>

          <p className="text-gray-500">
            Kelola merchandise resmi Nasional Saka Pariwisata
          </p>
        </div>


        <button
          className="bg-blue-900 text-white px-5 py-3 rounded-xl"
          onClick={()=>{
            setEditing(null);
            setForm(emptyForm);
          }}
        >
          + Tambah Merchandise
        </button>

      </div>



      <div className="bg-white rounded-2xl shadow p-6 mb-8">

        <h2 className="font-bold text-xl mb-4">
          {editing ? "Edit Produk" : "Tambah Produk"}
        </h2>


        <div className="grid md:grid-cols-2 gap-4">


          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nama Produk"
            className="border rounded-lg p-3"
          />


          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Kategori"
            className="border rounded-lg p-3"
          />


          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Harga"
            className="border rounded-lg p-3"
          />


          <input
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stok"
            className="border rounded-lg p-3"
          />


          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="Link gambar Google Drive"
            className="border rounded-lg p-3 md:col-span-2"
          />


          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Deskripsi produk"
            className="border rounded-lg p-3 md:col-span-2"
          />

        </div>


        <button
          onClick={saveProduct}
          className="mt-5 bg-green-600 text-white px-6 py-3 rounded-xl"
        >
          Simpan Produk
        </button>

      </div>




      <div className="grid md:grid-cols-3 gap-6">


        {loading && (
          <p>Memuat produk...</p>
        )}



        {products.map((product)=>(

          <div
            key={product.id}
            className="bg-white rounded-2xl shadow overflow-hidden"
          >

            <div className="h-48 bg-gray-100">

              {product.imageUrl ? (

                <img
                  src={product.imageUrl}
                  className="w-full h-full object-cover"
                />

              ) : (

                <div className="h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>

              )}

            </div>


            <div className="p-5">

              <h3 className="font-bold">
                {product.name}
              </h3>


              <p>
                Rp {product.price.toLocaleString("id-ID")}
              </p>


              <p className="text-gray-500">
                Stok: {product.stock}
              </p>


              <div className="flex gap-2 mt-4">

                <button
                  onClick={()=>editProduct(product)}
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                >
                  Edit
                </button>


                <button
                  onClick={()=>removeProduct(product.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Hapus
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}
