import anime from 'animejs';
import { Rect } from './transcript/shapes';

export async function tweenRect(start: Rect, end: Rect, onUpdate: (bbox: Rect) => void): Promise<Rect> {
  const initial = {
    x: start.x,
    y: start.y,
    width: start.width,
    height: start.height,
  };

  const anim0 = anime({
    targets: initial,
    x: end.x,
    y: end.y,
    width: end.width,
    height: end.height,
    easing: 'linear',
    duration: 100,
    update: () => {
      // TODO rewrite w/rect from bbox
      // const b = coords.mk.fromLtwh(initial.x, initial.y, initial.width, initial.height);
      // onUpdate(b);
      onUpdate(start);
    },
  });

  // TODO rewrite w/rect from bbox
  // return anim0.finished.then(() => {
  //   const b = coords.mk.fromLtwh(initial.x, initial.y, initial.width, initial.height);
  //   return b;
  // });
  return anim0.finished.then(() => start);
}
