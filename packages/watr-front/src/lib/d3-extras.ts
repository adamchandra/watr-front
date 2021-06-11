/**
 * Various helper functions for working with d3.js
 */

import _ from 'lodash';

import {
  Selection,
  BaseType,
  select
} from 'd3-selection';

import 'd3-transition';

import { BBox } from '~/lib/coord-sys';
import { SelectionOrTransition } from 'd3-transition';
import { formatShape, Shape } from './transcript/shapes';
import { Label } from './transcript/labels';

export function initRect<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  sel: Selection<GElement, Datum, PElement, PDatum>,
  fbbox: (d: any) => BBox
) {
  sel.attr('x', d => fbbox(d).x)
    .attr('y', d => fbbox(d).y)
    .attr('width', d => fbbox(d).width)
    .attr('height', d => fbbox(d).height);
}

export function initStroke<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  sel: Selection<GElement, Datum, PElement, PDatum>,
  stroke: string, strokeWidth: number, strokeOpacity: number
) {
  sel.attr('stroke', stroke)
    .attr('stroke-width', strokeWidth)
    .attr('stroke-opacity', strokeOpacity);
}

export function initFill<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  sel: SelectionOrTransition<GElement, Datum, PElement, PDatum>,
  fill: string, fillOpacity: number
) {
  sel.attr('fill', fill);
  sel.attr('fill-opacity', fillOpacity);
}


export function deriveLabelId(label: Label): string {
  const rangeShape = _.flatMap(label.range, range => {
    if (range.unit === 'shape') {
      return [deriveShapeId(range.at)];
    }
    return [];
  });
  const rangeStr = rangeShape.join(',')
  return `${label.name}:${rangeStr}`;
}

export function deriveShapeId(shape: Shape): string {
  return formatShape(shape);
}

export function d3id<GElement extends BaseType>(
  selector: string
): Selection<GElement, any, HTMLElement, any> {
  return select<GElement, any>(`#${selector}`);
}
