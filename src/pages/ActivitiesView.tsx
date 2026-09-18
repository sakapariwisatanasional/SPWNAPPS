import React, { useMemo } from "react";
import { CalendarDays, MapPin, Clock, ChevronRight } from "lucide-react";

interface ActivitiesViewProps {
  activities?: any[];
  onSelectActivity?: (item:any)=>void;
  [key:string]:any;
}

export const ActivitiesView:React.FC<ActivitiesViewProps> = ({
  activities = [],
  onSelectActivity
}) => {

  const items = useMemo(
    ()=>Array.isArray(activities) ? activities : [],
    [activities]
  );

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-6">

      <section className="
        rounded-[2rem] p-8 text-white
        bg-gradient-to-br from-red-600 via-orange-500 to-amber-400
      ">
        <h1 className="text-3xl font-black">
          Aktivitas Saka Pariwisata
        </h1>
        <p className="mt-2 text-white/90">
          Ikuti kegiatan, pelatihan, dan agenda pariwisata Indonesia.
        </p>
      </section>

      <section className="
        grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5
      ">
        {items.map((item,index)=>(
          <button
            key={item?.id || index}
            onClick={()=>onSelectActivity?.(item)}
            className="
              text-left bg-white rounded-[2rem]
              border border-slate-200 overflow-hidden
              hover:-translate-y-1 hover:shadow-xl
              transition
            "
          >

            <div className="
              h-44 bg-slate-200
              flex items-center justify-center
            ">
              <span className="text-slate-400">
                Foto Kegiatan
              </span>
            </div>

            <div className="p-5">
              <div className="flex justify-between gap-3">
                <h3 className="font-black">
                  {item?.title || "Kegiatan Saka Pariwisata"}
                </h3>
                <ChevronRight size={18}/>
              </div>

              <div className="space-y-2 mt-4 text-sm text-slate-500">
                <div className="flex gap-2 items-center">
                  <CalendarDays size={15}/>
                  {item?.date || "Tanggal kegiatan"}
                </div>

                <div className="flex gap-2 items-center">
                  <MapPin size={15}/>
                  {item?.location || "Lokasi kegiatan"}
                </div>

                <div className="flex gap-2 items-center">
                  <Clock size={15}/>
                  {item?.status || "Terjadwal"}
                </div>
              </div>

              <span className="
                inline-flex mt-4 px-3 py-1
                rounded-full bg-teal-50
                text-teal-700 text-xs font-bold
              ">
                Agenda Pariwisata
              </span>
            </div>

          </button>
        ))}
      </section>

    </main>
  );
};

export default ActivitiesView;
