import _ from 'lodash';

import { defineComponent } from '@nuxtjs/composition-api'
import { useStanzaViewer } from '~/components/single-pane/stanza-viewer'
import { divRef } from '~/lib/vue-composition-lib'
import { pipe } from 'fp-ts/lib/function';
import { TranscriptIndex } from '~/lib/transcript/transcript-index'
import { getURLQueryParam } from '~/lib/url-utils'
import * as TE from 'fp-ts/lib/TaskEither';
import { fetchAndDecodeTranscript } from '~/lib/data-fetch'

export default defineComponent({
  components: {},
  setup() {
    const mountPoint = divRef()

    useStanzaViewer({ mountPoint }).then((stanzaViewer) => {
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
          // TODO test out various indexGranularity values
          showStanza(transcriptIndex, 0, {
            indexGranularity: 'none',
            // lineBegin: 0,
            // lineCount: 20
          });
        })

      );
      return run();
    });

    return {
      mountPoint
    }
  }
})
