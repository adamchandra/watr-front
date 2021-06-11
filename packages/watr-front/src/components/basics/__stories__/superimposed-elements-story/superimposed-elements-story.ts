import {
  ref,
  Ref
} from '@nuxtjs/composition-api'

import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements'

export default {
  setup() {
    const mountPoint: Ref<HTMLDivElement|null> = ref(null)

    const run = async() => {
      const elemOverlay = await useSuperimposedElements({
        includeElems: [ElementTypes.Img, ElementTypes.Canvas, ElementTypes.Svg, ElementTypes.Text, ElementTypes.Event],
        mountPoint,
      });

      elemOverlay.setDimensions(300, 350)
    }

    run();

    return {
      mountPoint
    }
  }
}
