import _ from 'lodash';

import {
  // Ref,
  watch,
} from 'vue';

import * as d3 from 'd3-selection';
import { TranscriptIndex, TranscriptIndexable } from '~/lib/transcript/transcript-index';
import { Label } from '~/lib/transcript/labels';
import { PdfPageViewer } from './page-viewer';
import { useFlashlight } from '../basics/rtree-search';

import {
  dimShapesFillStroke, highlightShapesFillStroke, labelToSVGs, removeShapes, addSvgElements,
} from '~/lib/transcript/label-to-svg';

import { InfoPane } from './info-pane/info-pane';
import { minMaxToRect } from '~/lib/shape-compat';
import { ShapeSvg } from '~/lib/transcript/shape-to-svg';
import { useLabelDisplay } from './label-display';
import { Ref } from 'vue';

type Args = {
  transcriptIndex: TranscriptIndex;
  pdfPageViewer: PdfPageViewer;
  pageNumber: number;
  infoPane?: InfoPane;
  pageLabelRef: Ref<Label[]>;
  showAllLabels: Ref<boolean>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LabelOverlay {
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
  infoPane,
  showAllLabels,
}: Args): Promise<LabelOverlay> {
  const { superimposedElements, eventlibCore } = pdfPageViewer;

  const labelDisplay = await useLabelDisplay({ superimposedElements });

  const indexKey = `page#${pageNumber}/labels`;

  transcriptIndex.newKeyedIndex(indexKey);

  const flashlightRadius = 2;
  const flashlight = useFlashlight({
    indexKey, transcriptIndex, eventlibCore, flashlightRadius,
  });

  let freezeFlashlight = false;

  console.log('pageLabelRef', pageLabelRef);

  watch(pageLabelRef, (displayableLabels: Label[]) => {
    // const svgOverlay = superimposedElements.overlayElements.svg;

    if (displayableLabels.length === 0) {
      labelDisplay.clearAll();
      // removeShapes(svgOverlay);
      transcriptIndex.getKeyedIndex(indexKey).clear();
      return;
    }

    if (infoPane) {
      infoPane.putStringLn(`Loaded ${displayableLabels.length} labels on page ${pageNumber}`);
    }

    const shapes = _.flatMap(displayableLabels, (label: Label) => {
      const asSVGs = labelToSVGs(label);
      return _.map(asSVGs, svg => {
        const asIndexable: TranscriptIndexable<ShapeSvg> = {
          ...svg,
          cargo: svg,
          indexedRects: {},
          primaryKey: indexKey,
          primaryRect: minMaxToRect(svg),
        };
        return asIndexable;
      });
    });

    transcriptIndex.getKeyedIndex(indexKey).load(shapes);

    const showAll = showAllLabels.value;
    if (showAll) {
      const allSvgs = _.flatMap(shapes, shape => {
        const itemSvg = shape.cargo;
        const { rootLabel } = itemSvg.data;
        const items = [itemSvg];
        if (rootLabel) {
          const svgs = labelToSVGs(rootLabel);
          items.push(...svgs);
        }
        return items;
      });
      labelDisplay.showSVGShapes(allSvgs);
    }
  });
  const moveEvent = flashlight.eventTargetRecs.mousemove;

  watch(moveEvent, (mousemove) => {
    if (mousemove === undefined || mousemove.length === 0) return;
    if (freezeFlashlight) return;
    const svgOverlay = superimposedElements.overlayElements.svg!;
    const item = mousemove[0];
    const itemSvg = item.cargo;
    const { rootLabel } = itemSvg.data;
    const items = [itemSvg];

    if (rootLabel) {
      const svgs = labelToSVGs(rootLabel);
      items.push(...svgs);

      if (infoPane) {
        infoPane.showLabel(rootLabel, false);
      }
    }

    addSvgElements(svgOverlay, items);
  });

  if (infoPane) {
    watch(infoPane.reactiveTexts.actions, (actions) => {
      const svgOverlay = superimposedElements.overlayElements.svg!;
      freezeFlashlight = actions.includes('freeze');
      d3.select(svgOverlay).classed('inspecting', freezeFlashlight);
      if (freezeFlashlight) {
        dimShapesFillStroke(svgOverlay);
      } else {
        removeShapes(svgOverlay);
      }
    });
    watch(flashlight.eventTargetRecs.click, (click) => {
      if (click === undefined || click.length === 0) return;
      if (freezeFlashlight) return;

      const item = click[0];
      const { rootLabel } = item.cargo.data;
      if (rootLabel !== undefined) {
        infoPane.showLabel(rootLabel, true);
      }
    });

    watch(infoPane.reactiveTexts.mouseover, (hoveringId) => {
      const svgOverlay = superimposedElements.overlayElements.svg!;
      if (hoveringId === null) return;
      highlightShapesFillStroke(svgOverlay, hoveringId);
    });

    watch(infoPane.reactiveTexts.mouseout, (hoveringId) => {
      // if (hoveringId === null) return;
    });
  }

  return {};
}
