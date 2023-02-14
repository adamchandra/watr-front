import _ from 'lodash';

import { Label } from './labels';

export function getLabelProp(label: Label, propname: string): string[] {
  const localTags = label?.props?.[propname] || [];
  const children = label.children || [];

  const childTags: string[] = _.flatMap(children, c => getLabelProp(c, propname));

  return _.concat(localTags, childTags);
}
