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

  filter<A>(items: A[]): A[] {
    return _.filter(items, (_item, i) => {
      return this._visibleFlags.get(i) === 1;
    });
  }
}

export interface RenderedItem {
  tag: string;
  text: string;
  classes: string[];
  children: RenderedItem[];
}

export interface RenderedGroup<T> {
  level: number;
  renderedItem: RenderedItem;
  nodeData: T | undefined;
}

export function span(
  text: string,
  cls: string,
  ...childs: RenderedItem[]
): RenderedItem {
  return {
    tag: 'span',
    text,
    classes: cls.split(/ +/g),
    children: childs
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

export function renderDisplayTree<ItemT>(
  displayTree: Radix<NodeLabel<ItemGroup<ItemT>>>,
  renderDataNode: (items: ItemT[]) => RenderedItem,
): Array<RenderedGroup<ItemGroup<ItemT>>> {
  type GroupT = ItemGroup<ItemT>;

  const renderedGroups: RenderedGroup<GroupT>[][] = radUnfold(displayTree, (path, nodeData) => {
    if (nodeData === undefined) return undefined;
    const { visibleCount } = nodeData;

    if (path.length === 0) return undefined;
    if (visibleCount.totalVisible() === 0) return undefined;

    const level = path.length - 1;

    const outlineHeader = _.last(path);
    const outlineRender = span(outlineHeader, `header-${level}`)

    const showOutline = {
      level,
      renderedItem: outlineRender,
      nodeData: undefined,
    };

    if (nodeData.kind === 'DataNode' && visibleCount.ownVisible() > 0) {
      const { items } = nodeData.data;

      const visibleItems = visibleCount.filter(items);

      const nodeRender = {
        level,
        renderedItem: renderDataNode(visibleItems),
        nodeData: nodeData.data,
      };
      return [showOutline, nodeRender];
    }
    return [showOutline];
  });


  return _.filter(
    _.flatten(renderedGroups),
    v => v !== undefined
  );
}
