import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  Layers,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  Filter,
  MapPin,
  Globe,
  Award,
  Search,
  ListOrdered,
  PieChart as PieChartIcon,
  Compass,
  Building2,
  ChevronDown
} from 'lucide-react';
import { Member, Province } from '../../types';
import { PROVINCES_DATA } from '../../data/indonesiaTerritories';

export interface DashboardWidgetProps {
  members: Member[];
  className?: string;
  title?: string;
  subtitle?: string;
  showSummaryCards?: boolean;
  isSuperAdmin?: boolean;
  defaultViewMode?: ViewMode;
}

export type ViewMode = 'cumulative' | 'monthly' | 'status_breakdown' | 'province_distribution';
type TimeRange = 'ALL' | '12M' | '6M' | 'YEARS';
type ProvinceChartType = 'BAR_TOTAL' | 'BAR_KRIDA' | 'ISLAND_SUMMARY' | 'RANKED_TABLE';
type ProvinceScopeFilter = 'TOP_5' | 'TOP_10' | 'ALL_ACTIVE' | 'ALL_38';

interface MonthDataPoint {
  period: string; // e.g. "Jan 2026" or "2024"
  label: string;
  rawDate: Date;
  newRegistrations: number;
  activeCount: number;
  pendingCount: number;
  cumulativeTotal: number;
}

interface ProvinceDataPoint {
  provinceId: string;
  provinceName: string;
  shortName: string;
  island: string;
  total: number;
  active: number;
  pending: number;
  pemandu: number;
  penyuluh: number;
  mice: number;
  kuliner: number;
  sharePct: number;
  topKrida: string;
  topKridaCount: number;
}

interface IslandDataPoint {
  island: string;
  total: number;
  active: number;
  pending: number;
  provinceCount: number;
  provincesWithMembers: number;
  sharePct: number;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  members = [],
  className = '',
  title = 'Pertumbuhan & Distribusi Keanggotaan Saka Pariwisata',
  subtitle = 'Visualisasi tren pendaftaran berkala dan persebaran kader lintas Kwarda se-Indonesia',
  showSummaryCards = true,
  isSuperAdmin = true,
  defaultViewMode = 'cumulative'
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [timeRange, setTimeRange] = useState<TimeRange>('12M');
  const [selectedKrida, setSelectedKrida] = useState<string>('ALL');

  // Province Breakdown Specific States
  const [provinceChartType, setProvinceChartType] = useState<ProvinceChartType>('BAR_TOTAL');
  const [provinceScope, setProvinceScope] = useState<ProvinceScopeFilter>('TOP_10');
  const [selectedIsland, setSelectedIsland] = useState<string>('ALL');
  const [provinceSearchQuery, setProvinceSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'total' | 'active' | 'pending' | 'name'>('total');

  // Filter members by selected Krida if any
  const filteredMembers = useMemo(() => {
    if (selectedKrida === 'ALL') return members;
    return members.filter(m => m.krida === selectedKrida);
  }, [members, selectedKrida]);

  // Aggregate membership growth data over time
  const chartData = useMemo(() => {
    if (!filteredMembers || filteredMembers.length === 0) {
      const now = new Date();
      const baseline: MonthDataPoint[] = [];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
      
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = months[d.getMonth()];
        const year = d.getFullYear();
        baseline.push({
          period: `${monthName} ${year}`,
          label: `${monthName} '${String(year).slice(2)}`,
          rawDate: d,
          newRegistrations: 0,
          activeCount: 0,
          pendingCount: 0,
          cumulativeTotal: 0
        });
      }
      return baseline;
    }

    const sorted = [...filteredMembers].map(m => {
      let regDate: Date;
      if (m.registeredAt) {
        const parsed = new Date(m.registeredAt);
        regDate = isNaN(parsed.getTime()) ? new Date(m.joinYear || 2024, 0, 1) : parsed;
      } else if (m.joinYear) {
        regDate = new Date(m.joinYear, 0, 1);
      } else {
        regDate = new Date();
      }
      return { ...m, parsedDate: regDate };
    }).sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    const monthMap = new Map<string, {
      period: string;
      label: string;
      rawDate: Date;
      newRegistrations: number;
      activeCount: number;
      pendingCount: number;
    }>();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

    if (timeRange === 'YEARS') {
      const yearMap = new Map<string, {
        period: string;
        label: string;
        rawDate: Date;
        newRegistrations: number;
        activeCount: number;
        pendingCount: number;
      }>();

      sorted.forEach(m => {
        const y = String(m.parsedDate.getFullYear());
        if (!yearMap.has(y)) {
          yearMap.set(y, {
            period: `Tahun ${y}`,
            label: y,
            rawDate: new Date(m.parsedDate.getFullYear(), 0, 1),
            newRegistrations: 0,
            activeCount: 0,
            pendingCount: 0
          });
        }
        const bucket = yearMap.get(y)!;
        bucket.newRegistrations += 1;
        if (m.status === 'ACTIVE') bucket.activeCount += 1;
        if (m.status === 'PENDING') bucket.pendingCount += 1;
      });

      const sortedYears = Array.from(yearMap.values()).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
      let runningTotal = 0;
      return sortedYears.map(item => {
        runningTotal += item.newRegistrations;
        return {
          ...item,
          cumulativeTotal: runningTotal
        };
      });
    }

    const now = new Date();
    let startMonthOffset = 11;
    if (timeRange === '6M') startMonthOffset = 5;
    if (timeRange === 'ALL') startMonthOffset = 23;

    for (let i = startMonthOffset; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = monthNames[d.getMonth()];
      const yearShort = String(d.getFullYear()).slice(2);
      
      monthMap.set(key, {
        period: `${monthLabel} ${d.getFullYear()}`,
        label: `${monthLabel} '${yearShort}`,
        rawDate: d,
        newRegistrations: 0,
        activeCount: 0,
        pendingCount: 0
      });
    }

    sorted.forEach(m => {
      const d = m.parsedDate;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap.has(key)) {
        const bucket = monthMap.get(key)!;
        bucket.newRegistrations += 1;
        if (m.status === 'ACTIVE') bucket.activeCount += 1;
        if (m.status === 'PENDING') bucket.pendingCount += 1;
      } else {
        if (timeRange === 'ALL') {
          const monthLabel = monthNames[d.getMonth()];
          const yearShort = String(d.getFullYear()).slice(2);
          monthMap.set(key, {
            period: `${monthLabel} ${d.getFullYear()}`,
            label: `${monthLabel} '${yearShort}`,
            rawDate: new Date(d.getFullYear(), d.getMonth(), 1),
            newRegistrations: 1,
            activeCount: m.status === 'ACTIVE' ? 1 : 0,
            pendingCount: m.status === 'PENDING' ? 1 : 0
          });
        }
      }
    });

    const sortedBuckets = Array.from(monthMap.values()).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());
    let cumulative = 0;
    
    const firstBucketDate = sortedBuckets[0]?.rawDate;
    if (firstBucketDate) {
      const priorCount = sorted.filter(m => m.parsedDate.getTime() < firstBucketDate.getTime()).length;
      cumulative = priorCount;
    }

    return sortedBuckets.map(b => {
      cumulative += b.newRegistrations;
      return {
        ...b,
        cumulativeTotal: cumulative
      };
    });
  }, [filteredMembers, timeRange]);

  // =========================================================================
  // PROVINCE DISTRIBUTION AGGREGATION ENGINE
  // =========================================================================
  const { 
    allProvincesData, 
    filteredProvincesData, 
    islandSummaryData, 
    topProvince, 
    provincesCountWithData,
    islandCountWithData 
  } = useMemo(() => {
    const totalM = filteredMembers.length || 1;
    const map = new Map<string, {
      provinceId: string;
      provinceName: string;
      shortName: string;
      island: string;
      total: number;
      active: number;
      pending: number;
      pemandu: number;
      penyuluh: number;
      mice: number;
      kuliner: number;
    }>();

    // Initialize map from PROVINCES_DATA (all 38 provinces + Kwarnas)
    PROVINCES_DATA.forEach(p => {
      let short = p.name;
      if (short.startsWith('Provinsi ')) short = short.replace('Provinsi ', '');
      if (short === 'Kepulauan Bangka Belitung') short = 'Babel';
      if (short === 'Kepulauan Riau') short = 'Kep. Riau';
      if (short === 'Nusa Tenggara Barat') short = 'NTB';
      if (short === 'Nusa Tenggara Timur') short = 'NTT';
      if (short === 'Kalimantan Barat') short = 'Kalbar';
      if (short === 'Kalimantan Tengah') short = 'Kalteng';
      if (short === 'Kalimantan Selatan') short = 'Kalsel';
      if (short === 'Kalimantan Timur') short = 'Kaltim';
      if (short === 'Kalimantan Utara') short = 'Kaltara';
      if (short === 'Sulawesi Utara') short = 'Sulut';
      if (short === 'Sulawesi Tengah') short = 'Sulteng';
      if (short === 'Sulawesi Selatan') short = 'Sulsel';
      if (short === 'Sulawesi Tenggara') short = 'Sultra';
      if (short === 'Sulawesi Barat') short = 'Sulbar';
      if (short === 'Papua Barat Daya') short = 'PBD';
      if (short === 'Papua Pegunungan') short = 'P. Pegunungan';
      if (short === 'Papua Selatan') short = 'P. Selatan';
      if (short === 'Papua Tengah') short = 'P. Tengah';
      if (short === 'Papua Barat') short = 'P. Barat';

      map.set(p.id, {
        provinceId: p.id,
        provinceName: p.name,
        shortName: short,
        island: p.island || 'Nusantara',
        total: 0,
        active: 0,
        pending: 0,
        pemandu: 0,
        penyuluh: 0,
        mice: 0,
        kuliner: 0
      });
    });

    // Populate actual members into provincial buckets
    filteredMembers.forEach(m => {
      const pId = m.provinceId || '32';
      let entry = map.get(pId);
      if (!entry) {
        // Try fallback by name matching or create dynamic entry
        const matchedProv = PROVINCES_DATA.find(p => p.name.toLowerCase() === (m.provinceName || '').toLowerCase());
        if (matchedProv) {
          entry = map.get(matchedProv.id);
        }
      }

      if (!entry) {
        entry = {
          provinceId: pId,
          provinceName: m.provinceName || `Provinsi ${pId}`,
          shortName: m.provinceName || `Prov. ${pId}`,
          island: 'Lainnya',
          total: 0,
          active: 0,
          pending: 0,
          pemandu: 0,
          penyuluh: 0,
          mice: 0,
          kuliner: 0
        };
        map.set(pId, entry);
      }

      entry.total += 1;
      if (m.status === 'ACTIVE') entry.active += 1;
      if (m.status === 'PENDING') entry.pending += 1;

      if (m.krida === 'Krida Pemandu') entry.pemandu += 1;
      else if (m.krida === 'Krida Penyuluh') entry.penyuluh += 1;
      else if (m.krida === 'Krida Mice & Event') entry.mice += 1;
      else if (m.krida === 'Krida Kuliner & Cinderamata') entry.kuliner += 1;
    });

    // Transform into enriched ProvinceDataPoint list
    const allList: ProvinceDataPoint[] = Array.from(map.values()).map(p => {
      const share = totalM > 0 ? (p.total / totalM) * 100 : 0;
      
      // Determine dominant krida
      const kridaCounts = [
        { name: 'Pemandu', count: p.pemandu },
        { name: 'Penyuluh', count: p.penyuluh },
        { name: 'Mice & Event', count: p.mice },
        { name: 'Kuliner & Cinderamata', count: p.kuliner }
      ];
      kridaCounts.sort((a, b) => b.count - a.count);
      const topK = kridaCounts[0]?.count > 0 ? kridaCounts[0].name : 'Belum Ada';

      return {
        ...p,
        sharePct: Number(share.toFixed(1)),
        topKrida: topK,
        topKridaCount: kridaCounts[0]?.count || 0
      };
    });

    // Aggregate Island / Regional Summary
    const islandMap = new Map<string, {
      island: string;
      total: number;
      active: number;
      pending: number;
      provinceCount: number;
      provincesWithMembers: number;
    }>();

    allList.forEach(p => {
      const isl = p.island || 'Lainnya';
      if (!islandMap.has(isl)) {
        islandMap.set(isl, {
          island: isl,
          total: 0,
          active: 0,
          pending: 0,
          provinceCount: 0,
          provincesWithMembers: 0
        });
      }
      const item = islandMap.get(isl)!;
      item.provinceCount += 1;
      item.total += p.total;
      item.active += p.active;
      item.pending += p.pending;
      if (p.total > 0) {
        item.provincesWithMembers += 1;
      }
    });

    const islandList: IslandDataPoint[] = Array.from(islandMap.values()).map(isl => ({
      ...isl,
      sharePct: totalM > 0 ? Number(((isl.total / totalM) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.total - a.total);

    // Filter and Sort for Active Visualizations
    let filtered = [...allList];

    // Filter by Island
    if (selectedIsland !== 'ALL') {
      filtered = filtered.filter(p => p.island === selectedIsland);
    }

    // Filter by Search Query
    if (provinceSearchQuery.trim()) {
      const q = provinceSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.provinceName.toLowerCase().includes(q) || 
        p.shortName.toLowerCase().includes(q) ||
        p.island.toLowerCase().includes(q)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'total') return b.total - a.total;
      if (sortBy === 'active') return b.active - a.active;
      if (sortBy === 'pending') return b.pending - a.pending;
      if (sortBy === 'name') return a.provinceName.localeCompare(b.provinceName);
      return b.total - a.total;
    });

    // Scope Limit (Top 5, Top 10, All Active, All 38)
    if (provinceScope === 'TOP_5') {
      filtered = filtered.slice(0, 5);
    } else if (provinceScope === 'TOP_10') {
      filtered = filtered.slice(0, 10);
    } else if (provinceScope === 'ALL_ACTIVE') {
      filtered = filtered.filter(p => p.total > 0);
    }

    // Top Province by Members
    const sortedAll = [...allList].sort((a, b) => b.total - a.total);
    const topP = sortedAll[0]?.total > 0 ? sortedAll[0] : null;
    const activeProvCount = allList.filter(p => p.total > 0).length;
    const activeIslandCount = islandList.filter(i => i.total > 0).length;

    return {
      allProvincesData: allList,
      filteredProvincesData: filtered,
      islandSummaryData: islandList,
      topProvince: topP,
      provincesCountWithData: activeProvCount,
      islandCountWithData: activeIslandCount
    };
  }, [filteredMembers, selectedIsland, provinceSearchQuery, sortBy, provinceScope]);

  // Overall Statistics
  const totalRegistered = filteredMembers.length;
  const totalActive = filteredMembers.filter(m => m.status === 'ACTIVE').length;
  const totalPending = filteredMembers.filter(m => m.status === 'PENDING').length;
  const approvalRate = totalRegistered > 0 ? Math.round((totalActive / totalRegistered) * 100) : 0;

  // Growth in the last active period
  const latestBucket = chartData[chartData.length - 1];
  const prevBucket = chartData[chartData.length - 2];
  const periodGrowth = latestBucket?.newRegistrations ?? 0;
  const growthRatePct = prevBucket && prevBucket.newRegistrations > 0
    ? Math.round(((periodGrowth - prevBucket.newRegistrations) / prevBucket.newRegistrations) * 100)
    : (periodGrowth > 0 ? 100 : 0);

  // Custom Chart Tooltip for Timeline
  const CustomTimelineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: MonthDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-800 shadow-2xl text-xs space-y-2 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-emerald-400 font-heading">{data.period}</span>
            <span className="text-[10px] text-slate-400 font-mono">Periode</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Total Akumulasi:
              </span>
              <span className="font-bold font-mono text-white text-xs">
                {data.cumulativeTotal.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                Pendaftaran Baru:
              </span>
              <span className="font-bold font-mono text-teal-300">
                +{data.newRegistrations}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                Status Aktif:
              </span>
              <span className="font-bold font-mono text-indigo-200">
                {data.activeCount}
              </span>
            </div>

            {data.pendingCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Status Pending:
                </span>
                <span className="font-bold font-mono text-amber-300">
                  {data.pendingCount}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Chart Tooltip for Province Breakdown
  const CustomProvinceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: ProvinceDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-800 shadow-2xl text-xs space-y-2 min-w-[230px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white font-heading">{data.provinceName}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded font-mono">
              {data.island}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total Anggota:</span>
              <span className="font-bold font-mono text-emerald-300 text-xs">
                {data.total.toLocaleString('id-ID')} ({data.sharePct}% Nasional)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Aktif Terverifikasi:
              </span>
              <span className="font-bold font-mono text-emerald-400">
                {data.active}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Calon Pending:
              </span>
              <span className="font-bold font-mono text-amber-300">
                {data.pending}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Komposisi 4 Krida:
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
                <div className="flex items-center justify-between text-teal-300">
                  <span>Pemandu:</span>
                  <span className="font-mono font-bold">{data.pemandu}</span>
                </div>
                <div className="flex items-center justify-between text-indigo-300">
                  <span>Penyuluh:</span>
                  <span className="font-mono font-bold">{data.penyuluh}</span>
                </div>
                <div className="flex items-center justify-between text-purple-300">
                  <span>MICE:</span>
                  <span className="font-mono font-bold">{data.mice}</span>
                </div>
                <div className="flex items-center justify-between text-amber-300">
                  <span>Kuliner:</span>
                  <span className="font-mono font-bold">{data.kuliner}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Chart Tooltip for Island Summary
  const CustomIslandTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: IslandDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl border border-slate-800 shadow-2xl text-xs space-y-2 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-teal-300 font-heading">Wilayah {data.island}</span>
            <span className="text-[10px] text-slate-400 font-mono">{data.sharePct}% Nasional</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total Kader:</span>
              <span className="font-bold font-mono text-white text-xs">{data.total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Kader Aktif:</span>
              <span className="font-bold font-mono text-emerald-400">{data.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Kader Pending:</span>
              <span className="font-bold font-mono text-amber-300">{data.pending}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] text-slate-400">
              <span>Kwarda Terdata:</span>
              <span className="font-bold text-slate-200">{data.provincesWithMembers} dari {data.provinceCount} Prov</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const islandOptions = [
    { value: 'ALL', label: 'Semua Wilayah' },
    { value: 'Jawa', label: 'Pulau Jawa' },
    { value: 'Sumatera', label: 'Sumatera' },
    { value: 'Bali & Nusa Tenggara', label: 'Bali & Nusa Tenggara' },
    { value: 'Kalimantan', label: 'Kalimantan' },
    { value: 'Sulawesi', label: 'Sulawesi' },
    { value: 'Maluku & Papua', label: 'Maluku & Papua' }
  ];

  return (
    <div id="dashboard-widget-container" className={`bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-5 ${className}`}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-bold tracking-wide uppercase">
            {viewMode === 'province_distribution' ? (
              <>
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>Distribusi Spasial Nasional</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>Statistik Dinamis Real-Time</span>
              </>
            )}
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-heading tracking-tight">
            {viewMode === 'province_distribution' ? 'Distribusi Keanggotaan Lintas Provinsi (Kwarda)' : title}
          </h3>
          <p className="text-xs text-slate-500">
            {viewMode === 'province_distribution' 
              ? 'Analisis sebaran pendaftaran anggota berdasarkan wilayah Kwarda, komposisi 4 Krida, dan gugus kepulauan' 
              : subtitle}
          </p>
        </div>

        {/* Primary View Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold text-slate-600">
          <button
            id="tab-view-cumulative"
            type="button"
            onClick={() => setViewMode('cumulative')}
            title="Grafik Tren Akumulasi Total"
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 min-h-[36px] ${
              viewMode === 'cumulative'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tren Akumulasi</span>
          </button>
          
          <button
            id="tab-view-monthly"
            type="button"
            onClick={() => setViewMode('monthly')}
            title="Grafik Pendaftaran Baru per Periode"
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 min-h-[36px] ${
              viewMode === 'monthly'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Pendaftaran</span>
          </button>

          <button
            id="tab-view-status"
            type="button"
            onClick={() => setViewMode('status_breakdown')}
            title="Komposisi Status Aktif vs Pending"
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 min-h-[36px] ${
              viewMode === 'status_breakdown'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Status Kader</span>
          </button>

          {/* TAB DISTRIBUSI PROVINSI / KWARDA (SUPER ADMIN FOCUS) */}
          <button
            id="tab-view-provinces"
            type="button"
            onClick={() => setViewMode('province_distribution')}
            title="Sebaran Anggota per Provinsi / Kwarda Se-Indonesia"
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 min-h-[36px] relative ${
              viewMode === 'province_distribution'
                ? 'bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-sm font-bold ring-2 ring-emerald-400/40'
                : 'text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-300/60'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Distribusi Provinsi</span>
            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-900/80 text-emerald-200 rounded font-mono font-bold">
              38 Prov
            </span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      {showSummaryCards && viewMode !== 'province_distribution' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Kader */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Total Terdata</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-extrabold font-heading text-slate-900">
                {totalRegistered.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-slate-500">Anggota</span>
            </div>
          </div>

          {/* Kader Aktif */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Status Aktif</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-extrabold font-heading text-indigo-950">
                {totalActive.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 font-mono">
                {approvalRate}%
              </span>
            </div>
          </div>

          {/* Menunggu Verifikasi */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Menunggu Review</span>
              <div className="w-7 h-7 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-extrabold font-heading text-amber-900">
                {totalPending.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] text-amber-700">Calon</span>
            </div>
          </div>

          {/* Tren Terkini */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-bold">Pertumbuhan Periode</span>
              <div className="w-7 h-7 rounded-lg bg-teal-100/70 text-teal-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-extrabold font-heading text-teal-950">
                +{periodGrowth}
              </span>
              <span className="text-[10px] font-bold text-teal-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                {growthRatePct}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY STAT CARDS KHUSUS PROVINCE DISTRIBUTION */}
      {showSummaryCards && viewMode === 'province_distribution' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Kwarda Terdata */}
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/70">
            <div className="flex items-center justify-between text-emerald-800">
              <span className="text-[11px] font-bold">Kwarda Terdata</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold font-heading text-emerald-950">
                {provincesCountWithData}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">/ 38 Provinsi</span>
            </div>
            <p className="text-[10px] text-emerald-600 mt-0.5">Cakupan registrasi pangkalan</p>
          </div>

          {/* Top Province */}
          <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-200/70">
            <div className="flex items-center justify-between text-indigo-800">
              <span className="text-[11px] font-bold">Kwarda Terbesar</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-200 text-indigo-800 flex items-center justify-center">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 truncate">
              <span className="text-base sm:text-lg font-extrabold font-heading text-indigo-950 block truncate">
                {topProvince ? topProvince.shortName : '-'}
              </span>
              <span className="text-[11px] font-bold text-indigo-600 font-mono">
                {topProvince ? `${topProvince.total} Anggota (${topProvince.sharePct}%)` : '0'}
              </span>
            </div>
          </div>

          {/* Gugus Kepulauan Aktif */}
          <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200/70">
            <div className="flex items-center justify-between text-teal-800">
              <span className="text-[11px] font-bold">Wilayah Kepulauan</span>
              <div className="w-7 h-7 rounded-lg bg-teal-200 text-teal-800 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold font-heading text-teal-950">
                {islandCountWithData}
              </span>
              <span className="text-[11px] text-teal-700 font-medium">/ 6 Gugus Wilayah</span>
            </div>
            <p className="text-[10px] text-teal-600 mt-0.5">Sabang hingga Merauke</p>
          </div>

          {/* Rata-rata Anggota / Prov */}
          <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/70">
            <div className="flex items-center justify-between text-purple-800">
              <span className="text-[11px] font-bold">Rata-rata per Kwarda</span>
              <div className="w-7 h-7 rounded-lg bg-purple-200 text-purple-800 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold font-heading text-purple-950">
                {provincesCountWithData > 0 ? (totalRegistered / provincesCountWithData).toFixed(1) : 0}
              </span>
              <span className="text-[11px] text-purple-700 font-medium">Kader / Kwarda</span>
            </div>
            <p className="text-[10px] text-purple-600 mt-0.5">Kepadatan kader aktif terdata</p>
          </div>
        </div>
      )}

      {/* =====================================================================
          RENDER GRAFIK MODE 1: TIMELINE (Akumulasi / Pendaftaran / Status)
          ===================================================================== */}
      {viewMode !== 'province_distribution' && (
        <div className="space-y-4">
          {/* Time Range & Krida Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Rentang Waktu:</span>
              <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setTimeRange('6M')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    timeRange === '6M' ? 'bg-emerald-700 text-white font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  6 Bln
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('12M')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    timeRange === '12M' ? 'bg-emerald-700 text-white font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  12 Bln
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('YEARS')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    timeRange === 'YEARS' ? 'bg-emerald-700 text-white font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Tahunan
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] ${
                    timeRange === 'ALL' ? 'bg-emerald-700 text-white font-bold' : 'hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
              </div>
            </div>

            {/* Filter Krida */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Krida:</span>
              <select
                value={selectedKrida}
                onChange={(e) => setSelectedKrida(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
              >
                <option value="ALL">Semua Krida (4 Krida)</option>
                <option value="Krida Pemandu">Krida Pemandu</option>
                <option value="Krida Penyuluh">Krida Penyuluh</option>
                <option value="Krida Mice & Event">Krida Mice & Event</option>
                <option value="Krida Kuliner & Cinderamata">Krida Kuliner & Cinderamata</option>
              </select>
            </div>
          </div>

          {/* Main Recharts Visualization Canvas */}
          <div className="w-full h-64 sm:h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'cumulative' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTimelineTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} 
                  />
                  <Area
                    type="monotone"
                    name="Total Akumulasi Anggota"
                    dataKey="cumulativeTotal"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#growthGradient)"
                    activeDot={{ r: 6, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    name="Anggota Aktif Terverifikasi"
                    dataKey="activeCount"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#activeGradient)"
                  />
                </AreaChart>
              ) : viewMode === 'monthly' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTimelineTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} 
                  />
                  <Bar
                    name="Pendaftaran Baru"
                    dataKey="newRegistrations"
                    fill="#0d9488"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTimelineTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right" 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} 
                  />
                  <Bar
                    name="Aktif (Disetujui)"
                    dataKey="activeCount"
                    stackId="status"
                    fill="#10b981"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    name="Menunggu Verifikasi (Pending)"
                    dataKey="pendingCount"
                    stackId="status"
                    fill="#f59e0b"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* =====================================================================
          RENDER GRAFIK MODE 2: DISTRIBUSI PROVINSI / KWARDA (BREAKDOWN CHART)
          ===================================================================== */}
      {viewMode === 'province_distribution' && (
        <div className="space-y-4">
          {/* Sub-Controls Toolbar: Chart Type, Scope, Island, and Search */}
          <div className="bg-slate-50/90 rounded-2xl p-3 sm:p-4 border border-slate-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              {/* Display Format Buttons */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  id="btn-prov-chart-total"
                  type="button"
                  onClick={() => setProvinceChartType('BAR_TOTAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    provinceChartType === 'BAR_TOTAL'
                      ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Total & Status</span>
                </button>

                <button
                  id="btn-prov-chart-krida"
                  type="button"
                  onClick={() => setProvinceChartType('BAR_KRIDA')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    provinceChartType === 'BAR_KRIDA'
                      ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Komposisi 4 Krida</span>
                </button>

                <button
                  id="btn-prov-chart-island"
                  type="button"
                  onClick={() => setProvinceChartType('ISLAND_SUMMARY')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    provinceChartType === 'ISLAND_SUMMARY'
                      ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Gugus Kepulauan</span>
                </button>

                <button
                  id="btn-prov-chart-table"
                  type="button"
                  onClick={() => setProvinceChartType('RANKED_TABLE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    provinceChartType === 'RANKED_TABLE'
                      ? 'bg-emerald-700 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Tabel Peringkat</span>
                </button>
              </div>

              {/* Scope Selector */}
              {provinceChartType !== 'ISLAND_SUMMARY' && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-slate-500 hidden sm:inline">Tampilkan:</span>
                  <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs">
                    {(['TOP_5', 'TOP_10', 'ALL_ACTIVE', 'ALL_38'] as ProvinceScopeFilter[]).map((scope) => (
                      <button
                        key={scope}
                        type="button"
                        onClick={() => setProvinceScope(scope)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          provinceScope === scope
                            ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {scope === 'TOP_5' && 'Top 5'}
                        {scope === 'TOP_10' && 'Top 10'}
                        {scope === 'ALL_ACTIVE' && 'Kwarda Aktif'}
                        {scope === 'ALL_38' && 'Semua 38'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Second Row: Island Filter, Sorting & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-200/60">
              <div className="flex flex-wrap items-center gap-2">
                {/* Island Filter Dropdown */}
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedIsland}
                    onChange={(e) => setSelectedIsland(e.target.value)}
                    className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
                  >
                    {islandOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By Dropdown */}
                {provinceChartType !== 'ISLAND_SUMMARY' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Urut:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="total">Total Terbanyak</option>
                      <option value="active">Aktif Terbanyak</option>
                      <option value="pending">Pending Terbanyak</option>
                      <option value="name">Nama Kwarda (A-Z)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Search Filter */}
              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari provinsi / pulau..."
                  value={provinceSearchQuery}
                  onChange={(e) => setProvinceSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 shadow-2xs placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* MAIN PROVINCE RECHARTS VISUALIZATION AREA */}
          <div className="w-full min-h-[300px] pt-1">
            {/* SUB-VIEW A: BAR TOTAL & STATUS (Aktif vs Pending per Kwarda) */}
            {provinceChartType === 'BAR_TOTAL' && (
              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredProvincesData}
                    margin={{ top: 10, right: 15, left: -15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      height={45}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomProvinceTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }} 
                    />
                    <Bar
                      name="Aktif (Terverifikasi)"
                      dataKey="active"
                      stackId="provStatus"
                      fill="#059669"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      name="Menunggu Verifikasi"
                      dataKey="pending"
                      stackId="provStatus"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* SUB-VIEW B: BAR KRIDA BREAKDOWN (Komposisi 4 Krida per Provinsi) */}
            {provinceChartType === 'BAR_KRIDA' && (
              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={filteredProvincesData}
                    margin={{ top: 10, right: 15, left: -15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="shortName"
                      tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                      angle={-25}
                      textAnchor="end"
                      interval={0}
                      height={45}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomProvinceTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }} 
                    />
                    <Bar
                      name="Krida Pemandu"
                      dataKey="pemandu"
                      stackId="provKrida"
                      fill="#0d9488"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      name="Krida Penyuluh"
                      dataKey="penyuluh"
                      stackId="provKrida"
                      fill="#4f46e5"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      name="Krida Mice & Event"
                      dataKey="mice"
                      stackId="provKrida"
                      fill="#9333ea"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      name="Krida Kuliner & Cinderamata"
                      dataKey="kuliner"
                      stackId="provKrida"
                      fill="#ea580c"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* SUB-VIEW C: ISLAND / REGIONAL SUMMARY */}
            {provinceChartType === 'ISLAND_SUMMARY' && (
              <div className="w-full h-80 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={islandSummaryData}
                    margin={{ top: 10, right: 15, left: -15, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="island"
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomIslandTooltip />} />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', paddingBottom: '12px' }} 
                    />
                    <Bar
                      name="Kader Aktif"
                      dataKey="active"
                      stackId="islandStatus"
                      fill="#059669"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      name="Kader Pending"
                      dataKey="pending"
                      stackId="islandStatus"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* SUB-VIEW D: RANKED TABLE LEADERBOARD */}
            {provinceChartType === 'RANKED_TABLE' && (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-3.5 text-center w-12">No</th>
                      <th className="py-3 px-3.5">Kwartir Daerah (Provinsi)</th>
                      <th className="py-3 px-3.5">Wilayah Pulau</th>
                      <th className="py-3 px-3.5 text-right">Total Anggota</th>
                      <th className="py-3 px-3.5 text-right">Aktif</th>
                      <th className="py-3 px-3.5 text-right">Pending</th>
                      <th className="py-3 px-3.5">Pangsa Nasional</th>
                      <th className="py-3 px-3.5">Krida Terbanyak</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProvincesData.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                          Tidak ada data provinsi yang sesuai dengan filter pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredProvincesData.map((item, idx) => (
                        <tr key={item.provinceId} className="hover:bg-emerald-50/40 transition-colors">
                          <td className="py-2.5 px-3.5 text-center font-bold font-mono text-slate-600">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3.5 font-bold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span>{item.provinceName}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 text-slate-600">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium">
                              {item.island}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-extrabold text-slate-900">
                            {item.total.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-bold text-emerald-600">
                            {item.active}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-bold text-amber-600">
                            {item.pending}
                          </td>
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-600 rounded-full" 
                                  style={{ width: `${Math.min(100, item.sharePct * 2)}%` }} 
                                />
                              </div>
                              <span className="font-mono text-[11px] font-bold text-slate-700">
                                {item.sharePct}%
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              item.topKrida === 'Pemandu' ? 'bg-teal-100 text-teal-800' :
                              item.topKrida === 'Penyuluh' ? 'bg-indigo-100 text-indigo-800' :
                              item.topKrida === 'Mice & Event' ? 'bg-purple-100 text-purple-800' :
                              item.topKrida === 'Kuliner & Cinderamata' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {item.topKrida} {item.topKridaCount > 0 && `(${item.topKridaCount})`}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Notes & Dynamic Insights */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            {viewMode === 'province_distribution'
              ? 'Menampilkan distribusi anggota berbasis kode Kwarda/Provinsi yang terdaftar di database nasional.'
              : 'Data disinkronkan secara real-time dengan database keanggotaan & spreadsheet.'}
          </span>
        </div>
        <div className="font-medium text-slate-600 flex items-center gap-2">
          {viewMode === 'province_distribution' ? (
            <span>
              Total Kwarda Aktif: <strong className="text-slate-900 font-bold">{provincesCountWithData} dari 38 Kwarda</strong>
            </span>
          ) : (
            <span>
              Rata-rata registrasi: <strong className="text-slate-900">{chartData.length > 0 ? (totalRegistered / chartData.length).toFixed(1) : 0}</strong> /periode
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

