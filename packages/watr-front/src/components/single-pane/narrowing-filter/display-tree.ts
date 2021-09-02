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
    this._size = 0;
  }

  public set size(n: number) {
    this._size = n;
    this.setAllVisible(true);
  }
  public get size() {
    return this._size;
  }

  public set descendantVis(n: number) {
    this._descendantVis = n;
  }
  public get descendantVis() {
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
      this._visibleFlags.setRange(0, this.size-1, b ? 1 : 0);
    }
  }
  public get ownVisible(): number {
    return this._visibleFlags ? this._visibleFlags.cardinality() : 0;
  };

  public get totalVisible(): number {
    return this.ownVisible + this.descendantVis;
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
    } else if (data.kind === 'DataNode') {
      data.visibleCount.size = data.data.items.length;
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
    const {  visibleCount } = nodeData;
    visibleCount.descendantVis = _.sum(_.concat(childResults, 0));

    if (nodeData.kind === 'DataNode') {
      const { data: { items } } = nodeData;
      if (showAll) {
        visibleCount.setAllVisible(true);
      } else {
        const pathTerms = path.map(s => s.toLowerCase());
        const attrQuery = queryTerms.filter(t => t.startsWith(':')).map(t => t.slice(1));
        const pathQuery = queryTerms.filter(t => !t.startsWith(':'));
        _.each(items, (item, i) => {
          const itemTerms = getItemTerms(item).map(s => s.toLowerCase());
          const termMatch = attrQuery.length===0 || _.every(attrQuery, qt => {
            return _.some(itemTerms, it => it.includes(qt));
          });
          const pathMatch = pathQuery.length===0 || _.every(pathQuery, qt => {
            return _.some(pathTerms, it => it.includes(qt));
          });
          const setBit = termMatch && pathMatch;
          visibleCount.setVisible(i, setBit);
        });
      }
    }

    return visibleCount.totalVisible;
  });
}

export function renderDisplayTree<ItemT>(
  displayTree: Radix<NodeLabel<ItemGroup<ItemT>>>,
  renderDataNode: (items: ItemT[]) => RenderedItem,
): Array<RenderedGroup<ItemT[]>> {
  // type GroupT = ItemGroup<ItemT>;

  const renderedGroups: RenderedGroup<ItemT[]>[][] = radUnfold(displayTree, (path, nodeData) => {
    const { visibleCount } = nodeData;

    // console.log({ msg: 'radUnfold', path, nodeData, vis: visibleCount.totalVisible})

    if (path.length === 0) return [];
    if (visibleCount.totalVisible === 0) return [];

    const childVis = visibleCount.descendantVis;
    const ownVis = visibleCount.ownVisible;

    const leveln = (path.length - 1) * 2;

    const outlineHeader = _.last(path);
    const outlineDisplay = `> ${outlineHeader} (${ownVis}/${childVis})`;
    const outlineRender = span(outlineDisplay, `header-${leveln}`)

    const showOutline = {
      level: leveln,
      renderedItem: outlineRender,
      nodeData: undefined,
    };

    if (nodeData.kind === 'DataNode' && visibleCount.ownVisible > 0) {
      const { items } = nodeData.data;

      const visibleItems = visibleCount.filter(items);

      const nodeRender = {
        level: leveln+1,
        renderedItem: renderDataNode(visibleItems),
        nodeData: visibleItems,
      };
      // console.log({ msg: 'radUnfolded', showOutline, nodeRender  })
      return [showOutline, nodeRender];
    }
    // console.log({ msg: 'radUnfolded', showOutline  })
    return [showOutline];
  });


  return _.filter(
    _.flatten(renderedGroups),
    v => v !== undefined
  );
}
