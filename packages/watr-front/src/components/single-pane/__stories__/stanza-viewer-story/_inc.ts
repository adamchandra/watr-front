import _ from 'lodash';

import { defineComponent } from '@nuxtjs/composition-api'
import { useStanzaViewer } from '~/components/single-pane/stanza-viewer'
import { initState } from '~/components/basics/component-basics'
import { divRef } from '~/lib/vue-composition-lib'
import { pipe } from 'fp-ts/lib/function';
import { TranscriptIndex } from '~/lib/transcript/transcript-index'
import { getURLQueryParam } from '~/lib/url-utils'
import * as TE from 'fp-ts/lib/TaskEither';
import { fetchAndDecodeTranscript } from '~/lib/data-fetch'

export default defineComponent({
  components: {},
  setup() {
    const state = initState()
    const mountPoint = divRef()

    useStanzaViewer({ mountPoint, state }).then((stanzaViewer) => {
      const { showStanza } = stanzaViewer;

      const entryId = getURLQueryParam('id') || 'missing-id';

      const run = pipe(
        TE.right({ entryId }),
        TE.bind('transcript', ({ entryId }) => fetchAndDecodeTranscript(entryId)),
        TE.bind('transcriptIndex', ({ transcript }) => TE.right(new TranscriptIndex(transcript))),
        TE.mapLeft(errors => {
          _.each(errors, error => console.log('error', error));
          return errors;
        }),
        TE.map(({ transcriptIndex }) => {
          showStanza(transcriptIndex, 0);
        })

      );
      return run();
    });

    return {
      mountPoint
    }
  }
})
