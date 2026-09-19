
    
  
import React from "react";
import { QrCode, ShieldCheck } from "lucide-react";

interface DigitalMemberCardProps {
  member?: any;
  currentUser?: any;
  [key: string]: any;
}

export const DigitalMemberCard: React.FC<DigitalMemberCardProps> = ({
  member,
  currentUser,
}) => {
  const data = member || currentUser || {};

  const name = data.name || data.fullName || "Anggota Saka Pariwisata";
  const number = data.memberNumber || data.ktaNumber || data.nia || "SPWN-000000";
  const krida = data.krida || data.kridaName || "Saka Pariwisata";
  const photo = data.photo || data.avatar || "";

  return (
    <section className="relative overflow-hidden rounded-[2rem] p-6 md:p-8 text-white bg-gradient-to-br from-red-600 via-amber-400 to-teal-500 shadow-xl">
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/20" />

      <div className="relative">
        <div className="text-sm font-bold opacity-90">🇮🇩 SAKA PARIWISATA</div>

        <div className="mt-6 flex items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {photo ? (
              <img src={photo} alt={name} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/50" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black">
                {name.charAt(0)}
              </div>
            )}

            <div>
              <h2 className="text-xl md:text-2xl font-black">{name}</h2>
              <p className="text-sm opacity-90 mt-1">{number}</p>
              <span className="inline-flex items-center gap-1 mt-3 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                <ShieldCheck size={14} />
                {krida}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex w-28 h-28 rounded-2xl bg-white items-center justify-center text-slate-900">
            <QrCode size={72} />
          </div>
        </div>

        <div className="mt-6 text-xs font-bold opacity-80">DIGITAL MEMBER CARD</div>
      </div>
    </section>
  );
};

export default DigitalMemberCard;

