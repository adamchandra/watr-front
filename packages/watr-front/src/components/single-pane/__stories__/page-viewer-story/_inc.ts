import {
  ref,
  Ref
} from '@vue/composition-api'

import _ from 'lodash';
import { initState } from '~/components/basics/component-basics'
import { usePdfPageViewer } from '~/components/single-pane/page-viewer'
import { TranscriptIndex } from '~/lib/transcript/transcript-index';

import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import { fetchAndDecodeTranscript } from '~/lib/data-fetch'
import { getURLQueryParam } from '~/lib/url-utils';
import { useLabelOverlay } from '../../label-overlay';
import { Label } from '~/lib/transcript/labels';

export default {
  setup() {
    const state = initState()
    const mountPoint: Ref<HTMLDivElement | null> = ref(null)

    const entryId = getURLQueryParam('id') || 'missing-id';
    const pageNumber = 1;

    let uri = window.location.search.substring(1);
    let params = new URLSearchParams(uri);
    console.log('id', params.get('id'));

    const pageLabelRefs: Array<Ref<Label[]>> = [];

    const run = pipe(
      TE.right({ entryId }),
      TE.bind('transcript', ({ entryId }) => fetchAndDecodeTranscript(entryId)),
      TE.bind('transcriptIndex', ({ transcript }) => TE.right(new TranscriptIndex(transcript))),
      TE.bind('pdfPageViewer', ({ transcriptIndex }) => () => usePdfPageViewer({
        mountPoint,
        state,
        transcriptIndex,
        pageNumber,
        entryId,
      }).then(x => E.right(x))),


      TE.bind('labelOverlay', ({ pdfPageViewer, transcriptIndex }) => () => useLabelOverlay({
        pdfPageViewer,
        transcriptIndex,
        pageNumber,
        pageLabelRef: pageLabelRefs[pageNumber],
        state
      }).then(x => E.right(x))),

      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
    );

    run();

    return {
      mountPoint
    }
  }
}
