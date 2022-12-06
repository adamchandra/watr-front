import _ from 'lodash';
import path from 'path';
import fs, { Dirent } from 'fs-extra';

import { Project, Directory } from 'ts-morph';

interface StoryPaths {
  generatedStoryVueFile: string;
  storyBaseName: string;
  storyTitle: string;
  vueImportName: string;
  storyUrl: string;
}

export function setupStoryVues(tsconfigPath: string, dryrun: boolean) {
  const project = new Project({
    tsConfigFilePath: tsconfigPath,
  });

  const tsconfigRPath = fs.realpathSync(tsconfigPath);
  const tsconfigDir = path.dirname(tsconfigRPath);

  const storyOutputDir = path.join(tsconfigDir, 'stories-autogen.d');

  if (fs.existsSync(storyOutputDir)) {
    console.log('autoDir exists, deleting...');
    fs.removeSync(storyOutputDir);
  }
  console.log(`creating autoDir ${storyOutputDir}...`);
  fs.mkdir(storyOutputDir);

  const storyList = findStories(project);

  _.each(storyList, (storyPath: StoryPaths) => {
    const { storyBaseName } = storyPath;
    const vueContent = `
<script lang="ts">
import vueComponent from '${storyPath.vueImportName}'
export default { components: { vueComponent } }
</script>
<template >
<vueComponent />
</template>
`.trimStart();

    const fullStoryPath = path.join(storyOutputDir, storyPath.generatedStoryVueFile);
    console.log(`creating story ${storyBaseName} in ${fullStoryPath}`);
    console.log(vueContent);

    if (!dryrun) {
      fs.writeFileSync(fullStoryPath, vueContent);
    }
  });

  const storyRecs = _.map(storyList, (storyPath: StoryPaths) => {
    // const storyBaseName = storyPath.storyBaseName;
    const { storyUrl } = storyPath;
    const { storyTitle } = storyPath;
    const entry = `
{ title: '${storyTitle}', to: '/stories/autogen/${storyUrl}' },
`.trim();
    return entry;
  });

  const entries = _.join(storyRecs, '\n  ');
  const storylistFileContent = `
// Auto-generated file
export type StoryEntry = {
  title: string;
  to: string;
  icon?: string;
}

export const storyItems: StoryEntry[] = [
  ${entries}
];

`;

  const storyListFile = path.join(storyOutputDir, 'story-list.ts');
  if (!dryrun) {
    fs.writeFileSync(storyListFile, storylistFileContent);
  }
}

function getStoryProp(fileContent: string, propname: string): string | undefined {
  const lines = fileContent.split('\n');
  const propLine = _.filter(lines, l => l.includes(`${propname}=`));
  let propValue: string | undefined;
  if (propLine.length > 0) {
    const propDef: string = propLine[0];
    const splitAt = propDef.indexOf('=');
    propValue = propDef.slice(splitAt + 1).trim();
    // propValue = propLine[0].split('=')[1].trim();
  }
  return propValue;
}

function genStoryProps(projSubdir: string, dirEntry: Dirent) {
  const vueFilePath = path.join(projSubdir, dirEntry.name);
  const fileContent = fs.readFileSync(vueFilePath).toString();
  const maybeStoryName = getStoryProp(fileContent, 'story-name');
  const maybeStoryQueryArgs = getStoryProp(fileContent, 'story-args');
  const maybeStoryTitle = getStoryProp(fileContent, 'story-title');
  const postSrcPath = vueFilePath.split('/src/')[1];
  const pathParts = postSrcPath.split('/');
  let storyBaseName = pathParts[pathParts.length - 2];

  storyBaseName = _.camelCase(storyBaseName);
  storyBaseName = maybeStoryName || storyBaseName;

  const generatedStoryVueFile = `${storyBaseName}.vue`;
  const vueImportName = `~/${postSrcPath}`;
  const storyTitle = maybeStoryTitle || storyBaseName;
  let storyUrl = storyBaseName;
  if (maybeStoryQueryArgs !== undefined) {
    storyUrl += `?${maybeStoryQueryArgs}`;
  }

  return [
    {
      generatedStoryVueFile, storyBaseName, vueImportName, storyTitle, storyUrl,
    },
  ];
}

function findStories(project: Project): StoryPaths[] {
  const projectDirs = project.getDirectories();
  const r: StoryPaths[] = _.flatMap(projectDirs, (dir: Directory) => {
    const projSubdir = dir.getPath();
    const isStoryPath = projSubdir.includes('__stories__');
    const dirEntries = fs.readdirSync(projSubdir, { withFileTypes: true });
    if (isStoryPath) {
      return _.flatMap(dirEntries, (dirEntry: Dirent) => {
        const vueFileName = dirEntry.name;
        const isVueFile = dirEntry.isFile() && vueFileName.endsWith('.vue');
        if (!isVueFile) return [];

        return genStoryProps(projSubdir, dirEntry);
      });
    }

    const storyFiles = _.filter(dirEntries, e => e.isFile() && e.name.endsWith('story.vue'));

    return _.flatMap(storyFiles, (dirEntry: Dirent) => genStoryProps(projSubdir, dirEntry));
  });

  return r;
}
