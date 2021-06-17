import _ from 'lodash';

import {
  Ref,
  watch,
} from '@nuxtjs/composition-api'

import { TranscriptIndex, TranscriptIndexable } from '~/lib/transcript/transcript-index';
import { Label } from '~/lib/transcript/labels';
import { minMaxToRect, ShapeSvg } from '~/lib/transcript/shapes';
import { PdfPageViewer } from './page-viewer';
import { useFlashlight } from '../basics/rtree-search';

import { dimShapesFillStroke, highlightShapesFillStroke, labelToSVGs, removeShapes, updateSvgElement } from '~/lib/transcript-rendering';
import { InfoPane } from './info-pane';
import * as d3 from 'd3-selection';

type Args = {
  transcriptIndex: TranscriptIndex;
  pdfPageViewer: PdfPageViewer;
  pageNumber: number;
  infoPane?: InfoPane;
  pageLabelRef: Ref<Label[]>;
};

export interface LabelOverlay {
  //
}


// TODO:
//   - [ ] Toggle to make all shapes visible vs. only on hover
//   - [ ] better visuals for line/point
//   - [ ] put ids on shapes so that rtree works correctly
//   - [ ] adjustable flashlight radius
//   - [ ] shape display feedback panel (# of shapes currently displaying)
export async function useLabelOverlay({
  pdfPageViewer,
  pageLabelRef,
  transcriptIndex,
  pageNumber,
  infoPane
}: Args): Promise<LabelOverlay> {
  const { superimposedElements, eventlibCore } = pdfPageViewer;

  const indexKey = `page#${pageNumber}/labels`;

  transcriptIndex.newKeyedIndex(indexKey);

  const flashlightRadius = 2;
  const flashlight = useFlashlight({ indexKey, transcriptIndex, eventlibCore, flashlightRadius });
  let freezeFlashlight = false;


  let once = true;
  watch(pageLabelRef, (displayableLabels: Label[]) => {
    const svgOverlay = superimposedElements.overlayElements.svg!;

    if (once) {
      once = false

      d3.select(svgOverlay)
        .append('defs')
        .append('linearGradient')
        .attr('id', 'grad1')
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-opacity', '1.0')
        .attr('stop-color', 'blue')
        .append('stop')
        .attr('offset', '50%')
        .attr('stop-opacity', '0.5')
        .attr('stop-color', 'blue')
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-opacity', '0.1')
        .attr('stop-color', 'blue')
        ;
    }


    if (displayableLabels.length === 0) {
      removeShapes(svgOverlay);
      transcriptIndex.getKeyedIndex(indexKey).clear();
      return;
    };

    // console.log(`Loaded ${displayableLabels.length} labels on page ${pageNumber}`, displayableLabels[0]);
    infoPane.putStringLn(`Loaded ${displayableLabels.length} labels on page ${pageNumber}: [0]= ${displayableLabels[0]}`);

    const shapes = _.flatMap(displayableLabels, (label: Label) => {
      const asSVGs = labelToSVGs(label, [], false);
      return _.map(asSVGs, svg => {
        const asIndexable: TranscriptIndexable<ShapeSvg> = {
          ...svg,
          cargo: svg,
          indexedRects: {},
          primaryKey: indexKey,
          primaryRect: minMaxToRect(svg)
        };
        return asIndexable;
      });

    });

    transcriptIndex.getKeyedIndex(indexKey).load(shapes);


    const showAll = false;
    if (showAll) {
      const allSvgs = _.flatMap(shapes, shape => {
        const itemSvg = shape.cargo;
        const rootLabel: Label = itemSvg.data['rootLabel'];
        const items = [itemSvg];
        if (rootLabel) {
          const svgs = labelToSVGs(rootLabel, [], true);
          items.push(...svgs);
        }
        return items;
      });
      updateSvgElement(svgOverlay, allSvgs);
    }



  });
  watch(flashlight.eventTargetRecs.mousemove, (mousemove) => {
    if (mousemove === undefined || mousemove.length == 0) return;
    if (freezeFlashlight) return;
    const svgOverlay = superimposedElements.overlayElements.svg!;

    const item = mousemove[0];
    const itemSvg = item.cargo;
    const rootLabel: Label = itemSvg.data['rootLabel'];
    const items = [itemSvg];

    if (rootLabel) {
      const svgs = labelToSVGs(rootLabel, [], true);
      items.push(...svgs);
    }

    updateSvgElement(svgOverlay, items);
  });

  watch(infoPane.reactiveTexts.actions, (actions) => {
    const svgOverlay = superimposedElements.overlayElements.svg!;
    freezeFlashlight = actions.some(s => s === 'freeze');
    d3.select(svgOverlay).classed('inspecting', freezeFlashlight);
    if (freezeFlashlight) {
      dimShapesFillStroke(svgOverlay);
    } else {
      removeShapes(svgOverlay);
    }
  });
  if (infoPane !== undefined) {
    watch(flashlight.eventTargetRecs.click, (click) => {
      if (click === undefined || click.length == 0) return;
      if (freezeFlashlight) return;
      console.log('clicked!')

      const item = click[0];
      const rootLabel: Label = item.cargo.data['rootLabel'];
      if (rootLabel !== undefined) {
        infoPane.showLabel(rootLabel);
      }
    });

    watch(infoPane.reactiveTexts.mouseover, (hoveringId: string) => {
      const svgOverlay = superimposedElements.overlayElements.svg!;
      if (hoveringId === null) return;
      highlightShapesFillStroke(svgOverlay, hoveringId);
    });
    watch(infoPane.reactiveTexts.mouseout, (hoveringId: string) => {
      if (hoveringId === null) return;
    });
  }


  return {};
}

