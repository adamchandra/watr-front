import _ from 'lodash';

import path from 'path';
import fs from 'fs-extra';
import send from 'koa-send';

import { Context } from 'koa';
import Router from 'koa-router';


import {
  expandDirRecursive,
  walkDotDStyleCorpus,
  streamPump,
} from '@watr/commonlib-node';

import {
  putStrLn,
} from '@watr/commonlib-shared';

export async function readCorpusEntries(
  corpusRoot: string,
  // start: number,
  // len: number
): Promise<any> {
  const entryStream = walkDotDStyleCorpus(corpusRoot);
  const allFilesP = await streamPump.createPump()
    .viaStream<string>(entryStream)
    .gather()
    .toPromise()
    .then(files => {
      if (files === undefined) {
        return [];
      }
      return files.flat();
    });
  const relative = _.map(allFilesP, f => path.relative(corpusRoot, f));
  const cleaned = _.filter(_.map(relative, f => f.replace('/', '')), f => f.length > 0);
  const entries = _.map(cleaned, entryId => ({ entryId }));
  return {
    entries,
  };
}

export async function resolveArtifact(
  entryPath: string,
  remainingPath: string[],
): Promise<string | undefined> {
  const allpaths = await expandDirRecursive(entryPath);

  const isFile = (f: string) => fs.statSync(f).isFile();
  const isNumeric = (s: string) => /^\d+$/.test(s);

  const listing = _(allpaths)
    .filter(p => isFile(p))
    .map((p: string) => {
      const rel = path.relative(entryPath, p);
      return [p, rel.split('/')] as const;
    })
    .value();

  _.each(remainingPath, (ppart, partIndex) => {
    _.remove(listing, ([, relParts]) => {
      const relPart = relParts[partIndex];
      if (relPart === undefined) {
        return true;
      }
      let boundedRE = ppart;
      if (isNumeric(ppart)) {
        boundedRE = `\\D${ppart}\\D`;
      }

      const testRe = new RegExp(boundedRE);
      return !testRe.test(relPart);
    });
  });

  if (listing.length === 1) {
    const [responseFile] = listing[0];
    return responseFile;
  }
  return undefined;
}

function withTrailingSegments(p: string): string {
  // return p + '/([^/]+)((/[^/]+)|/)*';
  return `${p}(/[^/]+)+`;
}

function getTrailingSegments(leadingPath:string, urlPath: string): string[] {
  const endPath = urlPath.slice(leadingPath.length + 1);
  return endPath.split('/');
}

function regex(path: string): RegExp {
  return new RegExp(path);
}

export function initFileBasedRoutes(corpusRootPath: string): Router {
  putStrLn(`initializing server with root @${corpusRootPath}`);

  const apiRouter = new Router({});

  apiRouter
    .get(regex('/api/corpus/entries'), async (ctx: Context, next) => {
      const p = ctx.path;

      try {
        const corpusEntries = await readCorpusEntries(corpusRootPath);
        ctx.body = corpusEntries;
      } catch {
        putStrLn(`server: could not serve ${p}`);
      }

      return next();
    })
    .get(regex(withTrailingSegments('/api/corpus/entry')), async (ctx: Context, next) => {
      const p = ctx.path;
      putStrLn(`Serving ${p}`);

      try {
        const [entryId, ...remainingPath] = getTrailingSegments('/api/corpus/entry', p);
        const entryPath = path.resolve(corpusRootPath, entryId);
        const artifactPath = await resolveArtifact(entryPath, remainingPath);

        if (artifactPath) {
          const respRelFile = path.relative(corpusRootPath, artifactPath);
          putStrLn(`server: serving ${respRelFile}`);
          return await send(ctx, respRelFile, { root: corpusRootPath });
        }
      } catch {
        putStrLn(`server: could not serve ${p}`);
      }

      return next();
    })
    .get(regex('.*'), async (ctx: Context, next) => {
      const p = ctx.path;
      putStrLn(`Could not resolve path ${p}`);
      return next();
    })
  ;

  return apiRouter;
}
