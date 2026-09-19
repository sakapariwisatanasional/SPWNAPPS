
    
  
        <h2 className="font-black text-xl mb-4">
          Quick Krida
        </h2>

        <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-4
        ">
          {krida.map(({title, icon:Icon, style})=>(
            <button
              key={title}
              onClick={()=>onSelectTab?.("krida-modules")}
              className="
                bg-white
                rounded-3xl
                p-5
                border
                text-left
                hover:-translate-y-1
                transition
              "
            >
              <div className={`
                w-12 h-12
                rounded-2xl
                flex items-center justify-center
                ${style}
              `}>
                <Icon/>
              </div>

              <b className="block mt-4">
                {title}
              </b>
            </button>
          ))}
        </div>
      </section>


      <section>
        <DigitalMemberCard
          member={currentUser}
        />
      </section>


      <section className="
        grid
        md:grid-cols-3
        gap-4
      ">

        <div className="
          bg-white
          rounded-3xl
          p-6
          border
        ">
          <Users/>
          <b className="block text-3xl mt-2">
            {members.length}
          </b>
          <span>
            Total Anggota
          </span>
        </div>


        <div className="
          bg-white
          rounded-3xl
          p-6
          border
        ">
          <Calendar/>
          <b className="block text-3xl mt-2">
            {activities.length}
          </b>
          <span>
            Aktivitas
          </span>
        </div>


        <div className="
          bg-white
          rounded-3xl
          p-6
          border
        ">
          <MapPin/>
          <b className="block text-xl mt-3">
            Indonesia
          </b>
          <span>
            Jelajah Nusantara
          </span>
        </div>

      </section>


      <section>
        <CulinarySouvenirGallerySection
          items={culinaryItems}
          currentUser={currentUser}
          onSelectItemDetail={onSelectItemDetail}
          onOpenFormModal={onOpenFormModal}
        />
      </section>


      <section>
        <NationalMapVisual
          members={members}
          regionData={regionData}
        />
      </section>

    </main>
  );
};

export default DashboardView;

