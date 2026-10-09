// RN port: event wiring is removed. The Pan gesture calls down/move/up and
// already decides scroll vs. cross-axis intent (activeOffsetX/failOffsetY), so
// Embla's preventScroll/preventClick bookkeeping is not needed here.
// Force, threshold and friction math is unchanged.
import { AnimationsType } from './Animations'
import { CounterType } from './Counter'
import { DragTrackerType, PointerSampleType } from './DragTracker'
import { EventHandlerType } from './EventHandler'
import { AxisType } from './Axis'
import { ScrollBodyType } from './ScrollBody'
import { ScrollTargetType } from './ScrollTarget'
import { ScrollToType } from './ScrollTo'
import { Vector1DType } from './Vector1d'
import { PercentOfViewType } from './PercentOfView'
import { Limit } from './Limit'
import { factorAbs, mathAbs, mathSign } from './utils'

export type DragHandlerType = {
  down: (sample: PointerSampleType, isMouse: boolean) => void
  move: (sample: PointerSampleType) => void
  up: (sample: PointerSampleType) => void
  pointerDown: () => boolean
}

export function DragHandler(
  axis: AxisType,
  target: Vector1DType,
  dragTracker: DragTrackerType,
  location: Vector1DType,
  animation: AnimationsType,
  scrollTo: ScrollToType,
  scrollBody: ScrollBodyType,
  scrollTarget: ScrollTargetType,
  index: CounterType,
  eventHandler: EventHandlerType,
  percentOfView: PercentOfViewType,
  dragFree: boolean,
  skipSnaps: boolean,
  baseFriction: number
): DragHandlerType {
  const { direction } = axis
  const goToNextThreshold = Limit(50, 225).constrain(percentOfView.measure(20))
  const snapForceBoost = { mouse: 300, touch: 400 }
  const freeForceBoost = { mouse: 500, touch: 600 }
  const baseSpeed = dragFree ? 43 : 25

  let pointerIsDown = false
  let isMouse = false

  function forceBoost(): number {
    const boost = dragFree ? freeForceBoost : snapForceBoost
    const type = isMouse ? 'mouse' : 'touch'
    return boost[type]
  }

  function allowedForce(force: number, targetChanged: boolean): number {
    const next = index.add(mathSign(force) * -1)
    const baseForce = scrollTarget.byDistance(force, !dragFree).distance

    if (dragFree || mathAbs(force) < goToNextThreshold) return baseForce
    if (skipSnaps && targetChanged) return baseForce * 0.5

    return scrollTarget.byIndex(next.get(), 0).distance
  }

  function down(sample: PointerSampleType, mouse: boolean): void {
    isMouse = mouse
    pointerIsDown = true
    dragTracker.pointerDown(sample)
    scrollBody.useFriction(0).useDuration(0)
    target.set(location)
    eventHandler.emit('pointerDown')
  }

  function move(sample: PointerSampleType): void {
    if (!pointerIsDown) return
    const diff = dragTracker.pointerMove(sample)

    scrollBody.useFriction(0.3).useDuration(0.75)
    animation.start()
    target.add(direction(diff))
  }

  function up(sample: PointerSampleType): void {
    if (!pointerIsDown) return
    const currentLocation = scrollTarget.byDistance(0, false)
    const targetChanged = currentLocation.index !== index.get()
    const rawForce = dragTracker.pointerUp(sample) * forceBoost()
    const force = allowedForce(direction(rawForce), targetChanged)
    const forceFactor = factorAbs(rawForce, force)
    const speed = baseSpeed - 10 * forceFactor
    const friction = baseFriction + forceFactor / 50

    pointerIsDown = false
    scrollBody.useDuration(speed).useFriction(friction)
    scrollTo.distance(force, !dragFree)
    isMouse = false
    eventHandler.emit('pointerUp')
  }

  function pointerDown(): boolean {
    return pointerIsDown
  }

  const self: DragHandlerType = {
    down,
    move,
    up,
    pointerDown
  }
  return self
}
