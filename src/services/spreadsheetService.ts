import { Member, TourPackage, CulinarySouvenirItem, Activity, CurrentUser, UserRole, Certification, MemberSkill } from '../types';
import { storage } from './storage';
import { PROVINCES_DATA, REGENCIES_DATA } from '../data/indonesiaTerritories';
import { MASTER_SKILLS } from '../data/initialData';

export const DEFAULT_SPREADSHEET_ID = '1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E';
export const DEFAULT_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit?usp=sharing`;

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
      scriptUrl: '',
      autoSync: true,
      autoRefreshIntervalSeconds: 6,
      status: 'CONNECTED'
    };
  }

  public saveConfig(updates: Partial<SpreadsheetConfig>): SpreadsheetConfig {
    this.config = { ...this.config, ...updates };
    localStorage.setItem(SPREADSHEET_CONFIG_KEY, JSON.stringify(this.config));
    this.notifySyncState();

    // Persist to central server so ALL devices and browsers share this configuration
    if (typeof window !== 'undefined') {
      try {
        const token = storage.getAuthToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        fetch('/api/config', {
          method: 'POST',
          headers,
          credentials: 'same-origin',
          body: JSON.stringify(this.config)
        }).then(async (response) => {
          if (!response.ok) {
            let message = `HTTP ${response.status}`;
            try {
              const result = await response.json();
              if (result?.message) message = result.message;
            } catch {}
            console.warn('[SpreadsheetService] Save config to server rejected:', message);
          }
        }).catch(err => console.warn('[SpreadsheetService] Save config to server notice:', err));
      } catch (err) {
        console.warn('[SpreadsheetService] Save config to server error:', err);
      }
    }

    return this.config;
  }

  public getConfig(): SpreadsheetConfig {
    return { ...this.config };
  }

  public getSyncState() {
    return {
      ...this.syncState,
      autoSync: this.config.autoSync !== false,
      hasScriptUrl: Boolean(this.config.scriptUrl && this.config.scriptUrl.trim().length > 0)
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
    const scriptUrl = this.config.scriptUrl;
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
    const spreadsheetId = this.config.spreadsheetId || DEFAULT_SPREADSHEET_ID;
    const scriptUrl = this.config.scriptUrl;

    // 1. Prioritaskan pengambilan data melalui Google Apps Script Web App jika sudah terpasang
    if (scriptUrl && scriptUrl.trim().length > 0) {
      try {
        const gasUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}sheet=${encodeURIComponent(sheetName)}&_t=${Date.now()}`;
        const gasResponse = await fetch(gasUrl, {
          method: 'GET',
          cache: 'no-store'
        });
        if (gasResponse.ok) {
          const gasData = await gasResponse.json();
          if (Array.isArray(gasData) && gasData.length > 0) {
            return gasData;
          }
        }
      } catch (gasErr) {
        // Fallback ke GViz API jika GAS web app ada kendala network
      }
    }

    // 2. Daftar variasi nama sheet yang mungkin digunakan melalui Google Visualization API
    const sheetCandidates: string[] = [sheetName];
    if (sheetName.toLowerCase().includes('anggota')) {
      sheetCandidates.push(
        'Data Anggota',
        'Data_Anggota',
        'Members',
        'Anggota Saka',
        'Pendaftaran',
        'Form Responses 1',
        'Respon Formulir 1',
        'Form Responses',
        'Respon Formulir',
        'Sheet1',
        'Sheet 1',
        'Lembar1',
        'Lembar 1',
        'Data Member',
        'Member',
        ''
      );
    } else if (sheetName.toLowerCase().includes('paket') || sheetName.toLowerCase().includes('wisata')) {
      sheetCandidates.push('Paket_Wisata', 'Paket Wisata', 'Tours', 'Tour_Packages', 'Paket', 'Wisata');
    } else if (sheetName.toLowerCase().includes('kuliner') || sheetName.toLowerCase().includes('cinderamata')) {
      sheetCandidates.push('Kuliner_Cinderamata', 'Kuliner & Cinderamata', 'Produk', 'Products', 'Souvenirs', 'Kuliner', 'Cinderamata');
    } else if (sheetName.toLowerCase().includes('agenda') || sheetName.toLowerCase().includes('kegiatan')) {
      sheetCandidates.push('Agenda_Kegiatan', 'Agenda & Kegiatan', 'Events', 'Activities', 'Agenda', 'Kegiatan');
    }

    for (const targetSheet of sheetCandidates) {
      try {
        const sheetParam = targetSheet ? `&sheet=${encodeURIComponent(targetSheet)}` : '';
        const cacheBuster = `&_t=${Date.now()}&_rnd=${Math.floor(Math.random() * 1000000)}`;
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json${sheetParam}${cacheBuster}`;
        
        const response = await fetch(gvizUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (!response.ok) continue;

        const text = await response.text();
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = text.substring(jsonStart, jsonEnd + 1);
          const data = JSON.parse(jsonStr);
          
          if (data.table && data.table.rows && data.table.rows.length > 0) {
            let cols: string[] = (data.table.cols || []).map((col: any, idx: number) => {
              return (col && col.label && col.label.trim()) || `col_${idx}`;
            });

            let dataRows = data.table.rows;

            // Jika label cols generic (seperti col_0, col_1) dan baris pertama berisi header teks
            const firstRowHasHeaders = cols.every(c => c.startsWith('col_') || !c) && 
              dataRows.length > 0 && 
              dataRows[0].c && 
              dataRows[0].c.some((cell: any) => cell && typeof cell.v === 'string' && (cell.v.toLowerCase().includes('nama') || cell.v.toLowerCase().includes('kta') || cell.v.toLowerCase().includes('id') || cell.v.toLowerCase().includes('email')));

            if (firstRowHasHeaders) {
              cols = dataRows[0].c.map((cell: any, idx: number) => {
                return (cell && (cell.v || cell.f) && String(cell.v || cell.f).trim()) || `col_${idx}`;
              });
              dataRows = dataRows.slice(1);
            }

            const results = dataRows.map((row: any) => {
              const item: Record<string, any> = {};
              if (row.c) {
                row.c.forEach((cell: any, idx: number) => {
                  const key = cols[idx] || `col_${idx}`;
                  item[key] = cell ? (cell.v !== null && cell.v !== undefined ? cell.v : cell.f || '') : '';
                });
              }
              return item;
            }).filter((r: any) => Object.values(r).some(v => v !== '' && v !== null && v !== undefined));

            if (results.length > 0) {
              return results;
            }
          }
        }
      } catch (err: any) {
        // Abaikan kandidat yang tidak cocok secara silent
      }
    }

    // 3. Fallback: Coba CSV Export URL secara aman tanpa uncaught error
    try {
      const csvCacheBuster = `&_t=${Date.now()}&_rnd=${Math.floor(Math.random() * 1000000)}`;
      const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&sheet=${encodeURIComponent(sheetName)}${csvCacheBuster}`;
      const response = await fetch(csvUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (response && response.ok) {
        const csvText = await response.text();
        const parsed = this.parseCSV(csvText);
        if (parsed.length > 0) return parsed;
      }
    } catch (csvErr: any) {
      // Penanganan fallback secara graceful tanpa mengotori log error sistem
    }

    return [];
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
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl);
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
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl);
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

    const response = await fetch(verifyUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
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
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl);

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
  ): Promise<{ success: boolean; url?: string; directUrl?: string; fileId?: string; viewUrl?: string; folderId?: string; message: string }> {
    const scriptUrl = this.normalizeAppsScriptUrl(this.config.scriptUrl);
    if (!scriptUrl) {
      return {
        success: false,
        message: 'Google Apps Script Web App URL belum dipasang. Harap pasang Web App URL di Pengaturan API.'
      };
    }

    const value = String(base64Data || '').trim();
    if (!/^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(value)) {
      return { success: false, message: 'Data foto tidak valid.' };
    }

    try {
      // Gunakan proxy aplikasi agar browser dapat menerima response JSON dari GAS.
      // Proxy juga meneruskan URL GAS yang dipilih Super Admin dan memvalidasi
      // hasil upload sebelum frontend melanjutkan pendaftaran.
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({
          base64: value,
          filename,
          category,
          scriptUrl
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false || !data?.url) {
        throw new Error(data?.message || `Upload foto gagal (HTTP ${response.status}).`);
      }

      const directUrl = String(data.url || data.directUrl || '').trim();
      return {
        success: true,
        url: directUrl,
        directUrl,
        fileId: data.fileId,
        viewUrl: data.viewUrl,
        folderId: data.folderId,
        message: data.message || `Foto ${filename} berhasil disimpan ke folder Google Drive.`
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
    return `/**
 * ============================================================
 * SISTEM SINKRONISASI REAL-TIME SAKA PARIWISATA
 * GOOGLE APPS SCRIPT - Code.gs
 * ============================================================
 *
 * Fungsi:
 * 1. Membaca data anggota dari Spreadsheet
 * 2. Menerima pendaftaran anggota baru
 * 3. UPSERT data anggota
 * 4. Memperbarui status verifikasi anggota
 * 5. Mendukung sinkronisasi aplikasi web
 *
 * SHEET:
 * Anggota
 *
 * KOLOM:
 * A = ID Anggota
 * B = Nomor KTA
 * C = Nama Lengkap
 * D = Email
 * E = Nomor WhatsApp
 * F = Kwarda / Provinsi
 * G = Kwarcab / Kabupaten
 * H = Kwarran / Kecamatan
 * I = Gugus Depan / Pangkalan
 * J = Krida
 * K = Status Verifikasi
 * L = Foto URL
 * M = Tanggal Daftar
 * N = Link Verifikasi Cepat
 * ============================================================
 */


/* ============================================================
 * KONFIGURASI
 * ============================================================ */

var SHEET_MEMBER = "Anggota";

// ID Spreadsheet tujuan. Ambil dari URL Google Spreadsheet.
var SPREADSHEET_ID = "1r3Lve_Rd1D4QqSP_ViCNzSZrIamJXEWh0lXSkU-EO8E";

function getSpreadsheet() {
  if (!SPREADSHEET_ID) {
    throw new Error("SPREADSHEET_ID belum diisi.");
  }
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

// Folder utama Google Drive repository.
var GOOGLE_DRIVE_MAIN_FOLDER_ID = "16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh";

// Lima kategori folder yang digunakan aplikasi.
var DRIVE_CATEGORY_FOLDERS = {
  MEMBER_AVATAR: "Foto Anggota & Pasfoto",
  TOUR_PACKAGES: "Foto Paket Wisata",
  CULINARY_SOUVENIRS: "Foto Kuliner & Cinderamata",
  KTA_CARD: "Desain KTA & Latar Belakang",
  ICONS_LOGOS: "Logo, Lambang & Vektor",
  DOCUMENTS: "Dokumen"
};

function getDriveMainFolder() {
  if (!GOOGLE_DRIVE_MAIN_FOLDER_ID) {
    throw new Error("GOOGLE_DRIVE_MAIN_FOLDER_ID belum diisi.");
  }
  return DriveApp.getFolderById(GOOGLE_DRIVE_MAIN_FOLDER_ID);
}

function getOrCreateDriveSubfolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function getDriveFolderForCategory(category) {
  var key = String(category || "MEMBER_AVATAR").trim().toUpperCase();
  var folderName = DRIVE_CATEGORY_FOLDERS[key] || DRIVE_CATEGORY_FOLDERS.MEMBER_AVATAR;
  return getOrCreateDriveSubfolder(getDriveMainFolder(), folderName);
}

/**
 * Membuat/menjamin lima subfolder repository Drive.
 * Aman dijalankan berulang kali; tidak membuat duplikasi jika folder
 * dengan nama yang sama sudah tersedia di folder utama.
 */
function inisialisasiFolderGoogleDrive() {
  var mainFolder = getDriveMainFolder();
  var created = [];
  var existing = [];

  var categories = [
    "MEMBER_AVATAR",
    "TOUR_PACKAGES",
    "CULINARY_SOUVENIRS",
    "KTA_CARD",
    "ICONS_LOGOS"
  ];

  for (var i = 0; i < categories.length; i++) {
    var key = categories[i];
    var folderName = DRIVE_CATEGORY_FOLDERS[key];
    var folders = mainFolder.getFoldersByName(folderName);

    if (folders.hasNext()) {
      var existingFolder = folders.next();
      existing.push({
        category: key,
        name: folderName,
        folderId: existingFolder.getId(),
        url: "https://drive.google.com/drive/folders/" + existingFolder.getId()
      });
    } else {
      var newFolder = mainFolder.createFolder(folderName);
      existing.push({
        category: key,
        name: folderName,
        folderId: newFolder.getId(),
        url: "https://drive.google.com/drive/folders/" + newFolder.getId()
      });
      created.push(folderName);
    }
  }

  return {
    success: true,
    status: "success",
    action: "SETUP_DRIVE_FOLDERS",
    mainFolderId: GOOGLE_DRIVE_MAIN_FOLDER_ID,
    mainFolderUrl: "https://drive.google.com/drive/folders/" + GOOGLE_DRIVE_MAIN_FOLDER_ID,
    created: created,
    folders: existing,
    message: created.length > 0
      ? "Struktur folder Google Drive berhasil dibuat."
      : "Struktur folder Google Drive sudah tersedia."
  };
}

var SHEET_USERS = "Users";
var USER_HEADERS = ["ID User", "Username", "Email", "Password Hash", "Nama", "Role", "Jurisdiction Name", "Jurisdiction ID", "Avatar URL", "Member ID", "Created At", "Status"];

function getOrInitUsersSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_USERS);
  if (!sheet) sheet = ss.insertSheet(SHEET_USERS);
  if (sheet.getMaxColumns() < USER_HEADERS.length) sheet.insertColumnsAfter(sheet.getMaxColumns(), USER_HEADERS.length - sheet.getMaxColumns());
  var headers = sheet.getRange(1, 1, 1, USER_HEADERS.length).getValues()[0];
  var needs = false;
  for (var i = 0; i < USER_HEADERS.length; i++) { if (String(headers[i] || "").trim() !== USER_HEADERS[i]) { needs = true; break; } }
  if (needs) sheet.getRange(1, 1, 1, USER_HEADERS.length).setValues([USER_HEADERS]).setFontWeight("bold");
  return sheet;
}
function findUserRow(sheet, identifier) {
  var needle = String(identifier || "").trim().toLowerCase();
  if (!needle || sheet.getLastRow() <= 1) return null;
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, USER_HEADERS.length).getValues();
  for (var i = 0; i < values.length; i++) { if (String(values[i][1] || "").trim().toLowerCase() === needle || String(values[i][2] || "").trim().toLowerCase() === needle) return { rowNumber: i + 2, index: i, values: values[i] }; }
  return null;
}
function userRowToObject(row) { return { id: row[0] || "", username: row[1] || "", email: row[2] || "", passwordHash: row[3] || "", name: row[4] || "", role: row[5] || "MEMBER", jurisdictionName: row[6] || "", jurisdictionId: row[7] || "", avatarUrl: row[8] || "", memberId: row[9] || "", createdAt: row[10] || "", status: row[11] || "ACTIVE" }; }
function upsertUserRecord(user) {
  var sheet = getOrInitUsersSheet(getSpreadsheet());
  user = user || {};
  if (!user.id || !user.username || !user.email) throw new Error("ID User, username, dan email wajib diisi.");

  var incomingHash = String(user.passwordHash || "").trim();
  if (!incomingHash) throw new Error("Password Hash wajib diisi. Akun tidak boleh dibuat tanpa password.");

  var username = String(user.username).trim().toLowerCase();
  var email = String(user.email).trim().toLowerCase();
  var memberId = String(user.memberId || "").trim();

  var found = findUserRowByMemberId_(sheet, memberId) ||
              findUserRowByUserId_(sheet, user.id) ||
              findUserRow(sheet, username) ||
              findUserRow(sheet, email);

  var rowNumber = found ? found.rowNumber : Math.max(sheet.getLastRow() + 1, 2);
  var old = found ? sheet.getRange(rowNumber, 1, 1, USER_HEADERS.length).getValues()[0] : null;
  var row = [
    user.id || (old ? old[0] : ""),
    username || (old ? old[1] : ""),
    email || (old ? old[2] : ""),
    incomingHash,
    user.name !== undefined ? user.name : (old ? old[4] : ""),
    user.role !== undefined ? user.role : (old ? old[5] : "MEMBER"),
    user.jurisdictionName !== undefined ? user.jurisdictionName : (old ? old[6] : ""),
    user.jurisdictionId !== undefined ? user.jurisdictionId : (old ? old[7] : ""),
    user.avatarUrl !== undefined ? user.avatarUrl : (old ? old[8] : ""),
    memberId || (old ? old[9] : ""),
    user.createdAt || (old ? old[10] : new Date().toISOString()),
    user.status || (old ? old[11] : "ACTIVE")
  ];

  sheet.getRange(rowNumber, 1, 1, USER_HEADERS.length).setValues([row]);
  SpreadsheetApp.flush();

  var saved = sheet.getRange(rowNumber, 1, 1, USER_HEADERS.length).getValues()[0];
  if (String(saved[0] || "") !== String(row[0])) throw new Error("Verifikasi penyimpanan akun gagal.");
  if (String(saved[3] || "") !== incomingHash) throw new Error("Verifikasi Password Hash gagal.");

  // Satu akun = satu baris Users. Hapus record lama yang identitasnya sama.
  var last = sheet.getLastRow();
  var duplicateRows = [];
  if (last > 1) {
    var all = sheet.getRange(2, 1, last - 1, USER_HEADERS.length).getValues();
    for (var i = 0; i < all.length; i++) {
      var rn = i + 2;
      if (rn === rowNumber) continue;
      var same =
        (memberId && String(all[i][9] || "").trim() === memberId) ||
        String(all[i][0] || "").trim() === String(row[0] || "").trim() ||
        String(all[i][1] || "").trim().toLowerCase() === username ||
        String(all[i][2] || "").trim().toLowerCase() === email;
      if (same) duplicateRows.push(rn);
    }
  }
  for (var d = duplicateRows.length - 1; d >= 0; d--) sheet.deleteRow(duplicateRows[d]);

  var canonical = findUserRowByMemberId_(sheet, memberId) ||
                  findUserRowByUserId_(sheet, row[0]) ||
                  findUserRow(sheet, username) ||
                  findUserRow(sheet, email);
  if (!canonical) throw new Error("Verifikasi akhir Users gagal: akun tidak ditemukan.");

  var finalSaved = sheet.getRange(canonical.rowNumber, 1, 1, USER_HEADERS.length).getValues()[0];
  if (String(finalSaved[3] || "") !== incomingHash) throw new Error("Verifikasi akhir Password Hash gagal.");

  return {
    success: true,
    status: "success",
    found: !!found,
    row: canonical.rowNumber,
    duplicateRemoved: duplicateRows.length,
    user: userRowToObject(finalSaved),
    message: found ? "Akun berhasil diperbarui" : "Akun berhasil disimpan"
  };
}

function findUserRowByMemberId_(sheet, memberId) {
  var needle = String(memberId || "").trim();
  if (!needle || sheet.getLastRow() <= 1) return null;
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, USER_HEADERS.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][9] || "").trim() === needle) return { rowNumber: i + 2, index: i, values: values[i] };
  }
  return null;
}

function findUserRowByUserId_(sheet, userId) {
  var needle = String(userId || "").trim();
  if (!needle || sheet.getLastRow() <= 1) return null;
  var values = sheet.getRange(2, 1, sheet.getLastRow() - 1, USER_HEADERS.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0] || "").trim() === needle) return { rowNumber: i + 2, index: i, values: values[i] };
  }
  return null;
}

function syncUserFromMember_(member) {
  member = member || {};
  var memberId = String(firstNonEmpty_(member, ["id", "memberId", "idAnggota"], "")).trim();
  if (!memberId) return { success: true, skipped: true, found: false, message: "Member ID kosong." };

  var usersSheet = getOrInitUsersSheet(getSpreadsheet());
  var found = findUserRowByMemberId_(usersSheet, memberId);
  if (!found) return { success: true, skipped: true, found: false, memberId: memberId, message: "Akun Users belum ada." };

  var old = usersSheet.getRange(found.rowNumber, 1, 1, USER_HEADERS.length).getValues()[0];
  var updated = old.slice();
  updated[2] = String(firstNonEmpty_(member, ["email", "emailAddress"], old[2]) || "").trim().toLowerCase();
  updated[4] = firstNonEmpty_(member, ["fullName", "namaLengkap", "name", "nama"], old[4]);
  updated[8] = firstNonEmpty_(member, ["avatarUrl", "photoUrl", "fotoUrl", "foto", "profilePhoto"], old[8]);
  updated[9] = memberId;

  var memberStatus = String(firstNonEmpty_(member, ["status", "verificationStatus", "statusVerifikasi"], old[11] || "ACTIVE")).trim().toUpperCase();
  updated[11] = memberStatus === "SUSPENDED" ? "SUSPENDED" : memberStatus;

  // Kolom 4 (Password Hash) sengaja TIDAK disentuh.
  usersSheet.getRange(found.rowNumber, 1, 1, USER_HEADERS.length).setValues([updated]);
  SpreadsheetApp.flush();

  var saved = usersSheet.getRange(found.rowNumber, 1, 1, USER_HEADERS.length).getValues()[0];
  if (String(saved[9] || "").trim() !== memberId) throw new Error("Sinkronisasi Users gagal: Member ID tidak sesuai.");
  if (String(saved[3] || "") !== String(old[3] || "")) throw new Error("Sinkronisasi Users gagal: Password Hash berubah secara tidak sah.");

  return { success: true, skipped: false, found: true, row: found.rowNumber, memberId: memberId, user: userRowToObject(saved), message: "Users berhasil disinkronkan dengan Anggota." };
}

var MEMBER_HEADERS = [
  "ID Anggota",
  "Nomor KTA",
  "Nama Lengkap",
  "Email",
  "Nomor WhatsApp",
  "Kwarda / Provinsi",
  "Kwarcab / Kabupaten",
  "Kwarran / Kecamatan",
  "Gugus Depan / Pangkalan",
  "Krida",
  "Status Verifikasi",
  "Foto URL",
  "Tanggal Daftar",
  "Link Verifikasi Cepat"
];


/* ============================================================
 * RESPONSE JSON
 * ============================================================ */

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}


/* ============================================================
 * INISIALISASI SHEET
 * ============================================================ */

function getOrInitSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_MEMBER);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_MEMBER);
  }

  ensureHeaders(sheet);

  return sheet;
}


/* ============================================================
 * MEMASTIKAN HEADER
 * ============================================================ */

function ensureHeaders(sheet) {

  var requiredColumns = MEMBER_HEADERS.length;

  if (sheet.getMaxColumns() < requiredColumns) {
    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      requiredColumns - sheet.getMaxColumns()
    );
  }

  var currentHeaders = sheet
    .getRange(1, 1, 1, requiredColumns)
    .getValues()[0];

  var needsUpdate = false;

  for (var i = 0; i < requiredColumns; i++) {

    if (
      String(currentHeaders[i] || "").trim() !==
      MEMBER_HEADERS[i]
    ) {
      needsUpdate = true;
      break;
    }

  }

  if (needsUpdate) {

    sheet
      .getRange(1, 1, 1, requiredColumns)
      .setValues([MEMBER_HEADERS]);

    sheet
      .getRange(1, 1, 1, requiredColumns)
      .setFontWeight("bold");

  }

}


/* ============================================================
 * HELPER DATA ANGGOTA
 *
 * Menormalkan nama properti dari beberapa versi frontend dan
 * memastikan Base64 foto tidak pernah ditulis langsung ke Sheet.
 * ============================================================ */
function firstNonEmpty_(obj, keys, fallback) {
  obj = obj || {};
  for (var i = 0; i < keys.length; i++) {
    var value = obj[keys[i]];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return fallback === undefined ? "" : fallback;
}

function sanitizeSheetValue_(value, fieldName) {
  if (value === undefined || value === null) return "";
  var text = String(value);
  // Google Sheets: maksimum 50.000 karakter per sel.
  if (text.length > 50000) {
    throw new Error("Data pada kolom " + fieldName + " melebihi batas 50.000 karakter.");
  }
  return value;
}

function uploadMemberAvatarIfBase64_(avatarValue, filenameHint) {
  var value = String(avatarValue || "").trim();
  if (!value) return "";
  if (!/^data:image\//i.test(value)) return value;

  var match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s);
  if (!match) throw new Error("Format Base64 foto anggota tidak valid.");

  var encoded = match[2] || "";
  if (encoded.length > 12 * 1024 * 1024) {
    throw new Error("Foto anggota terlalu besar untuk diunggah.");
  }

  var bytes = Utilities.base64Decode(encoded);
  var mime = match[1];
  var extension = mime.split("/")[1].toLowerCase().replace("jpeg", "jpg");
  var filename = String(filenameHint || ("member_" + new Date().getTime()))
    .replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!/\.[a-z0-9]+$/i.test(filename)) filename += "." + extension;

  var folder = getDriveFolderForCategory("MEMBER_AVATAR");
  var file = folder.createFile(Utilities.newBlob(bytes, mime, filename));
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (sharingError) {
    console.log("Peringatan sharing Drive: " + sharingError);
  }

  return "https://lh3.googleusercontent.com/d/" + file.getId();
}

function memberObjectToRow_(m) {
  m = m || {};
  var memberId = firstNonEmpty_(m, ["id", "memberId", "idAnggota"]);
  var kta = firstNonEmpty_(m, ["nationalMemberNumber", "ktaNumber", "nomorKTA", "kta", "nationalMemberNo"]);
  var name = firstNonEmpty_(m, ["fullName", "namaLengkap", "name", "nama"]);
  var email = firstNonEmpty_(m, ["email", "emailAddress"]);
  var phone = firstNonEmpty_(m, ["phone", "noHp", "nomorWhatsApp", "whatsapp", "phoneNumber"]);
  var province = firstNonEmpty_(m, ["provinceName", "province", "kwarda", "kwardaName"]);
  var regency = firstNonEmpty_(m, ["regencyName", "regency", "kwarcab", "kwarcabName"]);
  var district = firstNonEmpty_(m, ["districtName", "district", "branchName", "kwarran", "kwarranName"]);
  var gudep = firstNonEmpty_(m, ["gugusDepan", "gugusDepanName", "pangkalan", "gudep"]);
  var krida = firstNonEmpty_(m, ["krida", "kridaName"]);
  var status = firstNonEmpty_(m, ["status", "verificationStatus", "statusVerifikasi"], "PENDING");
  var avatar = firstNonEmpty_(m, ["avatarUrl", "photoUrl", "fotoUrl", "foto", "profilePhoto"]);
  var registeredAt = firstNonEmpty_(m, ["registeredAt", "tanggalDaftar", "createdAt"], new Date().toISOString());
  var verificationLink = firstNonEmpty_(m, ["verificationLink", "linkVerifikasi", "quickVerificationLink"]);

  // Jika frontend masih mengirim Base64, unggah otomatis ke Drive terlebih dahulu.
  avatar = uploadMemberAvatarIfBase64_(avatar, "member_" + String(memberId || new Date().getTime()));

  return [
    memberId, kta, name, email, phone, province, regency, district,
    gudep, krida, status, avatar, registeredAt, verificationLink
  ];
}

function deleteDriveFileByUrl_(url) {
  var value = String(url || "").trim();
  if (!value || /^data:image\//i.test(value)) return { found: false, deleted: false };

  var match = value.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]{10,})/);
  if (!match) return { found: false, deleted: false };

  try {
    var file = DriveApp.getFileById(match[1]);
    file.setTrashed(true);
    return { found: true, deleted: true, fileId: match[1] };
  } catch (err) {
    console.log("File Drive tidak dapat dihapus: " + err);
    return { found: true, deleted: false, fileId: match[1], message: String(err) };
  }
}

function deleteMemberRow_(sheet, memberId, memberKta, deleteDriveFile) {
  var found = findMemberRow(sheet, memberId, memberKta);
  if (!found) {
    return { success: false, status: "error", found: false, message: "Anggota tidak ditemukan" };
  }

  var oldRow = sheet.getRange(found.rowNumber, 1, 1, MEMBER_HEADERS.length).getValues()[0];
  var driveResult = { found: false, deleted: false };

  if (deleteDriveFile !== false) {
    driveResult = deleteDriveFileByUrl_(oldRow[11]);
  }

  sheet.deleteRow(found.rowNumber);
  SpreadsheetApp.flush();

  // Verifikasi bahwa baris dengan ID/KTA tersebut benar-benar sudah tidak ada.
  var stillExists = findMemberRow(sheet, memberId, memberKta);
  if (stillExists) {
    return { success: false, status: "error", found: true, deleted: false, message: "Baris anggota gagal dihapus dari Spreadsheet" };
  }

  return {
    success: true,
    status: "success",
    found: true,
    deleted: true,
    row: found.rowNumber,
    memberId: String(memberId || ""),
    drive: driveResult,
    message: "Data anggota berhasil dihapus dari Spreadsheet"
  };
}

/* ============================================================
 * NORMALISASI DATA
 * ============================================================ */

function normalizeMemberRow(row) {

  var result = [];

  for (var i = 0; i < MEMBER_HEADERS.length; i++) {

    if (
      row &&
      row[i] !== undefined &&
      row[i] !== null
    ) {
      result.push(row[i]);
    } else {
      result.push("");
    }

  }

  return result;
}


/* ============================================================
 * MENCARI ANGGOTA
 *
 * Berdasarkan:
 * - ID Anggota
 * - Nomor KTA
 * ============================================================ */

function findMemberRow(sheet, memberId, memberKta, memberEmail) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return null;
  var values = sheet.getRange(2, 1, lastRow - 1, MEMBER_HEADERS.length).getValues();
  var id = String(memberId || "").trim();
  var kta = String(memberKta || "").trim();
  var email = String(memberEmail || "").trim().toLowerCase();

  // Identitas utama: Member ID -> Nomor KTA -> Email.
  for (var i = 0; i < values.length; i++) {
    if (id && String(values[i][0] || "").trim() === id) return { rowNumber: i + 2, index: i };
  }
  for (var j = 0; j < values.length; j++) {
    if (kta && String(values[j][1] || "").trim() === kta) return { rowNumber: j + 2, index: j };
  }
  for (var k = 0; k < values.length; k++) {
    if (email && String(values[k][3] || "").trim().toLowerCase() === email) return { rowNumber: k + 2, index: k };
  }
  return null;
}

function removeDuplicateMemberRows_(sheet, keepRowNumber, memberId, kta, email) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 0;
  var values = sheet.getRange(2, 1, lastRow - 1, MEMBER_HEADERS.length).getValues();
  var id = String(memberId || "").trim();
  var k = String(kta || "").trim();
  var em = String(email || "").trim().toLowerCase();
  var deleteRows = [];

  for (var i = 0; i < values.length; i++) {
    var rowNumber = i + 2;
    if (rowNumber === keepRowNumber) continue;
    var rowId = String(values[i][0] || "").trim();
    var rowKta = String(values[i][1] || "").trim();
    var rowEmail = String(values[i][3] || "").trim().toLowerCase();
    if ((em && rowEmail === em) || (k && rowKta === k) || (id && rowId === id)) {
      deleteRows.push(rowNumber);
    }
  }

  for (var d = deleteRows.length - 1; d >= 0; d--) sheet.deleteRow(deleteRows[d]);
  return deleteRows.length;
}

/* ============================================================
 * GET
 *
 * Digunakan oleh Web App untuk membaca anggota.
 *
 * Contoh:
 * ?action=CHECK_RECORD&id=ABC123
 *
 * atau:
 * ?action=CHECK_RECORD&secondaryId=KTA123
 * ============================================================ */

function doGet(e) {

  try {

    var params =
      e && e.parameter
        ? e.parameter
        : {};

    var action =
      String(params.action || "").trim().toUpperCase();

    /* --------------------------------------------------------
     * PING / STATUS API
     * Tidak membaca seluruh Spreadsheet.
     * -------------------------------------------------------- */

    if (action === "PING" || action === "STATUS") {

      var pingSs = getSpreadsheet();

      return jsonResponse({
        success: true,
        status: "success",
        action: "PING",
        spreadsheet: pingSs.getName(),
        message: "Google Apps Script aktif"
      });

    }


    /* --------------------------------------------------------
     * SETUP DRIVE FOLDERS
     *
     * Dipanggil oleh tombol "Inisialisasi Folder di Google Drive"
     * pada Dashboard.
     * -------------------------------------------------------- */

    if (action === "SETUP_DRIVE_FOLDERS") {

      return jsonResponse(
        inisialisasiFolderGoogleDrive()
      );

    }


    var ss =
      getSpreadsheet();

    var sheetName =
      SHEET_MEMBER;

    if (params.sheet) {
      sheetName =
        String(params.sheet).trim();
    }

    var sheet =
      ss.getSheetByName(sheetName);

    if (!sheet) {

      return jsonResponse({
        success: true,
        found: false,
        data: [],
        message: "Sheet belum ada"
      });

    }


    /* --------------------------------------------------------
     * CHECK RECORD
     * -------------------------------------------------------- */

    if (action === "CHECK_RECORD") {

      var checkId =
        String(params.id || "").trim();

      var checkSecondaryId =
        String(params.secondaryId || "").trim();

      var lastRow =
        sheet.getLastRow();

      if (lastRow <= 1) {

        return jsonResponse({
          success: true,
          found: false,
          message: "Belum ada data anggota"
        });

      }

      var values =
        sheet
          .getRange(
            2,
            1,
            lastRow - 1,
            MEMBER_HEADERS.length
          )
          .getValues();

      for (
        var r = 0;
        r < values.length;
        r++
      ) {

        var rowId =
          String(values[r][0] || "").trim();

        var rowKta =
          String(values[r][1] || "").trim();

        if (
          (checkId && rowId === checkId) ||
          (checkSecondaryId && rowKta === checkSecondaryId)
        ) {

          return jsonResponse({
            success: true,
            found: true,
            row: r + 2,
            status:
              values[r][10] || "PENDING",
            message: "Record ditemukan"
          });

        }

      }

      return jsonResponse({
        success: true,
        found: false,
        message: "Record belum tercatat"
      });

    }


    /* --------------------------------------------------------
     * DEFAULT GET
     *
     * Untuk kompatibilitas dengan aplikasi yang membaca data
     * menggunakan ?sheet=Anggota.
     *
     * Jika URL dibuka langsung tanpa action dan tanpa sheet,
     * JANGAN keluarkan seluruh database ke browser.
     * -------------------------------------------------------- */

    if (!params.sheet) {

      return jsonResponse({
        success: true,
        status: "success",
        action: "PING",
        message: "Google Apps Script aktif. Gunakan action atau parameter sheet."
      });

    }

    var lastRowDefault =
      sheet.getLastRow();

    if (lastRowDefault <= 1) {
      return jsonResponse([]);
    }

    var data =
      sheet
        .getRange(
          1,
          1,
          lastRowDefault,
          MEMBER_HEADERS.length
        )
        .getValues();

    var result = [];

    for (
      var i = 1;
      i < data.length;
      i++
    ) {

      var row =
        data[i];

      var hasIdentity =
        String(row[0] || "").trim() ||
        String(row[1] || "").trim() ||
        String(row[2] || "").trim();

      if (!hasIdentity) {
        continue;
      }

      var item = {};

      for (
        var h = 0;
        h < MEMBER_HEADERS.length;
        h++
      ) {

        item[MEMBER_HEADERS[h]] =
          row[h] !== undefined
            ? row[h]
            : "";

      }

      result.push(item);

    }

    return jsonResponse(result);


  } catch (err) {

    return jsonResponse({
      success: false,
      status: "error",
      message:
        err && err.message
          ? err.message
          : String(err)
    });

  }

}

/* ============================================================
 * POST
 *
 * Semua transaksi dari aplikasi web masuk melalui sini.
 * ============================================================ */

function doPost(e) {

  var lock =
    LockService.getScriptLock();


  try {

    lock.waitLock(30000);


    /* --------------------------------------------------------
     * VALIDASI PAYLOAD
     * -------------------------------------------------------- */

    if (
      !e ||
      !e.postData ||
      !e.postData.contents
    ) {

      return jsonResponse({
        success: false,
        status: "error",
        message: "Payload kosong"
      });

    }


    /* --------------------------------------------------------
     * PARSE JSON
     * -------------------------------------------------------- */

    var body = null;


    try {

      body =
        JSON.parse(
          e.postData.contents
        );

    } catch (parseError) {

      body =
        e.parameter || {};

    }


    if (!body) {

      return jsonResponse({
        success: false,
        status: "error",
        message: "Payload tidak valid"
      });

    }


    /* --------------------------------------------------------
     * SPREADSHEET
     * -------------------------------------------------------- */

    var ss =
      getSpreadsheet();

    var sheet =
      getOrInitSheet(ss);


    /* ========================================================
     * AUTHENTICATION STORAGE
     * Password hanya disimpan sebagai hash.
     * ======================================================== */
    if (body.action === "UPSERT_USER") {
      return jsonResponse(upsertUserRecord(body.user || {}));
    }

    if (body.action === "AUTH_GET_USER") {
      var usersSheet = getOrInitUsersSheet(ss);
      var userFound = findUserRow(usersSheet, body.identifier || "");
      if (!userFound) return jsonResponse({ success: true, status: "success", found: false, message: "Akun tidak ditemukan" });
      return jsonResponse({ success: true, status: "success", found: true, row: userFound.rowNumber, user: userRowToObject(userFound.values), message: "Akun ditemukan" });
    }

    /* ========================================================
     * ACTION 1
     *
     * UPDATE_AUTH_STATUS
     *
     * Mengubah:
     * ACTIVE
     * PENDING
     * SUSPENDED
     * ======================================================== */

    if (
      body.action ===
      "UPDATE_AUTH_STATUS"
    ) {

      var authMemberId =
        String(
          body.memberId || ""
        ).trim();


      var authStatus =
        String(
          body.status || "PENDING"
        )
        .trim()
        .toUpperCase();


      var allowedStatuses = [
        "ACTIVE",
        "PENDING",
        "SUSPENDED"
      ];


      if (
        allowedStatuses.indexOf(
          authStatus
        ) === -1
      ) {

        return jsonResponse({
          success: false,
          status: "error",
          message:
            "Status tidak valid: " +
            authStatus
        });

      }


      if (!authMemberId) {

        return jsonResponse({
          success: false,
          status: "error",
          message:
            "memberId wajib diisi"
        });

      }


      var authFound =
        findMemberRow(
          sheet,
          authMemberId,
          ""
        );


      if (!authFound) {

        return jsonResponse({
          success: false,
          status: "error",
          message:
            "Anggota dengan ID " +
            authMemberId +
            " tidak ditemukan"
        });

      }


      /* Kolom K = 11 */

      sheet
        .getRange(
          authFound.rowNumber,
          11
        )
        .setValue(authStatus);


      SpreadsheetApp.flush();


      var savedStatus =
        String(
          sheet
            .getRange(
              authFound.rowNumber,
              11
            )
            .getValue() || ""
        )
        .trim()
        .toUpperCase();


      if (
        savedStatus !==
        authStatus
      ) {

        return jsonResponse({
          success: false,
          status: "error",
          message:
            "Status gagal disimpan"
        });

      }


      return jsonResponse({
        success: true,
        status: "success",
        action:
          "UPDATE_AUTH_STATUS",
        memberId:
          authMemberId,
        newStatus:
          savedStatus,
        row:
          authFound.rowNumber,
        message:
          "Status anggota berhasil diperbarui"
      });

    }


    /* ========================================================
     * ACTION 1.5
     *
     * UPLOAD_IMAGE
     *
     * Menerima data:image/* Base64 hanya untuk dibuat menjadi file
     * Google Drive. Base64 TIDAK pernah ditulis ke Spreadsheet.
     * ======================================================== */

    if (body.action === "UPLOAD_IMAGE" || body.action === "UPLOAD_DRIVE_IMAGE") {

      var imageBase64 = String(body.base64 || "").trim();
      var imageFilename = String(body.filename || ("image_" + new Date().getTime() + ".jpg")).trim();
      var imageCategory = String(body.category || "MEMBER_AVATAR").trim().toUpperCase();

      if (!/^data:image\/(?:png|jpe?g|webp|gif);base64,/i.test(imageBase64)) {
        return jsonResponse({
          success: false,
          status: "error",
          message: "Data gambar tidak valid."
        });
      }

      var MAX_IMAGE_BASE64 = 12 * 1024 * 1024;
      if (imageBase64.length > MAX_IMAGE_BASE64) {
        return jsonResponse({
          success: false,
          status: "error",
          message: "Data gambar terlalu besar."
        });
      }

      var imageMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s);
      if (!imageMatch) {
        return jsonResponse({
          success: false,
          status: "error",
          message: "Format Base64 gambar tidak valid."
        });
      }

      var mimeType = imageMatch[1];
      var bytes = Utilities.base64Decode(imageMatch[2]);
      var blob = Utilities.newBlob(bytes, mimeType, imageFilename);

      // Simpan foto ke subfolder sesuai kategori.
      // Jika subfolder belum ada, sistem membuatnya otomatis.
      var folder = getDriveFolderForCategory(imageCategory);
      var file = folder.createFile(blob);

      file.setName(imageFilename);

      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (sharingError) {
        console.log("Peringatan sharing Drive: " + sharingError);
      }

      var fileId = file.getId();
      var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
      var viewUrl = "https://drive.google.com/file/d/" + fileId + "/view";

      return jsonResponse({
        success: true,
        status: "success",
        action: body.action,
        fileId: fileId,
        url: directUrl,
        directUrl: directUrl,
        viewUrl: viewUrl,
        category: imageCategory,
        filename: imageFilename,
        folderId: folder.getId(),
        folderUrl: "https://drive.google.com/drive/folders/" + folder.getId(),
        message: "Foto berhasil disimpan ke Google Drive"
      });
    }


    /* ========================================================
     * ACTION 1.6
     *
     * CHECK_DRIVE_FILE
     *
     * Memverifikasi file foto berdasarkan nama file dan kategori.
     * Dipakai oleh frontend lama/kompatibel untuk memastikan
     * upload Drive benar-benar selesai sebelum data anggota
     * disimpan.
     * ======================================================== */

    if (body.action === "CHECK_DRIVE_FILE") {

      var checkFilename = String(body.filename || "").trim();

      if (!checkFilename) {
        return jsonResponse({
          success: false,
          status: "error",
          found: false,
          message: "filename wajib diisi"
        });
      }

      var checkFolderId = "16Ql42x6HBWJIB8ss7abnurS_Kne5HYvh";
      var checkFolder = DriveApp.getFolderById(checkFolderId);
      var files = checkFolder.getFilesByName(checkFilename);

      if (!files.hasNext()) {
        return jsonResponse({
          success: true,
          status: "success",
          found: false,
          filename: checkFilename,
          message: "File belum ditemukan di Google Drive"
        });
      }

      var driveFile = files.next();
      var driveFileId = driveFile.getId();
      var driveDirectUrl =
        "https://lh3.googleusercontent.com/d/" + driveFileId;
      var driveViewUrl =
        "https://drive.google.com/file/d/" + driveFileId + "/view";

      return jsonResponse({
        success: true,
        status: "success",
        found: true,
        fileId: driveFileId,
        filename: driveFile.getName(),
        directUrl: driveDirectUrl,
        url: driveDirectUrl,
        viewUrl: driveViewUrl,
        message: "File Drive berhasil diverifikasi"
      });
    }


    /* ========================================================
     * ACTION 2
     *
     * UPSERT_MEMBER
     * ======================================================== */

    if (
      body.action ===
      "UPSERT_MEMBER"
    ) {

      var row =
        body.rowData || null;


      /* ------------------------------------------------------
       * Jika data dikirim sebagai object member
       * ------------------------------------------------------ */

      if (
        !row &&
        body.member
      ) {

        var m =
          body.member;


        row = memberObjectToRow_(m);

      }


      if (
        !row ||
        !Array.isArray(row)
      ) {

        return jsonResponse({
          success: false,
          status: "error",
          message:
            "rowData atau member wajib diisi"
        });

      }


      row =
        normalizeMemberRow(row);

      // Jangan pernah menulis Base64 mentah ke Google Sheets.
      if (/^data:image\//i.test(String(row[11] || "").trim())) {
        row[11] = uploadMemberAvatarIfBase64_(row[11], "member_" + String(row[0] || new Date().getTime()));
      }

      for (var safeIndex = 0; safeIndex < row.length; safeIndex++) {
        row[safeIndex] = sanitizeSheetValue_(row[safeIndex], MEMBER_HEADERS[safeIndex]);
      }


      var rowId =
        String(
          body.memberId ||
          row[0] ||
          ""
        ).trim();


      var rowKta =
        String(
          row[1] || ""
        ).trim();


      if (!rowId) {

        return jsonResponse({
          success: false,
          status: "error",
          message:
            "ID Anggota wajib diisi"
        });

      }


      var found =
        findMemberRow(
          sheet,
          rowId,
          rowKta,
          row[3]
        );


      var targetRow = 0;


      /* ------------------------------------------------------
       * UPDATE DATA LAMA
       * ------------------------------------------------------ */

      if (found) {

        targetRow =
          found.rowNumber;


        var oldRow =
          sheet
            .getRange(
              targetRow,
              1,
              1,
              MEMBER_HEADERS.length
            )
            .getValues()[0];


        var mergedRow = [];


        for (
          var c = 0;
          c < MEMBER_HEADERS.length;
          c++
        ) {

          var incoming =
            row[c];

          var oldValue =
            oldRow[c];


          /* ID tidak boleh hilang */

          if (c === 0) {
            // ID transaksi menjadi ID kanonik. Record legacy seperti
            // sheet-member-1 dikonversi ke SPW-XXXXXX.
            mergedRow.push(incoming || oldValue || rowId);
            continue;
          }


          /* Data kosong tidak menimpa data lama */

          if (
            incoming === "" ||
            incoming === null ||
            incoming === undefined
          ) {

            mergedRow.push(
              oldValue
            );

          } else {

            mergedRow.push(
              incoming
            );

          }

        }


        sheet
          .getRange(
            targetRow,
            1,
            1,
            MEMBER_HEADERS.length
          )
          .setValues([
            mergedRow
          ]);


      } else {


        /* ----------------------------------------------------
         * TAMBAH ANGGOTA BARU
         * ---------------------------------------------------- */

        targetRow =
          sheet.getLastRow() + 1;


        if (targetRow < 2) {
          targetRow = 2;
        }


        sheet
          .getRange(
            targetRow,
            1,
            1,
            MEMBER_HEADERS.length
          )
          .setValues([
            row
          ]);

      }


      SpreadsheetApp.flush();


      /* ------------------------------------------------------
       * VERIFIKASI DATA
       * ------------------------------------------------------ */

      var savedRow =
        sheet
          .getRange(
            targetRow,
            1,
            1,
            MEMBER_HEADERS.length
          )
          .getValues()[0];


      var savedId =
        String(
          savedRow[0] || ""
        ).trim();


      var savedMemberStatus =
        String(
          savedRow[10] || ""
        ).trim();


      if (
        savedId !== rowId
      ) {

        return jsonResponse({
          success: false,
          status: "error",
          message:
            "Verifikasi penyimpanan gagal"
        });

      }

      // Bersihkan record Anggota duplikat berdasarkan ID/KTA/email.
      var duplicateCount = removeDuplicateMemberRows_(
        sheet,
        targetRow,
        savedRow[0],
        savedRow[1],
        savedRow[3]
      );

      // Penghapusan baris di atas target dapat menggeser nomor baris.
      // Cari ulang record kanonik berdasarkan ID.
      var canonicalMember = findMemberRow(sheet, savedRow[0], savedRow[1], savedRow[3]);
      if (canonicalMember) targetRow = canonicalMember.rowNumber;
      savedRow = sheet.getRange(targetRow, 1, 1, MEMBER_HEADERS.length).getValues()[0];

      // Setelah Anggota berhasil disimpan, sinkronkan profil akun Users
      // berdasarkan Member ID. Password Hash tetap dipertahankan.
      var syncMemberObject = {
        id: savedRow[0],
        nationalMemberNumber: savedRow[1],
        fullName: savedRow[2],
        email: savedRow[3],
        phone: savedRow[4],
        provinceName: savedRow[5],
        regencyName: savedRow[6],
        districtName: savedRow[7],
        gugusDepan: savedRow[8],
        krida: savedRow[9],
        status: savedRow[10],
        avatarUrl: savedRow[11],
        registeredAt: savedRow[12],
        verificationLink: savedRow[13]
      };

      var userSync = syncUserFromMember_(syncMemberObject);

      return jsonResponse({
        success: true,
        status: "success",
        action:
          "UPSERT_MEMBER",
        memberId:
          savedId,
        statusVerifikasi:
          savedMemberStatus,
        row:
          targetRow,
        userSync: userSync,
        duplicateRemoved: duplicateCount,
        message:
          found
            ? "Data anggota berhasil diperbarui"
            : "Data anggota berhasil ditambahkan"
      });

    }


    /* ========================================================
     * ACTION 3
     *
     * DELETE MEMBER / REMOVE MEMBER / DELETE_ROW
     * Menghapus baris anggota dari Spreadsheet dan, bila ada,
     * memindahkan file foto terkait ke Trash Google Drive.
     * ======================================================== */

    if (
      body.action === "DELETE" ||
      body.action === "DELETE_MEMBER" ||
      body.action === "REMOVE_MEMBER" ||
      body.action === "DELETE_ROW"
    ) {
      var deleteSheetName = String(body.sheet || SHEET_MEMBER).trim();

      // Fokus utama DELETE_ROW dari aplikasi adalah sheet Anggota.
      if (deleteSheetName === SHEET_MEMBER || deleteSheetName === "Anggota") {
        var deleteMemberId = String(
          body.memberId || body.id || (body.payload && (body.payload.memberId || body.payload.id)) || ""
        ).trim();
        var deleteMemberKta = String(
          body.kta || body.secondaryId || body.nationalMemberNumber ||
          (body.payload && (body.payload.kta || body.payload.nationalMemberNumber)) || ""
        ).trim();

        if (!deleteMemberId && !deleteMemberKta) {
          return jsonResponse({ success: false, status: "error", message: "memberId atau nomor KTA wajib diisi untuk DELETE" });
        }

        return jsonResponse(deleteMemberRow_(sheet, deleteMemberId, deleteMemberKta, body.deleteDriveFile !== false));
      }

      return jsonResponse({
        success: false,
        status: "error",
        message: "DELETE untuk sheet " + deleteSheetName + " belum didukung oleh Code.gs"
      });
    }


    /* ========================================================
     * ACTION 4
     *
     * SYNC_ALL_DATA
     *
     * Menerima seluruh data anggota dari aplikasi web.
     * Setiap anggota diproses sebagai UPSERT berdasarkan ID/KTA.
     * ======================================================== */

    if (body.action === "SYNC_ALL_DATA") {

      var syncData = body.data || {};
      var syncMembers = syncData.members || [];

      if (!Array.isArray(syncMembers)) {
        return jsonResponse({
          success: false,
          status: "error",
          message: "data.members harus berupa array"
        });
      }

      var inserted = 0;
      var updated = 0;
      var skipped = 0;

      for (var sm = 0; sm < syncMembers.length; sm++) {
        var syncRow = syncMembers[sm];

        if (!Array.isArray(syncRow)) {
          skipped++;
          continue;
        }

        syncRow = normalizeMemberRow(syncRow);

        var syncId = String(syncRow[0] || "").trim();
        var syncKta = String(syncRow[1] || "").trim();

        if (!syncId) {
          skipped++;
          continue;
        }

        var syncFound = findMemberRow(sheet, syncId, syncKta);

        if (syncFound) {
          var syncOldRow = sheet
            .getRange(syncFound.rowNumber, 1, 1, MEMBER_HEADERS.length)
            .getValues()[0];

          var syncMergedRow = [];

          for (var sc = 0; sc < MEMBER_HEADERS.length; sc++) {
            var incomingValue = syncRow[sc];
            var oldValue = syncOldRow[sc];

            if (incomingValue === "" || incomingValue === null || incomingValue === undefined) {
              syncMergedRow.push(oldValue);
            } else {
              syncMergedRow.push(incomingValue);
            }
          }

          syncMergedRow[0] = syncOldRow[0] || syncId;

          sheet
            .getRange(syncFound.rowNumber, 1, 1, MEMBER_HEADERS.length)
            .setValues([syncMergedRow]);

          updated++;
        } else {
          var newSyncRow = Math.max(sheet.getLastRow() + 1, 2);
          sheet
            .getRange(newSyncRow, 1, 1, MEMBER_HEADERS.length)
            .setValues([syncRow]);

          inserted++;
        }
      }

      SpreadsheetApp.flush();

      return jsonResponse({
        success: true,
        status: "success",
        action: "SYNC_ALL_DATA",
        inserted: inserted,
        updated: updated,
        skipped: skipped,
        total: syncMembers.length,
        message: "Sinkronisasi seluruh data anggota berhasil"
      });
    }


    /* ========================================================
     * ACTION 4
     *
     * VALIDATE_MEMBER
     *
     * Kompatibilitas sistem lama.
     * ======================================================== */

    if (
      body.action ===
      "VALIDATE_MEMBER"
    ) {

      var targetId =
        String(
          body.memberId || ""
        ).trim();


      var newStatus =
        String(
          body.status || "ACTIVE"
        )
        .trim()
        .toUpperCase();


      if (!targetId) {

        return jsonResponse({
          success: false,
          status: "error",
          message:
            "memberId wajib diisi"
        });

      }


      var validateFound =
        findMemberRow(
          sheet,
          targetId,
          ""
        );


      if (!validateFound) {

        return jsonResponse({
          success: false,
          status: "error",
          message:
            "Anggota tidak ditemukan"
        });

      }


      sheet
        .getRange(
          validateFound.rowNumber,
          11
        )
        .setValue(newStatus);


      SpreadsheetApp.flush();


      var validateResult =
        String(
          sheet
            .getRange(
              validateFound.rowNumber,
              11
            )
            .getValue() || ""
        )
        .trim()
        .toUpperCase();


      if (
        validateResult !==
        newStatus
      ) {

        return jsonResponse({
          success: false,
          status: "error",
          message:
            "Status gagal disimpan"
        });

      }


      return jsonResponse({
        success: true,
        status: "success",
        action:
          "VALIDATE_MEMBER",
        memberId:
          targetId,
        newStatus:
          validateResult,
        row:
          validateFound.rowNumber,
        message:
          "Status anggota berhasil diubah"
      });

    }


    /* ========================================================
     * ACTION TIDAK DIKENAL
     * ======================================================== */

    return jsonResponse({
      success: false,
      status: "error",
      action:
        body.action || "",
      message:
        "Action Google Apps Script tidak dikenali: " +
        String(body.action || "")
    });


  } catch (err) {


    console.error(
      "GAS ERROR:",
      err
    );


    return jsonResponse({
      success: false,
      status: "error",
      message:
        err && err.message
          ? err.message
          : String(err)
    });


  } finally {


    try {

      lock.releaseLock();

    } catch (releaseError) {

      /* Tidak melakukan apa-apa */

    }

  }

}


/* ============================================================
 * FUNGSI TEST
 *
 * Gunakan fungsi ini dengan tombol RUN.
 *
 * Fungsi ini TIDAK membutuhkan doPost(e).
 *
 * Tes akan:
 * 1. Membuka Sheet Anggota
 * 2. Memastikan header tersedia
 * 3. Membaca jumlah data anggota
 * 4. Menampilkan hasil di Execution Log
 * ============================================================ */

function testConnection() {

  var ss =
    getSpreadsheet();


  if (!ss) {

    throw new Error(
      "Spreadsheet tidak ditemukan."
    );

  }


  var sheet =
    getOrInitSheet(ss);


  var lastRow =
    sheet.getLastRow();


  console.log(
    "===================================="
  );

  console.log(
    "TEST SISTEM SAKA PARIWISATA"
  );

  console.log(
    "Spreadsheet: " +
    ss.getName()
  );

  console.log(
    "Sheet: " +
    sheet.getName()
  );

  console.log(
    "Jumlah baris: " +
    lastRow
  );

  console.log(
    "Status: KONEKSI BERHASIL"
  );

  console.log(
    "===================================="
  );


  return {
    success: true,
    spreadsheet:
      ss.getName(),
    sheet:
      sheet.getName(),
    rows:
      lastRow
  };

}


/* ============================================================
 * TEST UPDATE STATUS
 *
 * GANTI ID_TEST DENGAN ID ANGGOTA YANG ADA.
 *
 * Contoh:
 * var ID_TEST = "SPW-0001";
 * ============================================================ */

function testUpdateStatus() {

  var ID_TEST = "member-1788799985377";


  if (
    ID_TEST ===
    "GANTI_DENGAN_ID_ANGGOTA"
  ) {

    throw new Error(
      "Silakan isi ID_TEST terlebih dahulu."
    );

  }


  var ss =
    getSpreadsheet();


  var sheet =
    getOrInitSheet(ss);


  var found =
    findMemberRow(
      sheet,
      ID_TEST,
      ""
    );


  if (!found) {

    throw new Error(
      "Anggota dengan ID " +
      ID_TEST +
      " tidak ditemukan."
    );

  }


  sheet
    .getRange(
      found.rowNumber,
      11
    )
    .setValue("ACTIVE");


  SpreadsheetApp.flush();


  var result =
    String(
      sheet
        .getRange(
          found.rowNumber,
          11
        )
        .getValue() || ""
    )
    .trim()
    .toUpperCase();


  console.log(
    "ID Anggota: " +
    ID_TEST
  );

  console.log(
    "Baris: " +
    found.rowNumber
  );

  console.log(
    "Status baru: " +
    result
  );


  return {
    success:
      result === "ACTIVE",
    memberId:
      ID_TEST,
    row:
      found.rowNumber,
    status:
      result
  };

}`;
  }
}

export const spreadsheetService = new SpreadsheetService();

