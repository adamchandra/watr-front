import _ from 'lodash';

import {
  defineComponent,
  SetupContext,
  provide,
  Ref,
  ref as deepRef,
  shallowRef,
} from 'vue';

import * as VC from 'vue';

import { pipe } from 'fp-ts/lib/function';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { Radix } from '@watr/commonlib-shared';
import { divRef } from '~/lib/vue-composition-lib';
import { awaitRefTask } from '~/components/basics/component-basics';
import { usePdfPageViewer } from '~/components/single-pane/page-viewer';
import { useStanzaViewer } from '~/components/single-pane/stanza-viewer';
import { TranscriptIndex } from '~/lib/transcript/transcript-index';
import { Label, PageRange, Range } from '~/lib/transcript/labels';

import NarrowingFilter from '~/components/single-pane/narrowing-filter/index.vue';
import {
  ProvidedChoices,
} from '~/components/single-pane/narrowing-filter/_inc';

import { fetchAndDecodeTranscript } from '~/lib/data-fetch';
import { useLabelOverlay } from '~/components/single-pane/label-overlay';
import { getQueryParam } from '~/lib/url-utils';

import SplitScreen from '~/components/basics/splitscreen/index.vue';
import { InfoPane, useInfoPane } from '~/components/single-pane/info-pane/info-pane';
import { getLabelProp } from '~/lib/transcript/tracelogs';
import { createDisplayTree, TreeNode } from '~/components/single-pane/narrowing-filter/display-tree';

interface AppState {
  showStanzaPane: boolean;
  showPageImagePane: boolean;
  showPageOverlays: boolean;
}

const TETap = <E, A>(tapf: (a: A) => unknown | Promise<unknown>) => TE.chain<E, A, A>((a: A) => () => Promise.resolve(tapf(a))
  .then(() => E.right(a)));

function isPageRange(r: Range): r is PageRange {
  return r.unit === 'page';
}

function getLabelPageNumber(l: Label): number {
  const pageRange = _.find(l.range, isPageRange);
  if (pageRange === undefined || pageRange === null) return -1;
  return pageRange.at;
}

export default defineComponent({
  components: { NarrowingFilter, SplitScreen },

  setup(_props, _context: SetupContext) {
    const pageImageListDiv = divRef();
    const stanzaListDiv = divRef();
    const selectionFilterDiv = divRef();
    const infoPaneDiv = divRef();

    const showAllLabels: Ref<boolean> = deepRef(true);

    type DisplayTreeT = Radix<TreeNode<Label[]>>;
    const choicesRef: Ref<DisplayTreeT | null> = shallowRef(null);
    provide(ProvidedChoices, choicesRef);

    const pageLabelRefs: Array<Ref<Label[]>> = [];

    const onItemsSelected = (selection: Label[]) => {
      // const labels = _.flatMap(selection, choice => _.map(choice.value, l => [l, getLabelPageNumber(l)] as const));
      const labels = _.map(selection, l => [l, getLabelPageNumber(l)] as const);
      const grouped = _.groupBy(labels, l => l[1]);
      const pageNumbers = _.keys(grouped);
      _.each(pageNumbers, p => {
        const page = parseInt(p);
        const group = grouped[page];
        const glabels = _.map(group, g => g[0]);
        pageLabelRefs[page].value = VC.markRaw(glabels);
      });
    };

    const onItemsReset = () => {
      _.each(pageLabelRefs, (refs) => {
        refs.value = [];
      });
    };

    const appStateRef: VC.UnwrapRef<AppState> = VC.reactive({
      showStanzaPane: true,
      showPageImagePane: true,
      showPageOverlays: true,
    });

    const appStateRefs: VC.ToRefs<AppState> = VC.toRefs(appStateRef);

    // const asdf: TE.TaskEither<string, InfoPane>  = () => useInfoPane({ mountPoint: infoPaneDiv }).then(s => E.right(s));

    const run = pipe(
      TE.right({}),
      TE.bind('entryId', ({ }) => TE.fromEither(getQueryParam('id'))),
      TE.bind('infoPane', ({ }) => () => useInfoPane({ mountPoint: infoPaneDiv }).then(E.right)),
      TETap(({ infoPane, entryId }) => infoPane.putStringLn(`entry: ${entryId}`)),
      TE.bind('pageImageListDiv', ({ }) => awaitRefTask(pageImageListDiv)),
      TE.bind('stanzaListDiv', ({ }) => awaitRefTask(stanzaListDiv)),
      TE.bind('selectionFilterDiv', ({ }) => awaitRefTask(selectionFilterDiv)),
      TE.bind('transcript', ({ entryId }) => fetchAndDecodeTranscript(entryId)),

      TETap(({ infoPane }) => infoPane.putStringLn('fetched transcript')),
      TE.bind('transcriptIndex', ({ transcript }) => TE.right(new TranscriptIndex(transcript))),
      TETap(({ infoPane }) => infoPane.putStringLn('indexed transcript')),

      TE.bind('pageViewers', ({
        entryId, pageImageListDiv, transcript, transcriptIndex, infoPane,
      }) => {
        const allPageLabels = transcriptIndex.getLabels([]);


        const displayTree = createDisplayTree<Label>(
          allPageLabels,
          (label: Label) => _.concat(getLabelProp(label, 'outline'), `LB.${label.name}`),
        );
        VC.markRaw(displayTree);

        choicesRef.value = displayTree;

        pageLabelRefs.push(..._.map(transcript.pages, () => {
          const pageLabelRef: Ref<Label[]> = shallowRef([]);
          return pageLabelRef;
        }));

        const inits = _.map(transcript.pages, async (_, pageNumber) => {
          const mount = document.createElement('div');
          pageImageListDiv!.append(mount);
          const mountPoint = divRef();
          mountPoint.value = mount;

          return usePdfPageViewer({
            mountPoint, transcriptIndex, pageNumber, entryId,
          })
            .then(pdfPageViewer => useLabelOverlay({
              transcriptIndex,
              pdfPageViewer,
              pageNumber,
              pageLabelRef: pageLabelRefs[pageNumber],
              infoPane,
              showAllLabels,
            }));
        });

        return () => Promise.all(inits).then(E.right);
      }),

      TETap(({ infoPane }) => infoPane.putStringLn('initialized page viewers')),
      TE.bind('stanzaViewers', ({ stanzaListDiv, transcript, transcriptIndex }) => {
        const inits = _.map(transcript.stanzas, async (_, stanzaNumber) => {
          const mount = document.createElement('div');
          const mountPoint = divRef();
          mountPoint.value = mount;
          stanzaListDiv!.append(mount);
          return useStanzaViewer({ mountPoint })
            .then(stanzaViewer => stanzaViewer.showStanza(
              transcriptIndex,
              stanzaNumber,
              {
                indexGranularity: 'none',
                lineBegin: 0,
                lineCount: 10,
              },
            ));
        });

        return () => Promise.all(inits).then(E.right);
      }),

      TETap(({ infoPane }) => infoPane.putStringLn('initialized stanza viewers')),
      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
    );

    run();

    return {
      pageImageListDiv,
      stanzaListDiv,
      selectionFilterDiv,
      infoPaneDiv,
      onItemsSelected,
      onItemsReset,
      showAllLabels,
      ...appStateRefs,
    };
  },
});
