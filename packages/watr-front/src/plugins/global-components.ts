// Register a few commonly used components


import StoryLayout from '~/layouts/story/index.vue';
import TranscriptViewer from '~/components/multi-pane/transcript-viewer/index.vue';
import CorpusBrowser from '~/components/single-pane/corpus-browser/index.vue';


export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('StoryLayout', StoryLayout);
    nuxtApp.vueApp.component('TranscriptViewer', TranscriptViewer);
    nuxtApp.vueApp.component('CorpusBrowser', CorpusBrowser);

// import { Splitpanes, Pane } from 'splitpanes'
// Vue.component('Splitpanes', Splitpanes);
// Vue.component('Pane', Pane);
// import 'splitpanes/dist/splitpanes.css'

// Install Composition Api

// import Vue from 'vue'
// import VueCompositionApi from 'vue';
// Vue.use(VueCompositionApi);
})
