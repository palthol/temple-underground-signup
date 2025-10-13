import React from 'react'
import SignaturePad from 'signature_pad'
import type { PointGroup } from 'signature_pad/dist/types/signature_pad'

const CANVAS_WIDTH = 640
const CANVAS_HEIGHT = 240

export type SignatureValue = {
  pngDataUrl: string
  vectorJson: PointGroup[]
}

type Props = {
  value?: SignatureValue
  onChange: (value: SignatureValue) => void
  className?: string
}

const EMPTY_SIGNATURE: SignatureValue = { pngDataUrl: '', vectorJson: [] }

export const SignatureField: React.FC<Props> = ({ value, onChange, className }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const padRef = React.useRef<SignaturePad | null>(null)
  const syncingRef = React.useRef(false)

  const commitSignature = React.useCallback(() => {
    const pad = padRef.current
    if (!pad) return
    const vectorJson = pad.toData()
    const pngDataUrl = pad.isEmpty() ? '' : pad.toDataURL('image/png')
    onChange({ pngDataUrl, vectorJson })
  }, [onChange])

  const clear = React.useCallback(() => {
    padRef.current?.clear()
    onChange(EMPTY_SIGNATURE)
  }, [onChange])

  const resizeCanvas = React.useCallback(() => {
    const canvas = canvasRef.current
    const pad = padRef.current
    if (!canvas || !pad) return
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    canvas.width = CANVAS_WIDTH * ratio
    canvas.height = CANVAS_HEIGHT * ratio
    canvas.style.width = `${CANVAS_WIDTH}px`
    canvas.style.height = `${CANVAS_HEIGHT}px`
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(ratio, ratio)
    if (value?.vectorJson && value.vectorJson.length) {
      syncingRef.current = true
      pad.fromData(value.vectorJson as any)
      syncingRef.current = false
    } else {
      pad.clear()
    }
  }, [value?.vectorJson])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pad = new SignaturePad(canvas, {
      penColor: '#0f172a',
      backgroundColor: '#ffffff',
      minWidth: 0.5,
      maxWidth: 2.5,
    })
    padRef.current = pad
    const handleEnd = () => {
      if (syncingRef.current) return
      commitSignature()
    }
    pad.addEventListener('endStroke', handleEnd)
    resizeCanvas()
    return () => {
      pad.removeEventListener('endStroke', handleEnd)
      pad.off()
      padRef.current = null
    }
  }, [commitSignature, resizeCanvas])

  React.useEffect(() => {
    const pad = padRef.current
    if (!pad) return
    if (value?.vectorJson && value.vectorJson.length) {
      syncingRef.current = true
      pad.fromData(value.vectorJson as any)
      syncingRef.current = false
    } else if (!pad.isEmpty()) {
      pad.clear()
    }
  }, [value?.vectorJson])

  React.useEffect(() => {
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [resizeCanvas])

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="h-48 w-full touch-none"
        aria-label="Signature pad"
      />
      <div className="mt-2 flex justify-between">
        <button type="button" onClick={clear} className="text-sm text-slate-500 hover:text-slate-700">
          Clear signature
        </button>
        <span className="text-xs text-gray-500">Sign using your mouse or touch input.</span>
      </div>
    </div>
  )
}
