import React from "react";
import {
  Sparkles,
  Users,
  CalendarDays,
  MapPin,
  ShoppingBag,
  LogIn,
  UserPlus,
  ArrowRight
} from "lucide-react";

interface LandingPageViewProps {
  members?: any[];
  tours?: any[];
  culinaryItems?: any[];
  activities?: any[];

  onSelectTab?: (tab:string)=>void;
  onEnterDashboard?: (tab?:string)=>void;
  onOpenLoginModal?: ()=>void;
  onOpenRegisterModal?: ()=>void;
}


export function LandingPageView({
  members=[],
  tours=[],
  culinaryItems=[],
  activities=[],
  onSelectTab,
  onOpenLoginModal,
  onOpenRegisterModal
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

<header className="
sticky top-0 z-20
bg-white/80 backdrop-blur
border-b px-6 py-4
flex justify-between items-center
">

<div className="flex items-center gap-3">
<img
src="/saka_logo.png"
className="w-12 h-12 object-contain"
/>

<div>
<h2 className="font-black text-blue-900">
SAKA PARIWISATA
</h2>
<p className="text-xs text-slate-500">
Platform Digital Nasional
</p>
</div>
</div>


<div className="flex gap-3">

<button
onClick={onOpenLoginModal}
className="
hidden md:flex items-center gap-2
px-5 py-2 rounded-full
border border-blue-700
text-blue-700 font-bold
hover:bg-blue-700 hover:text-white
transition
">
<LogIn size={17}/>
Masuk
</button>


<button
onClick={onOpenRegisterModal}
className="
flex items-center gap-2
px-5 py-2 rounded-full
bg-blue-700 text-white
font-bold
hover:bg-blue-800
transition
">
<UserPlus size={17}/>
Daftar
</button>

</div>

</header>


<section className="p-6">

<div className="
relative overflow-hidden
rounded-[40px]
min-h-[520px]
p-8 md:p-14
text-white
shadow-2xl
bg-gradient-to-br
from-blue-900 via-blue-700 to-cyan-500
">

<div className="
absolute inset-0
bg-[url('/hero-gatara-borobudur.png')]
bg-cover bg-center
opacity-25
">
</div>


<div className="relative z-10 max-w-3xl">

<div className="flex gap-2 items-center font-bold">
<Sparkles size={20}/>
SAKA PARIWISATA NASIONAL
</div>


<h1 className="
mt-6 text-4xl md:text-6xl
font-black leading-tight
">
Membangun Generasi Muda
Penggerak Pariwisata Indonesia
</h1>


<p className="
mt-6 text-lg md:text-xl
text-white/90
">
Platform digital untuk keanggotaan,
aktivitas, pembelajaran, destinasi,
dan karya kreatif Saka Pariwisata.
</p>


<div className="mt-8 flex flex-wrap gap-4">

<button
onClick={onOpenLoginModal}
className="
bg-white text-blue-900
px-7 py-3 rounded-full
font-black flex items-center gap-2
">
<LogIn size={18}/>
Masuk Aplikasi
</button>


<button
onClick={onOpenRegisterModal}
className="
bg-white/20 border border-white/40
px-7 py-3 rounded-full
font-black flex items-center gap-2
">
<UserPlus size={18}/>
Daftar Anggota
</button>

</div>

</div>

</div>

</section>


<section className="
px-6 grid grid-cols-2 xl:grid-cols-4 gap-5
">

{stats.map((item:any)=>{

const Icon=item.icon;

return(
<div
key={item.title}
className="
bg-white rounded-3xl
p-6 shadow-sm border
">

<Icon className="text-blue-700"/>

<div className="text-4xl font-black mt-4">
{item.value}
</div>

<div className="font-bold text-slate-600">
{item.title}
</div>

</div>
)

})}

</section>


<section className="p-6 mt-8">

<div className="
bg-white rounded-3xl
p-8 border shadow-sm
">

<h2 className="text-2xl font-black text-blue-900">
Eksplorasi SPWNAPP
</h2>

<div className="
grid md:grid-cols-3 gap-5 mt-6
">

<Card
title="Keanggotaan"
text="Kelola perjalanan anggota Saka Pariwisata."
/>

<Card
title="Kegiatan"
text="Ikuti aktivitas dan program pariwisata."
/>

<Card
title="Ekosistem Kreatif"
text="Kenali karya dan potensi daerah."
/>

</div>

</div>

</section>

</main>
)

}


function Card({
title,
text
}:{
title:string,
text:string
}){

return(
<div className="
rounded-2xl
bg-slate-50
p-5
">

<h3 className="font-black text-blue-900">
{title}
</h3>

<p className="text-slate-600 mt-2">
{text}
</p>

<ArrowRight
size={18}
className="mt-4 text-blue-700"
/>

</div>
)

}
