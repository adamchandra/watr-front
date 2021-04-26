import _ from 'lodash';

import path from 'path';
import fs from 'fs-extra';
import send from 'koa-send';

import { Context } from 'koa';
import Router from 'koa-router';

import {
  expandDirRecursive,
} from '@watr/commonlib-node';

// import {
//   putStrLn,
// } from 'commonlib-shared';


// export interface CorpusPage {
//   corpusEntries: CorpusEntry[];
//   offset: number;
// }

// TODO reinstate w/o pumpify (use 'commons')
// export async function readCorpusEntries(
//   corpusRoot: string,
//   start: number,
//   len: number
// ): Promise<CorpusPage> {
//   const entryStream = corpusEntryStream(corpusRoot);
//   const pipe = pumpify.obj(
//     entryStream,
//     sliceStream(start, len),
//     expandDirTrans,
//   );

//   return new Promise((resolve) => {
//     const entries: CorpusEntry[] = [];
//     pipe.on("data", (data: CorpusEntry) => {
//       entries.push(data);
//     });
//     pipe.on("end", () => {
//       const corpusPage = {
//         corpusEntries: entries,
//         offset: start
//       };
//       resolve(corpusPage);
//     });
//   })
// }



export async function resolveArtifact(
  entryPath: string,
  remainingPath: string[]
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

export function initFileBasedRoutes(corpusRootPath: string): Router {
  // TODO get this prefixed route working properly
  // putStrLn(`initializing server with root @${corpusRootPath}`);
  const apiRouter = new Router({
    // prefix: "/api"
  });
  const pathPrefix = '/api/corpus/entry'
  const pathMatcher = `${pathPrefix}/([^/]+)((/[^/]+)|/)*`
  const re = new RegExp(pathMatcher);

  apiRouter
    .get(re, async (ctx: Context, next) => {
      const p = ctx.path;
      // putStrLn(`server: GET ${p}`);

      // map path entry id to physical path
      try {
        const endPath = p.substr(pathPrefix.length + 1)
        const pathParts = endPath.split('/');
        const [entryId, ...remainingPath] = pathParts;
        const entryPath = path.resolve(corpusRootPath, entryId);
        const artifactPath = await resolveArtifact(entryPath, remainingPath)

        if (artifactPath) {
          const respRelFile = path.relative(corpusRootPath, artifactPath);
          // putStrLn(`server: serving ${respRelFile}`);
          return await send(ctx, respRelFile, { root: corpusRootPath });
        }

      } catch (error) {
        // putStrLn(`server: could not serve ${p}`);
      }

      return next();
    });


  return apiRouter;

}
