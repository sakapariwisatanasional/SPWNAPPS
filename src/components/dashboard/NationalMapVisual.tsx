import React from "react";
import { MapPin, Users, Globe2 } from "lucide-react";

interface NationalMapVisualProps {
  members?: any[];
  regionData?: any[];
  [key: string]: any;
}

export const NationalMapVisual: React.FC<NationalMapVisualProps> = ({
  members = [],
  regionData = []
}) => {

  const totalMembers = Array.isArray(members)
    ? members.length
    : 0;

  return (
    <section
      className="
        relative overflow-hidden
        rounded-[2rem]
        border border-slate-200
        bg-white
        p-6
        shadow-sm
      "
    >

      <div
        className="
          absolute inset-0 opacity-40
          bg-gradient-to-br
          from-teal-50
          via-white
          to-amber-50
        "
      />

      <div className="relative z-10">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <div
              className="
                w-12 h-12 rounded-2xl
                bg-teal-50
                text-teal-600
                flex items-center justify-center
              "
            >
              <Globe2 />
            </div>

            <div>
              <h2 className="font-black text-slate-900">
                Persebaran Nasional
              </h2>

              <p className="text-sm text-slate-500">
                Distribusi anggota Saka Pariwisata Indonesia
              </p>
            </div>

          </div>

        </div>


        <div
          className="
            mt-6
            min-h-[220px]
            rounded-[1.75rem]
            bg-gradient-to-br
            from-teal-100
            via-white
            to-amber-100
            border border-slate-100
            flex items-center justify-center
            relative
          "
        >

          <div
            className="
              absolute
              w-48 h-48
              rounded-full
              bg-teal-200/40
              blur-3xl
            "
          />

          <div className="relative text-center">

            <MapPin
              className="mx-auto text-red-600"
              size={36}
            />

            <p className="mt-3 text-4xl font-black text-slate-900">
              {totalMembers}
            </p>

            <p className="text-sm text-slate-500">
              Anggota Terdata
            </p>

          </div>

        </div>


        <div className="grid grid-cols-2 gap-3 mt-5">

          <div className="rounded-2xl bg-slate-50 p-4">
            <Users className="text-red-600" size={20}/>
            <p className="text-xs text-slate-500 mt-2">
              Total Wilayah
            </p>
            <p className="font-black text-xl">
              {Array.isArray(regionData)
                ? regionData.length
                : 0}
            </p>
          </div>


          <div className="rounded-2xl bg-slate-50 p-4">
            <Globe2 className="text-teal-600" size={20}/>
            <p className="text-xs text-slate-500 mt-2">
              Cakupan
            </p>
            <p className="font-black text-xl">
              Nasional
            </p>
          </div>

        </div>

      </div>

    </section>
  );
};

export default NationalMapVisual;
