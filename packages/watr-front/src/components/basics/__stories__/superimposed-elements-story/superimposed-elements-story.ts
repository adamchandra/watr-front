import {
  ref,
  Ref
} from '@nuxtjs/composition-api'

import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements'
import { initState } from '~/components/basics/component-basics'

export default {
  setup() {
    const state = initState()
    const mountPoint: Ref<HTMLDivElement|null> = ref(null)

    const run = async() => {
      const elemOverlay = await useSuperimposedElements({
        includeElems: [ElementTypes.Img, ElementTypes.Canvas, ElementTypes.Svg, ElementTypes.Text],
        mountPoint,
        state
      });

      elemOverlay.setDimensions(300, 350)

    }

    run();

    return {
      mountPoint
    }
  }
}
