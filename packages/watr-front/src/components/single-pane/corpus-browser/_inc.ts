import _ from 'lodash';

import {
  defineComponent,
  SetupContext,
  Ref,
  ref as deepRef,
} from '@nuxtjs/composition-api';

import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import { CorpusEntryList, fetchAndDecodeCorpusEntryList } from '~/lib/data-fetch';

export default defineComponent({
  components: { },

  setup(_props, _context: SetupContext) {
    const emptyEntries: CorpusEntryList = {
      entries: [],
    };

    const corpusEntries: Ref<CorpusEntryList> = deepRef(emptyEntries);

    const run = pipe(
      TE.right({}),
      TE.bind('corpusEntryList', () => fetchAndDecodeCorpusEntryList()),
      TE.map(({ corpusEntryList }) => {
        corpusEntries.value = corpusEntryList;
      }),

      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
    );

    run();

    return {
      corpusEntries,
    };
  },

});
