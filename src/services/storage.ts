import { 
  Member, 
  TourPackage, 
  Activity, 
  CulinarySouvenirItem, 
  AuditLog, 
  AdminUser, 
  KtaCustomSettings,
  KridaModule
} from '../types';
import { initialMembers, initialTourPackages, initialActivities, initialCulinarySouvenirs } from '../data/initialData';
import * as KridaDataModule from '../data/kridaModules2026';

// Mendeteksi data master krida dari default export maupun named export
const defaultKridaModules: KridaModule[] = 
  (KridaDataModule as any).kridaModules2026 || 
  (KridaDataModule as any).kridaModules || 
  (KridaDataModule as any).initialKridaModules || 
  (KridaDataModule as any).default || 
  [];

const STORAGE_KEYS = {
  MEMBERS: 'saka_members',
  PACKAGES: 'saka_packages',
  ACTIVITIES: 'saka_activities',
  CULINARY: 'saka_culinary',
  AUDIT_LOGS: 'saka_audit_logs',
  SESSION: 'saka_session',
  USERS: 'saka_users',
  KTA_SETTINGS: 'saka_kta_custom_settings',
  KRIDA_MODULES: 'saka_krida_modules_2026'
};

const defaultKtaSettings: KtaCustomSettings = {
  themeColor: '#059669',
  cardStyle: 'modern',
  customTitle: 'KARTU TANDA ANGGOTA RESMI',
  customSubtitle: 'SAKA PARIWISATA NASIONAL',
  accentColor: '#10b981',
  fontFamily: 'sans-serif',
  opacity: 0.95
};

export const storage = {
  // ==========================================
  // KRIDA MODULES
  // ==========================================
  getKridaModules: (): KridaModule[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KRIDA_MODULES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Gagal mengambil modul krida dari storage:', e);
    }
    return defaultKridaModules;
  },

  saveKridaModules: (modules: KridaModule[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.KRIDA_MODULES, JSON.stringify(modules));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('krida-modules-updated', { detail: modules }));
      }
    } catch (e) {
      console.error('Gagal menyimpan modul krida:', e);
    }
  },

  // ==========================================
  // MEMBERS & REGISTRATION
  // ==========================================
  getMembers: (): Member[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return data ? JSON.parse(data) : initialMembers;
    } catch {
      return initialMembers;
    }
  },

  saveMembers: (members: Member[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('saka-members-updated', { detail: members }));
      }
    } catch (e) {
      console.error('Gagal menyimpan data anggota:', e);
    }
  },

  registerMember: (data: Omit<Member, 'id' | 'createdAt' | 'status'>): Member => {
    const currentMembers = storage.getMembers();

    // Hitung nomor urut terbesar (member-01, member-02, dst.)
    let maxIdNum = 0;
    currentMembers.forEach(m => {
      if (typeof m?.id === 'string') {
        const match = m.id.match(/member-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxIdNum) {
            maxIdNum = num;
          }
        }
      }
    });

    const nextSeq = maxIdNum + 1;
    const newId = `member-${String(nextSeq).padStart(2, '0')}`;

    const newMember: Member = {
      ...data,
      id: newId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    currentMembers.push(newMember);
    storage.saveMembers(currentMembers);
    return newMember;
  },

  updateMember: (id: string, updatedData: Partial<Member>): Member | null => {
    const members = storage.getMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;

    members[index] = { ...members[index], ...updatedData };
    storage.saveMembers(members);
    return members[index];
  },

  deleteMember: (id: string): boolean => {
    const members = storage.getMembers();
    const filtered = members.filter(m => m.id !== id);
    if (filtered.length === members.length) return false;
    storage.saveMembers(filtered);
    return true;
  },

  // ==========================================
  // KTA CUSTOM SETTINGS (Reaktif)
  // ==========================================
  getKtaSettings: (): KtaCustomSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KTA_SETTINGS);
      return data ? { ...defaultKtaSettings, ...JSON.parse(data) } : defaultKtaSettings;
    } catch {
      return defaultKtaSettings;
    }
  },

  saveKtaSettings: (settings: KtaCustomSettings): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.KTA_SETTINGS, JSON.stringify(settings));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kta-settings-updated', { detail: settings }));
      }
    } catch (e) {
      console.error('Gagal menyimpan pengaturan KTA:', e);
    }
  },

  // ==========================================
  // TOUR PACKAGES
  // ==========================================
  getPackages: (): TourPackage[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      return data ? JSON.parse(data) : initialTourPackages;
    } catch {
      return initialTourPackages;
    }
  },

  savePackages: (packages: TourPackage[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
    } catch (e) {
      console.error('Gagal menyimpan paket wisata:', e);
    }
  },

  // ==========================================
  // ACTIVITIES
  // ==========================================
  getActivities: (): Activity[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : initialActivities;
    } catch {
      return initialActivities;
    }
  },

  saveActivities: (activities: Activity[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (e) {
      console.error('Gagal menyimpan kegiatan:', e);
    }
  },

  // ==========================================
  // CULINARY & SOUVENIRS
  // ==========================================
  getCulinary: (): CulinarySouvenirItem[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CULINARY);
      return data ? JSON.parse(data) : initialCulinarySouvenirs;
    } catch {
      return initialCulinarySouvenirs;
    }
  },

  saveCulinary: (items: CulinarySouvenirItem[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CULINARY, JSON.stringify(items));
    } catch (e) {
      console.error('Gagal menyimpan kuliner/cenderamata:', e);
    }
  },

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  getAuditLogs: (): AuditLog[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addAuditLog: (log: Omit<AuditLog, 'id' | 'timestamp'>): void => {
    try {
      const logs = storage.getAuditLogs();
      const newLog: AuditLog = {
        ...log,
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString()
      };
      logs.unshift(newLog);
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 500)));
    } catch (e) {
      console.error('Gagal menambah log audit:', e);
    }
  },

  // ==========================================
  // USERS & SESSION
  // ==========================================
  getCurrentUser: (): AdminUser | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: AdminUser | null): void => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch (e) {
      console.error('Gagal menyimpan sesi login:', e);
    }
  }
};
