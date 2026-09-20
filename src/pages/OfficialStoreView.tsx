import React,{useEffect,useState} from "react";
import {getStoreProducts} from "../services/storeService";

export function OfficialStoreView(){

 const [products,setProducts]=useState<any[]>([]);

 useEffect(()=>{
   getStoreProducts().then(setProducts);
 },[]);

 return (
 <div className="p-6">
   <h1 className="text-3xl font-bold">
    Official Store
   </h1>

   <div className="grid md:grid-cols-3 gap-5 mt-5">
   {products.map((p)=>(
    <div key={p.ID} className="bg-white rounded-xl shadow p-4">
      <img
       src={p["Foto Produk"] || "/images/store/default-product.png"}
       className="w-full aspect-square object-cover"
      />
      <h3 className="font-bold mt-2">
       {p["Nama Produk"]}
      </h3>
    </div>
   ))}
   </div>
 </div>
 );
}
