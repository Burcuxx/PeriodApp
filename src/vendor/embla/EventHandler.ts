// RN port: a trimmed-down event emitter without the EmblaCarouselType api
// argument, since the React component owns the engine directly.
export type EmblaEventType =
  | 'pointerDown'
  | 'pointerUp'
  | 'scroll'
  | 'select'
  | 'settle'

type CallbackType = (evt: EmblaEventType) => void
type ListenersType = Partial<{ [key in EmblaEventType]: CallbackType[] }>

export type EventHandlerType = {
  emit: (evt: EmblaEventType) => EventHandlerType
  on: (evt: EmblaEventType, cb: CallbackType) => EventHandlerType
  off: (evt: EmblaEventType, cb: CallbackType) => EventHandlerType
  clear: () => void
}

export function EventHandler(): EventHandlerType {
  let listeners: ListenersType = {}

  function getListeners(evt: EmblaEventType): CallbackType[] {
    return listeners[evt] || []
  }

  function emit(evt: EmblaEventType): EventHandlerType {
    getListeners(evt).forEach((e) => e(evt))
    return self
  }

  function on(evt: EmblaEventType, cb: CallbackType): EventHandlerType {
    listeners[evt] = getListeners(evt).concat([cb])
    return self
  }

  function off(evt: EmblaEventType, cb: CallbackType): EventHandlerType {
    listeners[evt] = getListeners(evt).filter((e) => e !== cb)
    return self
  }

  function clear(): void {
    listeners = {}
  }

  const self: EventHandlerType = {
    emit,
    off,
    on,
    clear
  }
  return self
}
