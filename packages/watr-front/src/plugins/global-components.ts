// Register a few commonly used components

import Vue from 'vue';

import StoryLayout from '~/layouts/story/index.vue';
Vue.component('StoryLayout', StoryLayout);

import TranscriptViewer from '~/components/multi-pane/transcript-viewer/index.vue'
Vue.component('TranscriptViewer', TranscriptViewer);

import CorpusBrowser from '~/components/single-pane/corpus-browser/index.vue'
Vue.component('CorpusBrowser', CorpusBrowser);

// import { Splitpanes, Pane } from 'splitpanes'
// Vue.component('Splitpanes', Splitpanes);
// Vue.component('Pane', Pane);
// import 'splitpanes/dist/splitpanes.css'
