import React from "react";
import {
  ArrowRight,
  Sparkles,
  Map,
  LogIn
} from "lucide-react";

interface LandingPageViewProps {
  members?: any[];
  tours?: any[];
  culinaryItems?: any[];
  activities?: any[];
  onSelectTab?: (tab: string) => void;
  onLogin?: () => void;
}

export function LandingPageView({
  onSelectTab,
  onLogin
}: LandingPageViewProps) {

  return (
    <main className="min-h-screen bg-slate-50">

      <section className="p-6">

        <div className="
          relative overflow-hidden
          rounded-[40px]
          bg-gradient-to-br
          from-red-600 via-orange-500 to-teal-500
          p-10 md:p-12
          text-white
          shadow-xl
        ">

          <div className="
            absolute top-6 right-6
            hidden md:block
          ">

            <button
              onClick={onLogin}
              className="
                flex items-center gap-2
                rounded-full
                bg-white/20
                border border-white/40
                backdrop-blur
                px-6 py-3
                font-bold
                hover:bg-white
                hover:text-slate-900
                transition
              "
            >
              <LogIn size={18}/>
              Masuk Dashboard
            </button>

          </div>


          <div className="relative z-10 max-w-2xl">

            <div className="flex items-center gap-2 text-sm font-bold">
              <Sparkles size={18}/>
              SAKA PARIWISATA NASIONAL
            </div>


            <h1 className="
              mt-6
              text-4xl md:text-6xl
              font-black
              leading-tight
            ">
              Jelajah Nusantara,
              <br/>
              Berkarya untuk Pariwisata Indonesia
            </h1>


            <p className="
              mt-5
              text-lg
              text-white/90
            ">
              Platform digital Saka Pariwisata
              untuk anggota, destinasi,
              kegiatan, dan produk kreatif daerah.
            </p>


            <button
              onClick={()=>onSelectTab?.("tours")}
              className="
                mt-8
                rounded-full
                bg-white
                px-7 py-3
                text-slate-900
                font-bold
                flex items-center gap-2
                hover:scale-105
                transition
              "
            >
              Mulai Jelajah
              <ArrowRight size={18}/>
            </button>

          </div>


          <div className="
            hidden lg:flex
            absolute
            right-14 bottom-12
            w-72 h-72
            rounded-full
            bg-white/20
            backdrop-blur
            items-center justify-center
          ">
            <Map size={120}/>
          </div>

        </div>

      </section>

    </main>
  );
}

export default LandingPageView;
