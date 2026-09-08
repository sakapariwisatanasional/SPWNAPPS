export interface DriveUploadResponse {
  success: boolean;
  fileId?: string;
  url?: string;
  name?: string;
  error?: string;
}

/**
 * Mengubah URL atau File ID Google Drive menjadi Direct Link gambar
 * yang kompatibel dengan tag <img> HTML (menggunakan endpoint lh3.googleusercontent.com)
 */
export const formatGoogleDriveDirectUrl = (inputUrlOrId?: string): string => {
  if (!inputUrlOrId) return '';
  const trimmed = inputUrlOrId.trim();
  if (!trimmed) return '';

  // Jika sudah merupakan data base64 atau path file statis lokal
  if (trimmed.startsWith('data:image') || trimmed.startsWith('/') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Ekstrak file ID dari berbagai variasi URL Google Drive
  let fileId = trimmed;
  const drivePatterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{25,})/,
    /id=([a-zA-Z0-9_-]{25,})/,
    /\/d\/([a-zA-Z0-9_-]{25,})/,
    /open\?id=([a-zA-Z0-9_-]{25,})/
  ];

  for (const pattern of drivePatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      fileId = match[1];
      break;
    }
  }

  // Jika berupa ID murni (panjang karakter token standar Drive)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(fileId)) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
};

// Alias agar kompatibel dengan file-file lama seperti AuthModal.tsx
export const formatGoogleDriveUrl = formatGoogleDriveDirectUrl;

/**
 * Kompresi gambar File atau Base64 di browser (Canvas API)
 * Mencegah error 413 Payload Too Large pada Vercel/GAS saat upload dari kamera ponsel
 */
export const compressImageClient = async (
  source: File | string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();

    const processImage = () => {
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Gagal menginisialisasi Canvas Context 2D'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    if (typeof source === 'string') {
      img.crossOrigin = 'anonymous';
      img.onload = processImage;
      img.onerror = (err) => reject(err);
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = processImage;
        img.onerror = (err) => reject(err);
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(source);
    }
  });
};

/**
 * Upload gambar profil atau berkas ke Google Drive melalui Google Apps Script Web App Endpoint
 */
export const uploadFileToGoogleDrive = async (
  fileName: string,
  base64Data: string,
  mimeType = 'image/jpeg',
  folderId?: string
): Promise<DriveUploadResponse> => {
  try {
    const scriptUrl =
      (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL ||
      localStorage.getItem('GOOGLE_SCRIPT_URL') ||
      '';

    const cleanBase64 = base64Data.includes('base64,')
      ? base64Data.split('base64,')[1]
      : base64Data;

    const payload = {
      action: 'uploadFile',
      fileName,
      mimeType,
      fileData: cleanBase64,
      folderId: folderId || (import.meta as any).env?.VITE_GDRIVE_FOLDER_ID || ''
    };

    if (scriptUrl) {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === 'success' || result.success) {
        const fileId = result.fileId || result.id;
        const directUrl = fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : result.url;
        return {
          success: true,
          fileId,
          url: directUrl,
          name: fileName
        };
      } else {
        throw new Error(result.message || 'Respons Apps Script menandakan kegagalan');
      }
    }

    // Jika Web App Google Apps Script belum dikonfigurasi, gunakan fallback base64
    return {
      success: true,
      url: base64Data,
      name: fileName
    };
  } catch (error: any) {
    console.warn('Gagal upload ke Google Drive, menggunakan fallback:', error);
    return {
      success: false,
      url: base64Data,
      error: error.message || 'Gagal terhubung ke Google Drive'
    };
  }
};
