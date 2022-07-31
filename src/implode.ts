import type {
  File,
  Task,
} from './types';
import { NOTATIONS } from './notations';
import { UberFileSystem } from './uber-fs';
import {
  resolve,
  ensureYaml,
  readConfig,
  loadSource,
} from './load';
import {
  renderText,
  renderJson,
} from './render';

export function isFileTask(task: Task): task is File {
  return !!(task as any).src;
}

export async function implode(path: string, rel: string): Promise<void> {
  const fs = new UberFileSystem();
  
  const resolvedConfigPath = ensureYaml(resolve(path, rel));
  const config = await readConfig(resolvedConfigPath, fs);
  const source = await loadSource(config.source, {
    rel: resolvedConfigPath,
    data: config.data,
    fs,
  });
  
  for (const task of source.tasks) {
    if (isFileTask(task)) {
      const oldContent = await fs.tryLoad(task.dest);
      let rendered: string;
      
      if (task.format == 'plain') {
        rendered = renderText(task.content, config.data);
      } else {
        
        const notation = NOTATIONS[task.format];
        const sourceJson = notation.parse(task.content);
        const oldJson = (oldContent == undefined) ? undefined : notation.parse(oldContent);
        const renderedJson = renderJson({
          source: sourceJson,
          old: oldJson,
          data: config.data,
        });
        
        rendered = notation.stringify(renderedJson);
      }
      
      if (task.overwrite || oldContent == undefined) {
        await fs.save(task.dest, rendered);
      }
    } else {
      await fs.mkdir(task.dir);
    }
  }
}
