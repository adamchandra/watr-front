import _ from 'lodash';

import {
  setupVueComponent,
} from './refactors';

import {
  setupStoryVues
} from './storybooks';


import commander from 'commander';
const program = new commander.Command();
program.version('0.0.1');

program
  .version('0.0.1')
;

program
  .command('setup-component <name> <indir>')
  .alias('comp')
  .description('setup vue component')
  .option('-c, --tsconfig <path>', 'path to tsconfig.json for target project')
  .action(function(name: string, root: string, options: any) {
    const tsconfig = options.tsconfig;
    console.log(`vue component setup: tsconfig=${tsconfig}`);
    setupVueComponent(tsconfig, name, root);
  });

program
  .command('generate-story-vues')
  .alias('stories')
  .description('setup vue component')
  .option('-c, --tsconfig <path>', 'path to tsconfig.json for target project')
  .option('-n, --dryrun', 'just print output')
  .action(function(options: any) {
    const tsconfig = options.tsconfig;
    const dryrun = options.dryrun;
    setupStoryVues(tsconfig, dryrun);
  });


program.parse(process.argv);
