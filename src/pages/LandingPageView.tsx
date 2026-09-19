import React from "react";
import {
  Users,
  CalendarDays,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Compass,
  Sparkles
} from "lucide-react";

interface LandingPageViewProps {
  members?: any[];
  tours?: any[];
  culinaryItems?: any[];
  activities?: any[];
  onSelectTab?: (tab: string) => void;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80";

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  members = [],
  tours = [],
  culinaryItems = [],
  activities = [],
  onSelectTab
}) => {
  const stats = [
    { label: "Anggota", value: members.length, icon: Users },
    { label: "Aktivitas", value: activities.length, icon: CalendarDays },
    { label: "Destinasi", value: tours.length, icon: MapPin },
    { label: "Produk Kreatif", value: culinaryItems.length, icon: ShoppingBag }
  ];

  return (
    <main className="min-h-screen bg-slate-50">

      <section className="p-6">
        <div className="rounded-[32px] bg-gradient-to-br from-red-600 via-orange-500 to-teal-500 text-white p-10 shadow-xl relative overflow-hidden">

          <div className="max-w-3xl">
            <div className="flex gap-2 items-center font-bold text-sm">
              <Sparkles size={18}/>
              SAKA PARIWISATA NASIONAL
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-black leading-tight">
              Jelajah Nusantara,
              <br/>
              Berkarya untuk Pariwisata Indonesia
            </h1>

            <p className="mt-5 text-white/90 max-w-xl">
              Platform digital Saka Pariwisata untuk anggota,
              kegiatan, destinasi wisata, serta produk kreatif daerah.
            </p>

            <button
              onClick={() => onSelectTab?.("tours")}
              className="mt-8 bg-white text-slate-900 rounded-full px-6 py-3 font-bold flex items-center gap-2"
            >
              Mulai Jelajah
              <ArrowRight size={18}/>
            </button>
          </div>

          <div className="hidden lg:flex absolute right-12 bottom-12 bg-white/20 backdrop-blur rounded-3xl p-8">
            <Compass size={90}/>
          </div>

        </div>
      </section>


      <section className="px-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item)=> {
          const Icon=item.icon;
          return (
            <div
              key={item.label}
              className="bg-white rounded-3xl border p-6 shadow-sm"
            >
              <Icon size={28}/>
              <div className="text-4xl font-black mt-5">
                {item.value}
              </div>
              <div className="text-slate-500">
                {item.label}
              </div>
            </div>
          )
        })}
      </section>


      <section className="p-6 space-y-12">

        <Section
          title="Wisata Nusantara"
          icon={<MapPin/>}
          items={tours}
          render={(item:any)=>(
            <Card
              image={item.image}
              title={item.name}
              subtitle={item.location}
              description={item.description}
            />
          )}
        />


        <Section
          title="Kuliner & Cinderamata"
          icon={<ShoppingBag/>}
          items={culinaryItems}
          render={(item:any)=>(
            <Card
              image={item.image}
              title={item.name}
              subtitle={item.region}
              description={item.description}
            />
          )}
        />


        <Section
          title="Aktivitas Terbaru"
          icon={<CalendarDays/>}
          items={activities}
          render={(item:any)=>(
            <div className="bg-white border rounded-3xl p-6 shadow-sm hover:shadow-lg transition">
              <h3 className="font-black text-lg">
                {item.title}
              </h3>
              <p className="text-slate-500 mt-2">
                {item.description}
              </p>
            </div>
          )}
        />

      </section>
    </main>
  );
};


function Section({title,icon,items,render}:any){
  return (
    <section>
      <h2 className="text-3xl font-black flex items-center gap-3 mb-6">
        {icon}
        {title}
      </h2>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map(render)}
      </div>
    </section>
  )
}


function Card({image,title,subtitle,description}:any){

  return (
    <div className="overflow-hidden rounded-3xl bg-white border shadow-sm hover:shadow-xl transition">

      <img
        src={image || FALLBACK_IMAGE}
        alt={title}
        className="h-56 w-full object-cover"
        loading="lazy"
        onError={(e)=>{
          e.currentTarget.src = FALLBACK_IMAGE;
        }}
      />

      <div className="p-6">

        <h3 className="text-xl font-black">
          {title}
        </h3>

        <div className="text-teal-600 font-medium mt-1">
          {subtitle}
        </div>

        <p className="text-slate-500 mt-3">
          {description}
        </p>

        <button className="mt-5 text-sm font-bold flex items-center gap-2">
          Lihat Detail
          <ArrowRight size={16}/>
        </button>

      </div>

    </div>
  )
}

export default LandingPageView;
