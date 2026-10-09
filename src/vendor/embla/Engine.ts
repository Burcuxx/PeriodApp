// RN port of Embla's Engine. Slides are assumed to be equal-width columns laid
// out in a row with a fixed gap, so their rects are computed instead of
// measured from the DOM. Loop, slidesInView, focus and resize/slides observers
// are not ported; the React component rebuilds the engine on layout changes.
import { Alignment, AlignmentOptionType } from './Alignment'
import { Animations, AnimationsType } from './Animations'
import { Axis, AxisDirectionOptionType, AxisType } from './Axis'
import { Counter, CounterType } from './Counter'
import { DragHandler, DragHandlerType } from './DragHandler'
import { DragTracker } from './DragTracker'
import { EventHandler, EventHandlerType } from './EventHandler'
import { LimitType } from './Limit'
import { NodeRectType } from './NodeRects'
import { PercentOfView } from './PercentOfView'
import { ScrollBody, ScrollBodyType } from './ScrollBody'
import { ScrollBounds, ScrollBoundsType } from './ScrollBounds'
import { ScrollContain, ScrollContainOptionType } from './ScrollContain'
import { ScrollLimit } from './ScrollLimit'
import { ScrollProgress, ScrollProgressType } from './ScrollProgress'
import { ScrollSnaps } from './ScrollSnaps'
import { ScrollTarget, ScrollTargetType } from './ScrollTarget'
import { ScrollTo, ScrollToType } from './ScrollTo'
import { SlideSizes } from './SlideSizes'
import { SlidesToScroll, SlidesToScrollOptionType } from './SlidesToScroll'
import { Vector1D, Vector1DType } from './Vector1d'
import { arrayLast, arrayLastIndex, roundToTwoDecimals } from './utils'

export type EngineOptionsType = {
  align: AlignmentOptionType
  containScroll: ScrollContainOptionType
  direction: AxisDirectionOptionType
  slidesToScroll: SlidesToScrollOptionType
  dragFree: boolean
  skipSnaps: boolean
  duration: number
  startIndex: number
}

export const defaultEngineOptions: EngineOptionsType = {
  align: 'start',
  containScroll: 'trimSnaps',
  direction: 'ltr',
  slidesToScroll: 1,
  dragFree: false,
  skipSnaps: false,
  duration: 25,
  startIndex: 0
}

export type EngineLayoutType = {
  viewSize: number
  slideSize: number
  slideGap: number
  slideCount: number
}

export type EngineType = {
  axis: AxisType
  animation: AnimationsType
  eventHandler: EventHandlerType
  dragHandler: DragHandlerType
  scrollBody: ScrollBodyType
  scrollBounds: ScrollBoundsType
  scrollTo: ScrollToType
  scrollTarget: ScrollTargetType
  scrollProgress: ScrollProgressType
  scrollSnaps: number[]
  limit: LimitType
  index: CounterType
  indexPrevious: CounterType
  location: Vector1DType
  offsetLocation: Vector1DType
  previousLocation: Vector1DType
  target: Vector1DType
  contentSize: number
  destroy: () => void
}

function measureRects(
  direction: AxisDirectionOptionType,
  { viewSize, slideSize, slideGap, slideCount }: EngineLayoutType
): { containerRect: NodeRectType; slideRects: NodeRectType[] } {
  const isRightToLeft = direction === 'rtl'
  const containerRect: NodeRectType = {
    top: 0,
    right: viewSize,
    bottom: 0,
    left: 0,
    width: viewSize,
    height: 0
  }
  const slideRects = Array.from(Array(slideCount), (_, i) => {
    const offset = i * (slideSize + slideGap)
    const left = isRightToLeft ? viewSize - offset - slideSize : offset
    return {
      top: 0,
      right: left + slideSize,
      bottom: 0,
      left,
      width: slideSize,
      height: 0
    }
  })
  return { containerRect, slideRects }
}

export function Engine(
  layout: EngineLayoutType,
  options: EngineOptionsType,
  translate: (n: number) => void
): EngineType {
  const {
    align,
    direction,
    startIndex,
    duration,
    dragFree,
    slidesToScroll: groupSlides,
    skipSnaps,
    containScroll
  } = options
  const loop = false

  // Measurements
  const pixelTolerance = 2
  const { containerRect, slideRects } = measureRects(direction, layout)
  const axis = Axis('x', direction)
  const viewSize = axis.measureSize(containerRect)
  const percentOfView = PercentOfView(viewSize)
  const alignment = Alignment(align, viewSize)
  const containSnaps = !!containScroll
  const { slideSizesWithGaps, startGap, endGap } = SlideSizes(
    axis,
    containerRect,
    slideRects,
    containSnaps,
    0
  )
  const slidesToScroll = SlidesToScroll(
    axis,
    viewSize,
    groupSlides,
    loop,
    containerRect,
    slideRects,
    startGap,
    endGap,
    pixelTolerance
  )
  const { snaps, snapsAligned } = ScrollSnaps(
    axis,
    alignment,
    containerRect,
    slideRects,
    slidesToScroll
  )
  const contentSize = -arrayLast(snaps) + arrayLast(slideSizesWithGaps)
  const { snapsContained } = ScrollContain(
    viewSize,
    contentSize,
    snapsAligned,
    containScroll,
    pixelTolerance
  )
  const scrollSnaps = containSnaps ? snapsContained : snapsAligned
  const { limit } = ScrollLimit(contentSize, scrollSnaps, loop)

  // Indexes
  const index = Counter(arrayLastIndex(scrollSnaps), startIndex, loop)
  const indexPrevious = index.clone()

  // Shared
  const eventHandler = EventHandler()
  const friction = 0.68
  const startLocation = scrollSnaps[index.get()]
  const location = Vector1D(startLocation)
  const previousLocation = Vector1D(startLocation)
  const offsetLocation = Vector1D(startLocation)
  const target = Vector1D(startLocation)
  const scrollBody = ScrollBody(
    location,
    offsetLocation,
    previousLocation,
    target,
    duration,
    friction
  )
  const scrollBounds = ScrollBounds(
    limit,
    offsetLocation,
    target,
    scrollBody,
    percentOfView
  )
  const scrollTarget = ScrollTarget(
    loop,
    scrollSnaps,
    contentSize,
    limit,
    target
  )

  let previousTranslate: number | null = null

  function translateTo(n: number): void {
    const next = roundToTwoDecimals(axis.direction(n))
    if (next === previousTranslate) return
    previousTranslate = next
    translate(next)
  }

  function update(): void {
    scrollBounds.constrain(dragHandler.pointerDown())
    scrollBody.seek()
  }

  function render(alpha: number): void {
    const hasSettled = scrollBody.settled() && !scrollBounds.shouldConstrain()
    const hasSettledAndIdle = hasSettled && !dragHandler.pointerDown()

    if (hasSettledAndIdle) animation.stop()

    const interpolatedLocation =
      location.get() * alpha + previousLocation.get() * (1 - alpha)

    offsetLocation.set(interpolatedLocation)
    translateTo(offsetLocation.get())

    if (hasSettledAndIdle) eventHandler.emit('settle')
    if (!hasSettled) eventHandler.emit('scroll')
  }

  const animation = Animations(update, render)
  const scrollTo = ScrollTo(
    animation,
    index,
    indexPrevious,
    scrollBody,
    scrollTarget,
    target,
    eventHandler
  )
  const dragHandler = DragHandler(
    axis,
    target,
    DragTracker(),
    location,
    animation,
    scrollTo,
    scrollBody,
    scrollTarget,
    index,
    eventHandler,
    percentOfView,
    dragFree,
    skipSnaps,
    friction
  )

  function destroy(): void {
    animation.destroy()
    eventHandler.clear()
  }

  animation.init()
  translateTo(startLocation)

  const engine: EngineType = {
    axis,
    animation,
    eventHandler,
    dragHandler,
    scrollBody,
    scrollBounds,
    scrollTo,
    scrollTarget,
    scrollProgress: ScrollProgress(limit),
    scrollSnaps,
    limit,
    index,
    indexPrevious,
    location,
    offsetLocation,
    previousLocation,
    target,
    contentSize,
    destroy
  }
  return engine
}
