import React from "react";
import {
  User,
  MapPin,
  ShieldCheck,
  Phone,
  Mail,
  BadgeCheck
} from "lucide-react";

interface ProfileViewProps {
  currentUser?: any;
  members?: any[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  members = []
}) => {

  const user =
    currentUser ||
    members[0] ||
    {
      name: "Anggota Saka Pariwisata",
      role: "Anggota",
      region: "Indonesia"
    };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 p-6 space-y-6">

      <section className="
        rounded-[2rem]
        p-8
        bg-gradient-to-br from-emerald-950 via-teal-700 to-amber-500
        text-white shadow-2xl
      ">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div className="
            w-24 h-24 rounded-full
            bg-white/20
            flex items-center justify-center
            text-4xl font-black
          ">
            {(user.name || "A").charAt(0)}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black">
                {user.name || "Anggota"}
              </h1>

              <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-bold flex items-center gap-2">
                <BadgeCheck size={16}/>
                Aktif
              </span>
            </div>

            <p className="mt-2 text-white/90">
              Profil Anggota Saka Pariwisata
            </p>

            <div className="mt-4 inline-flex rounded-full bg-black/20 px-4 py-2 text-sm font-bold">
              {user.role || "Anggota"}
            </div>
          </div>

        </div>

      </section>


      <section className="
        bg-white rounded-[2rem]
        border p-8
        grid md:grid-cols-2 gap-5
      ">

        <Info
          icon={<User/>}
          label="Nama Lengkap"
          value={user.name || "-"}
          accent="emerald"
        />

        <Info
          icon={<ShieldCheck/>}
          label="Role"
          value={user.role || "Anggota"}
        />

        <Info
          icon={<MapPin/>}
          label="Wilayah"
          value={user.region || user.location || "Indonesia"}
        />

        <Info
          icon={<BadgeCheck/>}
          label="Status"
          value="Aktif"
        />

        <Info
          icon={<Phone/>}
          label="Telepon"
          value={user.phone || "-"}
        />

        <Info
          icon={<Mail/>}
          label="Email"
          value={user.email || "-"}
        />

      </section>


      <section className="
        bg-white rounded-[2rem]
        border p-8
      ">

        <h2 className="text-2xl font-black mb-4">
          Keanggotaan
        </h2>

        <div className="
          rounded-2xl bg-gradient-to-r from-emerald-50 to-slate-50 p-5 border border-emerald-100
        ">

          <p className="font-bold">
            {String(user.role || '').toUpperCase().includes('ADMIN')
              ? 'Akses Administrator Saka Pariwisata'
              : 'Data keanggotaan Saka Pariwisata'}
          </p>

          <p className="text-slate-500 mt-2">
            {String(user.role || '').toUpperCase().includes('ADMIN')
              ? 'Memiliki akses pengelolaan data anggota, aktivitas, dan layanan sistem.'
              : 'Profil dapat diperbarui melalui fitur koreksi data.'}
          </p>

        </div>

      </section>


    </main>
  );
};


function Info({
  icon,
  label,
  value
}:any){

return (
<div className="
flex gap-4
items-center
bg-slate-50
rounded-2xl
p-5
border border-slate-100
hover:shadow-md
transition
">

<div className="
text-emerald-700
bg-emerald-100
rounded-xl
p-3
">
{icon}
</div>

<div>
<p className="text-sm text-slate-500">
{label}
</p>

<p className="font-bold text-lg">
{value}
</p>
</div>

</div>
)

}


export default ProfileView;
