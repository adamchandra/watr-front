import _ from 'lodash';

import {
  defineComponent, provide, Ref, shallowRef, markRaw,
} from '@nuxtjs/composition-api';
import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import {
  Radix,
} from '@watr/commonlib-shared';
import NarrowingFilter from '../index.vue';
import { ProvidedChoices } from '../_inc';
import { getLabelProp } from '~/lib/transcript/tracelogs';
import { fetchAndDecodeTranscript } from '~/lib/data-fetch';
import { TranscriptIndex } from '~/lib/transcript/transcript-index';

import { createDisplayTree, TreeNode } from '../display-tree';
import { Label } from '~/lib/transcript/labels';

export default defineComponent({
  components: {
    NarrowingFilter,
  },
  setup() {
    type DisplayTreeT = Radix<TreeNode<Label[]>>;
    const choicesRef: Ref<DisplayTreeT | null > = shallowRef(null);
    const selectionRef: Ref<Label[]> = shallowRef([]);

    provide(ProvidedChoices, choicesRef);

    const onItemsSelected = (selection: any[]) => {
      console.log('we got items!', selection);
      markRaw(selection);
      selectionRef.value = selection;
    };

    const entryId = 'austenite.pdf.d';

    pipe(
      TE.right({ entryId }),
      TE.bind('transcript', ({ entryId }) => fetchAndDecodeTranscript(entryId)),
      TE.bind('transcriptIndex', ({ transcript }) => TE.right(new TranscriptIndex(transcript))),
      TE.map(({ transcriptIndex }) => {
        const allPageLabels = transcriptIndex.getLabels([]);
        const displayTree = createDisplayTree<Label>(
          allPageLabels,
          (label: Label) => _.concat(getLabelProp(label, 'outline'), `LB.${label.name}`),
        );

        markRaw(displayTree);

        choicesRef.value = displayTree;
      }),
      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
    )();

    return {
      onItemsSelected,
      choicesRef,
      selectionRef,
    };
  },
});
