import {
  Point, point, Rect, rect
} from './transcript/shapes';

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
