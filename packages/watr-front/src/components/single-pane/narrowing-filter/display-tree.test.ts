import { prettyPrint } from '@watr/commonlib-shared';
import _ from 'lodash';
import { createDisplayTree, queryAndUpdateDisplayTree, renderDisplayTree, span, RenderedItem, renderItemTo } from './display-tree';

interface Item {
  path: string[];
  title: string;
  tags: string[];
}

function item(p: string, title: string, tags: string): Item {
  return {
    path: p.split('.'),
    title,
    tags: tags.split(/ +/g)
  };
}

const itemToString = (r0: RenderedItem) => renderItemTo<string[]>(
  r0, (ri: RenderedItem, childs: string[][]) => {
    const indented = _.flatMap(childs, c => '  ' + c);
    return _.concat(
      [`${ri.tag}${ri.text}`],
      indented,
    );
  }
);

describe('Display Trees', () => {
  it('should define a tree', () => {
    const items = [
      item('a', 'A.Item', 'AT A0'),
      // item('a.b', 'A.B.Item', 'AT BT'),
      item('a.b.c', 'A.B.C.Item', 'AT BT CT'),
      // item('a.d', 'A.D.Item', 'AT DT')
    ]
    const displayItemTree = createDisplayTree<Item>(
      items,
      (it) => it.path,
    );

    prettyPrint({ displayItemTree }, { depth: 12 });

    queryAndUpdateDisplayTree(
      displayItemTree,
      ':ct',
      function getItemTerms(item: Item): string[] {
        return _.concat(item.tags, item.title);
      }
    );


    const rendered = renderDisplayTree(
      displayItemTree,
      function renderDataNode(items: Item[]): RenderedItem {
        const rs = items.map(it => span(it.title, 'li title'))
        return span('', 'ul items', ...rs)
      }
    );

    const rstr = rendered.map(t => itemToString(t.renderedItem))
    prettyPrint({ rendered, rstr })
  });

});
