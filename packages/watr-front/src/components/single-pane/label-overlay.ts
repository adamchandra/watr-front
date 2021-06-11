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
import { labelToSVGs, updateSvgElement } from '~/lib/transcript-rendering';
import { InfoPane } from './info-pane';

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

  watch(pageLabelRef, (displayableLabels: Label[]) => {
    if (displayableLabels.length === 0) return;

    console.log('displayableLabels', displayableLabels);

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

    const svgOverlay = superimposedElements.overlayElements.svg!;

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

    console.log(`loading ${shapes.length} shapes: 0=`, shapes[0]);

    watch(flashlight.eventTargetRecs.mousemove, (mousemove) => {
      if (mousemove === undefined || mousemove.length == 0) return;

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

    if (infoPane !== undefined) {
      console.log('using labelInfoPane');
      watch(flashlight.eventTargetRecs.click, (click) => {
        console.log('labelInfoPane: click');
        if (click === undefined || click.length == 0) return;

        console.log('labelInfoPane: click = ', click);
        const item = click[0];
        const rootLabel: Label = item.cargo.data['rootLabel'];
        if (rootLabel !== undefined) {
          infoPane.showLabel(rootLabel);
        }
      });
    }

  });

  return {};
}

