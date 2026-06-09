import { create } from 'zustand'
import type {
  LayoutType,
  ToolType,
  Pan,
  WindowLevel,
  Annotation,
  KeyImage,
} from '@/types'

interface WindowPreset {
  name: string
  center: number
  width: number
}

export const windowPresets: WindowPreset[] = [
  { name: '肺窗', center: -600, width: 1500 },
  { name: '纵隔窗', center: 40, width: 400 },
  { name: '骨窗', center: 400, width: 1800 },
  { name: '脑窗', center: 40, width: 100 },
  { name: '软组织窗', center: 50, width: 350 },
  { name: '腹部窗', center: 60, width: 400 },
]

interface PerStudyViewerState {
  activeSeriesId: string | null
  activeImageIndex: number
  zoom: number
  rotation: number
  flipH: boolean
  flipV: boolean
  pan: Pan
  windowLevel: WindowLevel
  annotations: Annotation[]
  expandedSeries: Set<string>
  keyImages: KeyImage[]
}

interface ViewerState {
  viewerByStudy: Record<string, PerStudyViewerState>
  activeStudyId: string | null
  layout: LayoutType
  activeTool: ToolType
  syncMode: boolean
  compareMode: boolean
  autoPlay: boolean
  mouseCoord: { x: number; y: number }
  mouseHU: number
  setActiveStudy: (id: string) => void
  setActiveSeries: (id: string) => void
  setActiveImageIndex: (idx: number) => void
  nextImage: () => void
  prevImage: () => void
  setLayout: (layout: LayoutType) => void
  setZoom: (zoom: number) => void
  setRotation: (rotation: number) => void
  rotateLeft: () => void
  rotateRight: () => void
  rotate180: () => void
  setFlipH: (v: boolean) => void
  setFlipV: (v: boolean) => void
  setPan: (pan: Pan) => void
  setWindowLevel: (wl: WindowLevel) => void
  applyPreset: (preset: WindowPreset) => void
  setActiveTool: (tool: ToolType) => void
  addAnnotation: (annotation: Annotation) => void
  removeAnnotation: (id: string) => void
  removeAnnotationById: (id: string) => void
  clearAnnotations: () => void
  undoAnnotation: () => void
  setSyncMode: (v: boolean) => void
  setCompareMode: (v: boolean) => void
  setAutoPlay: (v: boolean) => void
  toggleSeriesExpanded: (id: string) => void
  setMouseCoord: (x: number, y: number, hu: number) => void
  resetView: () => void
  addKeyImage: (keyImage: Omit<KeyImage, 'id' | 'createdAt'>) => void
  removeKeyImage: (id: string) => void
  updateKeyImageNote: (id: string, note: string) => void
  toggleKeyImageCurrent: () => void
  getKeyImagesForStudy: (studyId: string) => KeyImage[]
}

const createDefaultStudyState = (): PerStudyViewerState => ({
  activeSeriesId: null,
  activeImageIndex: 0,
  zoom: 1,
  rotation: 0,
  flipH: false,
  flipV: false,
  pan: { x: 0, y: 0 },
  windowLevel: { center: 40, width: 400 },
  annotations: [],
  expandedSeries: new Set<string>(),
  keyImages: [],
})

export const useViewerStore = create<ViewerState>((set, get) => ({
  viewerByStudy: {},
  activeStudyId: null,
  layout: '1x1',
  activeTool: 'select',
  syncMode: false,
  compareMode: false,
  autoPlay: false,
  mouseCoord: { x: 0, y: 0 },
  mouseHU: 0,

  setActiveStudy: (id) => {
    const { viewerByStudy } = get()
    if (!viewerByStudy[id]) {
      set({
        activeStudyId: id,
        viewerByStudy: {
          ...viewerByStudy,
          [id]: createDefaultStudyState(),
        },
      })
    } else {
      set({ activeStudyId: id })
    }
  },

  setActiveSeries: (id) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          activeSeriesId: id,
          activeImageIndex: 0,
        },
      },
    })
  },

  setActiveImageIndex: (idx) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          activeImageIndex: Math.max(0, idx),
        },
      },
    })
  },

  nextImage: () => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          activeImageIndex: study.activeImageIndex + 1,
        },
      },
    })
  },

  prevImage: () => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          activeImageIndex: Math.max(0, study.activeImageIndex - 1),
        },
      },
    })
  },

  setLayout: (layout) => set({ layout }),

  setZoom: (zoom) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          zoom: Math.max(0.2, Math.min(8, zoom)),
        },
      },
    })
  },

  setRotation: (rotation) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          rotation: ((rotation % 360) + 360) % 360,
        },
      },
    })
  },

  rotateLeft: () => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          rotation: ((study.rotation - 90) % 360 + 360) % 360,
        },
      },
    })
  },

  rotateRight: () => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          rotation: (study.rotation + 90) % 360,
        },
      },
    })
  },

  rotate180: () => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          rotation: (study.rotation + 180) % 360,
        },
      },
    })
  },

  setFlipH: (v) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          flipH: v,
        },
      },
    })
  },

  setFlipV: (v) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          flipV: v,
        },
      },
    })
  },

  setPan: (pan) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          pan,
        },
      },
    })
  },

  setWindowLevel: (wl) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          windowLevel: wl,
        },
      },
    })
  },

  applyPreset: (preset) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          windowLevel: { center: preset.center, width: preset.width },
        },
      },
    })
  },

  setActiveTool: (tool) => set({ activeTool: tool }),

  addAnnotation: (annotation) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          annotations: [...study.annotations, annotation],
        },
      },
    })
  },

  removeAnnotation: (id) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          annotations: study.annotations.filter((a) => a.id !== id),
        },
      },
    })
  },

  clearAnnotations: () => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          annotations: [],
        },
      },
    })
  },

  undoAnnotation: () => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          annotations: study.annotations.slice(0, -1),
        },
      },
    })
  },

  setSyncMode: (v) => set({ syncMode: v }),

  setCompareMode: (v) => set({ compareMode: v }),

  setAutoPlay: (v) => set({ autoPlay: v }),

  toggleSeriesExpanded: (id) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    const next = new Set(study.expandedSeries)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          expandedSeries: next,
        },
      },
    })
  },

  setMouseCoord: (x, y, hu) => set({ mouseCoord: { x, y }, mouseHU: hu }),

  resetView: () => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          zoom: 1,
          rotation: 0,
          flipH: false,
          flipV: false,
          pan: { x: 0, y: 0 },
          windowLevel: { center: 40, width: 400 },
        },
      },
    })
  },

  removeAnnotationById: (id) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          annotations: study.annotations.filter((a) => a.id !== id),
        },
      },
    })
  },

  addKeyImage: (keyImage) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    const newKeyImage: KeyImage = {
      ...keyImage,
      id: `ki_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          keyImages: [...study.keyImages, newKeyImage],
        },
      },
    })
  },

  removeKeyImage: (id) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          keyImages: study.keyImages.filter((k) => k.id !== id),
        },
      },
    })
  },

  updateKeyImageNote: (id, note) => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
    const study = viewerByStudy[activeStudyId]
    set({
      viewerByStudy: {
        ...viewerByStudy,
        [activeStudyId]: {
          ...study,
          keyImages: study.keyImages.map((k) =>
            k.id === id ? { ...k, note } : k
          ),
        },
      },
    })
  },

  toggleKeyImageCurrent: () => {
    const { activeStudyId, viewerByStudy } = get()
    if (!activeStudyId || !viewerByStudy[activeStudyId]) return
  },

  getKeyImagesForStudy: (studyId) => {
    const { viewerByStudy } = get()
    return viewerByStudy[studyId]?.keyImages ?? []
  },
}))
