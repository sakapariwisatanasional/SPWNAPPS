/**
 * SPWNAPP OFFICIAL STORE
 * Dynamic Store View
 *
 * Data source:
 * Google Spreadsheet
 * via Apps Script API
 */


import React,
{
useEffect,
useState
}
from "react";


import {
getStoreProducts,
StoreProduct
}
from "../services/storeService";



interface Props {

onNavigate?:
(path:string)=>void;

}





export default function OfficialStoreView(
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
useState(true);



const [
category,
setCategory
]
=
useState("ALL");






useEffect(()=>{


loadProducts();


},[]);







async function loadProducts(){


setLoading(true);



const data =
await getStoreProducts();



const active =
data.filter(
(item)=>
item.Status !== "Nonaktif"
);



setProducts(active);



setLoading(false);


}








function formatRupiah(
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








function imageFallback(
e:any
){


e.currentTarget.src =
"/images/store/default-product.png";


}









const categories =
[

"ALL",

...Array.from(

new Set(

products.map(
p=>p.Kategori
)

)

)

];









const filteredProducts =
category==="ALL"

?

products

:

products.filter(

p=>

p.Kategori===category

);








return (

<div
className="
w-full
min-h-screen
bg-slate-50
p-6
"
>


{/* HEADER */}

<div
className="
mb-8
"
>


<h1
className="
text-3xl
font-bold
text-blue-900
"
>

Official Store

</h1>


<p
className="
text-gray-500
mt-2
"
>

Merchandise resmi
Saka Pariwisata

</p>


</div>








{/* CATEGORY FILTER */}

<div
className="
flex
gap-3
mb-8
flex-wrap
"
>


{

categories.map(

(cat)=>(


<button

key={cat}

onClick={()=>setCategory(cat)}

className={

`

px-4
py-2
rounded-full
border

${
category===cat

?

"bg-blue-700 text-white"

:

"bg-white"

}

`

}

>

{cat}

</button>


)

)

}


</div>








{/* LOADING */}

{

loading &&

<div
className="
text-center
py-20
"
>

Memuat produk...

</div>

}









{/* EMPTY */}

{

!loading &&
filteredProducts.length===0 &&


<div
className="
text-center
py-20
text-gray-500
"
>


Belum ada produk tersedia.


</div>

}









{/* PRODUCT GRID */}

<div
className="
grid
grid-cols-1
sm:grid-cols-2
lg:grid-cols-4
gap-6
"
>


{

filteredProducts.map(

(product)=>(


<div

key={
product.ID
}

className="
bg-white
rounded-2xl
shadow
overflow-hidden
hover:shadow-lg
transition
"

>


{/* IMAGE */}

<div
className="
aspect-square
bg-gray-100
"
>


<img


src={

product["Foto Produk"]

||

"/images/store/default-product.png"

}


onError={
imageFallback
}


className="
w-full
h-full
object-cover
"

alt={
product["Nama Produk"]
}

/>


</div>







{/* CONTENT */}


<div
className="
p-5
"
>


<h3
className="
font-bold
text-lg
"
>

{
product["Nama Produk"]
}

</h3>





<p
className="
text-sm
text-gray-500
mt-2
line-clamp-2
"
>

{
product.Deskripsi
}

</p>







<div
className="
mt-4
font-bold
text-blue-700
"
>


{
formatRupiah(
Number(
product.Harga
)

)

}


</div>







<div
className="
mt-2
text-sm
"
>


Stok:

<span
className="
font-semibold
"
>

{
product.Stok
}

</span>


</div>







{

product.Featured &&


<span
className="
inline-block
mt-3
px-3
py-1
rounded-full
text-xs
bg-yellow-100
text-yellow-700
"
>

⭐ Featured

</span>


}






</div>



</div>


)

)


}


</div>







</div>


);


}
