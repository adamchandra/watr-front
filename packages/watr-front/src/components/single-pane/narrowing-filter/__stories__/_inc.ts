import _ from 'lodash'

import { ref, defineComponent, provide, Ref } from '@vue/composition-api'
import NarrowingFilter from '../index.vue'
import { ProvidedChoices, useNarrowingFilter } from '../_inc'
import { groupLabelsByNameAndTags } from '~/lib/transcript/tracelogs'
import { fetchAndDecodeTranscript } from '~/lib/data-fetch'
import { TranscriptIndex } from '~/lib/transcript/transcript-index';

import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';

export default defineComponent({
  components: {
    NarrowingFilter
  },
  setup() {
    const choicesRef: Ref<Array<string> | null> = ref(null)

    provide(ProvidedChoices, choicesRef)

    const onItemsSelected = (selection: any[]) => {
      console.log('we got items!', selection)
    }

    const entryId = 'austenite.pdf.d';

    const run = pipe(
      TE.right({ entryId }),
      TE.bind('transcript', ({ entryId }) => fetchAndDecodeTranscript(entryId)),
      TE.bind('transcriptIndex', ({ transcript }) => TE.right(new TranscriptIndex(transcript))),
      TE.map(({ transcriptIndex }) => {
        const narrowingFilter = useNarrowingFilter({ transcriptIndex });
        // const allPageLabels = transcriptIndex.getLabels([])
        // const groupedLabels = groupLabelsByNameAndTags(allPageLabels);
        // const labelKeys = _.keys(groupedLabels);
        // choicesRef.value = labelKeys;
      }),
      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
    );

    run().then(() => {
      console.log('ran fully');
    });

    return {
      onItemsSelected,
      choicesRef
    }
  }
})
