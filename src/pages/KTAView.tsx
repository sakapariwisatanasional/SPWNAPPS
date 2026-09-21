import React, { useState } from 'react';
import { CurrentUser, Member } from '../types';
import { Download, CreditCard, QrCode, ArrowLeft } from 'lucide-react';

export interface KTAViewProps {
  currentUser?: CurrentUser;
  memberData?: Member | null;
  onBack?: () => void;
}

export const KTAView: React.FC<KTAViewProps> = ({ currentUser, memberData, onBack }) => {
  const [activeSide, setActiveSide] = useState<'DEPAN' | 'BELAKANG'>('DEPAN');

  // Fallback data agar tampilan KTA tidak pernah kosong
  const name = memberData?.fullName || currentUser?.name || currentUser?.username || 'Kader Saka Pariwisata';
  const ktaNumber = memberData?.id || currentUser?.id || 'SPW-3204-00291';
  const role = currentUser?.role === 'SUPER_ADMIN' ? 'Pimpinan Saka Nasional' : (memberData?.currentPosition || 'Anggota Saka Pariwisata');
  const krida = memberData?.krida || 'Krida Pemandu';
  const province = memberData?.provinceName || 'Jawa Barat';
  const regency = memberData?.regencyName || 'Kabupaten Bandung';
  const photoUrl = memberData?.avatarUrl || currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          )}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>KTA Digital Resmi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Kartu Tanda Anggota (KTA)
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Identitas resmi kader & pengurus Saka Pariwisata terverifikasi nasional.
          </p>
        </div>

        {/* Tab Sisi Depan / Belakang */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSide('DEPAN')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSide === 'DEPAN'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sisi Depan
          </button>
          <button
            type="button"
            onClick={() => setActiveSide('BELAKANG')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSide === 'BELAKANG'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sisi Belakang
          </button>
        </div>
      </div>

      {/* Showcase Kartu KTA Digital */}
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative w-full max-w-[500px] aspect-[85.6/53.98] rounded-2xl overflow-hidden shadow-2xl border border-slate-300 bg-slate-900 select-none">
          {activeSide === 'DEPAN' ? (
            <div className="relative w-full h-full">
              {/* Template Depan KTA */}
              <img
                src="/assets/kta/KTA_MASTER_DEPAN.png"
                alt="KTA Depan"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />

              {/* Overlay Informasi Anggota */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between text-slate-900 pointer-events-none">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      {role}
                    </span>
                    <p className="text-[10px] font-bold text-slate-700">{ktaNumber}</p>
                  </div>
                </div>

                <div className="flex items-end gap-3.5 pt-4">
                  <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-emerald-600 shadow-md bg-slate-200 shrink-0">
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm md:text-base font-black text-slate-900 uppercase leading-tight drop-shadow-xs">
                      {name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-700">{krida}</p>
                    <p className="text-[9px] text-slate-600">{regency}, {province}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* Template Belakang KTA */}
              <img
                src="/assets/kta/KTA_MASTER_BELAKANG.png"
                alt="KTA Belakang"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 p-6 flex flex-col justify-between text-slate-800 pointer-events-none">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase text-slate-900">Ketentuan Pemegang KTA</h4>
                  <p className="text-[8px] text-slate-600 leading-tight">
                    1. Kartu ini adalah bukti identitas sah anggota Saka Pariwisata Nasional.<br />
                    2. Dilarang menyalahgunakan kartu untuk kegiatan di luar ketentuan Gerakan Pramuka.<br />
                    3. Jika menemukan kartu ini, harap kembalikan ke Kwartir terdekat.
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="p-1 bg-white rounded border border-slate-300">
                    <QrCode className="w-10 h-10 text-slate-900" />
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold block text-slate-700">Tanda Pengesahan</span>
                    <span className="text-[8px] text-slate-500 block">Kwartir Nasional</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSide(activeSide === 'DEPAN' ? 'BELAKANG' : 'DEPAN')}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 border border-slate-300 transition-all cursor-pointer"
          >
            <span>Balik Kartu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KTAView;