import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Eye,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Mail,
  Phone,
  MapPin,
  IdCard,
  Stethoscope,
  Image as ImageIcon,
  Layers,
  History,
  Play,
  Inbox,
  ChevronDown,
} from 'lucide-react';
import { useStudyStore } from '@/stores/studyStore';
import type { Study, StudyStatus, Modality } from '@/types';
import { cn } from '@/lib/utils';

const BODY_PARTS = ['全部', '胸部', '头部', '腹部', '脊柱', '膝关节'];
const MODALITIES = ['全部', 'CT', 'MR', 'DR', 'US'];
const STATUS_TABS = [
  { key: 'all', label: '全部', color: 'slate' },
  { key: 'pending', label: '待阅', color: 'amber' },
  { key: 'reporting', label: '阅片中', color: 'blue' },
  { key: 'reported', label: '已报告', color: 'purple' },
  { key: 'audited', label: '已审核', color: 'green' },
] as const;

type StatusTabKey = typeof STATUS_TABS[number]['key'];

const MODALITY_DISPLAY: Record<string, string> = {
  CT: 'CT',
  MRI: 'MR',
  'X-Ray': 'DR',
  Ultrasound: 'US',
};

const STATUS_CONFIG: Record<StudyStatus | 'all', { label: string; className: string; dot: string }> = {
  all: { label: '全部', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200', dot: 'bg-slate-500' },
  pending: { label: '待阅', className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  reporting: { label: '阅片中', className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  reviewing: { label: '审核中', className: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
  reported: { label: '已报告', className: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800', dot: 'bg-cyan-500' },
  approved: { label: '已审核', className: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800', dot: 'bg-green-500' },
  audited: { label: '已审核', className: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 border border-green-200 dark:border-green-800', dot: 'bg-green-500' },
  consulting: { label: '会诊中', className: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border border-violet-200 dark:border-violet-800', dot: 'bg-violet-500' },
};

type SortKey = 'accessionNumber' | 'patientName' | 'createdAt' | 'bodyPart' | 'modality';
type SortDirection = 'asc' | 'desc';

interface SortState {
  key: SortKey | null;
  direction: SortDirection;
}

export default function StudyListPage() {
  const { studies, setFilters, updateStudyStatus } = useStudyStore();

  const [searchText, setSearchText] = useState('');
  const [bodyPartFilter, setBodyPartFilter] = useState('全部');
  const [modalityFilter, setModalityFilter] = useState('全部');
  const [statusTab, setStatusTab] = useState<StatusTabKey>('all');
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortState, setSortState] = useState<SortState>({ key: null, direction: 'asc' });

  const stats = useMemo(() => {
    const today = new Date(2025, 5, 9).toISOString().split('T')[0];
    const todayStudies = studies.filter((s) => s.studyDate === today);
    return {
      todayPending: todayStudies.filter((s) => s.status === 'pending').length,
      todayRead: todayStudies.filter((s) => s.status !== 'pending').length,
      reviewPending: studies.filter((s) => s.status === 'reported' || s.status === 'reviewing').length,
      overdue: Math.floor(studies.length * 0.08),
    };
  }, [studies]);

  const filteredStudies = useMemo(() => {
    let result = [...studies];

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.patientName.toLowerCase().includes(q) ||
          s.patientId.toLowerCase().includes(q) ||
          (s.accessionNumber?.toLowerCase().includes(q) ?? false)
      );
    }

    if (bodyPartFilter !== '全部') {
      result = result.filter((s) => s.bodyPart === bodyPartFilter);
    }

    if (modalityFilter !== '全部') {
      result = result.filter((s) => MODALITY_DISPLAY[s.modality] === modalityFilter);
    }

    if (statusTab !== 'all') {
      if (statusTab === 'audited') {
        result = result.filter((s) => s.status === 'approved' || s.status === 'audited');
      } else if (statusTab === 'reported') {
        result = result.filter((s) => s.status === 'reported');
      } else {
        result = result.filter((s) => s.status === statusTab);
      }
    }

    if (dateRange[0] && dateRange[1]) {
      result = result.filter((s) => s.studyDate >= dateRange[0] && s.studyDate <= dateRange[1]);
    }

    if (sortState.key) {
      result.sort((a, b) => {
        const av = a[sortState.key!] ?? '';
        const bv = b[sortState.key!] ?? '';
        if (av < bv) return sortState.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortState.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [studies, searchText, bodyPartFilter, modalityFilter, statusTab, dateRange, sortState]);

  const totalPages = Math.max(1, Math.ceil(filteredStudies.length / pageSize));
  const paginatedStudies = filteredStudies.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const selectedStudy = useMemo(
    () => studies.find((s) => s.id === selectedStudyId) || null,
    [studies, selectedStudyId]
  );

  const handleSort = (key: SortKey) => {
    setSortState((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortState.key !== columnKey) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    }
    return sortState.direction === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-medical-600" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-medical-600" />
    );
  };

  const openDrawer = (study: Study) => {
    setSelectedStudyId(study.id);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedStudyId(null), 300);
  };

  const handleReceive = (id: string) => {
    updateStudyStatus(id, 'reporting');
  };

  const handleView = (id: string) => {
    updateStudyStatus(id, 'reporting');
    openDrawer(studies.find((s) => s.id === id)!);
  };

  const handleReport = (id: string) => {
    updateStudyStatus(id, 'reported');
  };

  const ModalityBadge = ({ modality }: { modality: Modality }) => {
    const display = MODALITY_DISPLAY[modality] || modality;
    const colors: Record<string, string> = {
      CT: 'bg-medical-50 text-medical-700 border-medical-200 dark:bg-medical-950/40 dark:text-medical-400 dark:border-medical-800',
      MR: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800',
      DR: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800',
      US: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800',
    };
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border',
        colors[display] || 'bg-slate-100 text-slate-700 border-slate-200'
      )}>
        {display}
      </span>
    );
  };

  const StatusBadge = ({ status }: { status: StudyStatus }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.all;
    return (
      <span className={cn('status-chip', cfg.className)}>
        <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse-dot', cfg.dot)} />
        {cfg.label}
      </span>
    );
  };

  const StatCard = ({
    label,
    value,
    icon: Icon,
    tone,
  }: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    tone: 'amber' | 'green' | 'purple' | 'red';
  }) => {
    const toneClasses = {
      amber: 'from-amber-50 to-white text-amber-600 border-amber-100',
      green: 'from-green-50 to-white text-green-600 border-green-100',
      purple: 'from-purple-50 to-white text-purple-600 border-purple-100',
      red: 'from-red-50 to-white text-red-600 border-red-100',
    };
    const iconBg = {
      amber: 'bg-amber-500/10 text-amber-600',
      green: 'bg-green-500/10 text-green-600',
      purple: 'bg-purple-500/10 text-purple-600',
      red: 'bg-red-500/10 text-red-600',
    };
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-br shadow-soft',
          toneClasses[tone]
        )}
      >
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', iconBg[tone])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-slate-500 font-medium">{label}</span>
          <span className="text-2xl font-bold text-slate-800 mt-0.5">{value}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="p-6 max-w-[1600px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              检查列表
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              管理和审阅所有待处理的医学影像检查申请
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-medical-600 hover:bg-medical-700 text-white rounded-lg font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
            <Plus className="w-4.5 h-4.5" />
            新建申请
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="今日待阅" value={stats.todayPending} icon={Clock} tone="amber" />
          <StatCard label="今日已阅" value={stats.todayRead} icon={CheckCircle2} tone="green" />
          <StatCard label="待审核" value={stats.reviewPending} icon={Eye} tone="purple" />
          <StatCard label="超期预警" value={stats.overdue} icon={AlertTriangle} tone="red" />
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Filter className="w-4 h-4 text-medical-500" />
            筛选条件
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索患者姓名/ID/检查号..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                  setFilters({ patientName: e.target.value });
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500 transition-all"
              />
            </div>

            {/* Body Part */}
            <div className="relative">
              <select
                value={bodyPartFilter}
                onChange={(e) => {
                  setBodyPartFilter(e.target.value);
                  setCurrentPage(1);
                  setFilters({ bodyPart: e.target.value === '全部' ? undefined : e.target.value });
                }}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500 min-w-[120px]"
              >
                {BODY_PARTS.map((p) => (
                  <option key={p} value={p}>
                    {p === '全部' ? '检查部位' : p}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Modality */}
            <div className="relative">
              <select
                value={modalityFilter}
                onChange={(e) => {
                  setModalityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500 min-w-[110px]"
              >
                {MODALITIES.map((m) => (
                  <option key={m} value={m}>
                    {m === '全部' ? 'Modality' : m}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={dateRange[0]}
                onChange={(e) => {
                  setDateRange([e.target.value, dateRange[1]]);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none w-[120px]"
              />
              <span className="text-slate-400 text-xs">至</span>
              <input
                type="date"
                value={dateRange[1]}
                onChange={(e) => {
                  setDateRange([dateRange[0], e.target.value]);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none w-[120px]"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 pt-1">
            {STATUS_TABS.map((tab) => {
              const isActive = statusTab === tab.key;
              const activeColors: Record<string, string> = {
                all: 'bg-slate-800 text-white shadow-md dark:bg-slate-200 dark:text-slate-900',
                pending: 'bg-amber-500 text-white shadow-md shadow-amber-500/25',
                reporting: 'bg-blue-500 text-white shadow-md shadow-blue-500/25',
                reported: 'bg-purple-500 text-white shadow-md shadow-purple-500/25',
                audited: 'bg-green-500 text-white shadow-md shadow-green-500/25',
              };
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setStatusTab(tab.key);
                    setCurrentPage(1);
                    if (tab.key !== 'all') {
                      setFilters({ status: tab.key as StudyStatus });
                    }
                  }}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                    isActive
                      ? activeColors[tab.key] + ' border-transparent scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-medical-300 hover:text-medical-600 dark:hover:border-medical-700 dark:hover:text-medical-400'
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      'ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                      isActive
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    )}
                  >
                    {tab.key === 'all'
                      ? filteredStudies.length
                      : tab.key === 'audited'
                      ? studies.filter((s) => s.status === 'approved' || s.status === 'audited').length
                      : tab.key === 'reported'
                      ? studies.filter((s) => s.status === 'reported').length
                      : studies.filter((s) => s.status === tab.key).length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-zebra">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">
                    序号
                  </th>
                  <th
                    className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-medical-600 transition-colors"
                    onClick={() => handleSort('patientName')}
                  >
                    <div className="flex items-center gap-1.5">
                      患者信息
                      <SortIcon columnKey="patientName" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-medical-600 transition-colors"
                    onClick={() => handleSort('accessionNumber')}
                  >
                    <div className="flex items-center gap-1.5">
                      检查号
                      <SortIcon columnKey="accessionNumber" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-medical-600 transition-colors"
                    onClick={() => handleSort('bodyPart')}
                  >
                    <div className="flex items-center gap-1.5">
                      检查部位
                      <SortIcon columnKey="bodyPart" />
                    </div>
                  </th>
                  <th
                    className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-medical-600 transition-colors"
                    onClick={() => handleSort('modality')}
                  >
                    <div className="flex items-center gap-1.5">
                      Modality
                      <SortIcon columnKey="modality" />
                    </div>
                  </th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    申请科室
                  </th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    申请医生
                  </th>
                  <th
                    className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-medical-600 transition-colors"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1.5">
                      申请时间
                      <SortIcon columnKey="createdAt" />
                    </div>
                  </th>
                  <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="text-center py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedStudies.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                          暂无匹配的检查记录
                        </p>
                        <p className="text-sm text-slate-400">请尝试调整筛选条件</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedStudies.map((study, idx) => (
                    <tr
                      key={study.id}
                      className="hover:bg-medical-50/50 dark:hover:bg-medical-900/10 transition-colors group"
                    >
                      <td className="py-4 px-4 text-sm text-slate-500 font-mono">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0',
                              study.patientGender === 'male'
                                ? 'bg-gradient-to-br from-blue-500 to-medical-600'
                                : 'bg-gradient-to-br from-pink-500 to-rose-500'
                            )}
                          >
                            {study.patientName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-white text-sm">
                              {study.patientName}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>
                                {study.patientGender === 'male' ? '男' : '女'}
                              </span>
                              <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                              <span>{study.patientAge}岁</span>
                              <span className="w-0.5 h-0.5 bg-slate-300 rounded-full" />
                              <span className="truncate">{study.patientId}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-mono text-slate-700 dark:text-slate-200 font-medium">
                          {study.accessionNumber}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-200">
                        {study.bodyPart}
                      </td>
                      <td className="py-4 px-4">
                        <ModalityBadge modality={study.modality} />
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-200">
                        {study.department}
                      </td>
                      <td className="py-4 px-4 text-sm text-slate-700 dark:text-slate-200">
                        {study.referringDoctor}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-700 dark:text-slate-200">
                          {study.studyDate}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{study.studyTime}</div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={study.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {study.status === 'pending' && (
                            <button
                              onClick={() => handleReceive(study.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-medical-50 text-medical-700 dark:bg-medical-900/30 dark:text-medical-400 hover:bg-medical-100 dark:hover:bg-medical-900/50 transition-colors"
                            >
                              <Inbox className="w-3.5 h-3.5" />
                              接收
                            </button>
                          )}
                          <button
                            onClick={() => handleView(study.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            阅览
                          </button>
                          {(study.status === 'reporting' || study.status === 'pending') && (
                            <button
                              onClick={() => handleReport(study.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              报告
                            </button>
                          )}
                          <button
                            onClick={() => openDrawer(study)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            详情
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              共{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {filteredStudies.length}
              </span>{' '}
              条记录，当前第{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentPage}
              </span>{' '}
              / {totalPages} 页
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-medical-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            onClick={closeDrawer}
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-[520px] bg-white dark:bg-slate-900 shadow-2xl animate-slide-right flex flex-col">
            {selectedStudy && (
              <>
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      检查详情
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5 font-mono">
                      {selectedStudy.accessionNumber}
                    </p>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Patient Info Card */}
                  <div className="bg-gradient-to-br from-medical-50 to-white dark:from-medical-900/20 dark:to-slate-800 rounded-2xl p-5 border border-medical-100 dark:border-medical-800/50">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md shrink-0',
                          selectedStudy.patientGender === 'male'
                            ? 'bg-gradient-to-br from-blue-500 to-medical-600'
                            : 'bg-gradient-to-br from-pink-500 to-rose-500'
                        )}
                      >
                        {selectedStudy.patientName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {selectedStudy.patientName}
                          </h3>
                          <StatusBadge status={selectedStudy.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-600 dark:text-slate-300">
                          <span>{selectedStudy.patientGender === 'male' ? '男' : '女'}</span>
                          <span className="w-0.5 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                          <span>{selectedStudy.patientAge}岁</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-medical-100/60 dark:border-medical-800/30">
                      <div className="flex items-start gap-2.5">
                        <IdCard className="w-4 h-4 text-medical-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-slate-400">患者ID</div>
                          <div className="text-sm text-slate-700 dark:text-slate-200 font-mono truncate">
                            {selectedStudy.patient?.id || selectedStudy.patientId}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 text-medical-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-slate-400">出生日期</div>
                          <div className="text-sm text-slate-700 dark:text-slate-200">
                            {selectedStudy.patient?.birthDate || '—'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Phone className="w-4 h-4 text-medical-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-slate-400">联系电话</div>
                          <div className="text-sm text-slate-700 dark:text-slate-200 truncate">
                            {selectedStudy.patient?.phone || '—'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <Mail className="w-4 h-4 text-medical-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-slate-400">病案号</div>
                          <div className="text-sm text-slate-700 dark:text-slate-200 font-mono truncate">
                            {selectedStudy.patient?.medicalRecordNumber || '—'}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-medical-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-slate-400">联系地址</div>
                          <div className="text-sm text-slate-700 dark:text-slate-200 truncate">
                            {selectedStudy.patient?.address || '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Study Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <Stethoscope className="w-4 h-4 text-medical-500" />
                      检查详情
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: '检查部位', value: selectedStudy.bodyPart },
                        { label: '检查类型', value: MODALITY_DISPLAY[selectedStudy.modality] },
                        { label: '申请科室', value: selectedStudy.department || '—' },
                        { label: '申请医生', value: selectedStudy.referringDoctor || '—' },
                        { label: '检查日期', value: selectedStudy.studyDate },
                        { label: '检查时间', value: selectedStudy.studyTime },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3"
                        >
                          <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3">
                      <div className="text-xs text-slate-400 mb-1">检查描述</div>
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {selectedStudy.description}
                      </div>
                    </div>
                  </div>

                  {/* Series List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                        <Layers className="w-4 h-4 text-medical-500" />
                        序列列表
                        <span className="text-xs text-slate-400 font-normal">
                          ({selectedStudy.series.length} 个序列)
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {selectedStudy.series.map((series) => (
                        <div
                          key={series.id}
                          className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-medical-200 dark:hover:border-medical-700 hover:bg-medical-50/30 dark:hover:bg-medical-900/10 transition-all group cursor-pointer"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-viewer-bg">
                            {series.thumbnail ? (
                              <img
                                src={series.thumbnail}
                                alt={series.description}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-slate-600" />
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 py-1">
                              <span className="text-[10px] text-white font-semibold">
                                {series.instancesCount || series.instanceCount || 0}张
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                              {series.description || series.seriesDescription}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <ModalityBadge modality={series.modality} />
                              <span className="text-xs text-slate-400">
                                序列 #{series.seriesNumber}
                              </span>
                              {series.windowWidth && (
                                <span className="text-xs text-slate-400">
                                  WW/WL: {Math.round(series.windowWidth)}/{Math.round(series.windowCenter || 0)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Historical Studies */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      <History className="w-4 h-4 text-medical-500" />
                      历史检查对比
                    </div>
                    <div className="space-y-2.5">
                      {studies
                        .filter(
                          (s) =>
                            s.patientId === selectedStudy.patientId && s.id !== selectedStudy.id
                        )
                        .slice(0, 3)
                        .map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-medical-200 dark:hover:border-medical-700 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-slate-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                  {h.bodyPart} {MODALITY_DISPLAY[h.modality]}
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">
                                  {h.studyDate} · {h.status === 'approved' || h.status === 'audited' ? '已出报告' : '历史记录'}
                                </div>
                              </div>
                            </div>
                            <StatusBadge status={h.status} />
                          </div>
                        ))}
                      {studies.filter(
                        (s) =>
                          s.patientId === selectedStudy.patientId && s.id !== selectedStudy.id
                      ).length === 0 && (
                        <div className="py-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/30">
                          <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">暂无历史检查记录</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Drawer Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                  <div className="flex items-center gap-3">
                    {selectedStudy.status === 'pending' && (
                      <button
                        onClick={() => handleReceive(selectedStudy.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                      >
                        <Inbox className="w-4 h-4" />
                        接收申请
                      </button>
                    )}
                    <button
                      onClick={() => handleView(selectedStudy.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-medical-500 to-medical-600 hover:from-medical-600 hover:to-medical-700 text-white font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <Play className="w-4 h-4" />
                      开始阅片
                    </button>
                    {(selectedStudy.status === 'reporting' || selectedStudy.status === 'pending') && (
                      <button
                        onClick={() => handleReport(selectedStudy.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                      >
                        <FileText className="w-4 h-4" />
                        写报告
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
