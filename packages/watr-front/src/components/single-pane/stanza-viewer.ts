import _ from 'lodash';

import { Ref } from '@vue/composition-api';

import { StateArgs } from '~/components/basics/component-basics'
import { useEventlibCore } from '~/components/basics/eventlib-core';
import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { BBox } from '~/lib/coord-sys';
import { useMeasuredTextOverlay } from '~/components/basics/measured-text-overlay';
import { TextStyle } from '~/lib/html-text-metrics';

import { PutTextLn, TranscriptIndex } from '~/lib/transcript/transcript-index';

export type ShowStanza = (transcriptIndex: TranscriptIndex, stanzaId: number) => void;

type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement | null>;
};

export interface StanzaViewer {
  showStanza: ShowStanza;
}

export async function useStanzaViewer({
  mountPoint, state
}: Args): Promise<StanzaViewer> {

  // const eventlibCore = await useEventlibCore({ targetDivRef: mountPoint, state } );
  const superimposedElements = await useSuperimposedElements({
    includeElems: [ElementTypes.Text, ElementTypes.Svg],
    mountPoint,
    state
  });

  // const spatialSearch = useSpatialSearch({ state, eventlibCore, superimposedElements });

  const size = 15;
  const style: TextStyle = {
    size,
    style: 'normal',
    family: 'arial',
    weight: 'normal'
  };

  const mtext = useMeasuredTextOverlay({ superimposedElements, state });
  const textDiv = superimposedElements.overlayElements.textDiv!;
  const pageLeft = 0;
  const putTextLn: PutTextLn = (lineNum: number, text: string) => {
    const lineY = (size + 2) * lineNum;
    return mtext.putTextLn(style, pageLeft, lineY, text);
  };

  const showStanza: ShowStanza = (transcriptIndex, stanzaId) => {
    textDiv.style.visibility = 'hidden';
    const stanzaBounds = transcriptIndex.indexStanza(stanzaId, putTextLn)
    superimposedElements.setDimensions(stanzaBounds.width, stanzaBounds.height);
    textDiv.style.visibility = 'visible';
  };
  return {
    showStanza
  };
}
