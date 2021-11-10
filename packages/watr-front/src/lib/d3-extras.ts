/**
 * Various helper functions for working with d3.js
 */

import _ from 'lodash';

import {
  Selection,
  BaseType,
  select,
} from 'd3-selection';

import { SelectionOrTransition } from 'd3-transition';

import { formatShape, Shape } from './transcript/shapes';
import { Label } from './transcript/labels';
import { BBox } from './transcript/shape-conversions';

export function initRect<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  sel: SelectionOrTransition<GElement, Datum, PElement, PDatum>,
  fbbox: (d: any) => BBox,
) {
  sel.attr('x', d => fbbox(d).x);
  sel.attr('y', d => fbbox(d).y);
  sel.attr('width', d => fbbox(d).width);
  sel.attr('height', d => fbbox(d).height);
}

export function initStroke<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  sel: SelectionOrTransition<GElement, Datum, PElement, PDatum>,
  stroke: string, strokeWidth: number, strokeOpacity: number,
) {
  sel.attr('stroke', stroke);
  sel.attr('stroke-width', strokeWidth);
  sel.attr('stroke-opacity', strokeOpacity);
}

export function initFill<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
  sel: SelectionOrTransition<GElement, Datum, PElement, PDatum>,
  fill: string, fillOpacity: number,
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
  const rangeStr = rangeShape.join('_');
  const name = label.name.replace(/\W/g, '_');
  return `${name}${rangeStr}`;
}

export function deriveShapeId(shape: Shape): string {
  return formatShape(shape)
    .replace(/\W/g, '_')
  ;
}

export function d3id<GElement extends BaseType>(
  selector: string,
): Selection<GElement, any, HTMLElement, any> {
  return select<GElement, any>(`#${selector}`);
}
