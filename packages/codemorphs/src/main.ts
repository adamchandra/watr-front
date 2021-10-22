import _ from 'lodash';

import commander from 'commander';
import {
  setupVueComponent,
} from './refactors';

import {
  setupStoryVues,
} from './storybooks';

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
  .action((name: string, root: string, options: any) => {
    const { tsconfig } = options;
    console.log(`vue component setup: tsconfig=${tsconfig}`);
    setupVueComponent(tsconfig, name, root);
  });

program
  .command('generate-story-vues')
  .alias('stories')
  .description('setup vue component')
  .option('-c, --tsconfig <path>', 'path to tsconfig.json for target project')
  .option('-n, --dryrun', 'just print output')
  .action((options: any) => {
    const { tsconfig } = options;
    const { dryrun } = options;
    setupStoryVues(tsconfig, dryrun);
  });

program.parse(process.argv);
