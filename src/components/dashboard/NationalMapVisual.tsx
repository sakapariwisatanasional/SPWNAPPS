import React from "react";
import { MapPin } from "lucide-react";

interface NationalMapVisualProps {
  members?: any[];
  [key:string]: any;
}

export const NationalMapVisual:React.FC<NationalMapVisualProps> = ({
  members = []
}) => {

  const total = Array.isArray(members) ? members.length : 0;

  return (
    <div className="
      relative min-h-[280px]
      rounded-[2rem]
      overflow-hidden
      bg-gradient-to-br
      from-teal-50 via-white to-amber-50
      border border-slate-200
      p-6
    ">

      <div className="
        absolute inset-0
        opacity-20
        bg-[radial-gradient(circle_at_center,_#00A8A8_1px,transparent_1px)]
        bg-[length:24px_24px]
      " />

      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="
            w-12 h-12 rounded-2xl
            bg-teal-100 text-teal-700
            flex items-center justify-center
          ">
            <MapPin />
          </div>

          <div>
            <h3 className="font-black text-slate-900">
              Persebaran Saka Pariwisata Nasional
            </h3>
            <p className="text-sm text-slate-500">
              Monitoring anggota seluruh Indonesia
            </p>
          </div>
        </div>


        <div className="
          mt-10
          flex items-center justify-center
          min-h-[140px]
        ">
          <div className="
            text-center
            rounded-3xl
            bg-white
            shadow-sm
            border
            p-8
          ">
            <p className="text-4xl font-black text-red-600">
              {total}
            </p>
            <p className="text-sm text-slate-500">
              Total Anggota
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default NationalMapVisual;
