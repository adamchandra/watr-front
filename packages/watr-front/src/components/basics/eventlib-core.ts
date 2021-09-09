/**
 *
  */
import _ from 'lodash'

import {
  reactive,
  Ref,
  ref as deepRef,
  watch,
  UnwrapRef
} from '@nuxtjs/composition-api';

import RBush, {} from 'rbush';

import { resolveWhen, awaitRef } from '~/components/basics/component-basics'

import {
  MouseHandlerInit,
  setMouseHandlers as _setMouseHandlers,
  EventlibPoint,
  getCursorPosition,
} from '~/lib/EventlibHandlers';

import { RTreeIndexable } from './rtree-search';

export interface EventlibCore {
  mousePosRef: UnwrapRef<EventlibPoint>;
  loadShapes: (shapes: RTreeIndexable[]) => void;
  eventRTree: RBush<RTreeIndexable>;
  setMouseHandlers: (hs: MouseHandlerInit[]) => void;
}

type Args = {
  targetDivRef: Ref<HTMLDivElement|null>;
};

export async function useEventlibCore({
  targetDivRef
}: Args): Promise<EventlibCore> {
  const mousePosRef: UnwrapRef<EventlibPoint> = reactive({
    x: 0,
    y: 0
  })

  const eventRTree: RBush<RTreeIndexable> = new RBush<RTreeIndexable>()
  const handlerQueue: Ref<MouseHandlerInit[]> = deepRef([])

  const targetDiv = await awaitRef(targetDivRef)
  targetDiv.addEventListener('mousemove', onMouseMove)

  watch(handlerQueue, (handlers) => {
    if (handlers.length > 0) {
      _setMouseHandlers(targetDivRef, handlers)
      handlerQueue.value = []
    }
  })

  function onMouseMove(e: MouseEvent) {
    const targetDiv = targetDivRef.value
    if (targetDiv) {
      const { x, y } = getCursorPosition(targetDiv, e)
      mousePosRef.x = x
      mousePosRef.y = y
    }
  }

  function loadShapes(shapes: RTreeIndexable[]): void {
    eventRTree.load(shapes)
  }

  function setMouseHandlers(h: MouseHandlerInit[]): void {
    const current = handlerQueue.value
    handlerQueue.value = _.concat(current, h)
  }

  return resolveWhen({
    mousePosRef,
    loadShapes,
    eventRTree,
    setMouseHandlers
  })
}
