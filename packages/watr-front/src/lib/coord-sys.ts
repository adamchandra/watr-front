/**
 * Define and translate between the various coordinate systems used:
 *
 *
 *    PDF Media coords - (PDF-extracted page geometry and char bounding boxes)
 *    Single-Page Image coords - coords within the svg containing page image, scaled version of Media coords
 *    Screen event coords - e.g., where a user clicks on a page
 *    Client Pages View  - Absolute coords within the vertical scroll
 *                         list of page svgs/images (regardless of scroll position)
 *    Client Text View  - coords within the vertical scroll list of page text blocks  (regardless of scroll position)
 *
 *    event page/client/screen/offset explanations:
 *       https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
 */

export enum CoordSys {
  Unknown,
  Screen,
  Div,
  GraphUnits,
  PdfMedia,
}

export type LTBoundsArray = [number, number, number, number];

/** Same interface used by RTree (as implemented in RBush library) */
export interface MinMaxBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface LTBoundsIntRep {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LTBounds {
  left: number;
  top: number;
  width: number;
  height: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  x: number;
  y: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  bottom: number;
  right: number;
  topLeft: Point;
}

export class Point {
  public x: number;
  public y: number;
  public sys: CoordSys;

  public constructor(x: number, y: number, sys?: CoordSys) {
    this.x = x;
    this.y = y;
    this.sys = sys ? sys : CoordSys.Unknown;
    // this.type = "Point";
  }

  public svgShape() {
    return {
      type: 'circle',
      r: 3,
      cx: this.x,
      cy: this.y,
    };
  }
}

class Line {
  public p1: Point;
  public p2: Point;
  public sys: CoordSys = CoordSys.Unknown;

  public constructor(p1: Point, p2: Point) {
    this.p1 = p1;
    this.p2 = p2;
  }

  public svgShape() {
    return {
      type: 'line',
      x1: this.p1.x,
      x2: this.p2.x,
      y1: this.p1.y,
      y2: this.p2.y,
    };
  }
}

class Trapezoid {
  public topLine: Line;
  public bottomLine: Line;

  public constructor(top: Line, bottom: Line) {
    this.topLine = top;
    this.bottomLine = bottom;
  }

  public svgShape() {
    const p1 = this.topLine.p1;
    const p2 = this.topLine.p2;
    const p3 = this.bottomLine.p2;
    const p4 = this.bottomLine.p1;
    return {
      type: 'path',
      d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`,
    };
  }
}

export type NumArray4 = [number, number, number, number];
export type BBoxArray = NumArray4;

export type AnyShape = Point | Line | Trapezoid | BBox;

export const mkPoint = {
  fromXy: (x: number, y: number, sys: CoordSys = CoordSys.Unknown) => {
    return new Point(x, y, sys);
  },

  fromD3Mouse: (d3Mouse: [number, number]) => {
    return new Point(d3Mouse[0], d3Mouse[1], CoordSys.Screen);
  },

  offsetFromJqEvent: (event: any) => {
    return mkPoint.fromXy(event.offsetX, event.offsetY, CoordSys.Screen);
  },

  fromFloatReps: (o: any) => {
    return new Point(o.x / 100.0, o.y / 100.0, CoordSys.PdfMedia);
  },
};

export function pointFloor(p: Point) {
  return mkPoint.fromXy(Math.floor(p.x), Math.floor(p.y), p.sys);
}

/**
 *  General purpose bounding box data that meets the interface requirements
 *  for the various libraries in use
 */
export class BBox implements LTBounds {
  public left: number;
  public top: number;
  public width: number;
  public height: number;
  public sys: CoordSys;

  public constructor(
    l: number,
    t: number,
    w: number,
    h: number,
    sys?: CoordSys,
  ) {
    this.left = l;
    this.top = t;
    this.width = w;
    this.height = h;
    this.sys = sys ? sys : CoordSys.Unknown;
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
    return mkPoint.fromXy(this.left, this.top, this.sys);
  }

  get centerPoint() {
    const x = this.minX + this.width / 2;
    const y = this.minY + this.height / 2;
    return mkPoint.fromXy(x, y, this.sys);
  }

  get intRep() {
    return [
      Math.trunc(this.left * 100.0),
      Math.trunc(this.top * 100.0),
      Math.trunc(this.width * 100.0),
      Math.trunc(this.height * 100.0),
    ];
  }

  public toString() {
    return `BBox(${this.left}, ${this.top}, ${this.width}, ${this.height})`;
  }

  public svgShape() {
    return {
      type: 'rect',
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

export const mk = {
  fromLtwhFloatReps: (o: LTBoundsIntRep) => {
    return new BBox(
      o.left / 100.0,
      o.top / 100.0,
      o.width / 100.0,
      o.height / 100.0,
      CoordSys.Unknown,
    );
  },

  fromLtwh: (l: number, t: number, w: number, h: number) => {
    return new BBox(l, t, w, h, CoordSys.Unknown);
  },

  fromLtwhObj: (o: LTBounds) => {
    return new BBox(o.left, o.top, o.width, o.height, CoordSys.Unknown);
  },

  fromArray: (ltwh: [number, number, number, number]) => {
    const left = ltwh[0] / 100.0;
    const top = ltwh[1] / 100.0;
    const width = ltwh[2] / 100.0;
    const height = ltwh[3] / 100.0;
    return new BBox(left, top, width, height, CoordSys.PdfMedia);
  },
};

export function toBox(mm: MinMaxBox): BBox {
  const { minX, minY, maxX, maxY } = mm;
  const x = minX;
  const y = minY;
  const width = maxX - minX;
  const height = maxY - minY;
  return new BBox(x, y, width, height)
}


export function centerBoxAt(box: BBox, p: Point): void {
  const { width, height } = box;
  const left = p.x - width / 2;
  const top = p.y - height / 2;
  box.left = left;
  box.top = top;
}

export function boxCenteredAt(p: Point, width: number, height: number) {
  const left = p.x - width / 2;
  const top = p.y - height / 2;
  return mk.fromLtwh(left, top, width, height);
}

export function fromFigure(fig: any): AnyShape {
  let shape;

  if (fig.LTBounds) {
    shape = mk.fromArray(fig.LTBounds);
  } else if (fig.Line) {
    const p1 = mkPoint.fromFloatReps(fig.Line.p1);
    const p2 = mkPoint.fromFloatReps(fig.Line.p2);
    shape = new Line(p1, p2);
  } else if (fig.Point) {
    shape = mkPoint.fromFloatReps(fig.Point);
  } else if (fig.Trapezoid) {
    const topP1 = mkPoint.fromFloatReps(fig.Trapezoid.topLeft);
    const topP2 = mkPoint.fromFloatReps({
      x: fig.Trapezoid.topLeft.x + fig.Trapezoid.topWidth,
      y: fig.Trapezoid.topLeft.y,
    });

    const bottomP1 = mkPoint.fromFloatReps(fig.Trapezoid.bottomLeft);
    const bottomP2 = mkPoint.fromFloatReps({
      x: fig.Trapezoid.bottomLeft.x + fig.Trapezoid.bottomWidth,
      y: fig.Trapezoid.bottomLeft.y,
    });

    const top = new Line(topP1, topP2);
    const bottom = new Line(bottomP1, bottomP2);

    shape = new Trapezoid(top, bottom);
  } else {
    throw new Error(`could not construct shape from figure ${fig}`);
  }

  return shape;
}
