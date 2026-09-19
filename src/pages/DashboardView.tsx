import React from "react";
import {
  Users,
  CalendarDays,
  MapPin,
  ShoppingBag,
  Compass,
  Megaphone,
  PartyPopper,
  Utensils,
  ArrowRight
} from "lucide-react";

import { CulinarySouvenirGallerySection } from "../components/dashboard/CulinarySouvenirGallerySection";

export interface DashboardViewProps {
  currentUser?: any;
  members?: any[];
  activities?: any[];
  tours?: any[];
  culinaryItems?: any[];
  onSelectTab?: (view:string)=>void;
  onSelectCulinaryDetail?: (item:any)=>void;
  [key:string]:any;
}

const krida = [
 {
  title:"Krida Pemandu",
  desc:"Pengembangan kemampuan pemandu wisata",
  icon:Compass,
  color:"text-red-600 bg-red-50"
 },
 {
  title:"Krida Penyuluh",
  desc:"Edukasi dan promosi pariwisata",
  icon:Megaphone,
  color:"text-teal-600 bg-teal-50"
 },
 {
  title:"MICE & Event",
  desc:"Manajemen kegiatan dan event",
  icon:PartyPopper,
  color:"text-purple-600 bg-purple-50"
 },
 {
  title:"Kuliner & Cinderamata",
  desc:"Produk kreatif Nusantara",
  icon:Utensils,
  color:"text-amber-600 bg-amber-50"
 }
];

export const DashboardView:React.FC<DashboardViewProps> = ({
 currentUser,
 members=[],
 activities=[],
 tours=[],
 culinaryItems=[],
 onSelectTab,
 onSelectCulinaryDetail
})=>{

const stats=[
 {title:"Anggota Aktif",value:members.length,icon:Users,desc:"Nasional"},
 {title:"Aktivitas",value:activities.length,icon:CalendarDays,desc:"Kegiatan terbaru"},
 {title:"Destinasi",value:tours.length,icon:MapPin,desc:"Wisata Nusantara"},
 {title:"Produk Kreatif",value:culinaryItems.length,icon:ShoppingBag,desc:"Kuliner & Kriya"}
];

return(
<main className="min-h-screen bg-slate-50 space-y-8">

<section className="rounded-[2rem] p-8 md:p-10 text-white bg-gradient-to-br from-red-600 via-orange-500 to-teal-500 shadow-xl">
<p className="font-bold">SAKA PARIWISATA NASIONAL</p>

<h1 className="text-4xl md:text-5xl font-black mt-3">
Selamat Datang,
<br/>
{currentUser?.name || "Administrator"} 👋
</h1>

<div className="mt-4 flex gap-3 flex-wrap">
<span className="bg-white/20 px-4 py-2 rounded-full font-bold">
{currentUser?.role || "ADMIN"}
</span>
<span className="bg-white/20 px-4 py-2 rounded-full">
Wilayah Nasional
</span>
</div>

<p className="mt-5 text-white/90">
Kelola anggota, destinasi, aktivitas, dan produk kreatif Nusantara.
</p>
</section>


<section className="grid grid-cols-2 xl:grid-cols-4 gap-5">
{stats.map(({title,value,icon:Icon,desc})=>(
<div key={title}
className="bg-white rounded-3xl border p-6 shadow-sm hover:shadow-lg transition">

<Icon size={32}/>

<div className="text-4xl font-black mt-4">
{value}
</div>

<div className="font-bold">
{title}
</div>

<div className="text-sm text-slate-500">
{desc}
</div>

</div>
))}
</section>


<section>
<h2 className="text-2xl font-black mb-5">
Quick Krida
</h2>

<div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

{krida.map(({title,desc,icon:Icon,color})=>(
<button
key={title}
onClick={()=>onSelectTab?.("krida-modules")}
className="bg-white rounded-3xl border p-6 text-left hover:shadow-xl transition">

<div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
<Icon/>
</div>

<h3 className="font-black mt-5">
{title}
</h3>

<p className="text-sm text-slate-500 mt-2">
{desc}
</p>

</button>
))}

</div>
</section>


<section>
<h2 className="text-2xl font-black mb-5">
Destinasi Unggulan
</h2>

<div className="grid md:grid-cols-2 gap-6">

{tours.slice(0,2).map((item:any)=>(
<div key={item.id}
className="bg-white rounded-3xl overflow-hidden border shadow-sm">

{item.image && (
<img
src={item.image}
className="h-56 w-full object-cover"
/>
)}

<div className="p-5">

<h3 className="font-black text-xl">
{item.name}
</h3>

<p className="text-teal-600">
{item.location}
</p>

<p className="text-slate-500 mt-2">
{item.description}
</p>

</div>
</div>
))}

</div>
</section>


<section className="bg-white rounded-[2rem] border p-6">

<h2 className="text-2xl font-black">
Aktivitas Terbaru
</h2>

<div className="grid md:grid-cols-2 gap-4 mt-5">

{activities.slice(0,4).map((item:any)=>(
<div key={item.id}
className="bg-slate-50 rounded-2xl p-5">

<h3 className="font-black">
{item.title || item.name}
</h3>

<p className="text-slate-500 mt-2">
{item.description}
</p>

<button className="mt-3 text-sm font-bold flex gap-2">
Detail <ArrowRight size={15}/>
</button>

</div>
))}

</div>

</section>


<section>

<h2 className="text-2xl font-black mb-5">
Kuliner & Cinderamata Nusantara
</h2>

<CulinarySouvenirGallerySection
items={culinaryItems}
currentUser={currentUser}
members={members}
onSelectItemDetail={onSelectCulinaryDetail}
/>

</section>


</main>
)
};

export default DashboardView;
