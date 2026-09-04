import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  Sparkles, 
  Ticket,
  Search,
  Filter,
  Phone,
  Info,
  Building2,
  Calendar,
  Trash2,
  Edit3
} from 'lucide-react';
import { Activity, CurrentUser } from '../types';
import { storage } from '../services/storage';
import { ActivityDetailModal } from '../components/activities/ActivityDetailModal';
import { ActivityFormModal } from '../components/activities/ActivityFormModal';

interface ActivitiesViewProps {
  currentUser: CurrentUser;
  activities: Activity[];
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  currentUser,
  activities: initialActivities
}) => {
  const [activitiesList, setActivitiesList] = useState<Activity[]>(initialActivities || storage.getActivities());
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const refreshActivities = () => {
    setActivitiesList(storage.getActivities());
  };

  const isOperatorOrAdmin = [
    'SUPER_ADMIN', 
    'ADMIN_PROVINCE', 
    'ADMIN_REGENCY', 
    'ADMIN_BRANCH',
    'OPERATOR'
  ].includes(currentUser.role);

  const categories = useMemo(() => {
    return Array.from(new Set(activitiesList.map(a => a.category).filter(Boolean)));
  }, [activitiesList]);

  const filteredActivities = useMemo(() => {
    return activitiesList.filter(a => {
      const matchCat = categoryFilter === 'ALL' || a.category === categoryFilter;
      const matchLevel = levelFilter === 'ALL' || a.organizerLevel?.toUpperCase() === levelFilter.toUpperCase();
      const matchStatus = statusFilter === 'ALL' || a.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.locationName.toLowerCase().includes(q) ||
        a.provinceName.toLowerCase().includes(q) ||
        (a.regencyName && a.regencyName.toLowerCase().includes(q)) ||
        (a.organizerName && a.organizerName.toLowerCase().includes(q));
      return matchCat && matchLevel && matchStatus && matchQuery;
    });
  }, [activitiesList, categoryFilter, levelFilter, statusFilter, searchQuery]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-2xl sm:rounded-3xl p-5 sm:p-7 text-white border border-purple-800/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/40 rounded-full text-teal-200 text-xs font-bold">
              <CalendarDays className="w-3.5 h-3.5 text-teal-300" />
              <span>Agenda Kegiatan Saka Pariwisata Se-Indonesia</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold font-heading text-white">
              Agenda & Kegiatan Saka Pariwisata
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-3xl leading-relaxed">
              Pusat informasi resmi perkemahan wisata, pelatihan pemandu, bakti Sapta Pesona, dan lokakarya nasional yang diselenggarakan dan diunggah oleh Kwartir / Pimpinan Saka.
            </p>
          </div>

          {isOperatorOrAdmin && (
            <button
              onClick={() => {
                setEditingActivity(null);
                setIsFormOpen(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Agenda Baru</span>
            </button>
          )}
        </div>

        {/* Non-transactional Notice */}
        <div className="p-3 bg-teal-950/60 border border-teal-500/30 rounded-xl flex items-start gap-2.5 text-xs text-teal-100">
          <Info className="w-4 h-4 text-teal-300 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-white font-semibold">Etalase Informasi & Narahubung Langsung:</strong>
            <span className="ml-1 text-teal-200/90">
              Sistem ini tidak memfasilitasi transaksi keuangan tertutup. Pendaftaran kegiatan, konsultasi keikutsertaan, maupun penginapan dapat dilakukan secara langsung dengan menghubungi narahubung/nomor WhatsApp yang tertera pada setiap poster kegiatan.
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === 'ALL'
                  ? 'bg-purple-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Semua Kategori ({activitiesList.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-purple-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Level and Status Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
            <select
              aria-label="Filter Tingkat Penyelenggara"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-purple-600 cursor-pointer"
            >
              <option value="ALL">Semua Tingkat</option>
              <option value="Nasional">Nasional (Kwarnas)</option>
              <option value="Provinsi">Daerah (Kwarda)</option>
              <option value="Kabupaten/Kota">Cabang (Kwarcab)</option>
              <option value="Ranting">Ranting (Kwarran)</option>
            </select>

            <select
              aria-label="Filter Status Pendaftaran"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium outline-none focus:border-purple-600 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="OPEN_REGISTRATION">Pendaftaran Dibuka</option>
              <option value="ONGOING">Sedang Berlangsung</option>
              <option value="COMPLETED">Selesai</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari agenda kegiatan berdasarkan nama kegiatan, kota/lokasi, atau narahubung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-purple-600 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
          <CalendarDays className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
          <p className="font-bold text-slate-700 text-sm">Tidak ada agenda kegiatan yang sesuai filter.</p>
          <p className="text-xs text-slate-400">Silakan ubah kata kunci atau setel ulang filter pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => {
            const percent = Math.min(100, Math.round((act.registeredCount / Math.max(1, act.maxParticipants)) * 100));
            const isFree = !act.registrationFee || act.registrationFee === 0;

            return (
              <div
                key={act.id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:border-purple-300"
              >
                <div className="space-y-3">
                  {/* Cover Banner Image */}
                  <div className="h-48 sm:h-52 relative overflow-hidden bg-slate-900">
                    <img
                      src={act.coverImage}
                      alt={act.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                      <span className="px-2.5 py-1 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold rounded-lg border border-white/10 shadow-xs">
                        {act.category}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-xs ${
                        act.status === 'OPEN_REGISTRATION'
                          ? 'bg-emerald-500/90 text-white border-emerald-400'
                          : act.status === 'ONGOING'
                          ? 'bg-blue-500/90 text-white border-blue-400 animate-pulse'
                          : 'bg-slate-700/90 text-slate-200 border-slate-600'
                      }`}>
                        {act.status === 'OPEN_REGISTRATION' ? 'PENDAFTARAN DIBUKA' : act.status === 'ONGOING' ? 'SEDANG BERLANGSUNG' : 'SELESAI'}
                      </span>
                    </div>

                    {/* Tingkat Penyelenggara & Lokasi Floating */}
                    <div className="absolute bottom-3 left-3 right-3 text-white z-10 space-y-0.5">
                      <span className="px-2 py-0.5 bg-purple-600/90 text-white text-[10px] font-bold rounded-md inline-block">
                        Tingkat {act.organizerLevel}
                      </span>
                      <p className="text-xs font-semibold text-slate-200 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-teal-400 flex-shrink-0" />
                        <span className="truncate">{act.locationName}, {act.provinceName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-4 sm:p-5 pt-1 space-y-3">
                    {/* Dates & Duration */}
                    <div className="flex items-center gap-1.5 text-xs text-purple-800 font-semibold bg-purple-50 p-2 rounded-xl border border-purple-100">
                      <CalendarDays className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                      <span className="truncate">
                        {new Date(act.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' - '}
                        {new Date(act.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() => setSelectedActivity(act)}
                      className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-purple-900 transition-colors line-clamp-2 cursor-pointer font-heading leading-snug"
                    >
                      {act.title}
                    </h4>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>

                    {/* Uploader / Organizer Box */}
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Penyelenggara / Pengunggah</p>
                        <p className="font-bold text-slate-800 truncate">{act.organizerName}</p>
                        <p className="text-[10px] text-purple-700 font-medium">{act.uploadedByName} ({act.uploadedByRole})</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-slate-400 block">Biaya Registrasi</span>
                        <span className={`text-xs font-extrabold ${isFree ? 'text-emerald-700' : 'text-purple-900'}`}>
                          {isFree ? 'GRATIS / SUBSIDI' : formatRupiah(act.registrationFee)}
                        </span>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>Kapasitas Peserta:</span>
                        </span>
                        <span className="font-bold text-slate-700">
                          {act.registeredCount} / {act.maxParticipants} Orang ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 sm:p-5 pt-0 space-y-2 border-t border-slate-100 bg-slate-50/50">
                  {/* WhatsApp Direct Contact Button */}
                  <a
                    href={`https://wa.me/${act.contactPhone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Halo Panitia / Narahubung Kegiatan "${act.title}", saya ingin menanyakan informasi dan pendaftaran kegiatan ini yang saya lihat di Portal Saka Pariwisata.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl sm:rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 min-h-[40px] shadow-xs active:scale-98"
                  >
                    <Phone className="w-3.5 h-3.5 text-white" />
                    <span>Hubungi Narahubung via WhatsApp</span>
                  </a>

                  {/* View Detail & Registration Modal */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedActivity(act)}
                      className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-colors border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-purple-700" />
                      <span>Detail & Pendaftaran</span>
                    </button>

                    {/* Edit for Operators/Admins */}
                    {isOperatorOrAdmin && (
                      <button
                        onClick={() => {
                          setEditingActivity(act);
                          setIsFormOpen(true);
                        }}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition-colors cursor-pointer flex items-center justify-center"
                        title="Edit Agenda Kegiatan"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                      </button>
                    )}

                    {/* Delete for Operators/Super Admins */}
                    {isOperatorOrAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`Apakah Anda yakin ingin menghapus agenda kegiatan "${act.title}"?`)) {
                            storage.deleteActivity(act.id, currentUser);
                            refreshActivities();
                          }
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 transition-colors cursor-pointer flex items-center justify-center"
                        title="Hapus Agenda Kegiatan"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          currentUser={currentUser}
          onClose={() => setSelectedActivity(null)}
          onRegisterSuccess={() => {
            refreshActivities();
            const updated = storage.getActivities().find(a => a.id === selectedActivity.id);
            if (updated) setSelectedActivity(updated);
          }}
          onEditActivity={(act) => {
            setSelectedActivity(null);
            setEditingActivity(act);
            setIsFormOpen(true);
          }}
          onDeleteActivity={(actId) => {
            storage.deleteActivity(actId, currentUser);
            refreshActivities();
            setSelectedActivity(null);
          }}
        />
      )}

      {isFormOpen && (
        <ActivityFormModal
          isOpen={isFormOpen}
          currentUser={currentUser}
          initialActivity={editingActivity || undefined}
          onClose={() => {
            setIsFormOpen(false);
            setEditingActivity(null);
          }}
          onSuccess={() => {
            refreshActivities();
            setIsFormOpen(false);
            setEditingActivity(null);
          }}
        />
      )}
    </div>
  );
};
