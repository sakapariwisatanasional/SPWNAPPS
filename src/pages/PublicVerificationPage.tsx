import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  UserRound,
  XCircle
} from 'lucide-react';
import { Member } from '../types';
import { verifyMemberUniversal } from '../services/ktaVerificationService';
import { SakaLogo, formatDriveImageUrl, getDriveDirectFallbackUrl, getValidAvatarUrl } from '../components/common/SakaLogo';
import { DigitalMemberCard } from '../components/member/DigitalMemberCard';

interface PublicVerificationPageProps {
  members: Member[];
}

export const PublicVerificationPage: React.FC<PublicVerificationPageProps> = ({ members }) => {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCard, setShowCard] = useState(false);
  const [error, setError] = useState('');

  const verifyFromUrl = async () => {
    const params = new URLSearchParams(window.location.search);

    const term = (
      params.get('verifyId') ||
      params.get('nta') ||
      params.get('id') ||
      params.get('kta') ||
      ''
    ).trim();

    if (!term) {
      setLoading(false);
      setError(
        'Nomor verifikasi tidak ditemukan pada tautan. Pastikan QR Code atau tautan KTA masih valid.'
      );
      return;
    }

    setLoading(true);
    setError('');
    setMember(null);

    try {
      const verification = await verifyMemberUniversal(
        term,
        members,
        { authoritativeRemote: true }
      );

      if (verification.found && verification.member) {
        setMember(verification.member);
      } else {
        setError(
          verification.message ||
          'Data anggota tidak ditemukan. Pastikan QR Code atau tautan verifikasi masih valid.'
        );
      }
    } catch (err: any) {
      setError(
        err?.message ||
        'Terjadi kesalahan saat memverifikasi data anggota.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void verifyFromUrl();

    // Verifikasi publik hanya dijalankan sekali saat halaman dibuka.
    // Perubahan/sinkronisasi state `members` dari App tidak boleh memicu
    // verifikasi ulang setiap kali polling cloud memperbarui data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };

  const isVerified = member?.status === 'ACTIVE';

  const avatar = member
    ? formatDriveImageUrl(member.avatarUrl) ||
      member.avatarUrl ||
      getValidAvatarUrl(member.avatarUrl, member.gender)
    : '';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">

      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 min-w-0">
            <SakaLogo
              size={40}
              id="public-verification-logo"
            />

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-700">
                Verifikasi KTA
              </p>

              <p className="text-sm font-extrabold text-slate-900 truncate">
                Saka Pariwisata Kwartir Nasional
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={goBack}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>

        </div>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-2xl">

          {loading && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 sm:p-12 text-center">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center">
                <Loader2 className="w-7 h-7 animate-spin" />
              </div>

              <h1 className="mt-5 text-xl font-extrabold font-heading">
                Memverifikasi KTA...
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Mohon tunggu, data sedang dicocokkan dengan sumber resmi.
              </p>

            </div>
          )}

          {!loading && member && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">

              <div
                className={`px-6 py-7 sm:px-8 text-white text-center relative overflow-hidden ${
                  isVerified
                    ? 'bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950'
                    : 'bg-gradient-to-br from-amber-700 via-orange-800 to-slate-900'
                }`}
              >

                <div className="absolute -right-8 -top-8 opacity-10 pointer-events-none">
                  <SakaLogo size={180} />
                </div>

                <div className="relative">

                  <div className="mx-auto w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-4">
                    {isVerified ? (
                      <ShieldCheck className="w-8 h-8 text-emerald-300" />
                    ) : (
                      <XCircle className="w-8 h-8 text-amber-300" />
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-extrabold uppercase tracking-wider">

                    {isVerified ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-amber-300" />
                    )}

                    {isVerified
                      ? 'Anggota Resmi Terverifikasi'
                      : 'Status Keanggotaan'}

                  </span>

                  <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold font-heading">
                    Hasil Verifikasi KTA
                  </h1>

                  <p className="mt-1 text-xs text-purple-200/80">
                    Sistem Verifikasi Digital Nasional Kwartir Gerakan Pramuka
                  </p>

                </div>
              </div>

              <div className="p-5 sm:p-8 space-y-6">

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-[1.5rem] bg-purple-50/60 border border-purple-100">

                  <div className="relative shrink-0">

                    <img
                      src={avatar}
                      alt={member.fullName}
                      referrerPolicy="no-referrer"
                      className="w-28 h-28 rounded-[1.5rem] object-cover border-4 border-white shadow-md bg-slate-900"
                      onError={(e) => {
                        const img = e.currentTarget;

                        const directFallback =
                          getDriveDirectFallbackUrl(member.avatarUrl);

                        if (
                          directFallback &&
                          img.src !== directFallback
                        ) {
                          img.src = directFallback;
                        } else {
                          img.src = getValidAvatarUrl(
                            '',
                            member.gender
                          );
                        }
                      }}
                    />

                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center border-4 border-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                  </div>

                  <div className="text-center sm:text-left min-w-0 flex-1">

                    <p className="text-[10px] font-bold uppercase tracking-widest text-purple-700">
                      Nama Anggota
                    </p>

                    <h2 className="mt-1 text-2xl font-extrabold font-heading text-slate-900 break-words">
                      {member.fullName}
                    </h2>

                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-purple-100 text-purple-950 font-mono text-sm font-extrabold">

                      <UserRound className="w-4 h-4 text-fuchsia-600" />

                      {member.nationalMemberNumber ||
                        'Nomor Anggota Dalam Proses'}

                    </div>

                    <p className="mt-2 text-xs text-slate-500 font-medium">
                      {member.currentPosition || 'Anggota Saka'}

                      {member.krida
                        ? ` • ${member.krida}`
                        : ''}
                    </p>

                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Provinsi
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {member.provinceName || '-'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Kabupaten/Kota
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {member.regencyName || '-'}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Kwartir Ranting
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {member.districtName || '-'}
                    </p>
                  </div>

                </div>

                {member.skills && member.skills.length > 0 && (
                  <section>

                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">

                      <Award className="w-3.5 h-3.5 text-fuchsia-600" />

                      Keahlian Kepariwisataan Terdaftar

                    </p>

                    <div className="flex flex-wrap gap-1.5">

                      {member.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-2.5 py-1 bg-purple-50 text-purple-900 border border-fuchsia-200/80 rounded-lg text-xs font-semibold"
                        >
                          {skill.skillName}

                          {' • '}

                          <span className="text-fuchsia-600 font-bold">
                            {skill.proficiency}
                          </span>
                        </span>
                      ))}

                    </div>

                  </section>
                )}

                <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">

                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>

                  <div>

                    <p className="text-xs font-extrabold text-emerald-900">
                      Data ditemukan pada sistem verifikasi
                    </p>

                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Informasi yang ditampilkan adalah data publik
                      yang diperuntukkan untuk keperluan verifikasi KTA.
                    </p>

                  </div>

                </div>

                {showCard && (
                  <div className="pt-2 border-t border-slate-200">

                    <p className="text-xs text-slate-500 text-center mb-4">
                      KTA Digital Anggota
                    </p>

                    <div className="flex justify-center overflow-x-auto pb-2">
                      <DigitalMemberCard member={member} />
                    </div>

                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-1">

                  <button
                    type="button"
                    onClick={() => setShowCard((value) => !value)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-950 text-sm font-extrabold transition-colors"
                  >
                    <CreditCard className="w-4 h-4" />

                    {showCard
                      ? 'Sembunyikan KTA Digital'
                      : 'Lihat KTA Digital'}
                  </button>

                  <button
                    type="button"
                    onClick={goBack}
                    className="sm:w-36 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-extrabold transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Selesai
                  </button>

                </div>

                <p className="text-[10px] text-center text-slate-400 leading-relaxed">
                  Informasi privat seperti NIK, alamat lengkap,
                  dan kontak pribadi tidak ditampilkan pada halaman
                  verifikasi publik.
                </p>

              </div>
            </div>
          )}

          {!loading && !member && (
            <div className="bg-white rounded-[2rem] border border-rose-200 shadow-sm p-8 sm:p-12 text-center">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <XCircle className="w-7 h-7" />
              </div>

              <h1 className="mt-5 text-xl font-extrabold font-heading">
                Data Anggota Tidak Ditemukan
              </h1>

              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {error}
              </p>

              <button
                type="button"
                onClick={goBack}
                className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-extrabold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>

            </div>
          )}

        </div>
      </main>

      <footer className="px-4 py-5 text-center text-[10px] text-slate-400">
        Verifikasi publik KTA • Saka Pariwisata Kwartir Nasional
      </footer>

    </div>
  );
};
