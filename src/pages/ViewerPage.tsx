import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  ChevronDown, ChevronRight, MousePointer2, ZoomIn, Hand, Search,
  RotateCcw, RotateCw, FlipHorizontal, ChevronUp as ChevronUpIcon,
  Play, Pause, Grid3X3, Ruler, Triangle, CircleDot, Target, ArrowRight,
  Type, Trash2, Undo2, Split, Link, RefreshCw, LayoutGrid, User, Calendar,
  MapPin, Scan, Layers, Maximize2, Minimize2
} from 'lucide-react'
import { studies as mockStudies } from '@/mock/studies'
import {
  useViewerStore, windowPresets as viewerWindowPresets
} from '@/stores/viewerStore'
import type { LayoutType, ToolType, Series, Image } from '@/types'
import { cn } from '@/lib/utils'

const layouts: { value: LayoutType; label: string }[] = [
  { value: '1x1', label: '1×1' },
  { value: '2x2', label: '2×2' },
  { value: '3x3', label: '3×3' },
  { value: '4x4', label: '4×4' },
]

function maskPatientName(name: string): string {
  if (!name) return ''
  if (name.length <= 1) return name
  if (name.length === 2) return name[0] + '*'
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
}

function maskPatientId(id: string): string {
  if (!id || id.length < 4) return id
  return id.slice(0, 2) + '****' + id.slice(-2)
}

export default function ViewerPage() {
  const study = mockStudies[0]
  const seriesList = study.series

  const {
    activeSeriesId, activeImageIndex, layout, zoom, rotation, flipH, flipV, pan,
    windowLevel, activeTool, annotations, syncMode, compareMode, autoPlay,
    expandedSeries, mouseCoord, mouseHU,
    setActiveSeries, setActiveImageIndex, nextImage, prevImage,
    setLayout, setZoom, rotateLeft, rotateRight, rotate180,
    setFlipH, setWindowLevel, applyPreset, setActiveTool,
    clearAnnotations, undoAnnotation, setSyncMode, setCompareMode,
    setAutoPlay, toggleSeriesExpanded, setMouseCoord, resetView
  } = useViewerStore()

  const [effectiveSeriesId, setEffectiveSeriesId] = useState<string>(
    seriesList[0]?.id ?? ''
  )
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<number | null>(null)

  const activeSeries = useMemo(() => {
    const id = activeSeriesId || effectiveSeriesId
    return seriesList.find((s) => s.id === id) ?? seriesList[0]
  }, [activeSeriesId, effectiveSeriesId, seriesList])

  const displayImages = useMemo(() => {
    if (!activeSeries?.images?.length) return [] as Image[]
    return activeSeries.images
  }, [activeSeries])

  const currentImage = useMemo(() => {
    const idx = Math.min(activeImageIndex, displayImages.length - 1)
    return displayImages[idx]
  }, [activeImageIndex, displayImages])

  useEffect(() => {
    if (!autoPlay || !displayImages.length) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
        autoPlayRef.current = null
      }
      return
    }
    autoPlayRef.current = window.setInterval(() => {
      setActiveImageIndex(
        (activeImageIndex + 1) % Math.max(displayImages.length, 1)
      )
    }, 200)
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [autoPlay, activeImageIndex, displayImages.length, setActiveImageIndex])

  const handleSelectSeries = useCallback((series: Series) => {
    setActiveSeries(series.id)
    setEffectiveSeriesId(series.id)
  }, [setActiveSeries])

  const filterStyle = useMemo(() => {
    const { center, width } = windowLevel
    const brightness = Math.max(0.2, Math.min(2, 0.8 + center / 500))
    const contrast = Math.max(0.5, Math.min(3, 0.6 + width / 600))
    return `brightness(${brightness.toFixed(2)}) contrast(${contrast.toFixed(2)})`
  }, [windowLevel])

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !currentImage) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const cw = rect.width
    const ch = rect.height
    ctx.fillStyle = '#050810'
    ctx.fillRect(0, 0, cw, ch)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const scale = Math.min(cw / img.width, ch / img.height) * 0.92
      const iw = img.width * scale
      const ih = img.height * scale
      const ix = (cw - iw) / 2
      const iy = (ch - ih) / 2

      ctx.save()
      ctx.translate(cw / 2 + pan.x, ch / 2 + pan.y)
      ctx.scale(flipH ? -zoom : zoom, flipV ? -zoom : zoom)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-cw / 2, -ch / 2)
      ctx.filter = filterStyle
      ctx.drawImage(img, ix, iy, iw, ih)
      ctx.restore()

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)'
      ctx.lineWidth = 1
      ctx.strokeRect(ix, iy, iw, ih)
    }
    img.src = currentImage.url
  }, [currentImage, zoom, rotation, flipH, flipV, pan, filterStyle])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  useEffect(() => {
    const handler = () => drawCanvas()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [drawCanvas])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor(e.clientX - rect.left)
    const y = Math.floor(e.clientY - rect.top)
    const hu = Math.floor(-800 + (x / rect.width) * 2000 - (y / rect.height) * 500)
    setMouseCoord(x, y, hu)
  }, [setMouseCoord])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (activeTool === 'zoom') {
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom(zoom + delta)
    } else {
      if (e.deltaY > 0) nextImage()
      else prevImage()
    }
  }, [activeTool, zoom, setZoom, nextImage, prevImage])

  const getLayoutGridCols = (): string => {
    switch (layout) {
      case '1x1': return 'grid-cols-1 grid-rows-1'
      case '2x2': return 'grid-cols-2 grid-rows-2'
      case '3x3': return 'grid-cols-3 grid-rows-3'
      case '4x4': return 'grid-cols-4 grid-rows-4'
      default: return 'grid-cols-1 grid-rows-1'
    }
  }

  const tileCount = parseInt(layout.split('x')[0]) * parseInt(layout.split('x')[1])

  const renderCanvasTile = (idx: number) => (
    <div
      key={idx}
      className="relative border border-viewer-border bg-black overflow-hidden rounded-sm"
    >
      <canvas
        ref={idx === 0 ? canvasRef : undefined}
        className="w-full h-full block cursor-crosshair"
        onMouseMove={handleCanvasMouseMove}
        onWheel={handleWheel}
      />
      <div className="absolute top-1 left-2 text-[10px] font-mono text-cyan-400/90 pointer-events-none leading-tight">
        <div>{maskPatientId(study.patientId)}</div>
        <div>{study.accessionNumber ?? ''}</div>
      </div>
      <div className="absolute top-1 right-2 text-[10px] font-mono text-cyan-400/90 text-right pointer-events-none leading-tight">
        <div>{activeSeries?.description ?? ''}</div>
        <div>{activeSeries?.modality ?? ''}</div>
      </div>
      <div className="absolute bottom-1 left-2 text-[10px] font-mono text-cyan-400/90 pointer-events-none leading-tight">
        <div>Img {Math.min(activeImageIndex + 1, activeSeries?.instancesCount ?? 1)}/{activeSeries?.instancesCount ?? 1}</div>
        <div>ST 5.0mm</div>
      </div>
      <div className="absolute bottom-1 right-2 text-[10px] font-mono text-cyan-400/90 text-right pointer-events-none leading-tight">
        <div>1 cm</div>
        <div>×{zoom.toFixed(2)}</div>
      </div>
      {idx > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-600 text-xs font-mono">TILE {idx + 1}</span>
        </div>
      )}
    </div>
  )

  return (
    <div className="viewer-bg h-screen w-screen flex flex-col text-gray-200 font-sans overflow-hidden select-none">
      <div className="h-14 bg-viewer-panel border-b border-viewer-border flex items-center px-4 gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Scan className="w-5 h-5 text-medical-400" />
          <div className="text-sm">
            <span className="text-gray-400 mr-2">患者:</span>
            <span className="font-medium">{maskPatientName(study.patientName)}</span>
            <span className="text-gray-500 mx-2">|</span>
            <span className="text-gray-400 mr-2">ID:</span>
            <span className="font-mono text-xs">{maskPatientId(study.patientId)}</span>
          </div>
        </div>
        <div className="h-6 w-px bg-viewer-border" />
        <div className="text-xs text-gray-400 flex items-center gap-4">
          <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{study.bodyPart}</div>
          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{study.studyDate}</div>
          <span className="px-1.5 py-0.5 rounded bg-medical-600/30 text-medical-300 font-medium text-[10px] border border-medical-500/30">{study.modality}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {viewerWindowPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md border transition-colors",
                windowLevel.center === preset.center && windowLevel.width === preset.width
                  ? "bg-medical-600 border-medical-500 text-white"
                  : "bg-viewer-bg border-viewer-border text-gray-400 hover:border-medical-500/50 hover:text-gray-200"
              )}
            >
              {preset.name}
            </button>
          ))}
          <div className="h-6 w-px bg-viewer-border mx-1" />
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 w-8">WW:</span>
              <input
                type="range"
                min={100}
                max={3000}
                value={windowLevel.width}
                onChange={(e) => setWindowLevel({ ...windowLevel, width: parseInt(e.target.value) })}
                className="w-24 h-1 bg-viewer-border rounded appearance-none accent-medical-500"
              />
              <span className="font-mono text-cyan-400 w-14 text-right">{windowLevel.width}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500 w-8">WL:</span>
              <input
                type="range"
                min={-1000}
                max={1000}
                value={windowLevel.center}
                onChange={(e) => setWindowLevel({ ...windowLevel, center: parseInt(e.target.value) })}
                className="w-24 h-1 bg-viewer-border rounded appearance-none accent-medical-500"
              />
              <span className="font-mono text-cyan-400 w-14 text-right">{windowLevel.center}</span>
            </div>
          </div>
          <button
            onClick={resetView}
            className="ml-2 px-2.5 py-1 text-xs rounded-md border border-viewer-border text-gray-400 hover:border-medical-500/50 hover:text-gray-200 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            重置
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        <div className="w-72 bg-viewer-panel border-r border-viewer-border flex flex-col shrink-0">
          <div className="p-3 border-b border-viewer-border">
            <div className="bg-viewer-bg rounded-lg p-3 border border-viewer-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-medical-600/30 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-medical-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-100 truncate">
                    {maskPatientName(study.patientName)}
                    <span className="ml-1 text-gray-500 text-xs">
                      {study.patientGender === 'male' ? '男' : '女'} / {study.patientAge}岁
                    </span>
                  </div>
                  <div className="mt-1 space-y-0.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">检查号</span>
                      <span className="text-gray-300 font-mono">{study.accessionNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">部位</span>
                      <span className="text-gray-300">{study.bodyPart}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">设备</span>
                      <span className="text-medical-400 font-medium">{study.modality}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <button
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-400 rounded hover:bg-viewer-bg transition-colors mb-1"
                onClick={() => toggleSeriesExpanded(study.id)}
              >
                {expandedSeries.has(study.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <Layers className="w-3.5 h-3.5 text-medical-400" />
                <span>检查序列 ({seriesList.length})</span>
                <span className="ml-auto text-[10px] text-gray-600">{study.studyDate}</span>
              </button>

              {expandedSeries.has(study.id) && (
                <div className="space-y-1 pl-1">
                  {seriesList.map((series) => {
                    const isActive = series.id === (activeSeriesId || effectiveSeriesId)
                    return (
                      <div
                        key={series.id}
                        onClick={() => handleSelectSeries(series)}
                        className={cn(
                          "group cursor-pointer rounded-lg border p-2 transition-all",
                          isActive
                            ? "bg-medical-600/15 border-medical-500/60 shadow-[0_0_12px_rgba(37,99,235,0.15)]"
                            : "bg-viewer-bg border-viewer-border hover:border-gray-600"
                        )}
                      >
                        <div className="flex gap-2">
                          <div className={cn(
                            "w-14 h-14 rounded shrink-0 overflow-hidden border",
                            isActive ? "border-medical-500/60" : "border-viewer-border"
                          )}>
                            {series.thumbnail ? (
                              <img src={series.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-600 text-[10px]">
                                THUMB
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "text-xs font-medium truncate leading-tight",
                              isActive ? "text-medical-300" : "text-gray-300"
                            )}>
                              {series.description}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                              <span className="px-1 py-px rounded bg-gray-700/60 text-gray-300 font-mono">
                                {series.modality}
                              </span>
                              <span className="text-gray-500">
                                {series.instancesCount}帧
                              </span>
                            </div>
                            <div className="mt-1 text-[10px] text-gray-600 font-mono">
                              W:{series.images[0]?.windowWidth ?? series.windowWidth ?? '-'} C:{series.images[0]?.windowCenter ?? series.windowCenter ?? '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-14 bg-viewer-panel border-r border-viewer-border py-2 flex flex-col items-center gap-1 shrink-0 overflow-y-auto">
          <div className="w-10 h-px bg-viewer-border my-1" />
          {[
            { tool: 'select' as ToolType, icon: MousePointer2, label: '选择', key: 'V' },
            { tool: 'zoom' as ToolType, icon: ZoomIn, label: '缩放', key: 'Z' },
            { tool: 'pan' as ToolType, icon: Hand, label: '平移', key: 'H' },
            { icon: Search, label: '放大镜', key: 'M' },
          ].map(({ tool, icon: Icon, label, key }) => (
            <button
              key={label}
              onClick={() => tool && setActiveTool(tool)}
              className={cn(
                "w-10 h-10 rounded-lg flex flex-col items-center justify-center group relative transition-colors",
                tool && activeTool === tool
                  ? "bg-medical-600 text-white"
                  : "text-gray-400 hover:bg-viewer-bg hover:text-gray-200"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[8px] mt-0.5 text-gray-500">{key}</span>
              <span className="absolute left-full ml-2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
              </span>
            </button>
          ))}

          <div className="w-10 h-px bg-viewer-border my-1" />

          {[
            { icon: RotateCcw, label: '左旋转90°', key: 'L', onClick: rotateLeft },
            { icon: RotateCw, label: '右旋转90°', key: 'R', onClick: rotateRight },
            { icon: RefreshCw, label: '旋转180°', key: '', onClick: rotate180 },
            { icon: FlipHorizontal, label: '水平翻转', key: 'F', onClick: () => setFlipH(!flipH) },
          ].map(({ icon: Icon, label, key, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-viewer-bg hover:text-gray-200 group relative transition-colors"
            >
              <Icon className="w-4 h-4" />
              {key && <span className="text-[8px] mt-0.5 text-gray-500">{key}</span>}
              <span className="absolute left-full ml-2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
              </span>
            </button>
          ))}

          <div className="w-10 h-px bg-viewer-border my-1" />

          {[
            { icon: ChevronUpIcon, label: '上一序列', onClick: prevImage },
            { icon: ChevronDown, label: '下一序列', onClick: nextImage },
            {
              icon: autoPlay ? Pause : Play, label: autoPlay ? '停止' : '自动播放',
              onClick: () => setAutoPlay(!autoPlay),
              active: autoPlay
            },
          ].map(({ icon: Icon, label, onClick, active }) => (
            <button
              key={label}
              onClick={onClick}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center group relative transition-colors",
                active ? "bg-medical-600 text-white" : "text-gray-400 hover:bg-viewer-bg hover:text-gray-200"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="absolute left-full ml-2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
              </span>
            </button>
          ))}

          <div className="w-10 h-px bg-viewer-border my-1" />

          {[
            { icon: Minimize2, label: '缩小', onClick: () => setZoom(zoom - 0.2) },
            { icon: Maximize2, label: '放大', onClick: () => setZoom(zoom + 0.2) },
          ].map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-viewer-bg hover:text-gray-200 group relative transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span className="absolute left-full ml-2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
              </span>
            </button>
          ))}

          <div className="w-10 h-px bg-viewer-border my-1" />

          <button
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-viewer-bg hover:text-gray-200 group relative transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="absolute left-full ml-2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              布局
            </span>
          </button>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-10 bg-viewer-panel/60 border-b border-viewer-border flex items-center px-3 gap-1 shrink-0">
            <Grid3X3 className="w-3.5 h-3.5 text-gray-500 mr-1" />
            <span className="text-[11px] text-gray-500 mr-2">布局:</span>
            {layouts.map((l) => (
              <button
                key={l.value}
                onClick={() => setLayout(l.value)}
                className={cn(
                  "px-2.5 py-1 text-[11px] rounded-md border transition-colors",
                  layout === l.value
                    ? "bg-medical-600 border-medical-500 text-white"
                    : "bg-viewer-bg border-viewer-border text-gray-400 hover:border-gray-600 hover:text-gray-200"
                )}
              >
                {l.label}
              </button>
            ))}
            <div className="ml-auto text-[10px] font-mono text-gray-600">
              {currentImage?.width ?? 512}×{currentImage?.height ?? 512} | {currentImage?.bitsAllocated ?? 16}bit
            </div>
          </div>

          <div ref={containerRef} className="flex-1 p-2 overflow-hidden">
            <div className={cn('grid gap-1 h-full w-full', getLayoutGridCols())}>
              {Array.from({ length: tileCount }).map((_, idx) => renderCanvasTile(idx))}
            </div>
          </div>
        </div>

        <div className="w-14 bg-viewer-panel border-l border-viewer-border py-2 flex flex-col items-center gap-1 shrink-0 overflow-y-auto">
          {[
            { tool: 'length' as ToolType, icon: Ruler, label: '长度测量(mm)' },
            { tool: 'angle' as ToolType, icon: Triangle, label: '角度测量(°)' },
            { tool: 'area' as ToolType, icon: CircleDot, label: '面积测量(mm²)' },
          ].map(({ tool, icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setActiveTool(tool)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center group relative transition-colors",
                activeTool === tool
                  ? "bg-medical-600 text-white"
                  : "text-gray-400 hover:bg-viewer-bg hover:text-gray-200"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="absolute right-full mr-2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
              </span>
            </button>
          ))}

          <div className="w-10 h-px bg-viewer-border my-1" />

          {[
            { tool: 'ctvalue' as ToolType, icon: Target, label: 'CT值测量(ROI)' },
            { tool: 'arrow' as ToolType, icon: ArrowRight, label: '箭头标注' },
            { tool: 'text' as ToolType, icon: Type, label: '文字标注' },
          ].map(({ tool, icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setActiveTool(tool)}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center group relative transition-colors",
                activeTool === tool
                  ? "bg-medical-600 text-white"
                  : "text-gray-400 hover:bg-viewer-bg hover:text-gray-200"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="absolute right-full mr-2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
              </span>
            </button>
          ))}

          <div className="w-10 h-px bg-viewer-border my-1" />

          {[
            { icon: Undo2, label: '撤销上一个', onClick: undoAnnotation },
            { icon: Trash2, label: '全部删除', onClick: clearAnnotations },
          ].map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-viewer-bg hover:text-gray-200 group relative transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span className="absolute right-full mr-2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
              </span>
            </button>
          ))}

          <div className="w-10 h-px bg-viewer-border my-1" />

          {[
            { icon: Split, label: '对比模式', state: compareMode, onClick: () => setCompareMode(!compareMode) },
            { icon: Link, label: '同步开关', state: syncMode, onClick: () => setSyncMode(!syncMode) },
          ].map(({ icon: Icon, label, state, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center group relative transition-colors",
                state
                  ? "bg-medical-600 text-white"
                  : "text-gray-400 hover:bg-viewer-bg hover:text-gray-200"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="absolute right-full mr-2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
              </span>
            </button>
          ))}

          <div className="w-10 h-px bg-viewer-border my-1" />

          {[
            { icon: RotateCcw, label: '左旋转', onClick: rotateLeft },
            { icon: RotateCw, label: '右旋转', onClick: rotateRight },
          ].map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-viewer-bg hover:text-gray-200 group relative transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span className="absolute right-full mr-2 px-1.5 py-0.5 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-8 bg-viewer-panel border-t border-viewer-border flex items-center px-4 gap-6 shrink-0 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">坐标:</span>
          <span className="text-cyan-400">({mouseCoord.x}, {mouseCoord.y})</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">CT值:</span>
          <span className="text-amber-400">{mouseHU} HU</span>
        </div>
        <div className="w-px h-3 bg-viewer-border" />
        <div className="flex items-center gap-2">
          <span className="text-gray-500">窗宽:</span>
          <span className="text-medical-400">{windowLevel.width}</span>
          <span className="text-gray-500">窗位:</span>
          <span className="text-medical-400">{windowLevel.center}</span>
        </div>
        <div className="w-px h-3 bg-viewer-border" />
        <div className="flex items-center gap-2">
          <span className="text-gray-500">像素间距:</span>
          <span className="text-gray-400">0.488×0.488 mm</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-500">层厚:</span>
          <span className="text-gray-400">5.0 mm</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-gray-500">缩放:</span>
          <span className="text-green-400">{(zoom * 100).toFixed(0)}%</span>
          {annotations.length > 0 && (
            <>
              <span className="text-gray-600">|</span>
              <span className="text-purple-400">标注: {annotations.length}</span>
            </>
          )}
          {compareMode && (
            <>
              <span className="text-gray-600">|</span>
              <span className="text-cyan-400">对比</span>
            </>
          )}
          {syncMode && (
            <>
              <span className="text-gray-600">|</span>
              <span className="text-emerald-400">同步</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
