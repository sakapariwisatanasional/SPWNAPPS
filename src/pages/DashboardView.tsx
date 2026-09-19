import React from "react";
import {
  Compass,
  Megaphone,
  PartyPopper,
  Utensils,
  Users,
  Calendar,
  MapPin,
  ShoppingBag,
  ArrowRight
} from "lucide-react";

import { CulinarySouvenirGallerySection } from "../components/dashboard/CulinarySouvenirGallerySection";

export interface DashboardViewProps {
  currentUser?: any;
  members?: any[];
  activities?: any[];
  tours?: any[];
  culinaryItems?: any[];
  onSelectTab?: (view: string) => void;
  onSelectCulinaryDetail?: (item: any) => void;
  [key: string]: any;
}

const krida = [
  {
    title: "Krida Pemandu",
    description: "Pengembangan kemampuan pemandu wisata",
    icon: Compass,
    style: "bg-red-50 text-red-600"
  },
  {
    title: "Krida Penyuluh",
    description: "Edukasi dan promosi pariwisata",
    icon: Megaphone,
    style: "bg-teal-50 text-teal-600"
  },
  {
    title: "MICE & Event",
    description: "Manajemen kegiatan dan event",
    icon: PartyPopper,
    style: "bg-purple-50 text-purple-600"
  },
  {
    title: "Kuliner & Cinderamata",
    description: "Produk kreatif Nusantara",
    icon: Utensils,
    style: "bg-amber-50 text-amber-600"
  }
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  members = [],
  activities = [],
  tours = [],
  culinaryItems = [],
  onSelectTab,
  onSelectCulinaryDetail
}) => {

  const stats = [
    {
      title: "Anggota",
      value: members.length,
      icon: Users
    },
    {
      title: "Aktivitas",
      value: activities.length,
      icon: Calendar
    },
    {
      title: "Destinasi",
      value: tours.length,
      icon: MapPin
    },
    {
      title: "Produk Kreatif",
      value: culinaryItems.length,
      icon: ShoppingBag
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50 space-y-8">

      <section className="rounded-[2rem] p-8 md:p-10 text-white bg-gradient-to-br from-red-600 via-orange-500 to-teal-500 shadow-xl">

        <p className="font-bold">
          SAKA PARIWISATA NASIONAL
        </p>

        <h1 className="text-4xl md:text-5xl font-black mt-3">
          Selamat Datang,
          <br />
          {currentUser?.name || "Anggota"} 👋
        </h1>

        <p className="mt-4 text-white/90">
          Kelola aktivitas, destinasi, anggota, dan produk kreatif Nusantara.
        </p>

      </section>


      <section className="grid grid-cols-2 xl:grid-cols-4 gap-5">

        {stats.map(({title,value,icon:Icon})=>(
          <div
            key={title}
            className="bg-white rounded-3xl border p-6 shadow-sm hover:shadow-lg transition"
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


      <section>

        <h2 className="text-2xl font-black mb-4">
          Quick Krida
        </h2>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">

          {krida.map(({title,description,icon:Icon,style})=>(

            <button
              key={title}
              onClick={()=>onSelectTab?.("krida-modules")}
              className="bg-white rounded-3xl p-6 border text-left hover:shadow-xl hover:-translate-y-1 transition"
            >

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style}`}>
                <Icon/>
              </div>

              <h3 className="font-black mt-5">
                {title}
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                {description}
              </p>

            </button>

          ))}

        </div>

      </section>


      <section>

        <h2 className="text-2xl font-black mb-4">
          Destinasi Unggulan
        </h2>

        <div className="grid md:grid-cols-2 gap-5">

          {tours.slice(0,2).map((item:any)=>(

            <div
              key={item.id}
              className="bg-white rounded-3xl border p-6 shadow-sm"
            >

              <h3 className="font-black text-xl">
                {item.name}
              </h3>

              <p className="text-teal-600 mt-2">
                {item.location}
              </p>

              <p className="text-slate-500 mt-2">
                {item.description}
              </p>

            </div>

          ))}

        </div>

      </section>


      <section className="bg-white rounded-[2rem] p-6 border">

        <h2 className="text-2xl font-black">
          Aktivitas Terbaru
        </h2>

        <div className="mt-5 grid md:grid-cols-2 gap-4">

          {activities.slice(0,4).map((item:any)=>(

            <div
              key={item.id}
              className="rounded-2xl bg-slate-50 p-5"
            >

              <h3 className="font-black">
                {item.title || item.name}
              </h3>

              <p className="text-slate-500 mt-2">
                {item.description}
              </p>

              <button className="mt-4 flex items-center gap-2 text-sm font-bold">
                Detail <ArrowRight size={15}/>
              </button>

            </div>

          ))}

        </div>

      </section>


      <section>

        <h2 className="text-2xl font-black mb-4">
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
  );
};

export default DashboardView;
