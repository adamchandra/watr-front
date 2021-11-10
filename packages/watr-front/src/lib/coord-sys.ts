/**
 *
 */


// export interface LTBounds {
//   left: number;
//   top: number;
//   width: number;
//   height: number;
//   minX: number;
//   minY: number;
//   maxX: number;
//   maxY: number;
//   x: number;
//   y: number;
//   x1: number;
//   x2: number;
//   y1: number;
//   y2: number;
//   bottom: number;
//   right: number;
//   topLeft: Point;
// }

// export class Point {
//   public x: number;

//   public y: number;

//   public constructor(x: number, y: number) {
//     this.x = x;
//     this.y = y;
//   }

//   public svgShape() {
//     return {
//       type: 'circle',
//       r: 3,
//       cx: this.x,
//       cy: this.y,
//     };
//   }
// }

// class Line {
//   public p1: Point;

//   public p2: Point;

//   public constructor(p1: Point, p2: Point) {
//     this.p1 = p1;
//     this.p2 = p2;
//   }

//   public svgShape() {
//     return {
//       type: 'line',
//       x1: this.p1.x,
//       x2: this.p2.x,
//       y1: this.p1.y,
//       y2: this.p2.y,
//     };
//   }
// }

// class Trapezoid {
//   public topLine: Line;

//   public bottomLine: Line;

//   public constructor(top: Line, bottom: Line) {
//     this.topLine = top;
//     this.bottomLine = bottom;
//   }

//   public svgShape() {
//     const { p1 } = this.topLine;
//     const { p2 } = this.topLine;
//     const p3 = this.bottomLine.p2;
//     const p4 = this.bottomLine.p1;
//     return {
//       type: 'path',
//       d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`,
//     };
//   }
// }

// export type NumArray4 = [number, number, number, number];
// export type BBoxArray = NumArray4;

// export type AnyShape = Point | Line | Trapezoid | BBox;

// export const mkPoint = {
//   fromXy: (x: number, y: number) => new Point(x, y),
//   fromD3Mouse: (d3Mouse: [number, number]) => new Point(d3Mouse[0], d3Mouse[1]),
//   offsetFromJqEvent: (event: any) => mkPoint.fromXy(event.offsetX, event.offsetY),
//   fromFloatReps: (o: any) => new Point(o.x / 100, o.y / 100),
// };

// export function pointFloor(p: Point) {
//   return mkPoint.fromXy(Math.floor(p.x), Math.floor(p.y));
// }

