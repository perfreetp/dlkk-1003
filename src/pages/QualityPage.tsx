import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  AlertTriangle,
  Clock,
  FileCheck2,
  BarChart3,
  Calendar,
  ChevronDown,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  ExternalLink,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Award,
  PieChart as PieChartIcon,
  ShieldCheck,
  Users,
  Activity,
  Target,
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
import { qualityStats } from '@/mock/quality';
import { cn } from '@/lib/utils';

const MODALITY_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'CT', label: 'CT' },
  { value: 'MRI', label: 'MR' },
  { value: 'X-Ray', label: 'DR' },
  { value: 'Ultrasound', label: 'US' },
];

const BODY_PART_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: '胸部', label: '胸部' },
  { value: '头部', label: '头部' },
  { value: '腹部', label: '腹部' },
  { value: '腰椎', label: '腰椎' },
];

const DOCTORS = [
  { rank: 1, name: '张明华', reports: 156, completeness: 95, accuracy: 92, punctuality: 98, total: 95 },
  { rank: 2, name: '李思远', reports: 142, completeness: 93, accuracy: 90, punctuality: 96, total: 93 },
  { rank: 3, name: '王建国', reports: 138, completeness: 91, accuracy: 89, punctuality: 95, total: 91 },
  { rank: 4, name: '陈晓峰', reports: 125, completeness: 90, accuracy: 88, punctuality: 93, total: 90 },
  { rank: 5, name: '刘志强', reports: 118, completeness: 88, accuracy: 87, punctuality: 92, total: 89 },
  { rank: 6, name: '赵文博', reports: 105, completeness: 87, accuracy: 85, punctuality: 90, total: 87 },
  { rank: 7, name: '孙明辉', reports: 98, completeness: 86, accuracy: 84, punctuality: 88, total: 86 },
];

export default function QualityPage() {
  const { summary, missingDetections, timelinessStats, qualityRecords } = qualityStats;

  const [tab, setTab] = useState('missing');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [modalityFilter, setModalityFilter] = useState('all');
  const [bodyPartFilter, setBodyPartFilter] = useState('all');
  const [dateRange, setDateRange] = useState<[string, string]>(['2025-06-01', '2025-06-09']);
  const [selectedDoctor, setSelectedDoctor] = useState(DOCTORS[0]);
  const [reportDateRange, setReportDateRange] = useState<[string, string]>(['2025-06-01', '2025-06-09']);
  const [exportType, setExportType] = useState('monthly');

  const filteredMissing = useMemo(() => {
    return missingDetections.filter((m) => {
      if (modalityFilter !== 'all' && m.modality !== modalityFilter) return false;
      if (bodyPartFilter !== 'all' && m.bodyPart !== bodyPartFilter) return false;
      if ((m.confidence * 100) < confidenceThreshold) return false;
      return true;
    });
  }, [missingDetections, modalityFilter, bodyPartFilter, confidenceThreshold]);

  const kpis = [
    { label: '总可疑数', value: summary.totalMissingDetected, icon: AlertTriangle, tone: 'amber' },
    { label: '已复核', value: summary.totalMissingDetected - summary.pendingMissing, icon: FileCheck2, tone: 'blue' },
    { label: '确认漏报', value: summary.confirmedMissing, icon: ShieldCheck, tone: 'red' },
    { label: '准确率', value: `${Math.round((summary.confirmedMissing / (summary.confirmedMissing + summary.rejectedMissing)) * 100)}%`, icon: Target, tone: 'green' },
  ];

  const overdueList = [
    { patient: '王建国', accession: 'ACC20250609001', stage: '报告-审核', overtime: '2小时15分', owner: '李思远', status: 'pending' },
    { patient: '刘美华', accession: 'ACC20250609002', stage: '阅片-报告', overtime: '1小时48分', owner: '张明华', status: 'pending' },
    { patient: '陈志强', accession: 'ACC20250609003', stage: '接收-阅片', overtime: '3小时02分', owner: '王建国', status: 'processing' },
    { patient: '赵晓燕', accession: 'ACC20250609004', stage: '报告-审核', overtime: '45分钟', owner: '陈晓峰', status: 'pending' },
    { patient: '孙文博', accession: 'ACC20250609005', stage: '阅片-报告', overtime: '58分钟', owner: '刘志强', status: 'resolved' },
  ];

  const slaItems = [
    { name: '接收-阅片', avg: '12分钟', rate: 92, color: 'from-blue-500 to-blue-600' },
    { name: '阅片-报告', avg: '38分钟', rate: 85, color: 'from-amber-500 to-orange-500' },
    { name: '报告-审核', avg: '22分钟', rate: 88, color: 'from-emerald-500 to-green-600' },
  ];

  const timelinessChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['接收-阅片', '阅片-报告', '报告-审核'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '40px', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timelinessStats.map((t) => t.date.slice(5)),
    },
    yAxis: { type: 'value', name: '分钟' },
    series: [
      {
        name: '接收-阅片',
        type: 'line',
        smooth: true,
        data: timelinessStats.map((t) => t.avgReceiveTime),
        lineStyle: { color: '#3B82F6', width: 2 },
        itemStyle: { color: '#3B82F6' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.3)' }, { offset: 1, color: 'rgba(59,130,246,0.02)' }] } },
      },
      {
        name: '阅片-报告',
        type: 'line',
        smooth: true,
        data: timelinessStats.map((t) => t.avgReportTime),
        lineStyle: { color: '#F59E0B', width: 2 },
        itemStyle: { color: '#F59E0B' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(245,158,11,0.3)' }, { offset: 1, color: 'rgba(245,158,11,0.02)' }] } },
      },
      {
        name: '报告-审核',
        type: 'line',
        smooth: true,
        data: timelinessStats.map((t) => t.avgAuditTime),
        lineStyle: { color: '#10B981', width: 2 },
        itemStyle: { color: '#10B981' },
        areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(16,185,129,0.3)' }, { offset: 1, color: 'rgba(16,185,129,0.02)' }] } },
      },
    ],
  };

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '完整性', max: 100 },
        { name: '准确度', max: 100 },
        { name: '按时率', max: 100 },
        { name: '规范性', max: 100 },
        { name: '专业度', max: 100 },
        { name: '响应速度', max: 100 },
      ],
      radius: '65%',
      axisName: { color: '#64748B', fontSize: 12 },
      splitArea: { areaStyle: { color: ['rgba(59,130,246,0.02)', 'rgba(59,130,246,0.05)'] } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [selectedDoctor.completeness, selectedDoctor.accuracy, selectedDoctor.punctuality, 88, 90, 85],
            name: selectedDoctor.name,
            areaStyle: { color: 'rgba(59,130,246,0.25)' },
            lineStyle: { color: '#2563EB', width: 2 },
            itemStyle: { color: '#2563EB' },
          },
        ],
      },
    ],
  };

  const scorePieOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { orient: 'vertical', right: '5%', top: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 125, name: '优秀(90-100)', itemStyle: { color: '#10B981' } },
          { value: 268, name: '良好(80-89)', itemStyle: { color: '#3B82F6' } },
          { value: 89, name: '合格(70-79)', itemStyle: { color: '#F59E0B' } },
          { value: 23, name: '不合格(<70)', itemStyle: { color: '#EF4444' } },
        ],
      },
    ],
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMissing.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMissing.map((m) => m.id));
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; label: string }> = {
      confirmed: { variant: 'danger', label: '已确认漏报' },
      pending: { variant: 'warning', label: '待复核' },
      rejected: { variant: 'info', label: '已驳回' },
    };
    const cfg = map[status] || map.pending;
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-[1600px] mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">质控中心</h1>
            <p className="text-sm text-slate-500 mt-1">AI辅助质控、时效监控与质量评分管理</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md">
              <Calendar className="w-4 h-4" />
              数据更新: 2025-06-09 14:30
            </Button>
          </div>
        </div>

        <Tabs defaultValue="missing" value={tab} onValueChange={setTab}>
          <TabsList className="h-11 px-1.5 gap-1">
            <TabsTrigger value="missing" className="h-8 px-4">
              <AlertTriangle className="w-4 h-4 mr-2" />
              漏报检测
            </TabsTrigger>
            <TabsTrigger value="timeliness" className="h-8 px-4">
              <Clock className="w-4 h-4 mr-2" />
              时效监控
            </TabsTrigger>
            <TabsTrigger value="score" className="h-8 px-4">
              <Award className="w-4 h-4 mr-2" />
              质量评分
            </TabsTrigger>
            <TabsTrigger value="reports" className="h-8 px-4">
              <BarChart3 className="w-4 h-4 mr-2" />
              质控报表
            </TabsTrigger>
          </TabsList>

          <TabsContent value="missing">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              {kpis.map((k) => (
                <Card key={k.label}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500 font-medium">{k.label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-2">{k.value}</p>
                      </div>
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        k.tone === 'amber' && 'bg-amber-500/10 text-amber-600',
                        k.tone === 'blue' && 'bg-blue-500/10 text-blue-600',
                        k.tone === 'red' && 'bg-red-500/10 text-red-600',
                        k.tone === 'green' && 'bg-emerald-500/10 text-emerald-600',
                      )}>
                        <k.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>筛选条件</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <input type="date" value={dateRange[0]} onChange={(e) => setDateRange([e.target.value, dateRange[1]])}
                      className="bg-transparent text-sm text-slate-800 outline-none w-[120px]" />
                    <span className="text-slate-400 text-xs">至</span>
                    <input type="date" value={dateRange[1]} onChange={(e) => setDateRange([dateRange[0], e.target.value])}
                      className="bg-transparent text-sm text-slate-800 outline-none w-[120px]" />
                  </div>
                  <Select options={MODALITY_OPTIONS} value={modalityFilter} onChange={setModalityFilter} className="w-32" />
                  <Select options={BODY_PART_OPTIONS} value={bodyPartFilter} onChange={setBodyPartFilter} className="w-32" />
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 min-w-[240px]">
                    <span className="text-sm text-slate-600 whitespace-nowrap">置信度≥</span>
                    <input type="range" min="50" max="95" value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                      className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    <span className="text-sm font-semibold text-blue-600 w-12 text-right">{confidenceThreshold}%</span>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <Input prefix={<Search className="w-4 h-4" />} placeholder="搜索患者/检查号..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-5">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle>漏报病例列表 ({filteredMissing.length})</CardTitle>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <span>已选 <b className="text-blue-600">{selectedIds.length}</b> 项</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input type="checkbox" checked={selectedIds.length === filteredMissing.length && filteredMissing.length > 0}
                          onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                      </TableHead>
                      <TableHead>患者信息</TableHead>
                      <TableHead>检查号</TableHead>
                      <TableHead>Modality</TableHead>
                      <TableHead>部位</TableHead>
                      <TableHead>可疑问题描述</TableHead>
                      <TableHead>AI置信度</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMissing.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <input type="checkbox" checked={selectedIds.includes(m.id)}
                            onChange={() => toggleSelect(m.id)} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-medical-600 flex items-center justify-center text-sm font-bold text-white">
                              {m.patientName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-slate-900">{m.patientName}</div>
                              <div className="text-xs text-slate-500">{m.patientId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{m.accessionNumber}</TableCell>
                        <TableCell>
                          <Badge variant="info">{m.modality === 'MRI' ? 'MR' : m.modality === 'X-Ray' ? 'DR' : m.modality === 'Ultrasound' ? 'US' : m.modality}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{m.bodyPart}</TableCell>
                        <TableCell className="text-sm text-slate-700 max-w-[320px]">
                          <div className="line-clamp-2" title={m.detectedIssue}>{m.detectedIssue}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={cn(
                                'h-full rounded-full',
                                m.confidence >= 0.9 ? 'bg-red-500' : m.confidence >= 0.8 ? 'bg-amber-500' : 'bg-blue-500'
                              )} style={{ width: `${m.confidence * 100}%` }} />
                            </div>
                            <span className="text-xs font-mono font-semibold text-slate-700">{Math.round(m.confidence * 100)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{statusBadge(m.reviewStatus)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5 mr-1" />标记已阅</Button>
                            <Button variant="ghost" size="sm"><CheckCircle className="w-3.5 h-3.5 mr-1" />复核</Button>
                            <Button variant="ghost" size="sm"><ExternalLink className="w-3.5 h-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <div className="text-sm text-slate-500">共 {filteredMissing.length} 条记录</div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" disabled={selectedIds.length === 0}>
                    <XCircle className="w-4 h-4 mr-1.5" />批量驳回
                  </Button>
                  <Button variant="secondary" size="sm" disabled={selectedIds.length === 0}>
                    <CheckCircle className="w-4 h-4 mr-1.5" />批量确认
                  </Button>
                  <Button size="sm" disabled={selectedIds.length === 0}>
                    <FileSpreadsheet className="w-4 h-4 mr-1.5" />导出选中
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="timeliness">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {[
                { label: '本月平均报告时长', value: '38', unit: '分钟', icon: FileText, tone: 'blue', change: '+5%' },
                { label: '本月平均审核时长', value: '22', unit: '分钟', icon: ShieldCheck, tone: 'emerald', change: '-3%' },
                { label: '本月SLA达成率', value: '91.2', unit: '%', icon: TrendingUp, tone: 'violet', change: '+2.1%' },
              ].map((k) => (
                <Card key={k.label}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-500 font-medium">{k.label}</p>
                        <div className="flex items-baseline gap-1.5 mt-3">
                          <span className="text-3xl font-bold text-slate-900">{k.value}</span>
                          <span className="text-lg font-medium text-slate-500">{k.unit}</span>
                        </div>
                        <div className="mt-2">
                          <span className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            k.change.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          )}>
                            {k.change} 较上月
                          </span>
                        </div>
                      </div>
                      <div className={cn(
                        'w-14 h-14 rounded-2xl flex items-center justify-center',
                        k.tone === 'blue' && 'bg-blue-500/10 text-blue-600',
                        k.tone === 'emerald' && 'bg-emerald-500/10 text-emerald-600',
                        k.tone === 'violet' && 'bg-violet-500/10 text-violet-600',
                      )}>
                        <k.icon className="w-7 h-7" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-5">
              <CardHeader>
                <CardTitle>时效SLA达成情况</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {slaItems.map((s) => (
                    <div key={s.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                          <span className="text-xs text-slate-500">平均耗时 {s.avg}</span>
                        </div>
                        <span className={cn(
                          'text-sm font-bold',
                          s.rate >= 90 ? 'text-emerald-600' : s.rate >= 80 ? 'text-amber-600' : 'text-red-600'
                        )}>{s.rate}%</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className={cn('h-full rounded-full bg-gradient-to-r', s.color)}
                          style={{ width: `${s.rate}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>近30天各环节时效趋势</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts option={timelinessChartOption} style={{ height: '320px' }} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>超期预警</CardTitle>
                  <Badge variant="danger" className="animate-pulse">{overdueList.filter(o => o.status !== 'resolved').length} 待处理</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>患者</TableHead>
                        <TableHead>环节</TableHead>
                        <TableHead>超时</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdueList.map((o, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{o.patient}</div>
                              <div className="text-xs text-slate-500 font-mono">{o.accession}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-slate-600">{o.stage}</span>
                            <div className="text-xs text-slate-400 mt-0.5">责任人: {o.owner}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-red-600">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span className="text-sm font-semibold">{o.overtime}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {o.status === 'pending' ? <Badge variant="danger">待处理</Badge>
                              : o.status === 'processing' ? <Badge variant="warning">处理中</Badge>
                              : <Badge variant="success">已解决</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="score">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>医生综合评分排名</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">排名</TableHead>
                        <TableHead>医生</TableHead>
                        <TableHead className="text-center">报告数</TableHead>
                        <TableHead className="text-center">完整性</TableHead>
                        <TableHead className="text-center">准确度</TableHead>
                        <TableHead className="text-center">按时率</TableHead>
                        <TableHead className="text-center">综合分</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {DOCTORS.map((d) => (
                        <TableRow key={d.rank} className={cn(selectedDoctor.rank === d.rank && 'bg-blue-50/60')}
                          onClick={() => setSelectedDoctor(d)} style={{ cursor: 'pointer' }}>
                          <TableCell>
                            <span className={cn(
                              'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold',
                              d.rank === 1 ? 'bg-amber-100 text-amber-700'
                                : d.rank === 2 ? 'bg-slate-200 text-slate-700'
                                : d.rank === 3 ? 'bg-orange-100 text-orange-700'
                                : 'bg-slate-100 text-slate-500'
                            )}>{d.rank}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-medical-600 flex items-center justify-center text-xs font-bold text-white">
                                {d.name.charAt(0)}
                              </div>
                              <span className="text-sm font-semibold text-slate-900">{d.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm font-mono">{d.reports}</TableCell>
                          <TableCell className="text-center">
                            <span className={cn('text-sm font-semibold', d.completeness >= 90 ? 'text-emerald-600' : d.completeness >= 80 ? 'text-blue-600' : 'text-amber-600')}>{d.completeness}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={cn('text-sm font-semibold', d.accuracy >= 90 ? 'text-emerald-600' : d.accuracy >= 80 ? 'text-blue-600' : 'text-amber-600')}>{d.accuracy}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={cn('text-sm font-semibold', d.punctuality >= 95 ? 'text-emerald-600' : d.punctuality >= 85 ? 'text-blue-600' : 'text-amber-600')}>{d.punctuality}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-medical-600 text-white text-sm font-bold shadow-sm">{d.total}</span>
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
                    <Users className="w-4 h-4 text-blue-600" />
                    {selectedDoctor.name} - 能力雷达
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactECharts option={radarOption} style={{ height: '280px' }} />
                </CardContent>
              </Card>
            </div>

            <Card className="mt-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-blue-600" />
                  评分分布统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ReactECharts option={scorePieOption} style={{ height: '280px' }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>报表参数配置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block">统计周期</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <input type="date" value={reportDateRange[0]} onChange={(e) => setReportDateRange([e.target.value, reportDateRange[1]])}
                        className="bg-transparent text-sm text-slate-800 outline-none w-[120px]" />
                      <span className="text-slate-400 text-xs">至</span>
                      <input type="date" value={reportDateRange[1]} onChange={(e) => setReportDateRange([reportDateRange[0], e.target.value])}
                        className="bg-transparent text-sm text-slate-800 outline-none w-[120px]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block">报表类型</label>
                    <Select options={[
                      { value: 'daily', label: '日报' },
                      { value: 'weekly', label: '周报' },
                      { value: 'monthly', label: '月报' },
                    ]} value={exportType} onChange={setExportType} className="w-32" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 font-medium mb-1.5 block">Modality</label>
                    <Select options={MODALITY_OPTIONS} value="all" onChange={() => {}} className="w-32" />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button variant="secondary"><Activity className="w-4 h-4 mr-1.5" />生成预览</Button>
                    <Button><FileSpreadsheet className="w-4 h-4 mr-1.5" />导出Excel</Button>
                    <Button variant="secondary"><Download className="w-4 h-4 mr-1.5" />导出PDF</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>报表预览 - {exportType === 'daily' ? '日报' : exportType === 'weekly' ? '周报' : '月报'}</span>
                  <span className="text-xs text-slate-500 font-normal">{reportDateRange[0]} ~ {reportDateRange[1]}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: '总检查数', value: qualityRecords.length * 45, icon: Activity, tone: 'blue' },
                    { label: '漏报检测数', value: summary.totalMissingDetected, icon: AlertTriangle, tone: 'amber' },
                    { label: '确认漏报率', value: `${Math.round(summary.confirmedMissing / summary.totalMissingDetected * 100)}%`, icon: ShieldCheck, tone: 'red' },
                    { label: '平均综合分', value: summary.averageQualityScore, icon: Award, tone: 'violet' },
                  ].map((k) => (
                    <div key={k.label} className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          k.tone === 'blue' && 'bg-blue-500/10 text-blue-600',
                          k.tone === 'amber' && 'bg-amber-500/10 text-amber-600',
                          k.tone === 'red' && 'bg-red-500/10 text-red-600',
                          k.tone === 'violet' && 'bg-violet-500/10 text-violet-600',
                        )}>
                          <k.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">{k.label}</div>
                          <div className="text-xl font-bold text-slate-900 mt-0.5">{k.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">时效达成率趋势</h4>
                  <ReactECharts option={{
                    tooltip: { trigger: 'axis' },
                    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                    xAxis: { type: 'category', data: timelinessStats.slice(-14).map((t) => t.date.slice(5)) },
                    yAxis: { type: 'value', min: 70, max: 100, name: '%' },
                    series: [{
                      type: 'bar', data: timelinessStats.slice(-14).map((t) => t.slaAchievementRate),
                      itemStyle: {
                        color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#60A5FA' }, { offset: 1, color: '#1D4ED8' }] },
                        borderRadius: [4, 4, 0, 0],
                      },
                    }],
                  }} style={{ height: '200px' }} />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">质控问题明细</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>编号</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>描述</TableHead>
                        <TableHead className="text-center">评分</TableHead>
                        <TableHead>状态</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {qualityRecords.slice(0, 6).map((q) => (
                        <TableRow key={q.id}>
                          <TableCell className="font-mono text-xs">{q.id}</TableCell>
                          <TableCell>
                            <Badge variant={q.type === 'timeliness' ? 'warning' : q.type === 'quality' ? 'info' : 'danger'}>
                              {q.type === 'timeliness' ? '时效' : q.type === 'quality' ? '质量' : '漏报'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-slate-700 max-w-[420px]">
                            <div className="line-clamp-1">{q.issueDescription}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={cn(
                              'text-sm font-bold',
                              q.score >= 85 ? 'text-emerald-600' : q.score >= 70 ? 'text-amber-600' : 'text-red-600'
                            )}>{q.score}</span>
                          </TableCell>
                          <TableCell>
                            {q.isResolved ? <Badge variant="success">已解决</Badge> : <Badge variant="warning">待处理</Badge>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
