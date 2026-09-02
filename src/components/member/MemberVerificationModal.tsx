import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  MapPin, 
  Award, 
  Calendar, 
  Building,
  User,
  Sparkles,
  Lock,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { Member } from '../../types';
import { SakaLogo, formatDriveImageUrl, getDriveDirectFallbackUrl, getValidAvatarUrl } from '../common/SakaLogo';
import { DigitalMemberCard } from './DigitalMemberCard';

interface MemberVerificationModalProps {
  member: Member | null;
  onClose: () => void;
}

export const MemberVerificationModal: React.FC<MemberVerificationModalProps> = ({
  member,
  onClose
}) => {
  const [activeView, setActiveView] = useState<'INFO' | 'CARD'>('INFO');
  
  if (!member) return null;

  const isVerified = member.status === 'ACTIVE';
  const avatar = formatDriveImageUrl(member.avatarUrl) || member.avatarUrl || getValidAvatarUrl(member.avatarUrl, member.gender);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner with SakaLogo Key Visual */}
        <div className={`p-6 text-white text-center relative overflow-hidden ${
          isVerified 
            ? 'bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950' 
            : 'bg-gradient-to-br from-amber-700 via-orange-800 to-slate-900'
        }`}>
          {/* Watermark in Header */}
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
            <SakaLogo size={140} />
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mx-auto mb-2 flex justify-center">
            <SakaLogo size={56} id="modal-saka-logo" />
          </div>

          <span className="inline-block px-3 py-1 bg-white/15 rounded-full text-xs font-extrabold uppercase tracking-widest mb-1 text-purple-200 border border-purple-300/20">
            {isVerified ? 'Anggota Resmi Terverifikasi' : 'Status: Menunggu Verifikasi'}
          </span>
          <h3 className="text-xl font-extrabold tracking-tight font-heading">
            Saka Pariwisata Kwartir Nasional
          </h3>
          <p className="text-xs text-purple-200/80 font-medium">
            Sistem Verifikasi Digital Nasional Kwartir Gerakan Pramuka
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveView('INFO')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'INFO'
                ? 'border-purple-900 text-purple-950 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Data Verifikasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('CARD')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'CARD'
                ? 'border-purple-900 text-purple-950 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-purple-700" />
            <span>Kartu KTA Digital</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {activeView === 'CARD' ? (
            <div className="space-y-4 animate-in fade-in duration-100 flex flex-col items-center">
              <p className="text-xs text-slate-500 text-center">
                Klik pada kartu untuk membalik dan melihat sisi belakang (SKK & Kode Barcode)
              </p>
              <div className="w-full flex justify-center py-2">
                <DigitalMemberCard member={member} />
              </div>
            </div>
          ) : (
            <>
              {/* Member Main Badge */}
              <div className="flex items-center gap-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
                <div className="relative flex-shrink-0">
                  <img
                    src={avatar}
                    alt={member.fullName}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500 shadow-sm bg-slate-900"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      const directFallback = getDriveDirectFallbackUrl(member.avatarUrl);
                      if (directFallback && img.src !== directFallback) {
                        img.src = directFallback;
                      } else {
                        img.src = getValidAvatarUrl('', member.gender);
                      }
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-base text-slate-900 truncate font-heading">
                    {member.fullName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-purple-900 font-bold font-mono mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>{member.nationalMemberNumber || 'Nomor Anggota Dalam Proses'}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {member.currentPosition || 'Anggota Saka'} • <strong className="text-purple-700">{member.krida}</strong>
                  </p>
                </div>
              </div>

              {/* Safe Public Data Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Provinsi</p>
                  <p className="font-bold text-slate-800 mt-0.5">{member.provinceName}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kabupaten/Kota</p>
                  <p className="font-bold text-slate-800 mt-0.5">{member.regencyName}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kwartir Ranting</p>
                  <p className="font-bold text-slate-800 mt-0.5 truncate">{member.branchName}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gugus Depan</p>
                  <p className="font-bold text-slate-800 mt-0.5 truncate">{member.gugusDepan}</p>
                </div>
              </div>

              {/* Skills & Competencies */}
              {member.skills && member.skills.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                    <span>Keahlian Kepariwisataan Terdaftar</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.map((s) => (
                      <span
                        key={s.id}
                        className="px-2.5 py-1 bg-purple-50 text-purple-900 border border-purple-200/80 rounded-lg text-xs font-semibold"
                      >
                        {s.skillName} • <span className="text-purple-600 font-bold">{s.proficiency}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Notice (UU PDP Compliance) */}
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/60 text-[11px] text-purple-950 leading-relaxed">
                <span className="font-bold">🔒 Informasi Privasi & Keamanan:</span> Halaman ini hanya menampilkan data publik terverifikasi sesuai kebijakan perlindungan data pribadi nasional. Data privat (NIK, alamat lengkap, kontak pribadi) dilindungi secara terenkripsi.
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">
            Token: {member.verificationToken}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView(activeView === 'INFO' ? 'CARD' : 'INFO')}
              className="px-3.5 py-2 bg-purple-100 hover:bg-purple-200 text-purple-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {activeView === 'INFO' ? 'Lihat KTA Digital' : 'Lihat Data Lengkap'}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
