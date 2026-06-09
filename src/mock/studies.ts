import type { Study, Series, Image, Modality, StudyStatus } from '@/types';
import { patients } from './patients';

function generateMedicalThumbnail(seed: number, variant: number): string {
  const colors = [
    ['#1a1a2e', '#2d2d44', '#4a4a6a', '#6b6b8a', '#8a8aaa', '#aaaaaa'],
    ['#0f0f1a', '#1f1f33', '#3f3f55', '#5f5f77', '#7f7f99', '#9f9fbb'],
    ['#141428', '#282844', '#3c3c60', '#50507c', '#646498', '#7878b4'],
    ['#0d0d1a', '#1d1d30', '#2d2d46', '#3d3d5c', '#4d4d72', '#5d5d88'],
  ];
  const palette = colors[seed % colors.length];
  const defs: string[] = [];
  const shapes: string[] = [];

  for (let i = 0; i < 5 + variant; i++) {
    const cx = 50 + Math.sin((seed + i * 1.7) * 2.3) * 30;
    const cy = 50 + Math.cos((seed + i * 2.1) * 1.9) * 25;
    const r = 8 + ((seed * (i + 1) * 3.7) % 20);
    const colorIdx = (i + variant) % palette.length;
    const opacity = 0.3 + ((seed + i) % 7) * 0.1;
    defs.push(`<radialGradient id="g${seed}_${variant}_${i}" cx="${cx}%" cy="${cy}%" r="${r}%">
      <stop offset="0%" stop-color="${palette[(colorIdx + 2) % palette.length]}" stop-opacity="${opacity + 0.3}"/>
      <stop offset="50%" stop-color="${palette[colorIdx]}" stop-opacity="${opacity}"/>
      <stop offset="100%" stop-color="${palette[0]}" stop-opacity="0.1"/>
    </radialGradient>`);
    shapes.push(`<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.8}" fill="url(#g${seed}_${variant}_${i})"/>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">
    <defs>${defs.join('')}<linearGradient id="bg${seed}${variant}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette[0]}"/>
      <stop offset="100%" stop-color="${palette[1]}"/>
    </linearGradient></defs>
    <rect width="100" height="100" fill="url(#bg${seed}${variant})"/>
    ${shapes.join('')}
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function generateImageData(seed: number, variant: number): string {
  const colors = [
    '#0a0a12', '#141420', '#1e1e2e', '#28283c', '#32324a',
    '#3c3c58', '#464666', '#505074', '#5a5a82', '#646490',
    '#6e6e9e', '#7878ac', '#8282ba', '#8c8cc8', '#9696d6',
  ];
  const pixels: string[] = [];
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const cx = 16 + Math.sin(seed * 0.5) * 8;
      const cy = 16 + Math.cos(seed * 0.3) * 6;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const noise = Math.sin((x + seed) * 0.7) * Math.cos((y + variant) * 0.5) * 3;
      const idx = Math.max(0, Math.min(14, Math.floor(15 - dist / 2 + noise + variant % 3)));
      pixels.push(colors[idx]);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="256" height="256" shape-rendering="crispEdges">
    ${pixels.map((c, i) => `<rect x="${i % 32}" y="${Math.floor(i / 32)}" width="1" height="1" fill="${c}"/>`).join('')}
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

interface WindowPreset {
  windowCenter: number;
  windowWidth: number;
}

const windowPresets: Record<string, WindowPreset> = {
  lung: { windowCenter: -600, windowWidth: 1500 },
  mediastinum: { windowCenter: 40, windowWidth: 400 },
  bone: { windowCenter: 400, windowWidth: 1800 },
  brain: { windowCenter: 40, windowWidth: 100 },
  softTissue: { windowCenter: 50, windowWidth: 350 },
  abdomen: { windowCenter: 60, windowWidth: 400 },
  spine: { windowCenter: 350, windowWidth: 1500 },
};

function getWindowPreset(modality: Modality, bodyPart: string): WindowPreset {
  if (modality === 'CT') {
    if (bodyPart.includes('胸')) return windowPresets.mediastinum;
    if (bodyPart.includes('头') || bodyPart.includes('脑')) return windowPresets.brain;
    if (bodyPart.includes('腹') || bodyPart.includes('盆')) return windowPresets.abdomen;
    if (bodyPart.includes('脊') || bodyPart.includes('腰') || bodyPart.includes('颈')) return windowPresets.spine;
    if (['膝', '肩', '髋', '肘', '踝'].some(p => bodyPart.includes(p))) return windowPresets.bone;
    return windowPresets.softTissue;
  }
  return windowPresets.softTissue;
}

function getSeriesDescriptions(modality: Modality, bodyPart: string): string[] {
  const map: Record<string, Record<string, string[]>> = {
    'CT': {
      '胸部': ['胸部CT平扫 轴位', '胸部CT增强 动脉期', '胸部CT增强 静脉期', '胸部CT 冠状位重建', '胸部CT 矢状位重建'],
      '头部': ['头颅CT平扫 轴位', '头颅CT增强 轴位', '头颅CT 骨窗', '头颅CT 冠状位重建'],
      '腹部': ['腹部CT平扫 轴位', '腹部CT增强 动脉期', '腹部CT增强 静脉期', '腹部CT增强 延迟期', '腹部CT 冠状位重建'],
      default: ['CT平扫 轴位', 'CT增强 动脉期', 'CT增强 静脉期', 'CT重建序列'],
    },
    'MRI': {
      '头部': ['头颅MR T1WI 轴位', '头颅MR T2WI 轴位', '头颅MR FLAIR 轴位', '头颅MR DWI 序列', '头颅MR T1增强'],
      '脊柱': ['腰椎MR T1WI 矢状位', '腰椎MR T2WI 矢状位', '腰椎MR T2WI 压脂', '腰椎MR T2WI 轴位'],
      '膝关节': ['膝关节MR T1WI 矢状位', '膝关节MR T2WI 矢状位', '膝关节MR PDWI 压脂', '膝关节MR T2WI 冠状位'],
      default: ['MR T1WI', 'MR T2WI', 'MR FLAIR', 'MR 增强序列'],
    },
    'X-Ray': {
      '胸部': ['胸部正位', '胸部侧位', '胸部斜位'],
      default: ['DR正位', 'DR侧位'],
    },
    'Ultrasound': {
      default: ['超声检查序列'],
    },
    'PET-CT': {
      default: ['PET-CT 融合图像', 'CT 平扫序列', 'PET 代谢序列'],
    },
  };
  const m = map[modality] || {};
  const key = Object.keys(m).find(k => bodyPart.includes(k)) || 'default';
  return m[key];
}

const modalityMap: Record<string, Modality> = {
  CT: 'CT',
  MR: 'MRI',
  DR: 'X-Ray',
  US: 'Ultrasound',
};

const bodyParts = ['胸部', '头部', '腹部', '脊柱', '膝关节', '肩关节', '髋关节', '腰椎', '颈椎', '盆腔', '颈部'];
const referringDoctors = ['李医生', '王主任', '赵医生', '陈主任', '刘医生', '杨主任'];
const departmentsArr = ['呼吸内科', '神经内科', '消化内科', '骨科', '心血管内科', '肿瘤科', '急诊科'];

const studyStatuses: StudyStatus[] = [
  'pending', 'pending', 'pending', 'pending', 'pending',
  'reporting', 'reporting', 'reporting',
  'reviewing', 'reviewing', 'reviewing', 'reviewing', 'reviewing', 'reviewing', 'reviewing', 'reviewing',
  'approved', 'approved', 'approved', 'approved',
];

function formatDate(daysAgo: number): string {
  const d = new Date(2025, 5, 9);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function formatTime(daysAgo: number, hoursOffset: number): string {
  const d = new Date(2025, 5, 9);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(8 + hoursOffset, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return d.toTimeString().split(' ')[0];
}

function formatDateTime(daysAgo: number, hoursOffset: number): string {
  const d = new Date(2025, 5, 9);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(8 + hoursOffset, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return d.toISOString();
}

function generateStudy(idx: number): Study {
  const studyId = `STU${String(idx + 1).padStart(4, '0')}`;
  const modKey = ['CT', 'MR', 'DR', 'US'][idx % 4];
  const modality = modalityMap[modKey];
  const bodyPart = bodyParts[idx % bodyParts.length];
  const status = studyStatuses[idx];
  const patientIdx = idx % patients.length;
  const patient = patients[patientIdx];
  const seed = idx + 1;
  const daysAgo = idx % 14;
  const hoursOffset = (idx * 3) % 10;

  const seriesDescs = getSeriesDescriptions(modality, bodyPart);
  const seriesCount = 3 + (idx % 4);
  const series: Series[] = [];

  for (let s = 0; s < seriesCount; s++) {
    const seriesId = `SER${studyId.slice(3)}_${String(s + 1).padStart(2, '0')}`;
    const descIdx = s % seriesDescs.length;
    const instanceCount = 20 + ((seed * (s + 1) * 17) % 181);
    const winPreset = getWindowPreset(modality, bodyPart);

    let wc = winPreset.windowCenter;
    let ww = winPreset.windowWidth;
    if (modality === 'CT' && bodyPart === '胸部' && s === 0) {
      wc = windowPresets.lung.windowCenter;
      ww = windowPresets.lung.windowWidth;
    }

    const thumbnail = generateMedicalThumbnail(seed + s * 7, s);
    const images: Image[] = [];
    const imgCount = Math.min(instanceCount, 6);

    for (let im = 0; im < imgCount; im++) {
      const imgId = `IMG${seriesId.slice(3)}_${String(im + 1).padStart(4, '0')}`;
      const instanceNum = Math.floor(im * instanceCount / imgCount) + 1;
      images.push({
        id: imgId,
        seriesId,
        instanceNumber: instanceNum,
        sopInstanceUid: `1.2.840.113619.${seed}.${s + 1}.${instanceNum}`,
        width: 512,
        height: 512,
        bitsAllocated: 16,
        windowCenter: wc + (im % 2) * 10,
        windowWidth: ww,
        url: generateImageData(seed + s * 5 + im * 3, im),
      });
    }

    series.push({
      id: seriesId,
      studyId,
      seriesNumber: s + 1,
      description: seriesDescs[descIdx] || `${modality}序列${s + 1}`,
      modality,
      instancesCount: instanceCount,
      images,
      thumbnail,
    });
  }

  const accessionNum = `ACC${formatDate(daysAgo).replace(/-/g, '')}${String(idx + 1).padStart(4, '0')}`;

  return {
    id: studyId,
    patientId: patient.id,
    patientName: patient.name,
    patientAge: patient.age,
    patientGender: patient.gender === 'male' ? 'male' : 'female',
    modality,
    bodyPart,
    studyDate: formatDate(daysAgo),
    studyTime: formatTime(daysAgo, hoursOffset),
    description: `${bodyPart}${modalityKeyLabel(modKey)}检查${idx % 3 === 0 ? '（平扫+增强）' : idx % 3 === 1 ? '（平扫）' : '（复查）'}`,
    status,
    series,
    reportId: status === 'approved' || status === 'reviewing' ? `RPT${studyId.slice(3)}` : undefined,
    assigneeId: status !== 'pending' ? 'U001' : undefined,
    createdAt: formatDateTime(daysAgo + 1, hoursOffset),
    updatedAt: formatDateTime(daysAgo, hoursOffset + 2),
    accessionNumber: accessionNum,
    referringDoctor: referringDoctors[idx % referringDoctors.length],
    department: departmentsArr[idx % departmentsArr.length],
    patient,
  };
}

function modalityKeyLabel(k: string): string {
  return { CT: 'CT', MR: 'MR', DR: 'DR', US: 'US' }[k] || k;
}

export const studies: Study[] = Array.from({ length: 20 }, (_, i) => generateStudy(i));

export const mockStudies: Study[] = studies;

export default studies;
