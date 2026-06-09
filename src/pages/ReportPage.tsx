import { useState, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  FileText,
  Save,
  Send,
  PenTool,
  Eye,
  Search,
  Star,
  LayoutTemplate,
  User,
  Calendar,
  Stethoscope,
  MapPin,
  FileBarChart,
  Sparkles,
  Bold,
  Highlighter,
  ChevronDown,
  ChevronUp,
  Plus,
  Check,
  Lock,
  X,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Image as ImageIcon,
} from 'lucide-react'
import { useStudyStore } from '@/stores/studyStore'
import { useReportStore } from '@/stores/reportStore'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { cn } from '@/lib/utils'
import type { ReportStatus, ReportTemplate } from '@/types'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: number
  message: string
  type: ToastType
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  draft: { label: '草稿', variant: 'default' },
  submitted: { label: '待审核', variant: 'warning' },
  reviewing: { label: '审核中', variant: 'info' },
  approved: { label: '已审核', variant: 'success' },
  rejected: { label: '已退回', variant: 'danger' },
}

const QUICK_PHRASES = [
  '未见异常',
  '清晰',
  '密度均匀',
  '边界光滑',
  '无肿大',
  '无积液',
  '对称',
  '形态规则',
  '结构完整',
  '未见明显异常',
]

const CATEGORY_TABS = ['全部', '头部', '胸部', '腹部', '脊柱', '骨关节', '收藏']

const AI_SUGGESTIONS = [
  '建议结合临床症状进一步检查，必要时增强扫描明确诊断。',
  '建议3-6个月后随访复查，观察病灶变化情况。',
  '建议完善相关实验室检查，综合评估病情。',
  '建议请相关科室会诊，制定进一步诊疗方案。',
]

export default function ReportPage() {
  const { studyId } = useParams<{ studyId: string }>()
  const navigate = useNavigate()
  const { studies, getStudyById } = useStudyStore()
  const {
    findings,
    impression,
    templates,
    activeTemplateId,
    currentReport,
    setFindings,
    setImpression,
    applyTemplate,
    saveDraft,
    submitReport,
    auditReport,
  } = useReportStore()
  const { currentUser } = useAuthStore()

  const study = useMemo(() => {
    if (studyId) {
      return getStudyById(studyId) || studies[0]
    }
    return studies[0]
  }, [studyId, getStudyById, studies])

  const effectiveStatus: ReportStatus = (currentReport?.status as ReportStatus) || 'draft'

  const [toasts, setToasts] = useState<Toast[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [activeCategory, setActiveCategory] = useState('全部')
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    patient: false,
    findings: false,
    impression: false,
  })
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signaturePassword, setSignaturePassword] = useState('')
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(templates.filter((t) => t.isFavorite).map((t) => t.id))
  )
  const [imageDescriptions, setImageDescriptions] = useState<string[]>(['', '', '', ''])
  const [auditComment, setAuditComment] = useState('')
  const [isSigning, setIsSigning] = useState(false)

  const findingsRef = useRef<HTMLTextAreaElement>(null)
  const impressionRef = useRef<HTMLTextAreaElement>(null)

  const showToast = (message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchKeyword =
        !searchKeyword ||
        t.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        t.bodyPart.includes(searchKeyword)
      const matchCategory =
        activeCategory === '全部' ||
        (activeCategory === '收藏' && favorites.has(t.id)) ||
        t.category === activeCategory
      return matchKeyword && matchCategory
    })
  }, [templates, searchKeyword, activeCategory, favorites])

  const maskName = (name: string) => {
    if (!name) return ''
    if (name.length <= 1) return name
    if (name.length === 2) return name[0] + '*'
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
  }

  const handleSaveDraft = () => {
    if (!study || !currentUser) return
    saveDraft(study.id, currentUser.id)
    showToast('草稿已保存', 'success')
  }

  const handleSubmitReport = () => {
    if (!study || !currentUser) return
    submitReport(study.id, currentUser.id)
    showToast('已提交审核', 'success')
  }

  const handleApplyTemplate = (templateId: string) => {
    applyTemplate(templateId)
    showToast('模板已套用', 'success')
  }

  const handleToggleFavorite = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(templateId)) {
        next.delete(templateId)
      } else {
        next.add(templateId)
      }
      return next
    })
  }

  const insertAtCursor = (textarea: HTMLTextAreaElement | null, text: string) => {
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = findingsRef.current === textarea ? findings : impression
    const newValue = before.substring(0, start) + text + before.substring(end)
    if (findingsRef.current === textarea) {
      setFindings(newValue)
    } else {
      setImpression(newValue)
    }
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    })
  }

  const handleInsertNormal = () => {
    const normalText = '各脏器大小形态正常，实质密度均匀，未见明确异常密度灶。'
    setFindings(findings ? findings + '\n' + normalText : normalText)
  }

  const handleInsertAbnormal = () => {
    const abnormalText = '于_____部位可见异常改变，建议进一步检查明确性质。'
    setFindings(findings ? findings + '\n' + abnormalText : abnormalText)
  }

  const handleQuickPhrase = (phrase: string) => {
    insertAtCursor(findingsRef.current, phrase)
  }

  const handleBold = () => {
    const textarea = impressionRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = impression.substring(start, end) || '加粗文字'
    const boldText = `**${selected}**`
    insertAtCursor(textarea, boldText)
  }

  const handleHighlight = () => {
    const textarea = impressionRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = impression.substring(start, end) || '高亮文字'
    const highlightText = `【${selected}】`
    insertAtCursor(textarea, highlightText)
  }

  const handleInsertAISuggestion = (suggestion: string) => {
    setImpression(impression ? impression + '\n' + suggestion : suggestion)
  }

  const handleSignature = () => {
    if (!signaturePassword) {
      showToast('请输入密码', 'warning')
      return
    }
    setIsSigning(true)
    setTimeout(() => {
      if (currentReport && currentReport.id) {
        auditReport(currentReport.id, 'approved', currentUser?.id || 'U001', '审核通过')
      } else {
        auditReport('temp-report-id', 'approved', currentUser?.id || 'U001', '审核通过')
      }
      setIsSigning(false)
      setShowSignatureModal(false)
      setSignaturePassword('')
      showToast('电子签名成功，报告已审核', 'success')
    }, 800)
  }

  const handleAuditApprove = () => {
    if (currentReport && currentReport.id) {
      auditReport(currentReport.id, 'approved', currentUser?.id || 'U001', auditComment || '审核通过')
    }
    showToast('审核通过', 'success')
  }

  const handleAuditReject = () => {
    if (!auditComment) {
      showToast('请填写审核意见', 'warning')
      return
    }
    if (currentReport && currentReport.id) {
      auditReport(currentReport.id, 'rejected', currentUser?.id || 'U001', auditComment)
    }
    showToast('报告已退回', 'warning')
  }

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const timelineSteps = [
    { key: 'created', label: '创建草稿', done: true },
    { key: 'writing', label: '撰写中', done: ['submitted', 'reviewing', 'approved'].includes(effectiveStatus) },
    { key: 'submitted', label: '提交审核', done: ['reviewing', 'approved'].includes(effectiveStatus) },
    { key: 'approved', label: '审核完成', done: ['approved'].includes(effectiveStatus) },
  ]

  const currentStepIndex = (() => {
    if (['approved'].includes(effectiveStatus)) return 3
    if (['reviewing'].includes(effectiveStatus)) return 2
    if (['submitted'].includes(effectiveStatus)) return 2
    return 1
  })()

  const statusCfg = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.draft

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={() => navigate('/studies')}
            className="hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <FileBarChart size={14} />
            检查列表
          </button>
          <ChevronRight size={14} />
          <span className="text-slate-600">{study?.accessionNumber || study?.id}</span>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-medium">报告编辑</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                {study?.patientName ? maskName(study.patientName) : ''} · {study?.bodyPart} {study?.modality}报告
              </h1>
              <p className="text-sm text-slate-500">
                检查号：{study?.accessionNumber || study?.id} · {study?.studyDate} {study?.studyTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={statusCfg.variant}>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  statusCfg.variant === 'success' && 'bg-emerald-500',
                  statusCfg.variant === 'warning' && 'bg-amber-500',
                  statusCfg.variant === 'danger' && 'bg-red-500',
                  statusCfg.variant === 'info' && 'bg-blue-500',
                  statusCfg.variant === 'default' && 'bg-slate-400'
                )}
              />
              {statusCfg.label}
            </Badge>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="md" onClick={() => showToast('PDF预览功能开发中', 'info')}>
                <Eye size={16} />
                预览PDF
              </Button>
              <Button variant="secondary" size="md" onClick={handleSaveDraft}>
                <Save size={16} />
                保存草稿
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmitReport}
                disabled={effectiveStatus === 'submitted' || effectiveStatus === 'approved'}
              >
                <Send size={16} />
                提交审核
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowSignatureModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <PenTool size={16} />
                电子签名
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <LayoutTemplate size={18} className="text-blue-600" />
              <h3 className="font-semibold text-slate-900">模板库</h3>
            </div>
            <Input
              size="sm"
              placeholder="搜索模板..."
              prefix={<Search size={14} />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <Tabs defaultValue="全部" value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
                {CATEGORY_TABS.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className={cn(
                      'h-7 px-2.5 text-xs rounded-md',
                      activeCategory === cat
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredTemplates.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                <LayoutTemplate size={32} className="mx-auto mb-2 opacity-50" />
                暂无匹配模板
              </div>
            ) : (
              filteredTemplates.map((tpl: ReportTemplate) => (
                <Card
                  key={tpl.id}
                  className={cn(
                    'transition-all cursor-pointer hover:shadow-md hover:border-blue-200',
                    activeTemplateId === tpl.id && 'border-blue-400 ring-2 ring-blue-100'
                  )}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm text-slate-900 leading-tight flex-1">
                        {tpl.name}
                      </h4>
                      <button
                        onClick={(e) => handleToggleFavorite(tpl.id, e)}
                        className="shrink-0 transition-colors"
                      >
                        <Star
                          size={16}
                          className={cn(
                            'transition-colors',
                            favorites.has(tpl.id)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 hover:text-amber-400'
                          )}
                        />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                        {tpl.modality}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {tpl.bodyPart}
                      </span>
                      {tpl.isNormal && (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          正常
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock size={11} />
                        使用 {tpl.useCount} 次
                      </span>
                      <Button
                        size="sm"
                        variant={activeTemplateId === tpl.id ? 'primary' : 'secondary'}
                        className="h-7 text-xs px-2"
                        onClick={() => handleApplyTemplate(tpl.id)}
                      >
                        {activeTemplateId === tpl.id ? <Check size={12} /> : <Plus size={12} />}
                        {activeTemplateId === tpl.id ? '已套用' : '套用'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Card>
            <button
              onClick={() => toggleSection('patient')}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <CardHeader className="p-0 flex flex-row items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <User size={18} />
                </div>
                <div>
                  <CardTitle className="text-base">患者与检查信息</CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">只读信息，从检查数据自动填充</p>
                </div>
              </CardHeader>
              {collapsedSections.patient ? (
                <ChevronDown size={18} className="text-slate-400" />
              ) : (
                <ChevronUp size={18} className="text-slate-400" />
              )}
            </button>
            {!collapsedSections.patient && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 flex items-center gap-1">
                      <User size={11} />
                      患者姓名
                    </label>
                    <p className="text-sm font-medium text-slate-900">
                      {study?.patientName ? maskName(study.patientName) : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">性别 / 年龄</label>
                    <p className="text-sm font-medium text-slate-900">
                      {study?.patientGender === 'male' ? '男' : '女'} / {study?.patientAge}岁
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 flex items-center gap-1">
                      <FileBarChart size={11} />
                      检查号
                    </label>
                    <p className="text-sm font-medium text-slate-900">
                      {study?.accessionNumber || study?.id}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 flex items-center gap-1">
                      <Stethoscope size={11} />
                      检查部位
                    </label>
                    <p className="text-sm font-medium text-slate-900">
                      {study?.bodyPart} ({study?.modality})
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar size={11} />
                      检查时间
                    </label>
                    <p className="text-sm font-medium text-slate-900">
                      {study?.studyDate} {study?.studyTime}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={11} />
                      申请科室
                    </label>
                    <p className="text-sm font-medium text-slate-900">{study?.department || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">申请医生</label>
                    <p className="text-sm font-medium text-slate-900">
                      {study?.referringDoctor || '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500">临床诊断</label>
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {study?.description || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <button
              onClick={() => toggleSection('findings')}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <CardHeader className="p-0 flex flex-row items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <FileText size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">影像所见 Findings</CardTitle>
                  <Badge variant="info" className="text-[10px]">
                    {findings.length} 字
                  </Badge>
                </div>
              </CardHeader>
              {collapsedSections.findings ? (
                <ChevronDown size={18} className="text-slate-400" />
              ) : (
                <ChevronUp size={18} className="text-slate-400" />
              )}
            </button>
            {!collapsedSections.findings && (
              <CardContent className="pt-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={handleInsertNormal}>
                    <Plus size={12} />
                    插入正常描述
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleInsertAbnormal}>
                    <Plus size={12} />
                    插入异常
                  </Button>
                  <div className="h-5 w-px bg-slate-200 mx-1" />
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PHRASES.map((phrase) => (
                      <button
                        key={phrase}
                        onClick={() => handleQuickPhrase(phrase)}
                        className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  ref={findingsRef}
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="请输入影像所见描述..."
                  className="w-full min-h-[240px] rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-y leading-relaxed"
                />
              </CardContent>
            )}
          </Card>

          <Card>
            <button
              onClick={() => toggleSection('impression')}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <CardHeader className="p-0 flex flex-row items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Sparkles size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">诊断结论 Impression</CardTitle>
                  <Badge variant="info" className="text-[10px]">
                    {impression.length} 字
                  </Badge>
                </div>
              </CardHeader>
              {collapsedSections.impression ? (
                <ChevronDown size={18} className="text-slate-400" />
              ) : (
                <ChevronUp size={18} className="text-slate-400" />
              )}
            </button>
            {!collapsedSections.impression && (
              <CardContent className="pt-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={handleBold}>
                    <Bold size={14} />
                    加粗
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleHighlight}>
                    <Highlighter size={14} />
                    红色高亮
                  </Button>
                  <div className="h-5 w-px bg-slate-200 mx-1" />
                  <Button
                    variant={showAISuggestions ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setShowAISuggestions(!showAISuggestions)}
                    className={cn(
                      !showAISuggestions && 'bg-gradient-to-r from-violet-50 to-indigo-50 text-indigo-700 border border-indigo-100'
                    )}
                  >
                    <Sparkles size={14} className={showAISuggestions ? '' : 'text-indigo-500'} />
                    AI 辅助建议
                  </Button>
                </div>

                {showAISuggestions && (
                  <div className="rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 mb-2">
                      <Sparkles size={12} />
                      AI 智能推荐诊断建议
                    </div>
                    {AI_SUGGESTIONS.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 rounded-lg border border-white bg-white p-3 hover:border-indigo-200 transition-colors"
                      >
                        <div className="flex-1 text-sm text-slate-700 leading-relaxed">
                          {suggestion}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 shrink-0"
                          onClick={() => handleInsertAISuggestion(suggestion)}
                        >
                          <Plus size={12} />
                          插入
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <textarea
                  ref={impressionRef}
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  placeholder="请输入诊断结论..."
                  className="w-full min-h-[160px] rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-y leading-relaxed font-medium"
                />
              </CardContent>
            )}
          </Card>
        </div>

        <div className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={16} className="text-blue-600" />
                <h3 className="font-semibold text-sm text-slate-900">关联影像</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((idx) => {
                  const series = study?.series?.[idx % (study?.series?.length || 1)]
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                        <img
                          src={series?.thumbnail || series?.images?.[0]?.url}
                          alt={`影像 ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                          <span className="text-[10px] text-white truncate w-full">
                            {series?.description?.slice(0, 12) || `序列 ${idx + 1}`}
                          </span>
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="添加说明..."
                        value={imageDescriptions[idx]}
                        onChange={(e) => {
                          const next = [...imageDescriptions]
                          next[idx] = e.target.value
                          setImageDescriptions(next)
                        }}
                        className="w-full h-7 rounded-md border border-slate-200 px-2 text-[11px] text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none"
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileBarChart size={16} className="text-blue-600" />
                <h3 className="font-semibold text-sm text-slate-900">审核流程</h3>
              </div>
              <div className="relative pl-6">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
                {timelineSteps.map((step, idx) => {
                  const isCurrent = idx === currentStepIndex
                  const isDone = step.done
                  return (
                    <div key={step.key} className="relative pb-5 last:pb-0">
                      <div
                        className={cn(
                          'absolute -left-[17px] top-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all',
                          isDone && 'bg-emerald-500 border-emerald-500',
                          isCurrent && !isDone && 'bg-white border-blue-500 ring-4 ring-blue-100',
                          !isDone && !isCurrent && 'bg-white border-slate-300'
                        )}
                      >
                        {isDone ? (
                          <Check size={12} className="text-white" />
                        ) : isCurrent ? (
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
                          </span>
                        ) : null}
                      </div>
                      <div className="space-y-0.5 pt-0.5">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            (isDone || isCurrent) ? 'text-slate-900' : 'text-slate-400'
                          )}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {isCurrent
                            ? '进行中...'
                            : isDone
                            ? '已完成'
                            : '待处理'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <PenTool size={16} className="text-blue-600" />
                <h3 className="font-semibold text-sm text-slate-900">电子签名</h3>
              </div>
              <Card className="border-blue-100 bg-blue-50/30">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                    <User size={12} />
                    <span>当前用户：{currentUser?.name || '未登录'}</span>
                  </div>
                  <Input
                    size="sm"
                    type="password"
                    placeholder="请输入签名密码"
                    prefix={<Lock size={13} />}
                    value={signaturePassword}
                    onChange={(e) => setSignaturePassword(e.target.value)}
                  />
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    size="sm"
                    onClick={handleSignature}
                    loading={isSigning}
                  >
                    <PenTool size={14} />
                    确认签名
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Stethoscope size={16} className="text-blue-600" />
                <h3 className="font-semibold text-sm text-slate-900">审核意见</h3>
              </div>
              <textarea
                value={auditComment}
                onChange={(e) => setAuditComment(e.target.value)}
                placeholder="请输入审核意见（退回时必填）..."
                className="w-full min-h-[90px] rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleAuditApprove}
                >
                  <ThumbsUp size={13} />
                  通过
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={handleAuditReject}
                >
                  <ThumbsDown size={13} />
                  退回
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-lg shadow-lg px-4 py-3 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-right-8 fade-in duration-300',
              toast.type === 'success' && 'bg-emerald-600 text-white',
              toast.type === 'error' && 'bg-red-600 text-white',
              toast.type === 'warning' && 'bg-amber-500 text-white',
              toast.type === 'info' && 'bg-blue-600 text-white'
            )}
          >
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'error' && <X size={16} />}
            {toast.type === 'warning' && <Clock size={16} />}
            {toast.type === 'info' && <Sparkles size={16} />}
            {toast.message}
          </div>
        ))}
      </div>

      <Modal
        open={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        title="电子签名确认"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setShowSignatureModal(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSignature}
              loading={isSigning}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Lock size={14} />
              确认签名
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                <PenTool size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{currentUser?.name || '医生'}</p>
                <p className="text-xs text-slate-500">
                  {currentUser?.department || '影像科'} · {new Date().toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Lock size={13} />
              签名密码
            </label>
            <Input
              type="password"
              placeholder="请输入您的电子签名密码"
              value={signaturePassword}
              onChange={(e) => setSignaturePassword(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              签名后报告状态将变为"已审核"，请确认内容无误。
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
