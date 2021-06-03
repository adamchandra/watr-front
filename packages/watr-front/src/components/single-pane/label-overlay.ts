import _ from 'lodash';

import {
  Ref,
  watch,
} from '@vue/composition-api'

import { StateArgs } from '~/components/basics/component-basics'
import * as d3 from 'd3-selection';
import { TranscriptIndex, TranscriptIndexable } from '~/lib/transcript/transcript-index';
import { Label } from '~/lib/transcript/labels';
import { minMaxToRect, ShapeSvg, shapeToSvg } from '~/lib/transcript/shapes';
import { PdfPageViewer } from './page-viewer';
import { useFlashlight } from '../basics/rtree-search';

type Args = StateArgs & {
  transcriptIndex: TranscriptIndex;
  pdfPageViewer: PdfPageViewer;
  pageNumber: number;
  pageLabelRef: Ref<Label[]>;
};

export interface LabelOverlay {
  //
}

export function labelToSVGs(label: Label, parentClasses: string[], forceEval: boolean): ShapeSvg[] {

  const classStrings = label?.props?.['class'] || [];

  const isLazy = _.some(classStrings, s => s === '>lazy');

  if (isLazy && !forceEval) {
    return [labelToSVGLazy(label, label)];
  }

  const localClasses = _.filter(classStrings, c => c.startsWith('='))
    .map(c => c.substring(1))

  const propogatedClasses = _.filter(classStrings, c => c.startsWith('>'))
    .map(c => c.substring(1))

  const childShapes: ShapeSvg[] = label.children === undefined ? [] :
    _.flatMap(label.children, c => labelToSVGs(c, propogatedClasses, forceEval));

  const localShapes = _.flatMap(label.range, range => {
    if (range.unit === 'shape') {
      const svg = shapeToSvg(range.at);
      svg.classes = _.concat(localClasses, parentClasses, propogatedClasses);
      addShapeId(svg);
      return [svg];
    }
    return [];
  });

  return _.concat(localShapes, childShapes);
}

export function labelToSVGLazy(label: Label, rootLabel: Label): ShapeSvg {
  const classStrings = label?.props?.['class'] || [];
  const isTrigger = _.some(classStrings, s => s === '=eager');

  if (isTrigger) {
    const localClasses = _.filter(classStrings, c => c.startsWith('='))
      .map(c => c.substring(1))

    const localShapes = _.flatMap(label.range, range => {
      if (range.unit === 'shape') {
        const svg = shapeToSvg(range.at);
        svg.classes = localClasses;
        addShapeId(svg);
        const data = svg.data || {};
        data['rootLabel'] = rootLabel;
        return [svg];
      }
      return [];
    });
    return localShapes[0];
  }

  const children = label.children || [];
  const childShapes: ShapeSvg[] =
    _.flatMap(children, c => labelToSVGLazy(c, rootLabel));

  return childShapes[0];
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
  pageNumber
}: Args): Promise<LabelOverlay> {
  const { superimposedElements, eventlibCore } = pdfPageViewer;

  const indexKey = `page#${pageNumber}/labels`;

  transcriptIndex.newKeyedIndex(indexKey);

  const flashlightRadius = 2;
  const flashlight = useFlashlight<ShapeSvg>({ indexKey, transcriptIndex, eventlibCore, flashlightRadius });

  watch(pageLabelRef, (displayableLabels: Label[]) => {
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

    const showAll = true;
    if (showAll) {
      _.each(shapes, item => {
        const itemSvg = item.cargo;
        const rootLabel: Label = itemSvg.data['rootLabel'];
        const items = [itemSvg];

        if (rootLabel) {
          const svgs = labelToSVGs(rootLabel, [], true);
          items.push(...svgs);
        }

        const dataSelection = d3.select(svgOverlay)
          .selectAll('.shape')
          .data(items, (sh: any) => sh.id);

        dataSelection.exit().remove();

        dataSelection.enter()
          .each(function(shape: any) {
            const self = d3.select(this);
            return self.append(shape.type)
              .call(initShapeAttrs);
          });
      })
    }


    console.log(`loading ${shapes.length} shapes: 0=`, shapes[0]);

    watch(flashlight.litItemsRef, (litItems) => {
      if (litItems.length === 0) return;
      console.log('litItems', litItems);

      const item = litItems[0];
      const itemSvg = item.cargo;
      const rootLabel: Label = itemSvg.data['rootLabel'];
      const items = [itemSvg];

      if (rootLabel) {
        const svgs = labelToSVGs(rootLabel, [], true);
        items.push(...svgs);
      }

      const dataSelection = d3.select(svgOverlay)
        .selectAll('.shape')
        .data(items, (sh: any) => sh.id);

      dataSelection.exit().remove();

      dataSelection.enter()
        .each(function(shape: any) {
          const self = d3.select(this);
          return self.append(shape.type)
            .call(initShapeAttrs);
        });
    });


  })


  return {};
}

function getCls(data: any) {
  let cls = 'shape';
  if (data.class !== undefined) {
    cls = `${cls} ${data.class}`;
  }
  if (data.hover) {
    cls = `${cls} hover`;
  }

  return cls;
}

function initShapeAttrs(r: any) {
  const shape = r.node().nodeName.toLowerCase();

  switch (shape) {
    case 'rect':
      return r.attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y)
        .attr('width', (d: any) => d.width)
        .attr('height', (d: any) => d.height)
        .attr('class', getCls)
        // .attr("label", getCls)
        .attr('id', (d: any) => d.id)
        .attr('opacity', 0.3)
        .attr('fill-opacity', 0.4)
        .attr('stroke-opacity', 0.9)
        .attr('stroke-width', 2)
        .attr('fill', 'black')
        // .attr("fill",  setDefaultFillColor)
        .attr('stroke', 'green')
        // .call(addTooltip)
        ;

    case 'circle':
      return r.attr('cx', (d: any) => d.cx)
        .attr('cy', (d: any) => d.cy)
        .attr('r', (d: any) => d.r)
        .attr('class', getCls)
        // .attr("label", getCls)
        .attr('id', (d: any) => d.id)
        .attr('fill-opacity', 0.2)
        .attr('stroke-width', 1)
        .attr('fill', 'black')
        .attr('stroke', 'green')
        // .call(addTooltip)
        ;

    case 'line':
      return r.attr('x1', (d: any) => d.x1)
        .attr('y1', (d: any) => d.y1)
        .attr('x2', (d: any) => d.x2)
        .attr('y2', (d: any) => d.y2)
        .attr('class', getCls)
        // .attr("label", getCls)
        .attr('id', (d: any) => d.id)
        .attr('stroke-width', 2)
        .attr('fill', 'black')
        .attr('stroke', 'green')
        ;
    case 'path':
      return r.attr('d', (d: any) => d.d)
        .attr('class', getCls)
        // .attr("label", getCls)
        .attr('id', (d: any) => d.id)
        .attr('stroke-width', 1)
        .attr('fill', 'blue')
        .attr('stroke', 'black')
        .attr('fill-opacity', 0.2)
        .attr('stroke-opacity', 0.3)
        ;
  }

  return r;
}

import { newIdGenerator } from '~/lib/misc-utils';
const idgen = newIdGenerator(1);

function addShapeId(shape: ShapeSvg): void {
  if (shape.id === undefined) {
    shape.id = idgen();
  }
}
