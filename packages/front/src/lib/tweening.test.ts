import 'chai/register-should';

import anime from 'animejs';
import { tweenRect } from './tweening';
import { rect } from './transcript/shapes';

describe('Tweening support', () => {
  it.only('all tests disabled', () => {});

  it('tweens bbox', async () => {
    const b1 = rect(10, 10, 100, 200);
    const b2 = rect(20, 30, 40, 40);
    const p = tweenRect(b1, b2, (_curr) => {
      // prettyPrint({ m: 'Current', curr })
    }).then((_b) => {
      // prettyPrint({ m: 'Ending', b })
    });

    return p;
  });

  it('smokescreen', async () => {
    const position = { x: 100 };
    const waypoint1 = { x: 150 };

    const anim0 = anime({
      targets: position,
      x: 150,
      easing: 'linear',
      autoplay: false,
      update: () => {
        doUpdate(position, waypoint1);
      },
    });

    const fini = anim0.finished;
    anim0.play();

    function doUpdate(_obj: any, _target: object) {
      // prettyPrint({ m: 'update', obj, target })
      return true;
    }

    return fini.then(() => {
      console.log('done');
    });
  });
});
