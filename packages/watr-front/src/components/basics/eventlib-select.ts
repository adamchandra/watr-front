/**
 * Provide the ability to draw selection rectangles over PDF page images and emit selection events
 */
import _ from 'lodash';
import * as d3 from 'd3-selection';
import { SelectionOrTransition } from 'd3-transition';


import {
  ref as deepRef,
  Ref,
  reactive,
  toRefs,
  watch,
} from '@nuxtjs/composition-api';

import { EMouseEvent, MouseHandlerInit } from '~/lib/EventlibHandlers';
import { EventlibCore } from './eventlib-core';
import { BBox, Point } from '~/lib/coord-sys';
import * as d3x from '~/lib/d3-extras';
const { initStroke, initFill, initRect } = d3x;

import { SuperimposedElements } from './superimposed-elements';

function pointsToRect(p1: Point, p2: Point): BBox {
  const ny = Math.min(p1.y, p2.y);
  const nx = Math.min(p1.x, p2.x);
  const nwidth = Math.abs(p1.x - p2.x);
  const nheight = Math.abs(p1.y - p2.y);

  return new BBox(nx, ny, nwidth, nheight);
}

export interface EventlibSelect {
  selectionRef: Ref<BBox | null>;
  clickedPointRef: Ref<Point | null>;
}

type Args = {
  superimposedElements: SuperimposedElements;
  eventlibCore: EventlibCore;
};

export function useEventlibSelect({
  superimposedElements,
  eventlibCore,
}: Args) {

  const selectionRef: Ref<BBox | null> = deepRef(null);
  const clickedPointRef: Ref<Point | null> = deepRef(null);

  const svgLayer = superimposedElements.overlayElements.svg;
  const svgSelect = d3.select(svgLayer);

  let currSvgRect: SelectionOrTransition<SVGRectElement, BBox, SVGElement, unknown>;

  const { setMouseHandlers } = eventlibCore;

  const { refs, handlers } = selectExtentHandlers();

  let originPt: Point = new Point(0, 0);
  let currentPt: Point = new Point(0, 0);
  let currBBox: BBox;

  function initSvgRect() {
    currBBox = pointsToRect(originPt, currentPt);

    currSvgRect = svgSelect
      .selectAll('rect#selection')
      .data([currBBox])
      .enter()
      .append('rect').attr('id', 'selection')
      .call(initStroke, 'blue', 1, 0.8)
      .call(initFill, 'yellow', 0.8)
    ;


    updateCurrentRect();
  }


  function updateCurrentRect() {
    currBBox = pointsToRect(originPt, currentPt);
    currSvgRect
      .call(initRect, () => currBBox)
    ;
  }

  watch(refs.origin, ([x, y]) => {
    originPt = currentPt = new Point(x, y);
    initSvgRect();
  });

  watch(refs.current, ([x, y]) => {
    currentPt = new Point(x, y);
    updateCurrentRect();
  });

  watch(refs.final, ([[], [x2, y2]]) => {
    currentPt = new Point(x2, y2);
    updateCurrentRect();

    currSvgRect
      .transition()
      .duration(200)
      .call(initFill, 'green', 0.2)
      .remove()
    ;

    selectionRef.value = currBBox;
  });

  setMouseHandlers([handlers]);

  return {
    selectionRef,
    clickedPointRef,
  };
}

export interface ExtentHandlerRefs {
  origin: Ref<[ number, number ]>;
  current: Ref<[ number, number ]>;
  final: Ref<[ [number, number], [number, number] ]>;
  cancelled: Ref<boolean>;
}

export interface ExtentHandlers {
  refs: ExtentHandlerRefs;
  handlers: MouseHandlerInit;
}

export function selectExtentHandlers(): ExtentHandlers {

  let selecting = false;

  const refs: ExtentHandlerRefs = toRefs(reactive({
    origin: [0, 0] as [number, number],
    current: [0, 0] as [number, number],
    final: [[0, 0], [0, 0]] as [[number, number], [number, number]],
    cancelled: false,
  }));

  const mousedown = (e: EMouseEvent) => {
    const { x, y } = e.pos;
    refs.current.value = refs.origin.value = [x, y];
    selecting = true;
  };

  const mousemove = (e: EMouseEvent) => {
    if (selecting) {
      const { x, y } = e.pos;
      refs.current.value = [x, y];
    }
  };

  const mouseup = (e: EMouseEvent) => {
    if (selecting) {
      const { x, y } = e.pos;
      refs.final.value = [refs.origin.value, [x, y]];
    }
  };

  const mouseout = (e: EMouseEvent) => {
    if (selecting) {
      const { x, y } = e.pos;
      refs.current.value = [x, y];
    }
  };

  const mouseover = (e: EMouseEvent) => {
    if (selecting) {
      const { x, y } = e.pos;
      refs.current.value = [x, y];
    }
  };

  const handlers: MouseHandlerInit = () =>  {
    return {
      mousedown,
      mousemove,
      mouseup,
      mouseout,
      mouseover,
    };
  };
  return {
    refs, handlers,
  };

}
