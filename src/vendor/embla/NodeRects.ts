// RN port: only the rect type is kept. Rects are computed by the caller from
// onLayout measurements instead of reading offsetLeft/offsetWidth from the DOM.
export type NodeRectType = {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}
