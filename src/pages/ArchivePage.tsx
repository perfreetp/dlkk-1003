import { useState } from 'react';
import {
  Archive,
  Download,
  Share2,
  Search,
  Image as ImageIcon,
  FileImage,
  FileText,
  Package,
  FolderArchive,
  Calendar,
  ChevronDown,
  Copy,
  X,
  QrCode,
  Eye,
  Clock,
  Shield,
  Unlock,
  Lock,
  History,
  Link as LinkIcon,
  RefreshCw,
  CheckCircle,
  Filter,
  Plus,
  EyeOff,
  ListChecks,
  Layers,
  Settings as SettingsIcon,
  Check,
  AlertTriangle,
  AlertCircle,
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
import { studies } from '@/mock/studies';
import { cn } from '@/lib/utils';

const EXPORT_RANGE = [
  { value: 'selected', label: '当前选择' },
  { value: 'all', label: '全序列' },
  { value: 'keyframe', label: '仅关键帧' },
];

const EXPORT_FORMATS = [
  { value: 'dicom', label: 'DICOM', icon: FileImage },
  { value: 'png', label: 'PNG(带标注)', icon: ImageIcon },
  { value: 'jpg', label: 'JPG', icon: ImageIcon },
  { value: 'pdf', label: 'PDF报告', icon: FileText },
  { value: 'bundle', label: '全量打包', icon: Package },
];

const COMPRESS_OPTIONS = [
  { value: 'zip', label: 'ZIP', icon: Package },
  { value: '7z', label: '7z', icon: FolderArchive },
  { value: 'none', label: '不压缩', icon: Package },
];

const ARCHIVE_STATUS = [
  { value: 'all', label: '全部' },
  { value: 'online', label: '在线' },
  { value: 'nearline', label: '近线' },
  { value: 'offline', label: '离线' },
];

type ShareLink = {
  id: string;
  patient: string;
  accession: string;
  modality: string;
  expireDays: number;
  remainingDays: number;
  permission: 'view' | 'download';
  password: string;
  visits: number;
  createdAt: string;
  link: string;
};

type Toast = {
  id: number;
  type: 'success' | 'warning' | 'error';
  message: string;
};

const initialLinks: ShareLink[] = [
  { id: 'SL001', patient: '王建国', accession: 'ACC20250609001', modality: '胸部CT', expireDays: 7, remainingDays: 5, permission: 'view', password: 'KJ82XQ', visits: 12, createdAt: '2025-06-08 14:30', link: 'https://pacs.example.com/s/ab12cd34' },
  { id: 'SL002', patient: '刘美华', accession: 'ACC20250609002', modality: '头部MR', expireDays: 3, remainingDays: 2, permission: 'download', password: 'MN45PW', visits: 5, createdAt: '2025-06-09 09:15', link: 'https://pacs.example.com/s/ef56gh78' },
  { id: 'SL003', patient: '陈志强', accession: 'ACC20250609003', modality: '腹部CT', expireDays: 30, remainingDays: 28, permission: 'view', password: 'RS67YZ', visits: 23, createdAt: '2025-06-07 16:45', link: 'https://pacs.example.com/s/ij90kl12' },
  { id: 'SL004', patient: '赵晓燕', accession: 'ACC20250609004', modality: '膝关节DR', expireDays: 14, remainingDays: 1, permission: 'download', password: 'TU89AB', visits: 8, createdAt: '2025-06-05 11:20', link: 'https://pacs.example.com/s/mn34op56' },
  { id: 'SL005', patient: '孙文博', accession: 'ACC20250609005', modality: '脊柱MR', expireDays: 7, remainingDays: 6, permission: 'view', password: 'CD12EF', visits: 3, createdAt: '2025-06-09 08:00', link: 'https://pacs.example.com/s/qr78st90' },
  { id: 'SL006', patient: '李雅琴', accession: 'ACC20250609006', modality: '胸部DR', expireDays: 15, remainingDays: 10, permission: 'download', password: 'UV34WX', visits: 15, createdAt: '2025-06-06 10:30', link: 'https://pacs.example.com/s/yz12ab34' },
];

const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateRandomId = (len: number) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const formatDateTime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function ArchivePage() {
  const [tab, setTab] = useState('export');
  const [searchText, setSearchText] = useState('');
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [exportRange, setExportRange] = useState('selected');
  const [exportFormat, setExportFormat] = useState('dicom');
  const [compress, setCompress] = useState('zip');
  const [quality, setQuality] = useState(85);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(initialLinks);
  const [selectedStudyId, setSelectedStudyId] = useState(studies[0]?.id || '');
  const [expireDays, setExpireDays] = useState(7);
  const [permission, setPermission] = useState<'view' | 'download'>('view');
  const [sharePassword, setSharePassword] = useState(generatePassword());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [copiedPasswordId, setCopiedPasswordId] = useState<string | null>(null);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [renewTargetId, setRenewTargetId] = useState<string | null>(null);
  const [renewDays, setRenewDays] = useState(7);

  const toggleStudy = (id: string) => {
    setSelectedStudies((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudies.length === studies.length) {
      setSelectedStudies([]);
    } else {
      setSelectedStudies(studies.map((s) => s.id));
    }
  };

  const exportTasks = [
    { id: 1, name: '胸部CT_20250609_ACC001.zip', size: '256MB', progress: 100, status: 'done', time: '10分钟前' },
    { id: 2, name: '头部MR_20250608_ACC002', size: '1.2GB', progress: 68, status: 'processing', time: '进行中' },
    { id: 3, name: '腹部CT_报告包.pdf', size: '8.5MB', progress: 100, status: 'done', time: '2小时前' },
    { id: 4, name: 'DR影像批量导出.zip', size: '412MB', progress: 35, status: 'processing', time: '进行中' },
  ];

  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleGenerateShare = () => {
    const study = studies.find((s) => s.id === selectedStudyId);
    if (!study) {
      addToast('error', '未找到对应检查');
      return;
    }
    const newLink: ShareLink = {
      id: `SL${Date.now()}`,
      patient: study.patientName,
      accession: study.accessionNumber || '',
      modality: `${study.modality} ${study.bodyPart}`,
      expireDays: expireDays,
      remainingDays: expireDays,
      permission: permission,
      password: sharePassword,
      visits: 0,
      createdAt: formatDateTime(new Date()),
      link: `https://pacs.example.com/s/${generateRandomId(8)}`,
    };
    setShareLinks((prev) => [newLink, ...prev]);
    setShareModalOpen(false);
    addToast('success', '分享链接已生成');
    setSharePassword(generatePassword());
  };

  const openShareModal = () => {
    setSelectedStudyId(studies[0]?.id || '');
    setExpireDays(7);
    setPermission('view');
    setSharePassword(generatePassword());
    setShareModalOpen(true);
  };

  const handleCopyLink = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLinkId(id);
      addToast('success', '链接已复制到剪贴板');
      setTimeout(() => setCopiedLinkId(null), 1500);
    } catch {
      addToast('error', '复制失败');
    }
  };

  const handleCopyPassword = async (password: string, id: string) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedPasswordId(id);
      setTimeout(() => setCopiedPasswordId(null), 1500);
    } catch {
      addToast('error', '复制失败');
    }
  };

  const openRenewModal = (id: string) => {
    setRenewTargetId(id);
    setRenewDays(7);
    setRenewModalOpen(true);
  };

  const handleConfirmRenew = () => {
    if (!renewTargetId) return;
    setShareLinks((prev) =>
      prev.map((s) =>
        s.id === renewTargetId
          ? { ...s, remainingDays: s.remainingDays + renewDays, expireDays: s.expireDays + renewDays }
          : s
      )
    );
    const target = shareLinks.find((s) => s.id === renewTargetId);
    const remaining = target ? target.remainingDays + renewDays : 0;
    addToast('success', `已续期 ${renewDays} 天，当前剩余 ${remaining} 天`);
    setRenewModalOpen(false);
    setRenewTargetId(null);
  };

  const handleRevoke = (id: string) => {
    if (!window.confirm('确认撤销该分享链接？撤销后链接将不再可访问。')) return;
    setShareLinks((prev) => prev.filter((s) => s.id !== id));
    addToast('warning', '链接已撤销，不再可访问');
  };

  const handleSimulateVisit = (id: string) => {
    setShareLinks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visits: s.visits + 1 } : s))
    );
  };

  const archiveRecords = Array.from({ length: 12 }, (_, i) => {
    const study = studies[i % studies.length];
    const statuses = ['online', 'online', 'nearline', 'offline', 'online', 'nearline'];
    return {
      id: `AR${String(i + 1).padStart(5, '0')}`,
      patientName: study.patientName,
      patientId: study.patientId,
      accession: study.accessionNumber,
      modality: study.modality === 'MRI' ? 'MR' : study.modality === 'X-Ray' ? 'DR' : study.modality === 'Ultrasound' ? 'US' : study.modality,
      bodyPart: study.bodyPart,
      studyDate: study.studyDate,
      fileCount: 120 + (i * 17) % 320,
      size: `${(0.5 + (i * 0.31) % 2.5).toFixed(2)}GB`,
      archiveDate: `2025-06-${String(9 - i).padStart(2, '0')}`,
      status: statuses[i % statuses.length],
    };
  });

  const [archiveDateRange, setArchiveDateRange] = useState<[string, string]>(['2025-06-01', '2025-06-09']);
  const [archiveModality, setArchiveModality] = useState('all');
  const [archiveStatus, setArchiveStatus] = useState('all');
  const [archiveBodyPart, setArchiveBodyPart] = useState('all');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredArchive = archiveRecords.filter((r) => {
    if (archiveSearch) {
      const q = archiveSearch.toLowerCase();
      if (!r.patientName.toLowerCase().includes(q) && !r.accession.toLowerCase().includes(q) && !r.patientId.toLowerCase().includes(q)) return false;
    }
    if (archiveModality !== 'all' && r.modality !== archiveModality) return false;
    if (archiveStatus !== 'all' && r.status !== archiveStatus) return false;
    if (archiveBodyPart !== 'all' && r.bodyPart !== archiveBodyPart) return false;
    if (archiveDateRange[0] && r.studyDate < archiveDateRange[0]) return false;
    if (archiveDateRange[1] && r.studyDate > archiveDateRange[1]) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredArchive.length / pageSize));
  const pagedRecords = filteredArchive.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const statusBadge = (s: string) => {
    const map: Record<string, { variant: 'success' | 'info' | 'warning' | 'default'; label: string }> = {
      online: { variant: 'success', label: '在线' },
      nearline: { variant: 'info', label: '近线' },
      offline: { variant: 'warning', label: '离线' },
    };
    const cfg = map[s] || map.online;
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 max-w-[1600px] mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">共享与归档</h1>
            <p className="text-sm text-slate-500 mt-1">影像导出、链接分享与归档管理中心</p>
          </div>
          <Button variant="secondary">
            <History className="w-4 h-4 mr-1.5" />操作日志
          </Button>
        </div>

        <Tabs defaultValue="export" value={tab} onValueChange={setTab}>
          <TabsList className="h-11 px-1.5 gap-1">
            <TabsTrigger value="export" className="h-8 px-4">
              <Download className="w-4 h-4 mr-2" />影像导出
            </TabsTrigger>
            <TabsTrigger value="sharing" className="h-8 px-4">
              <Share2 className="w-4 h-4 mr-2" />链接分享
            </TabsTrigger>
            <TabsTrigger value="archive" className="h-8 px-4">
              <Archive className="w-4 h-4 mr-2" />归档查询
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>检查选择</span>
                    <Badge variant="info">{selectedStudies.length} 已选</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-4 border-b border-slate-100">
                    <Input prefix={<Search className="w-4 h-4" />} placeholder="搜索患者/检查号..."
                      value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                  </div>
                  <div className="max-h-[520px] overflow-y-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white">
                        <TableRow>
                          <TableHead className="w-10">
                            <input type="checkbox" checked={selectedStudies.length === studies.length && studies.length > 0}
                              onChange={toggleSelectAll} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                          </TableHead>
                          <TableHead>检查信息</TableHead>
                          <TableHead>序列</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studies.filter(s => !searchText || s.patientName.includes(searchText) || s.accessionNumber?.includes(searchText)).map((s) => (
                          <TableRow key={s.id} className={cn(selectedStudies.includes(s.id) && 'bg-blue-50/40')}
                            onClick={() => toggleStudy(s.id)} style={{ cursor: 'pointer' }}>
                            <TableCell>
                              <input type="checkbox" checked={selectedStudies.includes(s.id)}
                                onChange={(e) => { e.stopPropagation(); toggleStudy(s.id); }}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-medical-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                  {s.patientName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-slate-900 truncate">{s.patientName}</div>
                                  <div className="text-xs text-slate-500 truncate">{s.bodyPart} · {s.studyDate}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                                <Layers className="w-3 h-3" />
                                {s.series?.length || 0}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-blue-600" />
                    导出配置
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2.5 block">导出范围</label>
                    <div className="grid grid-cols-3 gap-2">
                      {EXPORT_RANGE.map((o) => (
                        <button key={o.value} onClick={() => setExportRange(o.value)}
                          className={cn(
                            'px-3 py-2.5 rounded-lg text-sm font-medium border transition-all',
                            exportRange === o.value
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
                          )}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2.5 block">格式选择</label>
                    <div className="grid grid-cols-5 gap-2">
                      {EXPORT_FORMATS.map((f) => {
                        const Icon = f.icon;
                        return (
                          <button key={f.value} onClick={() => setExportFormat(f.value)}
                            className={cn(
                              'flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border transition-all',
                              exportFormat === f.value
                                ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-100'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            )}>
                            <Icon className="w-5 h-5" />
                            <span className="text-[11px] font-medium">{f.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2.5 block">压缩选项</label>
                    <div className="grid grid-cols-3 gap-2">
                      {COMPRESS_OPTIONS.map((c) => {
                        const Icon = c.icon;
                        return (
                          <button key={c.value} onClick={() => setCompress(c.value)}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all',
                              compress === c.value
                                ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-100'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            )}>
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-600">图像质量</label>
                      <span className="text-sm font-bold text-blue-600">{quality}%</span>
                    </div>
                    <input type="range" min="30" max="100" value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>压缩率高</span>
                      <span>原图质量</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50/60 to-slate-50 rounded-xl border border-blue-100/60">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-500">预计文件数</div>
                        <div className="text-lg font-bold text-slate-900 mt-0.5">{selectedStudies.length * 142}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">预计大小</div>
                        <div className="text-lg font-bold text-slate-900 mt-0.5">{(selectedStudies.length * 0.48).toFixed(2)} GB</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">预计耗时</div>
                        <div className="text-lg font-bold text-slate-900 mt-0.5">{Math.max(1, selectedStudies.length * 2)} 分钟</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">导出格式</div>
                        <div className="text-lg font-bold text-slate-900 mt-0.5 uppercase">{exportFormat}{compress !== 'none' ? ` + ${compress}` : ''}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button className="flex-1 h-11 text-base" disabled={selectedStudies.length === 0}>
                      <RefreshCw className="w-4 h-4 mr-2" />开始导出
                    </Button>
                    <Button variant="secondary" size="lg">
                      <ListChecks className="w-4 h-4 mr-1.5" />配置模板
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>预览与任务</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden">
                    {selectedStudies.length > 0 ? (
                      <div className="grid grid-cols-2 gap-1 p-2 w-full h-full">
                        {Array.from({ length: Math.min(4, selectedStudies.length * 2) }).map((_, i) => (
                          <div key={i} className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-slate-500" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <EyeOff className="w-10 h-10" />
                        <span className="text-sm">选择检查以预览影像</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-700">历史导出任务</h4>
                      <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">查看全部</button>
                    </div>
                    <div className="space-y-2.5">
                      {exportTasks.map((t) => (
                        <div key={t.id} className="p-3 rounded-xl bg-slate-50/60 border border-slate-100 hover:bg-white hover:border-slate-200 transition-all group">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {t.status === 'done' ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <RefreshCw className="w-4 h-4 text-blue-500 shrink-0 animate-spin" />
                              )}
                              <span className="text-xs font-medium text-slate-700 truncate">{t.name}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 ml-2 shrink-0">{t.size}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className={cn(
                                'h-full rounded-full transition-all',
                                t.status === 'done' ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'
                              )} style={{ width: `${t.progress}%` }} />
                            </div>
                            <span className="text-[11px] font-mono font-semibold text-slate-600 w-8 text-right">{t.progress}%</span>
                            {t.status === 'done' ? (
                              <button className="shrink-0 p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 shrink-0">{t.time}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sharing">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="搜索分享链接/患者..."
                    className="pl-10 pr-4 py-2.5 w-[320px] rounded-lg bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500" />
                </div>
                <Select options={[
                  { value: 'all', label: '全部权限' },
                  { value: 'view', label: '仅查看' },
                  { value: 'download', label: '可下载' },
                ]} value="all" onChange={() => {}} className="w-32" />
              </div>
              <Button onClick={openShareModal} className="h-10">
                <Plus className="w-4 h-4 mr-1.5" />生成分享链接
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shareLinks.map((s) => {
                const expirePct = (s.remainingDays / s.expireDays) * 100;
                const isExpiring = s.remainingDays <= 2;
                return (
                  <Card key={s.id} className={cn(isExpiring && 'ring-2 ring-amber-200')}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-medical-600 flex items-center justify-center text-xs font-bold text-white">
                              {s.patient.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{s.patient}</div>
                              <div className="text-xs text-slate-500 font-mono">{s.accession}</div>
                            </div>
                          </div>
                          <Badge variant="info">{s.modality}</Badge>
                        </div>
                        {s.permission === 'view' ? (
                          <Badge variant="default" className="gap-1"><Eye className="w-3 h-3" />仅查看</Badge>
                        ) : (
                          <Badge variant="success" className="gap-1"><Unlock className="w-3 h-3" />可下载</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />有效期进度
                          </span>
                          <span className={cn('font-semibold', isExpiring ? 'text-amber-600' : 'text-slate-700')}>
                            剩 {s.remainingDays}/{s.expireDays} 天
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={cn(
                            'h-full rounded-full transition-all',
                            isExpiring ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-green-500'
                          )} style={{ width: `${expirePct}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-3">
                        <div className="col-span-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="text-[11px] text-slate-400 mb-1 flex items-center gap-1">
                            <Lock className="w-3 h-3" />访问密码
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-mono font-bold text-slate-900 tracking-wider">{s.password}</span>
                            <button onClick={() => handleCopyPassword(s.password, s.id)} className={cn(
                              "p-1 rounded transition-colors",
                              copiedPasswordId === s.id ? "bg-emerald-100 text-emerald-600" : "hover:bg-slate-200 text-slate-500 hover:text-blue-600"
                            )}>
                              {copiedPasswordId === s.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="col-span-2 p-2 rounded-lg bg-gradient-to-br from-slate-50 to-white border border-slate-200 flex items-center justify-center">
                          <QrCode className="w-12 h-12 text-slate-700" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/60 border border-slate-100">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <LinkIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="text-xs text-slate-600 truncate font-mono">{s.link.slice(8)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0 ml-2">
                          <Eye className="w-3 h-3" />
                          <span className="font-mono font-semibold">{s.visits}</span>
                          <button onClick={() => handleSimulateVisit(s.id)} className="ml-1 p-0.5 rounded hover:bg-slate-200 hover:text-blue-600 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(s.link, s.id)}
                          className={cn(
                            "flex-1 h-8",
                            copiedLinkId === s.id && "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                          )}>
                          {copiedLinkId === s.id ? (
                            <><Check className="w-3.5 h-3.5 mr-1" />已复制</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5 mr-1" />复制</>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openRenewModal(s.id)} className="flex-1 h-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />续期
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRevoke(s.id)} className="flex-1 h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <X className="w-3.5 h-3.5 mr-1" />撤销
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Modal open={shareModalOpen} onClose={() => setShareModalOpen(false)} title="生成分享链接"
              className="max-w-md"
              footer={
                <>
                  <Button variant="secondary" onClick={() => setShareModalOpen(false)}>取消</Button>
                  <Button onClick={handleGenerateShare}>确认生成</Button>
                </>
              }>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">选择检查</label>
                  <Select
                    options={studies.map((s) => ({
                      value: s.id,
                      label: `${s.patientName} - ${s.modality} ${s.bodyPart} ${s.accessionNumber || ''}`,
                    }))}
                    value={selectedStudyId}
                    onChange={setSelectedStudyId}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block">有效期限</label>
                  <Select options={[
                    { value: '1', label: '1 天' },
                    { value: '3', label: '3 天' },
                    { value: '7', label: '7 天' },
                    { value: '14', label: '14 天' },
                    { value: '30', label: '30 天' },
                  ]} value={String(expireDays)} onChange={(v) => setExpireDays(Number(v))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-2 block">访问权限</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPermission('view')}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                        permission === 'view'
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      )}>
                      <Eye className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-sm font-semibold">仅查看</div>
                        <div className="text-[11px] opacity-80">只读访问影像</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setPermission('download')}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                        permission === 'download'
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      )}>
                      <Unlock className="w-4 h-4" />
                      <div className="text-left">
                        <div className="text-sm font-semibold">可下载</div>
                        <div className="text-[11px] opacity-80">允许下载影像</div>
                      </div>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1.5 block flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />访问密码
                  </label>
                  <div className="flex gap-2">
                    <Input value={sharePassword} readOnly className="font-mono tracking-wider" />
                    <Button variant="secondary" onClick={() => setSharePassword(generatePassword())}><RefreshCw className="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </Modal>

            <Modal open={renewModalOpen} onClose={() => { setRenewModalOpen(false); setRenewTargetId(null); }} title="续期分享链接"
              className="max-w-sm"
              footer={
                <>
                  <Button variant="secondary" onClick={() => { setRenewModalOpen(false); setRenewTargetId(null); }}>取消</Button>
                  <Button onClick={handleConfirmRenew}>确认续期</Button>
                </>
              }>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-2 block">选择续期天数</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 7, 14, 30].map((d) => (
                      <button
                        key={d}
                        onClick={() => setRenewDays(d)}
                        className={cn(
                          "py-2.5 rounded-lg text-sm font-semibold border-2 transition-all",
                          renewDays === d
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
                        )}>
                        {d} 天
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-slate-600">
                  续期后将在原有效期基础上延长 <b className="text-blue-700">{renewDays}</b> 天。
                </div>
              </div>
            </Modal>
          </TabsContent>

          <TabsContent value="archive">
            <Card className="mb-5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  高级搜索
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">检查日期</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <input type="date" value={archiveDateRange[0]}
                        onChange={(e) => setArchiveDateRange([e.target.value, archiveDateRange[1]])}
                        className="bg-transparent text-sm text-slate-800 outline-none w-[110px]" />
                      <span className="text-slate-400 text-xs">-</span>
                      <input type="date" value={archiveDateRange[1]}
                        onChange={(e) => setArchiveDateRange([archiveDateRange[0], e.target.value])}
                        className="bg-transparent text-sm text-slate-800 outline-none w-[110px]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">患者/检查号</label>
                    <Input prefix={<Search className="w-4 h-4" />} placeholder="搜索..."
                      value={archiveSearch} onChange={(e) => setArchiveSearch(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Modality</label>
                    <Select options={[
                      { value: 'all', label: '全部' },
                      { value: 'CT', label: 'CT' },
                      { value: 'MR', label: 'MR' },
                      { value: 'DR', label: 'DR' },
                      { value: 'US', label: 'US' },
                    ]} value={archiveModality} onChange={setArchiveModality} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">归档状态</label>
                    <Select options={ARCHIVE_STATUS} value={archiveStatus} onChange={setArchiveStatus} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">检查部位</label>
                    <Select options={[
                      { value: 'all', label: '全部' },
                      { value: '胸部', label: '胸部' },
                      { value: '头部', label: '头部' },
                      { value: '腹部', label: '腹部' },
                      { value: '脊柱', label: '脊柱' },
                      { value: '膝关节', label: '膝关节' },
                    ]} value={archiveBodyPart} onChange={setArchiveBodyPart} />
                  </div>
                  <div className="flex items-end gap-2 lg:col-span-3 justify-end">
                    <Button variant="secondary" onClick={() => {
                      setArchiveSearch(''); setArchiveModality('all'); setArchiveStatus('all'); setArchiveBodyPart('all');
                      setArchiveDateRange(['2025-06-01', '2025-06-09']); setCurrentPage(1);
                    }}>重置</Button>
                    <Button><Search className="w-4 h-4 mr-1.5" />查询</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>归档编号</TableHead>
                      <TableHead>患者信息</TableHead>
                      <TableHead>检查号</TableHead>
                      <TableHead>Modality</TableHead>
                      <TableHead>部位</TableHead>
                      <TableHead>检查日期</TableHead>
                      <TableHead className="text-center">文件数</TableHead>
                      <TableHead className="text-center">大小</TableHead>
                      <TableHead>归档日期</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="py-12 text-center text-slate-400">暂无归档记录</TableCell>
                      </TableRow>
                    ) : pagedRecords.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs text-slate-600">{r.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-medical-600 flex items-center justify-center text-xs font-bold text-white">
                              {r.patientName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{r.patientName}</div>
                              <div className="text-xs text-slate-500">{r.patientId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{r.accession}</TableCell>
                        <TableCell><Badge variant="info">{r.modality}</Badge></TableCell>
                        <TableCell className="text-sm">{r.bodyPart}</TableCell>
                        <TableCell className="text-sm text-slate-600">{r.studyDate}</TableCell>
                        <TableCell className="text-center text-sm font-mono">{r.fileCount}</TableCell>
                        <TableCell className="text-center text-sm font-mono text-slate-700">{r.size}</TableCell>
                        <TableCell className="text-sm text-slate-600">{r.archiveDate}</TableCell>
                        <TableCell>{statusBadge(r.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm"><Eye className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="sm"><Download className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="sm"><Share2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <div className="text-sm text-slate-500">
                  共 <b className="text-slate-800">{filteredArchive.length}</b> 条，第 <b className="text-slate-800">{currentPage}</b> / {totalPages} 页
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="w-4 h-4 rotate-90" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        className={cn(
                          'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                          currentPage === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
                        )}>
                        {page}
                      </button>
                    );
                  })}
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
        {toasts.map((t) => {
          const Icon = t.type === 'success' ? CheckCircle : t.type === 'warning' ? AlertTriangle : AlertCircle;
          const colors = t.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : t.type === 'warning'
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-red-50 border-red-200 text-red-800';
          const iconColor = t.type === 'success' ? 'text-emerald-500' : t.type === 'warning' ? 'text-amber-500' : 'text-red-500';
          return (
            <div
              key={t.id}
              className={cn(
                'flex items-start gap-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm',
                colors
              )}
              style={{
                animation: 'slideInRight 0.3s ease-out',
              }}>
              <Icon className={cn('w-4.5 h-4.5 shrink-0 mt-0.5', iconColor)} />
              <span className="text-sm font-medium flex-1 leading-relaxed">{t.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
