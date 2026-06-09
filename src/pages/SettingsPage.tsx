import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Settings as SettingsIcon,
  BarChart3,
  Calendar,
  Users,
  Activity,
  FileText,
  ShieldCheck,
  Search,
  ChevronDown,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Save,
  User,
  Mail,
  Phone,
  Lock,
  Bell,
  Inbox,
  MessageSquare,
  Smartphone,
  Layers,
  Maximize2,
  MousePointer,
  FileSpreadsheet,
  ClipboardList,
  PenTool,
  PieChart as PieChartIcon,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

const LAYOUT_OPTIONS = ['1x1', '2x2', '3x3', '4x4'];
const WW_PRESETS = [
  { value: 'lung', label: '肺窗 (WW:1500/WL:-600)' },
  { value: 'mediastinal', label: '纵隔窗 (WW:350/WL:40)' },
  { value: 'bone', label: '骨窗 (WW:1500/WL:300)' },
  { value: 'brain', label: '脑窗 (WW:80/WL:40)' },
  { value: 'soft', label: '软组织窗 (WW:400/WL:50)' },
];
const MOUSE_WHEEL = [
  { value: 'zoom', label: '缩放' },
  { value: 'slice', label: '切换序列' },
];
const NOTIFY_CHANNELS = [
  { value: 'inbox', label: '站内信', icon: Inbox },
  { value: 'email', label: '邮件', icon: Mail },
  { value: 'sms', label: '短信', icon: Smartphone },
];
const REPORT_TEMPLATES = [
  { id: 1, name: '胸部CT平扫报告模板', category: '胸部', modality: 'CT', used: 328, updated: '2025-06-05' },
  { id: 2, name: '头颅MRI平扫报告模板', category: '头部', modality: 'MR', used: 186, updated: '2025-06-01' },
  { id: 3, name: '腹部CT增强报告模板', category: '腹部', modality: 'CT', used: 245, updated: '2025-06-03' },
  { id: 4, name: '腰椎MRI报告模板', category: '脊柱', modality: 'MR', used: 156, updated: '2025-05-28' },
  { id: 5, name: '胸部DR体检报告模板', category: '胸部', modality: 'DR', used: 412, updated: '2025-06-07' },
  { id: 6, name: '膝关节MR报告模板', category: '关节', modality: 'MR', used: 98, updated: '2025-05-30' },
];
const DOCTORS_DATA = [
  { name: '张明华', reports: 156, reviews: 132, avgTime: 18.5 },
  { name: '李思远', reports: 142, reviews: 118, avgTime: 20.3 },
  { name: '王建国', reports: 138, reviews: 125, avgTime: 16.8 },
  { name: '陈晓峰', reports: 125, reviews: 108, avgTime: 22.1 },
  { name: '刘志强', reports: 118, reviews: 95, avgTime: 19.7 },
  { name: '赵文博', reports: 105, reviews: 88, avgTime: 21.5 },
  { name: '孙明辉', reports: 98, reviews: 76, avgTime: 24.2 },
  { name: '李雅琴', reports: 112, reviews: 102, avgTime: 17.6 },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('statistics');

  const [statDateRange, setStatDateRange] = useState<[string, string]>(['2025-06-01', '2025-06-09']);
  const [statDept, setStatDept] = useState('all');
  const [statDoctor, setStatDoctor] = useState('all');

  const [defaultLayout, setDefaultLayout] = useState('2x2');
  const [wwPreset, setWwPreset] = useState('mediastinal');
  const [mouseWheel, setMouseWheel] = useState('zoom');
  const [autoFit, setAutoFit] = useState(true);

  const [notifyNew, setNotifyNew] = useState(true);
  const [notifyReview, setNotifyReview] = useState(true);
  const [notifyConsult, setNotifyConsult] = useState(true);
  const [channels, setChannels] = useState<string[]>(['inbox', 'email']);

  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<number | null>(null);

  const [pwdOld, setPwdOld] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [showPwdOld, setShowPwdOld] = useState(false);
  const [showPwdNew, setShowPwdNew] = useState(false);
  const [showPwdConfirm, setShowPwdConfirm] = useState(false);
  const [signature, setSignature] = useState('主任医师 张明华');

  const workBarOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['报告数', '审核数'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '40px', containLabel: true },
    xAxis: { type: 'category', data: DOCTORS_DATA.map(d => d.name), axisLabel: { rotate: 30, fontSize: 11 } },
    yAxis: { type: 'value' },
    series: [
      { name: '报告数', type: 'bar', data: DOCTORS_DATA.map(d => d.reports),
        itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#60A5FA' }, { offset: 1, color: '#1D4ED8' }] }, borderRadius: [6, 6, 0, 0] }, barWidth: '30%' },
      { name: '审核数', type: 'bar', data: DOCTORS_DATA.map(d => d.reviews),
        itemStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#34D399' }, { offset: 1, color: '#059669' }] }, borderRadius: [6, 6, 0, 0] }, barWidth: '30%' },
    ],
  };

  const effChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['报告数', '平均耗时(分钟)'], top: 0 },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '40px', containLabel: true },
    xAxis: { type: 'category', data: DOCTORS_DATA.map(d => d.name), axisLabel: { rotate: 30, fontSize: 11 } },
    yAxis: [
      { type: 'value', name: '报告数', position: 'left' },
      { type: 'value', name: '分钟', position: 'right', axisLine: { lineStyle: { color: '#F59E0B' } }, axisLabel: { color: '#F59E0B' } },
    ],
    series: [
      { name: '报告数', type: 'bar', data: DOCTORS_DATA.map(d => d.reports),
        itemStyle: { color: 'rgba(59,130,246,0.75)', borderRadius: [6, 6, 0, 0] }, barWidth: '35%' },
      { name: '平均耗时(分钟)', type: 'line', yAxisIndex: 1, smooth: true,
        data: DOCTORS_DATA.map(d => d.avgTime), lineStyle: { color: '#F59E0B', width: 3 },
        itemStyle: { color: '#F59E0B' }, symbol: 'circle', symbolSize: 8,
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,158,11,0.25)' }, { offset: 1, color: 'rgba(245,158,11,0.02)' }] } },
      },
    ],
  };

  const deptPieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: '5%', top: 'center' },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
      label: { show: true, formatter: '{b}\n{d}%' },
      data: [
        { value: 485, name: '放射科', itemStyle: { color: '#3B82F6' } },
        { value: 320, name: '影像中心', itemStyle: { color: '#10B981' } },
        { value: 198, name: '介入科', itemStyle: { color: '#F59E0B' } },
        { value: 156, name: '核医学', itemStyle: { color: '#8B5CF6' } },
        { value: 112, name: '超声科', itemStyle: { color: '#EC4899' } },
      ],
    }],
  };

  const statKpis = [
    { label: '总检查数', value: '1,271', icon: Activity, tone: 'blue', change: '+12.5%' },
    { label: '总报告数', value: '1,124', icon: FileText, tone: 'violet', change: '+8.3%' },
    { label: '总审核数', value: '1,056', icon: ShieldCheck, tone: 'emerald', change: '+10.1%' },
    { label: '平均效率', value: '19.2分', icon: TrendingUp, tone: 'amber', change: '-4.2%' },
  ];

  const workDetailRows = DOCTORS_DATA.map((d, idx) => ({
    rank: idx + 1,
    doctor: d.name,
    dept: ['放射科', '影像中心', '介入科', '放射科', '影像中心', '核医学', '放射科', '超声科'][idx],
    studies: d.reports + 28,
    reports: d.reports,
    reviews: d.reviews,
    avgTime: d.avgTime,
    sla: 92 + (idx * 3) % 8,
  }));

  const toggleChannel = (ch: string) => {
    setChannels((prev) => prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]);
  };

  const Switch = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) => (
    <div className="flex items-center gap-2.5">
      <button type="button" onClick={onChange} role="switch" aria-checked={checked}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
          checked ? 'bg-blue-600' : 'bg-slate-200'
        )}>
        <span className={cn(
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )} />
      </button>
      {label && <span className="text-sm text-slate-700">{label}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-[1600px] mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">统计与设置</h1>
            <p className="text-sm text-slate-500 mt-1">工作量统计、系统偏好与个性化配置</p>
          </div>
        </div>

        <Tabs defaultValue="statistics" value={tab} onValueChange={setTab}>
          <TabsList className="h-11 px-1.5 gap-1">
            <TabsTrigger value="statistics" className="h-8 px-4">
              <BarChart3 className="w-4 h-4 mr-2" />工作量统计
            </TabsTrigger>
            <TabsTrigger value="settings" className="h-8 px-4">
              <SettingsIcon className="w-4 h-4 mr-2" />系统设置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="statistics">
            <Card className="mb-5">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">统计周期</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <input type="date" value={statDateRange[0]}
                        onChange={(e) => setStatDateRange([e.target.value, statDateRange[1]])}
                        className="bg-transparent text-sm text-slate-800 outline-none w-[110px]" />
                      <span className="text-slate-400 text-xs">-</span>
                      <input type="date" value={statDateRange[1]}
                        onChange={(e) => setStatDateRange([statDateRange[0], e.target.value])}
                        className="bg-transparent text-sm text-slate-800 outline-none w-[110px]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">科室</label>
                    <Select options={[
                      { value: 'all', label: '全部科室' },
                      { value: 'radiology', label: '放射科' },
                      { value: 'imaging', label: '影像中心' },
                      { value: 'intervention', label: '介入科' },
                    ]} value={statDept} onChange={setStatDept} className="w-36" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">医生</label>
                    <Select options={[
                      { value: 'all', label: '全部医生' },
                      ...DOCTORS_DATA.map(d => ({ value: d.name, label: d.name })),
                    ]} value={statDoctor} onChange={setStatDoctor} className="w-36" />
                  </div>
                  <div className="flex items-end gap-2 ml-auto">
                    <Button variant="secondary"><FileSpreadsheet className="w-4 h-4 mr-1.5" />导出报表</Button>
                    <Button><Search className="w-4 h-4 mr-1.5" />刷新统计</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {statKpis.map((k) => {
                const Icon = k.icon;
                const isUp = k.change.startsWith('+');
                return (
                  <Card key={k.label}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-slate-500 font-medium">{k.label}</p>
                          <p className="text-2xl font-bold text-slate-900 mt-2">{k.value}</p>
                          <span className={cn(
                            'inline-flex items-center gap-1 mt-2 text-xs font-medium px-2 py-0.5 rounded-full',
                            isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          )}>
                            {isUp ? <TrendingUp className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {k.change} 环比
                          </span>
                        </div>
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          k.tone === 'blue' && 'bg-blue-500/10 text-blue-600',
                          k.tone === 'violet' && 'bg-violet-500/10 text-violet-600',
                          k.tone === 'emerald' && 'bg-emerald-500/10 text-emerald-600',
                          k.tone === 'amber' && 'bg-amber-500/10 text-amber-600',
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    医生工作量对比
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts option={workBarOption} style={{ height: '320px' }} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    效率分析：报告数 vs 平均耗时
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts option={effChartOption} style={{ height: '320px' }} />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-violet-600" />
                    科室工作量分布
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts option={deptPieOption} style={{ height: '280px' }} />
                </CardContent>
              </Card>
              <Card className="lg:col-span-2 p-0">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-amber-600" />
                    工作量明细
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[300px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white">
                        <TableRow>
                          <TableHead className="w-16">排名</TableHead>
                          <TableHead>医生</TableHead>
                          <TableHead>科室</TableHead>
                          <TableHead className="text-center">检查数</TableHead>
                          <TableHead className="text-center">报告数</TableHead>
                          <TableHead className="text-center">审核数</TableHead>
                          <TableHead className="text-center">平均耗时</TableHead>
                          <TableHead className="text-center">SLA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workDetailRows.map((r) => (
                          <TableRow key={r.rank}>
                            <TableCell>
                              <span className={cn(
                                'inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold',
                                r.rank === 1 ? 'bg-amber-100 text-amber-700'
                                  : r.rank === 2 ? 'bg-slate-200 text-slate-700'
                                  : r.rank === 3 ? 'bg-orange-100 text-orange-700'
                                  : 'bg-slate-100 text-slate-500'
                              )}>{r.rank}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-medical-600 flex items-center justify-center text-[11px] font-bold text-white">
                                  {r.doctor.charAt(0)}
                                </div>
                                <span className="text-sm font-semibold text-slate-900">{r.doctor}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{r.dept}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{r.studies}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{r.reports}</TableCell>
                            <TableCell className="text-center text-sm font-mono">{r.reviews}</TableCell>
                            <TableCell className="text-center">
                              <span className={cn(
                                'text-sm font-mono font-semibold',
                                r.avgTime < 20 ? 'text-emerald-600' : r.avgTime < 23 ? 'text-blue-600' : 'text-amber-600'
                              )}>{r.avgTime}分</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn(
                                'text-sm font-mono font-semibold',
                                r.sla >= 95 ? 'text-emerald-600' : r.sla >= 90 ? 'text-blue-600' : 'text-amber-600'
                              )}>{r.sla}%</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    阅片偏好
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2.5 block">默认窗口布局</label>
                    <div className="grid grid-cols-4 gap-2">
                      {LAYOUT_OPTIONS.map((l) => {
                        const isActive = defaultLayout === l;
                        const [cols] = l.split('x').map(Number);
                        return (
                          <button key={l} onClick={() => setDefaultLayout(l)}
                            className={cn(
                              'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                              isActive ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-100' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            )}>
                            <div className={cn(
                              'grid gap-0.5 w-10 h-10 rounded overflow-hidden border',
                              cols === 1 ? 'grid-cols-1 grid-rows-1'
                                : cols === 2 ? 'grid-cols-2 grid-rows-2'
                                : cols === 3 ? 'grid-cols-3 grid-rows-3'
                                : 'grid-cols-4 grid-rows-4'
                            )}>
                              {Array.from({ length: cols * cols }).map((_, i) => (
                                <div key={i} className={cn(isActive ? 'bg-blue-400' : 'bg-slate-300')} />
                              ))}
                            </div>
                            <span className={cn('text-xs font-medium', isActive ? 'text-blue-700' : 'text-slate-600')}>{l}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">默认窗宽窗位预设</label>
                    <Select options={WW_PRESETS} value={wwPreset} onChange={setWwPreset} />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2.5 block">鼠标滚轮行为</label>
                    <div className="grid grid-cols-2 gap-2">
                      {MOUSE_WHEEL.map((m) => {
                        const Icon = m.value === 'zoom' ? Maximize2 : MousePointer;
                        return (
                          <button key={m.value} onClick={() => setMouseWheel(m.value)}
                            className={cn(
                              'flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all',
                              mouseWheel === m.value
                                ? 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-100'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            )}>
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <Maximize2 className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">自动适配窗口</div>
                        <div className="text-xs text-slate-500">加载影像时自动适配到窗口大小</div>
                      </div>
                    </div>
                    <Switch checked={autoFit} onChange={() => setAutoFit(!autoFit)} />
                  </div>

                  <div className="pt-2">
                    <Button className="w-full"><Save className="w-4 h-4 mr-1.5" />保存阅片偏好</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 text-violet-600" />
                      报告模板维护
                    </span>
                    <Button size="sm" onClick={() => { setEditingTemplate(null); setTemplateModalOpen(true); }}>
                      <Plus className="w-3.5 h-3.5 mr-1" />新增
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>模板名称</TableHead>
                        <TableHead>分类</TableHead>
                        <TableHead>Modality</TableHead>
                        <TableHead className="text-center">使用次数</TableHead>
                        <TableHead>更新时间</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {REPORT_TEMPLATES.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <PenTool className="w-3.5 h-3.5 text-violet-500" />
                              <span className="text-sm font-medium text-slate-800">{t.name}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="info">{t.category}</Badge></TableCell>
                          <TableCell><Badge variant="default">{t.modality}</Badge></TableCell>
                          <TableCell className="text-center text-sm font-mono text-slate-700">{t.used}</TableCell>
                          <TableCell className="text-xs text-slate-500">{t.updated}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setEditingTemplate(t.id); setTemplateModalOpen(true); }}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-600" />
                    通知设置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3.5">
                    {[
                      { key: 'new', label: '新申请通知', desc: '有新检查申请待接收时通知', checked: notifyNew, set: setNotifyNew, icon: Inbox },
                      { key: 'review', label: '报告审核结果', desc: '报告审核完成或退回时通知', checked: notifyReview, set: setNotifyReview, icon: ShieldCheck },
                      { key: 'consult', label: '会诊邀请', desc: '收到远程会诊邀请时通知', checked: notifyConsult, set: setNotifyConsult, icon: MessageSquare },
                    ].map((n) => {
                      const Icon = n.icon;
                      return (
                        <div key={n.key} className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-800">{n.label}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{n.desc}</div>
                            </div>
                          </div>
                          <Switch checked={n.checked} onChange={() => n.set(!n.checked)} />
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2.5 block">通知方式</label>
                    <div className="grid grid-cols-3 gap-2">
                      {NOTIFY_CHANNELS.map((c) => {
                        const Icon = c.icon;
                        const active = channels.includes(c.value);
                        return (
                          <button key={c.value} onClick={() => toggleChannel(c.value)}
                            className={cn(
                              'flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all',
                              active ? 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-100' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                            )}>
                            <Icon className="w-5 h-5" />
                            <span className="text-xs font-medium">{c.label}</span>
                            <div className={cn('w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center', active ? 'bg-blue-600 border-blue-600' : 'border-slate-300')}>
                              {active && <CheckCircle className="w-3 h-3 text-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-1">
                    <Button className="w-full"><Save className="w-4 h-4 mr-1.5" />保存通知设置</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    账户信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-emerald-50/60 to-blue-50/60 border border-emerald-100/60">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-medical-600 flex items-center justify-center text-xl font-bold text-white shadow-md shrink-0">
                      张
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-bold text-slate-900">张明华</div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" />主任医师</span>
                        <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />放射科</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />工号: DOC10086</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />zhangmh@pacs.com</span>
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />138****8888</span>
                      </div>
                    </div>
                    <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />已认证</Badge>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />修改密码
                      </label>
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="space-y-2.5">
                      <div className="relative">
                        <Input type={showPwdOld ? 'text' : 'password'} placeholder="当前密码" value={pwdOld} onChange={(e) => setPwdOld(e.target.value)}
                          suffix={
                            <button type="button" onClick={() => setShowPwdOld(!showPwdOld)} className="text-slate-400 hover:text-slate-600">
                              {showPwdOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          } />
                      </div>
                      <div className="relative">
                        <Input type={showPwdNew ? 'text' : 'password'} placeholder="新密码" value={pwdNew} onChange={(e) => setPwdNew(e.target.value)}
                          suffix={
                            <button type="button" onClick={() => setShowPwdNew(!showPwdNew)} className="text-slate-400 hover:text-slate-600">
                              {showPwdNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          } />
                      </div>
                      <div className="relative">
                        <Input type={showPwdConfirm ? 'text' : 'password'} placeholder="确认新密码" value={pwdConfirm} onChange={(e) => setPwdConfirm(e.target.value)}
                          suffix={
                            <button type="button" onClick={() => setShowPwdConfirm(!showPwdConfirm)} className="text-slate-400 hover:text-slate-600">
                              {showPwdConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          } />
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-2.5 w-full h-9 text-blue-600 hover:bg-blue-50">
                      <Save className="w-4 h-4 mr-1.5" />更新密码
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-600 mb-2 block flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5" />快捷签名
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input value={signature} onChange={(e) => setSignature(e.target.value)} />
                      </div>
                      <Button><Save className="w-4 h-4 mr-1.5" />保存</Button>
                    </div>
                    <div className="mt-3 p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center">
                      <div className="text-sm text-slate-500 mb-1">签名预览</div>
                      <div className="text-lg font-semibold text-slate-800 italic tracking-wide">{signature}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Modal open={templateModalOpen} onClose={() => setTemplateModalOpen(false)}
        title={editingTemplate ? '编辑报告模板' : '新增报告模板'}
        className="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setTemplateModalOpen(false)}>取消</Button>
            <Button onClick={() => setTemplateModalOpen(false)}><Save className="w-4 h-4 mr-1.5" />保存模板</Button>
          </>
        }>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">模板名称</label>
              <Input placeholder="请输入模板名称" defaultValue={editingTemplate ? REPORT_TEMPLATES.find(t => t.id === editingTemplate)?.name : ''} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">所属分类</label>
              <Select options={[
                { value: 'chest', label: '胸部' },
                { value: 'head', label: '头部' },
                { value: 'abdomen', label: '腹部' },
                { value: 'spine', label: '脊柱' },
                { value: 'joint', label: '关节' },
              ]} value="chest" onChange={() => {}} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">适用Modality</label>
              <Select options={[
                { value: 'CT', label: 'CT' },
                { value: 'MR', label: 'MR' },
                { value: 'DR', label: 'DR' },
                { value: 'US', label: 'US' },
              ]} value="CT" onChange={() => {}} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">模板版本</label>
              <Input placeholder="v1.0" defaultValue="v1.0" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">模板关键词（逗号分隔）</label>
            <Input placeholder="如：肺结节,磨玻璃,钙化" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">影像所见（模板内容）</label>
            <textarea rows={5} placeholder="胸廓对称，双肺纹理清晰..."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1.5 block">诊断印象</label>
            <textarea rows={3} placeholder="1. 未见明显异常..."
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
