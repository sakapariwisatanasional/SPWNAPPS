import React from "react";
import {
  Sparkles,
  Users,
  CalendarDays,
  MapPin,
  ShoppingBag,
  LogIn,
  UserPlus,
  ArrowRight
} from "lucide-react";

interface LandingPageViewProps {
  members?: any[];
  tours?: any[];
  culinaryItems?: any[];
  activities?: any[];
  onSelectTab?: (tab: string) => void;
  onEnterDashboard?: (tab?: string) => void;
  onOpenLoginModal?: () => void;
  onOpenRegisterModal?: () => void;
}

const kridaList = [
  {
    title: "KRIDA PENYULUH",
    icon: "📢",
    text: "Mengembangkan kemampuan komunikasi dan edukasi untuk menyebarkan kesadaran pariwisata."
  },
  {
    title: "KRIDA PEMANDU",
    icon: "🗺️",
    text: "Mengasah keterampilan pemanduan dan pelayanan wisata yang profesional dan berkarakter."
  },
  {
    title: "KRIDA MICE & EVENT",
    icon: "📅",
    text: "Mengembangkan kreativitas dalam perencanaan dan pelaksanaan kegiatan pariwisata, MICE dan event."
  },
  {
    title: "KRIDA KULINER & CINDERAMATA",
    icon: "🍽️",
    text: "Menggali dan mengembangkan potensi kuliner khas serta produk cinderamata daerah."
  }
];

export function LandingPageView({
  members = [],
  tours = [],
  culinaryItems = [],
  activities = [],
  onOpenLoginModal,
  onOpenRegisterModal
}: LandingPageViewProps) {

  const stats = [
    {
      title: "Anggota",
      value: members.length,
      icon: Users
    },
    {
      title: "Aktivitas",
      value: activities.length,
      icon: CalendarDays
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
    <main className="min-h-screen bg-slate-50">

      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center">

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-700 to-yellow-400 flex items-center justify-center text-white font-black text-2xl">
            S
          </div>

          <div>
            <h2 className="font-black text-blue-900">
              SAKA PARIWISATA
            </h2>
            <p className="text-xs text-slate-500">
              Platform Digital Nasional
            </p>
          </div>
        </div>

        <div className="flex gap-3">

          <button
            onClick={onOpenLoginModal}
            className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full border border-blue-700 text-blue-700 font-bold hover:bg-blue-700 hover:text-white transition"
          >
            <LogIn size={17}/>
            Masuk
          </button>

          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-700 text-white font-bold hover:bg-blue-800 transition"
          >
            <UserPlus size={17}/>
            Daftar
          </button>

        </div>

      </header>


      <section className="p-6">

        <div className="relative overflow-hidden rounded-[40px] min-h-[520px] p-8 md:p-14 text-white shadow-2xl bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500">

          <div className="absolute inset-0 bg-black/20"></div>

          <div className="relative z-10 max-w-3xl">

            <div className="flex gap-2 items-center font-bold">
              <Sparkles size={20}/>
              SAKA PARIWISATA NASIONAL
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-black leading-tight">
              Membangun Generasi Muda Penggerak Pariwisata Indonesia
            </h1>

            <p className="mt-6 text-lg text-white/90">
              Platform digital untuk keanggotaan, aktivitas, pembelajaran,
              destinasi, dan karya kreatif Saka Pariwisata.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <button
                onClick={onOpenLoginModal}
                className="bg-white text-blue-900 px-7 py-3 rounded-full font-black flex items-center gap-2"
              >
                <LogIn size={18}/>
                Masuk Aplikasi
              </button>

              <button
                onClick={onOpenRegisterModal}
                className="bg-white/20 border border-white/40 px-7 py-3 rounded-full font-black flex items-center gap-2"
              >
                <UserPlus size={18}/>
                Daftar Anggota
              </button>

            </div>

          </div>

        </div>

      </section>


      <section className="px-6 grid grid-cols-2 xl:grid-cols-4 gap-5">

        {stats.map((item:any)=>{

          const Icon = item.icon;

          return (
            <div key={item.title} className="bg-white rounded-3xl p-6 shadow-sm border">

              <Icon className="text-blue-700"/>

              <div className="text-4xl font-black mt-4">
                {item.value}
              </div>

              <div className="font-bold text-slate-600">
                {item.title}
              </div>

            </div>
          )

        })}

      </section>


      <section className="p-6 mt-8">

        <div className="bg-white rounded-3xl p-8 border shadow-sm">

          <h2 className="text-2xl font-black text-blue-900">
            Eksplorasi 4 Krida Saka Pariwisata
          </h2>

          <p className="text-slate-600 mt-2">
            Temukan minat, kembangkan potensi, dan berkontribusi untuk kemajuan pariwisata Indonesia.
          </p>


          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 mt-6">

            {kridaList.map((krida)=>(

              <div
                key={krida.title}
                className="rounded-3xl bg-gradient-to-br from-blue-50 to-white p-6 border hover:shadow-lg transition"
              >

                <div className="text-4xl">
                  {krida.icon}
                </div>

                <h3 className="mt-4 font-black text-blue-900">
                  {krida.title}
                </h3>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  {krida.text}
                </p>

                <button className="mt-5 text-blue-700 font-bold flex items-center gap-2">
                  Pelajari lebih lanjut
                  <ArrowRight size={16}/>
                </button>

              </div>

            ))}

          </div>

        </div>

      </section>

    </main>
  );
}
