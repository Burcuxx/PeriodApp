# Embla Carousel engine (React Native port)

Source: https://github.com/davidjerleke/embla-carousel
Tag: `v8.6.0` (commit `0fe65834136f1aa35e4c1a4a477e5ccb4bb5ee54`),
path `packages/embla-carousel/src/components/`. License: MIT (see `LICENSE`).

## Copied unchanged

`Alignment`, `Axis`, `Counter`, `Limit`, `PercentOfView`, `ScrollBody`,
`ScrollBounds`, `ScrollContain`, `ScrollLimit`, `ScrollProgress`,
`ScrollSnaps`, `ScrollTarget`, `ScrollTo`, `SlidesToScroll`, `Vector1d`.

## Modified for React Native

- `utils.ts`: removed `isMouseEvent` / `WindowType` (DOM only).
- `SlideSizes.ts`: the trailing margin is passed in instead of being read with
  `getComputedStyle`.
- `NodeRects.ts`: only the `NodeRectType` type is kept.
- `EventHandler.ts`: trimmed to the events the port emits.
- `Animations.ts`: global `requestAnimationFrame`, and `AppState` instead of
  `visibilitychange`.
- `DragTracker.ts`, `DragHandler.ts`: take pointer samples from a
  `react-native-gesture-handler` Pan gesture instead of DOM events.
- `Engine.ts`: computes slide rects for equal-width columns instead of
  measuring the DOM. Loop, slides-in-view, focus and resize/mutation observers
  are not ported.

To upgrade, diff the files above against the new tag and re-apply the changes.
