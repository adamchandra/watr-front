import _ from 'lodash';

import { ref, Ref } from 'vue';
import { useEventlibCore } from '~/components/basics/eventlib-core';
import { useEventlibSelect } from '~/components/basics/eventlib-select';
import { EMouseEvent, MouseHandlerInit } from '~/lib/EventlibHandlers';

import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { BBox } from '~/lib/shape-compat';

function setup() {
  const mountPoint = ref(null);
  const mouseActivity = ref('<none>');
  const mouseActivityLog = ref(['<none>']);
  let selectionRef: Ref<BBox | null> = ref(null);

  function showMouseEvent(e: EMouseEvent) {
    const etype = e.origMouseEvent.type;
    const { x, y } = e.pos;
    const xi = x.toFixed(2);
    const yi = y.toFixed(2);
    const log = `Mouse: ${etype} @${xi},  ${yi}`;
    if (etype === 'mousemove') {
      mouseActivity.value = `Mouse move: @${xi},  ${yi}`;
    } else {
      const logs = mouseActivityLog.value;
      const newLogs = logs.slice(0, 5);
      newLogs.unshift(log);
      mouseActivityLog.value = newLogs;
    }
  }

  useEventlibCore({ targetDivRef: mountPoint }).then(async (eventlibCore) => {
    const { setMouseHandlers } = eventlibCore;

    const superimposedElements = await useSuperimposedElements({ includeElems: [ElementTypes.Img, ElementTypes.Svg], mountPoint });

    const eventlibSelect = useEventlibSelect({ eventlibCore, superimposedElements });

    selectionRef = eventlibSelect.selectionRef;

    const myHandlers1: MouseHandlerInit = () => ({
      mousemove: e => showMouseEvent(e),
      mousedown: e => showMouseEvent(e),
      mouseenter: e => showMouseEvent(e),
      mouseleave: e => showMouseEvent(e),
      mouseout: e => showMouseEvent(e),
      mouseover: e => showMouseEvent(e),
      mouseup: e => showMouseEvent(e),
      click: e => showMouseEvent(e),
      dblclick: e => showMouseEvent(e),
      contextmenu: e => showMouseEvent(e),
    });

    superimposedElements.setDimensions(600, 500);
    setMouseHandlers([myHandlers1]);
  });

  return {
    mountPoint, mouseActivity, selectionRef, mouseActivityLog,
  };
}

export default { setup };
