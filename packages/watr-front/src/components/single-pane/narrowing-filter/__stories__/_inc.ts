import _ from 'lodash'

import { defineComponent, provide, Ref, shallowRef } from '@nuxtjs/composition-api'
import NarrowingFilter from '../index.vue'
import { ProvidedChoices  } from '../_inc'
import { createLabelRadix,  LabelSelection } from '~/lib/transcript/tracelogs'
import { fetchAndDecodeTranscript } from '~/lib/data-fetch'
import { TranscriptIndex } from '~/lib/transcript/transcript-index';

import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';

import {
  Radix,
} from '@watr/commonlib-shared';

export default defineComponent({
  components: {
    NarrowingFilter
  },
  setup() {

    const choicesRef: Ref<Radix<LabelSelection> | null> = shallowRef(null);

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
        const allPageLabels = transcriptIndex.getLabels([]);
        const labelRadix = createLabelRadix(allPageLabels);
        console.log('labelRadix', labelRadix);

        choicesRef.value = labelRadix;
      }),
      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
    )();

    return {
      onItemsSelected,
      choicesRef,
    }
  }
})
