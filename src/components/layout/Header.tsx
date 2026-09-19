import React from "react";
import {
  Bell,
  Search,
  LogOut,
  UserCircle,
  Menu
} from "lucide-react";

interface HeaderProps {
  currentUser?: any;
  currentTab?: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onLogout?: () => void;
  onSelectTab?: (tab: string) => void;
  onOpenMobileMenu?: () => void;
  onOpenRegisterModal?: () => void;
  onNotificationClick?: () => void;
  [key: string]: any;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  searchQuery = "",
  onSearchChange,
  onLogout,
  onOpenMobileMenu,
  onNotificationClick
}) => {

  return (
    <header className="
      sticky top-0 z-40
      bg-white/85 backdrop-blur-xl
      border-b border-slate-200
      px-4 md:px-6 py-3
    ">
      <div className="
        flex items-center justify-between gap-4
        max-w-screen-2xl mx-auto
      ">

        <div className="flex items-center gap-3">

          <button
            onClick={onOpenMobileMenu}
            className="
              lg:hidden
              w-10 h-10 rounded-2xl
              bg-slate-50
              flex items-center justify-center
            "
          >
            <Menu size={20}/>
          </button>

          <div className="
            w-11 h-11 rounded-2xl
            bg-gradient-to-br
            from-red-600 via-amber-400 to-teal-500
            flex items-center justify-center
            text-white font-black text-xl
          ">
            S
          </div>

          <div>
            <h1 className="font-black text-slate-900">
              Saka Pariwisata
            </h1>
            <p className="text-xs text-slate-500">
              Wonderful Indonesia
            </p>
          </div>

        </div>


        <div className="
          hidden md:flex
          flex-1 max-w-md
        ">
          <div className="
            w-full
            bg-slate-50
            rounded-2xl
            flex items-center
            px-4 py-2.5
          ">
            <Search size={18} className="text-slate-400"/>

            <input
              value={searchQuery}
              onChange={(e)=>onSearchChange?.(e.target.value)}
              placeholder="Cari wisata, kegiatan, anggota..."
              className="
                ml-3 flex-1
                bg-transparent
                outline-none
                text-sm
              "
            />
          </div>
        </div>


        <div className="flex items-center gap-2">

          <button
            onClick={onNotificationClick}
            className="
              relative
              w-10 h-10 rounded-2xl
              bg-slate-50
              flex items-center justify-center
            "
          >
            <Bell size={20}/>
            <span className="
              absolute top-2 right-2
              w-2 h-2 rounded-full
              bg-red-600
            "/>
          </button>


          <div className="
            hidden sm:flex
            items-center gap-2
            px-3 py-2
            rounded-2xl
            bg-slate-50
          ">

            {currentUser?.photo ? (
              <img
                src={currentUser.photo}
                alt="profile"
                className="
                  w-9 h-9 rounded-xl
                  object-cover
                "
              />
            ) : (
              <UserCircle
                size={36}
                className="text-slate-400"
              />
            )}

            <div className="hidden lg:block">
              <p className="text-sm font-bold">
                {currentUser?.name || "Anggota"}
              </p>
              <p className="text-xs text-teal-600">
                {currentUser?.krida || "Saka Pariwisata"}
              </p>
            </div>

          </div>


          {onLogout && (
            <button
              onClick={onLogout}
              className="
                hidden md:flex
                w-10 h-10 rounded-2xl
                items-center justify-center
                text-slate-500
                hover:text-red-600
              "
            >
              <LogOut size={19}/>
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

export default Header;
