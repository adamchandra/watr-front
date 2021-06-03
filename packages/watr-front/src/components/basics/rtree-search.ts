/**
 * Initialize and return an rtree interface
 */

import _ from 'lodash'

import {
  Ref,
  ref
} from '@vue/composition-api'

import { EventlibCore } from './eventlib-core'
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


type Args = {
  indexKey: string;
  transcriptIndex: TranscriptIndex;
  eventlibCore: EventlibCore;
  flashlightRadius: number;
}

export function useFlashlight<T>({
  transcriptIndex,
  indexKey,
  flashlightRadius,
  eventlibCore
}: Args): Flashlight<T> {

  const litItemsRef: Ref<TranscriptIndexable<any>[]> = ref([])

  const mousemove = (e: EMouseEvent) => {
    const pos = e.pos
    const mousePt = coords.mkPoint.fromXy(pos.x, pos.y);
    const queryBox = coords.boxCenteredAt(mousePt, flashlightRadius, flashlightRadius);

    const rtree = transcriptIndex.getKeyedIndex(indexKey);
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
