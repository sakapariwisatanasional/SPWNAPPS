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
    {title:"Anggota", value:members.length, icon:Users, info:"Aktif Nasional"},
    {title:"Aktivitas", value:activities.length, icon:CalendarDays, info:"Kegiatan Terbaru"},
    {title:"Destinasi", value:tours.length, icon:MapPin, info:"Wisata Nusantara"},
    {title:"Produk Kreatif", value:culinaryItems.length, icon:ShoppingBag, info:"Kuliner & Kriya"}
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

            <p className="mt-5 text-white/90 text-lg">
              Platform digital Saka Pariwisata untuk anggota,
              kegiatan, destinasi wisata, serta produk kreatif daerah.
            </p>

            <button
              onClick={()=>onSelectTab?.("tours")}
              className="mt-8 rounded-full bg-white px-7 py-3 text-slate-900 font-bold flex gap-2 items-center"
            >
              Mulai Jelajah <ArrowRight size={18}/>
            </button>
          </div>

          <div className="absolute right-10 top-10 hidden lg:block">
            <div className="h-72 w-72 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Map size={120}/>
            </div>

            <div className="absolute left-0 bottom-0 bg-white text-slate-900 rounded-2xl px-5 py-3 shadow-xl">
              <small>Destinasi Pilihan</small>
              <div className="font-black">Nusantara</div>
            </div>
          </div>

        </div>
      </section>


      <section className="px-6 grid grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map(({title,value,icon:Icon,info})=>(
          <div key={title}
            className="bg-white rounded-3xl border p-6 shadow-sm hover:shadow-xl transition">
            <Icon size={34}/>
            <div className="mt-5 text-4xl font-black">{value}</div>
            <div className="font-bold text-lg">{title}</div>
            <div className="text-slate-500">{info}</div>
          </div>
        ))}
      </section>


      <section className="p-6 space-y-12">
        <Section title="Wisata Nusantara" icon={<MapPin/>} items={tours} type="tourism"/>
        <Section title="Kuliner & Cinderamata" icon={<ShoppingBag/>} items={culinaryItems} type="culinary"/>
        <Section title="Aktivitas Terbaru" icon={<CalendarDays/>} items={activities} type="activity"/>
      </section>

    </main>
  );
}


function Section({title,icon,items,type}:any){
 return (
  <section>
   <h2 className="text-3xl font-black flex items-center gap-3 mb-6">
    {icon}{title}
   </h2>

   <div className="grid lg:grid-cols-3 gap-6">
    {items.map((item:any)=>(
      <Card key={item.id} item={item} type={type}/>
    ))}
   </div>
  </section>
 )
}


function Card({item,type}:any){

 const image =
 item.image ||
 (type==="tourism" ? FALLBACK.tourism :
 type==="culinary" ? FALLBACK.culinary :
 FALLBACK.craft);

 return (
  <div className="bg-white rounded-3xl border overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl transition">

   <img
    src={image}
    alt={item.name || item.title}
    className="w-full h-64 object-cover"
    onError={(e)=>{
      e.currentTarget.src =
      type==="tourism" ? FALLBACK.tourism :
      type==="culinary" ? FALLBACK.culinary :
      FALLBACK.craft;
    }}
   />

   <div className="p-6">

    <h3 className="text-2xl font-black">
      {item.name || item.title}
    </h3>

    <div className="mt-2 text-teal-600 font-semibold">
      {item.location || item.region}
    </div>

    <p className="mt-3 text-slate-500">
      {item.description}
    </p>

    <button className="mt-5 flex items-center gap-2 font-bold">
      Lihat Detail <ArrowRight size={16}/>
    </button>

   </div>

  </div>
 )
}


export default LandingPageView;
