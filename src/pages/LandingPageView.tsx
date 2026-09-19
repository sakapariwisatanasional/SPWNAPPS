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

import { CurrentUser } from "../types";

interface LandingPageViewProps {
  currentUser?: CurrentUser;
  members?: any[];
  tours?: any[];
  culinaryItems?: any[];
  activities?: any[];
  onSelectTab?: (view: string) => void;
}

const fallbackImages = [
  "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e",
  "https://images.unsplash.com/photo-1528127269322-539801943592",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4"
];

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
      <section className="p-4 md:p-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-red-600 via-orange-500 to-teal-500 p-8 md:p-12 text-white shadow-xl">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles size={18}/>
              SAKA PARIWISATA NASIONAL
            </div>

            <h1 className="mt-5 text-4xl md:text-6xl font-black leading-tight">
              Jelajah Nusantara,
              <br/>
              Berkarya untuk Pariwisata Indonesia
            </h1>

            <p className="mt-5 max-w-xl text-white/90">
              Platform digital Saka Pariwisata untuk anggota,
              kegiatan, destinasi wisata, serta produk kreatif daerah.
            </p>

            <button
              onClick={() => onSelectTab?.("tours")}
              className="mt-8 rounded-full bg-white px-6 py-3 font-bold text-slate-800 flex items-center gap-2"
            >
              Mulai Jelajah <ArrowRight size={18}/>
            </button>
          </div>

          <div className="hidden lg:block absolute right-10 bottom-0">
            <div className="rounded-3xl bg-white/20 backdrop-blur p-6">
              <Compass size={100}/>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-3xl border bg-white p-6 shadow-sm">
              <Icon className="text-slate-700"/>
              <div className="mt-4 text-3xl font-black">{item.value}</div>
              <div className="text-slate-500">{item.label}</div>
            </div>
          );
        })}
      </section>

      <section className="p-4 md:p-8 space-y-10">
        <ContentSection
          title="Wisata Nusantara"
          items={tours}
          icon={<MapPin/>}
          empty="Belum ada destinasi"
          render={(item:any,index:number)=>(
            <Card
              image={item.image || item.imageUrl || fallbackImages[index % fallbackImages.length]}
              title={item.name}
              subtitle={item.location}
              description={item.description}
            />
          )}
        />

        <ContentSection
          title="Kuliner & Cinderamata"
          items={culinaryItems}
          icon={<ShoppingBag/>}
          empty="Belum ada produk kreatif"
          render={(item:any,index:number)=>(
            <Card
              image={item.image || fallbackImages[index % fallbackImages.length]}
              title={item.name}
              subtitle={item.region}
              description={item.description}
            />
          )}
        />

        <ContentSection
          title="Aktivitas Terbaru"
          items={activities}
          icon={<CalendarDays/>}
          empty="Belum ada aktivitas"
          render={(item:any)=>(
            <div className="rounded-2xl border bg-white p-5">
              <h3 className="font-black">{item.title}</h3>
              <p className="text-slate-500 mt-2">{item.description}</p>
            </div>
          )}
        />
      </section>
    </main>
  );
};

function ContentSection({title,items,icon,render,empty}:any){
  return (
    <section>
      <h2 className="text-2xl font-black mb-5 flex gap-2 items-center">
        {icon}{title}
      </h2>
      {items.length===0 ? (
        <p className="text-slate-500">{empty}</p>
      ):(
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map(render)}
        </div>
      )}
    </section>
  );
}

function Card({image,title,subtitle,description}:any){
  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <img
        src={image}
        className="h-48 w-full object-cover"
        alt={title}
      />
      <div className="p-5">
        <h3 className="font-black text-lg">{title}</h3>
        <p className="text-sm text-teal-600">{subtitle}</p>
        <p className="mt-3 text-slate-500 text-sm">{description}</p>
      </div>
    </div>
  );
}

export default LandingPageView;
