import _ from 'lodash'

import {
  defineComponent,
  SetupContext,
  ref as deepRef,
  watch,
} from '@nuxtjs/composition-api'

import { divRef } from '~/lib/vue-composition-lib'

import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { useLabelDisplay } from '.';
import { ElementTypes, useSuperimposedElements } from '~/components/basics/superimposed-elements';

import { useInfoPane } from '~/components/single-pane/info-pane/info-pane';
import { Label } from '~/lib/transcript/labels';

import { isLeft, Either } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { Errors } from 'io-ts';

export function decodeLabel(input: unknown): Label | null {
  const maybeDecoded: Either<Errors, Label> = Label.decode(input)
  if (isLeft(maybeDecoded)) {
    const report = PathReporter.report(maybeDecoded)
    console.log(report);
    return null;
  }

  return maybeDecoded.right;
}

export default defineComponent({
  components: {},

  setup(_props, _context: SetupContext) {
    const infoPaneDiv = divRef();
    const superimposedElemDiv = divRef();

    const showBasicShapes = deepRef(false);
    const showCompoundShapes = deepRef(false);

    const run = pipe(
      TE.right({}),
      TE.bind('superimposedElements', ({ }) => () => useSuperimposedElements({ mountPoint: superimposedElemDiv, includeElems: [ElementTypes.Svg] }).then(E.right)),
      TE.bind('infoPane', ({ }) => () => useInfoPane({ mountPoint: infoPaneDiv }).then(E.right)),
      TE.bind('labelDisplay', ({ superimposedElements }) => () => useLabelDisplay({ superimposedElements }).then(E.right)),
      TE.map(({ infoPane, superimposedElements, labelDisplay }) => {

        superimposedElements.setDimensions(800, 1000);
        const { showLabel, clearAll } = labelDisplay;

        const {
          putString,
          putStringLn,
          clearScreen,
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
      })
    );

    run();

    return {
      infoPaneDiv,
      superimposedElemDiv,
      showBasicShapes,
      showCompoundShapes,
    };
  }

});

function drawBasicShapes(showLabel: (l: Label) => void) {
  const examples: any[] = [
    { 'range': [{ 'unit': 'shape', 'at': [[8684, 6472], [9255, 4024]] }], 'name': 'HorizonLine' },
    { 'range': [{ 'unit': 'shape', 'at': [3684, 6472, 4255, 4024] }], 'name': 'HorizonRect' },
  ];

  _.each(examples, (ex) => {
    const l: Label | null = decodeLabel(ex);
    showLabel(l);
  });

}



function drawCompoundShapes(showLabel: (l: Label) => void) {
  const examples = [{
    "children": [{
      "children": [{
        "props": {
          "class": ["=eager"]
        },
        "range": [{ "unit": "shape", "at": [29748, 75954, 381, 545] }],
        "name": "FocalRect"
      }, {
        "range": [{ "unit": "shape", "at": [29748, 75954, 381, 2937] }],
        "name": "HorizonRect"
      }, {
        "children": [{
          "range": [{ "unit": "shape", "at": [29748, 76500, 381, 2391] }],
          "name": "Query/Cell:Bottom"
        }],
        "range": [],
        "name": "SearchArea"
      }],
      "range": [],
      "name": "Octothorpe"
    }, {
      "children": [],
      "range": [],
      "name": "Found"
    }],
    "props": {
      "class": [">lazy"],
      "outline": ["FindMonoFontBlocks", "ConnectComponents", "WithAdjacentSkyline/Down"]
    },
    "range": [],
    "name": "OctSearch"
  }, {
    "children": [{
      "props": { "class": ["=eager"] },
      "range": [{ "unit": "shape", "at": [7220, 29427, 46572, 500] }],
      "name": "FocalRect"
    }, {
      "range": [{ "unit": "shape", "at": [7235, 31587, 46555, 500] }],
      "name": "HitRect"
    }, {
      "range": [{ "unit": "shape", "at": [7235, 29927, 46555, 1660] }],
      "name": "OcclusionQuery"
    }, {
      "range": [],
      "name": "Occlusions"
    }, {
      "range": [{ "unit": "shape", "at": [7235, 31587, 46555, 500] }],
      "name": "FinalHit"
    }],
    "props": {
      "class": [">lazy"],
    },
    "range": [],
    "name": "FacingDownFind( BaselineMidriseBand )"
  }];


  _.each(examples, (ex) => {
    const l: Label | null = decodeLabel(ex);
    showLabel(l);
  });

}
