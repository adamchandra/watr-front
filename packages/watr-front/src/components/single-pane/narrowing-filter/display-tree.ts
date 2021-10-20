import _ from 'lodash';

import Bitset from 'bitset';

import {
  Radix,
  createRadix,
  radUpsert,
  radUnfold,
  radTraverseDepthFirst,
  radFoldUp,
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

export interface DataNode<D> {
  readonly kind: 'DataNode';
  _flags: Bitset;
  _itemCount: number;
  visibleDescendantCount: number;
  data: D;

  setVisible(i: number, b: boolean): void;
  setAllVisible(b: boolean): void;
  getOwnVisible(): number;
  getTotalVisible(): number;
  setItemCount(n: number): void;
  getItemCount(): number;
  filter<A>(items: A[]): A[];
}

export function dataNode<D>(data: D): DataNode<D> {
  return {
    kind: 'DataNode',
    _flags: new Bitset,
    _itemCount: 0,
    visibleDescendantCount: 0,
    getTotalVisible(): number {
      return this.getOwnVisible() + this.visibleDescendantCount;
    },
    data,
    setVisible(i: number, b: boolean): void {
      this._flags.set(i, b ? 1 : 0);
    },
    setAllVisible(b: boolean): void {
      this._flags.clear();
      this._flags.setRange(0, this._itemCount - 1, b ? 1 : 0);
    },

    getOwnVisible(): number {
      return this._flags.cardinality();
    },

    setItemCount(n: number): void {
      this._itemCount = n;
      this.setAllVisible(true);
    },
    getItemCount(): number {
      return this._itemCount;
    },

    filter<A>(items: A[]): A[] {
      return _.filter(items, (_item, i) => {
        return this._flags.get(i) === 1;
      });
    },
  };
}

export interface EmptyNode {
  readonly kind: 'EmptyNode';
  visibleDescendantCount: number;

  getOwnVisible(): number;
  getTotalVisible(): number;
}

export function emptyNode(): EmptyNode {
  return {
    kind: 'EmptyNode',
    visibleDescendantCount: 0,
    getOwnVisible(): number {
      return 0;
    },
    getTotalVisible(): number {
      return this.visibleDescendantCount;
    },
  }
}

export type TreeNode<D> = EmptyNode | DataNode<D>;

export function isEmptyNode<D>(n: TreeNode<D>): n is EmptyNode {
  return n.kind === 'EmptyNode';
}
export function isDataNode<D>(n: TreeNode<D>): n is DataNode<D> {
  return n.kind === 'DataNode';
}


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
      if (prevSel === undefined) {
        return dataNode<GroupT>([item]);
      }
      if (isEmptyNode(prevSel)) {
        return dataNode<GroupT>([item]);
      }

      if (isDataNode<GroupT>(prevSel)) {
        prevSel.data.push(item);
      }

      return prevSel;
    });

  });

  radTraverseDepthFirst<NodeT>(labelRadix, (_path, data, _childCount, node) => {
    if (data === undefined) {
      node.data = emptyNode();
    } else if (isDataNode(data)) {
      data.setItemCount(data.data.length);
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

    if (isDataNode(nodeData)) {
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

    return nodeData.getTotalVisible();
  });
}

export function renderDisplayTree<ItemT>(
  displayTree: Radix<TreeNode<ItemT[]>>,
  renderDataNode: (items: ItemT[]) => RenderedItem,
): Array<RenderedGroup<ItemT[]>> {

  const renderedGroups: RenderedGroup<ItemT[]>[][] = radUnfold(displayTree, (path, nodeData) => {

    if (path.length === 0) return [];
    if (nodeData.getTotalVisible() === 0) return [];

    const childVis = nodeData.visibleDescendantCount;
    const ownVis = nodeData.getOwnVisible();

    const leveln = (path.length - 1) * 2;

    const outlineHeader = _.last(path);
    const outlineDisplay = `> ${outlineHeader} (${ownVis}/${childVis})`;
    const outlineRender = span(outlineDisplay, `header-${leveln}`)

    const showOutline = {
      level: leveln,
      renderedItem: outlineRender,
      nodeData: undefined,
    };

    if (isDataNode(nodeData) && nodeData.getOwnVisible() > 0) {
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

export function renderAbbrevString0(strings: string[]): string {
  const abbrevRadix = createRadix<number>()
  _.each(strings, str => {
    const chars = str.split('');
    radUpsert(abbrevRadix, chars, (count) => count === undefined ? 1 : count + 1);
  });

  const abbrevs = radFoldUp<number, string>(abbrevRadix, (path, { childResults }) => {
    const childAbbrev = childResults.length > 1 ? `(${childResults.join('|')})` : childResults.join('');
    if (path.length > 0) {
      const pathLast: string = _.last(path);
      return `${pathLast}${childAbbrev}`;
    }
    return childAbbrev;
  });


  return abbrevs;
}
export function renderAbbrevString(strings: string[]): string {
  const abbrevRadix = createRadix<number>()
  _.each(strings, str => {
    const chars = str.split('');
    radUpsert(abbrevRadix, chars, (count) => count === undefined ? 1 : count + 1);
  });

  const abbrevs = radFoldUp<number, string>(abbrevRadix, (path, { childResults }) => {
    const childAbbrev = childResults.length > 1 ? ` ${childResults.join(' ')} ` : childResults.join('');
    // const childAbbrev = nodeData === undefined? childAbbrev_ : `.${childAbbrev_}`;
    if (path.length > 0) {
      const pathLast: string = _.last(path);
      return `${pathLast}${childAbbrev}`;
    }
    return childAbbrev;
  });

  const sortedAbbrevs = _.sortBy(_.uniq(abbrevs.split(/ +/)), s => s.length).reverse()

  return sortedAbbrevs.join(' ');
}
