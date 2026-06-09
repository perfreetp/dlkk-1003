import type {
  QCRecord,
  MissingCase,
  TimelinessStats,
  Modality,
  QCSeverity,
  MissingDetectionRecord,
  QualityRecord,
  TimelinessStat,
  QCRecordType,
  MissingDetectionReviewStatus,
} from '@/types';
import { studies } from './studies';
import { patients, mockUsers } from './patients';

function formatDateTime(daysAgo: number, hoursOffset: number): string {
  const d = new Date(2025, 5, 9);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(9 + hoursOffset, (hoursOffset * 7) % 60, (hoursOffset * 13) % 60);
  return d.toISOString();
}

function formatDate(daysAgo: number): string {
  const d = new Date(2025, 5, 9);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const modalArr: Modality[] = ['CT', 'MRI', 'X-Ray', 'Ultrasound', 'PET-CT'];
const issuesData = [
  {
    detected: '右肺下叶外基底段磨玻璃结节（约6mm），形态不规则，可见轻微分叶征',
    suggestion: '右肺下叶外基底段见一磨玻璃结节影，直径约6mm，边界尚清，形态略不规则，建议3个月后复查胸部CT随访，必要时增强检查。',
    bodyPart: '胸部',
    confirmed: true,
    comment: '确认为漏报，结节形态有一定风险，已通知临床医生联系患者安排3个月随访。',
  },
  {
    detected: '右侧基底节区腔隙性梗死灶，DWI序列高信号，ADC减低',
    suggestion: '右侧基底节区可见点状长T1长T2信号，FLAIR及DWI呈高信号，ADC值减低，符合急性腔隙性脑梗死表现。建议神经内科会诊，启动卒中二级预防。',
    bodyPart: '头部',
    confirmed: true,
    comment: '确认为漏报，原报告仅提及"脑内多发缺血灶"不够具体，已要求补充DWI信号特点及病灶定位。',
  },
  {
    detected: '左肾皮质单纯性囊肿（Bosniak I级），大小约1.2cm×1.0cm',
    suggestion: '左肾皮质内见一类圆形低密度灶，CT值约0-15HU，边界清晰，增强后无强化，大小约1.2cm×1.0cm，考虑单纯性肾囊肿（Bosniak I级），良性病变，建议1年随访复查。',
    bodyPart: '腹部',
    confirmed: false,
    comment: '',
  },
  {
    detected: '主动脉结弧形钙化影',
    suggestion: '主动脉结可见弧形钙化影，系老年退行性改变，如无相关心血管症状，一般无特殊临床意义。',
    bodyPart: '胸部',
    confirmed: false,
    comment: '不构成漏报，主动脉结钙化属常见老年退行性改变，非强制描述内容，予以驳回。',
  },
  {
    detected: 'L4/5椎间盘向后轻度突出（约2.5mm），硬膜囊前缘受压',
    suggestion: 'L4/5椎间盘向后方轻度突出约2.5mm，硬膜囊前缘轻度受压，椎管有效矢状径无明显狭窄。建议避免久坐负重，加强腰背肌锻炼，必要时骨科就诊。',
    bodyPart: '腰椎',
    confirmed: true,
    comment: '确认为漏报，虽然程度较轻但需完整描述，已通知报告医生补充修改L4/5节段描述。',
  },
  {
    detected: '隆突下淋巴结肿大（短径约1.0cm），轻度强化',
    suggestion: '隆突下见一枚淋巴结影，短径约1.0cm，增强后呈轻度均匀强化。建议结合肿瘤标志物及临床病史，2-3个月随访复查胸部CT观察大小变化。',
    bodyPart: '胸部',
    confirmed: false,
    comment: '',
  },
  {
    detected: '胆囊息肉样病变（约3mm），附壁，不移动，无声影',
    suggestion: '胆囊壁见一枚稍强回声结节，大小约3mm，附壁生长，不移动，后方无声影，考虑胆固醇性息肉可能。建议6-12个月超声随访复查。',
    bodyPart: '腹部',
    confirmed: false,
    comment: '驳回，3mm息肉无显著临床意义，超声报告中不属强制描述范畴。',
  },
  {
    detected: '双侧侧脑室周围及半卵圆中心脑白质稀疏改变（Fazekas 1级）',
    suggestion: '双侧侧脑室周围及半卵圆中心脑白质内见斑片状稍长T2信号影，FLAIR序列呈高信号，边界模糊，符合脑白质稀疏改变（Fazekas 1级）。建议结合认知功能评估，控制脑血管病危险因素。',
    bodyPart: '头部',
    confirmed: false,
    comment: '',
  },
];

const reviewStatuses: MissingDetectionReviewStatus[] = [
  'confirmed', 'confirmed', 'pending', 'rejected', 'confirmed', 'pending', 'rejected', 'pending',
];

export const missingDetections: MissingDetectionRecord[] = issuesData.map((issue, idx) => {
  const seed = idx + 1;
  const study = studies[idx % studies.length];
  const patient = patients[idx % patients.length];
  const isReviewed = reviewStatuses[idx] !== 'pending';
  const reviewerIdx = (idx + 2) % mockUsers.length;

  return {
    id: `MISS${String(idx + 1).padStart(3, '0')}`,
    reportId: `RPT${study.id.slice(3)}`,
    studyId: study.id,
    patientName: patient.name,
    patientId: patient.id,
    accessionNumber: study.accessionNumber,
    modality: study.modality as string,
    bodyPart: issue.bodyPart,
    detectedIssue: issue.detected,
    detectedAt: formatDateTime(seed, 9 + (idx % 5)),
    confidence: 0.75 + ((seed * 11) % 20) / 100,
    aiSuggestion: issue.suggestion,
    reviewerId: isReviewed ? mockUsers[reviewerIdx].id : undefined,
    reviewerName: isReviewed ? mockUsers[reviewerIdx].name : undefined,
    reviewStatus: reviewStatuses[idx],
    reviewComment: isReviewed ? issue.comment : undefined,
    reviewedAt: isReviewed ? formatDateTime(seed, 14 + (idx % 3)) : undefined,
    suspectedIssue: issue.detected,
  };
});

const issueTypesArr: QCRecordType[] = [
  'quality', 'quality', 'timeliness', 'quality', 'quality',
  'timeliness', 'quality', 'quality', 'timeliness', 'quality',
];

const qcIssueTypes = [
  '报告格式不规范',
  '影像描述不完整',
  '报告超时',
  '诊断建议不明确',
  '关键征象遗漏',
  '审核超时',
  '测量数据缺失',
  '术语使用不规范',
  '全流程超时',
  '结构化字段缺失',
];

const qcDescriptions = [
  '报告中影像所见描述不够详细，对病灶边界、密度特征及周围组织关系描述不够准确完整，建议补充完善。',
  '报告格式不符合规范要求，缺少患者基本信息字段及检查技术参数的描述，需要补全。',
  '该报告自提交后超过48小时仍未完成审核，超出科室规定的审核时效要求，需尽快处理。',
  '诊断结论过于笼统，未给出明确的鉴别诊断方向和进一步检查建议，建议补充。',
  '影像中可见的重要异常征象未在报告中提及，包括右肺下叶小结节及纵隔淋巴结增大，属于重要漏报。',
  '报告审核环节超时24小时，影响报告发布时效及临床诊疗安排。',
  '病灶大小、CT值等关键测量数据未在报告中标注，缺少量化评估依据，建议补充测量。',
  '部分专业术语使用不规范，如"密度增高"应具体描述为"斑片状高密度影"，建议统一术语。',
  '从检查到报告审核完成总时长超过72小时，严重超出SLA要求。',
  '结构化报告模板中多个必填字段为空，包括病史、体征、实验室检查关联信息等。',
];

const resolveComments = [
  '已重新修改报告，补充完善影像描述内容。',
  '已按照规范格式重新排版报告，补充所有缺失字段。',
  '已优化报告审核流程，通知上级医生加急完成审核。',
  '已更新报告结论，增加2-3种鉴别诊断及检查建议。',
  '已重新阅片，补充重要征象的详细描述。',
  '加强时效管理，建立审核提醒机制。',
];

export const qualityRecords: QualityRecord[] = Array.from({ length: 10 }, (_, idx) => {
  const seed = idx + 1;
  const isResolved = idx % 3 !== 2;
  const study = studies[(idx * 2) % studies.length];
  const patient = patients[(idx * 3) % patients.length];
  const reporter = mockUsers[idx % mockUsers.length];
  const auditor = mockUsers[(idx + 1) % mockUsers.length];
  const reviewer = mockUsers[(idx + 2) % mockUsers.length];

  const baseScore = issueTypesArr[idx] === 'timeliness'
    ? 70
    : issueTypesArr[idx] === 'missing' ? 60 : 80;
  const score = baseScore + ((seed * 3) % 10);
  const completeness = issueTypesArr[idx] === 'quality' ? 72 + (seed % 12) : 85 + (seed % 10);
  const accuracy = idx === 4 ? 60 + (seed % 8) : 78 + (seed % 15);
  const timeliness = issueTypesArr[idx] === 'timeliness' ? 65 + (seed % 10) : 88 + (seed % 8);

  return {
    id: `QR${String(idx + 1).padStart(4, '0')}`,
    reportId: `RPT${study.id.slice(3)}`,
    studyId: study.id,
    patientName: patient.name,
    reporterName: reporter.name,
    reporterId: reporter.id,
    auditorName: auditor.name,
    auditorId: auditor.id,
    type: issueTypesArr[idx],
    score,
    completenessScore: completeness,
    accuracyScore: accuracy,
    timelinessScore: timeliness,
    issueDescription: qcDescriptions[idx],
    reviewerId: isResolved ? reviewer.id : undefined,
    reviewerName: isResolved ? reviewer.name : undefined,
    isResolved,
    resolveComment: isResolved ? resolveComments[idx % resolveComments.length] : undefined,
    resolvedAt: isResolved ? formatDateTime(seed, 12) : undefined,
    createdAt: formatDateTime(seed, 9),
    auditDate: formatDate(seed),
  };
});

export const timelinessStats: TimelinessStat[] = Array.from({ length: 30 }, (_, i) => {
  const seed = 30 - i + 7;
  const totalStudies = 12 + (seed * 3) % 14;
  const pendingCount = 1 + (seed % 3);
  const reportingCount = 1 + ((seed + 1) % 3);
  const reportedCount = 2 + ((seed * 2) % 4);
  const auditedCount = totalStudies - pendingCount - reportingCount - reportedCount;
  const overdueCount = (seed % 4);
  const slaRate = 88 + (seed % 12);

  return {
    date: formatDate(29 - i),
    totalStudies,
    pendingCount,
    reportingCount,
    reportedCount,
    auditedCount: Math.max(0, auditedCount),
    avgReceiveTime: 8 + (seed % 12),
    avgReportTime: 32 + ((seed * 2) % 28),
    avgAuditTime: 18 + ((seed + 2) % 22),
    avgTotalTime: 65 + ((seed + 1) * 3) % 40,
    overdueCount,
    slaAchievementRate: slaRate,
  };
});

/* ==================== 兼容性导出 ==================== */

const severityPool: QCSeverity[] = ['low', 'medium', 'medium', 'high', 'low', 'medium', 'high', 'critical', 'medium', 'low'];

export const mockQCRecords: QCRecord[] = qualityRecords.map((qr, idx) => {
  const severity = severityPool[idx % severityPool.length];
  return {
    id: qr.id,
    studyId: qr.studyId,
    reporterId: qr.reporterId,
    reporterName: qr.reporterName,
    issueType: qcIssueTypes[idx],
    description: qr.issueDescription,
    severity,
    status: qr.isResolved ? 'resolved' : 'open',
    createdAt: qr.createdAt,
    resolvedAt: qr.resolvedAt,
    resolution: qr.resolveComment,
    reportId: qr.reportId,
    type: qr.type,
    score: qr.score,
    issueDescription: qr.issueDescription,
    reviewerId: qr.reviewerId,
    isResolved: qr.isResolved,
  };
});

export const mockMissingCases: MissingCase[] = missingDetections.map((md) => ({
  id: md.id,
  studyId: md.studyId,
  patientName: md.patientName,
  modality: md.modality as Modality,
  studyDate: md.detectedAt.split('T')[0],
  missedDiagnosis: md.detectedIssue,
  reportedBy: md.reviewerName || 'AI-SYSTEM',
  reportedAt: md.detectedAt,
  reviewed: md.reviewStatus !== 'pending',
  reviewedBy: md.reviewerId,
  reviewedAt: md.reviewedAt,
  reviewComment: md.reviewComment,
}));

export const mockTimelinessStats: TimelinessStats = (() => {
  const total = timelinessStats.reduce((s, t) => s + t.totalStudies, 0);
  const overdue = timelinessStats.reduce((s, t) => s + t.overdueCount, 0);
  const byModality: Record<string, { total: number; onTime: number; average: number }> = {};

  for (let m = 0; m < 4; m++) {
    const modality = modalArr[m];
    const s = m + 11;
    const mTotal = 30 + (s * 7) % 60;
    const mOverdue = s % 5;
    byModality[modality] = {
      total: mTotal,
      onTime: mTotal - mOverdue,
      average: 50 + (s * 3) % 60,
    };
  }

  return {
    totalStudies: total + Object.values(byModality).reduce((s, v) => s + v.total, 0),
    onTimeCount: total - overdue + Object.values(byModality).reduce((s, v) => s + v.onTime, 0),
    delayedCount: overdue + Object.values(byModality).reduce((s, v) => s + (v.total - v.onTime), 0),
    averageTime: Math.round(timelinessStats.reduce((s, t) => s + t.avgTotalTime, 0) / timelinessStats.length),
    byModality,
    dailyStats: timelinessStats.slice(0, 7).map((t) => ({
      date: t.date,
      total: t.totalStudies,
      onTime: t.totalStudies - t.overdueCount,
      delayed: t.overdueCount,
    })),
  };
})();

export const qualityStats = {
  missingDetections,
  qualityRecords,
  timelinessStats,
  summary: {
    totalMissingDetected: missingDetections.length,
    confirmedMissing: missingDetections.filter((m) => m.reviewStatus === 'confirmed').length,
    rejectedMissing: missingDetections.filter((m) => m.reviewStatus === 'rejected').length,
    pendingMissing: missingDetections.filter((m) => m.reviewStatus === 'pending').length,
    averageQualityScore: Math.round(qualityRecords.reduce((s, r) => s + r.score, 0) / qualityRecords.length),
    averageCompletenessScore: Math.round(qualityRecords.reduce((s, r) => s + r.completenessScore, 0) / qualityRecords.length),
    averageAccuracyScore: Math.round(qualityRecords.reduce((s, r) => s + r.accuracyScore, 0) / qualityRecords.length),
    averageTimelinessScore: Math.round(qualityRecords.reduce((s, r) => s + r.timelinessScore, 0) / qualityRecords.length),
    totalOverdue: timelinessStats.reduce((s, t) => s + t.overdueCount, 0),
    slaRate: Math.round(timelinessStats.reduce((s, t) => s + t.slaAchievementRate, 0) / timelinessStats.length),
  },
};

export default qualityStats;
