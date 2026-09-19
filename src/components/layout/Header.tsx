import React from "react";
import { Bell, ChevronDown, UserCircle } from "lucide-react";

interface HeaderProps {
  currentUser?: any;
  onProfileClick?: () => void;
  onNotificationClick?: () => void;
  [key: string]: any;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onProfileClick,
  onNotificationClick
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 via-amber-400 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md">
            S
          </div>

          <div>
            <h1 className="text-base md:text-lg font-black text-slate-900">
              Saka Pariwisata
            </h1>
            <p className="text-xs text-slate-500">
              Jelajah Nusantara • Wonderful Indonesia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">

          <button
            onClick={onNotificationClick}
            className="relative w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-red-50 transition"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600" />
          </button>

          <button
            onClick={onProfileClick}
            className="flex items-center gap-2 rounded-2xl px-2 py-1.5 hover:bg-slate-50 transition"
          >
            {currentUser?.photo ? (
              <img
                src={currentUser.photo}
                alt="profile"
                className="w-10 h-10 rounded-2xl object-cover"
              />
            ) : (
              <UserCircle size={38} className="text-slate-400" />
            )}

            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-slate-900">
                {currentUser?.name || "Anggota"}
              </p>
              <p className="text-xs text-teal-600 font-semibold">
                {currentUser?.krida || "Saka Pariwisata"}
              </p>
            </div>

            <ChevronDown size={16} className="hidden md:block" />
          </button>

        </div>

      </div>
    </header>
  );
};

export default Header;
