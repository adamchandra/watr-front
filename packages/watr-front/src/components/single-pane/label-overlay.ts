import _ from 'lodash';

import {
  Ref,
  watch,
} from '@vue/composition-api'

import { StateArgs } from '~/components/basics/component-basics'
import * as d3 from 'd3-selection';
import { TranscriptIndex } from '~/lib/transcript/transcript-index';
import { Label } from '~/lib/transcript/labels';
import { ShapeSvg, shapeToSvg } from '~/lib/transcript/shapes';
import { PdfPageViewer } from './page-viewer';

type Args = StateArgs & {
  transcriptIndex: TranscriptIndex;
  pdfPageViewer: PdfPageViewer;
  pageNumber: number;
  pageLabelRef: Ref<Label[]>;
};

export interface LabelOverlay {
  //
}

export async function useLabelOverlay({
  // transcriptIndex,
  pdfPageViewer,
  // pageNumber,
  pageLabelRef,
}: Args): Promise<LabelOverlay> {
  const { superimposedElements } = pdfPageViewer;

  // const labelsToDisplay = [
  //   'BaselineMidriseBand'
  // ];

  // const displayableLabels = transcriptIndex.getLabels(labelsToDisplay, pageNumber);

  watch(pageLabelRef, (displayableLabels: Label[]) => {
    const svg = superimposedElements.overlayElements.svg!;

    const shapes = _.flatMap(displayableLabels, (label: Label) => {
      return _.flatMap(label.range, range => {
        if (range.unit === 'shape') {
          const svg = shapeToSvg(range.at);
          addShapeId(svg);
          return [svg];
        }
        return [];
      });
    });

    const dataSelection = d3.select(svg)
      .selectAll('.shape')
      .data(shapes, (sh: any) => sh.id);

    dataSelection.exit().remove();

    dataSelection.enter()
      .each(function(shape: any) {
        const self = d3.select(this);
        return self.append(shape.type)
          .call(initShapeAttrs);
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

function addShapeId(shape: ShapeSvg): void {
  if (shape.id === undefined) {
    let id = '';
    switch (shape.type) {
      case 'rect':
        id = `r_${shape.x}_${shape.y}_${shape.width}_${shape.height}`;
        break;
      case 'circle':
        id = `c_${shape.cx}_${shape.cy}_${shape.r}`;
        break;
      case 'line':
        id = `l_${shape.x1}_${shape.y1}_${shape.x2}_${shape.y2}`;
        break;
      case 'path':
        id = `p_${shape.d}`;
        break;
      default:
        throw new Error(`getId(shape=${shape}) could not construct id`);
    }
    shape.id = id;
  }
}
