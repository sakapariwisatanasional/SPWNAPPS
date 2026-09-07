import { 
  Member, 
  TourPackage, 
  Activity, 
  Province, 
  Regency, 
  District, 
  Branch, 
  Skill, 
  AuditLog, 
  CurrentUser, 
  KtaCardSettings, 
  CulinarySouvenirItem 
} from '../types';
import { 
  INITIAL_MEMBERS, 
  INITIAL_TOUR_PACKAGES, 
  INITIAL_ACTIVITIES, 
  INITIAL_AUDIT_LOGS, 
  DEFAULT_PUBLIC_USER, 
  DEMO_USERS, 
  MASTER_SKILLS, 
  INITIAL_CULINARY_SOUVENIRS 
} from '../data/initialData';
import { PROVINCES_DATA, REGENCIES_DATA, getDistrictsForRegency } from '../data/indonesiaTerritories';

const STORAGE_KEYS = {
  MEMBERS: 'saka_members',
  TOURS: 'saka_tours',
  ACTIVITIES: 'saka_activities',
  AUDIT_LOGS: 'saka_audit_logs',
  USERS: 'saka_users',
  CURRENT_USER: 'saka_current_user',
  KTA_SETTINGS: 'saka_kta_settings_v2',
  CULINARY_SOUVENIRS: 'saka_culinary_souvenirs',
  AUTH_TOKEN: 'saka_auth_token'
};

export const DEFAULT_KTA_SETTINGS: KtaCardSettings = {
  issueLocationDate: 'Jakarta, 14 Agustus 2026',
  signerName: 'Reza Pahlevi',
  signerTitle: 'Ketua Pimpinan Saka Pariwisata Nasional',
  barcodeCustomValue: '',
  frontValidityText: 'Masa Berlaku: Selama Menjadi Anggota',
  bgOpacity: 0.10,
  bgImageUrl: ''
};

class StorageService {
  private listeners: (() => void)[] = [];

  constructor() {
    this.initDefaultData();
  }

  private initDefaultData() {
    if (!localStorage.getItem(STORAGE_KEYS.KTA_SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.KTA_SETTINGS, JSON.stringify(DEFAULT_KTA_SETTINGS));
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public subscribeMutation(listener: (event: any) => void): () => void {
    const handler = (e: StorageEvent) => {
      if (e.key && Object.values(STORAGE_KEYS).includes(e.key)) {
        try {
          listener({ type: e.key, payload: JSON.parse(e.newValue || '{}') });
        } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  public notify() {
    this.listeners.forEach(cb => {
      try { cb(); } catch {}
    });
  }

  // --- MEMBERS MANAGEMENT ---
  public getMembers(): Member[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return data ? JSON.parse(data) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  }

  public setMembers(members: Member[]) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    this.notify();
  }

  public saveMembers(members: Member[]) {
    this.setMembers(members);
  }

  // Registrasi Anggota Baru dengan ID Berurutan Otomatis (member-01, member-02, dst.)
  public registerMember(payload: Omit<Member, 'id' | 'status' | 'registeredAt' | 'verificationToken' | 'locationHistory'>): Member {
    const members = this.getMembers();

    // Hitung nomor urut terbesar dari ID yang berformat member-XX
    let maxNumber = 0;
    members.forEach(m => {
      if (m.id && m.id.startsWith('member-')) {
        const numPart = parseInt(m.id.replace('member-', ''), 10);
        if (!isNaN(numPart) && numPart > maxNumber) {
          maxNumber = numPart;
        }
      }
    });

    const nextNumber = maxNumber + 1;
    // Format nomor menjadi minimal 2 digit (contoh: member-01, member-02, ..., member-10)
    const formattedId = `member-${nextNumber < 10 ? '0' + nextNumber : nextNumber}`;

    const newMember: Member = {
      ...payload,
      id: formattedId,
      status: 'PENDING',
      registeredAt: new Date().toISOString(),
      verificationToken: `VERIFY-${formattedId}-${Date.now().toString(36).toUpperCase()}`,
      locationHistory: [],
      skills: payload.skills || [],
      certifications: payload.certifications || []
    };

    // Tambahkan pendaftar baru ke daftar
    members.unshift(newMember);
    this.setMembers(members);

    return newMember;
  }

  public updateMemberStatus(memberId: string, status: 'ACTIVE' | 'PENDING' | 'SUSPENDED', actor?: any): boolean {
    const members = this.getMembers();
    const idx = members.findIndex(m => m.id === memberId);
    if (idx !== -1) {
      members[idx].status = status;
      this.setMembers(members);
      return true;
    }
    return false;
  }

  public deleteMember(memberId: string, actor?: any): boolean {
    const members = this.getMembers().filter(m => m.id !== memberId);
    this.setMembers(members);
    return true;
  }

  public deleteAllDummyMembers(actor?: any): number {
    const members = this.getMembers().filter(m => !m.id.includes('dummy') && !m.id.includes('demo'));
    this.setMembers(members);
    return members.length;
  }

  // --- KTA CARD SETTINGS (SUPER ADMIN) ---
  public getKtaSettings(): KtaCardSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KTA_SETTINGS);
      if (data) {
        return { ...DEFAULT_KTA_SETTINGS, ...JSON.parse(data) };
      }
    } catch {}
    return DEFAULT_KTA_SETTINGS;
  }

  public saveKtaSettings(settings: KtaCardSettings) {
    const updated = { ...DEFAULT_KTA_SETTINGS, ...settings };
    localStorage.setItem(STORAGE_KEYS.KTA_SETTINGS, JSON.stringify(updated));
    // Berikan sinyal perubahan ke semua komponen KTA
    this.notify();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('saka:kta-settings-updated', { detail: updated }));
    }
  }

  // --- TOURS, ACTIVITIES, CULINARY, PROVINCES ---
  public getTourPackages(): TourPackage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOURS);
      return data ? JSON.parse(data) : INITIAL_TOUR_PACKAGES;
    } catch {
      return INITIAL_TOUR_PACKAGES;
    }
  }

  public setTourPackages(tours: TourPackage[]) {
    localStorage.setItem(STORAGE_KEYS.TOURS, JSON.stringify(tours));
    this.notify();
  }

  public deleteTourPackage(id: string, actor?: any) {
    const filtered = this.getTourPackages().filter(t => t.id !== id);
    this.setTourPackages(filtered);
  }

  public getActivities(): Activity[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  }

  public setActivities(acts: Activity[]) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(acts));
    this.notify();
  }

  public deleteActivity(id: string, actor?: any) {
    const filtered = this.getActivities().filter(a => a.id !== id);
    this.setActivities(filtered);
  }

  public getCulinarySouvenirs(): CulinarySouvenirItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CULINARY_SOUVENIRS);
      return data ? JSON.parse(data) : INITIAL_CULINARY_SOUVENIRS;
    } catch {
      return INITIAL_CULINARY_SOUVENIRS;
    }
  }

  public setCulinarySouvenirs(items: CulinarySouvenirItem[]) {
    localStorage.setItem(STORAGE_KEYS.CULINARY_SOUVENIRS, JSON.stringify(items));
    this.notify();
  }

  public getProvinces(): Province[] {
    return PROVINCES_DATA;
  }

  public getRegencies(provinceId?: string): Regency[] {
    if (!provinceId) return REGENCIES_DATA;
    return REGENCIES_DATA.filter(r => r.provinceId === provinceId);
  }

  public getDistricts(regencyId?: string): District[] {
    if (!regencyId) return [];
    return getDistrictsForRegency(regencyId);
  }

  public getBranches(districtId?: string): Branch[] {
    return [];
  }

  public getSkills(): Skill[] {
    return MASTER_SKILLS;
  }

  public getAuditLogs(): AuditLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  // --- USERS & AUTH ---
  public getUsers(): CurrentUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : DEMO_USERS;
    } catch {
      return DEMO_USERS;
    }
  }

  public setUsers(users: CurrentUser[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
  }

  public saveUsers(users: CurrentUser[]) {
    this.setUsers(users);
  }

  public getCurrentUser(): CurrentUser {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : DEFAULT_PUBLIC_USER;
    } catch {
      return DEFAULT_PUBLIC_USER;
    }
  }

  public setCurrentUser(user: CurrentUser) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify();
  }

  public getAuthToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  public setAuthToken(token: string | null) {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    this.notify();
  }

  public async syncWithServer(): Promise<boolean> {
    return true;
  }
}

export const storage = new StorageService();
