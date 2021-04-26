/**
 * Various helper functions for working with d3.js
 */

import {
  Selection,
  BaseType,
  select
} from 'd3-selection';

import 'd3-transition';

import { BBox } from '~/lib/coord-sys';
import { SelectionOrTransition } from 'd3-transition';

export function initRect<GElement extends BaseType, Datum, PElement extends BaseType, PDatum > (
  sel: Selection<GElement, Datum, PElement, PDatum>,
  fbbox: (d: any) => BBox
) {
  sel.attr('x'      , d => fbbox(d).x)
    .attr('y'      , d => fbbox(d).y)
    .attr('width'  , d => fbbox(d).width)
    .attr('height' , d => fbbox(d).height);
}

export function initStroke <GElement extends BaseType, Datum, PElement extends BaseType, PDatum> (
  sel: Selection<GElement, Datum, PElement, PDatum>,
  stroke: string, strokeWidth: number, strokeOpacity: number
) {
  sel.attr('stroke', stroke)
    .attr('stroke-width', strokeWidth)
    .attr('stroke-opacity', strokeOpacity);
}

export function initFill<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> (
  sel: SelectionOrTransition<GElement, Datum, PElement, PDatum>,
  fill: string, fillOpacity: number
) {
  sel.attr('fill', fill);
  sel.attr('fill-opacity', fillOpacity);
}

export function getId(data: any) {
  const shape = data.type;

  if (data.id !== undefined) {
    return data.id;
  }
  switch (shape) {
    case 'rect':
      return `r_${data.x}_${data.y}_${data.width}_${data.height}`;
    case 'circle':
      return `c_${data.cx}_${data.cy}_${data.r}`;
    case 'line':
      return `l_${data.x1}_${data.y1}_${data.x2}_${data.y2}`;
    default:
      return '';
  }
}

export function d3id<GElement extends BaseType>(
  selector: string
): Selection<GElement, any, HTMLElement, any> {
  return select<GElement, any>(`#${selector}`);
}
