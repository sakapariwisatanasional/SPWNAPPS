import React, { useEffect, useState } from 'react';
import {
  MapPin,
  ChevronRight,
  Building,
  Search,
  Globe2,
  Network,
  ShieldCheck,
} from 'lucide-react';
import { Province, Regency, District, CurrentUser } from '../types';
import { storage } from '../services/storage';

interface TerritoryManagementViewProps {
  currentUser?: CurrentUser;
}

export const TerritoryManagementView: React.FC<TerritoryManagementViewProps> = ({
  currentUser
}) => {
  const provinces = storage.getProvinces();
  const [searchProvince, setSearchProvince] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedRegencyId, setSelectedRegencyId] = useState<string>('');

  // Struktur wilayah tetap mengikuti wilayah user yang sudah tersimpan.
  useEffect(() => {
    let provinceId = '32';
    let regencyId = '';

    if (currentUser?.role === 'ADMIN_PROVINCE' && currentUser.jurisdictionId) {
      provinceId = currentUser.jurisdictionId;
    } else if (currentUser?.role === 'ADMIN_REGENCY' && currentUser.jurisdictionId) {
      const reg = storage.getRegencies().find(r => r.id === currentUser.jurisdictionId);
      provinceId = reg?.provinceId || currentUser.jurisdictionId.split('.')[0] || '32';
      regencyId = reg?.id || currentUser.jurisdictionId;
    } else if (currentUser?.role === 'ADMIN_BRANCH' && currentUser.jurisdictionId) {
      const district = storage.getDistricts().find(
        d => d.id === currentUser.jurisdictionId || currentUser.jurisdictionId.startsWith(d.id)
      );
      const reg = district
        ? storage.getRegencies().find(r => r.id === district.regencyId)
        : undefined;
      provinceId = reg?.provinceId || '32';
      regencyId = reg?.id || '';
    }

    if (!provinces.some(p => p.id === provinceId)) {
      provinceId = provinces[0]?.id || '';
    }

    setSelectedProvinceId(provinceId);

    const regs = storage.getRegencies(provinceId);
    if (!regencyId || !regs.some(r => r.id === regencyId)) {
      regencyId = regs[0]?.id || '';
    }
    setSelectedRegencyId(regencyId);
  }, [currentUser]);

  const selectedProvince = provinces.find(p => p.id === selectedProvinceId) || provinces[0];
  const regencies = selectedProvince ? storage.getRegencies(selectedProvince.id) : [];
  const selectedRegency = regencies.find(r => r.id === selectedRegencyId) || regencies[0];
  const districts = selectedRegency ? storage.getDistricts(selectedRegency.id) : [];

  const filteredProvinces = provinces.filter((p: Province) =>
    (p.name || '').toLowerCase().includes((searchProvince || '').toLowerCase()) ||
    (p.code || '').includes(searchProvince || '')
  );

  const isRestrictedAdmin =
    currentUser?.role === 'ADMIN_PROVINCE' ||
    currentUser?.role === 'ADMIN_REGENCY' ||
    currentUser?.role === 'ADMIN_BRANCH';

  return (
    <div className="min-h-full pb-10 text-slate-900">
      {/* Page header */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-extrabold tracking-wide uppercase">
              <Network className="w-3 h-3" />
              Master Wilayah
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight">
              Struktur Kwartir Saka Pariwisata
            </h2>
            <p className="mt-1 max-w-3xl text-xs sm:text-sm text-slate-500 leading-relaxed">
              Kwartir Nasional membawahi Kwartir Daerah, Kwartir Cabang, dan Kwartir Ranting.
              Wilayah provinsi, kabupaten/kota, dan kecamatan ditampilkan mengikuti data master.
            </p>
          </div>

          {isRestrictedAdmin && (
            <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Wilayah mengikuti kewenangan akun
            </div>
          )}
        </div>
      </div>

      {/* Top-level hierarchy */}
      <div className="mb-5 rounded-2xl border border-purple-100 bg-purple-50/70 p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-700 text-white flex items-center justify-center">
            <Globe2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">
              Tingkat Nasional
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
              Kwartir Nasional
            </div>
            <div className="text-[11px] text-slate-500">
              Pusat organisasi • membawahi seluruh Kwarda, Kwarcab, dan Kwarran
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 mt-3 pl-12 text-[10px] font-bold text-purple-600">
          <span className="h-px flex-1 bg-purple-200" />
          <span>DAERAH → CABANG → RANTING</span>
          <span className="h-px flex-1 bg-purple-200" />
        </div>
      </div>

      {/* Hierarchy explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Level 1 */}
        <section className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm">Kwartir Daerah</h3>
                  <p className="text-[10px] text-slate-400">Provinsi • {provinces.length} wilayah</p>
                </div>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-slate-100 text-[9px] font-extrabold text-slate-500">
              LEVEL 1
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchProvince}
              onChange={(e) => setSearchProvince(e.target.value)}
              placeholder="Cari provinsi atau kode..."
              className="bg-transparent outline-none w-full text-xs text-slate-800 placeholder:text-slate-400"
              aria-label="Cari Kwartir Daerah"
            />
          </div>

          <div className="mt-3 space-y-1.5 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
            {filteredProvinces.length === 0 ? (
              <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-5 text-center text-xs text-slate-400">
                Wilayah tidak ditemukan.
              </div>
            ) : (
              filteredProvinces.map((prov: Province) => {
                const isSelected = prov.id === selectedProvinceId;
                const locked = isRestrictedAdmin;

                return (
                  <button
                    key={prov.id}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (locked) return;
                      setSelectedProvinceId(prov.id);
                      const regs = storage.getRegencies(prov.id);
                      setSelectedRegencyId(regs[0]?.id || '');
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-purple-50 text-purple-950 border border-purple-200'
                        : locked
                          ? 'bg-slate-50/70 text-slate-500 border border-transparent cursor-not-allowed opacity-80'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200'
                    }`}
                    title={locked ? 'Wilayah dikunci mengikuti kewenangan akun' : `Pilih ${prov.name}`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <span className={`font-mono text-[9px] px-1.5 py-1 rounded-md font-extrabold shrink-0 ${
                        isSelected ? 'bg-white text-purple-600 border border-purple-100' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {prov.code}
                      </span>
                      <span className="truncate font-semibold">{prov.name}</span>
                    </div>
                    <span className={`text-[9px] font-mono font-extrabold shrink-0 ${
                      isSelected ? 'text-purple-700' : 'text-slate-400'
                    }`}>
                      {prov.memberCount?.toLocaleString('id-ID') || 0}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Level 2 */}
        <section className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-fuchsia-50 text-fuchsia-700 flex items-center justify-center shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm">Kwartir Cabang</h3>
                <p className="text-[10px] text-slate-400 truncate">
                  Kabupaten / Kota • {selectedProvince?.name || 'Pilih Kwarda'}
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-slate-100 text-[9px] font-extrabold text-slate-500">
              LEVEL 2
            </span>
          </div>

          <div className="mt-3 space-y-1.5 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
            {regencies.length === 0 ? (
              <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                Belum ada data Kwarcab pada wilayah ini.
              </div>
            ) : (
              regencies.map((reg: Regency) => {
                const isSelected = reg.id === selectedRegencyId;
                const locked =
                  currentUser?.role === 'ADMIN_REGENCY' ||
                  currentUser?.role === 'ADMIN_BRANCH';

                return (
                  <button
                    key={reg.id}
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      if (locked) return;
                      setSelectedRegencyId(reg.id);
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-fuchsia-50 text-fuchsia-950 border border-fuchsia-200'
                        : locked
                          ? 'bg-slate-50/70 text-slate-500 border border-transparent cursor-not-allowed opacity-80'
                          : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200'
                    }`}
                    title={locked ? 'Kwarcab dikunci mengikuti kewenangan akun' : `Pilih ${reg.name}`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      <span className={`font-mono text-[9px] px-1.5 py-1 rounded-md font-extrabold shrink-0 ${
                        isSelected ? 'bg-white text-fuchsia-600 border border-fuchsia-100' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {reg.code}
                      </span>
                      <span className="truncate font-semibold">{reg.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-fuchsia-500' : 'text-slate-300'
                    }`} />
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Level 3 */}
        <section className="lg:col-span-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-sm">Kwartir Ranting</h3>
                <p className="text-[10px] text-slate-400 truncate">
                  Kecamatan • {selectedRegency?.name || 'Pilih Kwarcab'}
                </p>
              </div>
            </div>
            <span className="px-2 py-1 rounded-lg bg-slate-100 text-[9px] font-extrabold text-slate-500">
              LEVEL 3
            </span>
          </div>

          <div className="mt-3 space-y-2 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
            {districts.length === 0 ? (
              <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                Pilih Kwartir Cabang untuk melihat Kwartir Ranting.
              </div>
            ) : (
              districts.map((dist: District) => {
                const branches = storage.getBranches(dist.id);

                return (
                  <div
                    key={dist.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="font-mono text-[9px] text-slate-500 bg-white border border-slate-200 px-1.5 py-1 rounded-md font-extrabold shrink-0">
                          {dist.code}
                        </span>
                        <span className="truncate text-xs font-extrabold text-slate-800">
                          Kwarran {dist.name}
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[9px] font-extrabold rounded-md shrink-0">
                        Kecamatan
                      </span>
                    </div>

                    {branches.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 space-y-1.5">
                        {branches.map((b) => (
                          <div
                            key={b.id}
                            className="bg-white p-2.5 rounded-lg border border-slate-200"
                          >
                            <p className="font-bold text-xs text-slate-800 truncate">{b.name}</p>
                            {b.address && (
                              <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-2">
                                {b.address}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
