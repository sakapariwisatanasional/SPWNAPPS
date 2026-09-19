import React from "react";
import {
  Users,
  CalendarDays,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Map
} from "lucide-react";

interface LandingPageViewProps {
  members?: any[];
  tours?: any[];
  culinaryItems?: any[];
  activities?: any[];
  onSelectTab?: (tab: string) => void;
}

const FALLBACK = {
  tourism:
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
  culinary:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
  craft:
    "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1200&q=80"
};

export function LandingPageView({
  members = [],
  tours = [],
  culinaryItems = [],
  activities = [],
  onSelectTab
}: LandingPageViewProps) {

  const stats = [
    {
      title: "Anggota",
      value: members.length,
      info: "Aktif Nasional",
      icon: Users
    },
    {
      title: "Aktivitas",
      value: activities.length,
      info: "Kegiatan Terbaru",
      icon: CalendarDays
    },
    {
      title: "Destinasi",
      value: tours.length,
      info: "Wisata Nusantara",
      icon: MapPin
    },
    {
      title: "Produk Kreatif",
      value: culinaryItems.length,
      info: "Kuliner & Kriya",
      icon: ShoppingBag
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50">

      <section className="p-6">
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-red-600 via-orange-500 to-teal-500 p-10 text-white shadow-xl">

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles size={18}/>
              SAKA PARIWISATA NASIONAL
            </div>

            <h1 className="mt-6 text-5xl font-black leading-tight">
              Jelajah Nusantara,
              <br/>
              Berkarya untuk Pariwisata Indonesia
            </h1>

            <p className="mt-5 text-lg text-white/90">
              Platform digital Saka Pariwisata untuk anggota,
              kegiatan, destinasi wisata, serta produk kreatif daerah.
            </p>

            <button
              onClick={()=>onSelectTab?.("tours")}
              className="mt-8 rounded-full bg-white px-7 py-3 text-slate-900 font-bold flex items-center gap-2"
            >
              Mulai Jelajah <ArrowRight size={18}/>
            </button>
          </div>

          <div className="hidden lg:flex absolute right-12 top-12">
            <div className="w-72 h-72 rounded-full bg-white/20 backdrop-blur items-center justify-center flex">
              <Map size={120}/>
            </div>
          </div>

        </div>
      </section>


      <section className="px-6 grid grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map(({title,value,info,icon:Icon})=>(
          <div key={title}
            className="bg-white rounded-3xl border p-6 shadow-sm hover:shadow-lg transition">
            <Icon size={34}/>
            <div className="mt-4 text-4xl font-black">{value}</div>
            <div className="font-bold text-lg">{title}</div>
            <div className="text-slate-500 text-sm">{info}</div>
          </div>
        ))}
      </section>


      <section className="p-6 space-y-12">

        <ContentSection
          title="Wisata Nusantara"
          icon={<MapPin/>}
          items={tours}
          type="tourism"
        />

        <ContentSection
          title="Kuliner & Cinderamata"
          icon={<ShoppingBag/>}
          items={culinaryItems}
          type="culinary"
        />

        <ActivitySection activities={activities}/>

      </section>

    </main>
  );
}


function ContentSection({title,icon,items,type}:any){

return (
<section>

<h2 className="text-3xl font-black flex items-center gap-3 mb-6">
{icon}
{title}
</h2>

<div className="grid lg:grid-cols-3 gap-6">
{items.map((item:any)=>(
<LargeCard key={item.id} item={item} type={type}/>
))}
</div>

</section>
)

}


function LargeCard({item,type}:any){

const image =
item.image ||
(type==="tourism" ? FALLBACK.tourism : FALLBACK.culinary);

return (
<div className="bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-xl transition">

<img
src={image}
alt={item.name}
className="h-64 w-full object-cover"
onError={(e)=>e.currentTarget.src=FALLBACK.tourism}
/>

<div className="p-6">

<h3 className="text-2xl font-black">
{item.name}
</h3>

<div className="mt-2 text-teal-600">
{item.location || item.region}
</div>

<p className="mt-3 text-slate-500">
{item.description}
</p>

<button className="mt-5 flex gap-2 font-bold text-sm">
Lihat Detail <ArrowRight size={16}/>
</button>

</div>

</div>
)

}


function ActivitySection({activities}:any){

return (
<section>

<h2 className="text-3xl font-black flex items-center gap-3 mb-6">
<CalendarDays/>
Aktivitas Terbaru
</h2>

<div className="grid lg:grid-cols-2 gap-5">

{activities.map((item:any)=>(
<div
key={item.id}
className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-lg transition"
>

<h3 className="font-black text-xl">
{item.title}
</h3>

<p className="mt-2 text-slate-500">
{item.description}
</p>

<button className="mt-4 flex gap-2 text-sm font-bold">
Lihat Detail <ArrowRight size={15}/>
</button>

</div>
))}

</div>

</section>
)

}

export default LandingPageView;
