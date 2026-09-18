import React, { useMemo, useState } from "react";
import { MapPin, Search, Star, SlidersHorizontal } from "lucide-react";

interface TourismDirectoryViewProps {
  destinations?: any[];
  onSelectDestination?: (item:any)=>void;
  [key:string]:any;
}

export const TourismDirectoryView:React.FC<TourismDirectoryViewProps> = ({
  destinations = [],
  onSelectDestination
}) => {

  const [search,setSearch] = useState("");

  const filtered = useMemo(()=>(
    destinations.filter((item:any)=>
      String(item?.name || item?.title || "")
      .toLowerCase()
      .includes(search.toLowerCase())
    )
  ),[destinations,search]);


  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">

      <section className="
        rounded-[2rem] p-8 text-white
        bg-gradient-to-br from-teal-600 via-cyan-500 to-emerald-500
      ">
        <h1 className="text-3xl font-black">
          Jelajah Wisata Nusantara
        </h1>

        <p className="mt-2 text-white/90">
          Temukan destinasi unggulan Indonesia bersama Saka Pariwisata.
        </p>

        <div className="
          mt-6 bg-white rounded-2xl
          flex items-center px-4 py-3
          text-slate-700
        ">
          <Search size={18}/>
          <input
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
            placeholder="Cari destinasi..."
            className="ml-3 flex-1 outline-none"
          />
        </div>
      </section>


      <div className="flex gap-2 overflow-x-auto">
        {["Populer","Alam","Budaya","Kuliner"].map(x=>(
          <button
            key={x}
            className="
              px-4 py-2 rounded-full
              bg-white border text-sm font-bold
            "
          >
            {x}
          </button>
        ))}
      </div>


      <section className="
        grid grid-cols-1 sm:grid-cols-2
        lg:grid-cols-4 gap-5
      ">
        {filtered.map((item:any,index)=>(
          <button
            key={item?.id || index}
            onClick={()=>onSelectDestination?.(item)}
            className="
              text-left bg-white
              rounded-[2rem]
              overflow-hidden
              border border-slate-200
              hover:-translate-y-1
              transition
            "
          >

            <div className="
              h-44 bg-slate-200
              flex items-center justify-center
            ">
              <span className="text-slate-400">
                Foto Destinasi
              </span>
            </div>

            <div className="p-5">
              <h3 className="font-black">
                {item?.name || item?.title || "Destinasi Indonesia"}
              </h3>

              <div className="
                flex items-center gap-1
                text-xs text-slate-500 mt-2
              ">
                <MapPin size={14}/>
                {item?.location || "Indonesia"}
              </div>

              <div className="
                flex items-center gap-1
                text-amber-500 mt-3 text-sm
              ">
                <Star size={14} fill="currentColor"/>
                Wisata Pilihan
              </div>
            </div>

          </button>
        ))}
      </section>

    </main>
  );
};

export default TourismDirectoryView;
