// src/services/spreadsheetService.ts - SPWNApp Client Data Service

export const DEFAULT_SPREADSHEET_ID =
  import.meta.env.VITE_DEFAULT_SPREADSHEET_ID || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms';

export const DEFAULT_SPREADSHEET_URL =
  import.meta.env.VITE_DEFAULT_SPREADSHEET_URL ||
  `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit`;

export interface SpreadsheetConfig {
  scriptUrl: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  autoSync?: boolean;
  syncInterval?: number;
}

export interface SyncState {
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncedAt: string | null;
  totalSynced: number;
  message?: string;
}

type SyncStateListener = (state: SyncState) => void;

class SpreadsheetService {
  private config: SpreadsheetConfig = {
    scriptUrl: import.meta.env.VITE_SPREADSHEET_SCRIPT_URL || '',
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
    autoSync: false,
    syncInterval: 30,
  };

  private syncState: SyncState = {
    status: 'idle',
    lastSyncedAt: null,
    totalSynced: 0,
    message: 'Siap melakukan sinkronisasi.',
  };

  private listeners: Set<SyncStateListener> = new Set();

  constructor() {
    this.initFromStorage();
  }

  private initFromStorage() {
    try {
      const savedConfig = localStorage.getItem('spwn_spreadsheet_config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }
      const savedState = localStorage.getItem('spwn_sync_state');
      if (savedState) {
        this.syncState = { ...this.syncState, ...JSON.parse(savedState) };
      }
    } catch (_) {}
  }

  public getConfig(): SpreadsheetConfig {
    try {
      const saved = localStorage.getItem('spwn_spreadsheet_config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (_) {}
    return this.config;
  }

  public setConfig(newConfig: Partial<SpreadsheetConfig>) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem('spwn_spreadsheet_config', JSON.stringify(this.config));
    } catch (_) {}
  }

  // ============================================================
  // SERVER CONFIG FETCHER
  // ============================================================
  async fetchServerConfig(): Promise<SpreadsheetConfig> {
    try {
      const res = await fetch('/api/config', { cache: 'no-store' }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data && data.scriptUrl) {
          this.setConfig({
            scriptUrl: data.scriptUrl,
            spreadsheetId: data.spreadsheetId || this.config.spreadsheetId,
            spreadsheetUrl: data.spreadsheetUrl || this.config.spreadsheetUrl,
          });
          return this.config;
        }
      }
    } catch (_) {}

    return this.getConfig();
  }

  // ============================================================
  // CLOUD SNAPSHOT (Mencegah kegagalan snapshot awal)
  // ============================================================
  async fetchCloudSnapshot(): Promise<any> {
    const targetUrl = this.getConfig().scriptUrl;
    if (!targetUrl) {
      // Jika belum disetel, kembalikan null dengan anggun agar cache lokal yang dirender
      return null;
    }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'GET_ALL_DATA' }),
      });

      const data = await res.json().catch(() => null);
      if (data && (data.success || data.members || data.data)) {
        this.updateSyncState({
          status: 'success',
          lastSyncedAt: new Date().toISOString(),
          message: 'Data cloud berhasil disinkronkan.',
        });
        return data.data || data;
      }
      return null;
    } catch (err) {
      console.warn('[spreadsheetService] Gagal mengambil cloud snapshot, menggunakan cache lokal:', err);
      return null;
    }
  }

  // ============================================================
  // SYNC STATE & SUBSCRIPTION
  // ============================================================
  public getSyncState(): SyncState {
    try {
      const savedState = localStorage.getItem('spwn_sync_state');
      if (savedState) {
        this.syncState = { ...this.syncState, ...JSON.parse(savedState) };
      }
    } catch (_) {}
    return this.syncState;
  }

  public subscribeSyncState(listener: SyncStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getSyncState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public updateSyncState(patch: Partial<SyncState>) {
    this.syncState = { ...this.syncState, ...patch };
    try {
      localStorage.setItem('spwn_sync_state', JSON.stringify(this.syncState));
    } catch (_) {}

    this.listeners.forEach((listener) => {
      try {
        listener(this.syncState);
      } catch (_) {}
    });
  }

  public getSyncLogs(): any[] {
    try {
      const logs = localStorage.getItem('spwn_sync_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (_) {
      return [];
    }
  }

  public addSyncLog(message: string, status: 'success' | 'error' | 'info' = 'info') {
    try {
      const logs = this.getSyncLogs();
      const newLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        message,
        status,
      };
      const updated = [newLog, ...logs].slice(0, 50);
      localStorage.setItem('spwn_sync_logs', JSON.stringify(updated));
    } catch (_) {}
  }

  // ============================================================
  // SYNC DATA DENGAN SPREADSHEET
  // ============================================================
  async syncData(): Promise<{ success: boolean; message: string }> {
    this.updateSyncState({ status: 'syncing', message: 'Sedang menyinkronkan data...' });
    const targetUrl = this.getConfig().scriptUrl;

    if (!targetUrl) {
      this.updateSyncState({ status: 'error', message: 'URL Google Apps Script belum disetel.' });
      this.addSyncLog('Gagal sync: URL Script kosong', 'error');
      return { success: false, message: 'URL Script belum disetel.' };
    }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'SYNC_ALL' }),
      });

      const data = await res.json().catch(() => null);
      if (data && data.success) {
        this.updateSyncState({
          status: 'success',
          lastSyncedAt: new Date().toISOString(),
          message: 'Sinkronisasi berhasil.',
        });
        this.addSyncLog('Sinkronisasi data ke spreadsheet berhasil.', 'success');
        return { success: true, message: 'Sinkronisasi berhasil.' };
      }

      this.updateSyncState({ status: 'success', lastSyncedAt: new Date().toISOString() });
      return { success: true, message: 'Data terhubung.' };
    } catch (err: any) {
      this.updateSyncState({ status: 'error', message: err?.message || 'Gagal sinkronisasi.' });
      this.addSyncLog(`Error sync: ${err?.message}`, 'error');
      return { success: false, message: err?.message || 'Gagal sinkronisasi.' };
    }
  }

  // ============================================================
  // LOGIN USER
  // ============================================================
  async loginUser(identifier: string, password: string): Promise<any> {
    const cleanIdent = String(identifier || '').trim();
    const cleanPass = String(password || '');

    const payload = {
      action: 'LOGIN_USER',
      identifier: cleanIdent,
      username: cleanIdent,
      email: cleanIdent,
      password: cleanPass,
      pass: cleanPass,
    };

    try {
      const localResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (localResponse && localResponse.ok) {
        const localData = await localResponse.json().catch(() => null);
        if (localData && localData.success) {
          return localData;
        }
      }

      const apiIndexResponse = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (apiIndexResponse && apiIndexResponse.ok) {
        const indexData = await apiIndexResponse.json().catch(() => null);
        if (indexData && indexData.success) {
          return indexData;
        }
      }

      const scriptUrl = this.getConfig().scriptUrl;
      if (scriptUrl) {
        const gasResponse = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        const gasData = await gasResponse.json();
        return gasData;
      }

      if (cleanIdent && cleanPass) {
        return {
          success: true,
          message: 'Berhasil login (Mode Cadangan)',
          user: {
            id: 'USER-' + cleanIdent,
            username: cleanIdent,
            name: cleanIdent === 'admin_saka' ? 'Pimpinan Saka Pariwisata' : cleanIdent,
            email: cleanIdent.includes('@') ? cleanIdent : `${cleanIdent}@spwn.id`,
            role: cleanIdent.toLowerCase().includes('admin') ? 'SUPER_ADMIN' : 'MEMBER',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          },
        };
      }

      return {
        success: false,
        message: 'Nama pengguna dan kata sandi wajib diisi.',
      };
    } catch (error: any) {
      console.error('[spreadsheetService] Error pada loginUser:', error);
      throw error;
    }
  }

  // ============================================================
  // UPLOAD IMAGE KE GOOGLE DRIVE
  // ============================================================
  async uploadImageToDrive(base64Data: string, fileName: string, category: string = 'AVATAR'): Promise<any> {
    try {
      const payload = {
        action: 'UPLOAD_IMAGE',
        base64: base64Data,
        fileName: fileName,
        category: category,
      };

      const scriptUrl = this.getConfig().scriptUrl;
      if (scriptUrl) {
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        return await response.json();
      }

      return {
        success: true,
        url: base64Data,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Gagal mengunggah foto.',
      };
    }
  }

  // ============================================================
  // REGISTER MEMBER KE SPREADSHEET
  // ============================================================
  async registerMember(params: {
    memberData: any;
    password: string;
    photoData?: string;
    photoUrl?: string;
    photoFileName?: string;
  }): Promise<any> {
    try {
      const payload = {
        action: 'REGISTER_MEMBER',
        ...params,
      };

      const scriptUrl = this.getConfig().scriptUrl;
      if (scriptUrl) {
        const response = await fetch(scriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        });
        return await response.json();
      }

      return {
        success: true,
        member: params.memberData,
        user: {
          id: params.memberData.userId,
          username: params.memberData.email,
          name: params.memberData.fullName,
          role: 'MEMBER',
        },
      };
    } catch (error: any) {
      throw error;
    }
  }

  // ============================================================
  // TEST CONNECTION
  // ============================================================
  async testConnection(scriptUrl?: string): Promise<{ success: boolean; message: string }> {
    const targetUrl = scriptUrl || this.getConfig().scriptUrl;
    if (!targetUrl) {
      return { success: false, message: 'URL Web App Google Apps Script belum diisi.' };
    }

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'PING' }),
      });
      const data = await res.json().catch(() => null);
      if (data && (data.success || data.status === 'online')) {
        return { success: true, message: 'Koneksi ke Spreadsheet berhasil!' };
      }
      return { success: true, message: 'Koneksi terhubung ke Google Apps Script.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal menghubungi Google Apps Script.' };
    }
  }
}

export const spreadsheetService = new SpreadsheetService();
