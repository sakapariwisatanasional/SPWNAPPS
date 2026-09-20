/**
 * SPWNAPP OFFICIAL STORE MANAGEMENT
 *
 * ADMIN PANEL
 *
 * CRUD:
 * - CREATE PRODUCT
 * - UPDATE PRODUCT
 * - DELETE PRODUCT
 */


import React,
{
useEffect,
useState
}
from "react";


import {

getStoreProducts,

deleteStoreProduct,

StoreProduct

}

from "../../services/storeService";




interface Props {

onNavigate?:
(path:string)=>void;

}





export default function StoreManagementView(
{
onNavigate
}:Props
){



const [

products,

setProducts

]

=

useState<StoreProduct[]>([]);




const [

loading,

setLoading

]

=

useState(false);









useEffect(()=>{

loadProducts();

},[]);








async function loadProducts(){


setLoading(true);


const data =
await getStoreProducts();



setProducts(data);


setLoading(false);


}









async function handleDelete(
id:string
){



const confirmDelete =
window.confirm(

"Apakah produk ini akan dihapus?"

);



if(!confirmDelete)
return;





const result =
await deleteStoreProduct(id);





if(result.success){


alert(
"Produk berhasil dihapus"
);


loadProducts();


}

else{


alert(
"Gagal menghapus produk"
);


}


}









function rupiah(
value:number
){


return new Intl.NumberFormat(
"id-ID",
{

style:"currency",

currency:"IDR",

maximumFractionDigits:0

}

).format(value);


}









return (

<div

className="
p-6
w-full
"

>





{/* HEADER */}

<div
className="
flex
justify-between
items-center
mb-8
"
>


<div>


<h1

className="
text-3xl
font-bold
text-blue-900
"

>

Official Store Manager

</h1>


<p
className="
text-gray-500
"

>

Kelola merchandise
Saka Pariwisata

</p>


</div>







<button


onClick={()=>{

onNavigate &&
onNavigate(
"/admin/store/add"
)

}}


className="
bg-blue-700
text-white
px-5
py-3
rounded-xl
font-semibold
"

>


+ Tambah Produk


</button>



</div>









{/* ACTION */}

<div

className="
mb-6
"

>


<button

onClick={
loadProducts
}


className="
px-4
py-2
rounded-lg
bg-gray-100
"

>

↻ Refresh Data

</button>


</div>









{

loading &&


<div>

Memuat data...

</div>


}









{/* TABLE */}


<div

className="
bg-white
rounded-2xl
shadow
overflow-hidden
"

>


<table

className="
w-full
"

>


<thead

className="
bg-blue-50
"

>


<tr>


<th
className="
p-4
text-left
"

>
Foto
</th>


<th
className="
p-4
text-left
"

>
Produk
</th>


<th
className="
p-4
"

>
Harga
</th>



<th
className="
p-4
"

>
Stok
</th>



<th
className="
p-4
"

>
Status
</th>


<th
className="
p-4
"

>
Aksi
</th>



</tr>


</thead>








<tbody>


{

products.map(

(product)=>(


<tr

key={
product.ID
}

className="
border-b
"

>







<td
className="
p-4
"

>


<img

src={

product["Foto Produk"]

||

"/images/store/default-product.png"

}


className="
w-16
h-16
rounded-lg
object-cover
"

onError={(e)=>{

e.currentTarget.src =
"/images/store/default-product.png";

}}

 />



</td>









<td

className="
p-4
"

>


<div
className="
font-semibold
"

>

{
product["Nama Produk"]
}

</div>


<div
className="
text-sm
text-gray-500
"

>

{
product.Kategori
}

</div>


</td>








<td
className="
p-4
font-semibold
"

>


{

rupiah(
Number(
product.Harga
)

)

}


</td>







<td
className="
p-4
text-center
"

>

{
product.Stok
}


</td>







<td
className="
p-4
text-center
"

>


<span

className={

`

px-3
py-1
rounded-full
text-xs

${

product.Status==="Aktif"

?

"bg-green-100 text-green-700"

:

"bg-gray-100 text-gray-600"

}

`

}

>

{
product.Status
}

</span>


</td>







<td
className="
p-4
"

>


<div
className="
flex
gap-2
"

>


<button

onClick={()=>{


onNavigate &&
onNavigate(
"/admin/store/edit/"+product.ID
)


}}


className="
px-3
py-2
rounded-lg
bg-yellow-100
"

>

Edit

</button>







<button


onClick={()=>{

handleDelete(
product.ID!

)

}}


className="
px-3
py-2
rounded-lg
bg-red-100
text-red-700
"

>

Hapus

</button>


</div>


</td>








</tr>


)

)

}


</tbody>




</table>


</div>







</div>

);


}