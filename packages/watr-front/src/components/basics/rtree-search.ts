/**
 * Initialize and return an rtree interface
 */

import _ from 'lodash'

import {
  Ref,
  ref
} from '@vue/composition-api'

import { EventlibCore } from './eventlib-core'
import { StateArgs } from '~/components/basics/component-basics'
import * as coords from '~/lib/coord-sys'
import { EMouseEvent, MouseHandlerInit } from '~/lib/EventlibHandlers'
import { TranscriptIndex, TranscriptIndexable } from '~/lib/transcript/transcript-index'

/**
 * Minimal interface required for RTree index
 */
export interface RTreeIndexable extends coords.MinMaxBox {
  id: number;
}

interface Flashlight<T> {
  off(): void;
  litItemsRef: Ref<TranscriptIndexable<T>[]>;
}


type Args = StateArgs & {
  indexKey: string;
  transcriptIndex: TranscriptIndex;
  eventlibCore: EventlibCore;
}

export function useFlashlight<T>({
  transcriptIndex,
  indexKey,
  eventlibCore
}: Args): Flashlight<T> {

  const litItemsRef: Ref<TranscriptIndexable<any>[]> = ref([])

  const rtree = transcriptIndex.indexes[indexKey];

  const mousemove = (e: EMouseEvent) => {
    const pos = e.pos
    const mousePt = coords.mkPoint.fromXy(pos.x, pos.y)
    const queryBox = coords.boxCenteredAt(mousePt, 8, 8)
    const hits = rtree.search(queryBox)
    litItemsRef.value = hits
  }

  const handlers: MouseHandlerInit = () => {
    return {
      mousemove
    }
  }

  eventlibCore.setMouseHandlers([handlers])

  const off = () => {
    // TODO unwatch(litItemsRef)
  }

  return {
    litItemsRef, off
  }
}
