import _ from 'lodash';

import {
  Ref,
} from '@nuxtjs/composition-api';

import { UnwrapRef } from '@nuxtjs/composition-api';

export function getCursorPosition(elem: Element, event: MouseEvent): EventlibPoint {
  const rect: DOMRect | ClientRect = elem.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return { x, y };
}

export interface EventlibPoint {
  x: number;
  y: number;
}

export interface EventlibMouse {
  mousePosRef: UnwrapRef<EventlibPoint | null>; // TODO why or null ??
}

export interface EMouseEvent {
  origMouseEvent: MouseEvent;
  pos: EventlibPoint;
}

export type EMouseEventHandler = (e: EMouseEvent) => void;

type GEMap = GlobalEventHandlersEventMap;

// Union of all mouse event type keys "mousemove", etc..., exluding Pointer/Drag events
export type MouseEventT = {
  [K in keyof GEMap]:
  GEMap[K] extends MouseEvent ?
  (GEMap[K] extends DragEvent ? never : (
    GEMap[K] extends PointerEvent ? never : K
  )) : never
}[keyof GEMap];

interface MouseEventMap {
  auxclick: EMouseEventHandler;
  click: EMouseEventHandler;
  contextmenu: EMouseEventHandler;
  dblclick: EMouseEventHandler;
  mousedown: EMouseEventHandler;
  mouseenter: EMouseEventHandler;
  mouseleave: EMouseEventHandler;
  mousemove: EMouseEventHandler;
  mouseout: EMouseEventHandler;
  mouseover: EMouseEventHandler;
  mouseup: EMouseEventHandler;
  wheel: EMouseEventHandler;
}

const MouseEvents: MouseEventT[] = [
  'auxclick',
  'click',
  'contextmenu',
  'dblclick',
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'wheel',
];

export type MouseHandlers = Partial<MouseEventMap>;

export type MouseHandlerInit = (t?: any) => MouseHandlers;

export function setMouseHandlers(
  targetDivRef: Ref<HTMLDivElement | null>,
  handlers: MouseHandlerInit[]
): void {

  const targetDiv = targetDivRef.value!;

  _.each(MouseEvents, eventType => {
    _.each(handlers, (hInit: MouseHandlerInit) => {
      const h: MouseHandlers = hInit(null);
      const eventHandler: ((e: EMouseEvent) => void) | undefined = h[eventType];

      if (eventHandler) {
        const adaptor = (e: MouseEvent) => {
          const ev = {
            origMouseEvent: e,
            pos: getCursorPosition(targetDiv, e)
          };
          return eventHandler(ev);
        };

        const addEventListenerOptions: AddEventListenerOptions = {
          capture: false,
          once: false,
          passive: false
        };

        targetDiv.addEventListener(eventType, adaptor, addEventListenerOptions);
      }
    });
  });
}


// interface KeyEventMap {
//   "keydown": KeyboardEvent;
//   "keypress": KeyboardEvent;
//   "keyup": KeyboardEvent;
// }

// interface OtherEventMap {
//   "drag": DragEvent;
//   "dragend": DragEvent;
//   "dragenter": DragEvent;
//   "dragexit": Event;
//   "dragleave": DragEvent;
//   "dragover": DragEvent;
//   "dragstart": DragEvent;
//   "drop": DragEvent;
//   "select": Event;
//   "selectionchange": Event;
//   "selectstart": Event;
//   "wheel": WheelEvent;
// }
