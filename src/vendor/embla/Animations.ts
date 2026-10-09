// RN port: same fixed-timestep loop as Embla, driven by the global
// requestAnimationFrame. AppState replaces document `visibilitychange`.
import { AppState, NativeEventSubscription } from 'react-native'

export type AnimationsType = {
  init: () => void
  destroy: () => void
  start: () => void
  stop: () => void
  update: () => void
  render: (alpha: number) => void
}

export function Animations(
  update: () => void,
  render: (alpha: number) => void
): AnimationsType {
  const fixedTimeStep = 1000 / 60

  let appStateSubscription: NativeEventSubscription | null = null
  let lastTimeStamp: number | null = null
  let accumulatedTime = 0
  let animationId = 0

  function init(): void {
    appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') reset()
    })
  }

  function destroy(): void {
    stop()
    appStateSubscription?.remove()
    appStateSubscription = null
  }

  function animate(timeStamp: number): void {
    if (!animationId) return
    if (!lastTimeStamp) {
      lastTimeStamp = timeStamp
      update()
      update()
    }

    const timeElapsed = timeStamp - lastTimeStamp
    lastTimeStamp = timeStamp
    accumulatedTime += timeElapsed

    while (accumulatedTime >= fixedTimeStep) {
      update()
      accumulatedTime -= fixedTimeStep
    }

    const alpha = accumulatedTime / fixedTimeStep
    render(alpha)

    if (animationId) {
      animationId = requestAnimationFrame(animate)
    }
  }

  function start(): void {
    if (animationId) return
    animationId = requestAnimationFrame(animate)
  }

  function stop(): void {
    cancelAnimationFrame(animationId)
    lastTimeStamp = null
    accumulatedTime = 0
    animationId = 0
  }

  function reset(): void {
    lastTimeStamp = null
    accumulatedTime = 0
  }

  const self: AnimationsType = {
    init,
    destroy,
    start,
    stop,
    update,
    render
  }
  return self
}
