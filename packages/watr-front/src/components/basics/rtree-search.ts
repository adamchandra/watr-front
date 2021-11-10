/**
 * Initialize and return an rtree interface
 */

import _ from 'lodash';

import {
  Ref,
  toRefs,
  reactive,

} from '@nuxtjs/composition-api';

import { EventlibCore } from './eventlib-core';
import { EMouseEvent, MouseHandlerInit, MouseEventT } from '~/lib/EventlibHandlers';
import { TranscriptIndex, TranscriptIndexable } from '~/lib/transcript/transcript-index';
import { boxCenteredAt, MinMaxBox } from '~/lib/shape-compat';
import { point } from '~/lib/transcript/shapes';

/**
 * Minimal interface required for RTree index
 */
export interface RTreeIndexable extends MinMaxBox {
  id: string;
}

type HitTarget = TranscriptIndexable<any>;
type HitTargets = HitTarget[];
type EventTargetRecord = Partial<Record<MouseEventT, Ref<HitTargets>>>;

interface Flashlight {
  off(): void;
  eventTargetRecs: EventTargetRecord;
}

type Args = {
  indexKey: string;
  transcriptIndex: TranscriptIndex;
  eventlibCore: EventlibCore;
  flashlightRadius: number;
};

export function useFlashlight({
  transcriptIndex,
  indexKey,
  flashlightRadius,
  eventlibCore,
}: Args): Flashlight {
  const eventTargetRecs = toRefs(reactive({
    mousemove: [],
    click: [],
  }));

  const mousemove = (e: EMouseEvent) => {
    const { pos } = e;
    const mousePt = point(pos.x, pos.y);
    const queryBox = boxCenteredAt(mousePt, flashlightRadius, flashlightRadius);

    const rtree = transcriptIndex.getKeyedIndex(indexKey);
    const hits = rtree.search(queryBox);

    eventTargetRecs.mousemove.value = hits;
  };

  const click = (e: EMouseEvent) => {
    const { pos } = e;
    const mousePt = point(pos.x, pos.y);
    const queryBox = boxCenteredAt(mousePt, 1, 1);

    const rtree = transcriptIndex.getKeyedIndex(indexKey);
    const hits = rtree.search(queryBox);
    eventTargetRecs.click.value = hits;
  };

  const handlers: MouseHandlerInit = () => ({
    mousemove,
    click,
  });

  eventlibCore.setMouseHandlers([handlers]);

  const off = () => {
    // TODO unwatch(litItemsRef)
  };

  return {
    eventTargetRecs, off,
  };
}
