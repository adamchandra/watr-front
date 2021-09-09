import Koa, { Context } from 'koa';
import Router from 'koa-router';
import json from 'koa-json';
import { arglib } from '@watr/commonlib-node';
const { opt, config, registerCmd } = arglib;

import { initFileBasedRoutes } from './corpusRoutes';

const rootRouter = new Router();
const app = new Koa();

registerCmd(
  arglib.YArgs,
  'corpus-server',
  'server filesystem artifacts from corpus',
  config([
    opt.cwd,
    opt.existingDir('corpus-root: root directory for corpus files'),
  ])
)((args: any) => {
  const { corpusRoot } = args;


  const apiRouter = initFileBasedRoutes(corpusRoot);

  rootRouter
    .use('/', ((ctx: Context, next) => {
      ctx.set('Access-Control-Allow-Origin', '*');
      return next();
    }))
    .use(apiRouter.routes())
    .use(apiRouter.allowedMethods())
  ;

  app
    .use(rootRouter.routes())
    .use(rootRouter.allowedMethods())
    .use(json({ pretty: false }))
  ;

  app.listen(3100, function() {
    console.log('Koa is listening to http://localhost:3100');
  });


});

arglib.YArgs
  .demandCommand(1, 'You need at least one command before moving on')
  .strict()
  .help()
  .fail((err) => {
    console.log('Error', err);
    arglib.YArgs.showHelp();
  })
  .argv;
