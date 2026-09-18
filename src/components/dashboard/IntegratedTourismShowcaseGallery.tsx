import React from "react";
import { MapPin, Utensils, Compass, ChevronRight } from "lucide-react";

interface IntegratedTourismShowcaseGalleryProps {
  tours?: any[];
  products?: any[];
  activities?: any[];
  members?: any[];
  currentUser?: any;
  onSelectTab?: (view:string)=>void;
  [key:string]:any;
}

export const IntegratedTourismShowcaseGallery:
React.FC<IntegratedTourismShowcaseGalleryProps> = ({
  tours = [],
  products = [],
  onSelectTab
}) => {

  const tourismItems = Array.isArray(tours) ? tours.slice(0,4) : [];
  const culinaryItems = Array.isArray(products) ? products.slice(0,4) : [];

  return (
    <section className="space-y-6">

      <div className="
        rounded-[2rem] p-6 md:p-8
        bg-gradient-to-br from-teal-600 via-cyan-500 to-emerald-500
        text-white
      ">
        <h2 className="text-2xl font-black">
          Wonderful Indonesia Showcase
        </h2>
        <p className="mt-2 text-white/90">
          Jelajah destinasi wisata dan karya kreatif Nusantara.
        </p>
      </div>


      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-xl flex items-center gap-2">
            <Compass size={22}/>
            Wisata Pilihan
          </h3>

          <button
            onClick={()=>onSelectTab?.("tourism")}
            className="text-red-600 font-bold text-sm flex gap-1"
          >
            Lihat Semua <ChevronRight size={16}/>
          </button>
        </div>

        <div className="
          grid grid-cols-1 sm:grid-cols-2
          lg:grid-cols-4 gap-4
        ">
          {tourismItems.map((item:any,index)=>(
            <article
              key={item?.id || index}
              className="
                bg-white rounded-3xl overflow-hidden
                border border-slate-200
              "
            >
              <div className="h-40 bg-slate-200 flex items-center justify-center">
                Foto Wisata
              </div>

              <div className="p-4">
                <h4 className="font-black">
                  {item?.name || "Destinasi Nusantara"}
                </h4>

                <p className="text-xs text-slate-500 flex gap-1 mt-2">
                  <MapPin size={14}/>
                  Indonesia
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>


      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-xl flex items-center gap-2">
            <Utensils size={22}/>
            Kuliner & Cinderamata
          </h3>
        </div>

        <div className="
          grid grid-cols-1 sm:grid-cols-2
          lg:grid-cols-4 gap-4
        ">
          {culinaryItems.map((item:any,index)=>(
            <article
              key={item?.id || index}
              className="
                bg-white rounded-3xl p-5
                border border-slate-200
              "
            >
              <h4 className="font-black">
                {item?.name || "Produk Nusantara"}
              </h4>

              <p className="text-xs text-slate-500 mt-2">
                Produk kreatif daerah Indonesia
              </p>
            </article>
          ))}
        </div>
      </div>

    </section>
  );
};

export default IntegratedTourismShowcaseGallery;
