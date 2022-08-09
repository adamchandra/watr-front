// Register a few commonly used components

import Vue from 'vue';

import StoryLayout from '~/layouts/story/index.vue';

import TranscriptViewer from '~/components/multi-pane/transcript-viewer/index.vue';

import CorpusBrowser from '~/components/single-pane/corpus-browser/index.vue';

Vue.component('StoryLayout', StoryLayout);
Vue.component('TranscriptViewer', TranscriptViewer);
Vue.component('CorpusBrowser', CorpusBrowser);

// import { Splitpanes, Pane } from 'splitpanes'
// Vue.component('Splitpanes', Splitpanes);
// Vue.component('Pane', Pane);
// import 'splitpanes/dist/splitpanes.css'

// Install Composition Api

// import Vue from 'vue'
// import VueCompositionApi from '@nuxtjs/composition-api';
// Vue.use(VueCompositionApi);
