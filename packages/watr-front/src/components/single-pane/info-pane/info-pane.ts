import {
  Ref,
  ref,
} from '@nuxtjs/composition-api';

import _ from 'lodash';
import { Label } from '~/lib/transcript/labels';
import { formatShape } from '~/lib/transcript/shapes';
import { LineDimensions, TextStyle } from '~/lib/html-text-metrics';
import { Promise as Bromise } from 'bluebird';
import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { deriveLabelId } from '~/lib/d3-extras';
import { useMeasuredTextOverlay } from '~/components/basics/measured-text-overlay';

type Args = {
  mountPoint: Ref<HTMLDivElement | null>;
};

type HitTarget = string | null;

export interface ReactiveTexts {
  mouseover: Ref<HitTarget>;
  mouseout: Ref<HitTarget>;
  click: Ref<HitTarget>;
  actions: Ref<string[]>;
}

export type ShowLabel = (l: Label, doFreeze: boolean) => Promise<void>;
export type PutStringLn = (str: string, id?: string) => Promise<LineDimensions>;
export type PutString = (str: string, id?: string) => Promise<LineDimensions>;
export type ClearScreen = () => Promise<void>;

export interface InfoPane {
  showLabel: ShowLabel;
  putStringLn: PutStringLn;
  putString: PutString;
  clearScreen: ClearScreen;
  reactiveTexts: ReactiveTexts;
}

export async function useInfoPane({
  mountPoint,
}: Args): Promise<InfoPane> {

  const superimposedElements = await useSuperimposedElements({
    includeElems: [ElementTypes.Text],
    mountPoint,
  });

  const mtext = useMeasuredTextOverlay({ superimposedElements });

  mountPoint.value.onresize = function (_event: UIEvent) {
    superimposedElements.setDimensions(
      mountPoint.value.clientWidth,
      mountPoint.value.clientHeight,
    );
  };

  const actions: Ref<string[]> = ref([]);

  const reactiveTexts: ReactiveTexts = {
    mouseover: ref(null),
    mouseout: ref(null),
    click: ref(null),
    actions,
  };

  const size = 9;
  const lineOffset = size + 3;
  const style: TextStyle = {
    size,
    style: 'normal',
    family: 'arial',
    weight: 'normal',
  };
  const textLeftInit = 4;
  const textTopInit = 4;
  let textLeftCurr = textLeftInit;
  let textTopCurr = textTopInit;


  // TODO move this showLabel function out of InfoPane class
  const showLabel = async (l: Label, doFreeze: boolean) => {
    await clearScreen();
    if (doFreeze) {
      actions.value.push('freeze');
    }
    const lstrings = labelToStringWithIds(l, 0, []);

    const lineDimensions = await putStringLn('>>>== Label (Click here to clear) ==');
    const { lineDiv } = lineDimensions;
    lineDiv.classList.add('hoverable');
    lineDiv.onclick = function () {
      actions.value = actions.value.filter(s => s !== 'freeze');
      clearScreen();
    };

    await Bromise.mapSeries(lstrings, async ([lstr, id]) => {
      await putStringLn(lstr, id);
      return Promise.resolve(undefined);
    });

    await putStringLn('<<<<==');
  };
  const putStringLn = async (str: string, id?: string): Promise<LineDimensions> => {
    const x = textLeftCurr;
    const y = textTopCurr;
    textTopCurr = textTopCurr + lineOffset;
    textLeftCurr = textLeftInit;
    const lineDimensions = await _putString(x, y, str, id);
    return lineDimensions;
  };

  const putString = async (str: string, id?: string): Promise<LineDimensions> => {
    const x = textLeftCurr;
    const lineDimensions = await _putString(x, textTopCurr, str, id);
    textLeftCurr = textLeftCurr + lineDimensions.width;
    return lineDimensions;
  };

  const _putString = async (x: number, y: number, str: string, id?: string): Promise<LineDimensions> => {
    const lineDimensions = mtext.putTextLn(style, x, y, str);
    if (id !== undefined) {
      const { lineDiv } = lineDimensions;

      lineDiv.classList.add('hoverable');
      lineDiv.onmouseover = function () {
        lineDiv.classList.add('hovering');
        reactiveTexts.mouseover.value = id;
      };
      lineDiv.onmouseout = function () {
        lineDiv.classList.remove('hovering');
        reactiveTexts.mouseout.value = id;
      };

      lineDiv.onclick = function () {
        reactiveTexts.click.value = id;
      };
    }
    return lineDimensions;
  };


  const clearScreen = async () => {
    await mtext.clearText();
    textTopCurr = textTopInit;
    textLeftCurr = textLeftInit;
  };

  return {
    showLabel,
    putString,
    putStringLn,
    clearScreen,
    reactiveTexts,
  };
}

type TupleStrStr = readonly [string, string];

function labelToStringWithIds(label: Label, level: number, _parentClasses: string[]): TupleStrStr[] {

  const allProps: Record<string, string[]> = label?.props || {};

  const classStrings = allProps.class || [];

  const kvalStrings = _.join(_.map(
    _.toPairs(allProps), ([key, value]) => {
      return `${key}=${_.join(value, ', ')}`;
    }), '; ');


  const localClasses = _.filter(classStrings, c => c.startsWith('='))
    .map(c => c.substring(1));


  const propogatedClasses = _.filter(classStrings, c => c.startsWith('>'))
    .map(c => c.substring(1));


  const lpad: string = _.map(_.range(level + 1), () => '   ').join('');

  const childStrings: TupleStrStr[] = label.children === undefined ? [] :
    _.flatMap(label.children, c => labelToStringWithIds(c, level + 1, propogatedClasses).map(([s, id]) => [lpad + s, id]));

  const localShapes = _.flatMap(label.range, range => {
    if (range.unit === 'shape') {
      return [formatShape(range.at)];
    }
    return [];
  });
  const shapestr = localShapes.join(', ');

  const header = `${label.name} [${shapestr}] ${kvalStrings} .${localClasses.join('.')} >${propogatedClasses.join('.')}`;
  const labelId = deriveLabelId(label);
  const ret: TupleStrStr = [header, labelId];

  return _.concat([ret], childStrings);
}
