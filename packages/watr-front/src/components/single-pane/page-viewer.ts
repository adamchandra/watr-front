/**
 * Create and setup SVG/Img/Div + EventHandlers to view a particular page image
 * from a PDF
 **/
import _ from 'lodash';

import {
  Ref,
} from '@nuxtjs/composition-api';

import { StateArgs } from '~/components/basics/component-basics'
import { useEventlibCore, EventlibCore } from '~/components/basics/eventlib-core';
import { useSuperimposedElements, SuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { resolveCorpusUrl } from '~/lib/axios';
import { TranscriptIndex } from '~/lib/transcript/transcript-index';

type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement | null>;
  transcriptIndex: TranscriptIndex;
  pageNumber: number;
  entryId: string;
};

export interface PdfPageViewer {
  eventlibCore: EventlibCore;
  superimposedElements: SuperimposedElements;
}

export async function usePdfPageViewer({
  mountPoint, state,
  transcriptIndex,
  entryId,
  pageNumber
}: Args): Promise<PdfPageViewer> {

  const eventlibCore = await useEventlibCore({ targetDivRef: mountPoint, state });

  const superimposedElements = await useSuperimposedElements({
    includeElems: [ElementTypes.Img, ElementTypes.Svg],
    mountPoint, state
  });

  const transcriptPage = transcriptIndex.transcript.pages[pageNumber];
  const pageBounds = transcriptPage.bounds;
  const pageImageNumber = (pageNumber + 1).toString();

  const imageUrl = resolveCorpusUrl(entryId, 'image', pageImageNumber);

  // TODO make glyph overlays init on demand, rather than by default, to save startup overhead
  // useGlyphOverlays({ state, eventlibCore, superimposedElements, transcriptIndex, pageNumber });
  // const eventlibSelect = useEventlibSelect({ eventlibCore, superimposedElements, state });
  // useSnaptoSelection({ rtreeIndex, eventlibSelect, state });

  superimposedElements.setImageSource(imageUrl);
  superimposedElements.setDimensions(pageBounds.width, pageBounds.height);

  return {
    eventlibCore,
    superimposedElements,
  }
}
