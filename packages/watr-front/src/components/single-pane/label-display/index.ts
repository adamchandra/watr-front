import _ from 'lodash';

import { SuperimposedElements } from '~/components/basics/superimposed-elements';
import { Label } from '~/lib/transcript/labels';
import {
    initSVGDefs,
  labelToSVGs,
  removeShapes,
  updateSvgElement,
} from '~/lib/transcript/label-to-svg';

type Args = {
  superimposedElements: SuperimposedElements
};

export interface LabelDisplay {
  showLabel(l: Label): void;
  clearAll(): void;
}


export async function useLabelDisplay({
  superimposedElements,
}: Args): Promise<LabelDisplay> {
  const svgElement = superimposedElements.overlayElements.svg;

  initSVGDefs(svgElement);

  function showLabel(l: Label): void {
    const svgs = labelToSVGs(l, [], false);
    updateSvgElement(svgElement, svgs);
  }

  function clearAll(): void {
    removeShapes(svgElement);
  }

  return {
    showLabel,
    clearAll,
  };
}
