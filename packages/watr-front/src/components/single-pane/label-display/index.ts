import _ from 'lodash';

import * as d3 from 'd3-selection';
import { SuperimposedElements } from '~/components/basics/superimposed-elements';
import { Label } from '~/lib/transcript/labels';
import {
  // dimShapesFillStroke,
  // highlightShapesFillStroke,
  labelToSVGs,
  removeShapes,
  updateSvgElement,
} from '~/lib/transcript-rendering';

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

  const defs = d3.select(svgElement)
    .append('defs')
  ;

  defs
    .append('linearGradient')
    .attr('id', 'grad1')
    .append('stop')
    .attr('offset', '0%')
    .attr('stop-opacity', '1.0')
    .attr('stop-color', 'blue')
    .append('stop')
    .attr('offset', '50%')
    .attr('stop-opacity', '0.5')
    .attr('stop-color', 'blue')
    .append('stop')
    .attr('offset', '100%')
    .attr('stop-opacity', '0.1')
    .attr('stop-color', 'blue')
  ;

  defs
    .append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', '0')
    .attr('refY', '5')
    .attr('markerWidth', '6')
    .attr('markerHeight', '6')
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 5 z')
  ;

  defs
    .append('marker')
    .attr('id', 'arrow-rear')
    .attr('viewBox', '0 0 10 10')
    .attr('refX', '0')
    .attr('refY', '5')
    .attr('markerWidth', '6')
    .attr('markerHeight', '6')
    .attr('orient', 'auto-start-reverse')
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 5 z')
  ;

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
