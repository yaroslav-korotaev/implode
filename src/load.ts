import * as path from 'path';
import type {
  FileFormat,
  SourceConfig,
  Config,
  File,
  Source,
} from './types';
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

export async function readConfig(path: string, fs: UberFileSystem): Promise<Config> {
  const content = await fs.load(path);
  
  return fromYaml(content) as Config;
}

export async function loadSource(url: string, rel: string, fs: UberFileSystem): Promise<Source> {
  const resolvedSourceUrl = ensureYaml(resolve(url, rel));
  const content = await fs.load(resolvedSourceUrl);
  const sourceConfig = fromYaml(content) as SourceConfig;
  
  const files: File[] = [];
  for (const fileConfig of sourceConfig.files) {
    const src = resolve(fileConfig.src, resolvedSourceUrl);
    const dest = resolve(fileConfig.dest ?? fileConfig.src, rel);
    const format = fileConfig.format ?? detectFormat(src);
    const content = await fs.load(src);
    
    files.push({ src, dest, format, content });
  }
  
  return {
    src: resolvedSourceUrl,
    dest: rel,
    files,
  };
}
