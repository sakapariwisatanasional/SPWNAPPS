import React from "react";
import {
  Compass,
  Megaphone,
  PartyPopper,
  Utensils,
  ChevronRight
} from "lucide-react";

interface CompactKridaPortalProps {
  modules?: any[];
  currentUser?: any;
  onOpenFullExplorer?: () => void;
}

const defaultKrida = [
  {
    title: "Krida Pemandu",
    desc: "Eksplorasi destinasi dan pelayanan wisata",
    icon: Compass,
    style: "bg-red-50 text-red-600"
  },
  {
    title: "Krida Penyuluh",
    desc: "Edukasi dan pengembangan pariwisata",
    icon: Megaphone,
    style: "bg-teal-50 text-teal-600"
  },
  {
    title: "MICE & Event",
    desc: "Kreativitas event dan industri wisata",
    icon: PartyPopper,
    style: "bg-purple-50 text-purple-600"
  },
  {
    title: "Kuliner & Cinderamata",
    desc: "Produk khas Nusantara",
    icon: Utensils,
    style: "bg-amber-50 text-amber-600"
  }
];

export const CompactKridaPortal: React.FC<CompactKridaPortalProps> = ({
  onOpenFullExplorer
}) => {
  return (
    <section className="bg-white rounded-[2rem] border border-slate-200 p-5 md:p-6 shadow-sm">

      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Jelajah Krida
          </h2>
          <p className="text-sm text-slate-500">
            Pilih bidang pengembangan Saka Pariwisata
          </p>
        </div>

        <button
          onClick={onOpenFullExplorer}
          className="text-sm font-bold text-red-600 flex items-center gap-1"
        >
          Semua
          <ChevronRight size={16}/>
        </button>
      </div>


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {defaultKrida.map((item)=>{

          const Icon=item.icon;

          return (
            <button
              key={item.title}
              className="
                text-left bg-white
                rounded-3xl
                border border-slate-200
                p-4
                hover:-translate-y-1
                transition-all
              "
            >
              <div className={`
                w-12 h-12 rounded-2xl
                flex items-center justify-center
                ${item.style}
              `}>
                <Icon/>
              </div>

              <h3 className="font-black mt-4 text-sm">
                {item.title}
              </h3>

              <p className="text-xs text-slate-500 mt-2">
                {item.desc}
              </p>

            </button>
          );
        })}
      </div>

    </section>
  );
};

export default CompactKridaPortal;
