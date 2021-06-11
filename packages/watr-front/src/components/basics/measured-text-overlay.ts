/**
 * Use plain html div to provide provide positioned text over a canvas or img elements
 * Use for tooltips, pdf text viewer, etc.
 */

import _ from 'lodash';

import { SuperimposedElements } from './superimposed-elements';
import { TextStyle, makeStyleString, LineDimensions, showText0 } from '~/lib/html-text-metrics';

type PutText = (style: TextStyle, x: number, y: number, text: string) => LineDimensions;
type ClearText = () => Promise<void>;

export interface TextOverlay {
  putTextLn: PutText;
  clearText: ClearText;
}

type Args = {
  superimposedElements: SuperimposedElements;
};


export function useMeasuredTextOverlay({
  superimposedElements,
}: Args): TextOverlay {

  const charWidthCache: Record<string, number> = {};

  function putTextLn(style: TextStyle, x: number, y: number, text: string): LineDimensions {
    const textDiv = superimposedElements.overlayElements.textDiv!;
    const fontstring = makeStyleString(style);

    const div = document.createElement('div');
    div.classList.add('measured');
    div.style.visibility = 'visible';
    div.style.display = 'inline-block';
    div.style.font = fontstring;
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    const node = document.createTextNode(text);
    div.append(node)
    textDiv.appendChild(div);

    return showText0(text, div, x, y, charWidthCache);
  }


  const clearText: ClearText = () => {
    const textDiv = superimposedElements.overlayElements.textDiv!;

    if (textDiv === undefined) return Promise.resolve();
    // if (textDiv.childElementCount === 0) return Promise.resolve();

    return new Promise((resolve) => {
      // const observer = new MutationObserver(function(mutations: MutationRecord[]) {
      //   mutations.forEach(function(mutation: MutationRecord) {
      //     console.log('mut> ', mutation);
      //     const isEmpty = mutation.target.childNodes.length === 0;
      //     // const isFirstSib = mutation.previousSibling === null;
      //     // const isLastSib = mutation.nextSibling === null;
      //     // const isOnlySib = isFirstSib && isLastSib;
      //     if (isEmpty) {
      //       console.log('<<disconnecting>>');
      //       observer.disconnect();
      //       resolve(undefined);
      //     }
      //   });
      // });

      // const config: MutationObserverInit = {
      //   attributes: true,
      //   childList: true,
      //   characterData: true
      // };

      // observer.observe(textDiv, config);
      while (textDiv.firstChild) {
        textDiv.removeChild(textDiv.firstChild);
      }
      resolve();
    });
  };

  return {
    putTextLn,
    clearText,
  };
}
