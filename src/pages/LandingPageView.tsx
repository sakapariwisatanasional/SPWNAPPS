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

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  currentUser,
  members = [],
  tours = [],
  culinaryItems = [],
  activities = [],
  onSelectTab
}) => {
  return (
    <main className="min-h-screen bg-slate-50">

      <section className="p-4 md:p-8">
        <div className="rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-red-600 via-amber-500 to-teal-500 text-white p-8 md:p-12 shadow-xl">

          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-sm font-bold opacity-90">
              <Sparkles size={18}/>
              SAKA PARIWISATA NASIONAL
            </div>

            <h1 className="text-4xl md:text-6xl font-black mt-5 leading-tight">
              Jelajah Nusantara,
              <br/>
              Berkarya untuk Pariwisata Indonesia
            </h1>

            <p className="mt-5 text-lg opacity-90 max-w-2xl">
              Platform digital Saka Pariwisata untuk anggota,
              kegiatan, destinasi wisata, serta produk kreatif daerah.
            </p>

            <button
              onClick={() => onSelectTab?.("dashboard")}
              className="mt-8 bg-white text-slate-900 px-6 py-3 rounded-2xl font-black flex items-center gap-2"
            >
              Mulai Jelajah
              <ArrowRight size={18}/>
            </button>
          </div>

        </div>
      </section>


      <section className="px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">

        {[
          {
            icon: Users,
            value: members.length,
            label: "Anggota"
          },
          {
            icon: CalendarDays,
            value: activities.length,
            label: "Aktivitas"
          },
          {
            icon: MapPin,
            value: tours.length,
            label: "Destinasi"
          },
          {
            icon: ShoppingBag,
            value: culinaryItems.length,
            label: "Produk Kreatif"
          }
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-3xl p-5 border shadow-sm">
            <item.icon/>
            <div className="text-3xl font-black mt-3">
              {item.value}
            </div>
            <div className="text-slate-500">
              {item.label}
            </div>
          </div>
        ))}

      </section>


      <section className="p-4 md:p-8">

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-black">
            Wisata Nusantara
          </h2>
          <Compass/>
        </div>

        <div className="grid md:grid-cols-3 gap-5">

          {tours.slice(0,6).map((tour:any,index:number)=>(
            <article
              key={tour.id || index}
              className="bg-white rounded-3xl border overflow-hidden"
            >
              <div className="h-40 bg-slate-200 flex items-center justify-center">
                {tour.image ? (
                  <img
                    src={tour.image}
                    alt={tour.name || tour.title}
                    className="w-full h-full object-cover"
                  />
                ):(
                  <MapPin/>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-black text-lg">
                  {tour.name || tour.title || "Destinasi Wisata"}
                </h3>
                <p className="text-slate-500 text-sm mt-2">
                  {tour.location || "Indonesia"}
                </p>
              </div>

            </article>
          ))}

        </div>

      </section>


      <section className="p-4 md:p-8">

        <h2 className="text-2xl font-black mb-5">
          Kuliner & Cinderamata
        </h2>

        <div className="grid md:grid-cols-3 gap-5">

          {culinaryItems.slice(0,6).map((item:any,index:number)=>(
            <div
              key={item.id || index}
              className="bg-white rounded-3xl border p-5"
            >
              <ShoppingBag/>
              <h3 className="font-black mt-4">
                {item.name || item.title || "Produk Daerah"}
              </h3>
              <p className="text-slate-500 mt-2">
                {item.region || item.location || "Nusantara"}
              </p>
            </div>
          ))}

        </div>

      </section>


      <section className="p-4 md:p-8">

        <h2 className="text-2xl font-black mb-5">
          Aktivitas Terbaru
        </h2>

        <div className="space-y-3">

          {activities.slice(0,5).map((activity:any,index:number)=>(
            <div
              key={activity.id || index}
              className="bg-white rounded-2xl border p-5"
            >
              <b>
                {activity.title || activity.name || "Kegiatan Saka Pariwisata"}
              </b>
            </div>
          ))}

        </div>

      </section>

    </main>
  );
};

export default LandingPageView;
