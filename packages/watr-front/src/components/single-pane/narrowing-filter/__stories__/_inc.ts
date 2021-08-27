import _ from 'lodash'

import { defineComponent, provide, Ref, shallowRef } from '@nuxtjs/composition-api'
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

    const choicesRef: Ref<Array<NarrowingChoice<Label[]>> | null> = shallowRef(null);

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
        const groupedLabels: Map<string, Map<string, Label[]>> =
          groupLabelsByNameAndTags(allPageLabels);

        console.log('groupedLabels', groupedLabels);

        const outlineKeys = Array.from(groupedLabels.keys());
        console.log('outlineKeys', outlineKeys);

        const choices: Array<NarrowingChoice<Label[]>> = _.map(outlineKeys, (outlineKey, index) => {
          const innerMap: Map<string, Label[]> = groupedLabels.get(outlineKey);
          console.log('outlineKey', outlineKey);

          const innerTags = Array.from(innerMap.keys());
          const innerTagKey = _.join(innerTags, ' ');
          const innerLabels = Array.from(innerMap.values());
          const labelList = _.flatten(innerLabels);

          return {
            index,
            display: outlineKey,
            tags: innerTagKey,
            value: labelList
          };
        });
        console.log('choices', choices);
        choicesRef.value = choices;
      }),
      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
    )();

    return {
      onItemsSelected,
      choicesRef,
      // providedChoicesTrigger
    }
  }
})
