import {
  Ref,
  ref
} from '@nuxtjs/composition-api'

import _ from 'lodash';
import { Label } from '~/lib/transcript/labels';
import { formatShape } from '~/lib/transcript/shapes';
import { useMeasuredTextOverlay } from '../basics/measured-text-overlay';
import { LineDimensions, TextStyle } from '~/lib/html-text-metrics';
import { Promise as Bromise } from 'bluebird';
import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { deriveLabelId } from '~/lib/d3-extras';


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

export type ShowLabel = (l: Label) => Promise<void>;
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
  mountPoint
}: Args): Promise<InfoPane> {

  const superimposedElements = await useSuperimposedElements({
    includeElems: [ElementTypes.Text],
    mountPoint
  });

  const mtext = useMeasuredTextOverlay({ superimposedElements });
  superimposedElements.setDimensions(800, 1000);
  const actions: Ref<string[]> = ref([]);

  const reactiveTexts: ReactiveTexts = {
    mouseover: ref(null),
    mouseout: ref(null),
    click: ref(null),
    actions,
  };

  const size = 13;
  const style: TextStyle = {
    size,
    style: 'normal',
    family: 'arial',
    weight: 'normal'
  };
  const textLeftInit = 4;
  const textTopInit = 4;
  let textLeftCurr = textLeftInit;
  let textTopCurr = textTopInit;


  const showLabel = async (l: Label) => {
    await clearScreen();
    actions.value.push('freeze');
    const lstrings = labelToStringWithIds(l, 0, []);

    const lineDimensions = await putStringLn('>>>== Label ==');
    const { lineDiv } = lineDimensions;
    lineDiv.classList.add('hoverable');
    lineDiv.onclick = function() {
      actions.value = actions.value.filter(s => s !== 'freeze');
    }

    await Bromise.mapSeries(lstrings, async ([lstr, id]) => {
      await putStringLn(lstr, id);
      return Promise.resolve(undefined);
    });

    await putStringLn('<<<<==');
  }
  const putStringLn = async (str: string, id?: string): Promise<LineDimensions> => {
    const lineDimensions = await putString(str, id);
    textTopCurr = textTopCurr + size;
    textLeftCurr = textLeftInit;
    return lineDimensions;
  }

  const putString = async (str: string, id?: string): Promise<LineDimensions> => {
    const lineDimensions = mtext.putTextLn(style, textLeftCurr, textTopCurr, str);
    textLeftCurr = textLeftCurr + lineDimensions.width;
    if (id !== undefined) {
      const { lineDiv } = lineDimensions;

      lineDiv.classList.add('hoverable');
      lineDiv.onmouseover = function() {
        lineDiv.classList.add('hovering');
        reactiveTexts.mouseover.value = id;
      };
      lineDiv.onmouseout = function() {
        lineDiv.classList.remove('hovering');
        reactiveTexts.mouseout.value = id;
      };

      lineDiv.onclick = function() {
        reactiveTexts.click.value = id;
      }
    }
    return lineDimensions;
  }

  const clearScreen = async () => {
    await mtext.clearText();
    textTopCurr = textTopInit;
    textLeftCurr = textLeftInit;
  }

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

  const classStrings = label?.props?.['class'] || [];


  const localClasses = _.filter(classStrings, c => c.startsWith('='))
    .map(c => c.substring(1))


  const propogatedClasses = _.filter(classStrings, c => c.startsWith('>'))
    .map(c => c.substring(1))


  const lpad: string = _.map(_.range(level + 1), () => '   ').join('');

  const childStrings: TupleStrStr[] = label.children === undefined ? [] :
    _.flatMap(label.children, c => labelToStringWithIds(c, level + 1, propogatedClasses).map(([s, id]) => [lpad + s, id]));

  const localShapes = _.flatMap(label.range, range => {
    if (range.unit === 'shape') {
      return [formatShape(range.at)];
    }
    return [];
  });
  const shapestr = localShapes.join(', ')

  const header = `${label.name} [${shapestr}] .${localClasses.join('.')} >${propogatedClasses.join('.')}`;
  const labelId = deriveLabelId(label);
  const ret: TupleStrStr = [header, labelId];

  return _.concat([ret], childStrings);
}
