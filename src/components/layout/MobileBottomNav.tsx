import React from "react";

import {
  Home,
  Compass,
  CalendarDays,
  CreditCard,
  User,
  Store
} from "lucide-react";

interface MobileBottomNavProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
}

const menus = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "krida", label: "Krida", icon: Compass },
  { id: "activity", label: "Aktivitas", icon: CalendarDays },
  { id: "member-card", label: "Kartu", icon: CreditCard },
  { id: "store", label: "Store", icon: Store },
];

export function MobileBottomNav({
  activePage = "dashboard",
  onNavigate,
}: MobileBottomNavProps) {
  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50 lg:hidden
        px-4 pb-4 pt-2
      "
    >
      <div
        className="
          bg-white/90 backdrop-blur-xl
          border border-slate-200
          rounded-[2rem]
          shadow-xl
          flex items-center justify-around
          px-2 py-2
        "
      >
        {menus.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={`
                relative flex flex-col items-center justify-center
                min-w-[58px] py-2 rounded-2xl
                transition-all duration-300
                ${
                  active
                    ? "text-red-600 bg-red-50 font-bold scale-105"
                    : "text-slate-500 hover:text-red-600"
                }
              `}
            >
              {active && (
                <span className="absolute -top-1 w-8 h-1 rounded-full bg-gradient-to-r from-red-600 via-amber-400 to-teal-500" />
              )}

              <Icon
                size={22}
                strokeWidth={active ? 2.7 : 2}
              />

              <span className="text-[10px] mt-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
