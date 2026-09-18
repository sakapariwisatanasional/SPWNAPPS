import React from "react";
import {
  Home,
  Compass,
  CalendarDays,
  CreditCard,
  ShoppingBag,
  User,
  ShieldCheck,
  LogOut
} from "lucide-react";

interface SidebarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const menuItems = [
  { id: "dashboard", label: "Beranda", icon: Home },
  { id: "krida", label: "Krida Saya", icon: Compass },
  { id: "wisata", label: "Wisata Nusantara", icon: Compass },
  { id: "activity", label: "Aktivitas", icon: CalendarDays },
  { id: "member-card", label: "Kartu Anggota", icon: CreditCard },
  { id: "store", label: "Store", icon: ShoppingBag },
  { id: "profile", label: "Profil", icon: User }
];

export function Sidebar({
  activePage = "dashboard",
  onNavigate,
  isAdmin = false,
  onLogout
}: SidebarProps) {

  const menus = [
    ...menuItems,
    ...(isAdmin
      ? [{ id: "admin", label: "Admin Panel", icon: ShieldCheck }]
      : [])
  ];

  return (
    <aside className="
      hidden lg:flex flex-col w-72 min-h-screen
      bg-white/90 backdrop-blur-xl
      border-r border-slate-200
      px-5 py-6
    ">

      <div className="
        flex items-center gap-3 mb-10
      ">
        <div className="
          w-14 h-14 rounded-3xl
          bg-gradient-to-br from-red-600 via-amber-400 to-teal-500
          flex items-center justify-center
          text-white font-black text-2xl
          shadow-lg
        ">
          S
        </div>

        <div>
          <h1 className="font-black text-xl text-slate-900">
            SPWN
          </h1>
          <p className="text-xs text-slate-500">
            Saka Pariwisata
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menus.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={`
                w-full flex items-center gap-4
                px-4 py-3.5 rounded-2xl
                transition-all duration-300
                ${active
                  ? "bg-red-50 text-red-600 shadow-sm font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-red-600"}
              `}
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {onLogout && (
        <button
          onClick={onLogout}
          className="
            flex items-center gap-3
            px-4 py-3 rounded-2xl
            text-slate-500
            hover:bg-red-50 hover:text-red-600
            transition
          "
        >
          <LogOut size={20} />
          Keluar
        </button>
      )}

    </aside>
  );
}

export default Sidebar;
