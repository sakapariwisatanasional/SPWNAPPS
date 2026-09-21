import React, { useState, useEffect } from 'react';
import {
  Compass, LayoutDashboard, Users, CreditCard, ShoppingBag,
  Settings, LogOut, Menu, X, Bell, RefreshCw, Layers
} from 'lucide-react';
import { CurrentUser, Member, KridaType } from './types';
import { storage } from './services/storage';
import { spreadsheetService } from './services/spreadsheetService';

// Page Views
import { LandingPageView } from './pages/LandingPageView';
import { DashboardView } from './pages/DashboardView';
import { KTAView } from './pages/KTAView';
import { MemberManagementView } from './pages/MemberManagementView';

// Modals & Common Components
import { AuthModal } from './components/auth/AuthModal';
import { SpreadsheetSyncModal } from './components/database/SpreadsheetSyncModal';
import { SakaLogo } from './components/common/SakaLogo';

export const App: React.FC = () => {
  // State Navigasi View
  const [currentView, setCurrentView] = useState<string>('landing');
  
  // State Sesi Pengguna
  const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(() => {
    return storage.getCurrentUser();
  });
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  // State Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ============================================================
  // INISIALISASI DATA & LISTENER NAVIGASI
  // ============================================================
  useEffect(() => {
    // 1. Muat member data aktif berdasarkan sesi akun
    const user = storage.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const members = storage.getMembers();
      const matchedMember = members.find(
        m => m.userId === user.id || m.email?.toLowerCase() === user.email?.toLowerCase()
      );
      if (matchedMember) {
        setCurrentMember(matchedMember);
      } else {
        // Fallback data profil anggota jika akun belum terhubung dengan tabel anggota
        setCurrentMember({
          id: user.username === 'admin_saka' ? 'SPW-000001' : `SPW-${Date.now().toString().slice(-6)}`,
          userId: user.id,
          fullName: user.name || user.username,
          nikMasked: '3204******1234',
          avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          gender: 'LAKI_LAKI',
          birthPlace: 'Jakarta',
          birthDate: '2000-01-01',
          phone: '081234567890',
          email: user.email || `${user.username}@spwn.id`,
          address: 'Kwartir Nasional Gerakan Pramuka',
          provinceId: '32',
          provinceName: 'Jawa Barat',
          regencyId: '32.04',
          regencyName: 'Kabupaten Bandung',
          districtId: '32.04.01',
          districtName: 'Soreang',
          joinYear: 2024,
          currentPosition: user.role === 'SUPER_ADMIN' ? 'Pimpinan Saka Nasional' : 'Kader Pramuka',
          krida: 'Krida Pemandu',
          educationLevel: 'S1 / Sarjana',
          occupation: 'Pegiat Wisata',
          bio: 'Kader Pramuka Saka Pariwisata yang siap memajukan pariwisata nusantara.',
          skills: ['Pemanduan', 'Sapta Pesona'],
          certifications: []
        });
      }
    }

    // 2. Global event listener untuk navigasi anti-macet
    const handleGlobalNav = (e: any) => {
      if (e.detail) {
        console.log('[App] Menerima sinyal navigasi ke:', e.detail);
        setCurrentView(e.detail);
      }
    };

    window.addEventListener('spwn_navigate_view', handleGlobalNav);
    return () => window.removeEventListener('spwn_navigate_view', handleGlobalNav);
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    storage.setCurrentUser(user);

    // Temukan data member terkait
    const members = storage.getMembers();
    const matched = members.find(
      m => m.userId === user.id || m.email?.toLowerCase() === user.email?.toLowerCase()
    );
    if (matched) {
      setCurrentMember(matched);
    }

    // Arahkan ke dashboard setelah login
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    storage.setCurrentUser(undefined);
    storage.setAuthToken('');
    setCurrentUser(undefined);
    setCurrentMember(null);
    setCurrentView('landing');
  };

  const openAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* =========================================================
          NAVBAR INTERNAL (HANYA MUNCUL DI LUAR LANDING PAGE)
      ========================================================= */}
      {currentView !== 'landing' && (
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo & Brand */}
            <div 
              onClick={() => setCurrentView('landing')} 
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="p-1 bg-white rounded-xl shadow-md group-hover:scale-105 transition-transform">
                <SakaLogo size={34} variant="full" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  SPWN<span className="text-emerald-400">Apps</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1">
                  Saka Pariwisata Nasional
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Beranda</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('kta')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  currentView === 'kta'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>KTA Digital</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('members')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  currentView === 'members'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Data Anggota</span>
              </button>
            </nav>

            {/* Action Buttons & User Profile */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(true)}
                title="Sinkronisasi Spreadsheet"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              {currentUser && (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <img
                    src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt="Profil"
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-bold text-white line-clamp-1 leading-tight">
                      {currentUser.name || currentUser.username}
                    </p>
                    <p className="text-[10px] text-emerald-400 capitalize">
                      {currentUser.role?.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    title="Keluar"
                    className="p-2 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden pt-3 pb-2 border-t border-slate-800 mt-3 space-y-1">
              <button
                type="button"
                onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }}
                className="w-full px-3 py-2 rounded-lg text-left text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Beranda Dashboard</span>
              </button>
              <button
                type="button"
                onClick={() => { setCurrentView('kta'); setIsMobileMenuOpen(false); }}
                className="w-full px-3 py-2 rounded-lg text-left text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>KTA Digital</span>
              </button>
              <button
                type="button"
                onClick={() => { setCurrentView('members'); setIsMobileMenuOpen(false); }}
                className="w-full px-3 py-2 rounded-lg text-left text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Data Anggota</span>
              </button>
              <button
                type="button"
                onClick={() => { setCurrentView('landing'); setIsMobileMenuOpen(false); }}
                className="w-full px-3 py-2 rounded-lg text-left text-xs font-bold text-slate-400 hover:bg-slate-800 flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Halaman Utama (Landing)</span>
              </button>
            </div>
          )}
        </header>
      )}

      {/* =========================================================
          KONTEN UTAMA SESUAI VIEW
      ========================================================= */}
      <main className="flex-1 w-full">
        {currentView === 'landing' && (
          <LandingPageView
            onOpenAuth={openAuth}
            currentUser={currentUser}
            onNavigateDashboard={() => setCurrentView('dashboard')}
            onNavigateStore={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'dashboard' && (
          <div className="bg-slate-50 text-slate-900 min-h-[90vh]">
            <DashboardView
              currentUser={currentUser}
              memberData={currentMember}
              onNavigate={(view) => setCurrentView(view)}
            />
          </div>
        )}

        {currentView === 'kta' && (
          <div className="bg-slate-50 text-slate-900 min-h-[90vh]">
            <KTAView
              currentUser={currentUser}
              memberData={currentMember}
            />
          </div>
        )}

        {currentView === 'members' && (
          <div className="bg-slate-50 text-slate-900 min-h-[90vh]">
            <MemberManagementView
              currentUser={currentUser}
              onOpenRegistration={() => openAuth('register')}
            />
          </div>
        )}
      </main>

      {/* =========================================================
          MODAL AUTENTIKASI (LOGIN / REGISTER)
      ========================================================= */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authInitialTab}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      {/* =========================================================
          MODAL SINKRONISASI SPREADSHEET
      ========================================================= */}
      {isSyncModalOpen && (
        <SpreadsheetSyncModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          onSyncComplete={() => {
            // Segarkan data anggota lokal setelah sync berhasil
            const user = storage.getCurrentUser();
            if (user) {
              const members = storage.getMembers();
              const matched = members.find(m => m.userId === user.id);
              if (matched) setCurrentMember(matched);
            }
          }}
        />
      )}

    </div>
  );
};

export default App;
