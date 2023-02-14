import _ from 'lodash';
import * as d3 from 'd3-selection';

import {
  ref,
  Ref,
  watch,
} from 'vue';

import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { useMeasuredTextOverlay } from '~/components/basics/measured-text-overlay';
import { awaitRef } from '~/components/basics/component-basics';
// import chroma from 'chroma-js';
import { TextStyle } from '~/lib/html-text-metrics';

export default {
  setup() {
    const mountPoint: Ref<HTMLDivElement | null> = ref(null);
    const textDimensions = ref('init');
    const textSize = ref(45);
    const inputText = ref('To To To');
    const textTop = ref(20);
    const textLeft = ref(20);
    const textFamily = ref('arial');

    awaitRef(mountPoint)
      .then(() => useSuperimposedElements({
        includeElems: [ElementTypes.Text, ElementTypes.Img, ElementTypes.Svg],
        mountPoint,
      }))
      .then(superimposedElements => {
        // Set text size, print text, overlay canvas or svg rect, print dimensions
        // Set text color, styles, ...

        const textOverlay = useMeasuredTextOverlay({ superimposedElements });

        superimposedElements.setDimensions(500, 350);

        watch([inputText, textSize, textTop, textLeft, textFamily], () => {
          const input = inputText.value;
          const inputLines = input.split('\n');
          const size = textSize.value;
          const top = textTop.value;
          const left = textLeft.value;
          const family = textFamily.value;
          const style: TextStyle = {
            size,
            style: 'normal',
            family,
            weight: 'normal',
          };

          textOverlay.clearText();

          const svgLayer = superimposedElements.overlayElements.svg!;
          const svgSelect = d3.select(svgLayer);

          _.each(inputLines, (line, linenum) => {
            const lineDimensions = textOverlay.putTextLn(style, left, top + (linenum * size), line);
            const dims = lineDimensions.charBounds;
            svgSelect
              .selectAll('.chars')
              .data(dims, (d: any) => `${d.x}x${d.y}`)
              .join('rect')
              .classed('chars', true)
              .attr('x', (d: any) => d.x)
              .attr('y', (d: any) => d.y)
              .attr('width', (d: any) => d.width)
              .attr('height', (d: any) => d.height)
              .attr('stroke', 'blue')
              .attr('stroke-width', 1)
              .attr('stroke-opacity', 0.8)
              .attr('fill', 'yellow')
              .attr('fill-opacity', 0.3)
            ;

            const dimStrs = _.map(dims, d => `[${d.x}, ${d.y}, ${d.width}, ${d.height}]`);
            const dimFmt = _.join(dimStrs, '\n');
            textDimensions.value = dimFmt;
          });
        });
      });

    return {
      mountPoint,
      textDimensions,
      textSize,
      inputText,
      textTop,
      textLeft,
      textFamily,
    };
  },
};
