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

        const {
          putStringLn,
        } = infoPane;

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
  const examples: any[] = [
    { range: [{ unit: 'shape', at: [[8684, 6472], [9255, 4024]] }], name: 'HorizonLine' },
    { range: [{ unit: 'shape', at: [3684, 6472, 4255, 4024] }], name: 'HorizonRect' },
  ];

  _.each(examples, (ex) => {
    const l: Label | null = decodeLabel(ex);
    showLabel(l);
  });
}

function drawCompoundShapes(showLabel: (l: Label) => void) {
  const examples = [{
    children: [{
      children: [{
        props: {
          class: ['=eager'],
        },
        range: [{ unit: 'shape', at: [29_748, 75_954, 381, 545] }],
        name: 'FocalRect',
      }, {
        range: [{ unit: 'shape', at: [29_748, 75_954, 381, 2937] }],
        name: 'HorizonRect',
      }, {
        children: [{
          range: [{ unit: 'shape', at: [29_748, 76_500, 381, 2391] }],
          name: 'Query/Cell:Bottom',
        }],
        range: [],
        name: 'SearchArea',
      }],
      range: [],
      name: 'Octothorpe',
    }, {
      children: [],
      range: [],
      name: 'Found',
    }],
    props: {
      class: ['>lazy'],
      outline: ['FindMonoFontBlocks', 'ConnectComponents', 'WithAdjacentSkyline/Down'],
    },
    range: [],
    name: 'OctSearch',
  }, {
    children: [{
      props: { class: ['=eager'] },
      range: [{ unit: 'shape', at: [7220, 29_427, 46_572, 500] }],
      name: 'FocalRect',
    }, {
      range: [{ unit: 'shape', at: [7235, 31_587, 46_555, 500] }],
      name: 'HitRect',
    }, {
      range: [{ unit: 'shape', at: [7235, 29_927, 46_555, 1660] }],
      name: 'OcclusionQuery',
    }, {
      range: [],
      name: 'Occlusions',
    }, {
      range: [{ unit: 'shape', at: [7235, 31_587, 46_555, 500] }],
      name: 'FinalHit',
    }],
    props: {
      class: ['>lazy'],
    },
    range: [],
    name: 'FacingDownFind( BaselineMidriseBand )',
  }];

  _.each(examples, (ex) => {
    const l: Label | null = decodeLabel(ex);
    showLabel(l);
  });
}
