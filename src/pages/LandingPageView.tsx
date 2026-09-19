import React from "react";
import {
  ArrowRight,
  Sparkles,
  Map,
  Users,
  CalendarDays,
  MapPin,
  ShoppingBag,
  LogIn
} from "lucide-react";

interface LandingPageViewProps {
  members?: any[];
  tours?: any[];
  culinaryItems?: any[];
  activities?: any[];

  onSelectTab?: (tab: string) => void;

  // compatible with App.tsx
  onEnterDashboard?: (tab?: string) => void;
  onOpenLoginModal?: () => void;
  onOpenRegisterModal?: () => void;

  onSelectCulinaryDetail?: (item:any)=>void;
  onViewTourDetail?: (item:any)=>void;
  onViewActivityDetail?: (item:any)=>void;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80";


export function LandingPageView({
  members=[],
  tours=[],
  culinaryItems=[],
  activities=[],
  onSelectTab,
  onEnterDashboard
}:LandingPageViewProps){

const stats=[
 {
  title:"Anggota",
  value:members.length,
  icon:Users
 },
 {
  title:"Aktivitas",
  value:activities.length,
  icon:CalendarDays
 },
 {
  title:"Destinasi",
  value:tours.length,
  icon:MapPin
 },
 {
  title:"Produk Kreatif",
  value:culinaryItems.length,
  icon:ShoppingBag
 }
];


return(
<main className="min-h-screen bg-slate-50">

<section className="p-6">

<div className="
relative overflow-hidden rounded-[40px]
p-10 md:p-12 text-white
shadow-xl
bg-gradient-to-br from-red-600 via-orange-500 to-teal-500
">

<button
onClick={()=>onEnterDashboard?.("dashboard")}
className="
absolute right-8 top-8
flex items-center gap-2
rounded-full
bg-white/20
border border-white/40
px-6 py-3
font-bold
hover:bg-white
hover:text-slate-900
transition
"
>
<LogIn size={18}/>
Masuk Dashboard
</button>


<div className="relative z-10 max-w-3xl">

<div className="flex items-center gap-2 font-bold">
<Sparkles size={18}/>
SAKA PARIWISATA NASIONAL
</div>


<h1 className="
mt-6 text-5xl
font-black leading-tight
">
Jelajah Nusantara,
<br/>
Berkarya untuk Pariwisata Indonesia
</h1>


<p className="mt-5 text-lg text-white/90">
Platform digital Saka Pariwisata untuk anggota,
destinasi, kegiatan, dan produk kreatif daerah.
</p>


<button
onClick={()=>onSelectTab?.("tours")}
className="
mt-8 bg-white text-slate-900
rounded-full px-7 py-3
font-bold flex items-center gap-2
"
>
Mulai Jelajah
<ArrowRight size={18}/>
</button>

</div>


<div className="
hidden lg:flex absolute right-16 bottom-12
w-72 h-72 rounded-full
bg-white/20 items-center justify-center
">
<Map size={120}/>
</div>

</div>

</section>


<section className="px-6 grid grid-cols-2 xl:grid-cols-4 gap-5">

{stats.map(({title,value,icon:Icon})=>(

<div
key={title}
className="bg-white rounded-3xl border p-6 shadow-sm"
>

<Icon size={32}/>

<div className="text-4xl font-black mt-4">
{value}
</div>

<div className="font-bold">
{title}
</div>

</div>

))}

</section>


<section className="p-6 space-y-10">


<Section title="Wisata Nusantara">

<div className="grid md:grid-cols-2 gap-5">

{tours.slice(0,4).map((item:any)=>
<Card key={item.id} item={item}/>
)}

</div>

</Section>


<Section title="Kuliner & Cinderamata">

<div className="grid md:grid-cols-2 gap-5">

{culinaryItems.slice(0,4).map((item:any)=>
<Card key={item.id} item={item}/>
)}

</div>

</Section>


<Section title="Aktivitas Terbaru">

<div className="grid md:grid-cols-2 gap-5">

{activities.slice(0,4).map((item:any)=>(

<div
key={item.id}
className="bg-white rounded-3xl border p-6"
>

<h3 className="font-black">
{item.title || item.name}
</h3>

<p className="text-slate-500 mt-2">
{item.description}
</p>

</div>

))}

</div>

</Section>


</section>


</main>
)

}


function Section({title,children}:any){

return(
<section>

<h2 className="text-2xl font-black mb-5">
{title}
</h2>

{children}

</section>
)

}


function Card({item}:any){

return(

<div className="
bg-white rounded-3xl
overflow-hidden border
shadow-sm
">

<img
src={item.image || fallbackImage}
className="h-56 w-full object-cover"
onError={(e:any)=>e.currentTarget.src=fallbackImage}
/>

<div className="p-5">

<h3 className="font-black text-xl">
{item.name}
</h3>

<p className="text-teal-600 mt-2">
{item.location || item.region}
</p>

<p className="text-slate-500 mt-2">
{item.description}
</p>

</div>

</div>

)

}


export default LandingPageView;
