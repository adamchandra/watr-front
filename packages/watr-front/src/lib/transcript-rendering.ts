import _ from 'lodash';

import { Label } from '~/lib/transcript/labels';
import { ShapeSvg, shapeToSvg } from '~/lib/transcript/shapes';
import * as d3 from 'd3-selection';
import { newIdGenerator } from '~/lib/misc-utils';


export function initSVGDimensions(r: any) {
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
        .attr('id', (d: any) => d.id);
    case 'path':
      return r.attr('d', (d: any) => d.d)
        .attr('id', (d: any) => d.id);
  }

  return r;
}


// .join('rect')
// .classed('chars', true)
function setSVGColors(r: any) {
  return r
    // .attr('opacity', (d: any) => d.classes.some((cls: string) => cls === 'eager') ? 0.3 : 0.2)
    .attr('fill-opacity', (d: any) => d.classes.some((cls: string) => cls === 'eager') ? 0.3 : 0.2)
    .attr('stroke-opacity', (d: any) => d.classes.some((cls: string) => cls === 'eager') ? 0.3 : 0.2)
    .attr('stroke-width', 1)
    .attr('fill', (d: any) => d.classes.some((cls: string) => cls === 'eager') ? 'blue' : 'yellow')
    .attr('stroke', (d: any) => d.classes.some((cls: string) => cls === 'eager') ? 'blue' : 'red')
    ;

}

function setSVGClasses(r: any) {
  return r
    .classed('shape', true)
    ;
}

export function labelRangeToSVG(label: Label): ShapeSvg[] {
  // const gelem: SVGGElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  return _.flatMap(label.range, range => {
    if (range.unit === 'shape') {
      const svg = shapeToSvg(range.at);
      addShapeId(svg);
      return [svg];
    }
    return [];
  });
}

export function labelToSVGs(label: Label, parentClasses: string[], forceEval: boolean): ShapeSvg[] {

  const classStrings = label?.props?.['class'] || [];

  const isLazy = _.some(classStrings, s => s === '>lazy');

  if (isLazy && !forceEval) {
    return [labelToTriggerSVG(label, label)];
  }

  const localClasses = _.filter(classStrings, c => c.startsWith('='))
    .map(c => c.substring(1))


  const propogatedClasses = _.filter(classStrings, c => c.startsWith('>'))
    .map(c => c.substring(1))

  propogatedClasses.push(label.name);


  const childShapes: ShapeSvg[] = label.children === undefined ? [] :
    _.flatMap(label.children, c => labelToSVGs(c, propogatedClasses, forceEval));

  const localShapes = _.flatMap(label.range, range => {
    if (range.unit === 'shape') {
      const svg = shapeToSvg(range.at);
      svg.data['rootLabel'] = label;
      svg.classes = _.concat(localClasses, parentClasses, propogatedClasses);
      addShapeId(svg);
      return [svg];
    }
    return [];
  });

  return _.concat(localShapes, childShapes);
}

export function labelToTriggerSVG(label: Label, rootLabel: Label): ShapeSvg {
  const classStrings = label?.props?.['class'] || [];
  const isTrigger = _.some(classStrings, s => s === '=eager');

  if (isTrigger) {
    const localClasses = _.filter(classStrings, c => c.startsWith('='))
      .map(c => c.substring(1))

    const localShapes = _.flatMap(label.range, range => {
      if (range.unit === 'shape') {
        const svg = shapeToSvg(range.at);
        svg.data['rootLabel'] = rootLabel;
        svg.classes = localClasses;
        addShapeId(svg);
        return [svg];
      }
      return [];
    });
    return localShapes[0];
  }

  const children = label.children || [];
  const childShapes: ShapeSvg[] =
    _.flatMap(children, c => labelToTriggerSVG(c, rootLabel));

  return childShapes[0];
}

const idgen = newIdGenerator(1);

function addShapeId(shape: ShapeSvg): void {
  if (shape.id === undefined) {
    shape.id = idgen();
  }
}

// type SVGRootSelection = d3.Selection<d3.BaseType, ShapeSvg, SVGElement, unknown>;
//
const OctoAttrs = {
  FocalRect: ['blue', 0.2, 'lightblue', 0.2],
  HorizonRect: ['black', 0.1, 'gray', 0.2],
  SearchArea: ['black', 0.1, 'yellow', 0.2],
  Found: ['black', 0.50, 'green', 0.50],
}

export function updateSvgElement(svgElement: SVGElement, svgShapes: ShapeSvg[]) {
  const dataSelection: d3.Selection<d3.BaseType, ShapeSvg, SVGElement, unknown> = d3.select(svgElement)
    .selectAll('.shape')
    .data(svgShapes, (sh: any) => sh.id);


  dataSelection.enter()
    .each(function(shape: any) {
      const self = d3.select(this);
      return self.append(shape.type)
        .call(initSVGDimensions)
        .call(setSVGColors)
        .call(setSVGClasses)
        .each(function() {
          const shape = d3.select(this);
          const shdata = shape.datum();
          const classes = shdata['classes'] || [];
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
          shape.classed(classes.join(' '), true);
        });
    });

  dataSelection.exit().remove();

}

