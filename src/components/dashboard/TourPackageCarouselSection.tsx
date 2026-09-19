import React from "react";
import { MapPin, ChevronRight } from "lucide-react";

interface TourPackageCarouselSectionProps {
  packages?: any[];
  onSelectPackage?: (item:any)=>void;
  [key:string]: any;
}

export const TourPackageCarouselSection:
React.FC<TourPackageCarouselSectionProps> = ({
  packages = [],
  onSelectPackage
}) => {
  const items = Array.isArray(packages) ? packages : [];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-slate-900">
          Paket Wisata Pilihan
        </h2>
        <p className="text-sm text-slate-500">
          Jelajah destinasi terbaik Indonesia
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 snap-x">
        {items.map((item:any,index)=>(
          <button
            key={item?.id || index}
            onClick={()=>onSelectPackage?.(item)}
            className="
              min-w-[280px] text-left
              bg-white rounded-[2rem]
              overflow-hidden border border-slate-200
              shadow-sm hover:-translate-y-1 transition
              snap-start
            "
          >
            <div className="
              h-44 bg-gradient-to-br
              from-teal-100 to-amber-100
              flex items-center justify-center
            ">
              <span className="text-slate-400 text-sm">
                Foto Destinasi
              </span>
            </div>

            <div className="p-5">
              <h3 className="font-black text-lg">
                {item?.name || item?.title || "Paket Wisata Nusantara"}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
                <MapPin size={14}/>
                {item?.location || "Indonesia"}
              </div>

              <div className="mt-4 flex items-center justify-between text-red-600 text-sm font-bold">
                Detail Wisata
                <ChevronRight size={16}/>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default TourPackageCarouselSection;
