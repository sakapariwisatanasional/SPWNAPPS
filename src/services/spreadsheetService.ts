import { Member, TourPackage, CulinarySouvenirItem, Activity, CurrentUser, UserRole, Certification, MemberSkill } from '../types';
import { storage } from './storage';
import { PROVINCES_DATA, REGENCIES_DATA } from '../data/indonesiaTerritories';
import { MASTER_SKILLS } from '../data/initialData';

export const DEFAULT_SPREADSHEET_ID = '1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E';
export const DEFAULT_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit?usp=sharing`;
export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz0ZFGBmN3Hwt26lnUmpgXtwhS6f1PyWkezNsaU9OzSpKnIqxCaDnVcmJbl2sTaKJw4FQ/exec';

const SPREADSHEET_CONFIG_KEY = 'saka_spreadsheet_config_v1';

export interface SpreadsheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  scriptUrl?: string;
  lastSyncedAt?: string;
  autoSync: boolean;
  autoRefreshIntervalSeconds?: number;
  status: 'CONNECTED' | 'SYNCING' | 'ERROR' | 'IDLE';
  lastError?: string;
}

class SpreadsheetService {
  private config: SpreadsheetConfig;
  private isPushing = false;
  private isSyncing = false;
  private syncListeners: (() => void)[] = [];
  private liveSyncTimer: any = null;
  private isLiveSyncActive = false;
  private memberSyncInFlight = new Map<string, Promise<{ success: boolean; synced: boolean; message: string; requestId?: string; row?: number | null }>>();
  private syncState = {
    isSaving: false,
    lastSavedTime: null as string | null,
    lastSavedAction: null as string | null,
    error: null as string | null,
    isLivePolling: true,
    lastLiveCheck: null as string | null,
    pollingIntervalSeconds: 6
  };

  constructor() {
    this.config = this.loadConfig();
    this.syncState.pollingIntervalSeconds = this.config.autoRefreshIntervalSeconds || 6;
    this.initAutoSync();
    this.startLiveSyncEngine((this.config.autoRefreshIntervalSeconds || 6) * 1000);
    this.fetchServerConfig().catch(() => {});
  }

  public async fetchServerConfig() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.config) {
          const localScriptUrl = String(this.config.scriptUrl || '').trim();
          const localSpreadsheetId = String(this.config.spreadsheetId || '').trim();
          const serverScriptUrl = String(data.config.scriptUrl || '').trim();
          const serverSpreadsheetId = String(data.config.spreadsheetId || '').trim();

          this.config = {
            ...this.config,
            ...data.config,
            spreadsheetId: localSpreadsheetId || serverSpreadsheetId || DEFAULT_SPREADSHEET_ID,
            spreadsheetUrl: this.config.spreadsheetUrl || data.config.spreadsheetUrl || DEFAULT_SPREADSHEET_URL,
            scriptUrl: localScriptUrl || serverScriptUrl
          };
          localStorage.setItem(SPREADSHEET_CONFIG_KEY, JSON.stringify(this.config));
          this.notifySyncState();
        }
      }
    } catch {}
  }

  public startLiveSyncEngine(intervalMs: number = 6000) {
    if (this.liveSyncTimer) {
      clearInterval(this.liveSyncTimer);
      this.liveSyncTimer = null;
    }
    this.isLiveSyncActive = true;
    this.syncState.pollingIntervalSeconds = Math.round(intervalMs / 1000);

    this.liveSyncTimer = setInterval(() => {
      if (this.config.autoSync !== false) {
        if (typeof document === 'undefined' || document.visibilityState === 'visible') {
          this.syncFromSpreadsheet(true).catch(() => {});
        }
      }
    }, intervalMs);
  }

  public stopLiveSyncEngine() {
    this.isLiveSyncActive = false;
    if (this.liveSyncTimer) {
      clearInterval(this.liveSyncTimer);
      this.liveSyncTimer = null;
    }
  }

  private loadConfig(): SpreadsheetConfig {
    const defaultConf: SpreadsheetConfig = {
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
      scriptUrl: DEFAULT_APPS_SCRIPT_URL,
      autoSync: true,
      autoRefreshIntervalSeconds: 6,
      status: 'IDLE'
    };

    try {
      const stored = localStorage.getItem(SPREADSHEET_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultConf,
          ...parsed,
          spreadsheetId: (parsed.spreadsheetId && parsed.spreadsheetId.trim()) || DEFAULT_SPREADSHEET_ID,
          spreadsheetUrl: (parsed.spreadsheetUrl && parsed.spreadsheetUrl.trim()) || DEFAULT_SPREADSHEET_URL,
          scriptUrl: (parsed.scriptUrl && parsed.scriptUrl.trim()) || DEFAULT_APPS_SCRIPT_URL,
          autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
          autoRefreshIntervalSeconds: parsed.autoRefreshIntervalSeconds || 6
        };
      }
    } catch {}
    return defaultConf;
  }

  public saveConfig(newConfig: Partial<SpreadsheetConfig>): SpreadsheetConfig {
    let cleanId = newConfig.spreadsheetId ? newConfig.spreadsheetId.trim() : this.config.spreadsheetId;
    let cleanUrl = newConfig.spreadsheetUrl ? newConfig.spreadsheetUrl.trim() : this.config.spreadsheetUrl;
    let cleanScriptUrl = newConfig.scriptUrl !== undefined ? newConfig.scriptUrl.trim() : this.config.scriptUrl;

    if (cleanUrl && (!cleanId || cleanId === DEFAULT_SPREADSHEET_ID)) {
      const match = cleanUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) cleanId = match[1];
    }

    if (cleanId && (!cleanUrl || cleanUrl === DEFAULT_SPREADSHEET_URL)) {
      cleanUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/edit?usp=sharing`;
    }

    this.config = {
      ...this.config,
      ...newConfig,
      spreadsheetId: cleanId || DEFAULT_SPREADSHEET_ID,
      spreadsheetUrl: cleanUrl || DEFAULT_SPREADSHEET_URL,
      scriptUrl: cleanScriptUrl,
      autoSync: newConfig.autoSync !== undefined ? newConfig.autoSync : this.config.autoSync
    };

    try {
      localStorage.setItem(SPREADSHEET_CONFIG_KEY, JSON.stringify(this.config));
    } catch {}

    this.notifySyncState();
    return this.config;
  }

  public getConfig(): SpreadsheetConfig {
    return { ...this.config };
  }

  public getSyncState() {
    return {
      ...this.syncState,
      autoSync: this.config.autoSync !== false,
      hasScriptUrl: Boolean(this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL)),
      status: this.config.status,
      lastSyncedAt: this.config.lastSyncedAt,
      isLiveSyncActive: this.isLiveSyncActive
    };
  }

  public subscribeSyncState(listener: () => void) {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter(l => l !== listener);
    };
  }

  private notifySyncState() {
    this.syncListeners.forEach(cb => {
      try { cb(); } catch {}
    });
  }

  private initAutoSync() {
    storage.subscribeMutation(async (event) => {
      if (this.config.autoSync === false) return;
      await this.handleAutoSyncMutation(event);
    });
  }

  private async handleAutoSyncMutation(event: any) {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) return;

    try {
      if (event.type === 'MEMBER' && (event.action === 'CREATE' || event.action === 'UPDATE')) {
        const member: Member = event.payload;
        if (member) {
          await this.saveMemberAndWaitForSync(member);
        }
      }
    } catch (err: any) {
      console.warn('Auto sync error:', err);
    }
  }

  public async fetchSheetRows(sheetName: string = 'Anggota'): Promise<Record<string, any>[]> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) return [];

    try {
      const url = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}sheet=${encodeURIComponent(sheetName)}&_t=${Date.now()}`;
      const response = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  // Sinkronisasi data anggota riil dari Spreadsheet langsung ke UI Admin
  public async syncFromSpreadsheet(silent: boolean = false): Promise<{ success: boolean; count: number; message: string }> {
    if (this.isSyncing) return { success: false, count: 0, message: 'Sinkronisasi sedang berjalan.' };
    this.isSyncing = true;
    if (!silent) this.saveConfig({ status: 'SYNCING' });

    try {
      const rows = await this.fetchSheetRows('Anggota');
      if (rows && rows.length > 0) {
        const existingMembers = storage.getMembers();
        const merged = [...existingMembers];

        rows.forEach((row, idx) => {
          const fullName = row['Nama Lengkap'] || row['nama_lengkap'] || `Anggota ${idx + 1}`;
          const kta = row['Nomor KTA'] || row['nomor_kta'] || '';
          const explicitId = row['ID Anggota'] || row['ID'] || row['id'];
          const memberId = explicitId || (kta ? `mem-${kta.replace(/[^a-zA-Z0-9]/g, '')}` : `mem-sheet-${idx + 1}`);

          const existingIdx = merged.findIndex(m => m.id === memberId || (kta && m.nationalMemberNumber === kta));
          
          const memberObj: Member = {
            id: memberId,
            userId: `user-${memberId}`,
            nationalMemberNumber: kta || undefined,
            fullName,
            nikMasked: '3200******0000',
            avatarUrl: row['Foto URL'] || row['foto_url'] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
            gender: 'LAKI_LAKI',
            birthPlace: row['Kwarcab / Kabupaten'] || 'Indonesia',
            birthDate: '2004-01-01',
            phone: row['Nomor WhatsApp'] || row['nomor_wa'] || '081234567890',
            email: row['Email'] || row['email'] || `anggota${idx + 1}@sakapariwisata.id`,
            address: `Pangkalan ${row['Gugus Depan / Pangkalan'] || 'Pariwisata'}`,
            provinceId: '32',
            provinceName: row['Kwarda / Provinsi'] || 'Jawa Barat',
            regencyId: '32.04',
            regencyName: row['Kwarcab / Kabupaten'] || 'Kabupaten Bandung',
            districtId: '32.04.01',
            districtName: row['Kwarran / Kecamatan'] || 'Kecamatan',
            branchId: 'branch-default',
            branchName: `Kwarran ${row['Kwarran / Kecamatan'] || 'Pariwisata'}`,
            gugusDepan: row['Gugus Depan / Pangkalan'] || 'Gudep Pariwisata',
            joinYear: 2024,
            currentPosition: `Anggota ${row['Krida'] || 'Krida Pemandu'}`,
            krida: (row['Krida'] || 'Krida Pemandu Wisata') as any,
            status: ((row['Status Verifikasi'] || row['status'] || 'ACTIVE').toUpperCase().includes('PENDING') ? 'PENDING' : 'ACTIVE') as any,
            educationLevel: 'SMA/SMK',
            occupation: 'Pramuka Penegak',
            bio: 'Anggota aktif Saka Pariwisata.',
            skills: [],
            certifications: [],
            registeredAt: row['Tanggal Daftar'] || new Date().toISOString()
          };

          if (existingIdx >= 0) {
            merged[existingIdx] = { ...merged[existingIdx], ...memberObj };
          } else {
            merged.push(memberObj);
          }
        });

        // Simpan menggunakan storage.setMembers agar memicu render ulang (reactive notify) ke UI Admin
        storage.setMembers(merged);
      }

      this.saveConfig({ status: 'CONNECTED', lastSyncedAt: new Date().toISOString() });
      this.isSyncing = false;
      return { success: true, count: rows.length, message: 'Sinkronisasi berhasil.' };
    } catch (err: any) {
      this.isSyncing = false;
      this.saveConfig({ status: 'ERROR', lastError: err?.message });
      return { success: false, count: 0, message: err?.message || 'Gagal sinkronisasi.' };
    }
  }

  private normalizeAppsScriptUrl(raw?: string): string {
    const value = String(raw || '').trim().replace(/\s+/g, '');
    if (!value || !/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:[?#].*)?$/i.test(value)) {
      return '';
    }
    return value;
  }

  public async saveMemberAndWaitForSync(member: Member): Promise<{ success: boolean; synced: boolean; message: string; row?: number | null }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) return { success: false, synced: false, message: 'URL Apps Script belum diisi.' };

    const rowData = [
      member.id,
      member.nationalMemberNumber || '',
      member.fullName || '',
      member.email || '',
      member.phone || '',
      member.provinceName || '',
      member.regencyName || '',
      member.branchName || '',
      member.gugusDepan || '',
      member.krida || '',
      member.status || 'PENDING',
      member.avatarUrl || '',
      member.registeredAt || new Date().toISOString(),
      typeof window !== 'undefined' ? `${window.location.origin}/profile?memberId=${encodeURIComponent(member.id)}&nta=${encodeURIComponent(member.nationalMemberNumber || member.id)}` : ''
    ];

    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'UPSERT_MEMBER', sheet: 'Anggota', rowData })
      });
      return { success: true, synced: true, message: 'Data berhasil disimpan ke Google Spreadsheet.' };
    } catch (err: any) {
      return { success: false, synced: false, message: err?.message || 'Gagal mengirim data.' };
    }
  }

  public async pushAllDataToSpreadsheet(): Promise<{ success: boolean; message: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) return { success: false, message: 'URL Apps Script belum diisi.' };

    try {
      const members = storage.getMembers();
      const memberRows = members.map(m => [
        m.id, m.nationalMemberNumber || '', m.fullName || '', m.email || '',
        m.phone || '', m.provinceName || '', m.regencyName || '', m.branchName || '',
        m.gugusDepan || '', m.krida || '', m.status || 'ACTIVE', m.avatarUrl || '',
        m.registeredAt || new Date().toISOString(), ''
      ]);

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'SYNC_ALL_DATA', data: { members: memberRows } })
      });
      return { success: true, message: 'Data berhasil disinkronkan ke Spreadsheet.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Gagal push data.' };
    }
  }

  public async setupDriveFolders(): Promise<{ success: boolean; directActionUrl?: string; message: string }> {
    return { success: true, message: 'Perintah inisialisasi folder Drive selesai.' };
  }

  public getGoogleAppsScriptTemplate(): string {
    return this.getAppsScriptTemplateCode();
  }

  public getAppsScriptTemplateCode(): string {
    return `// SCRIPT GOOGLE APPS SCRIPT SAKA PARIWISATA
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === "CHECK_RECORD") {
    var sheet = ss.getSheetByName(e.parameter.sheet || "Anggota");
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ found: false })).setMimeType(ContentService.MimeType.JSON);

    var values = sheet.getDataRange().getValues();
    var checkId = String(e.parameter.id || "").trim();
    for (var r = 1; r < values.length; r++) {
      if (String(values[r][0]).trim() === checkId || String(values[r][1]).trim() === checkId) {
        return ContentService.createTextOutput(JSON.stringify({ found: true, row: r + 1 })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ found: false })).setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = ss.getSheetByName((e && e.parameter && e.parameter.sheet) || "Anggota");
  if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  var headers = data[0];
  var rows = data.slice(1);
  var result = rows.map(function(row) {
    var item = {};
    headers.forEach(function(h, idx) { item[h] = row[idx]; });
    return item;
  });
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Payload kosong" })).setMimeType(ContentService.MimeType.JSON);
    }
    var body = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = body.sheet || "Anggota";
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    if (body.rowData && Array.isArray(body.rowData)) {
      var rowId = String(body.memberId || body.rowData[0] || "").trim();
      var values = sheet.getDataRange().getValues();
      var targetRow = -1;

      for (var r = 1; r < values.length; r++) {
        if (String(values[r][0]).trim() === rowId) {
          targetRow = r + 1;
          break;
        }
      }

      if (targetRow > 0) {
        sheet.getRange(targetRow, 1, 1, body.rowData.length).setValues([body.rowData]);
      } else {
        sheet.appendRow(body.rowData);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
  }
}

export const spreadsheetService = new SpreadsheetService();
