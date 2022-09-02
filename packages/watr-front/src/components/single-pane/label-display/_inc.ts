import _ from 'lodash';

import {
  defineComponent,
  SetupContext,
  ref as deepRef,
  // watch,
} from '@nuxtjs/composition-api';

import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import { useLabelDisplay } from '.';
import { ElementTypes, useSuperimposedElements } from '~/components/basics/superimposed-elements';

import { useInfoPane } from '~/components/single-pane/info-pane/info-pane';
import { Label } from '~/lib/transcript/labels';

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
        const svgWidth = 800;
        const svgHeight = 1000;
        superimposedElements.setDimensions(svgWidth, svgHeight);
        const { showLabel } = labelDisplay;
        const { putStringLn } = infoPane;

        putStringLn('Hello From Storyland!');

        drawBasicShapes(showLabel);
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

interface GridIndex {
  row: number;
  col: number;
  x: number;
  y: number;
}
interface GridProps {
  rows: number;
  cols: number;
  xscale: number;
  yscale: number;
  xoffset: number;
  yoffset: number;
}

function makeGridIndexes({
  rows,
  cols,
  xscale,
  yscale,
  xoffset,
  yoffset
}: GridProps): GridIndex[] {
  const indexes = _.flatMap(
    _.range(rows),
    (rown) => _.map(_.range(cols), (coln) => [rown, coln])
  );
  return _.map(
    indexes,
    ([row, col]) => {
      const x = (col * xscale) + xoffset;
      const y = (row * yscale) + yoffset;
      return {
        row, col, x, y
      };
    }
  );
}

function drawBasicShapes(showLabel: (l: Label) => void) {
  const galleryGrid = makeGridIndexes({
    rows: 3, cols: 3, xscale: 200, yscale: 200, xoffset: 10, yoffset: 10
  });

  const examples: ((x: number, y: number) => Label)[] = [
    (x, y) => label('Baseline')
      .withRange(range(line(point(x + 10, y + 20), point(x + 80, y + 40))))
      .withProps('role', ['underline']).get(),
    (x, y) => label('Arrow')
      .withRange(range(line(point(x + 5, y + 4), point(x + 70, y + 50))))
      .withProps('role', ['arrow']).get(),
    (x, y) => label('OutlineRegion')
      .withRange(range(rect(x + 2, y + 3, 70, 80)))
      .withProps('role', ['outline']).get(),
    (x, y) => label('ShadedArea')
      .withRange(range(rect(x + 3, y + 3, 40, 50)))
      .withProps('role', ['shaded']).get(),
    (x, y) => makeGridLabel(x, y)
  ];
  const exampleGallery = _.map(_.zip(examples, galleryGrid), ([lfunc, grid]) => {
    if (lfunc && grid) {
      return lfunc(grid.x, grid.y);
    }
  });

  _.each(exampleGallery, (l?: Label) => {
    if (l !== undefined) {
      showLabel(l);
    }
  });
}

function makeGridLabel(showAtX: number, showAtY: number): Label {
  const xscale = 20;
  const yscale = 14;

  const cellIndexes = makeGridIndexes({ rows: 4, cols: 6, xscale, yscale, xoffset: showAtX, yoffset: showAtY });

  const cellLabels = _.map(
    cellIndexes, ({ row, col, x, y }) => {
      const l = label(`c[${row},${col}]`)
        .withRange(range(rect(x, y, xscale, yscale)));

      if (row === 1 && col === 1) {
        return l.withProps('role', ['icon']).get();
      }
      return l.get();
    }
  );
  return label('GridCells')
    .withProps('display', ['icon'])
    .withChildren(cellLabels)
    .get();
}
