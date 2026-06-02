import { Easing, interpolate } from 'remotion'

export const easeOutExpo = Easing.bezier(0.16, 1, 0.3, 1)

export const progressBetween = (
  frame: number,
  start: number,
  end: number,
  easing = easeOutExpo
) => {
  return interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  })
}

export const pushIn = (
  frame: number,
  start: number,
  end: number,
  fromScale = 0.92,
  toScale = 1
) => {
  const p = progressBetween(frame, start, end)
  return {
    opacity: p,
    scale: fromScale + (toScale - fromScale) * p,
  }
}

export const resolveFade = (frame: number, start: number, end: number) => {
  const p = progressBetween(frame, start, end)
  return {
    opacity: p,
    blur: 8 * (1 - p),
  }
}

export const focusDim = (frame: number, start: number, end: number, inactive = 0.28) => {
  const p = progressBetween(frame, start, end)
  return inactive + (1 - inactive) * p
}
