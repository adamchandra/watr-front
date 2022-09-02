import _ from 'lodash';

import * as d3 from 'd3-selection';
import { Label } from '~/lib/transcript/labels';
import { deriveLabelId, ShapeSvg, shapeToSvg } from './shape-to-svg';

function getProp(label: Label, key: string): string[] {
  const { props } = label;
  if (props === undefined) {
    return [];
  }
  const values = props[key];
  if (values === undefined) {
    return [];
  }
  return values;
}

export function labelToSVGs(
  label: Label
): ShapeSvg[] {
  return _labelToSVGs(label, [], false);
}

function _labelToSVGs(
  label: Label,
  displayables: string[],
  forceEval: boolean
): ShapeSvg[] {
  const displayProp = getProp(label, 'display');
  const aggregateDisplayables = _.concat(displayProp, displayables);
  const children = label.children || [];
  const childSVGs: ShapeSvg[] = _.flatMap(children, c => _labelToSVGs(c, aggregateDisplayables, forceEval));

  const roleProp = getProp(label, 'role');

  const displayableRoles = _.intersection(roleProp, aggregateDisplayables);

  const isDisplayable = displayableRoles.length > 0;
  const displayClass = isDisplayable ? 'display' : 'nodisplay';

  const labelId = deriveLabelId(label);

  const localSVGs = _.flatMap(label.range, range => {
    if (range.unit === 'shape') {
      const svg = shapeToSvg(range.at);
      svg.data.rootLabel = label;
      svg.classes.push(displayClass);
      svg.id = labelId;
      return [svg];
    }
    return [];
  });

  return _.concat(localSVGs, childSVGs);
}

// function initEachDimensions(r: d3.Selection<SVGElement, ShapeSvg, null, unknown>): void {
function initEachDimensions(r: d3.Selection<SVGElement, any, null, unknown>): void {
  r.classed('shape', true);
  const d = r.datum();
  switch (d.tag) {
    case 'rect':
      r.attr('x', () => d.x)
        .attr('y', () => d.y)
        .attr('width', () => d.width)
        .attr('height', () => d.height)
        .attr('id', () => d.id);
      break;

    case 'circle':
      r.attr('cx', () => d.cx)
        .attr('cy', () => d.cy)
        .attr('r', () => d.r)
        .attr('id', () => d.id);
      break;

    case 'line':
      r.attr('x1', () => d.x1)
        .attr('y1', () => d.y1)
        .attr('x2', () => d.x2)
        .attr('y2', () => d.y2)
        .attr('id', () => d.id);
      break;

    case 'path':
      r.attr('d', () => d.d)
        .attr('id', () => d.id);
      break;
  }
}

// function setSVGColors(r: d3.Selection<SVGElement, ShapeSvg, null, unknown>): void {
function setSVGColors(r: d3.Selection<SVGElement, any, null, unknown>): void {
  r.attr('fill-opacity', () => 0.8)
    .attr('stroke-opacity', () => 1)
    .attr('stroke-width', 1)
    .attr('fill', () => 'url(#grad1)')
    .attr('stroke', () => 'blue');
}

export function addSvgElements(svgElement: SVGElement, svgShapes: ShapeSvg[]): void {
  const svgSelection = d3.select<SVGElement, ShapeSvg>(svgElement);
  const dataSelection = svgSelection
    .selectAll<SVGElement, ShapeSvg>('.shape')
    .data(svgShapes, (sh: ShapeSvg) => sh.id);

  dataSelection.enter()
    .each(function(shape: ShapeSvg) {
      const self = d3.select(this);

      return self.append<SVGElement>(shape.tag)
        .call(initEachDimensions)
        .call(setSVGColors)
        .call((a) => a);
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
    .each(function() {
      d3.select(this)
        .attr('stroke', () => 'black')
        .attr('stroke-opacity', () => 1)
        .attr('fill', () => 'blue')
        .attr('fill-opacity', () => '0.3');
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

export function initSVGDefs(svgElement: SVGElement) {
  const defs = d3.select(svgElement)
    .append('defs');

  defs
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
    .attr('stop-color', 'blue');

  defs
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', '0')
    .attr('refY', '5')
    .attr('markerWidth', '6')
    .attr('markerHeight', '6')
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 5 z');

  defs
    .append('marker')
    .attr('id', 'arrow-rear')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', '0')
    .attr('refY', '5')
    .attr('markerWidth', '6')
    .attr('markerHeight', '6')
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 5 z');
}
