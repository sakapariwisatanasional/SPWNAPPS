import React, {useEffect, useState} from "react";
import {
  getOfficialStoreProducts,
  createOfficialProduct,
  updateOfficialProduct,
  deleteOfficialProduct
} from "../services/officialStoreService";


export function StoreManagementView(){

  const [products,setProducts] = useState<any[]>([]);
  const [form,setForm] = useState<any>({
    namaProduk:"",
    kategori:"APPAREL",
    harga:0,
    stok:0,
    fotoProduk:"",
    status:"ACTIVE"
  });

  const [editing,setEditing] = useState<any>(null);


  async function load(){
    const data = await getOfficialStoreProducts();
    setProducts(data || []);
  }


  useEffect(()=>{
    load();
  },[]);



  function change(e:any){
    setForm({
      ...form,
      [e.target.name]:e.target.value
    });
  }



  async function save(){

    if(editing){
      await updateOfficialProduct({
        ...form,
        id:editing.id
      });
    }else{
      await createOfficialProduct(form);
    }

    setForm({
      namaProduk:"",
      kategori:"APPAREL",
      harga:0,
      stok:0,
      fotoProduk:"",
      status:"ACTIVE"
    });

    setEditing(null);
    load();

  }



  async function remove(id:string){

    if(confirm("Hapus produk ini?")){
      await deleteOfficialProduct(id);
      load();
    }

  }



  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold text-blue-900">
        Official Store Management
      </h1>

      <p className="text-gray-500 mb-6">
        Kelola merchandise resmi Nasional Saka Pariwisata
      </p>


      <div className="bg-white rounded-xl p-5 shadow mb-6">

        <input
          className="border p-2 rounded w-full mb-3"
          name="namaProduk"
          placeholder="Nama Produk"
          value={form.namaProduk}
          onChange={change}
        />


        <input
          className="border p-2 rounded w-full mb-3"
          name="kategori"
          placeholder="Kategori"
          value={form.kategori}
          onChange={change}
        />


        <input
          className="border p-2 rounded w-full mb-3"
          name="harga"
          placeholder="Harga"
          type="number"
          value={form.harga}
          onChange={change}
        />


        <input
          className="border p-2 rounded w-full mb-3"
          name="stok"
          placeholder="Stok"
          type="number"
          value={form.stok}
          onChange={change}
        />


        <input
          className="border p-2 rounded w-full mb-3"
          name="fotoProduk"
          placeholder="Link Google Drive / Image URL"
          value={form.fotoProduk}
          onChange={change}
        />


        <button
          className="bg-blue-900 text-white px-5 py-2 rounded"
          onClick={save}
        >
          Simpan Produk
        </button>

      </div>



      <div className="grid md:grid-cols-3 gap-5">

        {products.map((p:any)=>(

          <div
            key={p.id}
            className="bg-white rounded-xl shadow p-4"
          >

            <h3 className="font-bold">
              {p.name || p.namaProduk}
            </h3>

            <p>
              Rp {Number(p.price || p.harga).toLocaleString("id-ID")}
            </p>

            <p>
              Stok: {p.stock || p.stok}
            </p>


            <div className="flex gap-2 mt-4">

              <button
                className="bg-gray-200 px-3 py-1 rounded"
                onClick={()=>{
                  setEditing(p);
                  setForm({
                    namaProduk:p.name || p.namaProduk,
                    kategori:p.category || p.kategori,
                    harga:p.price || p.harga,
                    stok:p.stock || p.stok,
                    fotoProduk:p.imageUrl || p.fotoProduk,
                    status:p.status
                  });
                }}
              >
                Edit
              </button>


              <button
                className="bg-red-500 text-white px-3 py-1 rounded"
                onClick={()=>remove(p.id)}
              >
                Hapus
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}
