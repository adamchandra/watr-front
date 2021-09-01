import _ from 'lodash';

import Bitset from 'bitset';

import {
  Radix,
  createRadix,
  radUpsert,
  radUnfold,
  radTraverseDepthFirst,
  radFoldUp,
  // prettyPrint,
} from '@watr/commonlib-shared';

export interface NarrowingChoice<T> {
  count: number;
  indent: string;
  display: string;
  tags: string[];
  value: T;
}

class VisibleCount {
  private _visibleFlags: Bitset | undefined;
  private _size: number;
  private _descendantVis: number;


  constructor(visibleFlags?: Bitset) {
    this.descendantVis = 0;
    this._visibleFlags = visibleFlags;
  }

  set size(n: number) {
    this._size = n;
    this.setAllVisible(true);
  }
  get size() {
    return this._size;
  }

  set descendantVis(n: number) {
    this._descendantVis = n;
  }
  get descendantVis() {
    return this._descendantVis;
  }

  setVisible(i: number, b: boolean) {
    if (this._visibleFlags !== undefined) {
      this._visibleFlags.set(i, b ? 1 : 0);
    }
  }

  setAllVisible(b: boolean) {
    if (this._visibleFlags !== undefined) {
      this._visibleFlags.clear();
      this._visibleFlags.setRange(0, this.size, b ? 1 : 0);
    }
  }
  ownVisible(): number {
    return this._visibleFlags ? this._visibleFlags.cardinality() : 0;
  };

  totalVisible(): number {
    return this.ownVisible() + this.descendantVis;
  }

}

interface Node {
  visibleCount: VisibleCount;
}

export interface DataNode<D> extends Node {
  readonly kind: 'DataNode';
  data: D;
}
export interface EmptyNode extends Node {
  readonly kind: 'EmptyNode';
}

export type NodeLabel<D> = EmptyNode | DataNode<D>;


export interface ItemGroup<ItemT> {
  items: ItemT[];
}


export function createDisplayTree<ItemT>(
  items: ItemT[],
  itemPath: (a: ItemT) => string[],
): Radix<NodeLabel<ItemGroup<ItemT>>> {
  type GroupT = ItemGroup<ItemT>;
  type NodeT = NodeLabel<GroupT>;

  const labelRadix = createRadix<NodeT>();
  _.each(items, (item) => {
    const path = itemPath(item);
    // const ltags = getLabelProp(label, 'tags');

    radUpsert<NodeT>(labelRadix, path, (prevSel?: NodeT) => {
      if (prevSel === undefined) {
        const visibleFlags = new Bitset;
        return {
          kind: 'DataNode',
          data: {
            items: [item],
          },
          visibleCount: new VisibleCount(visibleFlags)
        };
      }
      if (prevSel.kind === 'EmptyNode') {
        const visibleFlags = new Bitset;
        return {
          kind: 'DataNode',
          data: {
            items: [item],
          },
          visibleCount: new VisibleCount(visibleFlags)
        };
      }

      prevSel.data.items.push(item);

      return prevSel;
    });

  });

  radTraverseDepthFirst<NodeT>(labelRadix, (path, data, childCount, node) => {
    if (data === undefined) {
      node.data = {
        kind: 'EmptyNode',
        visibleCount: new VisibleCount()
      };
    }
  });

  return labelRadix;
}

export function queryAndUpdateDisplayTree<ItemT>(
  displayTree: Radix<NodeLabel<ItemGroup<ItemT>>>,
  queryString: string,
  getItemTerms: (item: ItemT) => string[],
  // queryData: (data: GroupT, qterms: string[]) => void,
): void {
  type GroupT = ItemGroup<ItemT>;
  type NodeT = NodeLabel<GroupT>;

  const queryTerms = queryString.trim().split(/[ ]+/g).map(t => t.toLowerCase());
  const showAll = queryTerms.length === 0;

  radFoldUp<NodeT, number>(displayTree, (path, { nodeData, childResults }) => {
    nodeData.visibleCount.descendantVis = _.sum(_.concat(childResults, 0));

    const pathTerms = path.map(s => s.toLowerCase());

    if (nodeData.kind === 'DataNode') {
      const { data: { items }, visibleCount } = nodeData;
      // const allTerms = _.flatMap(items, item => getItemTerms(item)).map(s => s.toLowerCase());
      // const termSet = new Set(allTerms)
      // queryData(nodeData.data, queryTerms);
      // const { labels, showLabels } = nodeData.data;
      if (showAll) {
        visibleCount.setAllVisible(true);
      } else {
        _.each(items, (item, i) => {
          const itemTerms = getItemTerms(item).map(s => s.toLowerCase());
          const termMatch = _.some(queryTerms, qt => {
            return _.some(itemTerms, it => it.includes(qt));
          });
          const pathMatch = _.some(queryTerms, qt => {
            return _.some(pathTerms, it => it.includes(qt));
          });
          const setBit = termMatch || pathMatch;
          visibleCount.setVisible(i, setBit);
        });
      }
    }


    return nodeData.visibleCount.totalVisible();
  });
}

// export function queryDisplayTree<GroupT>(
//   displayTree: Radix<NodeLabel<GroupT>>,
//   getQueryTerms: (data: GroupT) => string[],
//   queryData: (data: GroupT, qterms: string[]) => void,
//   queryString: string
// ): Array<NarrowingChoice<GroupT[]>> {
//   type NodeT = NodeLabel<GroupT>;

//   const queryTerms = queryString.trim().split(/[ ]+/g).map(t => t.toLowerCase());
//   // const showAll = queryTerms.length === 0;
//   radFoldUp<NodeT, number>(displayTree, (path, { nodeData, childResults }) => {
//     const childShowableCount = _.sum(_.concat(childResults, 0));
//     nodeData.visibleCount.childs = childShowableCount;

//     if (nodeData.kind === 'EmptyNode') {
//       return nodeData.visibleCount.childs;
//     }

//     // const nodeTerms = getQueryTerms(nodeData.data);
//     queryData(nodeData.data, queryTerms);

//     // const { labels, showLabels } = nodeData.data;
//     // const pathLC = path.map(s => s.toLowerCase());
//     // if (showAll) {
//     //   showLabels.setRange(0, labels.length, 1);
//     // } else {
//     //   // showLabels.setRange(0, labels.length, 0);
//     //   _.each(labels, (l, i) => {
//     //     const tags = getLabelProp(l, 'tags').map(s => s.toLowerCase());
//     //     const tagMatch = _.some(terms, term => _.some(tags, tag => tag.includes(term)));
//     //     const pathMatch = _.some(terms, term => _.some(pathLC, pseg => pseg.includes(term)));
//     //     const setBit = tagMatch || pathMatch ? 1 : 0;
//     //     nodeData.data.showLabels.set(i, setBit);
//     //   });
//     // }

//     // nodeData.selfDisplayableCount = nodeData.data.showLabels.cardinality()

//     return nodeData.visibleCount.total();
//   });


//   const unfolded: NarrowingChoice<GroupT[]>[] = radUnfold(displayTree, (path, labelSelection) => {
//     if (path.length === 0) {
//       return undefined;
//     }
//     if (labelSelection === undefined) return undefined;

//     const childC = labelSelection.visibleCount.childs;
//     const selfC = labelSelection.visibleCount.own();
//     if (childC + selfC === 0) {
//       return undefined;
//     }

//     const outlineHeader = _.last(path);
//     if (labelSelection.kind === 'DataNode') {
//       // const { labels, showLabels, tags } = labelSelection.data;
//       // const tagDisplay = labelSelection ? Array.from(tags) : [];
//       // const labels = labelSelection ? labelSelection.data.labels : [];
//       // labelSelection.data.labels.filter((l, li) =>  )
//       // const showables = labels.filter((_l, i) => showLabels.get(i) !== 0);

//       return {
//         indent: `pl-${(path.length - 1) * 3}`,
//         display: outlineHeader,
//         value: undefined,
//         count: 0,
//         tags: []
//         // value: showables,
//         // count: showables.length,
//         // tags: tagDisplay
//       };
//     }
//     return {
//       indent: `pl-${(path.length - 1) * 3}`,
//       display: outlineHeader,
//       value: undefined,
//       count: 0,
//       tags: []
//     };
//   });
//   const finalChoices = _.filter(unfolded, v => v !== undefined);


//   return finalChoices;
// }
