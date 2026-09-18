import React from "react";
import { QrCode, ShieldCheck, Sparkles } from "lucide-react";

interface DigitalMemberCardProps {
  member: any;
  onVerifyClick?: (member: any) => void;
  onEditCard?: () => void;
  showControls?: boolean;
}

export const DigitalMemberCard: React.FC<DigitalMemberCardProps> = ({
  member,
  onVerifyClick,
  onEditCard,
  showControls = true,
}) => {
  return (
    <div className="w-full max-w-[420px]">
      <div
        className="
          relative overflow-hidden
          rounded-[2rem]
          p-6
          text-white
          shadow-2xl
          bg-gradient-to-br
          from-red-600 via-amber-500 to-teal-500
        "
      >
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/20 blur-3xl" />

        <div className="relative flex justify-between items-start">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/80">
              Saka Pariwisata
            </p>
            <h2 className="text-xl font-black mt-1">
              Kartu Anggota Digital
            </h2>
          </div>

          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="mt-8 flex gap-4 items-center">
          <div className="
            w-20 h-20 rounded-2xl
            bg-white/20
            flex items-center justify-center
            font-black text-2xl
          ">
            {member?.fullName?.charAt(0) || "S"}
          </div>

          <div>
            <h3 className="font-black text-lg">
              {member?.fullName || "Nama Anggota"}
            </h3>
            <p className="text-sm text-white/80">
              {member?.nationalMemberNumber || "NTA"}
            </p>
            <p className="text-xs mt-1">
              {member?.krida || "Anggota Saka Pariwisata"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-end">
          <div>
            <p className="text-[10px] text-white/70">
              STATUS
            </p>
            <p className="font-bold">
              {member?.status || "AKTIF"}
            </p>
          </div>

          <div className="
            w-16 h-16 rounded-xl
            bg-white
            text-slate-900
            flex items-center justify-center
          ">
            <QrCode />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs">
          <Sparkles size={14} />
          Wonderful Indonesia
        </div>
      </div>

      {showControls && (
        <div className="flex gap-2 mt-4">
          {onVerifyClick && (
            <button
              onClick={() => onVerifyClick(member)}
              className="flex-1 rounded-2xl bg-red-600 text-white py-3 font-bold"
            >
              Verifikasi
            </button>
          )}

          {onEditCard && (
            <button
              onClick={onEditCard}
              className="flex-1 rounded-2xl border py-3 font-bold"
            >
              Edit Kartu
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DigitalMemberCard;
