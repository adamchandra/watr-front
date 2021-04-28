import _ from 'lodash'

import { ref, defineComponent, provide, Ref } from '@vue/composition-api'
import NarrowingFilter from '../index.vue'
import { NarrowingChoice, ProvidedChoices  } from '../_inc'
import { groupLabelsByNameAndTags } from '~/lib/transcript/tracelogs'
import { fetchAndDecodeTranscript } from '~/lib/data-fetch'
import { TranscriptIndex } from '~/lib/transcript/transcript-index';
import { Label } from '~/lib/transcript/labels'

import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';

export default defineComponent({
  components: {
    NarrowingFilter
  },
  setup() {
    const choicesRef: Ref<Array<NarrowingChoice<Label[]>> | null> = ref(null)

    provide(ProvidedChoices, choicesRef)

    const onItemsSelected = (selection: any[]) => {
      console.log('we got items!', selection)
    }

    const entryId = 'austenite.pdf.d';


    pipe(
      TE.right({ entryId }),
      TE.bind('transcript', ({ entryId }) => fetchAndDecodeTranscript(entryId)),
      TE.bind('transcriptIndex', ({ transcript }) => TE.right(new TranscriptIndex(transcript))),
      TE.map(({ transcriptIndex }) => {
        const allPageLabels = transcriptIndex.getLabels([])
        const groupedLabels = groupLabelsByNameAndTags(allPageLabels);
        const labelKeys = _.keys(groupedLabels);
        const choices = _.map(labelKeys, (key, index) => ({
          index, key, value: groupedLabels[key]
        }));
        choicesRef.value = choices;
      }),
      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
    )();

    return {
      onItemsSelected,
      choicesRef
    }
  }
})
