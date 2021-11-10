import _ from 'lodash';
import { RTreeIndexable } from '~/components/basics/rtree-search';
import {
 point, Point, Rect, rect, Shape
} from './shapes';

export interface BaseSvg extends RTreeIndexable {
    id: string;
    classes?: string[];
    data: Record<string, any>;
}
export interface PointSvg extends BaseSvg {
    type: 'circle';
    r: number;
    cx: number;
    cy: number;
}

export interface LineSvg extends BaseSvg {
    type: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface RectSvg extends BaseSvg {
    type: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface PathSvg extends BaseSvg {
    type: 'path';
    d: string;
}

export type ShapeSvg = PointSvg | LineSvg | RectSvg | PathSvg;

export function shapeToSvg(shape: Shape): ShapeSvg {
    switch (shape.kind) {
        case 'point':
            return <PointSvg>{
                type: 'circle',
                r: 3,
                cx: shape.x,
                cy: shape.y,
                minX: shape.x - 1.5,
                minY: shape.y - 1.5,
                maxX: shape.x + 1.5,
                maxY: shape.y + 1.5,
                data: {},
            };
        case 'line':
            return <LineSvg>{
                type: 'line',
                x1: shape.p1.x,
                y1: shape.p1.y,
                x2: shape.p2.x,
                y2: shape.p2.y,
                minX: Math.min(shape.p1.x, shape.p2.x),
                minY: Math.min(shape.p1.y, shape.p2.y),
                maxX: Math.max(shape.p1.x, shape.p2.x),
                maxY: Math.max(shape.p1.y, shape.p2.y),
                data: {},
            };
        case 'rect':
            return <RectSvg>{
                type: 'rect',
                x: shape.x,
                y: shape.y,
                width: Math.max(shape.width, 2),
                height: Math.max(shape.height, 2),
                minX: shape.x,
                minY: shape.y,
                maxX: shape.x + shape.width,
                maxY: shape.y + shape.height,
                data: {},
            };

        case 'circle':
            const { r } = shape;
            const r2 = r / 2;
            return <PointSvg>{
                type: 'circle',
                r: shape.r,
                cx: shape.p.x,
                cy: shape.p.y,
                minX: shape.p.x - r2,
                minY: shape.p.y - r2,
                maxX: shape.p.x + r2,
                maxY: shape.p.y + r2,
                data: {},
            };
        case 'triangle': {
            const { p1, p2, p3 } = shape;
            const minX = Math.min(p1.x, p2.x, p3.x);
            const maxX = Math.max(p1.x, p2.x, p3.x);
            const minY = Math.min(p1.y, p2.y, p3.y);
            const maxY = Math.max(p1.y, p2.y, p3.y);
            return <PathSvg>{
                type: 'path',
                d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`,
                minX,
                minY,
                maxX,
                maxY,
                data: {},
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
                type: 'path',
                d: `M ${topLeft.x} ${topLeft.y} L ${bottomLeft.x} ${bottomLeft.y} L ${bottomRight.x} ${bottomRight.y} L ${topRight.x} ${topRight.y} Z`,
                minX,
                minY,
                maxX,
                maxY,
                data: {},
            };
        }
    }
}

/** Same interface used by RTree (as implemented in RBush library) */
export interface MinMaxBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export function minMaxToRect(mm: MinMaxBox): Rect {
  const {
 minX, minY, maxX, maxY
} = mm;
  const x = minX;
  const y = minY;
  const width = maxX - minX;
  const height = maxY - minY;
  return rect(x, y, width, height);
}

/**
 *  General purpose bounding box data that meets the interface requirements
 *  for the various libraries in use
 */
export class BBox {
    public left: number;

    public top: number;

    public width: number;

    public height: number;

    public constructor(
        l: number,
        t: number,
        w: number,
        h: number,
    ) {
        this.left = l;
        this.top = t;
        this.width = w;
        this.height = h;
    }

    get minX() {
        return this.left;
    }

    get minY() {
        return this.top;
    }

    get maxX() {
        return this.left + this.width;
    }

    get maxY() {
        return this.top + this.height;
    }

    get x() {
        return this.left;
    }

    get y() {
        return this.top;
    }

    get x1() {
        return this.left;
    }

    get x2() {
        return this.left + this.width;
    }

    get y1() {
        return this.top;
    }

    get y2() {
        return this.top + this.height;
    }

    get bottom() {
        return this.top + this.height;
    }

    get right() {
        return this.left + this.width;
    }

    get topLeft() {
        return point(this.left, this.top);
    }

    public toString() {
        return `BBox(${this.left}, ${this.top}, ${this.width}, ${this.height})`;
    }

    public svgShape() {
        return rect(
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}

export function bbox(l: number, t: number, w: number, h: number): BBox {
    return new BBox(l, t, w, h);
}

export function boxCenteredAt(p: Point, width: number, height: number): BBox {
  const left = p.x - width / 2;
  const top = p.y - height / 2;
  return bbox(left, top, width, height);
}

// export const mk = {
//   fromLtwh: (l: number, t: number, w: number, h: number) => new BBox(l, t, w, h),

//   fromArray: (ltwh: [number, number, number, number]) => {
//     const left = ltwh[0] / 100;
//     const top = ltwh[1] / 100;
//     const width = ltwh[2] / 100;
//     const height = ltwh[3] / 100;
//     return new BBox(left, top, width, height);
//   },
// };
