import _ from 'lodash';

import * as d3 from 'd3-selection';
import { Label } from '~/lib/transcript/labels';
import { ShapeSvg, shapeToSvg } from '~/lib/transcript/shapes';
import { deriveLabelId } from './d3-extras';

function initSVGDimensions(r: any) {
  const shape = r.node().nodeName.toLowerCase();

  switch (shape) {
    case 'rect':
      return r.attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y)
        .attr('width', (d: any) => d.width)
        .attr('height', (d: any) => d.height)
        .attr('id', (d: any) => d.id);

    case 'circle':
      return r.attr('cx', (d: any) => d.cx)
        .attr('cy', (d: any) => d.cy)
        .attr('r', (d: any) => d.r)
        .attr('id', (d: any) => d.id);

    case 'line':
      return r.attr('x1', (d: any) => d.x1)
        .attr('y1', (d: any) => d.y1)
        .attr('x2', (d: any) => d.x2)
        .attr('y2', (d: any) => d.y2)
        .attr('id', (d: any) => d.id)
        .attr('marker-start', () => 'url(#arrow)')
        .attr('marker-end', () => 'url(#arrow)')
      ;
    case 'path':
      return r.attr('d', (d: any) => d.d)
        .attr('id', (d: any) => d.id);
  }

  return r;
}

function setSVGColors(r: any) {
  return r
    // .attr('opacity', (d: any) => d.classes.some((cls: string) => cls === 'eager') ? 0.3 : 0.2)
    .attr('fill-opacity', (d: any) => (d.classes.includes('eager') ? 0.3 : 0.2))
    .attr('stroke-opacity', (d: any) => (d.classes.includes('eager') ? 0.3 : 0.2))
    .attr('stroke-width', 1)
    // .attr('fill', (d: any) => d.classes.some((cls: string) => cls === 'eager') ? 'blue' : 'yellow')
    .attr('fill', () => 'url(#grad1)')
    .attr('stroke', (d: any) => (d.classes.includes('eager') ? 'blue' : 'red'))
  ;
}

function setSVGClasses(r: any) {
  return r.classed('shape', true);
}

export function labelToSVGs(label: Label, parentClasses: string[], forceEval: boolean): ShapeSvg[] {
  const classStrings = label?.props?.class || [];

  const isLazy = _.some(classStrings, s => s === '>lazy');

  if (isLazy && !forceEval) {
    return [labelToTriggerSVG(label, label)];
  }

  const localClasses = _.filter(classStrings, c => c.startsWith('='))
    .map(c => c.slice(1));

  const propogatedClasses = _.filter(classStrings, c => c.startsWith('>'))
    .map(c => c.slice(1));

  propogatedClasses.push(label.name);

  const childShapes: ShapeSvg[] = label.children === undefined ? []
    : _.flatMap(label.children, c => labelToSVGs(c, propogatedClasses, forceEval));

  const labelId = deriveLabelId(label);

  const localShapes = _.flatMap(label.range, range => {
    if (range.unit === 'shape') {
      const svg = shapeToSvg(range.at);
      svg.data.rootLabel = label;
      svg.classes = _.concat(localClasses, parentClasses, propogatedClasses);
      svg.id = labelId;
      return [svg];
    }
    return [];
  });

  const allShapes = _.concat(localShapes, childShapes);

  return allShapes;
}

function labelToTriggerSVG(label: Label, rootLabel: Label): ShapeSvg {
  const classStrings = label?.props?.class || [];
  const isTrigger = _.some(classStrings, s => s === '=eager');
  // console.log('labelToTriggerSVG', label);

  if (isTrigger) {
    const localClasses = _.filter(classStrings, c => c.startsWith('='))
      .map(c => c.slice(1));

    // console.log('  isTrigger: localClasses', localClasses);

    const localShapes = _.flatMap(label.range, range => {
      if (range.unit === 'shape') {
        const svg = shapeToSvg(range.at);
        svg.data.rootLabel = rootLabel;
        svg.classes = localClasses;
        const labelId = deriveLabelId(label);
        svg.id = labelId;
        return [svg];
      }
      return [];
    });

    // console.log('  isTrigger: localShapes', localShapes);

    return localShapes[0];
  }

  const children = label.children || [];
  const childShape: ShapeSvg = _.find(
    _.flatMap(children, c => labelToTriggerSVG(c, rootLabel)),
    (c) => c !== undefined,
  );

  // console.log('  notTrigger: childShapes', childShapes);

  return childShape;
}

const OctoAttrs = {
  '?': ['black', 0.2, 'magenta ', 0.2],
  FocalRect: ['blue', 0.2, 'lightblue', 0.1],
  HorizonRect: ['black', 0.1, 'gray', 0.1],
  SearchArea: ['black', 0.1, 'yellow', 0.1],
  Found: ['black', 0.5, 'green', 0.2],
  FinalHit: ['black', 0.5, 'green', 0.2],
};

export function updateSvgElement(svgElement: SVGElement, svgShapes: ShapeSvg[]) {
  const dataSelection: d3.Selection<d3.BaseType, ShapeSvg, SVGElement, unknown> = d3.select(svgElement)
    .selectAll('.shape')
    .data(svgShapes, (sh: any) => sh.id);

  dataSelection.enter()
    .each(function (shape: any) {
      const self = d3.select(this);
      return self.append(shape.type)
        .call(initSVGDimensions)
        .call(setSVGColors)
        .call(setSVGClasses)
        .each(function () {
          const shape = d3.select(this);
          const shdata = shape.datum();
          const classes = shdata.classes || [];
          _.each(classes, cls => {
            const classDefs = OctoAttrs[cls] || OctoAttrs['?'];
            const [stroke, sop, fill, fop] = classDefs;
            shape
              .attr('stroke', () => stroke)
              .attr('stroke-opacity', () => sop)
              // .attr('fill', () => 'url(#grad1)')
              .attr('fill', () => fill)
              .attr('fill-opacity', () => fop)
            ;
          });
          shape.classed(classes.join(' '), true);
        });
    });

  // dataSelection.exit().remove();
}

export function resetShapesFillStroke(svgElement: SVGElement) {
  d3.select(svgElement)
    .selectAll('.shape')
    .each(function () {
      const shape = d3.select(this);
      const shdata = shape.datum();
      const classes = shdata.classes || [];
      _.each(classes, cls => {
        const classDefs = OctoAttrs[cls];
        if (_.isArray(classDefs)) {
          const [stroke, sop, fill, fop] = OctoAttrs[cls];
          shape
            .attr('stroke', () => stroke)
            .attr('stroke-opacity', () => sop)
            .attr('fill', () => fill)
            .attr('fill-opacity', () => fop)
          ;
        }
      });
    });
}
export function removeShapes(svgElement: SVGElement) {
  d3.select(svgElement)
    .selectAll('.shape')
    .remove();
}

export function highlightShapesFillStroke(svgElement: SVGElement, shapeId: string) {
  dimShapesFillStroke(svgElement);
  d3.select(svgElement)
    .select(`#${shapeId}`)
    .each(function () {
      d3.select(this)
        .attr('stroke', () => 'black')
        .attr('stroke-opacity', () => 1)
        .attr('fill', () => 'blue')
        .attr('fill-opacity', () => '0.3')
      ;
    });
}
export function dimShapesFillStroke(svgElement: SVGElement) {
  d3.select(svgElement)
    .selectAll('.shape')
    .attr('stroke', () => 'blue')
    .attr('stroke-opacity', () => 0.2)
    .attr('fill', () => '')
    .attr('fill-opacity', () => 0);
}

export function toggleShapeClass(svgElement: SVGElement, cls: string, shapeId: string, activate: boolean) {
  d3.select(svgElement).select(`#${shapeId}`).classed(cls, activate);
}
