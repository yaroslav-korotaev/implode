import _ from 'lodash';
import type {
  Obj,
  Json,
  Data,
} from './types';

export const RE_FULL_SUBSTITUTION = /^\${([\s\S]+?)}$/;

export function renderText(source: string, data: Data): string {
  const render = _.template(source);
  
  return render(data);
}

export type RenderJsonOptions = {
  source: Json;
  old?: Json;
  data: Data;
};

export function renderJson(options: RenderJsonOptions): Json {
  const {
    source,
    data,
  } = options;
  
  if (typeof source == 'string') {
    const match = source.match(RE_FULL_SUBSTITUTION);
    if (match) {
      const path = match[1];
      
      return _.get(data, path);
    }
    
    return renderText(source, data);
  } else if (typeof source == 'object') {
    if (source == null) {
      return null;
    }
    
    if (Array.isArray(source)) {
      return source.map(item => renderJson({ source: item, data }));
    }
    
    let result: Obj = {};
    
    if (_.isPlainObject(source['$merge'])) {
      const old = (_.isPlainObject(options.old)) ? options.old as Obj : {};
      const oldKeys = Object.keys(old);
      const merge = source['$merge'] as Obj;
      const mergeKeys = Object.keys(merge);
      const prepare: Obj = {};
      
      for (const mergeKey of mergeKeys) {
        const key = renderText(mergeKey, data);
        
        prepare[key] = renderJson({ source: merge[mergeKey], old: old[key], data });
      }
      for (const key of oldKeys) {
        if (prepare[key] == undefined) {
          prepare[key] = old[key];
        }
      }
      
      const resultKeys = Object.keys(prepare);
      if (source['$sort']) {
        resultKeys.sort();
      }
      
      for (const key of resultKeys) {
        result[key] = prepare[key];
      }
    } else if (source['$default']) {
      return options.old ?? source['$default'];
    } else {
      const sourceKeys = Object.keys(source);
      for (const key of sourceKeys) {
        result[key] = renderJson({ source: source[key], data });
      }
    }
    
    return result;
  }
  
  return source;
}
