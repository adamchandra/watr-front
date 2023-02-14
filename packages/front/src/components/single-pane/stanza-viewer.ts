import _ from 'lodash';

import { Ref } from 'vue';

import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { useMeasuredTextOverlay } from '~/components/basics/measured-text-overlay';
import { TextStyle } from '~/lib/html-text-metrics';

import { PutTextLn, RenderStanzaOpts, TranscriptIndex } from '~/lib/transcript/transcript-index';

export type ShowStanzaOpts = RenderStanzaOpts;

export type ShowStanza = (transcriptIndex: TranscriptIndex, stanzaId: number, opts: ShowStanzaOpts) => void;

type Args = {
  mountPoint: Ref<HTMLDivElement | null>;
};

export interface StanzaViewer {
  showStanza: ShowStanza;
}

export async function useStanzaViewer({
  mountPoint,
}: Args): Promise<StanzaViewer> {
  const superimposedElements = await useSuperimposedElements({
    includeElems: [ElementTypes.Text, ElementTypes.Svg, ElementTypes.Event],
    mountPoint,
  });

  const size = 15;
  const style: TextStyle = {
    size,
    style: 'normal',
    family: 'arial',
    weight: 'normal',
  };

  const mtext = useMeasuredTextOverlay({ superimposedElements });
  const textDiv = superimposedElements.overlayElements.textDiv!;
  const pageLeft = 0;
  const putTextLn: (o: ShowStanzaOpts) => PutTextLn = () => (lineNum: number, text: string) => {
    const lineY = (size + 2) * lineNum;
    return mtext.putTextLn(style, pageLeft, lineY, text);
  };

  const showStanza: ShowStanza = (transcriptIndex, stanzaId, opts) => {
    textDiv.style.visibility = 'hidden';
    const stanzaBounds = transcriptIndex.indexStanza(stanzaId, putTextLn(opts), opts);
    superimposedElements.setDimensions(stanzaBounds.width, stanzaBounds.height);
    textDiv.style.visibility = 'visible';
  };

  return {
    showStanza,
  };
}
