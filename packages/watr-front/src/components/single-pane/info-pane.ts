import {
  Ref,
} from '@nuxtjs/composition-api'

import _ from 'lodash';
import { Label } from '~/lib/transcript/labels';
import { formatShape } from '~/lib/transcript/shapes';
import { useMeasuredTextOverlay } from '../basics/measured-text-overlay';
import { LineDimensions, TextStyle } from '~/lib/html-text-metrics';

type Args = {
  mountPoint: Ref<HTMLDivElement | null>;
};

export type ShowLabel = (l: Label) => Promise<void>;
export type PutStringLn = (str: string) => Promise<LineDimensions>;
export type PutString = (str: string) => Promise<LineDimensions>;
export type ClearScreen = () => Promise<void>;

export interface InfoPane {
  showLabel: ShowLabel;
  putStringLn: PutStringLn;
  putString: PutString;
  clearScreen: ClearScreen;
}

import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';

export async function useInfoPane({
  mountPoint
}: Args): Promise<InfoPane> {

  const superimposedElements = await useSuperimposedElements({
    includeElems: [ElementTypes.Text],
    mountPoint
  });

  const mtext = useMeasuredTextOverlay({ superimposedElements });
  superimposedElements.setDimensions(800, 1000);

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

    putStringLn('>>>== Label ==');
    const lstrings = labelToString(l, 0, []);
    lstrings.forEach(lstr => {
      putStringLn(lstr).then(({ lineDiv }) => {
        lineDiv.onmouseover = function(_event) {
          console.log('hovering over ', this);
        }
      })
    });

    await putStringLn('<<<<==');
  }
  const putStringLn = async (str: string): Promise<LineDimensions> => {
    const lineDimensions = await putString(str);
    textTopCurr = textTopCurr + size;
    textLeftCurr = textLeftInit;
    return lineDimensions;
  }

  const putString = async (str: string): Promise<LineDimensions> => {
    const lineDimensions = mtext.putTextLn(style, textLeftCurr, textTopCurr, str);
    textLeftCurr = textLeftCurr + lineDimensions.width;
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
    clearScreen
  };
}

function labelToString(label: Label, level: number, _parentClasses: string[]): string[] {

  const classStrings = label?.props?.['class'] || [];


  const localClasses = _.filter(classStrings, c => c.startsWith('='))
    .map(c => c.substring(1))


  const propogatedClasses = _.filter(classStrings, c => c.startsWith('>'))
    .map(c => c.substring(1))


  const lpad: string = _.map(_.range(level + 1), () => '   ').join('');

  const childStrings: string[] = label.children === undefined ? [] :
    _.flatMap(label.children, c => labelToString(c, level + 1, propogatedClasses).map(s => lpad + s));

  const localShapes = _.flatMap(label.range, range => {
    if (range.unit === 'shape') {
      return [formatShape(range.at)];
    }
    return [];
  });
  const shapestr = localShapes.join(', ')

  const header = `${label.name}#${label.id} [${shapestr}] .${localClasses.join('.')} >${propogatedClasses.join('.')}`;

  return _.concat([header], childStrings);
}
