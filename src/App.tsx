import React, { useState, useEffect } from 'react';
import {
  Compass, LayoutDashboard, Users, CreditCard, ShoppingBag,
  Settings, LogOut, Menu, X, Bell, RefreshCw, Layers,
  Download, QrCode, ArrowLeft
} from 'lucide-react';
import { CurrentUser, Member, KridaType } from './types';
import { storage } from './services/storage';
import { spreadsheetService } from './services/spreadsheetService';

// Page Views
import { LandingPageView } from './pages/LandingPageView';
import { DashboardView } from './pages/DashboardView';
import { MemberManagementView } from './pages/MemberManagementView';

// Modals & Common Components
import { AuthModal } from './components/auth/AuthModal';
import { SpreadsheetSyncModal } from './components/database/SpreadsheetSyncModal';
import { SakaLogo } from './components/common/SakaLogo';

// ============================================================
// KOMPONEN INLINE KTA VIEW (Mencegah error import file eksternal)
// ============================================================
interface KTAInlineViewProps {
  currentUser?: CurrentUser;
  memberData?: Member | null;
  onBack?: () => void;
}

const KTAInlineView: React.FC<KTAInlineViewProps> = ({ currentUser, memberData, onBack }) => {
  const [activeSide, setActiveSide] = useState<'DEPAN' | 'BELAKANG'>('DEPAN');

  const name = memberData?.fullName || currentUser?.name || currentUser?.username || 'Kader Saka Pariwisata';
  const ktaNumber = memberData?.id || currentUser?.id || 'SPW-3204-00291';
  const role = currentUser?.role === 'SUPER_ADMIN' ? 'Pimpinan Saka Nasional' : (memberData?.currentPosition || 'Anggota Saka Pariwisata');
  const krida = memberData?.krida || 'Krida Pemandu';
  const province = memberData?.provinceName || 'Jawa Barat';
  const regency = memberData?.regencyName || 'Kabupaten Bandung';
  const photoUrl = memberData?.avatarUrl || currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Beranda</span>
            </button>
          )}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>KTA Digital Resmi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Kartu Tanda Anggota (KTA)
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Identitas resmi kader & pengurus Saka Pariwisata terverifikasi nasional.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSide('DEPAN')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSide === 'DEPAN'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sisi Depan
          </button>
          <button
            type="button"
            onClick={() => setActiveSide('BELAKANG')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSide === 'BELAKANG'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sisi Belakang
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative w-full max-w-[500px] aspect-[85.6/53.98] rounded-2xl overflow-hidden shadow-2xl border border-slate-300 bg-slate-900 select-none">
          {activeSide === 'DEPAN' ? (
            <div className="relative w-full h-full">
              <img
                src="/assets/kta/KTA_MASTER_DEPAN.png"
                alt="KTA Depan"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 p-5 flex flex-col justify-between text-slate-900 pointer-events-none">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      {role}
                    </span>
                    <p className="text-[10px] font-bold text-slate-700">{ktaNumber}</p>
                  </div>
                </div>

                <div className="flex items-end gap-3.5 pt-4">
                  <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-emerald-600 shadow-md bg-slate-200 shrink-0">
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm md:text-base font-black text-slate-900 uppercase leading-tight">
                      {name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-700">{krida}</p>
                    <p className="text-[9px] text-slate-600">{regency}, {province}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img
                src="/assets/kta/KTA_MASTER_BELAKANG.png"
                alt="KTA Belakang"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-slate-800 pointer-events-none">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-slate-900">Ketentuan Pemegang KTA</h4>
                  <p className="text-[8px] text-slate-600 leading-tight">
                    1. Kartu ini adalah bukti identitas sah anggota Saka Pariwisata Nasional.<br />
                    2. Dilarang menyalahgunakan kartu untuk kegiatan di luar ketentuan Gerakan Pramuka.<br />
                    3. Jika menemukan kartu ini, harap kembalikan ke Kwartir terdekat.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="p-1 bg-white rounded border border-slate-300">
                    <QrCode className="w-10 h-10 text-slate-900" />
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold block text-slate-700">Tanda Pengesahan</span>
                    <span className="text-[8px] text-slate-500 block">Kwartir Nasional</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSide(activeSide === 'DEPAN' ? 'BELAKANG' : 'DEPAN')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-300 transition-all cursor-pointer"
          >
            <span>Balik Kartu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// APLIKASI UTAMA
// ============================================================
export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | undefined>(() => {
    return storage.getCurrentUser();
  });
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
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

    const handleGlobalNav = (e: any) => {
      if (e.detail) {
        console.log('[App] Navigasi ke:', e.detail);
        setCurrentView(e.detail);
      }
    };

    window.addEventListener('spwn_navigate_view', handleGlobalNav);
    return () => window.removeEventListener('spwn_navigate_view', handleGlobalNav);
  }, []);

  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    storage.setCurrentUser(user);

    const members = storage.getMembers();
    const matched = members.find(
      m => m.userId === user.id || m.email?.toLowerCase() === user.email?.toLowerCase()
    );
    if (matched) {
      setCurrentMember(matched);
    }

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
      
      {/* NAVBAR DI DALAM DASHBOARD */}
      {currentView !== 'landing' && (
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
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

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

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

      {/* KONTEN AKTIF */}
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
            <KTAInlineView
              currentUser={currentUser}
              memberData={currentMember}
              onBack={() => setCurrentView('dashboard')}
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

      {/* MODAL AUTH */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authInitialTab}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      {/* MODAL SINKRONISASI SPREADSHEET */}
      {isSyncModalOpen && (
        <SpreadsheetSyncModal
          isOpen={isSyncModalOpen}
          onClose={() => setIsSyncModalOpen(false)}
          onSyncComplete={() => {
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
