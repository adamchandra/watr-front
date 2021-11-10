import _ from 'lodash';

import {
  defineComponent,
  SetupContext,
  ref as deepRef,
  watch,
} from '@nuxtjs/composition-api';

import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import { useLabelDisplay } from '.';
import { ElementTypes, useSuperimposedElements } from '~/components/basics/superimposed-elements';

import { useInfoPane } from '~/components/single-pane/info-pane/info-pane';
import { decodeLabel, Label } from '~/lib/transcript/labels';

import { divRef } from '~/lib/vue-composition-lib';
import { taskifyPromise } from '~/lib/fp-ts-extras';
import { label, range } from '~/lib/transcript/gen-testdata';
import { line, point, rect } from '~/lib/transcript/shapes';


export default defineComponent({
  components: {},

  setup(_props, _context: SetupContext) {
    const infoPaneDiv = divRef();
    const superimposedElemDiv = divRef();

    const showBasicShapes = deepRef(false);
    const showCompoundShapes = deepRef(false);

    const run = pipe(
      TE.right({}),
      TE.bind('superimposedElements', ({ }) => taskifyPromise(useSuperimposedElements({ mountPoint: superimposedElemDiv, includeElems: [ElementTypes.Svg] }))),
      TE.bind('infoPane', ({ }) => taskifyPromise(useInfoPane({ mountPoint: infoPaneDiv }))),
      TE.bind('labelDisplay', ({ superimposedElements }) => taskifyPromise(useLabelDisplay({ superimposedElements }))),
      TE.map(({ infoPane, superimposedElements, labelDisplay }) => {
        superimposedElements.setDimensions(800, 1000);
        const { showLabel, clearAll } = labelDisplay;
        const { putStringLn } = infoPane;

        putStringLn('Hello From Storyland!');

        watch(showBasicShapes, (show) => {
          if (show) {
            drawBasicShapes(showLabel);
          } else {
            clearAll();
          }
        });
        watch(showCompoundShapes, (show) => {
          if (show) {
            drawCompoundShapes(showLabel);
          } else {
            clearAll();
          }
        });
      }),
    );

    run();

    return {
      infoPaneDiv,
      superimposedElemDiv,
      showBasicShapes,
      showCompoundShapes,
    };
  },

});

function drawBasicShapes(showLabel: (l: Label) => void) {
  // const modifiers = [
  //   // For lines:
  //   { role: 'underline' }, // arrow|extents-brace(left,right,..)
  //   // For rectangles:
  //   { role: 'outline' }, // area
  // ];
  const examples: Label[] = [
    label('Baseline')
      .withRange(range(line(point(10, 20), point(300, 40))))
      .withProps('role', ['underline']).get(),
    label('Arrow')
      .withRange(range(line(point(10, 30), point(200, 50))))
      .withProps('role', ['arrow']).get(),
    label('OutlineRegion')
      .withRange(range(rect(10, 50, 300, 400)))
      .withProps('role', ['outline']).get(),
    label('ShadedArea')
      .withRange(range(rect(10, 50, 300, 400)))
      .withProps('role', ['shaded']).get(),
  ];

  _.each(examples, (l: Label) => {
    showLabel(l);
  });
}

function drawCompoundShapes(showLabel: (l: Label) => void) {
  const xoffset = 60;
  const yoffset = 50;
  const rows = 4;
  const cols = 6;
  const xscale = 20;
  const yscale = 14;

  const indexes = _.flatMap(
    _.range(rows),
    (rown) => _.map(_.range(cols), (coln) => [rown, coln])
  );

  const cellLabels = _.map(
    indexes,
    ([row, col]) => {
      const x = (col * xscale) + xoffset;
      const y = (row * yscale) + yoffset;
      const l = label(`c[${row},${col}]`)
        .withRange(range(rect(x, y, xscale, yscale)));

      if (x === 1 && y === 1) {
        return l.withProps('role', ['icon']).get();
      }
      return l.get();
    }
  );
  const examples: Label[] = [
    label('GridCells')
      .withProps('display', ['icon'])
      .withChildren(cellLabels)
      .get(),
  ];
  _.each(examples, (l: Label) => {
    showLabel(l);
  });
}
