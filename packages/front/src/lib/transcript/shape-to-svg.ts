import _ from 'lodash';
import { RTreeIndexable } from '~/components/basics/rtree-search';
import { Label } from './labels';

import {
  formatShape,
  Shape
} from './shapes';

/**
 * SVG element data with additional properties
 * */
export interface BaseSvg extends RTreeIndexable {
  id: string;
  classes: string[];
  data: Record<string, any>;
}
export interface PointSvg extends BaseSvg {
  tag: 'circle';
  r: number;
  cx: number;
  cy: number;
}

export interface LineSvg extends BaseSvg {
  tag: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RectSvg extends BaseSvg {
  tag: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PathSvg extends BaseSvg {
  tag: 'path';
  d: string;
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

export type ShapeSvg = PointSvg | LineSvg | RectSvg | PathSvg;

export function shapeToSvg(shape: Shape): ShapeSvg {
  const id = deriveShapeId(shape);
  switch (shape.kind) {
    case 'point':
      return <PointSvg>{
        tag: 'circle',
        id,
        r: 3,
        cx: shape.x,
        cy: shape.y,
        minX: shape.x - 1.5,
        minY: shape.y - 1.5,
        maxX: shape.x + 1.5,
        maxY: shape.y + 1.5,
        data: {},
        classes: []
      };
    case 'line':
      return <LineSvg>{
        tag: 'line',
        id,
        x1: shape.p1.x,
        y1: shape.p1.y,
        x2: shape.p2.x,
        y2: shape.p2.y,
        minX: Math.min(shape.p1.x, shape.p2.x),
        minY: Math.min(shape.p1.y, shape.p2.y),
        maxX: Math.max(shape.p1.x, shape.p2.x),
        maxY: Math.max(shape.p1.y, shape.p2.y),
        data: {},
        classes: []
      };
    case 'rect':
      return <RectSvg>{
        tag: 'rect',
        id,
        x: shape.x,
        y: shape.y,
        width: Math.max(shape.width, 2),
        height: Math.max(shape.height, 2),
        minX: shape.x,
        minY: shape.y,
        maxX: shape.x + shape.width,
        maxY: shape.y + shape.height,
        data: {},
        classes: []
      };

    case 'circle':
      const { r } = shape;
      const r2 = r / 2;
      return <PointSvg>{
        tag: 'circle',
        id,
        r: shape.r,
        cx: shape.p.x,
        cy: shape.p.y,
        minX: shape.p.x - r2,
        minY: shape.p.y - r2,
        maxX: shape.p.x + r2,
        maxY: shape.p.y + r2,
        data: {},
        classes: []
      };
    case 'triangle': {
      const { p1, p2, p3 } = shape;
      const minX = Math.min(p1.x, p2.x, p3.x);
      const maxX = Math.max(p1.x, p2.x, p3.x);
      const minY = Math.min(p1.y, p2.y, p3.y);
      const maxY = Math.max(p1.y, p2.y, p3.y);
      return <PathSvg>{
        tag: 'path',
        id,
        d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`,
        minX,
        minY,
        maxX,
        maxY,
        data: {},
        classes: []
      };
    }
    case 'trapezoid': {
      const {
        topLeft, topWidth, bottomLeft, bottomWidth,
      } = shape;
      const bottomRight = _.clone(bottomLeft);
      bottomRight.x += bottomWidth;
      const topRight = _.clone(topLeft);
      topRight.x += topWidth;

      const minX = Math.min(topLeft.x, bottomLeft.x);
      const maxX = Math.max(topRight.x, bottomRight.x);
      const minY = Math.min(topLeft.y, bottomLeft.y);
      const maxY = Math.max(topLeft.y, bottomLeft.y);

      return <PathSvg>{
        tag: 'path',
        id,
        d: `M ${topLeft.x} ${topLeft.y} L ${bottomLeft.x} ${bottomLeft.y} L ${bottomRight.x} ${bottomRight.y} L ${topRight.x} ${topRight.y} Z`,
        minX,
        minY,
        maxX,
        maxY,
        data: {},
        classes: []
      };
    }
  }
}
