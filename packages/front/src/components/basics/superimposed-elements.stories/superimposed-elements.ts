import {
  ref as deepRef,
  Ref,
} from 'vue';

import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';

export default {
  setup() {
    const mountPoint: Ref<HTMLDivElement | null> = deepRef(null);

    const run = async () => {
      const elemOverlay = await useSuperimposedElements({
        // includeElems: [ElementTypes.Canvas, ElementTypes.Svg, ElementTypes.Text, ElementTypes.Event],
        includeElems: [ElementTypes.Img, ElementTypes.Canvas, ElementTypes.Svg, ElementTypes.Text, ElementTypes.Event],
        mountPoint,
      });

      elemOverlay.setDimensions(400, 500);
    };

    run();

    return {
      mountPoint,
    };
  },
};
