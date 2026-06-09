import type { Consultation, ConsultationMessage, ConsultationStatus, UserRole } from '@/types';
import { studies } from './studies';
import { mockUsers } from './patients';

const userRoles: Record<string, UserRole> = {
  U001: 'radiologist',
  U002: 'doctor',
  U003: 'expert',
  U004: 'admin',
  U005: 'doctor',
  U006: 'radiologist',
};

function generateMessages(
  consultationId: string,
  count: number,
  seed: number,
  users: typeof mockUsers
): ConsultationMessage[] {
  const messages: ConsultationMessage[] = [];
  const senders = users.slice(0, Math.min(4, users.length));
  const baseTime = new Date(2025, 5, 9 - (seed % 7), 9 + (seed % 3));

  const contentTemplates = [
    { type: 'text' as const, tpl: '各位专家好，这个病例请帮忙会诊。患者主要症状是{symptom}。' },
    { type: 'text' as const, tpl: '收到，先看一下影像资料。请问患者既往有什么病史吗？' },
    { type: 'text' as const, tpl: '患者有{history}病史{years}年，{treatment}。' },
    { type: 'text' as const, tpl: '从影像上看，{location}可见{lesion}，需要鉴别{diff1}还是{diff2}。' },
    { type: 'text' as const, tpl: '同意，建议补充{exam}，排除{diagnosis}。另外需要结合实验室检查结果。' },
    { type: 'text' as const, tpl: 'DWI我刚才看了一下，在相应区域确实有{finding}，符合{surgery}表现。' },
    { type: 'keyImage' as const, tpl: '我标记了关键图像，请各位专家查看第{layer}层面。' },
    { type: 'text' as const, tpl: '好的，看到了标记的层面。病灶范围约{size}，需要注意是否有占位效应。' },
    { type: 'text' as const, tpl: '中线结构目前居中，脑室系统形态正常，暂时没有明显的占位效应。' },
    { type: 'text' as const, tpl: '建议尽快{dept}会诊，启动{procedure}。如果在时间窗内，可以考虑{treatment2}。' },
    { type: 'image' as const, tpl: '补充上传了{imgtype}图像，请查看。' },
    { type: 'text' as const, tpl: '增强表现符合{diagnosis2}，目前诊断应该比较明确了。' },
    { type: 'text' as const, tpl: '建议同时查{test}，评估{evaluation}，明确是否有{condition}。' },
    { type: 'text' as const, tpl: '是的，如果是{condition2}，可以考虑{procedure2}，预后会更好。' },
    { type: 'text' as const, tpl: '会诊意见已整理，感谢各位专家参与！' },
  ];

  const varsPool = {
    symptom: ['持续性头痛3天，伴有恶心呕吐', '咳嗽发热1周，胸痛2天', '腹痛腹胀伴黄疸3天', '腰痛伴下肢放射痛1月', '膝关节外伤后疼痛肿胀2小时'],
    history: ['高血压', '糖尿病', '冠心病', '慢性支气管炎', '胃溃疡'],
    years: ['5', '10', '3', '15', '8'],
    treatment: ['血压控制一般，最高160/100mmHg', '口服降糖药，血糖控制尚可', '规律服药，病情稳定', '未规范治疗', '近期加重'],
    location: ['左侧基底节区', '右肺上叶', '胰头部', 'L4/5椎间盘', '内侧半月板后角'],
    lesion: ['片状低密度灶，边界欠清', '结节影，可见分叶毛刺征', '低密度占位，增强后不均匀强化', '向后突出，压迫硬膜囊', 'III度信号增高，达关节面'],
    diff1: ['急性脑梗死', '周围型肺癌', '胰腺癌', '椎间盘突出症', '半月板撕裂'],
    diff2: ['胶质瘤', '炎性假瘤', '胰腺炎', '椎管狭窄', '半月板变性'],
    exam: ['DWI序列', '胸部增强CT', '肿瘤标志物+穿刺活检', '增强MR扫描', '关节镜检查'],
    diagnosis: ['急性脑梗死', '恶性肿瘤', '恶性病变', '脊髓受压', '交叉韧带损伤'],
    finding: ['高信号，ADC值减低', '不均匀强化，门静脉期廓清', '明显强化，延迟期减退', '椎管狭窄，脊髓受压水肿', '韧带信号增高，不连续'],
    surgery: ['急性脑梗死', '肝癌', '胰腺癌', '脊髓型颈椎病', '前交叉韧带撕裂'],
    layer: ['32', '45', '18', '56', '28'],
    dept: ['神经内科', '胸外科', '肝胆外科', '骨科脊柱', '骨科关节'],
    procedure: ['卒中绿色通道', 'MDT多学科讨论', '术前评估', '急诊手术评估', '保守治疗方案'],
    treatment2: ['溶栓治疗', '胸腔镜手术', '根治性切除术', '减压手术', '关节镜手术'],
    imgtype: ['增强', 'DWI', '冠状位重建', '矢状位', '压脂序列'],
    diagnosis2: ['急性缺血性卒中', '恶性肿瘤可能性大', '胰腺导管腺癌', '椎间盘突出伴神经根受压', '半月板撕裂伴关节积液'],
    test: ['头颈部CTA', '全身PET-CT', '超声内镜+穿刺', '全脊柱MR', '下肢血管超声'],
    evaluation: ['血管情况', '远处转移', '病理分型', '全脊柱情况', '血供情况'],
    condition: ['大血管闭塞', '骨转移', '血管侵犯', '其他节段病变', '静脉血栓'],
    condition2: ['大血管闭塞', '可切除病变', '单发转移', '进行性神经损害', '复杂性损伤'],
    procedure2: ['取栓治疗', '根治性手术', '切除+辅助治疗', '早期减压', '韧带重建术'],
  };

  function randVar(key: keyof typeof varsPool, s: number): string {
    const arr = varsPool[key];
    return arr[s % arr.length];
  }

  for (let i = 0; i < count; i++) {
    const tplIdx = i % contentTemplates.length;
    const tpl = contentTemplates[tplIdx];
    let content = tpl.tpl;
    Object.keys(varsPool).forEach((key, idx) => {
      const placeholder = `{${key}}`;
      if (content.includes(placeholder)) {
        content = content.replace(placeholder, randVar(key as keyof typeof varsPool, seed + i * 3 + idx));
      }
    });
    const sender = senders[(seed + i) % senders.length];
    const sendTime = new Date(baseTime.getTime() + i * (60000 * (3 + ((seed + i) % 8))));

    messages.push({
      id: `MSG${consultationId.slice(3)}_${String(i + 1).padStart(3, '0')}`,
      consultationId,
      userId: sender.id,
      userName: sender.name,
      senderId: sender.id,
      senderName: sender.name,
      content,
      type: tpl.type,
      createdAt: sendTime.toISOString(),
      sendTime: sendTime.toISOString(),
    });
  }

  return messages;
}

const titles = [
  '疑难病例：头痛查因',
  '肺部结节影像会诊',
  '腹部肿块鉴别诊断',
  '腰椎间盘突出术前评估',
  '膝关节损伤疑难病例',
];

const summaries = [
  '患者急性起病，结合影像学DWI高信号及临床症状，考虑急性脑梗死诊断明确。建议神经内科住院治疗，完善头颈部CTA评估血管情况，如为大血管闭塞可考虑取栓治疗。出院后加强二级预防，控制血压血脂。',
  '右肺上叶结节约15mm，形态不规则，可见分叶毛刺征，考虑恶性可能性大。建议完善胸部增强CT及全身PET-CT检查，评估有无远处转移。如无手术禁忌症，建议胸腔镜下肺叶切除+淋巴结清扫术。',
  undefined,
  undefined,
  undefined,
];

const endStatuses: ConsultationStatus[] = ['active', 'active', 'ended', 'ended', 'ended'];

function generateConsultation(idx: number): { consultation: Consultation; messages: ConsultationMessage[] } {
  const seed = idx + 1;
  const consultationId = `CONS${String(idx + 1).padStart(3, '0')}`;
  const studyIdx = (idx * 3) % studies.length;
  const study = studies[studyIdx];

  const status = endStatuses[idx];
  const participantCount = 2 + (seed % 3);
  const selectedUsers = mockUsers.slice(0, participantCount);

  const participants = selectedUsers.map(u => ({
    id: u.id,
    name: u.name,
    role: userRoles[u.id] || 'doctor',
  }));

  const createdBy = selectedUsers[0].id;
  const startDate = new Date(2025, 5, 9 - (idx * 2) % 14, 9 + (idx % 5), idx * 7 % 60);
  const endDate = status === 'ended' ? new Date(startDate.getTime() + (2 + seed % 4) * 3600 * 1000) : undefined;

  const firstSeriesImages = study.series[0]?.images || [];
  const keyImages = status === 'active' && firstSeriesImages.length >= 2 ? [
    {
      id: `KI${consultationId.slice(3)}_01`,
      imageId: firstSeriesImages[0].id,
      description: '病灶层面，可见异常信号',
      addedBy: createdBy,
      addedAt: new Date(startDate.getTime() + 15 * 60000).toISOString(),
    },
    {
      id: `KI${consultationId.slice(3)}_02`,
      imageId: firstSeriesImages[Math.min(1, firstSeriesImages.length - 1)].id,
      description: '对比层面，评估病变范围',
      addedBy: createdBy,
      addedAt: new Date(startDate.getTime() + 20 * 60000).toISOString(),
    },
  ] : [];

  const msgCount = 8 + (seed % 8);
  const messages = generateMessages(consultationId, msgCount, seed, selectedUsers);

  const consultation: Consultation = {
    id: consultationId,
    studyId: study.id,
    title: titles[idx],
    status,
    participants,
    keyImages,
    createdBy,
    createdAt: new Date(startDate.getTime() - 3600 * 1000).toISOString(),
    endedAt: endDate?.toISOString(),
    hostId: createdBy,
    hostName: selectedUsers[0].name,
    type: idx === 1 || idx === 2 ? 'emergency' : 'normal',
    startTime: startDate.toISOString(),
    endTime: endDate?.toISOString(),
    summary: summaries[idx],
  };

  return { consultation, messages };
}

const allConsultations: Array<{ consultation: Consultation; messages: ConsultationMessage[] }> =
  Array.from({ length: 5 }, (_, i) => generateConsultation(i));

export const consultations: Consultation[] = allConsultations.map(c => c.consultation);
export const consultationMessages: ConsultationMessage[] = allConsultations.flatMap(c => c.messages);

export const mockConsultations: Consultation[] = consultations;
export const mockConsultationMessages: ConsultationMessage[] = consultationMessages;

export default consultations;
