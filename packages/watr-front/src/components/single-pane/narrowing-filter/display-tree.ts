import _ from 'lodash';

import Bitset from 'bitset';

import {
  Radix,
  createRadix,
  radUpsert,
  radUnfold,
  radTraverseDepthFirst,
  radFoldUp,
  prettyPrint,
} from '@watr/commonlib-shared';

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

abstract class Node {
  visibleDescendantCount: number;

  constructor() {
    this.visibleDescendantCount = 0;
  }

  abstract get ownVisible(): number;

  abstract get isDataNode(): boolean;
  get isEmptyNode(): boolean { return !this.isDataNode; }

  public get totalVisible(): number {
    return this.ownVisible + this.visibleDescendantCount;
  }
}

export class DataNode<D> extends Node {
  // public readonly kind: 'DataNode';
  private _flags: Bitset;
  private _itemCount: number;
  public data: D;

  constructor(d: D) {
    super();
    this._flags = new Bitset;
    this._itemCount = 0;
    this.data = d;
  }
  setVisible(i: number, b: boolean) {
    this._flags.set(i, b ? 1 : 0);
  }
  setAllVisible(b: boolean) {
    this._flags.clear();
    this._flags.setRange(0, this._itemCount - 1, b ? 1 : 0);
  }

  public get ownVisible(): number {
    return this._flags.cardinality();
  };

  public set itemCount(n: number) {
    this._itemCount = n;
    this.setAllVisible(true);
  }
  public get itemCount() {
    return this._itemCount;
  }

  filter<A>(items: A[]): A[] {
    return _.filter(items, (_item, i) => {
      return this._flags.get(i) === 1;
    });
  }

  get isDataNode(): boolean {
    return true;
  }
}
export class EmptyNode extends Node {
  // public readonly kind: 'EmptyNode';

  constructor() {
    super();
  }

  public get ownVisible(): number {
    return 0;
  };
  get isDataNode(): boolean {
    return false;
  }
}

export type TreeNode<D> = EmptyNode | DataNode<D>;

export function createDisplayTree<ItemT>(
  items: ItemT[],
  itemPath: (a: ItemT) => string[],
): Radix<TreeNode<ItemT[]>> {
  type GroupT = ItemT[];
  type NodeT = TreeNode<GroupT>;

  const labelRadix = createRadix<NodeT>();
  _.each(items, (item) => {
    const path = itemPath(item);

    radUpsert<NodeT>(labelRadix, path, (prevSel?: NodeT) => {
      if (prevSel === undefined || prevSel.isEmptyNode) {
        return new DataNode<ItemT[]>([item]);
      }

      if (prevSel.isDataNode) {

      prevSel.data.push(item);
      }

      return prevSel;
    });

  });

  radTraverseDepthFirst<NodeT>(labelRadix, (_path, data, _childCount, node) => {
    prettyPrint({ msg: 'traversing', data, node })
    if (data === undefined) {
      node.data = new EmptyNode();
    } else if (data.kind === 'DataNode') {
      console.log('setting item count')
      data.itemCount = data.data.length;
    }
  });

  return labelRadix;
}

export function queryAndUpdateDisplayTree<ItemT>(
  displayTree: Radix<TreeNode<ItemT[]>>,
  queryString: string,
  getItemTerms: (item: ItemT) => string[],
): void {
  type GroupT = ItemT[];
  type NodeT = TreeNode<GroupT>;

  const queryTerms = queryString.trim().split(/[ ]+/g).map(t => t.toLowerCase());
  const showAll = queryTerms.length === 0;

  radFoldUp<NodeT, number>(displayTree, (path, { nodeData, childResults }) => {
    nodeData.visibleDescendantCount = _.sum(_.concat(childResults, 0));

    if (nodeData.kind === 'DataNode') {
      const { data } = nodeData;
      if (showAll) {
        nodeData.setAllVisible(true);
      } else {
        const pathTerms = path.map(s => s.toLowerCase());
        const attrQuery = queryTerms.filter(t => t.startsWith(':')).map(t => t.slice(1));
        const pathQuery = queryTerms.filter(t => !t.startsWith(':'));
        _.each(data, (item, i) => {
          const itemTerms = getItemTerms(item).map(s => s.toLowerCase());
          const termMatch = attrQuery.length === 0 || _.every(attrQuery, qt => {
            return _.some(itemTerms, it => it.includes(qt));
          });
          const pathMatch = pathQuery.length === 0 || _.every(pathQuery, qt => {
            return _.some(pathTerms, it => it.includes(qt));
          });
          const setBit = termMatch && pathMatch;
          nodeData.setVisible(i, setBit);
        });
      }
    }

    return nodeData.totalVisible;
  });
}

export function renderDisplayTree<ItemT>(
  displayTree: Radix<TreeNode<ItemT[]>>,
  renderDataNode: (items: ItemT[]) => RenderedItem,
): Array<RenderedGroup<ItemT[]>> {

  const renderedGroups: RenderedGroup<ItemT[]>[][] = radUnfold(displayTree, (path, nodeData) => {

    if (path.length === 0) return [];
    if (nodeData.totalVisible === 0) return [];

    const childVis = nodeData.visibleDescendantCount;
    const ownVis = nodeData.ownVisible;

    const leveln = (path.length - 1) * 2;

    const outlineHeader = _.last(path);
    const outlineDisplay = `> ${outlineHeader} (${ownVis}/${childVis})`;
    const outlineRender = span(outlineDisplay, `header-${leveln}`)

    const showOutline = {
      level: leveln,
      renderedItem: outlineRender,
      nodeData: undefined,
    };

    if (nodeData.kind === 'DataNode' && nodeData.ownVisible > 0) {
      const items = nodeData.data;

      const visibleItems = nodeData.filter(items);

      const nodeRender = {
        level: leveln + 1,
        renderedItem: renderDataNode(visibleItems),
        nodeData: visibleItems,
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

export function renderItemTo<U>(
  ritem: RenderedItem, f: (ritem: RenderedItem, uchilds: U[]) => U
): U {
  function traverseDF(init: RenderedItem, f: (ri: RenderedItem, rchildCount: number) => void): void {
    function _loop(rcurr: RenderedItem) {
      f(rcurr, rcurr.children.length);
      rcurr.children.forEach(rchild => _loop(rchild));
    }
    _loop(init);
  };
  const rstack: [RenderedItem, number][] = [];

  traverseDF(ritem, (ri, rchilds) => rstack.push([ri, rchilds]));
  const ustack: U[] = [];
  while (rstack.length > 0) {
    const [rtop, rchilds] = rstack.pop();
    const childResults = ustack.splice(0, rchilds);
    const ures = f(rtop, childResults);
    ustack.unshift(ures);
  }

  return ustack[0];
}
