import { Province, Regency, District, Branch } from '../types';
import { ALL_INDONESIA_DISTRICTS_MAP, getDistrictsForRegency } from './allDistrictsData';

export const PROVINCES_DATA: Province[] = [
  { id: '00', code: '00', name: 'Kwartir Nasional', island: 'Pusat / Nasional', memberCount: 180 },
  { id: '11', code: '11', name: 'Aceh', island: 'Sumatera', memberCount: 1420 },
  { id: '12', code: '12', name: 'Sumatera Utara', island: 'Sumatera', memberCount: 3120 },
  { id: '13', code: '13', name: 'Sumatera Barat', island: 'Sumatera', memberCount: 2240 },
  { id: '14', code: '14', name: 'Riau', island: 'Sumatera', memberCount: 1850 },
  { id: '15', code: '15', name: 'Jambi', island: 'Sumatera', memberCount: 1100 },
  { id: '16', code: '16', name: 'Sumatera Selatan', island: 'Sumatera', memberCount: 2400 },
  { id: '17', code: '17', name: 'Bengkulu', island: 'Sumatera', memberCount: 890 },
  { id: '18', code: '18', name: 'Lampung', island: 'Sumatera', memberCount: 2150 },
  { id: '19', code: '19', name: 'Kepulauan Bangka Belitung', island: 'Sumatera', memberCount: 760 },
  { id: '21', code: '21', name: 'Kepulauan Riau', island: 'Sumatera', memberCount: 1320 },
  { id: '31', code: '31', name: 'DKI Jakarta', island: 'Jawa', memberCount: 4890 },
  { id: '32', code: '32', name: 'Jawa Barat', island: 'Jawa', memberCount: 10240 },
  { id: '33', code: '33', name: 'Jawa Tengah', island: 'Jawa', memberCount: 7650 },
  { id: '34', code: '34', name: 'DI Yogyakarta', island: 'Jawa', memberCount: 3450 },
  { id: '35', code: '35', name: 'Jawa Timur', island: 'Jawa', memberCount: 8920 },
  { id: '36', code: '36', name: 'Banten', island: 'Jawa', memberCount: 3100 },
  { id: '51', code: '51', name: 'Bali', island: 'Bali & Nusa Tenggara', memberCount: 3880 },
  { id: '52', code: '52', name: 'Nusa Tenggara Barat', island: 'Bali & Nusa Tenggara', memberCount: 2100 },
  { id: '53', code: '53', name: 'Nusa Tenggara Timur', island: 'Bali & Nusa Tenggara', memberCount: 1650 },
  { id: '61', code: '61', name: 'Kalimantan Barat', island: 'Kalimantan', memberCount: 1450 },
  { id: '62', code: '62', name: 'Kalimantan Tengah', island: 'Kalimantan', memberCount: 980 },
  { id: '63', code: '63', name: 'Kalimantan Selatan', island: 'Kalimantan', memberCount: 1560 },
  { id: '64', code: '64', name: 'Kalimantan Timur', island: 'Kalimantan', memberCount: 2340 },
  { id: '65', code: '65', name: 'Kalimantan Utara', island: 'Kalimantan', memberCount: 620 },
  { id: '71', code: '71', name: 'Sulawesi Utara', island: 'Sulawesi', memberCount: 1420 },
  { id: '72', code: '72', name: 'Sulawesi Tengah', island: 'Sulawesi', memberCount: 1120 },
  { id: '73', code: '73', name: 'Sulawesi Selatan', island: 'Sulawesi', memberCount: 3950 },
  { id: '74', code: '74', name: 'Sulawesi Tenggara', island: 'Sulawesi', memberCount: 1240 },
  { id: '75', code: '75', name: 'Gorontalo', island: 'Sulawesi', memberCount: 680 },
  { id: '76', code: '76', name: 'Sulawesi Barat', island: 'Sulawesi', memberCount: 590 },
  { id: '81', code: '81', name: 'Maluku', island: 'Maluku & Papua', memberCount: 940 },
  { id: '82', code: '82', name: 'Maluku Utara', island: 'Maluku & Papua', memberCount: 820 },
  { id: '91', code: '91', name: 'Papua', island: 'Maluku & Papua', memberCount: 1100 },
  { id: '92', code: '92', name: 'Papua Barat', island: 'Maluku & Papua', memberCount: 860 },
  { id: '93', code: '93', name: 'Papua Selatan', island: 'Maluku & Papua', memberCount: 450 },
  { id: '94', code: '94', name: 'Papua Tengah', island: 'Maluku & Papua', memberCount: 510 },
  { id: '95', code: '95', name: 'Papua Pegunungan', island: 'Maluku & Papua', memberCount: 420 },
  { id: '96', code: '96', name: 'Papua Barat Daya', island: 'Maluku & Papua', memberCount: 780 }
];

export const REGENCIES_DATA: Regency[] = [
  // ==========================================
  // KWARTIR NASIONAL (00)
  // ==========================================
  { id: '00.00', provinceId: '00', code: '00', name: 'Kwartir Nasional (Pusat)', type: 'PUSAT', memberCount: 180 },

  // ==========================================
  // ACEH (11)
  // ==========================================
  { id: '11.01', provinceId: '11', code: '01', name: 'Kabupaten Simeulue', type: 'KABUPATEN', memberCount: 120 },
  { id: '11.02', provinceId: '11', code: '02', name: 'Kabupaten Aceh Singkil', type: 'KABUPATEN', memberCount: 110 },
  { id: '11.03', provinceId: '11', code: '03', name: 'Kabupaten Aceh Selatan', type: 'KABUPATEN', memberCount: 190 },
  { id: '11.04', provinceId: '11', code: '04', name: 'Kabupaten Aceh Tenggara', type: 'KABUPATEN', memberCount: 140 },
  { id: '11.05', provinceId: '11', code: '05', name: 'Kabupaten Aceh Timur', type: 'KABUPATEN', memberCount: 220 },
  { id: '11.06', provinceId: '11', code: '06', name: 'Kabupaten Aceh Tengah', type: 'KABUPATEN', memberCount: 280 },
  { id: '11.07', provinceId: '11', code: '07', name: 'Kabupaten Aceh Barat', type: 'KABUPATEN', memberCount: 210 },
  { id: '11.08', provinceId: '11', code: '08', name: 'Kabupaten Aceh Besar', type: 'KABUPATEN', memberCount: 350 },
  { id: '11.09', provinceId: '11', code: '09', name: 'Kabupaten Pidie', type: 'KABUPATEN', memberCount: 240 },
  { id: '11.10', provinceId: '11', code: '10', name: 'Kabupaten Bireuen', type: 'KABUPATEN', memberCount: 260 },
  { id: '11.11', provinceId: '11', code: '11', name: 'Kabupaten Aceh Utara', type: 'KABUPATEN', memberCount: 290 },
  { id: '11.12', provinceId: '11', code: '12', name: 'Kabupaten Aceh Barat Daya', type: 'KABUPATEN', memberCount: 130 },
  { id: '11.13', provinceId: '11', code: '13', name: 'Kabupaten Gayo Lues', type: 'KABUPATEN', memberCount: 120 },
  { id: '11.14', provinceId: '11', code: '14', name: 'Kabupaten Aceh Tamiang', type: 'KABUPATEN', memberCount: 170 },
  { id: '11.15', provinceId: '11', code: '15', name: 'Kabupaten Nagan Raya', type: 'KABUPATEN', memberCount: 140 },
  { id: '11.16', provinceId: '11', code: '16', name: 'Kabupaten Aceh Jaya', type: 'KABUPATEN', memberCount: 130 },
  { id: '11.17', provinceId: '11', code: '17', name: 'Kabupaten Bener Meriah', type: 'KABUPATEN', memberCount: 160 },
  { id: '11.18', provinceId: '11', code: '18', name: 'Kabupaten Pidie Jaya', type: 'KABUPATEN', memberCount: 110 },
  { id: '11.71', provinceId: '11', code: '71', name: 'Kota Banda Aceh', type: 'KOTA', memberCount: 520 },
  { id: '11.72', provinceId: '11', code: '72', name: 'Kota Sabang', type: 'KOTA', memberCount: 390 },
  { id: '11.73', provinceId: '11', code: '73', name: 'Kota Lhokseumawe', type: 'KOTA', memberCount: 230 },
  { id: '11.74', provinceId: '11', code: '74', name: 'Kota Langsa', type: 'KOTA', memberCount: 180 },
  { id: '11.75', provinceId: '11', code: '75', name: 'Kota Subulussalam', type: 'KOTA', memberCount: 90 },

  // ==========================================
  // SUMATERA UTARA (12)
  // ==========================================
  { id: '12.01', provinceId: '12', code: '01', name: 'Kabupaten Tapanuli Tengah', type: 'KABUPATEN', memberCount: 180 },
  { id: '12.02', provinceId: '12', code: '02', name: 'Kabupaten Tapanuli Utara', type: 'KABUPATEN', memberCount: 190 },
  { id: '12.03', provinceId: '12', code: '03', name: 'Kabupaten Tapanuli Selatan', type: 'KABUPATEN', memberCount: 170 },
  { id: '12.04', provinceId: '12', code: '04', name: 'Kabupaten Nias', type: 'KABUPATEN', memberCount: 140 },
  { id: '12.05', provinceId: '12', code: '05', name: 'Kabupaten Langkat', type: 'KABUPATEN', memberCount: 310 },
  { id: '12.06', provinceId: '12', code: '06', name: 'Kabupaten Karo', type: 'KABUPATEN', memberCount: 420 },
  { id: '12.07', provinceId: '12', code: '07', name: 'Kabupaten Deli Serdang', type: 'KABUPATEN', memberCount: 480 },
  { id: '12.08', provinceId: '12', code: '08', name: 'Kabupaten Simalungun', type: 'KABUPATEN', memberCount: 350 },
  { id: '12.09', provinceId: '12', code: '09', name: 'Kabupaten Asahan', type: 'KABUPATEN', memberCount: 260 },
  { id: '12.10', provinceId: '12', code: '10', name: 'Kabupaten Labuhanbatu', type: 'KABUPATEN', memberCount: 220 },
  { id: '12.11', provinceId: '12', code: '11', name: 'Kabupaten Dairi', type: 'KABUPATEN', memberCount: 160 },
  { id: '12.12', provinceId: '12', code: '12', name: 'Kabupaten Toba', type: 'KABUPATEN', memberCount: 310 },
  { id: '12.13', provinceId: '12', code: '13', name: 'Kabupaten Mandailing Natal', type: 'KABUPATEN', memberCount: 190 },
  { id: '12.14', provinceId: '12', code: '14', name: 'Kabupaten Nias Selatan', type: 'KABUPATEN', memberCount: 170 },
  { id: '12.15', provinceId: '12', code: '15', name: 'Kabupaten Pakpak Bharat', type: 'KABUPATEN', memberCount: 90 },
  { id: '12.16', provinceId: '12', code: '16', name: 'Kabupaten Humbang Hasundutan', type: 'KABUPATEN', memberCount: 180 },
  { id: '12.17', provinceId: '12', code: '17', name: 'Kabupaten Samosir', type: 'KABUPATEN', memberCount: 390 },
  { id: '12.18', provinceId: '12', code: '18', name: 'Kabupaten Serdang Bedagai', type: 'KABUPATEN', memberCount: 210 },
  { id: '12.19', provinceId: '12', code: '19', name: 'Kabupaten Batu Bara', type: 'KABUPATEN', memberCount: 150 },
  { id: '12.71', provinceId: '12', code: '71', name: 'Kota Medan', type: 'KOTA', memberCount: 890 },
  { id: '12.72', provinceId: '12', code: '72', name: 'Kota Pematangsiantar', type: 'KOTA', memberCount: 280 },
  { id: '12.73', provinceId: '12', code: '73', name: 'Kota Sibolga', type: 'KOTA', memberCount: 190 },
  { id: '12.74', provinceId: '12', code: '74', name: 'Kota Tanjungbalai', type: 'KOTA', memberCount: 160 },
  { id: '12.75', provinceId: '12', code: '75', name: 'Kota Binjai', type: 'KOTA', memberCount: 240 },
  { id: '12.76', provinceId: '12', code: '76', name: 'Kota Tebing Tinggi', type: 'KOTA', memberCount: 170 },
  { id: '12.77', provinceId: '12', code: '77', name: 'Kota Padangsidimpuan', type: 'KOTA', memberCount: 180 },
  { id: '12.78', provinceId: '12', code: '78', name: 'Kota Gunungsitoli', type: 'KOTA', memberCount: 140 },

  // ==========================================
  // SUMATERA BARAT (13)
  // ==========================================
  { id: '13.01', provinceId: '13', code: '01', name: 'Kabupaten Kepulauan Mentawai', type: 'KABUPATEN', memberCount: 190 },
  { id: '13.02', provinceId: '13', code: '02', name: 'Kabupaten Pesisir Selatan', type: 'KABUPATEN', memberCount: 240 },
  { id: '13.03', provinceId: '13', code: '03', name: 'Kabupaten Solok', type: 'KABUPATEN', memberCount: 210 },
  { id: '13.04', provinceId: '13', code: '04', name: 'Kabupaten Sijunjung', type: 'KABUPATEN', memberCount: 160 },
  { id: '13.05', provinceId: '13', code: '05', name: 'Kabupaten Tanah Datar', type: 'KABUPATEN', memberCount: 310 },
  { id: '13.06', provinceId: '13', code: '06', name: 'Kabupaten Padang Pariaman', type: 'KABUPATEN', memberCount: 250 },
  { id: '13.07', provinceId: '13', code: '07', name: 'Kabupaten Agam', type: 'KABUPATEN', memberCount: 340 },
  { id: '13.08', provinceId: '13', code: '08', name: 'Kabupaten Lima Puluh Kota', type: 'KABUPATEN', memberCount: 270 },
  { id: '13.09', provinceId: '13', code: '09', name: 'Kabupaten Pasaman', type: 'KABUPATEN', memberCount: 180 },
  { id: '13.10', provinceId: '13', code: '10', name: 'Kabupaten Solok Selatan', type: 'KABUPATEN', memberCount: 150 },
  { id: '13.11', provinceId: '13', code: '11', name: 'Kabupaten Dharmasraya', type: 'KABUPATEN', memberCount: 160 },
  { id: '13.12', provinceId: '13', code: '12', name: 'Kabupaten Pasaman Barat', type: 'KABUPATEN', memberCount: 190 },
  { id: '13.71', provinceId: '13', code: '71', name: 'Kota Padang', type: 'KOTA', memberCount: 650 },
  { id: '13.72', provinceId: '13', code: '72', name: 'Kota Solok', type: 'KOTA', memberCount: 180 },
  { id: '13.73', provinceId: '13', code: '73', name: 'Kota Sawahlunto', type: 'KOTA', memberCount: 260 },
  { id: '13.74', provinceId: '13', code: '74', name: 'Kota Padang Panjang', type: 'KOTA', memberCount: 220 },
  { id: '13.75', provinceId: '13', code: '75', name: 'Kota Bukittinggi', type: 'KOTA', memberCount: 480 },
  { id: '13.76', provinceId: '13', code: '76', name: 'Kota Payakumbuh', type: 'KOTA', memberCount: 230 },
  { id: '13.77', provinceId: '13', code: '77', name: 'Kota Pariaman', type: 'KOTA', memberCount: 210 },

  // ==========================================
  // RIAU (14)
  // ==========================================
  { id: '14.01', provinceId: '14', code: '01', name: 'Kabupaten Kuantan Singingi', type: 'KABUPATEN', memberCount: 160 },
  { id: '14.02', provinceId: '14', code: '02', name: 'Kabupaten Indragiri Hulu', type: 'KABUPATEN', memberCount: 180 },
  { id: '14.03', provinceId: '14', code: '03', name: 'Kabupaten Indragiri Hilir', type: 'KABUPATEN', memberCount: 190 },
  { id: '14.04', provinceId: '14', code: '04', name: 'Kabupaten Pelalawan', type: 'KABUPATEN', memberCount: 210 },
  { id: '14.05', provinceId: '14', code: '05', name: 'Kabupaten Siak', type: 'KABUPATEN', memberCount: 340 },
  { id: '14.06', provinceId: '14', code: '06', name: 'Kabupaten Kampar', type: 'KABUPATEN', memberCount: 280 },
  { id: '14.07', provinceId: '14', code: '07', name: 'Kabupaten Rokan Hulu', type: 'KABUPATEN', memberCount: 170 },
  { id: '14.08', provinceId: '14', code: '08', name: 'Kabupaten Bengkalis', type: 'KABUPATEN', memberCount: 230 },
  { id: '14.09', provinceId: '14', code: '09', name: 'Kabupaten Rokan Hilir', type: 'KABUPATEN', memberCount: 190 },
  { id: '14.10', provinceId: '14', code: '10', name: 'Kabupaten Kepulauan Meranti', type: 'KABUPATEN', memberCount: 140 },
  { id: '14.71', provinceId: '14', code: '71', name: 'Kota Pekanbaru', type: 'KOTA', memberCount: 580 },
  { id: '14.72', provinceId: '14', code: '72', name: 'Kota Dumai', type: 'KOTA', memberCount: 260 },

  // ==========================================
  // JAMBI (15)
  // ==========================================
  { id: '15.01', provinceId: '15', code: '01', name: 'Kabupaten Kerinci', type: 'KABUPATEN', memberCount: 290 },
  { id: '15.02', provinceId: '15', code: '02', name: 'Kabupaten Merangin', type: 'KABUPATEN', memberCount: 180 },
  { id: '15.03', provinceId: '15', code: '03', name: 'Kabupaten Sarolangun', type: 'KABUPATEN', memberCount: 140 },
  { id: '15.04', provinceId: '15', code: '04', name: 'Kabupaten Batanghari', type: 'KABUPATEN', memberCount: 150 },
  { id: '15.05', provinceId: '15', code: '05', name: 'Kabupaten Muaro Jambi', type: 'KABUPATEN', memberCount: 230 },
  { id: '15.06', provinceId: '15', code: '06', name: 'Kabupaten Tanjung Jabung Barat', type: 'KABUPATEN', memberCount: 160 },
  { id: '15.07', provinceId: '15', code: '07', name: 'Kabupaten Tanjung Jabung Timur', type: 'KABUPATEN', memberCount: 140 },
  { id: '15.08', provinceId: '15', code: '08', name: 'Kabupaten Bungo', type: 'KABUPATEN', memberCount: 170 },
  { id: '15.09', provinceId: '15', code: '09', name: 'Kabupaten Tebo', type: 'KABUPATEN', memberCount: 150 },
  { id: '15.71', provinceId: '15', code: '71', name: 'Kota Jambi', type: 'KOTA', memberCount: 460 },
  { id: '15.72', provinceId: '15', code: '72', name: 'Kota Sungai Penuh', type: 'KOTA', memberCount: 210 },

  // ==========================================
  // SUMATERA SELATAN (16)
  // ==========================================
  { id: '16.01', provinceId: '16', code: '01', name: 'Kabupaten Ogan Komering Ulu', type: 'KABUPATEN', memberCount: 190 },
  { id: '16.02', provinceId: '16', code: '02', name: 'Kabupaten Ogan Komering Ilir', type: 'KABUPATEN', memberCount: 220 },
  { id: '16.03', provinceId: '16', code: '03', name: 'Kabupaten Muara Enim', type: 'KABUPATEN', memberCount: 240 },
  { id: '16.04', provinceId: '16', code: '04', name: 'Kabupaten Lahat', type: 'KABUPATEN', memberCount: 250 },
  { id: '16.05', provinceId: '16', code: '05', name: 'Kabupaten Musi Rawas', type: 'KABUPATEN', memberCount: 180 },
  { id: '16.06', provinceId: '16', code: '06', name: 'Kabupaten Musi Banyuasin', type: 'KABUPATEN', memberCount: 210 },
  { id: '16.07', provinceId: '16', code: '07', name: 'Kabupaten Banyuasin', type: 'KABUPATEN', memberCount: 230 },
  { id: '16.08', provinceId: '16', code: '08', name: 'Kabupaten OKU Timur', type: 'KABUPATEN', memberCount: 170 },
  { id: '16.09', provinceId: '16', code: '09', name: 'Kabupaten OKU Selatan', type: 'KABUPATEN', memberCount: 190 },
  { id: '16.10', provinceId: '16', code: '10', name: 'Kabupaten Ogan Ilir', type: 'KABUPATEN', memberCount: 180 },
  { id: '16.11', provinceId: '16', code: '11', name: 'Kabupaten Empat Lawang', type: 'KABUPATEN', memberCount: 130 },
  { id: '16.71', provinceId: '16', code: '71', name: 'Kota Palembang', type: 'KOTA', memberCount: 780 },
  { id: '16.72', provinceId: '16', code: '72', name: 'Kota Prabumulih', type: 'KOTA', memberCount: 190 },
  { id: '16.73', provinceId: '16', code: '73', name: 'Kota Pagar Alam', type: 'KOTA', memberCount: 310 },
  { id: '16.74', provinceId: '16', code: '74', name: 'Kota Lubuklinggau', type: 'KOTA', memberCount: 220 },

  // ==========================================
  // BENGKULU (17)
  // ==========================================
  { id: '17.01', provinceId: '17', code: '01', name: 'Kabupaten Bengkulu Selatan', type: 'KABUPATEN', memberCount: 140 },
  { id: '17.02', provinceId: '17', code: '02', name: 'Kabupaten Rejang Lebong', type: 'KABUPATEN', memberCount: 180 },
  { id: '17.03', provinceId: '17', code: '03', name: 'Kabupaten Bengkulu Utara', type: 'KABUPATEN', memberCount: 170 },
  { id: '17.04', provinceId: '17', code: '04', name: 'Kabupaten Kaur', type: 'KABUPATEN', memberCount: 120 },
  { id: '17.05', provinceId: '17', code: '05', name: 'Kabupaten Seluma', type: 'KABUPATEN', memberCount: 130 },
  { id: '17.06', provinceId: '17', code: '06', name: 'Kabupaten Mukomuko', type: 'KABUPATEN', memberCount: 140 },
  { id: '17.07', provinceId: '17', code: '07', name: 'Kabupaten Lebong', type: 'KABUPATEN', memberCount: 110 },
  { id: '17.08', provinceId: '17', code: '08', name: 'Kabupaten Kepahiang', type: 'KABUPATEN', memberCount: 130 },
  { id: '17.09', provinceId: '17', code: '09', name: 'Kabupaten Bengkulu Tengah', type: 'KABUPATEN', memberCount: 120 },
  { id: '17.71', provinceId: '17', code: '71', name: 'Kota Bengkulu', type: 'KOTA', memberCount: 390 },

  // ==========================================
  // LAMPUNG (18)
  // ==========================================
  { id: '18.01', provinceId: '18', code: '01', name: 'Kabupaten Lampung Barat', type: 'KABUPATEN', memberCount: 220 },
  { id: '18.02', provinceId: '18', code: '02', name: 'Kabupaten Tanggamus', type: 'KABUPATEN', memberCount: 240 },
  { id: '18.03', provinceId: '18', code: '03', name: 'Kabupaten Lampung Selatan', type: 'KABUPATEN', memberCount: 350 },
  { id: '18.04', provinceId: '18', code: '04', name: 'Kabupaten Lampung Timur', type: 'KABUPATEN', memberCount: 260 },
  { id: '18.05', provinceId: '18', code: '05', name: 'Kabupaten Lampung Tengah', type: 'KABUPATEN', memberCount: 280 },
  { id: '18.06', provinceId: '18', code: '06', name: 'Kabupaten Lampung Utara', type: 'KABUPATEN', memberCount: 210 },
  { id: '18.07', provinceId: '18', code: '07', name: 'Kabupaten Way Kanan', type: 'KABUPATEN', memberCount: 170 },
  { id: '18.08', provinceId: '18', code: '08', name: 'Kabupaten Tulang Bawang', type: 'KABUPATEN', memberCount: 190 },
  { id: '18.09', provinceId: '18', code: '09', name: 'Kabupaten Pesawaran', type: 'KABUPATEN', memberCount: 310 },
  { id: '18.10', provinceId: '18', code: '10', name: 'Kabupaten Pringsewu', type: 'KABUPATEN', memberCount: 230 },
  { id: '18.11', provinceId: '18', code: '11', name: 'Kabupaten Mesuji', type: 'KABUPATEN', memberCount: 120 },
  { id: '18.12', provinceId: '18', code: '12', name: 'Kabupaten Tulang Bawang Barat', type: 'KABUPATEN', memberCount: 140 },
  { id: '18.13', provinceId: '18', code: '13', name: 'Kabupaten Pesisir Barat (Krui)', type: 'KABUPATEN', memberCount: 320 },
  { id: '18.71', provinceId: '18', code: '71', name: 'Kota Bandar Lampung', type: 'KOTA', memberCount: 560 },
  { id: '18.72', provinceId: '18', code: '72', name: 'Kota Metro', type: 'KOTA', memberCount: 210 },

  // ==========================================
  // KEPULAUAN BANGKA BELITUNG (19)
  // ==========================================
  { id: '19.01', provinceId: '19', code: '01', name: 'Kabupaten Bangka', type: 'KABUPATEN', memberCount: 190 },
  { id: '19.02', provinceId: '19', code: '02', name: 'Kabupaten Belitung', type: 'KABUPATEN', memberCount: 340 },
  { id: '19.03', provinceId: '19', code: '03', name: 'Kabupaten Bangka Barat', type: 'KABUPATEN', memberCount: 160 },
  { id: '19.04', provinceId: '19', code: '04', name: 'Kabupaten Bangka Tengah', type: 'KABUPATEN', memberCount: 150 },
  { id: '19.05', provinceId: '19', code: '05', name: 'Kabupaten Bangka Selatan', type: 'KABUPATEN', memberCount: 140 },
  { id: '19.06', provinceId: '19', code: '06', name: 'Kabupaten Belitung Timur', type: 'KABUPATEN', memberCount: 230 },
  { id: '19.71', provinceId: '19', code: '71', name: 'Kota Pangkalpinang', type: 'KOTA', memberCount: 290 },

  // ==========================================
  // KEPULAUAN RIAU (21)
  // ==========================================
  { id: '21.01', provinceId: '21', code: '01', name: 'Kabupaten Karimun', type: 'KABUPATEN', memberCount: 210 },
  { id: '21.02', provinceId: '21', code: '02', name: 'Kabupaten Bintan', type: 'KABUPATEN', memberCount: 380 },
  { id: '21.03', provinceId: '21', code: '03', name: 'Kabupaten Natuna', type: 'KABUPATEN', memberCount: 240 },
  { id: '21.04', provinceId: '21', code: '04', name: 'Kabupaten Lingga', type: 'KABUPATEN', memberCount: 160 },
  { id: '21.05', provinceId: '21', code: '05', name: 'Kabupaten Kepulauan Anambas', type: 'KABUPATEN', memberCount: 190 },
  { id: '21.71', provinceId: '21', code: '71', name: 'Kota Batam', type: 'KOTA', memberCount: 680 },
  { id: '21.72', provinceId: '21', code: '72', name: 'Kota Tanjungpinang', type: 'KOTA', memberCount: 350 },

  // ==========================================
  // DKI JAKARTA (31)
  // ==========================================
  { id: '31.01', provinceId: '31', code: '01', name: 'Kabupaten Administrasi Kepulauan Seribu', type: 'KABUPATEN', memberCount: 420 },
  { id: '31.71', provinceId: '31', code: '71', name: 'Kota Administrasi Jakarta Selatan', type: 'KOTA', memberCount: 1420 },
  { id: '31.72', provinceId: '31', code: '72', name: 'Kota Administrasi Jakarta Timur', type: 'KOTA', memberCount: 1350 },
  { id: '31.73', provinceId: '31', code: '73', name: 'Kota Administrasi Jakarta Pusat', type: 'KOTA', memberCount: 980 },
  { id: '31.74', provinceId: '31', code: '74', name: 'Kota Administrasi Jakarta Barat', type: 'KOTA', memberCount: 1140 },
  { id: '31.75', provinceId: '31', code: '75', name: 'Kota Administrasi Jakarta Utara', type: 'KOTA', memberCount: 1020 },

  // ==========================================
  // JAWA BARAT (32)
  // ==========================================
  { id: '32.01', provinceId: '32', code: '01', name: 'Kabupaten Bogor', type: 'KABUPATEN', memberCount: 1450 },
  { id: '32.02', provinceId: '32', code: '02', name: 'Kabupaten Sukabumi', type: 'KABUPATEN', memberCount: 890 },
  { id: '32.03', provinceId: '32', code: '03', name: 'Kabupaten Cianjur', type: 'KABUPATEN', memberCount: 720 },
  { id: '32.04', provinceId: '32', code: '04', name: 'Kabupaten Bandung', type: 'KABUPATEN', memberCount: 1620 },
  { id: '32.05', provinceId: '32', code: '05', name: 'Kabupaten Garut', type: 'KABUPATEN', memberCount: 940 },
  { id: '32.06', provinceId: '32', code: '06', name: 'Kabupaten Tasikmalaya', type: 'KABUPATEN', memberCount: 1180 },
  { id: '32.07', provinceId: '32', code: '07', name: 'Kabupaten Ciamis', type: 'KABUPATEN', memberCount: 710 },
  { id: '32.08', provinceId: '32', code: '08', name: 'Kabupaten Kuningan', type: 'KABUPATEN', memberCount: 650 },
  { id: '32.09', provinceId: '32', code: '09', name: 'Kabupaten Cirebon', type: 'KABUPATEN', memberCount: 780 },
  { id: '32.10', provinceId: '32', code: '10', name: 'Kabupaten Majalengka', type: 'KABUPATEN', memberCount: 620 },
  { id: '32.11', provinceId: '32', code: '11', name: 'Kabupaten Sumedang', type: 'KABUPATEN', memberCount: 590 },
  { id: '32.12', provinceId: '32', code: '12', name: 'Kabupaten Indramayu', type: 'KABUPATEN', memberCount: 540 },
  { id: '32.13', provinceId: '32', code: '13', name: 'Kabupaten Subang', type: 'KABUPATEN', memberCount: 680 },
  { id: '32.14', provinceId: '32', code: '14', name: 'Kabupaten Purwakarta', type: 'KABUPATEN', memberCount: 520 },
  { id: '32.15', provinceId: '32', code: '15', name: 'Kabupaten Karawang', type: 'KABUPATEN', memberCount: 690 },
  { id: '32.16', provinceId: '32', code: '16', name: 'Kabupaten Bekasi', type: 'KABUPATEN', memberCount: 850 },
  { id: '32.17', provinceId: '32', code: '17', name: 'Kabupaten Bandung Barat', type: 'KABUPATEN', memberCount: 960 },
  { id: '32.18', provinceId: '32', code: '18', name: 'Kabupaten Pangandaran', type: 'KABUPATEN', memberCount: 930 },
  { id: '32.71', provinceId: '32', code: '71', name: 'Kota Bogor', type: 'KOTA', memberCount: 840 },
  { id: '32.72', provinceId: '32', code: '72', name: 'Kota Sukabumi', type: 'KOTA', memberCount: 450 },
  { id: '32.73', provinceId: '32', code: '73', name: 'Kota Bandung', type: 'KOTA', memberCount: 1850 },
  { id: '32.74', provinceId: '32', code: '74', name: 'Kota Cirebon', type: 'KOTA', memberCount: 510 },
  { id: '32.75', provinceId: '32', code: '75', name: 'Kota Bekasi', type: 'KOTA', memberCount: 920 },
  { id: '32.76', provinceId: '32', code: '76', name: 'Kota Depok', type: 'KOTA', memberCount: 890 },
  { id: '32.77', provinceId: '32', code: '77', name: 'Kota Cimahi', type: 'KOTA', memberCount: 480 },
  { id: '32.78', provinceId: '32', code: '78', name: 'Kota Tasikmalaya', type: 'KOTA', memberCount: 620 },
  { id: '32.79', provinceId: '32', code: '79', name: 'Kota Banjar', type: 'KOTA', memberCount: 310 },

  // ==========================================
  // JAWA TENGAH (33)
  // ==========================================
  { id: '33.01', provinceId: '33', code: '01', name: 'Kabupaten Cilacap', type: 'KABUPATEN', memberCount: 420 },
  { id: '33.02', provinceId: '33', code: '02', name: 'Kabupaten Banyumas', type: 'KABUPATEN', memberCount: 590 },
  { id: '33.03', provinceId: '33', code: '03', name: 'Kabupaten Purbalingga', type: 'KABUPATEN', memberCount: 310 },
  { id: '33.04', provinceId: '33', code: '04', name: 'Kabupaten Banjarnegara', type: 'KABUPATEN', memberCount: 360 },
  { id: '33.05', provinceId: '33', code: '05', name: 'Kabupaten Kebumen', type: 'KABUPATEN', memberCount: 290 },
  { id: '33.06', provinceId: '33', code: '06', name: 'Kabupaten Purworejo', type: 'KABUPATEN', memberCount: 270 },
  { id: '33.07', provinceId: '33', code: '07', name: 'Kabupaten Wonosobo (Dieng)', type: 'KABUPATEN', memberCount: 540 },
  { id: '33.08', provinceId: '33', code: '08', name: 'Kabupaten Magelang (Borobudur)', type: 'KABUPATEN', memberCount: 880 },
  { id: '33.09', provinceId: '33', code: '09', name: 'Kabupaten Boyolali', type: 'KABUPATEN', memberCount: 340 },
  { id: '33.10', provinceId: '33', code: '10', name: 'Kabupaten Klaten (Prambanan)', type: 'KABUPATEN', memberCount: 460 },
  { id: '33.11', provinceId: '33', code: '11', name: 'Kabupaten Sukoharjo', type: 'KABUPATEN', memberCount: 310 },
  { id: '33.12', provinceId: '33', code: '12', name: 'Kabupaten Wonogiri', type: 'KABUPATEN', memberCount: 280 },
  { id: '33.13', provinceId: '33', code: '13', name: 'Kabupaten Karanganyar', type: 'KABUPATEN', memberCount: 490 },
  { id: '33.14', provinceId: '33', code: '14', name: 'Kabupaten Sragen', type: 'KABUPATEN', memberCount: 240 },
  { id: '33.15', provinceId: '33', code: '15', name: 'Kabupaten Grobogan', type: 'KABUPATEN', memberCount: 220 },
  { id: '33.16', provinceId: '33', code: '16', name: 'Kabupaten Blora', type: 'KABUPATEN', memberCount: 210 },
  { id: '33.17', provinceId: '33', code: '17', name: 'Kabupaten Rembang', type: 'KABUPATEN', memberCount: 230 },
  { id: '33.18', provinceId: '33', code: '18', name: 'Kabupaten Pati', type: 'KABUPATEN', memberCount: 270 },
  { id: '33.19', provinceId: '33', code: '19', name: 'Kabupaten Kudus', type: 'KABUPATEN', memberCount: 330 },
  { id: '33.20', provinceId: '33', code: '20', name: 'Kabupaten Jepara (Karimunjawa)', type: 'KABUPATEN', memberCount: 520 },
  { id: '33.21', provinceId: '33', code: '21', name: 'Kabupaten Demak', type: 'KABUPATEN', memberCount: 280 },
  { id: '33.22', provinceId: '33', code: '22', name: 'Kabupaten Semarang', type: 'KABUPATEN', memberCount: 410 },
  { id: '33.23', provinceId: '33', code: '23', name: 'Kabupaten Temanggung', type: 'KABUPATEN', memberCount: 290 },
  { id: '33.24', provinceId: '33', code: '24', name: 'Kabupaten Kendal', type: 'KABUPATEN', memberCount: 260 },
  { id: '33.25', provinceId: '33', code: '25', name: 'Kabupaten Batang', type: 'KABUPATEN', memberCount: 250 },
  { id: '33.26', provinceId: '33', code: '26', name: 'Kabupaten Pekalongan', type: 'KABUPATEN', memberCount: 310 },
  { id: '33.27', provinceId: '33', code: '27', name: 'Kabupaten Pemalang', type: 'KABUPATEN', memberCount: 240 },
  { id: '33.28', provinceId: '33', code: '28', name: 'Kabupaten Tegal', type: 'KABUPATEN', memberCount: 320 },
  { id: '33.29', provinceId: '33', code: '29', name: 'Kabupaten Brebes', type: 'KABUPATEN', memberCount: 290 },
  { id: '33.71', provinceId: '33', code: '71', name: 'Kota Magelang', type: 'KOTA', memberCount: 310 },
  { id: '33.72', provinceId: '33', code: '72', name: 'Kota Surakarta (Solo)', type: 'KOTA', memberCount: 680 },
  { id: '33.73', provinceId: '33', code: '73', name: 'Kota Salatiga', type: 'KOTA', memberCount: 290 },
  { id: '33.74', provinceId: '33', code: '74', name: 'Kota Semarang', type: 'KOTA', memberCount: 890 },
  { id: '33.75', provinceId: '33', code: '75', name: 'Kota Pekalongan', type: 'KOTA', memberCount: 340 },
  { id: '33.76', provinceId: '33', code: '76', name: 'Kota Tegal', type: 'KOTA', memberCount: 260 },

  // ==========================================
  // DI YOGYAKARTA (34)
  // ==========================================
  { id: '34.01', provinceId: '34', code: '01', name: 'Kabupaten Kulon Progo', type: 'KABUPATEN', memberCount: 460 },
  { id: '34.02', provinceId: '34', code: '02', name: 'Kabupaten Bantul', type: 'KABUPATEN', memberCount: 780 },
  { id: '34.03', provinceId: '34', code: '03', name: 'Kabupaten Gunungkidul', type: 'KABUPATEN', memberCount: 840 },
  { id: '34.04', provinceId: '34', code: '04', name: 'Kabupaten Sleman', type: 'KABUPATEN', memberCount: 1200 },
  { id: '34.71', provinceId: '34', code: '71', name: 'Kota Yogyakarta', type: 'KOTA', memberCount: 1450 },

  // ==========================================
  // JAWA TIMUR (35)
  // ==========================================
  { id: '35.01', provinceId: '35', code: '01', name: 'Kabupaten Pacitan', type: 'KABUPATEN', memberCount: 310 },
  { id: '35.02', provinceId: '35', code: '02', name: 'Kabupaten Ponorogo', type: 'KABUPATEN', memberCount: 280 },
  { id: '35.03', provinceId: '35', code: '03', name: 'Kabupaten Trenggalek', type: 'KABUPATEN', memberCount: 250 },
  { id: '35.04', provinceId: '35', code: '04', name: 'Kabupaten Tulungagung', type: 'KABUPATEN', memberCount: 320 },
  { id: '35.05', provinceId: '35', code: '05', name: 'Kabupaten Blitar', type: 'KABUPATEN', memberCount: 290 },
  { id: '35.06', provinceId: '35', code: '06', name: 'Kabupaten Kediri', type: 'KABUPATEN', memberCount: 360 },
  { id: '35.07', provinceId: '35', code: '07', name: 'Kabupaten Malang', type: 'KABUPATEN', memberCount: 1540 },
  { id: '35.08', provinceId: '35', code: '08', name: 'Kabupaten Lumajang (Bromo)', type: 'KABUPATEN', memberCount: 420 },
  { id: '35.09', provinceId: '35', code: '09', name: 'Kabupaten Jember', type: 'KABUPATEN', memberCount: 480 },
  { id: '35.10', provinceId: '35', code: '10', name: 'Kabupaten Banyuwangi (Ijen)', type: 'KABUPATEN', memberCount: 1320 },
  { id: '35.11', provinceId: '35', code: '11', name: 'Kabupaten Bondowoso', type: 'KABUPATEN', memberCount: 260 },
  { id: '35.12', provinceId: '35', code: '12', name: 'Kabupaten Situbondo', type: 'KABUPATEN', memberCount: 240 },
  { id: '35.13', provinceId: '35', code: '13', name: 'Kabupaten Probolinggo', type: 'KABUPATEN', memberCount: 410 },
  { id: '35.14', provinceId: '35', code: '14', name: 'Kabupaten Pasuruan', type: 'KABUPATEN', memberCount: 390 },
  { id: '35.15', provinceId: '35', code: '15', name: 'Kabupaten Sidoarjo', type: 'KABUPATEN', memberCount: 650 },
  { id: '35.16', provinceId: '35', code: '16', name: 'Kabupaten Mojokerto', type: 'KABUPATEN', memberCount: 480 },
  { id: '35.17', provinceId: '35', code: '17', name: 'Kabupaten Jombang', type: 'KABUPATEN', memberCount: 310 },
  { id: '35.18', provinceId: '35', code: '18', name: 'Kabupaten Nganjuk', type: 'KABUPATEN', memberCount: 280 },
  { id: '35.19', provinceId: '35', code: '19', name: 'Kabupaten Madiun', type: 'KABUPATEN', memberCount: 270 },
  { id: '35.20', provinceId: '35', code: '20', name: 'Kabupaten Magetan', type: 'KABUPATEN', memberCount: 340 },
  { id: '35.21', provinceId: '35', code: '21', name: 'Kabupaten Ngawi', type: 'KABUPATEN', memberCount: 260 },
  { id: '35.22', provinceId: '35', code: '22', name: 'Kabupaten Bojonegoro', type: 'KABUPATEN', memberCount: 280 },
  { id: '35.23', provinceId: '35', code: '23', name: 'Kabupaten Tuban', type: 'KABUPATEN', memberCount: 310 },
  { id: '35.24', provinceId: '35', code: '24', name: 'Kabupaten Lamongan', type: 'KABUPATEN', memberCount: 330 },
  { id: '35.25', provinceId: '35', code: '25', name: 'Kabupaten Gresik', type: 'KABUPATEN', memberCount: 390 },
  { id: '35.26', provinceId: '35', code: '26', name: 'Kabupaten Bangkalan', type: 'KABUPATEN', memberCount: 240 },
  { id: '35.27', provinceId: '35', code: '27', name: 'Kabupaten Sampang', type: 'KABUPATEN', memberCount: 210 },
  { id: '35.28', provinceId: '35', code: '28', name: 'Kabupaten Pamekasan', type: 'KABUPATEN', memberCount: 230 },
  { id: '35.29', provinceId: '35', code: '29', name: 'Kabupaten Sumenep', type: 'KABUPATEN', memberCount: 310 },
  { id: '35.71', provinceId: '35', code: '71', name: 'Kota Kediri', type: 'KOTA', memberCount: 320 },
  { id: '35.72', provinceId: '35', code: '72', name: 'Kota Blitar', type: 'KOTA', memberCount: 260 },
  { id: '35.73', provinceId: '35', code: '73', name: 'Kota Malang', type: 'KOTA', memberCount: 920 },
  { id: '35.74', provinceId: '35', code: '74', name: 'Kota Probolinggo', type: 'KOTA', memberCount: 270 },
  { id: '35.75', provinceId: '35', code: '75', name: 'Kota Pasuruan', type: 'KOTA', memberCount: 250 },
  { id: '35.76', provinceId: '35', code: '76', name: 'Kota Mojokerto', type: 'KOTA', memberCount: 280 },
  { id: '35.77', provinceId: '35', code: '77', name: 'Kota Madiun', type: 'KOTA', memberCount: 310 },
  { id: '35.78', provinceId: '35', code: '78', name: 'Kota Surabaya', type: 'KOTA', memberCount: 2100 },
  { id: '35.79', provinceId: '35', code: '79', name: 'Kota Batu', type: 'KOTA', memberCount: 680 },

  // ==========================================
  // BANTEN (36)
  // ==========================================
  { id: '36.01', provinceId: '36', code: '01', name: 'Kabupaten Pandeglang (Ujung Kulon)', type: 'KABUPATEN', memberCount: 420 },
  { id: '36.02', provinceId: '36', code: '02', name: 'Kabupaten Lebak (Baduy)', type: 'KABUPATEN', memberCount: 460 },
  { id: '36.03', provinceId: '36', code: '03', name: 'Kabupaten Tangerang', type: 'KABUPATEN', memberCount: 680 },
  { id: '36.04', provinceId: '36', code: '04', name: 'Kabupaten Serang', type: 'KABUPATEN', memberCount: 430 },
  { id: '36.71', provinceId: '36', code: '71', name: 'Kota Tangerang', type: 'KOTA', memberCount: 620 },
  { id: '36.72', provinceId: '36', code: '72', name: 'Kota Cilegon', type: 'KOTA', memberCount: 310 },
  { id: '36.73', provinceId: '36', code: '73', name: 'Kota Serang', type: 'KOTA', memberCount: 410 },
  { id: '36.74', provinceId: '36', code: '74', name: 'Kota Tangerang Selatan', type: 'KOTA', memberCount: 770 },

  // ==========================================
  // BALI (51)
  // ==========================================
  { id: '51.01', provinceId: '51', code: '01', name: 'Kabupaten Jembrana', type: 'KABUPATEN', memberCount: 280 },
  { id: '51.02', provinceId: '51', code: '02', name: 'Kabupaten Tabanan', type: 'KABUPATEN', memberCount: 480 },
  { id: '51.03', provinceId: '51', code: '03', name: 'Kabupaten Badung', type: 'KABUPATEN', memberCount: 1250 },
  { id: '51.04', provinceId: '51', code: '04', name: 'Kabupaten Gianyar (Ubud)', type: 'KABUPATEN', memberCount: 980 },
  { id: '51.05', provinceId: '51', code: '05', name: 'Kabupaten Klungkung (Nusa Penida)', type: 'KABUPATEN', memberCount: 540 },
  { id: '51.06', provinceId: '51', code: '06', name: 'Kabupaten Bangli (Kintamani)', type: 'KABUPATEN', memberCount: 420 },
  { id: '51.07', provinceId: '51', code: '07', name: 'Kabupaten Karangasem', type: 'KABUPATEN', memberCount: 390 },
  { id: '51.08', provinceId: '51', code: '08', name: 'Kabupaten Buleleng', type: 'KABUPATEN', memberCount: 460 },
  { id: '51.71', provinceId: '51', code: '71', name: 'Kota Denpasar', type: 'KOTA', memberCount: 1650 },

  // ==========================================
  // NUSA TENGGARA BARAT (52)
  // ==========================================
  { id: '52.01', provinceId: '52', code: '01', name: 'Kabupaten Lombok Barat (Senggigi)', type: 'KABUPATEN', memberCount: 420 },
  { id: '52.02', provinceId: '52', code: '02', name: 'Kabupaten Lombok Tengah (Mandalika)', type: 'KABUPATEN', memberCount: 580 },
  { id: '52.03', provinceId: '52', code: '03', name: 'Kabupaten Lombok Timur', type: 'KABUPATEN', memberCount: 310 },
  { id: '52.04', provinceId: '52', code: '04', name: 'Kabupaten Sumbawa', type: 'KABUPATEN', memberCount: 260 },
  { id: '52.05', provinceId: '52', code: '05', name: 'Kabupaten Dompu', type: 'KABUPATEN', memberCount: 190 },
  { id: '52.06', provinceId: '52', code: '06', name: 'Kabupaten Bima', type: 'KABUPATEN', memberCount: 210 },
  { id: '52.07', provinceId: '52', code: '07', name: 'Kabupaten Sumbawa Barat', type: 'KABUPATEN', memberCount: 180 },
  { id: '52.08', provinceId: '52', code: '08', name: 'Kabupaten Lombok Utara (Gili Trawangan)', type: 'KABUPATEN', memberCount: 490 },
  { id: '52.71', provinceId: '52', code: '71', name: 'Kota Mataram', type: 'KOTA', memberCount: 430 },
  { id: '52.72', provinceId: '52', code: '72', name: 'Kota Bima', type: 'KOTA', memberCount: 210 },

  // ==========================================
  // NUSA TENGGARA TIMUR (53)
  // ==========================================
  { id: '53.01', provinceId: '53', code: '01', name: 'Kabupaten Sumba Barat', type: 'KABUPATEN', memberCount: 190 },
  { id: '53.02', provinceId: '53', code: '02', name: 'Kabupaten Sumba Timur', type: 'KABUPATEN', memberCount: 240 },
  { id: '53.03', provinceId: '53', code: '03', name: 'Kabupaten Kupang', type: 'KABUPATEN', memberCount: 210 },
  { id: '53.04', provinceId: '53', code: '04', name: 'Kabupaten Timor Tengah Selatan', type: 'KABUPATEN', memberCount: 180 },
  { id: '53.05', provinceId: '53', code: '05', name: 'Kabupaten Timor Tengah Utara', type: 'KABUPATEN', memberCount: 160 },
  { id: '53.06', provinceId: '53', code: '06', name: 'Kabupaten Belu', type: 'KABUPATEN', memberCount: 170 },
  { id: '53.07', provinceId: '53', code: '07', name: 'Kabupaten Alor', type: 'KABUPATEN', memberCount: 220 },
  { id: '53.08', provinceId: '53', code: '08', name: 'Kabupaten Lembata', type: 'KABUPATEN', memberCount: 150 },
  { id: '53.09', provinceId: '53', code: '09', name: 'Kabupaten Flores Timur', type: 'KABUPATEN', memberCount: 190 },
  { id: '53.10', provinceId: '53', code: '10', name: 'Kabupaten Sikka (Maumere)', type: 'KABUPATEN', memberCount: 230 },
  { id: '53.11', provinceId: '53', code: '11', name: 'Kabupaten Ende (Kelimutu)', type: 'KABUPATEN', memberCount: 310 },
  { id: '53.12', provinceId: '53', code: '12', name: 'Kabupaten Ngada (Bajawa)', type: 'KABUPATEN', memberCount: 240 },
  { id: '53.13', provinceId: '53', code: '13', name: 'Kabupaten Manggarai', type: 'KABUPATEN', memberCount: 220 },
  { id: '53.14', provinceId: '53', code: '14', name: 'Kabupaten Rote Ndao', type: 'KABUPATEN', memberCount: 180 },
  { id: '53.15', provinceId: '53', code: '15', name: 'Kabupaten Manggarai Barat (Labuan Bajo)', type: 'KABUPATEN', memberCount: 680 },
  { id: '53.71', provinceId: '53', code: '71', name: 'Kota Kupang', type: 'KOTA', memberCount: 460 },

  // ==========================================
  // KALIMANTAN BARAT (61)
  // ==========================================
  { id: '61.01', provinceId: '61', code: '01', name: 'Kabupaten Sambas', type: 'KABUPATEN', memberCount: 210 },
  { id: '61.02', provinceId: '61', code: '02', name: 'Kabupaten Bengkayang', type: 'KABUPATEN', memberCount: 170 },
  { id: '61.03', provinceId: '61', code: '03', name: 'Kabupaten Landak', type: 'KABUPATEN', memberCount: 180 },
  { id: '61.04', provinceId: '61', code: '04', name: 'Kabupaten Mempawah', type: 'KABUPATEN', memberCount: 190 },
  { id: '61.05', provinceId: '61', code: '05', name: 'Kabupaten Sanggau', type: 'KABUPATEN', memberCount: 220 },
  { id: '61.06', provinceId: '61', code: '06', name: 'Kabupaten Ketapang', type: 'KABUPATEN', memberCount: 240 },
  { id: '61.07', provinceId: '61', code: '07', name: 'Kabupaten Sintang', type: 'KABUPATEN', memberCount: 210 },
  { id: '61.08', provinceId: '61', code: '08', name: 'Kabupaten Kapuas Hulu', type: 'KABUPATEN', memberCount: 260 },
  { id: '61.71', provinceId: '61', code: '71', name: 'Kota Pontianak', type: 'KOTA', memberCount: 520 },
  { id: '61.72', provinceId: '61', code: '72', name: 'Kota Singkawang', type: 'KOTA', memberCount: 410 },

  // ==========================================
  // KALIMANTAN TENGAH (62)
  // ==========================================
  { id: '62.01', provinceId: '62', code: '01', name: 'Kabupaten Kotawaringin Barat (Tanjung Puting)', type: 'KABUPATEN', memberCount: 380 },
  { id: '62.02', provinceId: '62', code: '02', name: 'Kabupaten Kotawaringin Timur', type: 'KABUPATEN', memberCount: 230 },
  { id: '62.03', provinceId: '62', code: '03', name: 'Kabupaten Kapuas', type: 'KABUPATEN', memberCount: 190 },
  { id: '62.04', provinceId: '62', code: '04', name: 'Kabupaten Barito Selatan', type: 'KABUPATEN', memberCount: 140 },
  { id: '62.05', provinceId: '62', code: '05', name: 'Kabupaten Barito Utara', type: 'KABUPATEN', memberCount: 160 },
  { id: '62.71', provinceId: '62', code: '71', name: 'Kota Palangka Raya', type: 'KOTA', memberCount: 480 },

  // ==========================================
  // KALIMANTAN SELATAN (63)
  // ==========================================
  { id: '63.01', provinceId: '63', code: '01', name: 'Kabupaten Tanah Laut', type: 'KABUPATEN', memberCount: 210 },
  { id: '63.02', provinceId: '63', code: '02', name: 'Kabupaten Kotabaru', type: 'KABUPATEN', memberCount: 260 },
  { id: '63.03', provinceId: '63', code: '03', name: 'Kabupaten Banjar (Martapura)', type: 'KABUPATEN', memberCount: 340 },
  { id: '63.04', provinceId: '63', code: '04', name: 'Kabupaten Barito Kuala', type: 'KABUPATEN', memberCount: 180 },
  { id: '63.71', provinceId: '63', code: '71', name: 'Kota Banjarmasin', type: 'KOTA', memberCount: 560 },
  { id: '63.72', provinceId: '63', code: '72', name: 'Kota Banjarbaru', type: 'KOTA', memberCount: 390 },

  // ==========================================
  // KALIMANTAN TIMUR (64)
  // ==========================================
  { id: '64.01', provinceId: '64', code: '01', name: 'Kabupaten Paser', type: 'KABUPATEN', memberCount: 190 },
  { id: '64.02', provinceId: '64', code: '02', name: 'Kabupaten Kutai Barat', type: 'KABUPATEN', memberCount: 210 },
  { id: '64.03', provinceId: '64', code: '03', name: 'Kabupaten Berau (Derawan)', type: 'KABUPATEN', memberCount: 680 },
  { id: '64.04', provinceId: '64', code: '04', name: 'Kabupaten Kutai Kartanegara', type: 'KABUPATEN', memberCount: 420 },
  { id: '64.05', provinceId: '64', code: '05', name: 'Kabupaten Kutai Timur', type: 'KABUPATEN', memberCount: 260 },
  { id: '64.09', provinceId: '64', code: '09', name: 'Kabupaten Penajam Paser Utara (IKN)', type: 'KABUPATEN', memberCount: 380 },
  { id: '64.71', provinceId: '64', code: '71', name: 'Kota Balikpapan', type: 'KOTA', memberCount: 920 },
  { id: '64.72', provinceId: '64', code: '72', name: 'Kota Samarinda', type: 'KOTA', memberCount: 780 },
  { id: '64.74', provinceId: '64', code: '74', name: 'Kota Bontang', type: 'KOTA', memberCount: 290 },

  // ==========================================
  // KALIMANTAN UTARA (65)
  // ==========================================
  { id: '65.01', provinceId: '65', code: '01', name: 'Kabupaten Bulungan', type: 'KABUPATEN', memberCount: 170 },
  { id: '65.02', provinceId: '65', code: '02', name: 'Kabupaten Malinau', type: 'KABUPATEN', memberCount: 160 },
  { id: '65.03', provinceId: '65', code: '03', name: 'Kabupaten Nunukan', type: 'KABUPATEN', memberCount: 210 },
  { id: '65.04', provinceId: '65', code: '04', name: 'Kabupaten Tana Tidung', type: 'KABUPATEN', memberCount: 90 },
  { id: '65.71', provinceId: '65', code: '71', name: 'Kota Tarakan', type: 'KOTA', memberCount: 320 },

  // ==========================================
  // SULAWESI UTARA (71)
  // ==========================================
  { id: '71.01', provinceId: '71', code: '01', name: 'Kabupaten Bolaang Mongondow', type: 'KABUPATEN', memberCount: 180 },
  { id: '71.02', provinceId: '71', code: '02', name: 'Kabupaten Minahasa', type: 'KABUPATEN', memberCount: 280 },
  { id: '71.03', provinceId: '71', code: '03', name: 'Kabupaten Kepulauan Sangihe', type: 'KABUPATEN', memberCount: 190 },
  { id: '71.04', provinceId: '71', code: '04', name: 'Kabupaten Kepulauan Talaud', type: 'KABUPATEN', memberCount: 140 },
  { id: '71.05', provinceId: '71', code: '05', name: 'Kabupaten Minahasa Selatan', type: 'KABUPATEN', memberCount: 170 },
  { id: '71.06', provinceId: '71', code: '06', name: 'Kabupaten Minahasa Utara (Likupang)', type: 'KABUPATEN', memberCount: 390 },
  { id: '71.71', provinceId: '71', code: '71', name: 'Kota Manado (Bunaken)', type: 'KOTA', memberCount: 680 },
  { id: '71.72', provinceId: '71', code: '72', name: 'Kota Bitung', type: 'KOTA', memberCount: 260 },
  { id: '71.73', provinceId: '71', code: '73', name: 'Kota Tomohon', type: 'KOTA', memberCount: 340 },

  // ==========================================
  // SULAWESI TENGAH (72)
  // ==========================================
  { id: '72.01', provinceId: '72', code: '01', name: 'Kabupaten Banggai Kepulauan', type: 'KABUPATEN', memberCount: 160 },
  { id: '72.02', provinceId: '72', code: '02', name: 'Kabupaten Banggai', type: 'KABUPATEN', memberCount: 210 },
  { id: '72.03', provinceId: '72', code: '03', name: 'Kabupaten Morowali', type: 'KABUPATEN', memberCount: 240 },
  { id: '72.04', provinceId: '72', code: '04', name: 'Kabupaten Poso', type: 'KABUPATEN', memberCount: 220 },
  { id: '72.05', provinceId: '72', code: '05', name: 'Kabupaten Donggala', type: 'KABUPATEN', memberCount: 190 },
  { id: '72.06', provinceId: '72', code: '06', name: 'Kabupaten Toli-Toli', type: 'KABUPATEN', memberCount: 160 },
  { id: '72.07', provinceId: '72', code: '07', name: 'Kabupaten Buol', type: 'KABUPATEN', memberCount: 130 },
  { id: '72.08', provinceId: '72', code: '08', name: 'Kabupaten Parigi Moutong', type: 'KABUPATEN', memberCount: 220 },
  { id: '72.09', provinceId: '72', code: '09', name: 'Kabupaten Tojo Una-Una (Togean)', type: 'KABUPATEN', memberCount: 390 },
  { id: '72.71', provinceId: '72', code: '71', name: 'Kota Palu', type: 'KOTA', memberCount: 480 },

  // ==========================================
  // SULAWESI SELATAN (73)
  // ==========================================
  { id: '73.01', provinceId: '73', code: '01', name: 'Kabupaten Kepulauan Selayar (Takabonerate)', type: 'KABUPATEN', memberCount: 340 },
  { id: '73.02', provinceId: '73', code: '02', name: 'Kabupaten Bulukumba (Bira)', type: 'KABUPATEN', memberCount: 420 },
  { id: '73.03', provinceId: '73', code: '03', name: 'Kabupaten Bantaeng', type: 'KABUPATEN', memberCount: 190 },
  { id: '73.04', provinceId: '73', code: '04', name: 'Kabupaten Jeneponto', type: 'KABUPATEN', memberCount: 180 },
  { id: '73.05', provinceId: '73', code: '05', name: 'Kabupaten Takalar', type: 'KABUPATEN', memberCount: 210 },
  { id: '73.06', provinceId: '73', code: '06', name: 'Kabupaten Gowa (Malino)', type: 'KABUPATEN', memberCount: 380 },
  { id: '73.07', provinceId: '73', code: '07', name: 'Kabupaten Sinjai', type: 'KABUPATEN', memberCount: 190 },
  { id: '73.08', provinceId: '73', code: '08', name: 'Kabupaten Maros (Rammang-Rammang)', type: 'KABUPATEN', memberCount: 460 },
  { id: '73.09', provinceId: '73', code: '09', name: 'Kabupaten Pangkajene dan Kepulauan', type: 'KABUPATEN', memberCount: 250 },
  { id: '73.10', provinceId: '73', code: '10', name: 'Kabupaten Barru', type: 'KABUPATEN', memberCount: 180 },
  { id: '73.11', provinceId: '73', code: '11', name: 'Kabupaten Bone', type: 'KABUPATEN', memberCount: 290 },
  { id: '73.12', provinceId: '73', code: '12', name: 'Kabupaten Soppeng', type: 'KABUPATEN', memberCount: 190 },
  { id: '73.13', provinceId: '73', code: '13', name: 'Kabupaten Wajo', type: 'KABUPATEN', memberCount: 220 },
  { id: '73.14', provinceId: '73', code: '14', name: 'Kabupaten Sidenreng Rappang', type: 'KABUPATEN', memberCount: 210 },
  { id: '73.15', provinceId: '73', code: '15', name: 'Kabupaten Pinrang', type: 'KABUPATEN', memberCount: 220 },
  { id: '73.16', provinceId: '73', code: '16', name: 'Kabupaten Enrekang', type: 'KABUPATEN', memberCount: 240 },
  { id: '73.17', provinceId: '73', code: '17', name: 'Kabupaten Luwu', type: 'KABUPATEN', memberCount: 230 },
  { id: '73.18', provinceId: '73', code: '18', name: 'Kabupaten Tana Toraja', type: 'KABUPATEN', memberCount: 890 },
  { id: '73.22', provinceId: '73', code: '22', name: 'Kabupaten Luwu Utara', type: 'KABUPATEN', memberCount: 210 },
  { id: '73.24', provinceId: '73', code: '24', name: 'Kabupaten Luwu Timur', type: 'KABUPATEN', memberCount: 230 },
  { id: '73.26', provinceId: '73', code: '26', name: 'Kabupaten Toraja Utara', type: 'KABUPATEN', memberCount: 650 },
  { id: '73.71', provinceId: '73', code: '71', name: 'Kota Makassar', type: 'KOTA', memberCount: 1750 },
  { id: '73.72', provinceId: '73', code: '72', name: 'Kota Parepare', type: 'KOTA', memberCount: 310 },
  { id: '73.73', provinceId: '73', code: '73', name: 'Kota Palopo', type: 'KOTA', memberCount: 280 },

  // ==========================================
  // SULAWESI TENGGARA (74)
  // ==========================================
  { id: '74.01', provinceId: '74', code: '01', name: 'Kabupaten Buton', type: 'KABUPATEN', memberCount: 220 },
  { id: '74.02', provinceId: '74', code: '02', name: 'Kabupaten Muna', type: 'KABUPATEN', memberCount: 190 },
  { id: '74.03', provinceId: '74', code: '03', name: 'Kabupaten Konawe', type: 'KABUPATEN', memberCount: 210 },
  { id: '74.04', provinceId: '74', code: '04', name: 'Kabupaten Kolaka', type: 'KABUPATEN', memberCount: 230 },
  { id: '74.05', provinceId: '74', code: '05', name: 'Kabupaten Konawe Selatan', type: 'KABUPATEN', memberCount: 190 },
  { id: '74.06', provinceId: '74', code: '06', name: 'Kabupaten Bombana', type: 'KABUPATEN', memberCount: 170 },
  { id: '74.07', provinceId: '74', code: '07', name: 'Kabupaten Wakatobi', type: 'KABUPATEN', memberCount: 620 },
  { id: '74.71', provinceId: '74', code: '71', name: 'Kota Kendari', type: 'KOTA', memberCount: 480 },
  { id: '74.72', provinceId: '74', code: '72', name: 'Kota Baubau', type: 'KOTA', memberCount: 390 },

  // ==========================================
  // GORONTALO (75)
  // ==========================================
  { id: '75.01', provinceId: '75', code: '01', name: 'Kabupaten Boalemo', type: 'KABUPATEN', memberCount: 140 },
  { id: '75.02', provinceId: '75', code: '02', name: 'Kabupaten Gorontalo', type: 'KABUPATEN', memberCount: 220 },
  { id: '75.03', provinceId: '75', code: '03', name: 'Kabupaten Pohuwato', type: 'KABUPATEN', memberCount: 160 },
  { id: '75.04', provinceId: '75', code: '04', name: 'Kabupaten Bone Bolango', type: 'KABUPATEN', memberCount: 190 },
  { id: '75.71', provinceId: '75', code: '71', name: 'Kota Gorontalo', type: 'KOTA', memberCount: 340 },

  // ==========================================
  // SULAWESI BARAT (76)
  // ==========================================
  { id: '76.01', provinceId: '76', code: '01', name: 'Kabupaten Pasangkayu', type: 'KABUPATEN', memberCount: 130 },
  { id: '76.02', provinceId: '76', code: '02', name: 'Kabupaten Mamuju', type: 'KABUPATEN', memberCount: 240 },
  { id: '76.03', provinceId: '76', code: '03', name: 'Kabupaten Mamasa', type: 'KABUPATEN', memberCount: 190 },
  { id: '76.04', provinceId: '76', code: '04', name: 'Kabupaten Polewali Mandar', type: 'KABUPATEN', memberCount: 250 },
  { id: '76.05', provinceId: '76', code: '05', name: 'Kabupaten Majene', type: 'KABUPATEN', memberCount: 180 },

  // ==========================================
  // MALUKU (81)
  // ==========================================
  { id: '81.01', provinceId: '81', code: '01', name: 'Kabupaten Maluku Tengah (Banda Neira)', type: 'KABUPATEN', memberCount: 480 },
  { id: '81.02', provinceId: '81', code: '02', name: 'Kabupaten Maluku Tenggara (Kei Islands)', type: 'KABUPATEN', memberCount: 390 },
  { id: '81.03', provinceId: '81', code: '03', name: 'Kabupaten Kepulauan Tanimbar', type: 'KABUPATEN', memberCount: 160 },
  { id: '81.04', provinceId: '81', code: '04', name: 'Kabupaten Buru', type: 'KABUPATEN', memberCount: 170 },
  { id: '81.05', provinceId: '81', code: '05', name: 'Kabupaten Seram Bagian Timur', type: 'KABUPATEN', memberCount: 150 },
  { id: '81.06', provinceId: '81', code: '06', name: 'Kabupaten Seram Bagian Barat', type: 'KABUPATEN', memberCount: 160 },
  { id: '81.07', provinceId: '81', code: '07', name: 'Kabupaten Kepulauan Aru', type: 'KABUPATEN', memberCount: 140 },
  { id: '81.71', provinceId: '81', code: '71', name: 'Kota Ambon', type: 'KOTA', memberCount: 580 },
  { id: '81.72', provinceId: '81', code: '72', name: 'Kota Tual', type: 'KOTA', memberCount: 230 },

  // ==========================================
  // MALUKU UTARA (82)
  // ==========================================
  { id: '82.01', provinceId: '82', code: '01', name: 'Kabupaten Halmahera Barat', type: 'KABUPATEN', memberCount: 160 },
  { id: '82.02', provinceId: '82', code: '02', name: 'Kabupaten Halmahera Tengah', type: 'KABUPATEN', memberCount: 180 },
  { id: '82.03', provinceId: '82', code: '03', name: 'Kabupaten Kepulauan Sula', type: 'KABUPATEN', memberCount: 140 },
  { id: '82.04', provinceId: '82', code: '04', name: 'Kabupaten Halmahera Selatan', type: 'KABUPATEN', memberCount: 210 },
  { id: '82.05', provinceId: '82', code: '05', name: 'Kabupaten Halmahera Utara', type: 'KABUPATEN', memberCount: 190 },
  { id: '82.08', provinceId: '82', code: '08', name: 'Kabupaten Pulau Morotai', type: 'KABUPATEN', memberCount: 380 },
  { id: '82.71', provinceId: '82', code: '71', name: 'Kota Ternate', type: 'KOTA', memberCount: 460 },
  { id: '82.72', provinceId: '82', code: '72', name: 'Kota Tidore Kepulauan', type: 'KOTA', memberCount: 320 },

  // ==========================================
  // PAPUA (91)
  // ==========================================
  { id: '91.03', provinceId: '91', code: '03', name: 'Kabupaten Jayapura', type: 'KABUPATEN', memberCount: 340 },
  { id: '91.05', provinceId: '91', code: '05', name: 'Kabupaten Kepulauan Yapen', type: 'KABUPATEN', memberCount: 180 },
  { id: '91.06', provinceId: '91', code: '06', name: 'Kabupaten Biak Numfor', type: 'KABUPATEN', memberCount: 290 },
  { id: '91.71', provinceId: '91', code: '71', name: 'Kota Jayapura', type: 'KOTA', memberCount: 560 },

  // ==========================================
  // PAPUA BARAT (92)
  // ==========================================
  { id: '92.01', provinceId: '92', code: '01', name: 'Kabupaten Fakfak', type: 'KABUPATEN', memberCount: 210 },
  { id: '92.02', provinceId: '92', code: '02', name: 'Kabupaten Kaimana', type: 'KABUPATEN', memberCount: 240 },
  { id: '92.03', provinceId: '92', code: '03', name: 'Kabupaten Teluk Wondama', type: 'KABUPATEN', memberCount: 160 },
  { id: '92.04', provinceId: '92', code: '04', name: 'Kabupaten Teluk Bintuni', type: 'KABUPATEN', memberCount: 180 },
  { id: '92.05', provinceId: '92', code: '05', name: 'Kabupaten Manokwari', type: 'KABUPATEN', memberCount: 390 },

  // ==========================================
  // PAPUA SELATAN (93)
  // ==========================================
  { id: '93.01', provinceId: '93', code: '01', name: 'Kabupaten Merauke', type: 'KABUPATEN', memberCount: 340 },
  { id: '93.02', provinceId: '93', code: '02', name: 'Kabupaten Boven Digoel', type: 'KABUPATEN', memberCount: 140 },
  { id: '93.03', provinceId: '93', code: '03', name: 'Kabupaten Mappi', type: 'KABUPATEN', memberCount: 130 },
  { id: '93.04', provinceId: '93', code: '04', name: 'Kabupaten Asmat', type: 'KABUPATEN', memberCount: 220 },

  // ==========================================
  // PAPUA TENGAH (94)
  // ==========================================
  { id: '94.01', provinceId: '94', code: '01', name: 'Kabupaten Nabire', type: 'KABUPATEN', memberCount: 260 },
  { id: '94.04', provinceId: '94', code: '04', name: 'Kabupaten Mimika (Timika)', type: 'KABUPATEN', memberCount: 380 },

  // ==========================================
  // PAPUA PEGUNUNGAN (95)
  // ==========================================
  { id: '95.01', provinceId: '95', code: '01', name: 'Kabupaten Jayawijaya (Wamena)', type: 'KABUPATEN', memberCount: 360 },

  // ==========================================
  // PAPUA BARAT DAYA (96)
  // ==========================================
  { id: '96.01', provinceId: '96', code: '01', name: 'Kabupaten Sorong', type: 'KABUPATEN', memberCount: 280 },
  { id: '96.04', provinceId: '96', code: '04', name: 'Kabupaten Raja Ampat', type: 'KABUPATEN', memberCount: 680 },
  { id: '96.71', provinceId: '96', code: '71', name: 'Kota Sorong', type: 'KOTA', memberCount: 520 }
];

export const DISTRICTS_DATA: District[] = Object.keys(ALL_INDONESIA_DISTRICTS_MAP).flatMap(regId => 
  ALL_INDONESIA_DISTRICTS_MAP[regId].map(d => ({
    id: `${regId}.${d.code}`,
    regencyId: regId,
    code: d.code,
    name: d.name
  }))
);

export const BRANCHES_DATA: Branch[] = [
  {
    id: 'branch-00-00-00',
    districtId: '00.00.00',
    regencyId: '00.00',
    provinceId: '00',
    code: '00',
    name: 'Pimpinan Saka Pariwisata Tingkat Nasional',
    address: 'Kwartir Nasional Gerakan Pramuka, Jl. Medan Merdeka Timur No.6, Gambir, Jakarta Pusat',
    contactPerson: 'Pimpinan Saka Nasional',
    phone: '021-3507647'
  },
  {
    id: 'branch-32-06-36',
    districtId: '32.06.36',
    regencyId: '32.06',
    provinceId: '32',
    code: '01',
    name: 'Saka Pariwisata Kwarran Ciawi',
    address: 'Jl. Raya Ciawi No. 45, Tasikmalaya Utara',
    contactPerson: 'Kak Hendra Purnama, S.Par.',
    phone: '0812-3456-7890'
  },
  {
    id: 'branch-32-01-24',
    districtId: '32.01.24',
    regencyId: '32.01',
    provinceId: '32',
    code: '01',
    name: 'Saka Pariwisata Kwarran Cisarua',
    address: 'Jl. Raya Puncak KM 78, Bogor',
    contactPerson: 'Kak Ridwan Hakim',
    phone: '0813-9876-5432'
  },
  {
    id: 'branch-32-73-02',
    districtId: '32.73.02',
    regencyId: '32.73',
    provinceId: '32',
    code: '01',
    name: 'Saka Pariwisata Kwarran Coblong',
    address: 'Jl. Ir. H. Juanda No. 120, Bandung',
    contactPerson: 'Kak Nanda Pradita, M.Sc.',
    phone: '0821-4433-2211'
  },
  {
    id: 'branch-51-71-01',
    districtId: '51.71.01',
    regencyId: '51.71',
    provinceId: '51',
    code: '01',
    name: 'Saka Pariwisata Kwarran Denpasar Selatan',
    address: 'Jl. Hang Tuah No. 18, Sanur, Denpasar',
    contactPerson: 'Kak I Wayan Sudarsana',
    phone: '0819-8765-4321'
  },
  {
    id: 'branch-35-10-24',
    districtId: '35.10.24',
    regencyId: '35.10',
    provinceId: '35',
    code: '01',
    name: 'Saka Pariwisata Kwarran Licin Ijen',
    address: 'Jl. Raya Kawah Ijen, Banyuwangi',
    contactPerson: 'Kak Bagus Triyanto',
    phone: '0852-3344-5566'
  },
  {
    id: 'branch-64-03-05',
    districtId: '64.03.05',
    regencyId: '64.03',
    provinceId: '64',
    code: '01',
    name: 'Saka Pariwisata Kwarran Kepulauan Derawan',
    address: 'Pulau Derawan, Kab. Berau, Kaltim',
    contactPerson: 'Kak Muhammad Syahrizal',
    phone: '0812-5566-7788'
  },
  {
    id: 'branch-96-04-11',
    districtId: '96.04.11',
    regencyId: '96.04',
    provinceId: '96',
    code: '01',
    name: 'Saka Pariwisata Kwarran Raja Ampat (Meos Mansar)',
    address: 'Waisai - Meos Mansar, Raja Ampat',
    contactPerson: 'Kak Agustinus Mandacan',
    phone: '0821-9988-7766'
  }
];

export { getDistrictsForRegency };
