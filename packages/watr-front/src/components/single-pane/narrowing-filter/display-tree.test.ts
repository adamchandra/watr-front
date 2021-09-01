import { createRadix, prettyPrint } from '@watr/commonlib-shared';
import _ from 'lodash';
import { NodeLabel, createDisplayTree, queryAndUpdateDisplayTree } from './display-tree';

interface Item {
  path: string[];
  title: string;
  tags: string[];
}

// interface ItemGroup {
//   items: Item[];
// }

function item(p: string, title: string, tags: string): Item {
  return {
    path: p.split('.'),
    title,
    tags: tags.split(/ +/g)
  };
}

describe('Display Trees', () => {
  it('should define a tree', () => {
    const items = [
      item('a', 'A.Item', 'AT'),
      // item('a.b', 'A.B.Item', 'AT BT'),
      item('a.b.c', 'A.B.C.Item', 'AT BT CT'),
      // item('a.d', 'A.D.Item', 'AT DT')
    ]
    const displayItemTree = createDisplayTree<Item>(
      items,
      (it) => it.path,
    );

    queryAndUpdateDisplayTree(
      displayItemTree,
      'at',
      function getItemTerms(item: Item): string[] {
        return _.concat(item.tags, item.title);
      }
    );

    prettyPrint({ displayItemTree }, { depth: 12, getters: 'set' });

    // const finalChoices = queryDisplayTree<Item>(
    //   displayItemTree,
    //   function getQueryTerms(data: any): string[] {
    //     return [];
    //   },
    //   function queryData(data: any, qterms: string[]): void {
    //     //
    //   },
    //   'query string'
    // )

  });
});

