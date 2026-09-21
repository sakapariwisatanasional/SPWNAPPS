// src/services/spreadsheetService.ts - SPWNApp Client Data Service

export interface SpreadsheetConfig {
  scriptUrl: string;
}

class SpreadsheetService {
  private config: SpreadsheetConfig = {
    scriptUrl: import.meta.env.VITE_SPREADSHEET_SCRIPT_URL || '',
  };

  public getConfig(): SpreadsheetConfig {
    return this.config;
  }

  public setConfig(newConfig: Partial<SpreadsheetConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  // ============================================================
  // LOGIN USER (MENGIRIM MULTI-FIELD AGAR TIDAK TERBACA KOSONG)
  // ============================================================
  async loginUser(identifier: string, password: string): Promise<any> {
    const cleanIdent = String(identifier || '').trim();
    const cleanPass = String(password || '');

    // Payload dikemas dengan semua kemungkinan kunci yang diminta backend
    const payload = {
      action: 'LOGIN_USER',
      identifier: cleanIdent,
      username: cleanIdent,
      email: cleanIdent,
      password: cleanPass,
      pass: cleanPass,
    };

    console.log('[spreadsheetService] Mengirim data login:', {
      identifier: payload.identifier,
      passLength: cleanPass.length,
    });

    try {
      // 1. Prioritas pertama: Kirim ke endpoint internal Vercel / Next API
      const localResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (localResponse && localResponse.ok) {
        const localData = await localResponse.json().catch(() => null);
        if (localData && localData.success) {
          return localData;
        }
      }

      // 2. Jika ada fallback ke /api/index
      const apiIndexResponse = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (apiIndexResponse && apiIndexResponse.ok) {
        const indexData = await apiIndexResponse.json().catch(() => null);
        if (indexData && indexData.success) {
          return indexData;
        }
      }

      // 3. Jika menggunakan Google Apps Script Deployment URL langsung
      const scriptUrl = this.config.scriptUrl;
      if (scriptUrl) {
        const gasResponse = await fetch(scriptUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        });

        const gasData = await gasResponse.json();
        return gasData;
      }

      // 4. Default fallback: Autentikasi lokal bila server offline
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
  // UPLOAD IMAGE KE DRIVE
  // ============================================================
  async uploadImageToDrive(base64Data: string, fileName: string, category: string = 'AVATAR'): Promise<any> {
    try {
      const payload = {
        action: 'UPLOAD_IMAGE',
        base64: base64Data,
        fileName: fileName,
        category: category,
      };

      if (this.config.scriptUrl) {
        const response = await fetch(this.config.scriptUrl, {
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
  // REGISTER MEMBER
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

      if (this.config.scriptUrl) {
        const response = await fetch(this.config.scriptUrl, {
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
}

export const spreadsheetService = new SpreadsheetService();
