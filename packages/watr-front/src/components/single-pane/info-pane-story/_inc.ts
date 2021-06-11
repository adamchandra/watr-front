import _ from 'lodash'

import {
  defineComponent,
  SetupContext,
  ref,
  watch,
} from '@nuxtjs/composition-api'

import { divRef } from '~/lib/vue-composition-lib'

import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { useInfoPane } from '../info-pane';

export default defineComponent({
  components: {},

  setup(_props, _context: SetupContext) {
    const infoPaneDiv = divRef();

    const inputText = ref('');

    const run = pipe(
      TE.right({}),
      // TE.bind('infoPaneDiv', ({ }) => awaitRefTask(infoPaneDivRef)),
      TE.bind('infoPane', ({ }) => () => useInfoPane({ mountPoint: infoPaneDiv }).then(E.right)),
      TE.map(({ infoPane }) => {
        const {
          putString,
          putStringLn,
          clearScreen,
          showLabel
        } = infoPane;

        putStringLn('Hello From Storyland!');

        watch(inputText, (text) => {
          if (text.endsWith('clear')){
            inputText.value = '';
            clearScreen();
          }
          if (text.endsWith('.')){
            inputText.value = '';
            putStringLn(text);
          }
          if (text.endsWith(' ')){
            inputText.value = '';
            putString(text);
          }
        });

      })
    );

    run();

    return {
      infoPaneDiv,
      inputText
    };
  }

})
