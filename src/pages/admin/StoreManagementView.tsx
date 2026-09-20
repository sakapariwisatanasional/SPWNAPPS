// StoreManagementView_FINAL.tsx
// Dashboard Admin Official Store Nasional

import React,{useEffect,useState} from "react";
import {
 getOfficialStoreProducts,
 createOfficialProduct,
 updateOfficialProduct,
 deleteOfficialProduct
} from "../../services/officialStoreService";


export function StoreManagementView(){

 const empty={
  name:"",
  sku:"",
  category:"APPAREL",
  description:"",
  price:"",
  stock:"",
  imageUrl:"",
  active:true
 };


 const [form,setForm]=useState<any>(empty);
 const [products,setProducts]=useState<any[]>([]);
 const [loading,setLoading]=useState(false);


 async function load(){
  const data=await getOfficialStoreProducts();
  setProducts(data);
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

  if(!form.name){
   alert("Nama produk wajib diisi");
   return;
  }

  setLoading(true);

  await createOfficialProduct({
   ...form,
   price:Number(form.price),
   stock:Number(form.stock),
   active:true
  });

  setForm(empty);

  await load();

  setLoading(false);

  alert("Produk tersimpan");

 }


 return <div className="p-6">

  <h1 className="text-2xl font-bold">
   Official Store Management
  </h1>


  <div className="bg-white rounded-xl shadow p-5 mt-5">

   <input name="name"
    value={form.name}
    onChange={change}
    placeholder="Nama Produk"
    className="border p-2 w-full mb-3"/>


   <input name="sku"
    value={form.sku}
    onChange={change}
    placeholder="SKU"
    className="border p-2 w-full mb-3"/>


   <input name="category"
    value={form.category}
    onChange={change}
    placeholder="Kategori"
    className="border p-2 w-full mb-3"/>


   <input name="price"
    value={form.price}
    onChange={change}
    placeholder="Harga"
    className="border p-2 w-full mb-3"/>


   <input name="stock"
    value={form.stock}
    onChange={change}
    placeholder="Stok"
    className="border p-2 w-full mb-3"/>


   <input name="imageUrl"
    value={form.imageUrl}
    onChange={change}
    placeholder="URL Gambar"
    className="border p-2 w-full mb-3"/>


   <button
    type="button"
    onClick={save}
    disabled={loading}
    className="bg-blue-700 text-white px-5 py-3 rounded-lg">
    {loading?"Menyimpan":"Simpan Produk"}
   </button>


  </div>

 </div>;

}
