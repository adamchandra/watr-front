import _ from 'lodash';

import {
  defineComponent,
  SetupContext,
} from 'vue';

import { Splitpanes, Pane } from 'splitpanes';
// import 'splitpanes/dist/splitpanes.css'

export default defineComponent({
  components: { Pane, Splitpanes },
  props: {
    rightSidePanes: Number,
  },

  setup(_props, _context: SetupContext) {
    return {};
  },
});
