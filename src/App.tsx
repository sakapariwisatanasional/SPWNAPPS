import React, { useState, useEffect } from 'react';
import { 
  Member, 
  TourPackage, 
  Activity, 
  Province, 
  Skill, 
  AuditLog, 
  CurrentUser, 
  CulinarySouvenirItem 
} from './types';
import { storage } from './services/storage';
import { DEFAULT_PUBLIC_USER } from './data/initialData';
import { spreadsheetService } from './services/spreadsheetService';

// Route Mappings for Full SPA Navigation
const TAB_ROUTES: Record<string, string> = {
  landing: '/',
  dashboard: '/dashboard',
  'my-card': '/profile',
  members: '/members',
  tours: '/tours',
  'culinary-souvenirs': '/culinary',
  skills: '/skills',
  'krida-modules': '/krida',
  activities: '/activities',
  'verify-portal': '/verify',
  territories: '/territories',
  'audit-logs': '/audit'
};

const ROUTE_TO_TAB: Record<string, string> = {
  '/': 'landing',
  '/landing': 'landing',
  '/dashboard': 'dashboard',
  '/profile': 'my-card',
  '/my-card': 'my-card',
  '/members': 'members',
  '/tours': 'tours',
  '/culinary': 'culinary-souvenirs',
  '/culinary-souvenirs': 'culinary-souvenirs',
  '/skills': 'skills',
  '/krida': 'krida-modules',
  '/krida-modules': 'krida-modules',
  '/activities': 'activities',
  '/verify': 'verify-portal',
  '/verify-portal': 'verify-portal',
  '/territories': 'territories',
  '/audit': 'audit-logs',
  '/audit-logs': 'audit-logs'
};

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Page Views
import { LandingPageView } from './pages/LandingPageView';
import { DashboardView } from './pages/DashboardView';
import { MemberManagementView } from './pages/MemberManagementView';
import { TourismDirectoryView } from './pages/TourismDirectoryView';
import { SkillDirectoryView } from './pages/SkillDirectoryView';
import { ActivitiesView } from './pages/ActivitiesView';
import { TerritoryManagementView } from './pages/TerritoryManagementView';
import { AuditLogsView } from './pages/AuditLogsView';
import { MyCardView } from './pages/MyCardView';
import { KridaModulesView } from './pages/KridaModulesView';
import { PublicPortalView } from './pages/PublicPortalView';

// Modals
import { AuthModal } from './components/auth/AuthModal';
import { SpreadsheetSyncModal } from './components/database/SpreadsheetSyncModal';
import { MemberFormModal } from './components/member/MemberFormModal';
import { TourPackageFormModal } from './components/tourism/TourPackageFormModal';
import { TourPackageDetailModal } from './components/tourism/TourPackageDetailModal';
import { KtaCardCustomizerModal } from './components/member/KtaCardCustomizerModal';
import { CulinarySouvenirFormModal } from './components/culinary/CulinarySouvenirFormModal';
import { CulinarySouvenirDetailModal } from './components/culinary/CulinarySouvenirDetailModal';
import { ActivityFormModal } from './components/activities/ActivityFormModal';
import { ActivityDetailModal } from './components/activities/ActivityDetailModal';
import { MemberPhotoEditModal } from './components/member/MemberPhotoEditModal';
import { AdminEditMemberModal } from './components/member/AdminEditMemberModal';
import { KtaPrintPdfModal } from './components/member/KtaPrintPdfModal';
import { QuickShareBadgeModal } from './components/member/QuickShareBadgeModal';
import { OperatorRoleModal } from './components/member/OperatorRoleModal';
import { MemberVerificationModal } from './components/member/MemberVerificationModal';
import { MemberTransferModal } from './components/member/MemberTransferModal';
import { DriveMediaRepositoryModal } from './components/common/DriveMediaRepositoryModal';
import { CulinarySouvenirGallerySection } from './components/dashboard/CulinarySouvenirGallerySection';

// Error Boundary Component
class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AppErrorBoundary Catch]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 bg-rose-500/20 border border-rose-500 rounded-2xl max-w-md w-full space-y-3">
            <h2 className="text-lg font-bold text-rose-400">Terjadi Kendala Memuat Halaman</h2>
            <p className="text-xs text-slate-300">
              {this.state.error?.message || 'Gagal merender komponen dashboard.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  // Current logged in user dengan fallback aman
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    try {
      const stored = storage.getCurrentUser();
      return stored && stored.role ? stored : DEFAULT_PUBLIC_USER;
    } catch {
      return DEFAULT_PUBLIC_USER;
    }
  });
  
  // Resolve initial tab directly from URL pathname so direct links work immediately
  const getInitialTab = (): string => {
    if (typeof window === 'undefined') return 'landing';
    const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    if (pathname.startsWith('/verify')) return 'verify-portal';
    return ROUTE_TO_TAB[pathname] || 'landing';
  };

  const [currentTab, setCurrentTab] = useState<string>(getInitialTab);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Synchronize URL and History when changing tabs
  const handleNavigateTab = (tab: string) => {
    setCurrentTab(tab);
    setSearchQuery('');
    const targetPath = TAB_ROUTES[tab] || '/';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  // Reactive State from storage service
  const [members, setMembers] = useState<Member[]>([]);
  const [cloudSync, setCloudSync] = useState(spreadsheetService.getSyncState());
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [culinaryItems, setCulinaryItems] = useState<CulinarySouvenirItem[]>([]);

  // Auth & Spreadsheet Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);

  // Other Modals State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isTourFormModalOpen, setIsTourFormModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<TourPackage | null>(null);
  const [isEditKtaModalOpen, setIsEditKtaModalOpen] = useState(false);
  const [isCulinaryFormOpen, setIsCulinaryFormOpen] = useState(false);
  const [editingCulinaryItem, setEditingCulinaryItem] = useState<CulinarySouvenirItem | null>(null);
  const [selectedCulinaryDetail, setSelectedCulinaryDetail] = useState<CulinarySouvenirItem | null>(null);
  const [selectedActivityDetail, setSelectedActivityDetail] = useState<Activity | null>(null);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingPhotoMember, setEditingPhotoMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [printingKtaMember, setPrintingKtaMember] = useState<Member | null>(null);
  const [quickSharingMember, setQuickSharingMember] = useState<Member | null>(null);
  const [managingOperatorMember, setManagingOperatorMember] = useState<Member | null>(null);
  const [verifyingMember, setVerifyingMember] = useState<Member | null>(null);
  const [transferringMember, setTransferringMember] = useState<Member | null>(null);
  const [selectedTourDetail, setSelectedTourDetail] = useState<TourPackage | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [liveSyncToast, setLiveSyncToast] = useState<{ message: string; visible: boolean } | null>(null);

  // Verifikasi sesi backend dengan mempertahankan sesi login lokal
  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      const token = storage.getAuthToken();
      const storedUser = storage.getCurrentUser();

      // Pertahankan user lokal jika token tidak ada
      if (!token) {
        if (!storedUser || !storedUser.role) {
          setCurrentUser(DEFAULT_PUBLIC_USER);
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            storage.setCurrentUser(data.user);
            setCurrentUser(data.user);
            return;
          }
        } else if (res.status === 401 || res.status === 403) {
          // Token memang expired / revoked
          storage.setAuthToken(null);
          storage.setCurrentUser(DEFAULT_PUBLIC_USER);
          setCurrentUser(DEFAULT_PUBLIC_USER);
        }
      } catch {
        // Jaringan offline / serverless sleeping: PERTAHANKAN user login yang ada di storage
        if (storedUser && storedUser.role) {
          setCurrentUser(storedUser);
        }
      }
    };

    verifySession();
    return () => { cancelled = true; };
  }, []);

  // Spreadsheet adalah sumber data utama. LocalStorage hanya dipakai sebagai
  // cache/session, sehingga browser pengunjung tidak bergantung pada data lama
  // saat pertama kali membuka landing page. Setelah konfigurasi pusat terbaca,
  // tarik snapshot terbaru dari Google Spreadsheet lalu teruskan polling live.
  useEffect(() => {
    let cancelled = false;

    const refreshAll = () => {
      setMembers(storage.getMembers() || []);
      setTours(storage.getTourPackages() || []);
      setActivities(storage.getActivities() || []);
      setProvinces(storage.getProvinces() || []);
      setSkills(storage.getSkills() || []);
      setAuditLogs(storage.getAuditLogs() || []);
      setCulinaryItems(storage.getCulinarySouvenirs() || []);

      const usr = storage.getCurrentUser();
      if (usr && usr.role) setCurrentUser(usr);
    };

    const hydrateFromCloud = async () => {
      refreshAll();
      try {
        await spreadsheetService.fetchServerConfig();
        if (cancelled) return;
        await spreadsheetService.syncFromSpreadsheet(true);
        if (!cancelled) refreshAll();
      } catch (error) {
        console.warn('[App] Sinkronisasi awal Spreadsheet gagal:', error);
      }
    };

    void hydrateFromCloud();
    const unsubscribe = storage.subscribe(refreshAll);
    const handleCloudUpdate = () => {
      if (!cancelled) {
        refreshAll();
        setCloudSync(spreadsheetService.getSyncState());
      }
    };
    const unsubscribeSyncState = spreadsheetService.subscribeSyncState(() => {
      if (!cancelled) setCloudSync(spreadsheetService.getSyncState());
    });
    const handleMemberSynced = () => {
      if (cancelled) return;
      void spreadsheetService.syncFromSpreadsheet(true)
        .then(() => {
          if (!cancelled) refreshAll();
        })
        .catch(() => {
          if (!cancelled) setCloudSync(spreadsheetService.getSyncState());
        });
    };
    const handleGasConfigUpdated = () => {
      if (cancelled) return;
      setCloudSync(spreadsheetService.getSyncState());
      // URL GAS baru langsung dipakai seluruh service pada tab ini.
      void spreadsheetService.syncFromSpreadsheet(true).then(() => {
        if (!cancelled) refreshAll();
      }).catch(() => {});
    };

    window.addEventListener('saka:cloud-data-updated', handleCloudUpdate as EventListener);
    window.addEventListener('saka:member-synced', handleMemberSynced as EventListener);
    window.addEventListener('saka:gas-config-updated', handleGasConfigUpdated as EventListener);

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener('saka:cloud-data-updated', handleCloudUpdate as EventListener);
      window.removeEventListener('saka:member-synced', handleMemberSynced as EventListener);
      window.removeEventListener('saka:gas-config-updated', handleGasConfigUpdated as EventListener);
      unsubscribeSyncState();
    };
  }, []);

  useEffect(() => {
    // Menjaga status sinkronisasi tetap tersedia di root untuk komponen dashboard
    // tanpa memaksa komponen lain membaca localStorage secara langsung.
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.cloudSyncStatus = cloudSync.status || 'IDLE';
    }
  }, [cloudSync.status]);

  // Listen to popstate for browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const resolved = pathname.startsWith('/verify') ? 'verify-portal' : (ROUTE_TO_TAB[pathname] || 'landing');
      setCurrentTab(resolved);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // QR/Barcode URL verification ditangani sepenuhnya oleh PublicPortalView.
  // App.tsx hanya menentukan route /verify agar tidak ada dua proses verifikasi
  // yang saling menimpa state profil anggota.


  // Handle Approve / Reject Member
  // Status tidak lagi hanya diubah di localStorage. Proses menunggu sampai
  // /api/mutate berhasil menulis ke server dan Google Spreadsheet.
  const handleApproveMember = async (memberId: string) => {
    const success = await storage.updateMemberStatus(memberId, 'ACTIVE', currentUser);
    if (success) {
      setMembers(storage.getMembers());
      alert('Anggota berhasil diverifikasi dan perubahan telah dikirim ke Google Spreadsheet.');
    } else {
      setMembers(storage.getMembers());
      alert('Verifikasi gagal disimpan. Data dikembalikan ke status sebelumnya. Silakan coba lagi.');
    }
  };

  const handleRejectMember = async (memberId: string) => {
    const success = await storage.updateMemberStatus(memberId, 'SUSPENDED', currentUser);
    if (success) {
      setMembers(storage.getMembers());
      alert('Status anggota berhasil diperbarui dan perubahan telah dikirim ke Google Spreadsheet.');
    } else {
      setMembers(storage.getMembers());
      alert('Perubahan status gagal disimpan. Data dikembalikan ke status sebelumnya.');
    }
  };

  const handleDeleteMember = (member: Member) => {
    const success = storage.deleteMember(member.id, currentUser);
    if (success) {
      alert(`Data keanggotaan ${member.fullName} telah berhasil dihapus dari database.`);
    }
  };

  const handleDeleteAllDummyMembers = () => {
    if ((currentUser?.role || 'PUBLIC') !== 'SUPER_ADMIN') {
      alert('Hanya Super Admin Nasional yang memiliki wewenang membersihkan data dummy.');
      return;
    }
    const count = storage.deleteAllDummyMembers(currentUser);
    alert(`Berhasil menghapus ${count} data anggota dummy. Database anggota kini bersih.`);
  };

  // Open Auth Modal helper
  const handleOpenAuth = (type: 'login' | 'register' | 'forgot') => {
    setAuthModalTab(type);
    setIsAuthModalOpen(true);
  };

  const handleOpenSpreadsheet = () => {
    if ((currentUser?.role || 'PUBLIC') === 'SUPER_ADMIN') {
      setIsSpreadsheetModalOpen(true);
    }
  };

  const handleOpenDrive = () => {
    if ((currentUser?.role || 'PUBLIC') === 'SUPER_ADMIN') {
      setIsDriveModalOpen(true);
    }
  };

  const userRole = currentUser?.role || 'PUBLIC';

  // IF CURRENT TAB IS LANDING PAGE
  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen bg-slate-900">
        <LandingPageView
          currentUser={currentUser}
          members={members}
          tours={tours}
          culinaryItems={culinaryItems}
          activities={activities}
          onOpenLoginModal={() => handleOpenAuth('login')}
          onOpenRegisterModal={() => handleOpenAuth('register')}
          onOpenVerifyModal={(m) => setVerifyingMember(m)}
          onViewTourDetail={(t) => setSelectedTourDetail(t)}
          onSelectCulinaryDetail={(item) => setSelectedCulinaryDetail(item)}
          onViewActivityDetail={(a) => setSelectedActivityDetail(a)}
          onOpenActivityForm={() => {
            setEditingActivity(null);
            setIsActivityFormOpen(true);
          }}
          onEnterDashboard={(tab) => handleNavigateTab(tab || 'dashboard')}
        />

        {/* Global Modals for Landing View */}
        <AuthModal
          isOpen={isAuthModalOpen}
          initialTab={authModalTab}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            if (user?.role === 'MEMBER') {
              handleNavigateTab('my-card');
            } else {
              handleNavigateTab('dashboard');
            }
          }}
        />

        {verifyingMember && (
          <MemberVerificationModal
            member={verifyingMember}
            onClose={() => setVerifyingMember(null)}
          />
        )}

        {selectedTourDetail && (
          <TourPackageDetailModal
            tour={selectedTourDetail}
            onClose={() => setSelectedTourDetail(null)}
            onOpenVerifyModal={(m) => setVerifyingMember(m)}
          />
        )}

        {selectedCulinaryDetail && (
          <CulinarySouvenirDetailModal
            item={selectedCulinaryDetail}
            onClose={() => setSelectedCulinaryDetail(null)}
          />
        )}

        {selectedActivityDetail && (
          <ActivityDetailModal
            activity={selectedActivityDetail}
            onClose={() => setSelectedActivityDetail(null)}
          />
        )}
      </div>
    );
  }

  // MAIN APPLICATION LAYOUT
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar Desktop */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigateTab}
        currentUser={currentUser}
        onOpenSpreadsheetModal={userRole === 'SUPER_ADMIN' ? handleOpenSpreadsheet : undefined}
        onOpenDriveModal={userRole === 'SUPER_ADMIN' ? handleOpenDrive : undefined}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentUser={currentUser}
          currentTab={currentTab}
          onLogout={() => {
            storage.setAuthToken(null);
            storage.setCurrentUser(DEFAULT_PUBLIC_USER);
            setCurrentUser(DEFAULT_PUBLIC_USER);
            handleNavigateTab('landing');
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenRegisterModal={() => handleOpenAuth('register')}
          onSelectTab={handleNavigateTab}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenSpreadsheetModal={userRole === 'SUPER_ADMIN' ? handleOpenSpreadsheet : undefined}
          onOpenDriveModal={userRole === 'SUPER_ADMIN' ? handleOpenDrive : undefined}
          onOpenLoginModal={() => handleOpenAuth('login')}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <AppErrorBoundary>
                <DashboardView
                  currentUser={currentUser}
                  members={members}
                  tours={tours}
                  provinces={provinces}
                  culinaryItems={culinaryItems}
                  onSelectTab={handleNavigateTab}
                  onOpenRegisterModal={() => handleOpenAuth('register')}
                  onVerifyMember={(m) => setVerifyingMember(m)}
                  onApproveMemberQuick={handleApproveMember}
                  onViewTourDetail={(t) => setSelectedTourDetail(t)}
                  onOpenEditCardModal={() => setIsEditKtaModalOpen(true)}
                  onOpenEditPhotoModal={(m) => setEditingPhotoMember(m)}
                  onOpenEditMemberModal={(m) => setEditingMember(m)}
                  onOpenPrintPdfModal={(m) => setPrintingKtaMember(m)}
                  onOpenCulinaryFormModal={(item) => {
                    setEditingCulinaryItem(item || null);
                    setIsCulinaryFormOpen(true);
                  }}
                  onSelectCulinaryDetail={(item) => setSelectedCulinaryDetail(item)}
                  onOpenSpreadsheetModal={userRole === 'SUPER_ADMIN' ? handleOpenSpreadsheet : undefined}
                  onOpenDriveModal={userRole === 'SUPER_ADMIN' ? handleOpenDrive : undefined}
                />
              </AppErrorBoundary>
            )}

            {currentTab === 'culinary-souvenirs' && (
              <div className="space-y-6">
                <CulinarySouvenirGallerySection
                  items={culinaryItems}
                  currentUser={currentUser}
                  onOpenFormModal={(item) => {
                    setEditingCulinaryItem(item || null);
                    setIsCulinaryFormOpen(true);
                  }}
                  onSelectItemDetail={(item) => setSelectedCulinaryDetail(item)}
                />
              </div>
            )}

            {currentTab === 'members' && (
              <MemberManagementView
                currentUser={currentUser}
                members={members}
                provinces={provinces}
                onOpenRegisterModal={() => handleOpenAuth('register')}
                onOpenVerifyModal={(m) => setVerifyingMember(m)}
                onOpenTransferModal={(m) => setTransferringMember(m)}
                onApproveMember={handleApproveMember}
                onRejectMember={handleRejectMember}
                onOpenEditCardModal={() => setIsEditKtaModalOpen(true)}
                onOpenEditPhotoModal={(m) => setEditingPhotoMember(m)}
                onOpenEditMemberModal={(m) => setEditingMember(m)}
                onOpenPrintPdfModal={(m) => setPrintingKtaMember(m)}
                onOpenQuickShareModal={(m) => setQuickSharingMember(m)}
                onOpenOperatorModal={(m) => setManagingOperatorMember(m)}
                onDeleteMember={handleDeleteMember}
                onDeleteAllDummyMembers={handleDeleteAllDummyMembers}
              />
            )}

            {currentTab === 'tours' && (
              <TourismDirectoryView
                currentUser={currentUser}
                tours={tours}
                provinces={provinces}
                members={members}
                onOpenTourFormModal={() => {
                  setEditingTour(null);
                  setIsTourFormModalOpen(true);
                }}
                onViewTourDetail={(t) => setSelectedTourDetail(t)}
                onOpenVerifyModal={(m) => setVerifyingMember(m)}
                onEditTour={(t) => {
                  setEditingTour(t);
                  setIsTourFormModalOpen(true);
                }}
                onDeleteTour={(tId) => {
                  storage.deleteTourPackage(tId, currentUser);
                }}
              />
            )}

            {currentTab === 'skills' && (
              <SkillDirectoryView
                currentUser={currentUser}
                members={members}
                skills={skills}
                onOpenVerifyModal={(m) => setVerifyingMember(m)}
              />
            )}

            {currentTab === 'krida-modules' && (
              <KridaModulesView
                currentUser={currentUser}
              />
            )}

            {currentTab === 'activities' && (
              <ActivitiesView
                currentUser={currentUser}
                activities={activities}
                onOpenFormModal={() => {
                  setEditingActivity(null);
                  setIsActivityFormOpen(true);
                }}
                onViewDetail={(a) => setSelectedActivityDetail(a)}
                onEditActivity={(a) => {
                  setEditingActivity(a);
                  setIsActivityFormOpen(true);
                }}
                onDeleteActivity={(aId) => {
                  storage.deleteActivity(aId, currentUser);
                }}
              />
            )}

            {currentTab === 'territories' && (
              <TerritoryManagementView
                currentUser={currentUser}
              />
            )}

            {currentTab === 'audit-logs' && (
              <AuditLogsView
                logs={auditLogs}
                currentUser={currentUser}
              />
            )}

            {currentTab === 'verify-portal' && (
              <PublicPortalView
                members={members}
                tours={tours}
                skills={skills}
                onOpenRegisterModal={() => handleOpenAuth('register')}
                onOpenVerifyModal={(m) => setVerifyingMember(m)}
                onViewTourDetail={(t) => setSelectedTourDetail(t)}
                onSelectTab={handleNavigateTab}
              />
            )}

            {currentTab === 'my-card' && (
              <MyCardView
                currentUser={currentUser}
                members={members}
                onOpenVerifyModal={(m) => setVerifyingMember(m)}
                onOpenEditCardModal={() => setIsEditKtaModalOpen(true)}
                onOpenEditPhotoModal={(m) => setEditingPhotoMember(m)}
                onOpenEditMemberModal={(m) => setEditingMember(m)}
                onOpenPrintPdfModal={(m) => setPrintingKtaMember(m)}
                onOpenQuickShareModal={(m) => setQuickSharingMember(m)}
              />
            )}
          </div>
        </main>

        {/* Mobile Navigation Bar */}
        <MobileBottomNav
          currentTab={currentTab}
          onSelectTab={handleNavigateTab}
          currentUser={currentUser}
        />
      </div>

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          if (user?.role === 'MEMBER') {
            handleNavigateTab('my-card');
          } else {
            handleNavigateTab('dashboard');
          }
        }}
      />

      {userRole === 'SUPER_ADMIN' && (
        <SpreadsheetSyncModal
          isOpen={isSpreadsheetModalOpen}
          onClose={() => setIsSpreadsheetModalOpen(false)}
        />
      )}

      <MemberFormModal
        isOpen={isRegisterModalOpen}
        currentUser={currentUser}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          setIsRegisterModalOpen(false);
          handleNavigateTab('members');
        }}
      />

      <MemberVerificationModal
        member={verifyingMember}
        onClose={() => setVerifyingMember(null)}
      />

      {selectedTourDetail && (
        <TourPackageDetailModal
          tour={selectedTourDetail}
          onClose={() => setSelectedTourDetail(null)}
          onOpenVerifyModal={(m) => setVerifyingMember(m)}
        />
      )}

      <TourPackageFormModal
        isOpen={isTourFormModalOpen}
        onClose={() => {
          setIsTourFormModalOpen(false);
          setEditingTour(null);
        }}
        tourToEdit={editingTour}
        currentUser={currentUser}
        onSuccess={() => {
          setIsTourFormModalOpen(false);
          setEditingTour(null);
          setTours(storage.getTourPackages());
        }}
      />

      <ActivityFormModal
        isOpen={isActivityFormOpen}
        onClose={() => {
          setIsActivityFormOpen(false);
          setEditingActivity(null);
        }}
        activityToEdit={editingActivity}
        currentUser={currentUser}
        onSuccess={() => {
          setIsActivityFormOpen(false);
          setEditingActivity(null);
          setActivities(storage.getActivities());
        }}
      />

      {selectedActivityDetail && (
        <ActivityDetailModal
          activity={selectedActivityDetail}
          onClose={() => setSelectedActivityDetail(null)}
        />
      )}

      {isEditKtaModalOpen && (
        <KtaCardCustomizerModal
          isOpen={true}
          onClose={() => setIsEditKtaModalOpen(false)}
          onSuccess={() => setIsEditKtaModalOpen(false)}
        />
      )}

      <MemberPhotoEditModal
        isOpen={!!editingPhotoMember}
        member={editingPhotoMember}
        onClose={() => setEditingPhotoMember(null)}
        onSuccess={() => {
          setEditingPhotoMember(null);
          setMembers(storage.getMembers());
        }}
      />

      <AdminEditMemberModal
        isOpen={!!editingMember}
        member={editingMember}
        currentUser={currentUser}
        onClose={() => setEditingMember(null)}
        onSuccess={() => {
          setEditingMember(null);
          setMembers(storage.getMembers());
        }}
      />

      <KtaPrintPdfModal
        isOpen={!!printingKtaMember}
        member={printingKtaMember}
        onClose={() => setPrintingKtaMember(null)}
      />

      <QuickShareBadgeModal
        isOpen={!!quickSharingMember}
        member={quickSharingMember}
        onClose={() => setQuickSharingMember(null)}
      />

      <OperatorRoleModal
        isOpen={!!managingOperatorMember}
        member={managingOperatorMember}
        currentUser={currentUser}
        onClose={() => setManagingOperatorMember(null)}
        onSuccess={() => {
          setManagingOperatorMember(null);
          setMembers(storage.getMembers());
        }}
      />

      <CulinarySouvenirFormModal
        isOpen={isCulinaryFormOpen}
        itemToEdit={editingCulinaryItem}
        currentUser={currentUser}
        onClose={() => {
          setIsCulinaryFormOpen(false);
          setEditingCulinaryItem(null);
        }}
        onSuccess={() => {
          setIsCulinaryFormOpen(false);
          setEditingCulinaryItem(null);
          setCulinaryItems(storage.getCulinarySouvenirs());
        }}
      />

      {selectedCulinaryDetail && (
        <CulinarySouvenirDetailModal
          item={selectedCulinaryDetail}
          onClose={() => setSelectedCulinaryDetail(null)}
        />
      )}

      <MemberTransferModal
        isOpen={!!transferringMember}
        member={transferringMember}
        currentUser={currentUser}
        onClose={() => setTransferringMember(null)}
        onSuccess={() => {
          setTransferringMember(null);
          setMembers(storage.getMembers());
        }}
      />

      {userRole === 'SUPER_ADMIN' && (
        <DriveMediaRepositoryModal
          isOpen={isDriveModalOpen}
          onClose={() => setIsDriveModalOpen(false)}
        />
      )}
    </div>
  );
}
