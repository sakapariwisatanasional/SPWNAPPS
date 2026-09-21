import React from 'react';
import { CurrentUser, Member } from '../types';
import {
  Users, Award, MapPin, Compass, Sparkles, CreditCard,
  CheckCircle2, ArrowRight, Shield, Activity, Calendar
} from 'lucide-react';

interface DashboardViewProps {
  currentUser?: CurrentUser;
  memberData?: Member | null;
  onNavigate?: (view: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  memberData,
  onNavigate,
}) => {
  const userName = memberData?.fullName || currentUser?.name || currentUser?.username || 'Kader Pandu';
  const userRole = currentUser?.role === 'SUPER_ADMIN' ? 'Super Administrator' : 'Anggota Saka Pariwisata';

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Banner Selamat Datang */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-teal-800 p-6 md:p-8 text-white shadow-xl overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Manajemen Anggota</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            Selamat Datang, {userName}!
          </h1>
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
            Status Akun: <span className="font-bold text-white">{userRole}</span>. Pantau status pengesahan KTA, eksplorasi materi 4 Krida, dan kembangkan potensi pariwisata daerah Anda.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('kta')}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Lihat KTA Digital</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('members')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Data Seluruh Anggota</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ringkasan Status Kader */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Nomor KTA', value: memberData?.id || 'SPW-3204-00291', icon: CreditCard, color: 'text-blue-500 bg-blue-50' },
          { label: 'Krida Terdaftar', value: memberData?.krida || 'Krida Pemandu', icon: Compass, color: 'text-emerald-500 bg-emerald-50' },
          { label: 'Kwartir Wilayah', value: memberData?.regencyName || 'Kab. Bandung', icon: MapPin, color: 'text-amber-500 bg-amber-50' },
          { label: 'Status Verifikasi', value: 'Terverifikasi Aktif', icon: CheckCircle2, color: 'text-purple-500 bg-purple-50' },
        ].map((item, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${item.color} shrink-0`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
              <p className="text-sm md:text-base font-bold text-slate-800 line-clamp-1">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Aktivitas & Modul Pembelajaran */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Syarat Kecakapan Khusus (SKK)</span>
            </h3>
            <span className="text-xs text-emerald-600 font-bold">4 Krida</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tingkatkan tanda kecakapan khusus kepariwisataan Anda melalui pelatihan bersertifikasi yang diselenggarakan Kwartir Daerah dan Nasional.
          </p>
          <div className="space-y-2">
            {['SKK Pemandu Ekowisata', 'SKK Sapta Pesona Budaya', 'SKK Pengelola Kuliner Daerah'].map((skk, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{skk}</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Tersedia</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Agenda & Pengumuman Nasional</span>
            </h3>
            <span className="text-xs text-blue-600 font-bold">Terbaru</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Ikuti giat perkemahan dan pelatihan pariwisata nasional Saka Pariwisata seluruh Indonesia.
          </p>
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <p className="font-bold text-slate-800">Perkemahan Bakti Saka Pariwisata Tingkat Nasional</p>
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Pelaksanaan Terjadwal Kuartal Mendatang</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
