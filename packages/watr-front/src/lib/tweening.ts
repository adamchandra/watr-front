import anime from 'animejs'
import * as coords from '~/lib/coord-sys'
import { BBox } from '~/lib/coord-sys'

export async function tweenBBox(start: BBox, end: BBox, onUpdate: (bbox: BBox) => void): Promise<BBox> {
  const initial = {
    x: start.x,
    y: start.y,
    width: start.width,
    height: start.height
  }

  const anim0 = anime({
    targets: initial,
    x: end.x,
    y: end.y,
    width: end.width,
    height: end.height,
    easing: 'linear',
    duration: 100,
    update: () => {
      const b = coords.mk.fromLtwh(initial.x, initial.y, initial.width, initial.height)
      onUpdate(b)
    }
  })

  return anim0.finished.then(() => {
    const b = coords.mk.fromLtwh(initial.x, initial.y, initial.width, initial.height)
    return b
  })
}
