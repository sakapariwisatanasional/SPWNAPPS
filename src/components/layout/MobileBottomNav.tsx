import React from 'react';
import { 
  Home, 
  Compass, 
  Utensils, 
  Users, 
  CreditCard, 
  Menu,
  ChevronUp
} from 'lucide-react';
import { CurrentUser } from '../../types';

interface MobileBottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: CurrentUser;
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenMobileMenu
}) => {
  const isMember = currentUser.role === 'MEMBER';

  return (
    <div className="app-mobile-nav lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1.5 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] safe-area-bottom">
      <nav className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Landing Page / Beranda */}
        <button
          onClick={() => onSelectTab('landing')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[52px] rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 focus-visible:ring-offset-1 ${
            currentTab === 'landing'
              ? 'text-fuchsia-700 font-bold bg-fuchsia-50/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
          aria-label="Beranda"
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${currentTab === 'landing' ? 'text-fuchsia-700 stroke-[2.5]' : 'text-slate-400'}`} />
            {currentTab === 'landing' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-fuchsia-600 rounded-full animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-tight font-medium">Beranda</span>
        </button>

        {/* 2. Paket Wisata (Carousel & List) */}
        <button
          onClick={() => onSelectTab('tours')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[52px] rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 focus-visible:ring-offset-1 ${
            currentTab === 'tours'
              ? 'text-fuchsia-700 font-bold bg-fuchsia-50/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
          aria-label="Paket Wisata"
        >
          <Compass className={`w-5 h-5 ${currentTab === 'tours' ? 'text-fuchsia-700 stroke-[2.5]' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-1 leading-tight font-medium">Wisata</span>
        </button>

        {/* 3. Kuliner & Cinderamata */}
        <button
          onClick={() => onSelectTab('culinary-souvenirs')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[52px] rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 focus-visible:ring-offset-1 relative ${
            currentTab === 'culinary-souvenirs'
              ? 'text-fuchsia-700 font-bold bg-fuchsia-50/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
          aria-label="Kuliner dan Cinderamata"
        >
          <div className="relative">
            <Utensils className={`w-5 h-5 ${currentTab === 'culinary-souvenirs' ? 'text-fuchsia-700 stroke-[2.5]' : 'text-slate-400'}`} />
            <span className="absolute -top-1.5 -right-3 text-[8px] bg-amber-500 text-slate-950 font-extrabold px-1 rounded-full border border-white">
              Baru
            </span>
          </div>
          <span className="text-[10px] mt-1 leading-tight font-medium">Kuliner</span>
        </button>

        {/* 4. Keanggotaan / KTA */}
        <button
          onClick={() => onSelectTab(isMember ? 'my-card' : 'members')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[52px] rounded-2xl transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 focus-visible:ring-offset-1 ${
            (currentTab === 'members' || currentTab === 'my-card')
              ? 'text-fuchsia-700 font-bold bg-fuchsia-50/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
          aria-label={isMember ? 'KTA Saya' : 'Anggota'}
        >
          {isMember ? (
            <CreditCard className={`w-5 h-5 ${(currentTab === 'members' || currentTab === 'my-card') ? 'text-fuchsia-700 stroke-[2.5]' : 'text-slate-400'}`} />
          ) : (
            <Users className={`w-5 h-5 ${(currentTab === 'members' || currentTab === 'my-card') ? 'text-fuchsia-700 stroke-[2.5]' : 'text-slate-400'}`} />
          )}
          <span className="text-[10px] mt-1 leading-tight font-medium">
            {isMember ? 'KTA Saya' : 'Anggota'}
          </span>
        </button>

        {/* 5. Menu Lainnya (Drawer trigger) */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[52px] rounded-2xl text-slate-600 hover:text-fuchsia-700 hover:bg-slate-50 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 focus-visible:ring-offset-1"
          aria-label="Menu Lengkap" title="Buka menu lengkap"
        >
          <div className="relative w-8 h-8 rounded-xl bg-slate-100 hover:bg-fuchsia-50 border border-slate-200 flex items-center justify-center transition-colors">
            <Menu className="w-4 h-4 text-slate-700" />
            <ChevronUp className="absolute -top-1 -right-1 w-3 h-3 text-fuchsia-600 bg-white rounded-full" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight font-medium">Menu</span>
        </button>
      </nav>
    </div>
  );
};
