import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  Clock,
  Users,
  Calendar,
  PlayCircle,
  FileText,
  ChevronDown,
  ChevronLeft,
  Search,
  X,
  AlertTriangle,
  TrendingUp,
  Activity,
  UserPlus,
  Check,
  Send,
  Image as ImageIcon,
  Smile,
  Mic,
  Bookmark,
  Camera,
  Download,
  Edit3,
  User,
  CheckCircle2,
  Clock3,
  Circle,
  Phone,
  Video,
  Settings,
  ArrowLeft,
  Filter,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useConsultationStore } from '@/stores/consultationStore';
import { studies } from '@/mock/studies';
import { mockUsers } from '@/mock/patients';
import type { Consultation, UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'active', label: '进行中' },
  { key: 'pending', label: '待开始' },
  { key: 'ended', label: '已结束' },
  { key: 'mine', label: '我参与的' },
] as const;

type StatusTabKey = typeof STATUS_TABS[number]['key'];

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  active: { label: '进行中', className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800', dot: 'bg-green-500' },
  pending: { label: '待开始', className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800', dot: 'bg-amber-500' },
  ended: { label: '已结束', className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', dot: 'bg-slate-500' },
  discussing: { label: '讨论中', className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800', dot: 'bg-blue-500' },
  finished: { label: '已完成', className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800', dot: 'bg-purple-500' },
};

const TYPE_CONFIG = {
  emergency: { label: '紧急', className: 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800' },
  normal: { label: '普通', className: 'bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
};

const USER_COLORS = [
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-emerald-500 to-emerald-600',
  'bg-gradient-to-br from-purple-500 to-purple-600',
  'bg-gradient-to-br from-orange-500 to-orange-600',
  'bg-gradient-to-br from-pink-500 to-pink-600',
  'bg-gradient-to-br from-teal-500 to-teal-600',
  'bg-gradient-to-br from-indigo-500 to-indigo-600',
  'bg-gradient-to-br from-rose-500 to-rose-600',
];

function getAvatarColor(idx: number): string {
  return USER_COLORS[idx % USER_COLORS.length];
}

function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hh}:${mm}`;
}

function formatDurationMinutes(start?: string, end?: string): string {
  if (!start) return '—';
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const mins = Math.max(1, Math.floor((e - s) / 60000));
  if (mins < 60) return `${mins}分钟`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}小时${m}分钟`;
}

const Avatar = ({ name, size = 32, className, online }: { name: string; size?: number; className?: string; online?: boolean }) => {
  const idx = name.charCodeAt(0) % USER_COLORS.length;
  return (
    <div className={cn('relative inline-flex shrink-0', className)} style={{ width: size, height: size }}>
      <div
        className={cn('w-full h-full rounded-full flex items-center justify-center text-white font-bold', getAvatarColor(idx))}
        style={{ fontSize: size * 0.38 }}
      >
        {name.charAt(0)}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900',
            online ? 'bg-green-500' : 'bg-slate-400'
          )}
        />
      )}
    </div>
  );
};

const AvatarStack = ({ participants, max = 4, size = 28 }: { participants: { name: string }[]; max?: number; size?: number }) => {
  const visible = participants.slice(0, max);
  const rest = participants.length - visible.length;
  return (
    <div className="flex items-center">
      {visible.map((p, i) => (
        <div key={i} className="-ml-1.5 first:ml-0" style={{ zIndex: visible.length - i }}>
          <Avatar name={p.name} size={size} />
        </div>
      ))}
      {rest > 0 && (
        <div
          className="-ml-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold flex items-center justify-center border-2 border-white dark:border-slate-900"
          style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
          +{rest}
        </div>
      )}
    </div>
  );
};

const StatCard = ({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'green' | 'blue' | 'purple' | 'amber';
}) => {
  const toneClasses = {
    green: 'from-green-50 to-white text-green-600 border-green-100 dark:from-green-950/30 dark:to-slate-900 dark:border-green-900/30',
    blue: 'from-blue-50 to-white text-blue-600 border-blue-100 dark:from-blue-950/30 dark:to-slate-900 dark:border-blue-900/30',
    purple: 'from-purple-50 to-white text-purple-600 border-purple-100 dark:from-purple-950/30 dark:to-slate-900 dark:border-purple-900/30',
    amber: 'from-amber-50 to-white text-amber-600 border-amber-100 dark:from-amber-950/30 dark:to-slate-900 dark:border-amber-900/30',
  };
  const iconBg = {
    green: 'bg-green-500/10 text-green-600 dark:bg-green-500/20',
    blue: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20',
  };
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-br shadow-sm',
        toneClasses[tone]
      )}
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', iconBg[tone])}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</span>
        <span className="text-2xl font-bold text-slate-800 dark:text-white mt-0.5">{value}</span>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ended;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border', cfg.className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
};

const ConsultationCard = ({
  consultation,
  onEnter,
  onViewSummary,
}: {
  consultation: Consultation;
  onEnter: () => void;
  onViewSummary: () => void;
}) => {
  const study = studies.find((s) => s.id === consultation.studyId);
  const isEmergency = consultation.type === 'emergency';
  const typeCfg = isEmergency ? TYPE_CONFIG.emergency : TYPE_CONFIG.normal;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-100 dark:border-slate-800 group">
      <div className="relative">
        {isEmergency && (
          <div className="absolute top-0 left-0 z-10">
            <div className="w-0 h-0 border-t-[72px] border-l-[72px] border-t-red-500 border-l-transparent" />
            <div className="absolute top-1.5 left-1.5 text-white text-[10px] font-bold" style={{ transform: 'translate(2px, 8px) rotate(-45deg)' }}>
              紧急
            </div>
          </div>
        )}
        <div className="p-5 pb-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-snug group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors line-clamp-1">
              {consultation.title}
            </h3>
            <span className={cn('shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', typeCfg.className)}>
              {typeCfg.label}
            </span>
          </div>
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">主持人:</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{consultation.hostName || consultation.participants[0]?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">患者:</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{study?.patientName || '—'}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 dark:text-slate-400">{study?.bodyPart || '—'} {study?.modality}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <AvatarStack participants={consultation.participants.map((p) => ({ name: p.name }))} max={4} size={28} />
            <span className="text-xs text-slate-400">{consultation.participants.length}人参与</span>
          </div>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <StatusBadge status={consultation.status} />
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock3 className="w-3 h-3" />
              {formatDateTime(consultation.startTime || consultation.createdAt)}
            </span>
          </div>
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <Button variant="primary" size="sm" className="flex-1" onClick={onEnter}>
            <PlayCircle className="w-4 h-4" />
            进入会诊
          </Button>
          <Button variant="secondary" size="sm" className="flex-1" onClick={onViewSummary}>
            <FileText className="w-4 h-4" />
            查看纪要
          </Button>
        </div>
      </div>
    </Card>
  );
};

const CreateConsultationModal = ({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (studyId: string, title: string, participants: { id: string; name: string; role: UserRole }[]) => void;
}) => {
  const [step, setStep] = useState(1);
  const [searchStudy, setSearchStudy] = useState('');
  const [selectedStudyId, setSelectedStudyId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [consultationType, setConsultationType] = useState<'normal' | 'emergency'>('normal');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [searchExpert, setSearchExpert] = useState('');
  const [selectedExperts, setSelectedExperts] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSearchStudy('');
      setSelectedStudyId(null);
      setTitle('');
      setConsultationType('normal');
      setStartDate('');
      setStartTime('');
      setSearchExpert('');
      setSelectedExperts([]);
    }
  }, [open]);

  const filteredStudies = useMemo(() => {
    if (!searchStudy.trim()) return studies.slice(0, 8);
    const q = searchStudy.toLowerCase();
    return studies.filter(
      (s) =>
        s.patientName.toLowerCase().includes(q) ||
        s.accessionNumber?.toLowerCase().includes(q) ||
        s.bodyPart.includes(searchStudy)
    ).slice(0, 10);
  }, [searchStudy]);

  const filteredExperts = useMemo(() => {
    if (!searchExpert.trim()) return mockUsers;
    const q = searchExpert.toLowerCase();
    return mockUsers.filter((u) => u.name.toLowerCase().includes(q) || u.department.includes(searchExpert));
  }, [searchExpert]);

  const toggleExpert = (id: string) => {
    setSelectedExperts((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const canNext = useMemo(() => {
    if (step === 1) return !!selectedStudyId;
    if (step === 2) return title.trim() && startDate && startTime;
    if (step === 3) return selectedExperts.length > 0;
    return true;
  }, [step, selectedStudyId, title, startDate, startTime, selectedExperts.length]);

  const handleCreate = () => {
    if (!selectedStudyId || !title.trim()) return;
    const participants = selectedExperts.map((id) => {
      const u = mockUsers.find((x) => x.id === id)!;
      return { id: u.id, name: u.name, role: u.role };
    });
    onCreate(selectedStudyId, title.trim(), participants);
    onClose();
  };

  const selectedStudy = studies.find((s) => s.id === selectedStudyId);
  const steps = [
    { id: 1, label: '选择检查', icon: Layers },
    { id: 2, label: '填写信息', icon: Edit3 },
    { id: 3, label: '邀请专家', icon: Users },
    { id: 4, label: '确认创建', icon: CheckCircle2 },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="发起会诊"
      className="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" onClick={() => (step > 1 ? setStep(step - 1) : onClose())}>
            {step > 1 ? '上一步' : '取消'}
          </Button>
          <div className="flex items-center gap-2">
            {step < 4 ? (
              <Button variant="primary" onClick={() => setStep(step + 1)} disabled={!canNext}>
                下一步
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="primary" onClick={handleCreate} disabled={!canNext}>
                <Check className="w-4 h-4" />
                确认创建
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center transition-all',
                      isDone
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-medical-600 text-white shadow-md shadow-medical-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                    )}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={cn('text-xs font-medium', isActive ? 'text-medical-600 dark:text-medical-400' : 'text-slate-500 dark:text-slate-400')}>
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-3 mb-5 rounded', step > s.id ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700')} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {step === 1 && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="搜索患者姓名/检查号/检查部位..." value={searchStudy} onChange={(e) => setSearchStudy(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500" />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 -mr-1">
            {filteredStudies.map((study) => {
              const isSelected = selectedStudyId === study.id;
              return (
                <div key={study.id} onClick={() => setSelectedStudyId(study.id)}
                  className={cn('flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer transition-all',
                    isSelected ? 'border-medical-500 bg-medical-50/50 dark:bg-medical-900/20 dark:border-medical-700 ring-2 ring-medical-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-medical-300 dark:hover:border-medical-700 hover:bg-medical-50/30 dark:hover:bg-medical-900/10')}>
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-viewer-bg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{study.patientName}</span>
                      <Badge variant="info">{study.modality}</Badge>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{study.bodyPart}</span>
                      <span className="w-0.5 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                      <span className="font-mono text-xs">{study.accessionNumber}</span>
                      <span className="w-0.5 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                      <span>{study.studyDate}</span>
                    </div>
                  </div>
                  <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                    isSelected ? 'border-medical-500 bg-medical-500' : 'border-slate-300 dark:border-slate-600')}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">会诊标题</label>
            <input type="text" placeholder="请输入会诊标题，如：疑难肺部病例讨论" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">会诊类型</label>
            <div className="flex gap-3">
              {(['normal', 'emergency'] as const).map((t) => {
                const cfg = t === 'emergency' ? TYPE_CONFIG.emergency : TYPE_CONFIG.normal;
                const isActive = consultationType === t;
                return (
                  <button key={t} onClick={() => setConsultationType(t)}
                    className={cn('flex-1 py-3 px-4 rounded-xl border font-medium transition-all',
                      isActive ? t === 'emergency'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500/20 text-red-600 dark:text-red-400'
                        : 'border-medical-500 bg-medical-50 dark:bg-medical-900/20 ring-2 ring-medical-500/20 text-medical-600 dark:text-medical-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600')}>
                    <div className="flex items-center justify-center gap-2">
                      {t === 'emergency' ? <AlertTriangle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                      {cfg.label}会诊
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">会诊日期</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">开始时间</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500" />
            </div>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="搜索专家姓名/科室..." value={searchExpert} onChange={(e) => setSearchExpert(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500" />
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 -mr-1">
            {filteredExperts.map((user) => {
              const isSelected = selectedExperts.includes(user.id);
              return (
                <div key={user.id} onClick={() => toggleExpert(user.id)}
                  className={cn('flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer transition-all',
                    isSelected ? 'border-medical-500 bg-medical-50/50 dark:bg-medical-900/20 dark:border-medical-700 ring-2 ring-medical-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-medical-300 dark:hover:border-medical-700 hover:bg-medical-50/30 dark:hover:bg-medical-900/10')}>
                  <Avatar name={user.name} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 dark:text-white">{user.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{user.department}</span>
                      <span className="w-0.5 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </div>
                  <div className={cn('w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                    isSelected ? 'border-medical-500 bg-medical-500' : 'border-slate-300 dark:border-slate-600')}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
          {selectedExperts.length > 0 && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
              <div className="text-sm text-blue-700 dark:text-blue-400 font-medium">已选择 {selectedExperts.length} 位专家</div>
            </div>
          )}
        </div>
      )}
      {step === 4 && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-gradient-to-br from-medical-50 to-white dark:from-medical-950/30 dark:to-slate-900 border border-medical-100 dark:border-medical-800/50 space-y-4">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">关联检查</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-viewer-bg flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{selectedStudy?.patientName || '—'}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{selectedStudy?.bodyPart} {selectedStudy?.modality} · {selectedStudy?.accessionNumber}</div>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-medical-100/60 dark:border-medical-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">会诊标题</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">会诊类型</span>
                <Badge variant={consultationType === 'emergency' ? 'danger' : 'default'}>
                  {consultationType === 'emergency' ? '紧急会诊' : '普通会诊'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">开始时间</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{startDate} {startTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">邀请专家</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{selectedExperts.length} 位</span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">受邀专家列表</div>
            <div className="grid grid-cols-2 gap-2">
              {selectedExperts.map((id) => {
                const u = mockUsers.find((x) => x.id === id);
                if (!u) return null;
                return (
                  <div key={id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <Avatar name={u.name} size={32} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{u.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.department}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

const MiniViewer = ({ studyId }: { studyId: string }) => {
  const study = studies.find((s) => s.id === studyId);
  const series = study?.series || [];
  const [selectedSeriesId, setSelectedSeriesId] = useState(series[0]?.id || '');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [keyImages, setKeyImages] = useState<{ idx: number; seriesId: string }[]>([]);

  useEffect(() => {
    if (series.length > 0) {
      setSelectedSeriesId(series[0].id);
      setCurrentImageIdx(0);
    }
  }, [studyId]);

  const currentSeries = series.find((s) => s.id === selectedSeriesId) || series[0];
  const currentImages = currentSeries?.images || [];
  const currentImage = currentImages[currentImageIdx] || currentImages[0];

  const markAsKeyImage = () => {
    setKeyImages((prev) => [...prev, { idx: currentImageIdx, seriesId: selectedSeriesId }]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <div className="relative w-full">
          <select
            value={selectedSeriesId}
            onChange={(e) => { setSelectedSeriesId(e.target.value); setCurrentImageIdx(0); }}
            className="w-full appearance-none pl-3 pr-10 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500">
            {series.map((s) => (
              <option key={s.id} value={s.id}>{s.description} ({s.instancesCount || s.images?.length || 0}张)</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>
      <div className="flex-1 relative flex items-center justify-center bg-viewer-bg p-4 min-h-0">
        {currentImage ? (
          <img src={currentImage.url} alt="" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        ) : (
          <div className="text-slate-500 text-sm">暂无影像</div>
        )}
        {currentImage && (
          <div className="absolute bottom-2 right-2 text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded">
            {currentImageIdx + 1} / {currentImages.length}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-800 bg-slate-900/50">
        <button onClick={markAsKeyImage}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-medical-600 hover:bg-medical-700 text-white text-xs font-medium transition-colors">
          <Bookmark className="w-3.5 h-3.5" />
          标记为关键图
        </button>
        <button onClick={() => setCurrentImageIdx((i) => Math.max(0, i - 1))} disabled={currentImageIdx === 0}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setCurrentImageIdx((i) => Math.min(currentImages.length - 1, i + 1))} disabled={currentImageIdx >= currentImages.length - 1}
          className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {keyImages.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/30">
          <div className="text-xs font-medium text-slate-400 mb-2">已标记关键图 ({keyImages.length})</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {keyImages.map((ki, i) => {
              const s = series.find((x) => x.id === ki.seriesId);
              const img = s?.images?.[ki.idx];
              return (
                <div key={i}
                  onClick={() => { setSelectedSeriesId(ki.seriesId); setCurrentImageIdx(ki.idx); }}
                  className="relative shrink-0 w-14 h-14 rounded-lg overflow-hidden cursor-pointer ring-2 ring-medical-500 hover:ring-medical-400 transition-all">
                  {img ? <img src={img.url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-slate-800 flex items-center justify-center"><ImageIcon className="w-5 h-5 text-slate-500" /></div>}
                  <div className="absolute top-0 left-0 w-5 h-5 bg-medical-500 text-white text-[10px] font-bold flex items-center justify-center rounded-br-lg">{i + 1}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const ChatPanel = ({
  consultation,
  onSend,
  onEnd,
  onBack,
}: {
  consultation: Consultation;
  onSend: (content: string, type: 'text' | 'image' | 'keyImage') => void;
  onEnd: () => void;
  onBack: () => void;
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = 'U001';
  const messages = consultation.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSend(inputText.trim(), 'text');
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isActive = consultation.status === 'active' || consultation.status === 'discussing';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-medical-50/50 to-white dark:from-medical-950/20 dark:to-slate-900">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-slate-900 dark:text-white truncate">{consultation.title}</h2>
              {consultation.type === 'emergency' && (
                <Badge variant="danger"><AlertTriangle className="w-3 h-3" />紧急</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <StatusBadge status={consultation.status} />
              <span>开始于 {formatDateTime(consultation.startTime || consultation.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AvatarStack participants={consultation.participants.map((p) => ({ name: p.name }))} max={5} size={30} />
          {isActive ? (
            <Button variant="destructive" size="sm" onClick={onEnd}>
              <Circle className="w-3 h-3 fill-current" />结束会诊
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Phone className="w-4 h-4" />
              </button>
              <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Video className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
        {messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1];
          const isSystem = !msg.userId || msg.userId === 'system';
          const isMine = msg.userId === currentUserId;
          const showAvatar = !prevMsg || prevMsg.userId !== msg.userId || isSystem;
          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400">{msg.content}</div>
              </div>
            );
          }
          const userName = msg.userName || msg.senderName || '未知用户';
          return (
            <div key={msg.id} className={cn('flex gap-3', isMine ? 'flex-row-reverse' : 'flex-row')}>
              <div className="shrink-0">
                {showAvatar ? <Avatar name={userName} size={36} /> : <div style={{ width: 36 }} />}
              </div>
              <div className={cn('flex flex-col max-w-[70%]', isMine ? 'items-end' : 'items-start')}>
                {showAvatar && (
                  <div className={cn('flex items-center gap-2 mb-1', isMine ? 'flex-row-reverse' : '')}>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{userName}</span>
                    {!isMine && <span className="text-xs text-slate-400">{consultation.participants.find((p) => p.id === msg.userId)?.role || '专家'}</span>}
                  </div>
                )}
                <div className={cn('rounded-2xl px-4 py-2.5 text-sm',
                  msg.type === 'keyImage' ? 'border-2 border-dashed border-medical-300 dark:border-medical-700 bg-medical-50/50 dark:bg-medical-950/20'
                    : msg.type === 'image' ? 'bg-slate-100 dark:bg-slate-800 p-2'
                      : isMine ? 'bg-medical-600 text-white rounded-tr-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-md')}>
                  {msg.type === 'keyImage' ? (
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-viewer-bg">
                        <div className="absolute top-0 left-0 w-5 h-5 bg-medical-500 text-white text-[10px] font-bold flex items-center justify-center rounded-br-lg z-10">1</div>
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-slate-500" /></div>
                      </div>
                      <div>
                        <div className={cn('font-medium text-xs mb-1', isMine ? 'text-white' : 'text-medical-700 dark:text-medical-300')}>引用关键图</div>
                        <div className={cn(isMine ? 'text-white/90' : 'text-slate-700 dark:text-slate-200')}>{msg.content}</div>
                      </div>
                    </div>
                  ) : msg.type === 'image' ? (
                    <div className="w-48 h-48 rounded-lg bg-viewer-bg flex items-center justify-center"><ImageIcon className="w-10 h-10 text-slate-500" /></div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</div>
                  )}
                </div>
                <div className={cn('flex items-center gap-1.5 mt-1 text-xs text-slate-400', isMine ? 'flex-row-reverse' : '')}>
                  <span>{formatDateTime(msg.createdAt || msg.sendTime).split(' ')[1]}</span>
                  {isMine && <Check className="w-3 h-3 text-green-500" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-1 mb-3">
          {[{ icon: ImageIcon, label: '图片' }, { icon: Smile, label: '表情' }, { icon: Mic, label: '语音' }, { icon: Bookmark, label: '引用关键图' }].map(({ icon: Icon, label }) => (
            <button key={label} title={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-xs">
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
        <div className="flex items-end gap-3">
          <textarea rows={2} placeholder="输入消息，按 Enter 发送，Shift+Enter 换行..."
            value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500 resize-none" />
          <button onClick={handleSend} disabled={!inputText.trim()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
            <Send className="w-4 h-4" />发送
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoPanel = ({
  consultation,
  onExport,
}: {
  consultation: Consultation;
  onExport: () => void;
}) => {
  const [editingSummary, setEditingSummary] = useState(false);
  const [summary, setSummary] = useState(consultation.summary || '');
  const [expandedImage, setExpandedImage] = useState<number | null>(null);
  const study = studies.find((s) => s.id === consultation.studyId);
  const keyImages = consultation.keyImages || [];
  const host = consultation.participants[0];
  const experts = consultation.participants.slice(1);
  const roleLabel: Record<UserRole, string> = { radiologist: '影像科', doctor: '临床医生', expert: '专家', admin: '管理员' };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <Tabs defaultValue="keyImages" className="flex flex-col h-full">
        <div className="px-4 pt-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <TabsList className="w-full bg-transparent p-0 border-b-0">
            {[
              { value: 'keyImages', label: '关键图', count: keyImages.length, icon: Bookmark },
              { value: 'participants', label: '参会人', count: consultation.participants.length, icon: Users },
              { value: 'summary', label: '会诊纪要', count: consultation.summary ? 1 : 0, icon: FileText },
            ].map(({ value, label, count, icon: Icon }) => (
              <TabsTrigger key={value} value={value}
                className="flex-1 relative py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-medical-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4" /><span>{label}</span>
                  {count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">{count}</span>}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="keyImages" className="mt-0 flex-1 overflow-y-auto p-4 min-h-0">
          {keyImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <Bookmark className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">暂无关键图</p>
              <p className="text-xs text-slate-400 mt-1">在影像查看器中标记关键图像</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {keyImages.map((ki, i) => (
                <div key={ki.id} onClick={() => setExpandedImage(expandedImage === i ? null : i)}
                  className={cn('rounded-xl overflow-hidden border cursor-pointer transition-all group',
                    expandedImage === i ? 'col-span-2 border-medical-500 shadow-lg ring-2 ring-medical-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-medical-300 dark:hover:border-medical-700')}>
                  <div className={cn('relative bg-viewer-bg flex items-center justify-center', expandedImage === i ? 'h-48' : 'h-28')}>
                    <ImageIcon className="w-10 h-10 text-slate-500" />
                    <div className="absolute top-2 left-2 w-6 h-6 bg-medical-500 text-white text-xs font-bold flex items-center justify-center rounded-md shadow-sm">{i + 1}</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50">
                    {ki.description ? <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{ki.description}</p>
                      : <p className="text-xs text-slate-400 italic">暂无批注</p>}
                    <div className="text-[10px] text-slate-400 mt-1">{ki.addedBy} · {formatDateTime(ki.addedAt).split(' ')[1]}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="participants" className="mt-0 flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Settings className="w-3 h-3" />主持人
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-medical-50 to-white dark:from-medical-950/30 dark:to-slate-900 border border-medical-100 dark:border-medical-800/50">
                <Avatar name={host?.name || ''} size={44} online />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-900 dark:text-white">{host?.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{roleLabel[host?.role || 'expert']}</div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />在线
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3 h-3" />会诊专家 ({experts.length})
                </div>
                <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 hover:bg-medical-100 dark:hover:bg-medical-900/50 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" />邀请
                </button>
              </div>
              <div className="space-y-2">
                {experts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-medical-200 dark:hover:border-medical-700 hover:bg-medical-50/30 dark:hover:bg-medical-900/10 transition-all">
                    <Avatar name={p.name} size={40} online={i % 3 !== 2} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{p.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {mockUsers.find((u) => u.id === p.id)?.department || '影像科'} · {roleLabel[p.role]}
                      </div>
                    </div>
                    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                      i % 3 !== 2 ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400')}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', i % 3 !== 2 ? 'bg-green-500 animate-pulse' : 'bg-slate-400')} />
                      {i % 3 !== 2 ? '在线' : '离线'}
                    </span>
                  </div>
                ))}
                {experts.length === 0 && (
                  <div className="py-8 text-center rounded-xl bg-slate-50 dark:bg-slate-800/30">
                    <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">暂无邀请专家</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="summary" className="mt-0 flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3 h-3" />会诊纪要要点
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setEditingSummary(!editingSummary)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <Edit3 className="w-3.5 h-3.5" />{editingSummary ? '完成' : '编辑'}
                </button>
                <button onClick={onExport}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 hover:bg-medical-100 dark:hover:bg-medical-900/50 transition-colors">
                  <Download className="w-3.5 h-3.5" />导出PDF
                </button>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 border border-slate-200 dark:border-slate-700 space-y-4">
              <div>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5"><User className="w-3 h-3" />患者信息</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-400">姓名：</span><span className="text-slate-700 dark:text-slate-200 font-medium">{study?.patientName || '—'}</span></div>
                  <div><span className="text-slate-400">性别/年龄：</span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium">
                      {study?.patientGender === 'male' ? '男' : study?.patientGender === 'female' ? '女' : '—'}
                      {study?.patientAge ? `/${study.patientAge}岁` : ''}
                    </span>
                  </div>
                  <div className="col-span-2"><span className="text-slate-400">检查：</span><span className="text-slate-700 dark:text-slate-200 font-medium">{study?.bodyPart || '—'} {study?.modality || ''}</span></div>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5"><Camera className="w-3 h-3" />关键影像发现</div>
                {keyImages.length > 0 ? (
                  <div className="space-y-2">
                    {keyImages.map((ki, i) => (
                      <div key={ki.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                        <div className="w-6 h-6 rounded-md bg-medical-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-700 dark:text-slate-200">{ki.description || '影像层面标记'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">标记人：{ki.addedBy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-sm text-slate-400 italic">暂无关键影像标记</div>}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5"><Activity className="w-3 h-3" />会诊意见汇总</div>
                {editingSummary ? (
                  <textarea rows={8} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="请输入会诊意见汇总..."
                    className="w-full px-3 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500 resize-none" />
                ) : summary ? <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{summary}</div>
                  : <div className="text-sm text-slate-400 italic">会诊结束后将自动汇总讨论要点，或点击编辑按钮手动填写会诊意见。</div>}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" />后续建议</div>
                <div className="space-y-2">
                  {['完善相关辅助检查（实验室、影像等）', '组织多学科MDT进一步讨论', '制定治疗方案并定期随访'].map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-3"><span>主持人：{host?.name}</span><span>参会人数：{consultation.participants.length}</span></div>
              <div>
                {(consultation.status === 'ended' || consultation.status === 'finished') && consultation.endTime && (
                  <span>总时长：{formatDurationMinutes(consultation.startTime || consultation.createdAt, consultation.endTime || consultation.endedAt)}</span>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ConsultationList = ({
  onEnterConsultation,
  onCreateOpen,
  setCreateOpen,
  handleCreate,
}: {
  onEnterConsultation: (id: string) => void;
  onCreateOpen: boolean;
  setCreateOpen: (v: boolean) => void;
  handleCreate: (studyId: string, title: string, participants: { id: string; name: string; role: UserRole }[]) => void;
}) => {
  const { consultations } = useConsultationStore();
  const [statusTab, setStatusTab] = useState<StatusTabKey>('all');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [searchText, setSearchText] = useState('');

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const activeCount = consultations.filter((c) => c.status === 'active' || c.status === 'discussing').length;
    const monthNewCount = consultations.filter((c) => {
      const d = new Date(c.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;
    const endedCons = consultations.filter((c) => c.status === 'ended' || c.status === 'finished');
    const avgDuration = endedCons.length > 0
      ? Math.round(endedCons.reduce((acc, c) => {
        const s = new Date(c.startTime || c.createdAt).getTime();
        const e = c.endTime || c.endedAt ? new Date(c.endTime || c.endedAt!).getTime() : Date.now();
        return acc + Math.max(1, Math.floor((e - s) / 60000));
      }, 0) / endedCons.length) : 0;
    return {
      active: activeCount,
      monthNew: monthNewCount,
      avgDuration: avgDuration > 0 ? `${avgDuration}分钟` : '—',
      pendingInvites: 2,
    };
  }, [consultations]);

  const filteredConsultations = useMemo(() => {
    let result = [...consultations];
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        (c.hostName || '').toLowerCase().includes(q) ||
        c.participants.some((p) => p.name.toLowerCase().includes(q))
      );
    }
    if (statusTab !== 'all') {
      if (statusTab === 'mine') {
        result = result.filter((c) => c.participants.some((p) => p.id === 'U001'));
      } else {
        result = result.filter((c) => c.status === statusTab);
      }
    }
    if (emergencyOnly) {
      result = result.filter((c) => c.type === 'emergency');
    }
    return result;
  }, [consultations, statusTab, emergencyOnly, searchText]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="p-6 max-w-[1600px] mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">会诊协作</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">多学科专家协同会诊，高效解决疑难病例</p>
          </div>
          <button onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-medical-500 to-medical-600 hover:from-medical-600 hover:to-medical-700 text-white rounded-lg font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.98]">
            <Plus className="w-4.5 h-4.5" />发起会诊
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="进行中会诊" value={stats.active} icon={Activity} tone="green" />
          <StatCard label="本月新增" value={stats.monthNew} icon={TrendingUp} tone="blue" />
          <StatCard label="平均时长" value={stats.avgDuration} icon={Clock} tone="purple" />
          <StatCard label="待处理邀请" value={stats.pendingInvites} icon={UserPlus} tone="amber" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="搜索会诊标题/主持人/参与人..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-medical-500/30 focus:border-medical-500 transition-all" />
            </div>
            <button onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={cn('inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border',
                emergencyOnly
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 ring-2 ring-red-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-300 hover:text-red-600 dark:hover:border-red-800 dark:hover:text-red-400')}>
              <AlertTriangle className={cn('w-4 h-4', emergencyOnly ? 'text-red-500' : '')} />仅看紧急
            </button>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {STATUS_TABS.map((tab) => {
              const isActive = statusTab === tab.key;
              const count = tab.key === 'all' ? consultations.length
                : tab.key === 'mine' ? consultations.filter((c) => c.participants.some((p) => p.id === 'U001')).length
                  : consultations.filter((c) => c.status === tab.key).length;
              const activeColors: Record<string, string> = {
                all: 'bg-slate-800 text-white shadow-md dark:bg-slate-200 dark:text-slate-900',
                active: 'bg-green-500 text-white shadow-md shadow-green-500/25',
                pending: 'bg-amber-500 text-white shadow-md shadow-amber-500/25',
                ended: 'bg-slate-500 text-white shadow-md shadow-slate-500/25',
                mine: 'bg-medical-500 text-white shadow-md shadow-medical-500/25',
              };
              return (
                <button key={tab.key} onClick={() => setStatusTab(tab.key)}
                  className={cn('px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border',
                    isActive ? activeColors[tab.key] + ' border-transparent scale-[1.02]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-medical-300 hover:text-medical-600 dark:hover:border-medical-700 dark:hover:text-medical-400')}>
                  {tab.label}
                  <span className={cn('ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400')}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {filteredConsultations.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Filter className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium text-lg">暂无匹配的会诊记录</p>
              <p className="text-sm text-slate-400">请尝试调整筛选条件或发起新的会诊</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConsultations.map((c) => (
              <ConsultationCard key={c.id} consultation={c}
                onEnter={() => onEnterConsultation(c.id)}
                onViewSummary={() => onEnterConsultation(c.id)} />
            ))}
          </div>
        )}
      </div>
      <CreateConsultationModal open={onCreateOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
    </div>
  );
};

const ConsultationDetail = ({
  consultation,
  onBack,
}: {
  consultation: Consultation;
  onBack: () => void;
}) => {
  const { sendMessage, endConsultation } = useConsultationStore();
  const currentUserId = 'U001';
  const currentUserName = '王主任';

  const handleSend = (content: string, type: 'text' | 'image' | 'keyImage') => {
    sendMessage(currentUserId, currentUserName, content, type);
  };

  const handleEnd = () => {
    endConsultation(consultation.id);
  };

  const handleExport = () => {
    alert('正在导出PDF...');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <div className="h-[calc(100vh-2rem)] max-w-[1800px] mx-auto grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-3 xl:col-span-3 min-h-0">
          <MiniViewer studyId={consultation.studyId} />
        </div>
        <div className="col-span-12 lg:col-span-6 xl:col-span-6 min-h-0">
          <ChatPanel consultation={consultation} onSend={handleSend} onEnd={handleEnd} onBack={onBack} />
        </div>
        <div className="col-span-12 lg:col-span-3 xl:col-span-3 min-h-0">
          <InfoPanel consultation={consultation} onExport={handleExport} />
        </div>
      </div>
    </div>
  );
};

export default function ConsultationPage() {
  const { consultations, activeConsultationId, createConsultation } = useConsultationStore();
  const [createOpen, setCreateOpen] = useState(false);

  const activeConsultation = useMemo(
    () => consultations.find((c) => c.id === activeConsultationId) || null,
    [consultations, activeConsultationId]
  );

  const handleEnterConsultation = (id: string) => {
    useConsultationStore.setState({ activeConsultationId: id });
  };

  const handleBack = () => {
    useConsultationStore.setState({ activeConsultationId: null });
  };

  const handleCreate = (studyId: string, title: string, participants: { id: string; name: string; role: UserRole }[]) => {
    createConsultation(studyId, title, 'U001', participants);
  };

  if (activeConsultation) {
    return <ConsultationDetail consultation={activeConsultation} onBack={handleBack} />;
  }

  return (
    <ConsultationList
      onEnterConsultation={handleEnterConsultation}
      onCreateOpen={createOpen}
      setCreateOpen={setCreateOpen}
      handleCreate={handleCreate}
    />
  );
}

