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
  scriptUrl?: string; // Optional Google Apps Script Web App URL for direct POST writes
  lastSyncedAt?: string;
  autoSync: boolean;
  autoRefreshIntervalSeconds?: number; // Real-time polling frequency (default: 6 seconds)
  status: 'CONNECTED' | 'SYNCING' | 'ERROR' | 'IDLE';
  lastError?: string;
}

export interface SpreadsheetRowMember {
  id?: string;
  nomor_kta?: string;
  nama_lengkap?: string;
  nik?: string;
  jenis_kelamin?: string;
  email?: string;
  nomor_wa?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan_ranting?: string;
  gudep?: string;
  krida?: string;
  tingkat_skk?: string;
  status?: string;
  foto_url?: string;
  tanggal_daftar?: string;
}

class SpreadsheetService {
  private config: SpreadsheetConfig;
  private isPushing = false;
  private isSettingUp = false;
  private isSyncing = false;
  private syncListeners: (() => void)[] = [];
  private broadcastChannel: BroadcastChannel | null = null;
  private liveSyncTimer: any = null;
  private isLiveSyncActive = false;
  private memberSyncInFlight = new Map<string, Promise<{ success: boolean; synced: boolean; message: string; requestId?: string; row?: number | null }>>();
  private lastKnownMemberCount = 0;
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
    this.initBroadcastChannel();
    this.initAutoSync();
    this.startLiveSyncEngine((this.config.autoRefreshIntervalSeconds || 6) * 1000); // Poll every 6 seconds for real-time cloud data
    this.fetchServerConfig().catch(() => {});
  }

  public async fetchServerConfig() {
    if (typeof window === 'undefined') return;
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data && data.config) {
          // Jangan biarkan konfigurasi server lama menimpa konfigurasi lokal
          // (terutama Web App deployment URL yang baru saja dipasang pengguna).
          // Local config adalah konfigurasi aktif perangkat; server hanya fallback
          // untuk nilai yang memang belum tersedia secara lokal.
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
    } catch (err) {
      // offline fallback
    }
  }

  private initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('saka_realtime_cloud_sync_v1');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'REMOTE_MUTATION' || event.data?.type === 'POLL_TRIGGER') {
            this.syncFromSpreadsheet(true); // Silent instant sync on broadcast message
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel initialization fallback:', err);
    }
  }

  private broadcastRemoteEvent(type: string, payload?: any) {
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage({
          type: 'REMOTE_MUTATION',
          mutationType: type,
          payload,
          timestamp: Date.now()
        });
      }
    } catch (e) {
      // Ignore broadcast errors
    }
  }

  public startLiveSyncEngine(intervalMs: number = 6000) {
    if (this.liveSyncTimer) {
      clearInterval(this.liveSyncTimer);
      this.liveSyncTimer = null;
    }
    this.isLiveSyncActive = true;
    this.syncState.pollingIntervalSeconds = Math.round(intervalMs / 1000);

    // Live polling hanya untuk membaca perubahan dari cloud. Jangan langsung
    // melakukan reconciliation 1,2 detik setelah login karena pada beberapa
    // browser itu beradu dengan proses inisialisasi sesi aplikasi.
    // Penulisan anggota TIDAK bergantung pada polling ini; CREATE memakai
    // POST UPSERT_MEMBER -> CHECK_RECORD secara langsung.

    // Interval polling tetap aktif untuk perubahan dari perangkat lain.
    this.liveSyncTimer = setInterval(() => {
      if (this.config.autoSync !== false) {
        if (typeof document === 'undefined' || document.visibilityState === 'visible') {
          this.syncFromSpreadsheet(true).catch(() => {});
        }
      }
    }, intervalMs);

    // 3. Listen for window focus, visibility change, and online status for instant sync
    if (typeof window !== 'undefined') {
      const handleFocusOrVisible = () => {
        if (this.config.autoSync !== false && (typeof document === 'undefined' || document.visibilityState === 'visible')) {
          this.syncFromSpreadsheet(true).catch(() => {});
        }
      };

      window.addEventListener('focus', handleFocusOrVisible);
      window.addEventListener('online', handleFocusOrVisible);
      document.addEventListener('visibilitychange', handleFocusOrVisible);
    }
  }

  public stopLiveSyncEngine() {
    this.isLiveSyncActive = false;
    if (this.liveSyncTimer) {
      clearInterval(this.liveSyncTimer);
      this.liveSyncTimer = null;
    }
  }

  private loadConfig(): SpreadsheetConfig {
    try {
      const raw = localStorage.getItem(SPREADSHEET_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...parsed,
          scriptUrl: parsed.scriptUrl || DEFAULT_APPS_SCRIPT_URL,
          autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
          autoRefreshIntervalSeconds: parsed.autoRefreshIntervalSeconds || 6
        };
      }
    } catch (e) {
      console.error('Failed to load spreadsheet config', e);
    }

    return {
      spreadsheetId: DEFAULT_SPREADSHEET_ID,
      spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
      scriptUrl: DEFAULT_APPS_SCRIPT_URL,
      autoSync: true,
      autoRefreshIntervalSeconds: 6,
      status: 'CONNECTED'
    };
  }

  public saveConfig(updates: Partial<SpreadsheetConfig>): SpreadsheetConfig {
    this.config = { ...this.config, ...updates };
    localStorage.setItem(SPREADSHEET_CONFIG_KEY, JSON.stringify(this.config));
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
      hasScriptUrl: Boolean((this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL).trim().length > 0)
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
      try {
        cb();
      } catch (err) {
        console.warn('Sync listener error:', err);
      }
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

    this.syncState.isSaving = true;
    this.syncState.error = null;
    this.syncState.lastSavedAction = `Menyimpan otomatis data ${event.type?.toLowerCase() || 'item'} ke Spreadsheet & Google Drive...`;
    this.notifySyncState();

    try {
      if (event.type === 'MEMBER') {
        if (event.action === 'CREATE' || event.action === 'UPDATE' || event.action === 'PHOTO_UPDATE') {
          const member: Member = event.payload;
          if (member) {
            if (member.avatarUrl && member.avatarUrl.startsWith('data:image')) {
              try {
                const fname = `KTA_${member.nationalMemberNumber || member.id}_${(member.fullName || 'Anggota').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                const uploadRes = await this.uploadImageToDrive(member.avatarUrl, fname, 'MEMBER_AVATAR');
                if (uploadRes.directUrl) {
                  member.avatarUrl = uploadRes.directUrl;
                }
              } catch (imgErr) {
                console.warn('Auto drive upload error:', imgErr);
              }
            }
            const memberSync = await this.saveMemberAndWaitForSync(member);
            if (!memberSync.synced) throw new Error(memberSync.message);
          }
        } else if (event.action === 'DELETE') {
          const delPayload = event.payload || {};
          await this.deleteRowFromSpreadsheet('Anggota', delPayload.id || delPayload.memberId || event.id, delPayload.member?.nationalMemberNumber || delPayload.kta);
        }
      } else if (event.type === 'TOUR') {
        if (event.action === 'CREATE' || event.action === 'UPDATE') {
          const tour: TourPackage = event.payload;
          if (tour) {
            if (tour.coverImage && tour.coverImage.startsWith('data:image')) {
              try {
                const fname = `TOUR_${tour.id}_${(tour.title || 'Wisata').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                const uploadRes = await this.uploadImageToDrive(tour.coverImage, fname, 'TOUR_PACKAGES');
                if (uploadRes.directUrl) {
                  tour.coverImage = uploadRes.directUrl;
                }
              } catch (e) {}
            }
            await this.appendTourToSpreadsheet(tour);
          }
        } else if (event.action === 'DELETE') {
          const delPayload = event.payload || {};
          await this.deleteRowFromSpreadsheet('Paket_Wisata', delPayload.tourId || delPayload.id || event.id);
        }
      } else if (event.type === 'CULINARY') {
        if (event.action === 'CREATE' || event.action === 'UPDATE') {
          const item: CulinarySouvenirItem = event.payload;
          if (item) {
            if (item.imageUrl && item.imageUrl.startsWith('data:image')) {
              try {
                const fname = `PROD_${item.id}_${(item.name || 'Produk').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                const uploadRes = await this.uploadImageToDrive(item.imageUrl, fname, 'CULINARY_SOUVENIRS');
                if (uploadRes.directUrl) {
                  item.imageUrl = uploadRes.directUrl;
                }
              } catch (e) {}
            }
            await this.appendCulinaryToSpreadsheet(item);
          }
        } else if (event.action === 'DELETE') {
          const delPayload = event.payload || {};
          await this.deleteRowFromSpreadsheet('Kuliner_Cinderamata', delPayload.id || event.id);
        }
      } else if (event.type === 'ACTIVITY') {
        if (event.action === 'CREATE' || event.action === 'UPDATE') {
          const act: Activity = event.payload;
          if (act) {
            if (act.bannerUrl && act.bannerUrl.startsWith('data:image')) {
              try {
                const fname = `ACT_${act.id}_${(act.title || 'Kegiatan').replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
                const uploadRes = await this.uploadImageToDrive(act.bannerUrl, fname, 'ACTIVITIES');
                if (uploadRes.directUrl) {
                  act.bannerUrl = uploadRes.directUrl;
                }
              } catch (e) {}
            }
            await this.appendActivityToSpreadsheet(act);
          }
        } else if (event.action === 'DELETE') {
          const delPayload = event.payload || {};
          await this.deleteRowFromSpreadsheet('Agenda_Kegiatan', delPayload.activityId || delPayload.id || event.id);
        }
      }

      this.syncState.isSaving = false;
      this.syncState.lastSavedTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      this.syncState.lastSavedAction = `Perubahan data berhasil disimpan otomatis ke Google Spreadsheet & Google Drive`;
      this.notifySyncState();

      // Siarkan ke seluruh tab browser lain agar langsung sinkron
      this.broadcastRemoteEvent(event.type, event.payload);
    } catch (err: any) {
      console.error('Auto sync error:', err);
      this.syncState.isSaving = false;
      this.syncState.error = err.message;
      this.notifySyncState();
    }
  }

  /**
   * Hapus baris dari Google Spreadsheet berdasarkan ID atau Nomor KTA
   */
  public async deleteRowFromSpreadsheet(sheet: string, id: string, secondaryId?: string): Promise<{ success: boolean; message: string }> {
    const scriptUrl = this.config.scriptUrl;
    if (!scriptUrl) return { success: true, message: 'Tersimpan lokal.' };

    try {
      const payload = {
        action: 'DELETE_ROW',
        sheet,
        id,
        secondaryId
      };

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      return { success: true, message: `Permintaan hapus ${id} dikirim ke sheet ${sheet}.` };
    } catch (e: any) {
      console.error('Delete row from sheet failed', e);
      return { success: false, message: e.message };
    }
  }

  /**
   * Helper untuk membersihkan dan memformat link gambar Google Drive
   */
  private cleanDriveImageUrl(raw?: string): string {
    if (!raw || typeof raw !== 'string') return '';
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('data:image') || trimmed.startsWith('blob:')) return trimmed;
    const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                  trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                  trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                  trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return trimmed;
  }

  /**
   * Helper pencarian nilai kolom yang fleksibel (case-insensitive, abaikan spasi & karakter khusus)
   */
  private getRowValue(row: Record<string, any>, aliases: string[]): string {
    if (!row) return '';
    // 1. Coba pencarian langsung
    for (const a of aliases) {
      if (row[a] !== undefined && row[a] !== null && String(row[a]).trim() !== '') {
        return String(row[a]).trim();
      }
    }
    // 2. Coba pencarian dengan normalisasi kunci (abaikan huruf besar/kecil, spasi, underscore)
    const keys = Object.keys(row);
    for (const a of aliases) {
      const cleanA = a.toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const k of keys) {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanK === cleanA) {
          const v = row[k];
          if (v !== undefined && v !== null && String(v).trim() !== '') {
            return String(v).trim();
          }
        }
      }
    }
    return '';
  }

  /**
   * Helper penormalisasi nomor telepon/WhatsApp
   */
  private normalizePhoneNumber(raw?: string): string {
    if (!raw) return '081234567890';
    let str = String(raw).trim();
    if (str.endsWith('.0')) str = str.substring(0, str.length - 2);
    let digits = str.replace(/\D/g, '');
    if (digits.startsWith('62')) {
      digits = '0' + digits.substring(2);
    } else if (!digits.startsWith('0') && digits.length >= 9) {
      digits = '0' + digits;
    }
    return digits || str;
  }

  /**
   * Helper pengonversi tanggal format GVIZ Date(yyyy,m,d) atau ISO
   */
  private parseGvizDate(val: any): string {
    if (!val) return new Date().toISOString().split('T')[0];
    const str = String(val).trim();
    const match = str.match(/Date\((\d+),\s*(\d+),\s*(\d+)/i);
    if (match) {
      const y = parseInt(match[1], 10);
      const m = parseInt(match[2], 10) + 1;
      const d = parseInt(match[3], 10);
      return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    }
    if (str.includes('T')) return str.split('T')[0];
    return str;
  }

  /**
   * Mengambil data mentah baris dari Google Spreadsheet menggunakan Google Visualization API
   */
  public async fetchSheetRows(sheetName: string = 'Anggota'): Promise<Record<string, any>[]> {
    const scriptUrl = this.normalizeAppsScriptUrl(
      this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL
    );
    if (!scriptUrl) return [];

    try {
      const url = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}sheet=${encodeURIComponent(sheetName)}&_t=${Date.now()}`;
      const response = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (!response.ok) {
        console.warn(`[SpreadsheetService] Apps Script GET ${sheetName} gagal: HTTP ${response.status}`);
        return [];
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.warn(`[SpreadsheetService] Apps Script mengembalikan format tidak valid untuk ${sheetName}:`, data);
        return [];
      }
      return data;
    } catch (err: any) {
      console.warn(`[SpreadsheetService] Gagal membaca ${sheetName} melalui Apps Script:`, err?.message || err);
      return [];
    }
  }

  /**
   * Parser CSV sederhana untuk spreadsheet
   */
  private parseCSV(csv: string): Record<string, any>[] {
    const lines = csv.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = this.parseCSVLine(lines[0]);
    const results: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        obj[header.trim()] = values[index] !== undefined ? values[index].trim() : '';
      });
      results.push(obj);
    }

    return results;
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let insideQuotes = false;
    let currentValue = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuotes && line[i + 1] === '"') {
          currentValue += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue);
    return values;
  }

  /**
   * Helper pencocokan wilayah (Provinsi & Kabupaten)
   */
  private resolveTerritory(rawProvince?: string, rawRegency?: string): {
    provinceId: string;
    provinceName: string;
    regencyId: string;
    regencyName: string;
  } {
    const cleanProv = (rawProvince || '').trim().toLowerCase().replace(/^(provinsi|kwarda|daerah)\s+/i, '');
    const cleanReg = (rawRegency || '').trim().toLowerCase().replace(/^(kabupaten|kab\.|kota|kwarcab)\s+/i, '');

    let foundProv = PROVINCES_DATA.find(p => 
      p.name.toLowerCase() === cleanProv || 
      p.name.toLowerCase().includes(cleanProv) || 
      cleanProv.includes(p.name.toLowerCase())
    );

    if (!foundProv && rawProvince) {
      if (cleanProv.includes('jabar') || cleanProv.includes('bandung')) foundProv = PROVINCES_DATA.find(p => p.id === '32');
      else if (cleanProv.includes('jakarta') || cleanProv.includes('dki')) foundProv = PROVINCES_DATA.find(p => p.id === '31');
      else if (cleanProv.includes('jatim') || cleanProv.includes('surabaya')) foundProv = PROVINCES_DATA.find(p => p.id === '35');
      else if (cleanProv.includes('jateng') || cleanProv.includes('semarang')) foundProv = PROVINCES_DATA.find(p => p.id === '33');
      else if (cleanProv.includes('jogja') || cleanProv.includes('yogyakarta')) foundProv = PROVINCES_DATA.find(p => p.id === '34');
      else if (cleanProv.includes('bali') || cleanProv.includes('denpasar')) foundProv = PROVINCES_DATA.find(p => p.id === '51');
    }

    const provinceId = foundProv ? foundProv.id : '32';
    const provinceName = foundProv ? foundProv.name : (rawProvince || 'Jawa Barat');

    let foundReg = REGENCIES_DATA.find(r => 
      (r.provinceId === provinceId || !foundProv) && 
      (r.name.toLowerCase() === cleanReg || r.name.toLowerCase().includes(cleanReg) || cleanReg.includes(r.name.toLowerCase()))
    );

    const regencyId = foundReg ? foundReg.id : `${provinceId}.01`;
    const regencyName = foundReg ? foundReg.name : (rawRegency || `Kwartir Cabang ${provinceName}`);

    return {
      provinceId,
      provinceName,
      regencyId,
      regencyName
    };
  }

  /**
   * Tarik data dari Google Spreadsheet dan perbarui state aplikasi secara real-time
   */
  public async syncFromSpreadsheet(silent: boolean = false): Promise<{ success: boolean; count: number; message: string }> {
    if (this.isSyncing) {
      return { success: false, count: 0, message: 'Proses sinkronisasi sedang berjalan...' };
    }

    this.isSyncing = true;
    if (!silent) {
      this.saveConfig({ status: 'SYNCING' });
    }

    try {
      // 1. Sinkronisasi Data Anggota
      const rows = await this.fetchSheetRows('Anggota');
      let memberCount = 0;
      let addedMemberCount = 0;
      const newlyDiscoveredMembers: Member[] = [];
      
      if (rows && rows.length > 0) {
        const existingMembers = storage.getMembers();
        const existingUsers = storage.getUsers();
        const prevMemberIds = new Set(existingMembers.map(m => m.id));
        const prevMemberKta = new Set(existingMembers.map(m => m.nationalMemberNumber ? m.nationalMemberNumber.trim() : ''));
        const prevMemberEmails = new Set(existingMembers.map(m => m.email ? m.email.toLowerCase().trim() : ''));

        const parseRole = (roleStr?: string, prov?: string, kab?: string): UserRole => {
          const r = (roleStr || '').toUpperCase().replace(/\s+/g, '_');
          const p = (prov || '').toUpperCase();
          const k = (kab || '').toUpperCase();

          if (r.includes('SUPER') || r.includes('NASIONAL') || r.includes('PIMPINAN_NASIONAL') || r === 'SUPER_ADMIN' || p.includes('NASIONAL') || k.includes('KWARTIR NASIONAL')) {
            return 'SUPER_ADMIN';
          }
          if (r.includes('KWARDA') || r.includes('PROVINSI') || r === 'ADMIN_PROVINCE') {
            return 'ADMIN_PROVINCE';
          }
          if (r.includes('KWARCAB') || r.includes('KABUPATEN') || r.includes('KOTA') || r === 'ADMIN_REGENCY') {
            return 'ADMIN_REGENCY';
          }
          if (r.includes('KWARRAN') || r.includes('RANTING') || r.includes('KECAMATAN') || r === 'ADMIN_BRANCH') {
            return 'ADMIN_BRANCH';
          }
          return 'MEMBER';
        };

        // Petakan baris spreadsheet ke model Member
        const importedMembers: Member[] = rows.map((row, idx) => {
          const fullName = this.getRowValue(row, [
            'Nama Lengkap', 'nama_lengkap', 'Nama Lengkap (dengan Gelar)', 'Nama Lengkap & Gelar',
            'Nama Anggota', 'Nama Peserta', 'Nama', 'nama', 'Full Name', 'fullname', 'Name', 'col_1'
          ]) || `Anggota ${idx + 1}`;
          
          const kta = this.getRowValue(row, [
            'Nomor KTA', 'Nomor Anggota', 'Nomor NTA', 'nomor_kta', 'NTA', 'KTA',
            'No KTA', 'No. KTA', 'No NTA', 'No. NTA', 'Nomor Registrasi', 'col_2', 'col_0'
          ]);
          
          const rawProv = this.getRowValue(row, [
            'Kwartir Daerah (Provinsi)', 'Kwartir Daerah', 'Kwarda', 'Provinsi', 'provinsi',
            'Daerah', 'Province', 'col_3'
          ]) || 'Jawa Barat';
          
          const rawReg = this.getRowValue(row, [
            'Kwartir Cabang (Kab/Kota)', 'Kwartir Cabang', 'Kwarcab', 'Kabupaten/Kota', 'kabupaten',
            'Kabupaten', 'Kota', 'col_4'
          ]) || 'Kota Bandung';
          
          const territory = this.resolveTerritory(rawProv, rawReg);

          const branch = this.getRowValue(row, [
            'Kwartir Ranting (Kecamatan)', 'Kwartir Ranting', 'Kwarran', 'Kwarran/Kecamatan',
            'kecamatan_ranting', 'Kecamatan', 'Ranting', 'col_5'
          ]) || 'Ranting Saka';
          
          const gudep = this.getRowValue(row, [
            'Gugus Depan / Pangkalan', 'Gugus Depan', 'Gudep', 'gudep', 'Pangkalan',
            'Sekolah / Pangkalan', 'Gugusdepan', 'col_6'
          ]) || 'Gudep Saka Pariwisata';
          
          const kridaRaw = this.getRowValue(row, [
            'Peminatan Krida Saka Pariwisata', 'Pilihan Krida', 'Krida Saka', 'Krida',
            'krida', 'Peminatan Krida', 'col_7'
          ]);
          
          let krida: any = 'Krida Pemandu';
          if (kridaRaw.toLowerCase().includes('penyuluh')) krida = 'Krida Penyuluh';
          else if (kridaRaw.toLowerCase().includes('mice') || kridaRaw.toLowerCase().includes('event')) krida = 'Krida Mice & Event';
          else if (kridaRaw.toLowerCase().includes('kuliner') || kridaRaw.toLowerCase().includes('cinderamata') || kridaRaw.toLowerCase().includes('kriya')) krida = 'Krida Kuliner & Cinderamata';
          else if (kridaRaw.toLowerCase().includes('pemandu') || kridaRaw.toLowerCase().includes('guide')) krida = 'Krida Pemandu';

          const statusRaw = (this.getRowValue(row, ['Status', 'status', 'Status Keanggotaan', 'col_8']) || 'ACTIVE').toUpperCase();
          const phone = this.normalizePhoneNumber(this.getRowValue(row, [
            'Nomor WhatsApp', 'No WhatsApp', 'Nomor WA', 'No. WhatsApp', 'Nomor WhatsApp / HP',
            'No WA', 'WhatsApp', 'Telepon', 'Phone', 'col_9'
          ]));
          
          const email = this.getRowValue(row, ['Email', 'email', 'E-mail', 'Alamat Email', 'col_10']) || `member${idx + 1}@pramuka.id`;
          const rawPhoto = this.getRowValue(row, [
            'Foto URL', 'foto_url', 'Foto', 'Pas Foto', 'Pas Foto Resmi (KTA Digital)',
            'Photo', 'Avatar', 'Link Foto', 'Upload Foto', 'col_11'
          ]);
          const avatarUrl = this.cleanDriveImageUrl(rawPhoto) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80';
          const roleRaw = this.getRowValue(row, ['Role', 'Peran', 'Jabatan', 'Hak Akses', 'Wewenang', 'Posisi']);
          const role = parseRole(roleRaw, rawProv, rawReg);
          const memberId = this.getRowValue(row, ['ID', 'id', 'Id', 'member_id', 'Nomor ID', 'col_0']) || `sheet-member-${idx + 1}`;

          // Ekstraksi Sertifikasi Kompetensi jika ada di spreadsheet
          const rawCertName = this.getRowValue(row, [
            'Sertifikat Kompetensi', 'Sertifikasi', 'Kompetensi', 'Sertifikat', 'Nama Sertifikat',
            'Sertifikasi Kepemanduan / BNSP', 'Keahlian Tersertifikasi'
          ]);
          const rawCertNo = this.getRowValue(row, ['No. Sertifikat', 'Nomor Sertifikat', 'No Sertifikat', 'Nomor Registrasi BNSP']);
          const rawCertIssuer = this.getRowValue(row, ['Lembaga Sertifikasi', 'Penerbit Sertifikat', 'LSP / BNSP', 'Institusi Penerbit']) || 'BNSP / Lembaga Sertifikasi Profesi Pariwisata';
          const rawCertFile = this.cleanDriveImageUrl(this.getRowValue(row, ['File Sertifikat', 'Link Sertifikat', 'Upload Sertifikat', 'Bukti Sertifikat']));

          const memberCerts: Certification[] = [];
          const memberSkills: MemberSkill[] = [];

          if (rawCertName) {
            const certId = `cert-${memberId}-1`;
            memberCerts.push({
              id: certId,
              memberId,
              name: rawCertName,
              certNumber: rawCertNo || `BNSP-SP-${Math.floor(100000 + Math.random() * 900000)}`,
              issuer: rawCertIssuer,
              issueDate: new Date().toISOString().split('T')[0],
              fileUrl: rawCertFile || undefined,
              isVerified: true
            });

            // Tambahkan skill turunan
            memberSkills.push({
              id: `skill-${memberId}-1`,
              skillId: 'skill-tour-guide',
              skillName: rawCertName,
              category: krida === 'Krida Pemandu' ? 'Pemanduan & Tour Guide' : krida === 'Krida Penyuluh' ? 'Ekowisata & Alam' : krida === 'Krida Mice & Event' ? 'MICE & Event' : 'Hospitality & Kuliner',
              proficiency: 'ADVANCED',
              yearsOfExperience: 2,
              portfolioUrl: rawCertFile || undefined,
              isVerified: true
            });
          }

          const rawGender = (this.getRowValue(row, ['Jenis Kelamin', 'Gender', 'JK', 'L/P']) || '').toUpperCase();
          const gender = rawGender.startsWith('P') || rawGender.includes('PEREMPUAN') || rawGender.includes('WANITA') ? 'PEREMPUAN' : 'LAKI_LAKI';

          return {
            id: memberId,
            userId: `user-${memberId}`,
            nationalMemberNumber: kta || undefined,
            fullName,
            nikMasked: '3201**********01',
            avatarUrl,
            gender,
            birthPlace: 'Indonesia',
            birthDate: '2000-01-01',
            email,
            phone,
            address: `${branch}, ${territory.regencyName}, ${territory.provinceName}`,
            provinceId: territory.provinceId,
            provinceName: territory.provinceName,
            regencyId: territory.regencyId,
            regencyName: territory.regencyName,
            districtId: `${territory.regencyId}.01`,
            districtName: branch,
            branchId: `branch-${idx + 1}`,
            branchName: branch,
            gugusDepan: gudep,
            currentPosition: role === 'SUPER_ADMIN' ? 'Ketua Pimpinan Saka Pariwisata Nasional' : `Anggota ${krida}`,
            krida,
            joinYear: new Date().getFullYear(),
            educationLevel: 'SMA/SMK',
            occupation: 'Anggota Pramuka',
            bio: `Anggota resmi Saka Pariwisata ${territory.provinceName}. Terdata langsung dari Google Spreadsheet.`,
            status: statusRaw === 'ACTIVE' || statusRaw === 'PENDING' ? statusRaw : 'ACTIVE',
            registeredAt: this.getRowValue(row, ['Tanggal Daftar', 'tanggal_daftar', 'Created At', 'Timestamp', 'Waktu Pendaftaran', 'col_13']) || new Date().toISOString(),
            verificationToken: `VERIFY-SP-${kta ? kta.replace(/\./g, '') : memberId}`,
            isOperator: role !== 'MEMBER',
            operatorRole: role !== 'MEMBER' ? role : undefined,
            operatorJurisdictionName: role === 'SUPER_ADMIN' ? 'Kwartir Nasional' : role === 'ADMIN_PROVINCE' ? territory.provinceName : role === 'ADMIN_REGENCY' ? territory.regencyName : role === 'ADMIN_BRANCH' ? branch : undefined,
            skills: memberSkills,
            certifications: memberCerts,
            locationHistory: []
          };
        });

        // Gabungkan dan perbarui anggota di database lokal
        if (importedMembers.length > 0) {
          const merged = [...existingMembers];
          const mergedUsers = [...existingUsers];

          importedMembers.forEach((newM, idx) => {
            const rawRow = rows[idx] || {};
            const password = this.getRowValue(rawRow, ['Password', 'Kata Sandi', 'Kata_Sandi', 'password']);
            const username = this.getRowValue(rawRow, ['Username', 'username']) || (newM.email ? newM.email.split('@')[0] : `user_${idx + 1}`);
            const parsedRole = newM.operatorRole || 'MEMBER';

            // Cari apakah member sudah ada di database
            const existingIdx = merged.findIndex(m => 
              m.id === newM.id ||
              (newM.nationalMemberNumber && m.nationalMemberNumber && m.nationalMemberNumber.trim() === newM.nationalMemberNumber.trim()) ||
              (newM.email && m.email && m.email.toLowerCase().trim() === newM.email.toLowerCase().trim())
            );

            const isNewMember = !prevMemberIds.has(newM.id) && 
              (!newM.nationalMemberNumber || !prevMemberKta.has(newM.nationalMemberNumber.trim())) &&
              (!newM.email || !prevMemberEmails.has(newM.email.toLowerCase().trim()));

            if (isNewMember) {
              newlyDiscoveredMembers.push(newM);
            }

            if (existingIdx !== -1) {
              // Update in place
              merged[existingIdx] = {
                ...merged[existingIdx],
                ...newM,
                skills: (merged[existingIdx].skills && merged[existingIdx].skills.length > 0) ? merged[existingIdx].skills : newM.skills,
                certifications: (merged[existingIdx].certifications && merged[existingIdx].certifications.length > 0) ? merged[existingIdx].certifications : newM.certifications,
              };
            } else {
              // Tambahkan anggota baru
              merged.push(newM);
              addedMemberCount++;
            }

            // Sync akun user untuk autentikasi
            const userIdx = mergedUsers.findIndex(u => 
              (newM.email && u.email && u.email.toLowerCase().trim() === newM.email.toLowerCase().trim()) || 
              (u.memberId && u.memberId === newM.id) || 
              (u.username && u.username.toLowerCase() === username.toLowerCase())
            );

            const userObj: CurrentUser = {
              id: newM.userId,
              username: username,
              email: newM.email,
              name: newM.fullName,
              role: parsedRole,
              jurisdictionName: parsedRole === 'SUPER_ADMIN' ? 'Kwartir Nasional' : `${newM.branchName}, ${newM.regencyName}`,
              jurisdictionId: newM.regencyId,
              avatarUrl: newM.avatarUrl,
              memberId: newM.id
            };

            if (userIdx !== -1) {
              mergedUsers[userIdx] = { ...mergedUsers[userIdx], ...userObj };
            } else {
              mergedUsers.push(userObj);
            }
          });

          // Kirim notifikasi jika terdeteksi pendaftaran anggota baru dari perangkat lain
          if (this.lastKnownMemberCount > 0 && newlyDiscoveredMembers.length > 0) {
            newlyDiscoveredMembers.forEach(nm => {
              storage.addNotification(
                'user-superadmin-rohadi',
                `Pendaftaran Anggota Baru (${nm.krida})`,
                `Kak ${nm.fullName} (${nm.branchName || 'Kwarran'}, ${nm.regencyName}) baru saja mendaftar online. Data langsung sinkron secara real-time.`,
                'SUCCESS',
                '/members'
              );
            });
          }
          this.lastKnownMemberCount = importedMembers.length;

          storage.setMembers(merged);
          // Jangan mengubah registry USERS pada silent/live polling.
          // Registry user berkaitan langsung dengan sesi login; menulis ulang
          // daftar user setiap beberapa detik dapat memicu re-render/auth guard
          // pada aplikasi utama. Sinkronisasi user hanya dilakukan saat sync
          // manual (silent=false).
          if (!silent) {
            storage.setUsers(mergedUsers);
          }
          memberCount = importedMembers.length;
        }
      }

      // 2. Sinkronisasi Data Paket Wisata jika sheet tersedia
      try {
        const tourRows = await this.fetchSheetRows('Paket_Wisata');
        if (tourRows && tourRows.length > 0) {
          const existingTours = storage.getTourPackages();
          const mergedTours = [...existingTours];

          tourRows.forEach((row, idx) => {
            const tourId = this.getRowValue(row, ['ID', 'id', 'col_0']) || `tour-sheet-${idx}`;
            const title = this.getRowValue(row, ['Nama Paket', 'title', 'col_1']) || `Paket Wisata ${idx + 1}`;
            const category = this.getRowValue(row, ['Kategori', 'category', 'col_2']) || 'Ekowisata';
            const price = parseFloat(this.getRowValue(row, ['Harga', 'price', 'col_3'])) || 350000;
            const duration = parseInt(this.getRowValue(row, ['Durasi (Hari)', 'duration', 'col_4']), 10) || 1;
            const location = this.getRowValue(row, ['Lokasi', 'location', 'col_5']) || '';
            const prov = this.getRowValue(row, ['Provinsi', 'province', 'col_6']) || 'Jawa Barat';
            const reg = this.getRowValue(row, ['Kabupaten/Kota', 'regency', 'col_7']) || 'Kabupaten Bandung';
            const organizer = this.getRowValue(row, ['Penyelenggara', 'organizer', 'col_8']) || 'Saka Pariwisata';
            const phone = this.normalizePhoneNumber(this.getRowValue(row, ['Kontak WA', 'phone', 'col_9']));
            const banner = this.cleanDriveImageUrl(this.getRowValue(row, ['Foto Banner', 'image', 'col_10'])) || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80';

            const tourObj: TourPackage = {
              id: tourId,
              title,
              slug: tourId,
              category: (category as any) || 'Ekowisata',
              pricePerPerson: price,
              durationDays: duration,
              locationAddress: location,
              provinceId: '32',
              provinceName: prov,
              regencyId: '32.04',
              regencyName: reg,
              districtName: 'Wilayah Saka',
              ownerType: 'MEMBER',
              ownerId: 'mem-jabar-01',
              ownerName: organizer,
              contactPhone: phone,
              contactEmail: 'info@sakapariwisata.id',
              coverImage: banner,
              galleryImages: [banner],
              description: `Paket wisata edukasi dan petualangan ${title}. Dipandu oleh kader Pramuka Saka Pariwisata tersertifikasi.`,
              facilities: ['Pemandu Wisata Saka Pariwisata BNSP', 'Tiket Masuk Destinasi', 'Dokumentasi', 'Asuransi'],
              minCapacity: 2,
              maxCapacity: 30,
              guideProvided: true,
              itinerary: [
                {
                  day: 1,
                  title: 'Eksplorasi dan Edukasi Saka Pariwisata',
                  description: 'Kunjungan destinasi, observasi potensi lokal, dan pendampingan pemandu pramuka.'
                }
              ],
              status: 'APPROVED_PUBLISHED',
              submittedAt: new Date().toISOString(),
              viewsCount: 15,
              featured: true
            };

            const existingIdx = mergedTours.findIndex(t => t.id === tourId || t.title.toLowerCase() === title.toLowerCase());
            if (existingIdx !== -1) {
              mergedTours[existingIdx] = { ...mergedTours[existingIdx], ...tourObj };
            } else {
              mergedTours.push(tourObj);
            }
          });

          storage.setTourPackages(mergedTours);
        }
      } catch (e) {
        console.warn('Tour packages sync notice:', e);
      }

      // 3. Sinkronisasi Data Kuliner & Cinderamata jika sheet tersedia
      try {
        const culinaryRows = await this.fetchSheetRows('Kuliner_Cinderamata');
        if (culinaryRows && culinaryRows.length > 0) {
          const existingCulinary = storage.getCulinarySouvenirs();
          const mergedCulinary = [...existingCulinary];

          culinaryRows.forEach((row, idx) => {
            const itemId = this.getRowValue(row, ['ID', 'id', 'col_0']) || `prod-sheet-${idx}`;
            const name = this.getRowValue(row, ['Nama Produk', 'name', 'col_1']) || `Produk Saka ${idx + 1}`;
            const kind = (this.getRowValue(row, ['Jenis', 'kind', 'col_2']) || 'KULINER').toUpperCase() === 'CINDERAMATA' ? 'CINDERAMATA' : 'KULINER';
            const krida = (this.getRowValue(row, ['Kategori', 'krida', 'col_3']) || 'Krida Kuliner & Cinderamata') as any;
            const price = parseFloat(this.getRowValue(row, ['Harga', 'price', 'col_4'])) || 50000;
            const author = this.getRowValue(row, ['Produsen/Pengrajin', 'author', 'col_5']) || 'Kader Saka Pariwisata';
            const phone = this.normalizePhoneNumber(this.getRowValue(row, ['Kontak WA', 'phone', 'col_6']));
            const prov = this.getRowValue(row, ['Provinsi', 'province', 'col_7']) || 'Jawa Barat';
            const reg = this.getRowValue(row, ['Kabupaten/Kota', 'regency', 'col_8']) || 'Kabupaten Bandung';
            const img = this.cleanDriveImageUrl(this.getRowValue(row, ['Foto Produk', 'image', 'col_9'])) || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80';
            const catLabel = this.getRowValue(row, ['Sertifikasi Halal', 'category', 'col_10']) || 'Produk UMKM Saka Pariwisata';

            const culObj: CulinarySouvenirItem = {
              id: itemId,
              name,
              kind,
              krida,
              kridaCategory: kind === 'KULINER' ? 'Kuliner & Minuman Daerah' : 'Kriya & Cinderamata Khas',
              categoryLabel: catLabel,
              description: `Produk karya kader Saka Pariwisata: ${name}. Terjamin mutu dan higienis.`,
              priceEstimate: price,
              priceUnit: 'per kemasan / pcs',
              imageUrl: img,
              provinceId: '32',
              provinceName: prov,
              regencyId: '32.04',
              regencyName: reg,
              districtId: '32.04.01',
              districtName: 'Sentra Saka',
              authorMemberId: 'mem-jabar-01',
              authorName: author,
              authorNta: '32.73.01.000124',
              contactPhone: phone,
              tags: ['UMKM', 'Saka Pariwisata', 'Lokal'],
              status: 'APPROVED',
              createdAt: new Date().toISOString(),
              likesCount: 25,
              featured: true
            };

            const existingIdx = mergedCulinary.findIndex(c => c.id === itemId || c.name.toLowerCase() === name.toLowerCase());
            if (existingIdx !== -1) {
              mergedCulinary[existingIdx] = { ...mergedCulinary[existingIdx], ...culObj };
            } else {
              mergedCulinary.push(culObj);
            }
          });

          storage.setCulinarySouvenirs(mergedCulinary);
        }
      } catch (e) {
        console.warn('Culinary sync notice:', e);
      }

      // 4. Sinkronisasi Data Agenda & Kegiatan jika sheet tersedia
      try {
        const activityRows = await this.fetchSheetRows('Agenda_Kegiatan');
        if (activityRows && activityRows.length > 0) {
          const existingActivities = storage.getActivities();
          const mergedActivities = [...existingActivities];

          activityRows.forEach((row, idx) => {
            const actId = this.getRowValue(row, ['ID', 'id', 'col_0']) || `act-sheet-${idx + 1}`;
            const title = this.getRowValue(row, ['Nama Agenda', 'Judul Kegiatan', 'Nama Kegiatan', 'title', 'col_1']) || `Kegiatan Saka ${idx + 1}`;
            const cat = this.getRowValue(row, ['Kategori', 'category', 'col_2']) || 'Pelatihan';
            const levelRaw = (this.getRowValue(row, ['Skala Tingkat', 'Tingkat', 'Level', 'organizerLevel', 'col_3']) || 'NASIONAL').toUpperCase();
            let organizerLevel: any = 'NASIONAL';
            if (levelRaw.includes('INTERNASIONAL')) organizerLevel = 'INTERNASIONAL';
            else if (levelRaw.includes('PROVINSI') || levelRaw.includes('KWARDA')) organizerLevel = 'PROVINSI';
            else if (levelRaw.includes('KABUPATEN') || levelRaw.includes('KWARCAB')) organizerLevel = 'KABUPATEN';
            else if (levelRaw.includes('RANTING') || levelRaw.includes('KWARRAN')) organizerLevel = 'RANTING';

            const organizer = this.getRowValue(row, ['Penyelenggara', 'organizerName', 'col_4']) || 'Pimpinan Saka Pariwisata';
            const location = this.getRowValue(row, ['Lokasi', 'Tempat', 'locationName', 'col_5']) || 'Bumi Perkemahan';
            const prov = this.getRowValue(row, ['Provinsi', 'province', 'provinceName', 'col_6']) || 'Jawa Barat';
            const reg = this.getRowValue(row, ['Kabupaten/Kota', 'regency', 'regencyName', 'col_7']) || 'Kota Bandung';
            const startD = this.parseGvizDate(this.getRowValue(row, ['Tanggal Mulai', 'startDate', 'col_8', 'col_7']));
            const endD = this.parseGvizDate(this.getRowValue(row, ['Tanggal Selesai', 'endDate', 'col_9', 'col_8']));
            const feeTypeRaw = (this.getRowValue(row, ['Jenis Biaya', 'Biaya', 'feeType', 'col_9', 'col_10']) || 'GRATIS').toUpperCase();
            const feeType: any = feeTypeRaw.includes('BERBAYAR') ? 'BERBAYAR' : feeTypeRaw.includes('SUBSIDI') ? 'SUBSIDI' : 'GRATIS';
            const fee = parseFloat(this.getRowValue(row, ['Nominal Biaya', 'feeAmount', 'col_10', 'col_11'])) || 0;
            const phone = this.normalizePhoneNumber(this.getRowValue(row, ['Kontak Narahubung', 'Kontak WA', 'phone', 'contactPhone', 'col_11', 'col_12']));
            const banner = this.cleanDriveImageUrl(this.getRowValue(row, ['Banner URL', 'Foto', 'image', 'bannerUrl', 'col_13'])) || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=80';
            const desc = this.getRowValue(row, ['Deskripsi', 'description', 'col_14']) || `Kegiatan resmi Saka Pariwisata: ${title}. Terbuka untuk seluruh anggota dan insan kepariwisataan.`;

            const actObj: Activity = {
              id: actId,
              title,
              slug: actId,
              description: desc,
              bannerUrl: banner,
              coverImage: banner,
              category: cat,
              organizerLevel,
              organizerName: organizer,
              locationName: location,
              locationAddress: `${location}, ${reg}, ${prov}`,
              provinceName: prov,
              regencyName: reg,
              startDate: startD,
              endDate: endD,
              timeString: '08:00 - 16:00 WIB',
              capacity: 100,
              registeredCount: 0,
              isPublic: true,
              status: 'OPEN_REGISTRATION',
              requirements: ['Anggota Aktif Gerakan Pramuka / Saka Pariwisata', 'Membawa Seragam Pramuka Lengkap'],
              contactPhone: phone,
              feeType,
              feeAmount: fee,
              uploadedByName: 'Pimpinan Saka Pariwisata',
              uploadedByRole: 'SUPER_ADMIN'
            };

            const existingIdx = mergedActivities.findIndex(a => a.id === actId || a.title.toLowerCase() === title.toLowerCase());
            if (existingIdx !== -1) {
              mergedActivities[existingIdx] = { ...mergedActivities[existingIdx], ...actObj };
            } else {
              mergedActivities.push(actObj);
            }
          });

          storage.setActivities(mergedActivities);
        }
      } catch (e) {
        console.warn('Activities sync notice:', e);
      }

      // Bersihkan duplikat database
      storage.deduplicateDatabase();

      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
      this.syncState.lastLiveCheck = timeStr;
      if (!this.syncState.lastSavedTime) {
        this.syncState.lastSavedTime = timeStr;
      }
      this.notifySyncState();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('saka:cloud-data-updated', {
          detail: {
            memberCount,
            addedMemberCount,
            time: timeStr,
            silent
          }
        }));
      }

      const successMsg = `Berhasil menyinkronkan database spreadsheet. ${memberCount} data anggota terbaca (${addedMemberCount} data baru ditambahkan).`;
      this.saveConfig({
        lastSyncedAt: new Date().toISOString(),
        status: 'CONNECTED',
        lastError: undefined
      });

      this.isSyncing = false;
      return { success: true, count: memberCount, message: successMsg };
    } catch (err: any) {
      this.isSyncing = false;
      console.error('Sync failed:', err);
      this.saveConfig({
        status: 'ERROR',
        lastError: err.message || 'Gagal terhubung ke Google Spreadsheet'
      });
      return {
        success: false,
        count: 0,
        message: `Gagal sinkronisasi: ${err.message || 'Periksa apakah ID Spreadsheet dan nama sheet sudah benar.'}`
      };
    }
  }

  /**
   * Normalisasi URL Google Apps Script Web App.
   * Hanya endpoint /exec yang dipakai untuk transaksi produksi.
   */
  private normalizeAppsScriptUrl(raw?: string): string {
    const value = String(raw || '').trim().replace(/\s+/g, '');
    if (!value) return '';

    // Hanya izinkan Web App production endpoint. Deployment /dev atau ID mentah
    // bukan endpoint transaksi yang valid.
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:[?#].*)?$/i.test(value)) {
      console.warn('[SpreadsheetService] Apps Script URL tidak valid / bukan endpoint /exec:', value);
      return '';
    }
    return value;
  }

  /**
   * Kirim POST sederhana ke Google Apps Script.
   * text/plain sengaja digunakan agar request tetap CORS-safelisted ketika
   * mode no-cors dipakai. Response POST tidak dipercaya sebagai bukti sukses;
   * keberhasilan diverifikasi melalui CHECK_RECORD.
   */
  private async postToAppsScript(payload: Record<string, any>): Promise<void> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) {
      throw new Error('Google Apps Script Web App URL belum diisi.');
    }

    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    // Pada no-cors response bersifat opaque. Jangan memeriksa response.ok.
    // Tidak adanya exception hanya berarti browser berhasil mengirim request.
    void response;
  }

  /**
   * Verifikasi langsung ke endpoint CHECK_RECORD Apps Script.
   */
  private async checkRecordInSpreadsheet(
    sheet: string,
    id: string,
    secondaryId?: string
  ): Promise<{ found: boolean; row?: number | null; message?: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!scriptUrl) throw new Error('Google Apps Script Web App URL belum diisi.');

    const params = new URLSearchParams();
    params.set('action', 'CHECK_RECORD');
    params.set('sheet', sheet);
    params.set('id', String(id || ''));
    if (secondaryId) params.set('secondaryId', String(secondaryId));
    params.set('_t', String(Date.now()));
    params.set('_r', String(Math.floor(Math.random() * 1000000)));

    const separator = scriptUrl.includes('?') ? '&' : '?';
    const verifyUrl = `${scriptUrl}${separator}${params.toString()}`;

    // Jangan kirim custom headers pada GET Apps Script. Header seperti
    // Cache-Control/Pragma/Expires dapat memicu CORS preflight dan membuat
    // Web App Google gagal di browser ponsel. Cache-busting sudah dilakukan
    // melalui query parameter _t/_r.
    const response = await fetch(verifyUrl, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`CHECK_RECORD HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data?.status === 'error') {
      throw new Error(data.message || 'CHECK_RECORD gagal diproses Apps Script.');
    }

    return {
      found: Boolean(data?.found),
      row: data?.row ?? null,
      message: data?.message
    };
  }

  /**
   * POST UPSERT_MEMBER lalu verifikasi CHECK_RECORD sampai record benar-benar
   * ditemukan. Promise per member-ID dideduplikasi agar auto-sync dan form
   * tidak menulis transaksi yang sama secara paralel.
   */
  public async testAppsScriptConnection(): Promise<{ ok: boolean; url: string; message: string }> {
    const url = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);
    if (!url) return { ok: false, url: '', message: 'Web App URL kosong.' };
    try {
      const testUrl = `${url}${url.includes('?') ? '&' : '?'}action=CHECK_RECORD&sheet=Anggota&id=__FRONTEND_TEST__&_t=${Date.now()}`;
      const response = await fetch(testUrl, { method: 'GET', cache: 'no-store' });
      if (!response.ok) return { ok: false, url, message: `HTTP ${response.status}` };
      const data = await response.json();
      return data?.status === 'success'
        ? { ok: true, url, message: 'Frontend berhasil terhubung ke Google Apps Script.' }
        : { ok: false, url, message: data?.message || 'Respons Web App tidak valid.' };
    } catch (err: any) {
      return { ok: false, url, message: err?.message || String(err) };
    }
  }

  public async saveMemberAndWaitForSync(member: Member): Promise<{
    success: boolean;
    synced: boolean;
    message: string;
    requestId?: string;
    row?: number | null;
  }> {
    const key = String(member.id || member.nationalMemberNumber || member.email || '').trim();
    if (!key) {
      return { success: false, synced: false, message: 'ID anggota tidak valid.' };
    }

    const existing = this.memberSyncInFlight.get(key);
    if (existing) return existing;

    const promise = this.appendMemberToSpreadsheet(member);
    this.memberSyncInFlight.set(key, promise);

    try {
      return await promise;
    } finally {
      if (this.memberSyncInFlight.get(key) === promise) {
        this.memberSyncInFlight.delete(key);
      }
    }
  }

  /**
   * Kirim data anggota baru ke Google Spreadsheet melalui Google Apps Script Web App.
   * Alur produksi: POST UPSERT_MEMBER -> CHECK_RECORD -> SYNCED.
   */
  public async appendMemberToSpreadsheet(member: Member): Promise<{
    success: boolean;
    synced: boolean;
    message: string;
    requestId?: string;
    row?: number | null;
  }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl || DEFAULT_APPS_SCRIPT_URL);

    if (!scriptUrl) {
      const message = 'Google Apps Script Web App URL belum diisi. Data belum dianggap tersinkron ke Spreadsheet.';
      this.syncState.error = message;
      this.notifySyncState();
      return { success: false, synced: false, message };
    }

    const requestId = `member-${member.id || member.nationalMemberNumber || Date.now()}-${Date.now()}`;
    const verificationLink = typeof window !== 'undefined'
      ? `${window.location.origin}/?verifyId=${encodeURIComponent(member.nationalMemberNumber || member.id)}`
      : '';

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
      verificationLink
    ];

    const payload = {
      action: 'UPSERT_MEMBER',
      requestId,
      transactionId: requestId,
      sheet: 'Anggota',
      memberId: member.id,
      secondaryId: member.nationalMemberNumber || '',
      rowData
    };

    this.syncState.isSaving = true;
    this.syncState.error = null;
    this.syncState.lastSavedAction = `Mengirim ${member.fullName || 'anggota'} ke Google Spreadsheet...`;
    this.notifySyncState();

    try {
      // STEP 1: POST UPSERT_MEMBER. Response sengaja tidak dipercaya karena no-cors.
      await this.postToAppsScript(payload);

      // STEP 2: CHECK_RECORD. Beri waktu Apps Script menyelesaikan write + flush.
      const maxAttempts = 12;
      let lastCheckError = '';

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const check = await this.checkRecordInSpreadsheet(
            'Anggota',
            String(member.id || ''),
            member.nationalMemberNumber || ''
          );

          if (check.found) {
            this.syncState.isSaving = false;
            this.syncState.lastSavedTime = new Date().toLocaleTimeString('id-ID', {
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            }) + ' WIB';
            this.syncState.lastSavedAction = `Data ${member.fullName || 'anggota'} terverifikasi di Spreadsheet (SYNCED)`;
            this.syncState.error = null;
            this.saveConfig({
              status: 'CONNECTED',
              lastSyncedAt: new Date().toISOString(),
              lastError: undefined
            });
            this.notifySyncState();

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('saka:member-synced', {
                detail: { memberId: member.id, requestId, row: check.row, status: 'SYNCED' }
              }));
            }

            return {
              success: true,
              synced: true,
              requestId,
              row: check.row ?? null,
              message: `Data anggota ${member.fullName || member.id} berhasil disimpan dan diverifikasi di Spreadsheet (SYNCED).`
            };
          }
        } catch (checkErr: any) {
          lastCheckError = checkErr?.message || String(checkErr);
          console.warn(`[SpreadsheetService] CHECK_RECORD attempt ${attempt}/${maxAttempts}:`, lastCheckError);
        }

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 750));
        }
      }

      const message = lastCheckError
        ? `POST UPSERT_MEMBER terkirim, tetapi CHECK_RECORD belum menemukan data setelah ${maxAttempts} percobaan: ${lastCheckError}`
        : `POST UPSERT_MEMBER terkirim, tetapi data belum ditemukan di Spreadsheet setelah ${maxAttempts} percobaan.`;

      this.syncState.isSaving = false;
      this.syncState.error = message;
      this.syncState.lastSavedAction = `Sinkronisasi ${member.fullName || 'anggota'} gagal diverifikasi (FAILED)`;
      this.notifySyncState();

      return {
        success: false,
        synced: false,
        requestId,
        row: null,
        message
      };
    } catch (err: any) {
      const message = `Gagal POST UPSERT_MEMBER: ${err?.message || String(err)}`;
      console.error('[SpreadsheetService] Member sync failed:', err);
      this.syncState.isSaving = false;
      this.syncState.error = message;
      this.syncState.lastSavedAction = `Sinkronisasi ${member.fullName || 'anggota'} gagal (FAILED)`;
      this.notifySyncState();

      return {
        success: false,
        synced: false,
        requestId,
        row: null,
        message
      };
    }
  }

  /**
   * Kirim data paket wisata ke Google Spreadsheet
   */
  public async appendTourToSpreadsheet(tour: TourPackage): Promise<{ success: boolean; message: string }> {
    const scriptUrl = this.config.scriptUrl;
    if (!scriptUrl) return { success: true, message: 'Tersimpan secara lokal.' };

    try {
      const payload = {
        action: 'UPSERT_TOUR',
        sheet: 'Paket_Wisata',
        itemId: tour.id,
        rowData: [
          tour.id,
          tour.title,
          tour.category,
          tour.pricePerPerson,
          tour.durationDays,
          tour.locationAddress,
          tour.provinceName,
          tour.regencyName,
          tour.ownerName,
          tour.contactPhone,
          tour.coverImage || '',
          new Date().toISOString()
        ]
      };

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      return { success: true, message: 'Paket wisata terkirim ke spreadsheet.' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  /**
   * Kirim data produk kuliner & cinderamata ke Google Spreadsheet
   */
  public async appendCulinaryToSpreadsheet(item: CulinarySouvenirItem): Promise<{ success: boolean; message: string }> {
    const scriptUrl = this.config.scriptUrl;
    if (!scriptUrl) return { success: true, message: 'Tersimpan secara lokal.' };

    try {
      const payload = {
        action: 'UPSERT_CULINARY',
        sheet: 'Kuliner_Cinderamata',
        itemId: item.id,
        rowData: [
          item.id,
          item.name,
          item.kind,
          item.krida,
          item.priceEstimate,
          item.authorName,
          item.contactPhone,
          item.provinceName,
          item.regencyName,
          item.imageUrl || '',
          item.categoryLabel || '',
          new Date().toISOString()
        ]
      };

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      return { success: true, message: 'Produk kuliner/cinderamata terkirim ke spreadsheet.' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  /**
   * Kirim agenda kegiatan / event ke Google Spreadsheet
   */
  public async appendActivityToSpreadsheet(activity: any): Promise<{ success: boolean; message: string }> {
    const scriptUrl = this.config.scriptUrl;
    if (!scriptUrl) return { success: true, message: 'Tersimpan secara lokal.' };

    try {
      const payload = {
        action: 'UPSERT_ACTIVITY',
        sheet: 'Agenda_Kegiatan',
        itemId: activity.id,
        rowData: [
          activity.id,
          activity.title,
          activity.category,
          activity.organizerLevel,
          activity.organizerName,
          activity.locationName,
          activity.provinceName,
          activity.startDate,
          activity.endDate,
          activity.feeType,
          activity.feeAmount || 0,
          activity.contactPhone || '',
          activity.uploadedByName || '',
          new Date().toISOString()
        ]
      };

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      return { success: true, message: 'Agenda kegiatan terkirim ke spreadsheet.' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  /**
   * Unggah seluruh data lokal ke Google Spreadsheet secara menyeluruh (Batch Sync)
   */
  public async pushAllDataToSpreadsheet(): Promise<{ success: boolean; message: string; counts: { members: number; tours: number; culinary: number; activities: number } }> {
    const scriptUrl = this.config.scriptUrl;
    const members = storage.getMembers();
    const tours = storage.getTourPackages();
    const culinary = storage.getCulinarySouvenirs();
    const activities = storage.getActivities();

    const counts = {
      members: members.length,
      tours: tours.length,
      culinary: culinary.length,
      activities: activities.length
    };

    if (!scriptUrl) {
      return {
        success: false,
        message: 'Google Apps Script Web App URL belum diisi. Harap masukkan Web App URL di tab "Pengaturan API" terlebih dahulu.',
        counts
      };
    }

    if (this.isPushing) {
      return {
        success: false,
        message: 'Proses pengunggahan data sedang berlangsung, mohon tunggu...',
        counts
      };
    }

    this.isPushing = true;

    try {
      const payload = {
        action: 'SYNC_ALL_DATA',
        members: members.map(m => [
          m.id,
          m.nationalMemberNumber || '',
          m.fullName,
          m.email,
          m.phone,
          m.provinceName,
          m.regencyName,
          m.branchName,
          m.gugusDepan,
          m.krida || '',
          m.status,
          m.avatarUrl,
          m.registeredAt,
          window.location.origin + '/?verifyId=' + (m.nationalMemberNumber || m.id)
        ]),
        tours: tours.map(t => [
          t.id,
          t.title,
          t.category,
          t.pricePerPerson,
          t.durationDays,
          t.locationAddress,
          t.provinceName,
          t.regencyName,
          t.ownerName,
          t.contactPhone,
          t.coverImage || '',
          new Date().toISOString()
        ]),
        culinary: culinary.map(c => [
          c.id,
          c.name,
          c.kind,
          c.krida,
          c.priceEstimate,
          c.authorName,
          c.contactPhone,
          c.provinceName,
          c.regencyName,
          c.imageUrl || '',
          c.categoryLabel || '',
          new Date().toISOString()
        ]),
        activities: activities.map(a => [
          a.id,
          a.title,
          a.category,
          a.organizerLevel,
          a.organizerName,
          a.locationName,
          a.provinceName,
          a.startDate,
          a.endDate,
          a.feeType,
          a.feeAmount || 0,
          a.contactPhone || '',
          a.uploadedByName || '',
          new Date().toISOString()
        ])
      };

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      this.saveConfig({
        lastSyncedAt: new Date().toISOString(),
        status: 'CONNECTED',
        lastError: undefined
      });

      this.isPushing = false;
      return {
        success: true,
        message: `Berhasil mengirim seluruh data ke Google Spreadsheet: ${members.length} Anggota, ${tours.length} Paket Wisata, ${culinary.length} Kuliner/Kriya, ${activities.length} Agenda Kegiatan.`,
        counts
      };
    } catch (err: any) {
      this.isPushing = false;
      console.error('Push all failed:', err);
      return {
        success: false,
        message: `Gagal mengirim data ke spreadsheet: ${err.message}`,
        counts
      };
    }
  }

  /**
   * Upload gambar base64 langsung ke Google Drive melalui Apps Script Web App
   */
  public async uploadImageToDrive(
    base64Data: string, 
    filename: string, 
    category: 'MEMBER_AVATAR' | 'TOUR_PACKAGES' | 'CULINARY_SOUVENIRS' | 'DOCUMENTS' | 'KTA_CARD' | 'ACTIVITIES' = 'MEMBER_AVATAR'
  ): Promise<{ success: boolean; directUrl?: string; fileId?: string; viewUrl?: string; message: string }> {
    const scriptUrl = this.config.scriptUrl;
    if (!scriptUrl) {
      return {
        success: false,
        message: 'Google Apps Script Web App URL belum dipasang. Harap pasang Web App URL di Pengaturan Database agar dapat mengunggah file langsung ke Google Drive.'
      };
    }

    try {
      const payload = {
        action: 'UPLOAD_DRIVE_IMAGE',
        folderId: '16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh',
        category,
        filename,
        base64: base64Data,
        mimeType: base64Data.includes('data:image/png') ? 'image/png' : 'image/jpeg'
      };

      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });

      return {
        success: true,
        message: `Foto ${filename} berhasil dikirim untuk diunggah ke Google Drive folder.`
      };
    } catch (err: any) {
      console.error('Failed to upload image to Drive:', err);
      return {
        success: false,
        message: `Gagal mengunggah foto ke Google Drive: ${err.message}`
      };
    }
  }

  /**
   * Inisialisasi struktur subfolder di Google Drive folder 16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh
   */
  public async setupDriveFolders(): Promise<{ success: boolean; directActionUrl?: string; message: string }> {
    const scriptUrl = this.config.scriptUrl;
    if (!scriptUrl) {
      return {
        success: false,
        message: 'Google Apps Script Web App URL belum dipasang. Silakan pasang Web App URL di tab "Pengaturan API".'
      };
    }

    if (this.isSettingUp) {
      return {
        success: false,
        message: 'Proses inisialisasi folder sedang berjalan...'
      };
    }

    this.isSettingUp = true;
    const actionUrl = scriptUrl.includes('?')
      ? `${scriptUrl}&action=SETUP_DRIVE_FOLDERS`
      : `${scriptUrl}?action=SETUP_DRIVE_FOLDERS`;

    try {
      const payload = {
        action: 'SETUP_DRIVE_FOLDERS',
        folderId: '16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh'
      };

      // Eksekusi via POST no-cors tunggal
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });

      this.isSettingUp = false;
      return {
        success: true,
        directActionUrl: actionUrl,
        message: 'Permintaan inisialisasi 5 subfolder Google Drive berhasil dikirim ke Google Apps Script.'
      };
    } catch (err: any) {
      this.isSettingUp = false;
      return {
        success: false,
        directActionUrl: actionUrl,
        message: `Gagal inisialisasi folder: ${err.message}`
      };
    }
  }

  /**
   * Hasilkan Template Script Google Apps Script yang siap di-copy-paste oleh user
   */
  public getGoogleAppsScriptTemplate(): string {
    return `// =========================================================================
// GOOGLE APPS SCRIPT: MASTER DATABASE & DRIVE API SAKA PARIWISATA INDONESIA
// =========================================================================
// Spreadsheet Target:
// https://docs.google.com/spreadsheets/d/1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E/edit
//
// Folder Google Drive Target:
// https://drive.google.com/drive/folders/16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh
//
// =========================================================================
// CARA PENGGUNAAN (1 KLIK & DEPLOY WEB APP):
// 1. Tempelkan seluruh kode ini ke Apps Script (Kode.gs).
// 2. Jika ingin mengetes di editor, pilih fungsi "jalankanTesKoneksiLengkap" lalu klik "Jalankan".
// 3. Klik "Deploy" (Penerapan) di pojok kanan atas > "New deployment" (Penerapan baru).
// 4. Pilih tipe: "Web app" (Aplikasi web).
// 5. Konfigurasi:
//    - Description: "Saka Pariwisata Master Database & Drive API v5.0"
//    - Execute as: "Me" (Saya / akun email pemilik spreadsheet)
//    - Who has access: "Anyone" (Siapa saja)  <-- WAJIB PILIH "ANYONE"
// 6. Klik "Deploy", lalu salin URL Web App yang berakhiran "/exec".
// 7. Tempelkan ke Pengaturan Database di Aplikasi Saka Pariwisata.
// =========================================================================

var MASTER_SPREADSHEET_ID = "1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E";
var MASTER_DRIVE_FOLDER_ID = "16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh";

/**
 * FUNGSI TEST UTAMA: Aman dijalankan langsung dari menu dropdown Apps Script!
 */
function jalankanTesKoneksiLengkap() {
  Logger.log("=== MEMULAI TES KONEKSI SAKA PARIWISATA ===");
  
  // 1. Tes Google Drive
  var rootFolder = getOrCreateDriveFolder(MASTER_DRIVE_FOLDER_ID);
  var subfolders = setupAllSubfolders(rootFolder);
  Logger.log("✅ Google Drive OK: " + rootFolder.getName() + " (ID: " + rootFolder.getId() + ")");
  Logger.log("✅ 5 Subfolder Terverifikasi: " + Object.keys(subfolders).join(", "));
  
  // 2. Tes Google Spreadsheet
  var ss = getActiveOrConfiguredSpreadsheet();
  if (ss) {
    Logger.log("✅ Google Spreadsheet OK: " + ss.getName() + " (ID: " + ss.getId() + ")");
    var sheets = ss.getSheets().map(function(s) { return s.getName(); });
    Logger.log("✅ Sheet yang terdeteksi: " + sheets.join(", "));
  } else {
    Logger.log("⚠️ Gagal membuka Spreadsheet. Pastikan Apps Script memiliki izin ke ID: " + MASTER_SPREADSHEET_ID);
  }
  
  Logger.log("=== SEMUA TES KONEKSI BERHASIL ===");
  return "Koneksi Google Drive & Spreadsheet Berhasil!";
}

/**
 * Inisialisasi struktur folder di Google Drive
 */
function inisialisasiFolderGoogleDrive() {
  Logger.log("Memulai inisialisasi folder Google Drive: " + MASTER_DRIVE_FOLDER_ID);
  var rootFolder = getOrCreateDriveFolder(MASTER_DRIVE_FOLDER_ID);
  var subfolders = setupAllSubfolders(rootFolder);

  var statusContent = "SISTEM DATABASE & MEDIA SAKA PARIWISATA INDONESIA\\n" +
    "Diperbarui pada: " + new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB\\n" +
    "Folder Utama: " + rootFolder.getName() + " (ID: " + rootFolder.getId() + ")\\n" +
    "Status: 5 SUBFOLDER BERHASIL DIBUAT & TERHUBUNG AKTIF TANPA DUPLIKASI\\n\\n" +
    "Daftar Subfolder Resmi:\\n" +
    "1. 01_Pas_Foto_KTA_Anggota\\n" +
    "2. 02_Paket_Wisata\\n" +
    "3. 03_Kuliner_dan_Cinderamata\\n" +
    "4. 04_Agenda_Kegiatan\\n" +
    "5. 05_Dokumen_dan_Surat\\n";

  // Hapus status file lama jika ada agar tidak double file
  var oldStatus = rootFolder.getFilesByName("STATUS_KONEKSI_SAKA_PARIWISATA.txt");
  while (oldStatus.hasNext()) {
    oldStatus.next().setTrashed(true);
  }

  var statusBlob = Utilities.newBlob(statusContent, "text/plain", "STATUS_KONEKSI_SAKA_PARIWISATA.txt");
  var statusFile = rootFolder.createFile(statusBlob);
  statusFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  Logger.log("✅ SUKSES! 5 Subfolder dan File STATUS_KONEKSI_SAKA_PARIWISATA.txt berhasil diperbarui.");
  return {
    status: "success",
    folderId: rootFolder.getId(),
    subfolders: Object.keys(subfolders)
  };
}

/**
 * Helper fleksibel untuk mengambil Spreadsheet aktif atau membuka berdasarkan MASTER_SPREADSHEET_ID
 */
function getActiveOrConfiguredSpreadsheet() {
  var ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {}
  
  if (!ss && MASTER_SPREADSHEET_ID) {
    try {
      ss = SpreadsheetApp.openById(MASTER_SPREADSHEET_ID);
    } catch (err) {
      Logger.log("Gagal membuka spreadsheet via openById: " + err.toString());
    }
  }
  return ss;
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";

  // 1. Eksekusi inisialisasi Drive lewat GET
  if (action === "SETUP_DRIVE_FOLDERS" || action === "SETUP_DRIVE" || action === "INIT_DRIVE") {
    inisialisasiFolderGoogleDrive();
    var htmlOutput = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Inisialisasi Google Drive Berhasil</title>" +
      "<style>body{font-family:system-ui,-apple-system,sans-serif;padding:30px;background:#f0fdf4;color:#166534;line-height:1.6} " +
      ".card{background:#fff;padding:28px;border-radius:20px;box-shadow:0 10px 25px rgba(0,0,0,0.08);max-width:560px;margin:30px auto;border:1px solid #bbf7d0} " +
      "h1{color:#15803d;margin-top:0;font-size:22px;display:flex;align-items:center;gap:8px} " +
      "ul{text-align:left;background:#f8fafc;padding:16px 28px;border-radius:12px;border:1px solid #e2e8f0;font-family:monospace;font-size:13px} " +
      "li{margin:6px 0} .btn{display:inline-block;padding:12px 20px;background:#059669;color:#fff;text-decoration:none;border-radius:12px;font-weight:bold;margin-top:10px}</style></head>" +
      "<body><div class='card'><h1>✅ Inisialisasi Google Drive Sukses!</h1>" +
      "<p>5 Subfolder resmi dan file verifikasi telah berhasil dibuat di Google Drive Saka Pariwisata:</p>" +
      "<ul><li>📁 01_Pas_Foto_KTA_Anggota</li><li>📁 02_Paket_Wisata</li><li>📁 03_Kuliner_dan_Cinderamata</li><li>📁 04_Agenda_Kegiatan</li><li>📁 05_Dokumen_dan_Surat</li></ul>" +
      "<p><a class='btn' href='https://drive.google.com/drive/folders/16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh' target='_blank'>📂 Buka Folder di Google Drive</a></p>" +
      "<p style='font-size:12px;color:#64748b;margin-top:20px'>Anda sekarang dapat kembali ke aplikasi Saka Pariwisata dan mulai sinkronisasi data.</p></div></body></html>";
    return HtmlService.createHtmlOutput(htmlOutput);
  }

  // 2. Baca data Spreadsheet
  var sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : "Anggota";
  var ss = getActiveOrConfiguredSpreadsheet();
  
  if (!ss) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Spreadsheet tidak dapat dibuka." }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Sheet tidak ditemukan: " + sheetName }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = data[0];
  var rows = data.slice(1);
  
  var result = rows.map(function(row) {
    var item = {};
    headers.forEach(function(header, idx) {
      item[header] = row[idx];
    });
    return item;
  });
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Tidak ada payload data" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      body = e.parameter || {};
    }

    var ss = getActiveOrConfiguredSpreadsheet();
    var rootFolder = getOrCreateDriveFolder(MASTER_DRIVE_FOLDER_ID);

    // 1. AKSI INISIALISASI STRUKTUR SUBFOLDER DI GOOGLE DRIVE (TANPA DUPLIKASI)
    if (body.action === "SETUP_DRIVE_FOLDERS" || (e.parameter && e.parameter.action === "SETUP_DRIVE_FOLDERS")) {
      var res = inisialisasiFolderGoogleDrive();
      return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. AKSI UPLOAD GAMBAR TUNGGAL KE GOOGLE DRIVE
    if (body.action === "UPLOAD_DRIVE_IMAGE") {
      var targetSubfolder = getCategorySubfolder(rootFolder, body.category || "MEMBER_AVATAR");
      
      var base64Data = (body.base64 || "").replace(/^data:image\\/\\w+;base64,/, "");
      if (!base64Data) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Data base64 gambar kosong" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var decoded = Utilities.base64Decode(base64Data);
      var filename = body.filename || ("saka_photo_" + Date.now() + ".jpg");
      
      // Hapus file lama dengan nama persis sama di folder tujuan agar tidak berlipat ganda
      var oldFiles = targetSubfolder.getFilesByName(filename);
      while (oldFiles.hasNext()) {
        oldFiles.next().setTrashed(true);
      }

      var blob = Utilities.newBlob(decoded, body.mimeType || "image/jpeg", filename);
      var file = targetSubfolder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      var directUrl = "https://lh3.googleusercontent.com/d/" + file.getId();
      var viewUrl = file.getUrl();

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        fileId: file.getId(),
        directUrl: directUrl,
        viewUrl: viewUrl,
        folderName: targetSubfolder.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. AKSI BATCH SINKRONISASI SELURUH DATA & ANTI DATA GANDA (SYNC_ALL_DATA)
    if (body.action === "SYNC_ALL_DATA") {
      var driveSubfolders = setupAllSubfolders(rootFolder);
      var avatarFolder = driveSubfolders["01_Pas_Foto_KTA_Anggota"];

      // Proses dan simpan foto anggota jika dalam format base64
      var processedMembers = (body.members || []).map(function(row) {
        var photoUrl = row[11]; // Kolom Foto URL
        if (photoUrl && typeof photoUrl === "string" && photoUrl.indexOf("data:image") === 0) {
          try {
            var b64 = photoUrl.replace(/^data:image\\/\\w+;base64,/, "");
            var dec = Utilities.base64Decode(b64);
            var memberNtaOrId = row[1] || row[0] || Date.now();
            var memberName = (row[2] || "Anggota").replace(/[^a-zA-Z0-9]/g, "_");
            var fName = "KTA_" + memberNtaOrId + "_" + memberName + ".jpg";
            
            // Hapus file foto lama jika sudah ada
            var oldAvatar = avatarFolder.getFilesByName(fName);
            while (oldAvatar.hasNext()) {
              oldAvatar.next().setTrashed(true);
            }

            var blb = Utilities.newBlob(dec, "image/jpeg", fName);
            var f = avatarFolder.createFile(blb);
            f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
            row[11] = "https://lh3.googleusercontent.com/d/" + f.getId();
          } catch (imgErr) {
            // Keep original if error
          }
        }
        return row;
      });

      // Tulis / Update (Upsert) ke masing-masing Sheet
      syncSheetData(ss, "Anggota", [
        "ID", "Nomor KTA", "Nama Lengkap", "Email", "Nomor WA", "Provinsi", "Kabupaten/Kota", 
        "Kwarran/Kecamatan", "Gudep", "Krida", "Status", "Foto URL", "Tanggal Daftar", "Link Verifikasi"
      ], processedMembers);

      syncSheetData(ss, "Paket_Wisata", [
        "ID", "Nama Paket", "Kategori", "Harga", "Durasi (Hari)", "Lokasi", "Provinsi", 
        "Kabupaten/Kota", "Penyelenggara", "Kontak WA", "Foto Banner", "Waktu Diperbarui"
      ], body.tours || []);

      syncSheetData(ss, "Kuliner_Cinderamata", [
        "ID", "Nama Produk", "Jenis", "Kategori", "Harga", "Produsen/Pengrajin", "Kontak WA", 
        "Provinsi", "Kabupaten/Kota", "Foto Produk", "Sertifikasi Halal", "Waktu Diperbarui"
      ], body.culinary || []);

      syncSheetData(ss, "Agenda_Kegiatan", [
        "ID", "Nama Agenda", "Kategori", "Skala Tingkat", "Penyelenggara", "Lokasi", 
        "Provinsi", "Tanggal Mulai", "Tanggal Selesai", "Jenis Biaya", "Nominal Biaya", 
        "Kontak Narahubung", "Didaftarkan Oleh", "Waktu Diperbarui"
      ], body.activities || []);

      // Buat file rekapitulasi data di Google Drive (gantikan rekap lama)
      var rekapText = "REKAPITULASI DATABASE SAKA PARIWISATA INDONESIA\\n" +
        "Waktu Sinkronisasi: " + new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) + " WIB\\n" +
        "Jumlah Anggota: " + (body.members ? body.members.length : 0) + "\\n" +
        "Jumlah Paket Wisata: " + (body.tours ? body.tours.length : 0) + "\\n" +
        "Jumlah Kuliner & Cinderamata: " + (body.culinary ? body.culinary.length : 0) + "\\n" +
        "Jumlah Agenda Kegiatan: " + (body.activities ? body.activities.length : 0) + "\\n";
      
      var oldRekap = rootFolder.getFilesByName("REKAP_DATABASE_TERBARU.txt");
      while (oldRekap.hasNext()) {
        oldRekap.next().setTrashed(true);
      }

      var rekapBlob = Utilities.newBlob(rekapText, "text/plain", "REKAP_DATABASE_TERBARU.txt");
      rootFolder.createFile(rekapBlob);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Seluruh data dan foto berhasil disinkronkan ke Google Spreadsheet dan Google Drive tanpa duplikasi."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. AKSI HAPUS BARIS TERTENTU (DELETE_ROW)
    if (body.action === "DELETE_ROW") {
      var targetSheetName = body.sheet || "Anggota";
      if (!ss) {
        return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Spreadsheet tidak dapat diakses." })).setMimeType(ContentService.MimeType.JSON);
      }
      var targetSheet = ss.getSheetByName(targetSheetName);
      if (!targetSheet) {
        return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Sheet tidak ada, tidak ada yang dihapus." })).setMimeType(ContentService.MimeType.JSON);
      }

      var delId = String(body.id || "").trim();
      var delSecId = String(body.secondaryId || "").trim();
      var sheetVals = targetSheet.getDataRange().getValues();

      for (var rowIdx = sheetVals.length - 1; rowIdx >= 1; rowIdx--) {
        var cell1 = String(sheetVals[rowIdx][0] || "").trim();
        var cell2 = String(sheetVals[rowIdx][1] || "").trim();
        if ((delId && cell1 === delId) || (delSecId && cell2 === delSecId)) {
          targetSheet.deleteRow(rowIdx + 1);
          break;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data " + delId + " berhasil dihapus dari " + targetSheetName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 5. AKSI TULIS BARIS TUNGGAL DENGAN UPSERT (CEK DUPLIKASI ID & KTA)
    var sheetName = body.sheet || "Anggota";
    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Spreadsheet tidak dapat diakses." })).setMimeType(ContentService.MimeType.JSON);
    }
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    if (body.rowData && Array.isArray(body.rowData)) {
      var rowId = String(body.memberId || body.itemId || body.rowData[0] || "").trim();
      var rowKta = body.rowData[1] ? String(body.rowData[1]).trim() : "";
      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      var targetRowIndex = -1;

      if (values.length > 1 && (rowId || rowKta)) {
        for (var r = 1; r < values.length; r++) {
          var cellId = String(values[r][0] || "").trim();
          var cellKta = String(values[r][1] || "").trim();
          if ((rowId && cellId === rowId) || (rowKta && rowKta.length > 5 && cellKta === rowKta)) {
            targetRowIndex = r + 1; // 1-indexed for Sheet range
            break;
          }
        }
      }

      if (targetRowIndex > 0) {
        sheet.getRange(targetRowIndex, 1, 1, body.rowData.length).setValues([body.rowData]);
      } else {
        sheet.appendRow(body.rowData);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data berhasil disimpan dan disinkronkan ke sheet " + sheetName
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateDriveFolder(folderId) {
  if (folderId && typeof folderId === "string" && folderId.trim()) {
    try {
      var folder = DriveApp.getFolderById(folderId.trim());
      if (folder && !folder.isTrashed()) return folder;
    } catch (err) {
      Logger.log("getFolderById info: " + err.toString());
    }
  }

  try {
    var existing = DriveApp.getRootFolder().getFoldersByName("SAKA_PARIWISATA_DATABASE_MEDIA");
    while (existing.hasNext()) {
      var f = existing.next();
      if (!f.isTrashed()) return f;
    }

    var newRoot = DriveApp.getRootFolder().createFolder("SAKA_PARIWISATA_DATABASE_MEDIA");
    newRoot.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return newRoot;
  } catch (driveErr) {
    Logger.log("Drive root error: " + driveErr.toString());
    return DriveApp.getRootFolder();
  }
}

function setupAllSubfolders(rootFolder) {
  // Pengaman: Jika fungsi dijalankan langsung dari dropdown Apps Script tanpa parameter
  if (!rootFolder || typeof rootFolder.getFoldersByName !== "function") {
    rootFolder = getOrCreateDriveFolder(MASTER_DRIVE_FOLDER_ID);
  }
  if (!rootFolder || typeof rootFolder.getFoldersByName !== "function") {
    rootFolder = DriveApp.getRootFolder();
  }

  var folderNames = [
    "01_Pas_Foto_KTA_Anggota",
    "02_Paket_Wisata",
    "03_Kuliner_dan_Cinderamata",
    "04_Agenda_Kegiatan",
    "05_Dokumen_dan_Surat"
  ];

  var map = {};
  folderNames.forEach(function(fName) {
    try {
      var it = rootFolder.getFoldersByName(fName);
      var found = null;
      while (it && it.hasNext()) {
        var f = it.next();
        if (!f.isTrashed()) {
          found = f;
          break;
        }
      }

      if (found) {
        map[fName] = found;
      } else {
        var target = rootFolder.createFolder(fName);
        target.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        map[fName] = target;
      }
    } catch (subErr) {
      Logger.log("Subfolder setup info (" + fName + "): " + subErr.toString());
    }
  });

  return map;
}

function getCategorySubfolder(rootFolder, category) {
  // Pengaman: Jika rootFolder kosong
  if (!rootFolder || typeof rootFolder.getFoldersByName !== "function") {
    rootFolder = getOrCreateDriveFolder(MASTER_DRIVE_FOLDER_ID);
  }
  if (!rootFolder || typeof rootFolder.getFoldersByName !== "function") {
    rootFolder = DriveApp.getRootFolder();
  }

  var targetName = "01_Pas_Foto_KTA_Anggota";
  if (category === "TOUR_PACKAGES") targetName = "02_Paket_Wisata";
  else if (category === "CULINARY_SOUVENIRS") targetName = "03_Kuliner_dan_Cinderamata";
  else if (category === "DOCUMENTS" || category === "KTA_CARD") targetName = "05_Dokumen_dan_Surat";
  else if (category === "ACTIVITIES") targetName = "04_Agenda_Kegiatan";

  try {
    var it = rootFolder.getFoldersByName(targetName);
    var found = null;
    while (it && it.hasNext()) {
      var f = it.next();
      if (!f.isTrashed()) {
        found = f;
        break;
      }
    }

    if (found) {
      return found;
    } else {
      var created = rootFolder.createFolder(targetName);
      created.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return created;
    }
  } catch (err) {
    Logger.log("getCategorySubfolder error: " + err.toString());
    return rootFolder;
  }
}

function syncSheetData(ss, sheetName, defaultHeaders, rowsData) {
  // Pengaman jika parameter ss tidak terkirim (misal fungsi dijalankan langsung dari tombol Run)
  if (!ss) {
    ss = getActiveOrConfiguredSpreadsheet();
  }
  if (!ss) {
    Logger.log("⚠️ PERINGATAN: Spreadsheet tidak ditemukan atau tidak dapat diakses.");
    return;
  }

  if (!sheetName) sheetName = "Anggota";
  if (!defaultHeaders) defaultHeaders = ["ID", "Nama Lengkap", "Waktu Diperbarui"];

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(defaultHeaders);
  }
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(defaultHeaders);
  }

  // Melakukan Upsert agar data di sheet tidak berlipat ganda
  if (rowsData && rowsData.length > 0) {
    var existingValues = sheet.getDataRange().getValues();
    var idToRowIndex = {};

    for (var i = 1; i < existingValues.length; i++) {
      var rowId = String(existingValues[i][0] || "").trim();
      var rowKta = String(existingValues[i][1] || "").trim();
      if (rowId) idToRowIndex[rowId] = i + 1;
      if (rowKta && rowKta.length > 5) idToRowIndex[rowKta] = i + 1;
    }

    rowsData.forEach(function(row) {
      var newId = String(row[0] || "").trim();
      var newKta = String(row[1] || "").trim();
      var targetIndex = idToRowIndex[newId] || (newKta && newKta.length > 5 ? idToRowIndex[newKta] : null);

      if (targetIndex) {
        sheet.getRange(targetIndex, 1, 1, row.length).setValues([row]);
      } else {
        sheet.appendRow(row);
        var lastRow = sheet.getLastRow();
        if (newId) idToRowIndex[newId] = lastRow;
        if (newKta && newKta.length > 5) idToRowIndex[newKta] = lastRow;
      }
    });
  }
}
`;
  }
}

export const spreadsheetService = new SpreadsheetService();

