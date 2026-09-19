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
    <main className="min-h-screen bg-slate-50 p-6 space-y-6">

      <section className="
        rounded-[2rem]
        p-8
        bg-gradient-to-br from-red-600 via-orange-500 to-teal-500
        text-white shadow-xl
      ">

        <div className="flex items-center gap-5">

          <div className="
            w-24 h-24 rounded-full
            bg-white/20
            flex items-center justify-center
            text-4xl font-black
          ">
            {(user.name || "A").charAt(0)}
          </div>

          <div>
            <h1 className="text-4xl font-black">
              {user.name || "Anggota"}
            </h1>

            <p className="mt-2 text-white/90">
              Profil Anggota Saka Pariwisata
            </p>
          </div>

        </div>

      </section>


      <section className="
        bg-white rounded-[2rem]
        border p-8
        grid md:grid-cols-2 gap-6
      ">

        <Info
          icon={<User/>}
          label="Nama Lengkap"
          value={user.name || "-"}
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
          rounded-2xl bg-slate-50 p-5
        ">

          <p>
            Data keanggotaan Saka Pariwisata
          </p>

          <p className="text-slate-500 mt-2">
            Profil dapat diperbarui melalui fitur koreksi data.
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
">

<div className="text-red-600">
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
