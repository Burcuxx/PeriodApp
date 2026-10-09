// RN port: works on plain pointer samples coming from a gesture-handler Pan
// gesture instead of DOM Touch/Mouse events. Flick force logic is unchanged.
import { mathAbs } from './utils'

export type PointerSampleType = {
  point: number
  cross: number
  time: number
}

export type DragTrackerType = {
  pointerDown: (sample: PointerSampleType) => number
  pointerMove: (sample: PointerSampleType) => number
  pointerUp: (sample: PointerSampleType) => number
}

export function DragTracker(): DragTrackerType {
  const logInterval = 170

  let startEvent: PointerSampleType | null = null
  let lastEvent: PointerSampleType | null = null

  function pointerDown(sample: PointerSampleType): number {
    startEvent = sample
    lastEvent = sample
    return sample.point
  }

  function pointerMove(sample: PointerSampleType): number {
    if (!startEvent || !lastEvent) return 0
    const diff = sample.point - lastEvent.point
    const expired = sample.time - startEvent.time > logInterval

    lastEvent = sample
    if (expired) startEvent = sample
    return diff
  }

  function pointerUp(sample: PointerSampleType): number {
    if (!startEvent || !lastEvent) return 0
    const diffDrag = lastEvent.point - startEvent.point
    const diffTime = sample.time - startEvent.time
    const expired = sample.time - lastEvent.time > logInterval
    const force = diffDrag / diffTime
    const isFlick = diffTime && !expired && mathAbs(force) > 0.1

    startEvent = null
    lastEvent = null
    return isFlick ? force : 0
  }

  const self: DragTrackerType = {
    pointerDown,
    pointerMove,
    pointerUp
  }
  return self
}
