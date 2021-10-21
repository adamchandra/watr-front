/**
 * Various URL related utility functions
 */
import _ from 'lodash';

import * as E from 'fp-ts/lib/Either';

export function corpusEntry(): string {
  const entry = location.href.split('/').reverse()[0].split('?')[0];
  return entry;
}

export function getParameterByName(name: string, urlstr?: string) {
  let url = urlstr;
  if (!url) { url = window.location.href; }
  const name0 = name.replace(/\[]/g, '\\$&');
  const regex = new RegExp(`[?&]${name0}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) { return null; }
  if (!results[2]) { return ''; }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export function getURLQueryParams() {
  const uri = window.location.search.slice(1);
  return new URLSearchParams(uri);
}

export function getURLQueryParam(key: string): string | undefined {
  const ps = getURLQueryParams();
  const v = ps.get(key);
  return _.isString(v) ? v : undefined;
}
export function getQueryParam(key: string): E.Either<any, string> {
  const ps = getURLQueryParams();
  const v = ps.get(key);

  if (v === null) {
    return E.left();
  }
  return E.right(v);
}
