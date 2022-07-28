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

export async function implode(path: string, rel: string): Promise<void> {
  const fs = new UberFileSystem();
  
  const resolvedConfigPath = ensureYaml(resolve(path, rel));
  const config = await readConfig(resolvedConfigPath, fs);
  const source = await loadSource(config.source, resolvedConfigPath, fs);
  
  for (const file of source.files) {
    let rendered: string;
    
    if (file.format == 'plain') {
      rendered = renderText(file.content, config.data);
    } else {
      const oldContent = await fs.tryLoad(file.dest);
      
      const notation = NOTATIONS[file.format];
      const sourceJson = notation.parse(file.content);
      const oldJson = (oldContent == undefined) ? undefined : notation.parse(oldContent);
      const renderedJson = renderJson({
        source: sourceJson,
        old: oldJson,
        data: config.data,
      });
      
      rendered = notation.stringify(renderedJson);
    }
    
    await fs.save(file.dest, rendered);
  }
}
