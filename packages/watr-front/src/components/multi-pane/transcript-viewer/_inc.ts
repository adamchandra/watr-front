import _ from 'lodash'

import {
  defineComponent,
  SetupContext,
  provide,
  Ref,
  ref
} from '@vue/composition-api'

import * as VC from '@vue/composition-api'

import { divRef } from '~/lib/vue-composition-lib'
import { initState, awaitRef } from '~/components/basics/component-basics'
import { usePdfPageViewer } from '~/components/single-pane/page-viewer'
import { useStanzaViewer } from '~/components/single-pane/stanza-viewer'
import { TranscriptIndex } from '~/lib/transcript/transcript-index'

import NarrowingFilter from '~/components/single-pane/narrowing-filter/index.vue'
import { ProvidedChoices } from '~/components/single-pane/narrowing-filter/_inc'
import { groupLabelsByNameAndTags } from '~/lib/transcript/tracelogs'

import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { fetchAndDecodeTranscript } from '~/lib/data-fetch'
import { useLabelOverlay } from '~/components/single-pane/label-overlay'
import { getQueryParam } from '~/lib/url-utils'

interface AppState {
  showStanzaPane: boolean;
  showPageImagePane: boolean;
  showPageOverlays: boolean;
}

export default defineComponent({
  components: { NarrowingFilter },

  setup(_props, _context: SetupContext) {
    const pageImageListDiv = divRef()
    const stanzaListDiv = divRef()
    const selectionFilterDiv = divRef()
    const state = initState()


    const choicesRef: Ref<Array<string> | null> = ref(null);
    provide(ProvidedChoices, choicesRef);
    const onItemsSelected = (selection: any[]) => {
      console.log('we got items!', selection)
    }

    const appStateRef: VC.UnwrapRef<AppState> = VC.reactive({
      showStanzaPane: true,
      showPageImagePane: true,
      showPageOverlays: true,
    });

    const appStateRefs: VC.ToRefs<AppState> = VC.toRefs(appStateRef);


    const run = pipe(
      TE.right({}),
      TE.bind('entryId', ({ }) => TE.fromEither(getQueryParam('id'))),
      TE.bind('pageImageListDiv', ({ }) => () => awaitRef(pageImageListDiv).then(d => E.right(d))),
      TE.bind('stanzaListDiv', ({ }) => () => awaitRef(stanzaListDiv).then(d => E.right(d))),
      TE.bind('selectionFilterDiv', ({ }) => () => awaitRef(selectionFilterDiv).then(d => E.right(d))),
      TE.bind('transcript', ({ entryId }) => fetchAndDecodeTranscript(entryId)),
      TE.bind('transcriptIndex', ({ transcript }) => TE.right(new TranscriptIndex(transcript))),

      TE.bind('pageViewers', ({ entryId, pageImageListDiv, transcript, transcriptIndex }) => {

        const allPageLabels = transcriptIndex.getLabels([])
        const groupedLabels = groupLabelsByNameAndTags(allPageLabels);
        const labelKeys = _.keys(groupedLabels);
        choicesRef.value = labelKeys;

        const inits = _.map(transcript.pages, (_, pageNumber) => {
          const mount = document.createElement('div')
          pageImageListDiv.appendChild(mount)
          const mountPoint = divRef()
          mountPoint.value = mount

          return usePdfPageViewer({ mountPoint, transcriptIndex, pageNumber, entryId, state })
            .then(pdfPageViewer => useLabelOverlay({ state, transcriptIndex, pdfPageViewer, pageNumber }));
        });

        return () => Promise.all(inits).then(E.right);
      }),

      TE.bind('stanzaViewers', ({ stanzaListDiv, transcript, transcriptIndex }) => {
        const inits = _.map(transcript.stanzas, (_, stanzaNumber) => {
          const mount = document.createElement('div')
          const mountPoint = divRef()
          mountPoint.value = mount
          stanzaListDiv.appendChild(mount)
          return useStanzaViewer({ mountPoint, state })
            .then(stanzaViewer => stanzaViewer.showStanza(transcriptIndex, stanzaNumber));
        });

        return () => Promise.all(inits).then(E.right);
      }),

      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
    );

    run();

    return {
      pageImageListDiv,
      stanzaListDiv,
      selectionFilterDiv,
      onItemsSelected,
      ...appStateRefs
    }
  }

})
