import React from "react";
import {
  Users,
  CalendarDays,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Compass,
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

const FALLBACK_IMAGES = {
  tourism:
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80",
  culinary:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
  craft:
    "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1200&q=80"
};

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  members = [],
  tours = [],
  culinaryItems = [],
  activities = [],
  onSelectTab
}) => {

  const stats = [
    {
      title: "Anggota",
      value: members.length,
      icon: Users,
      subtitle: "Aktif Nasional"
    },
    {
      title: "Aktivitas",
      value: activities.length,
      icon: CalendarDays,
      subtitle: "Kegiatan Terbaru"
    },
    {
      title: "Destinasi",
      value: tours.length,
      icon: MapPin,
      subtitle: "Wisata Nusantara"
    },
    {
      title: "Produk Kreatif",
      value: culinaryItems.length,
      icon: ShoppingBag,
      subtitle: "Kuliner & Kriya"
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50">

      <section className="p-6">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-red-600 via-orange-500 to-teal-500 p-8 md:p-12 text-white shadow-xl">

          <div className="max-w-xl relative z-10">

            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles size={18}/>
              SAKA PARIWISATA NASIONAL
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-black leading-tight">
              Jelajah Nusantara,
              <br/>
              Berkarya untuk Pariwisata Indonesia
            </h1>

            <p className="mt-5 text-white/90">
              Platform digital Saka Pariwisata untuk anggota,
              kegiatan, destinasi wisata, serta produk kreatif daerah.
            </p>

            <button
              onClick={()=>onSelectTab?.("tours")}
              className="mt-8 rounded-full bg-white px-7 py-3 text-slate-900 font-bold flex items-center gap-2 hover:scale-105 transition"
            >
              Mulai Jelajah
              <ArrowRight size={18}/>
            </button>

          </div>


          <div className="hidden lg:block absolute right-12 top-12">

            <div className="relative">

              <div className="w-72 h-72 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Map size={130}/>
              </div>

              <div className="absolute -bottom-4 -left-8 bg-white text-slate-900 rounded-2xl px-5 py-3 shadow-lg">
                <div className="text-xs text-slate-500">
                  Jelajah Indonesia
                </div>
                <div className="font-black">
                  Nusantara
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>


      <section className="px-6 grid grid-cols-2 xl:grid-cols-4 gap-5">

        {stats.map((item)=>{

          const Icon=item.icon;

          return (
            <div
              key={item.title}
              className="bg-white rounded-3xl border p-6 shadow-sm hover:shadow-lg transition"
            >

              <Icon size={32}/>

              <div className="mt-5 text-4xl font-black">
                {item.value}
              </div>

              <div className="font-bold">
                {item.title}
              </div>

              <div className="text-sm text-slate-500">
                {item.subtitle}
              </div>

            </div>
          )

        })}

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


        <ContentSection
          title="Aktivitas Terbaru"
          icon={<CalendarDays/>}
          items={activities}
          type="activity"
        />

      </section>

    </main>
  );
};


function ContentSection({
  title,
  icon,
  items,
  type
}:any){

return (
<section>

<h2 className="text-3xl font-black flex items-center gap-3 mb-6">
{icon}
{title}
</h2>

<div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

{
items.map((item:any)=>(
<Card
key={item.id}
item={item}
type={type}
/>
))
}

</div>

</section>
)

}


function Card({item,type}:any){

const image =
item.image ||
(type==="culinary"
? FALLBACK_IMAGES.culinary
: type==="tourism"
? FALLBACK_IMAGES.tourism
: FALLBACK_IMAGES.craft);


return (

<div className="overflow-hidden rounded-3xl bg-white border shadow-sm hover:shadow-xl hover:-translate-y-1 transition">

<img
src={image}
alt={item.name || item.title}
loading="lazy"
className="h-60 w-full object-cover"
onError={(e)=>{
e.currentTarget.src =
type==="culinary"
? FALLBACK_IMAGES.culinary
: FALLBACK_IMAGES.tourism;
}}
/>

<div className="p-6">

<h3 className="text-xl font-black">
{item.name || item.title}
</h3>

<div className="mt-1 text-teal-600 font-medium">
{item.location || item.region}
</div>

<p className="mt-3 text-slate-500">
{item.description}
</p>

<button className="mt-5 flex items-center gap-2 font-bold text-sm">
Lihat Detail
<ArrowRight size={16}/>
</button>

</div>

</div>

)

}


export default LandingPageView;
