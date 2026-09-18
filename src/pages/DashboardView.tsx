import React from 'react';
import { Compass, Megaphone, PartyPopper, Utensils, Users, Calendar } from 'lucide-react';

export interface DashboardViewProps {
  currentUser?: any;
  members?: any[];
  activities?: any[];
  onSelectTab?: (view: string) => void;
  [key: string]: any;
}

const krida = [
  { title: 'Krida Pemandu', icon: Compass, style: 'bg-red-50 text-red-600' },
  { title: 'Krida Penyuluh', icon: Megaphone, style: 'bg-teal-50 text-teal-600' },
  { title: 'MICE & Event', icon: PartyPopper, style: 'bg-purple-50 text-purple-600' },
  { title: 'Kuliner & Cinderamata', icon: Utensils, style: 'bg-amber-50 text-amber-600' }
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  members = [],
  activities = [],
  onSelectTab
}) => (
  <main className='min-h-screen bg-slate-50 p-4 md:p-8 space-y-6'>
    <section className='rounded-[2rem] p-8 text-white bg-gradient-to-br from-red-600 via-amber-500 to-teal-500'>
      <p>Saka Pariwisata</p>
      <h1 className='text-4xl font-black mt-2'>Halo, {currentUser?.name || 'Anggota'} 👋</h1>
      <p className='mt-3'>Jelajah Nusantara bersama Saka Pariwisata.</p>
    </section>

    <section>
      <h2 className='font-black text-xl mb-4'>Quick Krida</h2>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {krida.map(({title, icon: Icon, style}) => (
          <button key={title} onClick={() => onSelectTab?.('krida-modules')} className='bg-white rounded-3xl p-5 border text-left'>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style}`}><Icon /></div>
            <b className='block mt-4'>{title}</b>
          </button>
        ))}
      </div>
    </section>

    <section className='bg-white rounded-3xl p-6 border'>
      <h2 className='font-black text-xl'>Digital Member Card</h2>
      <p className='text-slate-500'>Kartu anggota digital Saka Pariwisata.</p>
    </section>

    <section className='grid md:grid-cols-2 gap-4'>
      <div className='bg-white rounded-3xl p-6 border'><Users /> <b className='block text-3xl'>{members.length}</b>Total Anggota</div>
      <div className='bg-white rounded-3xl p-6 border'><Calendar /> <b className='block text-3xl'>{activities.length}</b>Aktivitas</div>
    </section>
  </main>
);

export default DashboardView;
