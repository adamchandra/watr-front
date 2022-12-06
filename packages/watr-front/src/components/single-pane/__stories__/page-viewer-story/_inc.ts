import {
  ref as deepRef,
  Ref,
} from 'vue';

import _ from 'lodash';

import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import { TranscriptIndex } from '~/lib/transcript/transcript-index';
import { usePdfPageViewer } from '~/components/single-pane/page-viewer';
import { fetchAndDecodeTranscript } from '~/lib/data-fetch';
import { getURLQueryParam } from '~/lib/url-utils';
import { useLabelOverlay } from '../../label-overlay';
import { Label } from '~/lib/transcript/labels';

export default {
  setup() {
    const mountPoint: Ref<HTMLDivElement | null> = deepRef(null);
    const showAllLabels: Ref<boolean> = deepRef(false);

    const entryId = getURLQueryParam('id') || 'missing-id';
    const pageNumber = 1;

    const uri = window.location.search.slice(1);
    const params = new URLSearchParams(uri);
    console.log('id', params.get('id'));


    // const pageLabelRefs: Array<Ref<Label[]>> = [];
    const pageLabelRef: Ref<Label[]> = deepRef([]);
    // console.log('pageLabelRefs', pageLabelRefs);

    const run = pipe(
      TE.right({ entryId }),
      TE.bind('transcript', ({ entryId }) => fetchAndDecodeTranscript(entryId)),
      TE.bind('transcriptIndex', ({ transcript }) => TE.right(new TranscriptIndex(transcript))),
      TE.bind('pdfPageViewer', ({ transcriptIndex }) => () => usePdfPageViewer({
        mountPoint,
        transcriptIndex,
        pageNumber,
        entryId,
      }).then(x => E.right(x))),

      TE.bind('labelOverlay', ({ pdfPageViewer, transcriptIndex }) => () => useLabelOverlay({
        pdfPageViewer,
        transcriptIndex,
        pageNumber,
        // pageLabelRef: pageLabelRefs[pageNumber],
        pageLabelRef,
        showAllLabels,
      }).then(x => E.right(x))),

      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
    );

    run();

    return {
      mountPoint,
    };
  },
};
