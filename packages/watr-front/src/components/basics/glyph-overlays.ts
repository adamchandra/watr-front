/**
 * Provides rtree-based hovering and search over given input shapes
 */

import _ from 'lodash';

import {
  watch,
} from '@nuxtjs/composition-api';

import * as d3 from 'd3-selection';

import { EventlibCore } from '~/components/basics/eventlib-core';
import { SuperimposedElements } from '~/components/basics/superimposed-elements';

import * as d3x from '~/lib/d3-extras';
import { TranscriptIndex } from '~/lib/transcript/transcript-index';
import { useFlashlight } from './rtree-search';

const { initStroke, initFill, initRect } = d3x;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GlyphOverlays {
}

type Args = {
  eventlibCore: EventlibCore;
  superimposedElements: SuperimposedElements;
  transcriptIndex: TranscriptIndex;
  pageNumber: number;
};

export function useGlyphOverlays({
  eventlibCore,
  superimposedElements,
  transcriptIndex,
  pageNumber,
}: Args): GlyphOverlays {
  // TODO: setHoveredText (for highlighting sync-highlighting text on pdf-text widget)
  // TODO: setClickedText (for synching pdf page text w/ image)

  const flashlightRadius = 2;
  const indexKey = `page#${pageNumber}/glyphs`;
  const flashlight = useFlashlight({
    transcriptIndex,
    indexKey,
    eventlibCore,
    flashlightRadius,
  });

  const svgLayer = superimposedElements.overlayElements.svg!;
  const svgSelect = d3.select(svgLayer);

  watch(flashlight.eventTargetRecs.mousemove, (mousemove) => {
    const items = _.sortBy(
      mousemove, // _.filter(litItems, (hit) => hit.glyph !== undefined),
      (hit) => [hit.minY, hit.minX],
    );

    svgSelect
      .selectAll('.litItems')
      .data(items, (d: any) => `${d.id}`)
      .join('rect')
      .classed('litItems', true)
      .call(initRect, (i: any) => i.primaryRect)
      .call(initStroke, 'blue', 1, 0.8)
      .call(initFill, 'yellow', 0.8);
  });

  // const setGlyphOverlays: SetGlyphOverlays = (glyphs, geom) => {
  //   const pageGeometry = geom;
  //   const { width, height } = pageGeometry;

  //   superimposedElements.setDimensions(width, height);
  //   // console.log('mapping glyphs')
  //   // const glyphOverlays: GlyphOverlay[] = _.map(glyphs, (glyph) => {
  //   //   const { x, y, width, height } = glyph.rect;
  //   //   const charBounds = mk.fromLtwh(x, y, width, height);
  //   //   const { minX, minY, maxX, maxY } = charBounds;
  //   //   const glyphOverlay: GlyphOverlay = {
  //   //     glyph,
  //   //     id: glyph.id,
  //   //     minX, minY, maxX, maxY
  //   //   };
  //   //   return glyphOverlay;
  //   // });

  //   // console.log(' ...mapped glyphs')

  //   // console.log('loading rtree')
  //   // rtreeIndex.loadData(glyphOverlays);
  //   // console.log(' ...rtree loaded')
  //   // const flashlight = rtreeIndex.flashlight(eventlibCore);

  // }

  return {
    // setGlyphOverlays,
    // rtreeIndex
  };
}
