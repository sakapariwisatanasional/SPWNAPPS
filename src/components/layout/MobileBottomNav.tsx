import React from "react";
import {
  Home,
  Compass,
  Map,
  CalendarDays,
  CreditCard,
  ShoppingBag
} from "lucide-react";

interface MobileBottomNavProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
  currentUser?: any;
  onOpenMobileMenu?: () => void;
  [key: string]: any;
}

const navigationItems = [
  {
    id: "dashboard",
    label: "Home",
    icon: Home
  },
  {
    id: "krida",
    label: "Krida",
    icon: Compass
  },
  {
    id: "tourism",
    label: "Wisata",
    icon: Map
  },
  {
    id: "activities",
    label: "Aktivitas",
    icon: CalendarDays
  },
  {
    id: "member",
    label: "Kartu",
    icon: CreditCard
  },
  {
    id: "store",
    label: "Store",
    icon: ShoppingBag
  }
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab = "dashboard",
  onSelectTab
}) => {

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        lg:hidden
        px-3 pb-3
      "
    >

      <div
        className="
          bg-white/90
          backdrop-blur-xl
          border border-slate-200
          rounded-[2rem]
          shadow-xl
          px-2 py-2
          flex items-center
          justify-around
        "
      >

        {navigationItems.map((item)=>{

          const Icon = item.icon;
          const active = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={()=>onSelectTab?.(item.id)}
              className="
                relative
                flex flex-col
                items-center
                justify-center
                gap-1
                min-w-[48px]
                py-2
                transition
              "
            >

              <div
                className={`
                  w-10 h-10
                  rounded-2xl
                  flex items-center justify-center
                  transition-all
                  ${
                    active
                    ? "bg-red-600 text-white shadow-md"
                    : "text-slate-500"
                  }
                `}
              >
                <Icon size={20}/>
              </div>

              <span
                className={`
                  text-[11px]
                  font-bold
                  ${
                    active
                    ? "text-red-600"
                    : "text-slate-500"
                  }
                `}
              >
                {item.label}
              </span>

            </button>
          );

        })}

      </div>

    </nav>
  );
};

export default MobileBottomNav;
