import React from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  Utensils, 
  Users, 
  CreditCard, 
  Menu
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-1 shadow-2xl safe-area-bottom">
      <nav className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Dashboard / Beranda */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl transition-all cursor-pointer ${
            currentTab === 'dashboard'
              ? 'text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Beranda"
        >
          <div className="relative">
            <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'text-purple-700 stroke-[2.5]' : 'text-slate-400'}`} />
            {currentTab === 'dashboard' && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-[10px] mt-1 leading-tight font-medium">Beranda</span>
        </button>

        {/* 2. Paket Wisata (Carousel & List) */}
        <button
          onClick={() => onSelectTab('tours')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl transition-all cursor-pointer ${
            currentTab === 'tours'
              ? 'text-teal-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Paket Wisata"
        >
          <Compass className={`w-5 h-5 ${currentTab === 'tours' ? 'text-teal-700 stroke-[2.5]' : 'text-slate-400'}`} />
          <span className="text-[10px] mt-1 leading-tight font-medium">Wisata</span>
        </button>

        {/* 3. Kuliner & Cinderamata */}
        <button
          onClick={() => onSelectTab('culinary-souvenirs')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl transition-all cursor-pointer relative ${
            currentTab === 'culinary-souvenirs'
              ? 'text-amber-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Kuliner dan Cinderamata"
        >
          <div className="relative">
            <Utensils className={`w-5 h-5 ${currentTab === 'culinary-souvenirs' ? 'text-amber-600 stroke-[2.5]' : 'text-slate-400'}`} />
            <span className="absolute -top-1.5 -right-3 text-[8px] bg-amber-500 text-slate-950 font-extrabold px-1 rounded-full border border-white">
              Baru
            </span>
          </div>
          <span className="text-[10px] mt-1 leading-tight font-medium">Kuliner</span>
        </button>

        {/* 4. Keanggotaan / KTA */}
        <button
          onClick={() => onSelectTab(isMember ? 'my-card' : 'members')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl transition-all cursor-pointer ${
            (currentTab === 'members' || currentTab === 'my-card')
              ? 'text-purple-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label={isMember ? 'KTA Saya' : 'Anggota'}
        >
          {isMember ? (
            <CreditCard className={`w-5 h-5 ${(currentTab === 'members' || currentTab === 'my-card') ? 'text-purple-700 stroke-[2.5]' : 'text-slate-400'}`} />
          ) : (
            <Users className={`w-5 h-5 ${(currentTab === 'members' || currentTab === 'my-card') ? 'text-purple-700 stroke-[2.5]' : 'text-slate-400'}`} />
          )}
          <span className="text-[10px] mt-1 leading-tight font-medium">
            {isMember ? 'KTA Saya' : 'Anggota'}
          </span>
        </button>

        {/* 5. Menu Lainnya (Drawer trigger) */}
        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl text-slate-600 hover:text-purple-700 transition-all cursor-pointer"
          aria-label="Menu Lengkap"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-purple-50 flex items-center justify-center">
            <Menu className="w-4 h-4 text-slate-700" />
          </div>
          <span className="text-[10px] mt-0.5 leading-tight font-medium">Menu</span>
        </button>
      </nav>
    </div>
  );
};
