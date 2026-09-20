// LandingPageView.tsx - UI Revision
// Perubahan hanya pada section Eksplorasi SPWNAPP menjadi Eksplorasi 4 Krida.
// Tidak mengubah Auth, Registrasi, Database, atau Logic.

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


{/* GANTI SECTION EKSPLORASI LAMA DENGAN INI */}

<section className="p-6 mt-8">

  <div className="
    bg-white rounded-3xl
    p-8 border shadow-sm
  ">

    <h2 className="
      text-2xl font-black
      text-blue-900
    ">
      Eksplorasi 4 Krida Saka Pariwisata
    </h2>

    <p className="text-slate-600 mt-2">
      Temukan minat, kembangkan potensi, dan berkontribusi untuk kemajuan pariwisata Indonesia.
    </p>


    <div className="
      grid md:grid-cols-2 xl:grid-cols-4
      gap-5 mt-6
    ">

      {kridaList.map((krida)=>(

        <div
          key={krida.title}
          className="
            rounded-3xl
            bg-gradient-to-br
            from-blue-50
            to-white
            p-6
            border
            hover:shadow-lg
            transition
          "
        >

          <div className="text-4xl">
            {krida.icon}
          </div>

          <h3 className="
            mt-4
            font-black
            text-blue-900
          ">
            {krida.title}
          </h3>

          <p className="
            mt-3
            text-slate-600
            text-sm
            leading-relaxed
          ">
            {krida.text}
          </p>

          <button
            className="
              mt-5
              text-blue-700
              font-bold
            "
          >
            Pelajari lebih lanjut →
          </button>

        </div>

      ))}

    </div>

  </div>

</section>
