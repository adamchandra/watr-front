import _ from 'lodash';

import {
  Ref,
  watch,
  ref as deepRef,
} from 'vue';

import { awaitRef } from '~/components/basics/component-basics';

export const enum ElementTypes {
  Canvas, Svg, Text, Img, Event,
}

export interface OverlayElements {
  img?: HTMLImageElement;
  canvas?: HTMLCanvasElement;
  svg?: SVGElement;
  textDiv?: HTMLDivElement;
  eventDiv?: HTMLDivElement;
}

export interface SuperimposedElements {
  overlayElements: OverlayElements;
  setDimensions: (width: number, height: number) => void;
  dimensions: Readonly<Ref<[number, number]>>;
  setImageSource: (src: string) => void;
}

type Args = {
  mountPoint: Ref<HTMLDivElement | null>;
  includeElems: ElementTypes[];
};

export async function useSuperimposedElements({
  mountPoint, includeElems,
}: Args): Promise<SuperimposedElements> {
  const usingLayer: (et: ElementTypes) => boolean = (et) => includeElems.includes(et);

  const overlayElements: OverlayElements = {};

  if (usingLayer(ElementTypes.Event)) {
    const el = overlayElements.eventDiv = document.createElement('div');
    el.classList.add('layer');
    el.classList.add('event-layer');
  }

  if (usingLayer(ElementTypes.Img)) {
    const el = overlayElements.img = document.createElement('img');
    el.classList.add('layer');
  }
  if (usingLayer(ElementTypes.Canvas)) {
    const el = overlayElements.canvas = document.createElement('canvas');
    el.classList.add('layer');
  }
  if (usingLayer(ElementTypes.Svg)) {
    const el = overlayElements.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    el.classList.add('layer');
  }
  if (usingLayer(ElementTypes.Text)) {
    const el = overlayElements.textDiv = document.createElement('div');
    el.classList.add('layer', 'text-layer');
  }

  const dimensions: Ref<[number, number]> = deepRef([200, 500] as [number, number]);

  const placeholderImage = (w: number, h: number) => `https://via.placeholder.com/${w}x${h}`;
  const imgElemSource: Ref<string | null> = deepRef(null);

  const overlayContainer = await awaitRef(mountPoint);

  overlayContainer.classList.add('layers');
  const {
    img, canvas, svg, textDiv, eventDiv,
  } = overlayElements;

  if (img) {
    img.addEventListener('load', () => {
      const { width, height } = img;
      console.log(`addEventListen(${width}, ${height})`)
      dimensions.value = [width, height];
    });
    overlayContainer.append(img);
  }
  if (canvas) {
    overlayContainer.append(canvas);
  }
  if (svg) {
    overlayContainer.append(svg);
  }
  if (textDiv) {
    overlayContainer.append(textDiv);
  }
  if (eventDiv) {
    overlayContainer.append(eventDiv);
  }

  if (img) {
    watch(imgElemSource, (src) => {
      if (src) {
        img.src = src;
      }
    });
  }

  watch(dimensions, ([width, height]) => {
    const w = `${width}px`;
    const h = `${height}px`;

    console.log(`setting w/h=${w}, ${h}`)
    overlayContainer.style.width = w;
    overlayContainer.style.height = h;
    if (img) {
      if (imgElemSource.value) {
        img.width = width;
        img.height = height;
      } else {
        img.src = placeholderImage(width, height);
      }
    }
    if (canvas) {
      canvas.setAttribute('width', w);
      canvas.setAttribute('height', h);
    }
    if (svg) {
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
    }
    if (textDiv) {
      textDiv.style.width = w;
      textDiv.style.height = h;
    }
    if (eventDiv) {
      eventDiv.style.width = w;
      eventDiv.style.height = h;
    }
  });

  function setImageSource(src: string) {
    imgElemSource.value = src;
  }

  function setDimensions(width: number, height: number) {
    dimensions.value = [width, height];
  }

  return {
    overlayElements,
    setDimensions,
    dimensions,
    setImageSource,
  };
}
