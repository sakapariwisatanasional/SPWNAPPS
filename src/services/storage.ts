// Service penyimpanan data lokal dengan validasi tipe data mutlak
import initialData from '../data/initialData';

export const getStorageItem = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === 'undefined' || raw === 'null') {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (error) {
    console.warn(`Gagal membaca kunci localStorage "${key}":`, error);
    return fallback;
  }
};

export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Gagal menyimpan data ke localStorage "${key}":`, error);
  }
};

// Anggota (Members)
export const getMembers = (): any[] => {
  const fallback = Array.isArray(initialData?.members) ? initialData.members : [];
  const stored = getStorageItem<any[]>('saka_members', fallback);
  return Array.isArray(stored) ? stored : fallback;
};

export const saveMembers = (members: any[]): void => {
  setStorageItem('saka_members', Array.isArray(members) ? members : []);
};

// Kegiatan (Activities)
export const getActivities = (): any[] => {
  const fallback = Array.isArray(initialData?.activities) ? initialData.activities : [];
  const stored = getStorageItem<any[]>('saka_activities', fallback);
  return Array.isArray(stored) ? stored : fallback;
};

export const saveActivities = (activities: any[]): void => {
  setStorageItem('saka_activities', Array.isArray(activities) ? activities : []);
};

// Paket Wisata (Tour Packages)
export const getTourPackages = (): any[] => {
  const fallback = Array.isArray(initialData?.tourPackages) ? initialData.tourPackages : [];
  const stored = getStorageItem<any[]>('saka_tour_packages', fallback);
  return Array.isArray(stored) ? stored : fallback;
};

export const saveTourPackages = (packages: any[]): void => {
  setStorageItem('saka_tour_packages', Array.isArray(packages) ? packages : []);
};

// Sentra Kuliner & Suvenir (Culinary Items)
export const getCulinaryItems = (): any[] => {
  const fallback = Array.isArray(initialData?.culinaryItems) ? initialData.culinaryItems : [];
  const stored = getStorageItem<any[]>('saka_culinary_items', fallback);
  return Array.isArray(stored) ? stored : fallback;
};

export const saveCulinaryItems = (items: any[]): void => {
  setStorageItem('saka_culinary_items', Array.isArray(items) ? items : []);
};

// Log Audit Sistem (Audit Logs)
export const getAuditLogs = (): any[] => {
  const stored = getStorageItem<any[]>('saka_audit_logs', []);
  return Array.isArray(stored) ? stored : [];
};

export const saveAuditLogs = (logs: any[]): void => {
  setStorageItem('saka_audit_logs', Array.isArray(logs) ? logs : []);
};

export const addAuditLog = (action: string, performedBy?: string, details?: any): void => {
  const logs = getAuditLogs();
  const newLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    action,
    userName: performedBy || 'Operator Sistem',
    performedBy: performedBy || 'Operator Sistem',
    timestamp: new Date().toISOString(),
    details: details || null,
  };
  saveAuditLogs([newLog, ...logs]);
};

// Sesi Pengguna Aktif (Current User)
export const getCurrentUser = (): any | null => {
  return getStorageItem<any | null>('saka_current_user', null);
};

export const setCurrentUser = (user: any): void => {
  setStorageItem('saka_current_user', user);
};

export const removeCurrentUser = (): void => {
  try {
    localStorage.removeItem('saka_current_user');
  } catch (error) {
    console.error('Gagal menghapus sesi akun:', error);
  }
};

export const clearStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Gagal membersihkan localStorage:', error);
  }
};

export default {
  getMembers,
  saveMembers,
  getActivities,
  saveActivities,
  getTourPackages,
  saveTourPackages,
  getCulinaryItems,
  saveCulinaryItems,
  getAuditLogs,
  saveAuditLogs,
  addAuditLog,
  getCurrentUser,
  setCurrentUser,
  removeCurrentUser,
  clearStorage,
};
