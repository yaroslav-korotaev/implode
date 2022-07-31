import * as path from 'path';
import type {
  Data,
  FileFormat,
  FileConfig,
  TaskConfig,
  SourceConfig,
  Config,
  Task,
  Source,
} from './types';
import { renderText } from './render';
import { fromYaml } from './notations';
import type { UberFileSystem } from './uber-fs';

export const JSON_EXT: string[] = ['.json'];
export const YAML_EXT: string[] = ['.yml', '.yaml'];
export const DEFAULT_FILENAME: string = 'implode.yml';

export function resolve(url: string, rel: string): string {
  const resolvedUrl = new URL(url, new URL(rel, 'resolve://'));
  
  if (resolvedUrl.protocol == 'resolve:') { // 'rel' is a relative URL
    const { pathname, search, hash } = resolvedUrl;
    
    return pathname + search + hash;
  }
  
  return resolvedUrl.toString();
}

export function ensureYaml(url: string): string {
  if (YAML_EXT.includes(path.extname(url))) {
    return url;
  }
  
  if (url[url.length - 1] == '/') {
    return url + DEFAULT_FILENAME;
  }
  
  const parsedUrl = new URL(url, 'resolve://');
  
  if (parsedUrl.protocol == 'resolve:') {
    return url + '/' + DEFAULT_FILENAME;
  }
  
  return url; // leave it as is for http[s] URLs
}

export function detectFormat(url: string): FileFormat {
  const extname = path.extname(url);
  
  if (JSON_EXT.includes(extname)) {
    return 'json';
  }
  
  if (YAML_EXT.includes(extname)) {
    return 'yaml';
  }
  
  return 'plain';
}

export function isFileTaskConfig(config: TaskConfig): config is FileConfig {
  return !!(config as any).src;
}

export async function readConfig(path: string, fs: UberFileSystem): Promise<Config> {
  const content = await fs.load(path);
  
  return fromYaml(content) as Config;
}

export type LoadSourceOptions = {
  rel: string;
  data: Data;
  fs: UberFileSystem;
};

export async function loadSource(url: string, options: LoadSourceOptions): Promise<Source> {
  const {
    rel,
    data,
    fs,
  } = options;
  
  const resolvedSourceUrl = ensureYaml(resolve(url, rel));
  const content = await fs.load(resolvedSourceUrl);
  const sourceConfig = fromYaml(content) as SourceConfig;
  
  const tasks: Task[] = [];
  for (const config of sourceConfig.tasks) {
    if (isFileTaskConfig(config)) {
      const src = resolve(config.src, resolvedSourceUrl);
      const configDest = (config.dest) ? renderText(config.dest, data) : config.src;
      const dest = resolve(configDest, rel);
      const format = config.format ?? detectFormat(src);
      const content = await fs.load(src);
      
      tasks.push({
        src,
        dest,
        format,
        content,
        overwrite: !config.once,
      });
    } else {
      const dir = resolve(renderText(config.dir, data), rel);
      
      tasks.push({ dir });
    }
  }
  
  return {
    src: resolvedSourceUrl,
    dest: rel,
    tasks,
  };
}
