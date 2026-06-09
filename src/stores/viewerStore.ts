import { create } from 'zustand'
import type {
  LayoutType,
  ToolType,
  Pan,
  WindowLevel,
  Annotation,
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

interface ViewerState {
  activeStudyId: string | null
  activeSeriesId: string | null
  activeImageIndex: number
  layout: LayoutType
  zoom: number
  rotation: number
  flipH: boolean
  flipV: boolean
  pan: Pan
  windowLevel: WindowLevel
  activeTool: ToolType
  annotations: Annotation[]
  syncMode: boolean
  compareMode: boolean
  autoPlay: boolean
  expandedSeries: Set<string>
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
  clearAnnotations: () => void
  undoAnnotation: () => void
  setSyncMode: (v: boolean) => void
  setCompareMode: (v: boolean) => void
  setAutoPlay: (v: boolean) => void
  toggleSeriesExpanded: (id: string) => void
  setMouseCoord: (x: number, y: number, hu: number) => void
  resetView: () => void
}

export const useViewerStore = create<ViewerState>((set, get) => ({
  activeStudyId: null,
  activeSeriesId: null,
  activeImageIndex: 0,
  layout: '1x1',
  zoom: 1,
  rotation: 0,
  flipH: false,
  flipV: false,
  pan: { x: 0, y: 0 },
  windowLevel: { center: 40, width: 400 },
  activeTool: 'select',
  annotations: [],
  syncMode: false,
  compareMode: false,
  autoPlay: false,
  expandedSeries: new Set<string>(),
  mouseCoord: { x: 0, y: 0 },
  mouseHU: 0,

  setActiveStudy: (id) => set({ activeStudyId: id, activeImageIndex: 0 }),
  setActiveSeries: (id) => set({ activeSeriesId: id, activeImageIndex: 0 }),
  setActiveImageIndex: (idx) => set({ activeImageIndex: Math.max(0, idx) }),
  nextImage: () => set((s) => ({ activeImageIndex: s.activeImageIndex + 1 })),
  prevImage: () => set((s) => ({ activeImageIndex: Math.max(0, s.activeImageIndex - 1) })),
  setLayout: (layout) => set({ layout }),
  setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(8, zoom)) }),
  setRotation: (rotation) => set({ rotation: ((rotation % 360) + 360) % 360 }),
  rotateLeft: () => set((s) => ({ rotation: ((s.rotation - 90) % 360 + 360) % 360 })),
  rotateRight: () => set((s) => ({ rotation: (s.rotation + 90) % 360 })),
  rotate180: () => set((s) => ({ rotation: (s.rotation + 180) % 360 })),
  setFlipH: (v) => set({ flipH: v }),
  setFlipV: (v) => set({ flipV: v }),
  setPan: (pan) => set({ pan }),
  setWindowLevel: (wl) => set({ windowLevel: wl }),
  applyPreset: (preset) => set({ windowLevel: { center: preset.center, width: preset.width } }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  addAnnotation: (annotation) => {
    set((state) => ({
      annotations: [...state.annotations, annotation],
    }))
  },
  removeAnnotation: (id) => {
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== id),
    }))
  },
  clearAnnotations: () => set({ annotations: [] }),
  undoAnnotation: () => set((s) => ({ annotations: s.annotations.slice(0, -1) })),
  setSyncMode: (v) => set({ syncMode: v }),
  setCompareMode: (v) => set({ compareMode: v }),
  setAutoPlay: (v) => set({ autoPlay: v }),
  toggleSeriesExpanded: (id) => {
    const current = get().expandedSeries
    const next = new Set(current)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    set({ expandedSeries: next })
  },
  setMouseCoord: (x, y, hu) => set({ mouseCoord: { x, y }, mouseHU: hu }),
  resetView: () => {
    set({
      zoom: 1,
      rotation: 0,
      flipH: false,
      flipV: false,
      pan: { x: 0, y: 0 },
      windowLevel: { center: 40, width: 400 },
    })
  },
}))
