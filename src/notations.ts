import * as yaml from 'js-yaml';
import type { Json } from './types';

export type Parse = (content: string) => Json;

export type Stringify = (obj: Json) => string;

export type Notation = {
  parse: Parse;
  stringify: Stringify;
};

export type Notations = {
  json: Notation;
  yaml: Notation;
};

export function fromJson(str: string): Json {
  return JSON.parse(str);
}

export function toJson(obj: Json): string {
  return JSON.stringify(obj, undefined, 2) + '\n';
}

export function fromYaml(str: string): Json {
  return yaml.load(str) as Json;
}

export function toYaml(obj: Json): string {
  return yaml.dump(obj, {
    lineWidth: 100,
    noRefs: true,
    quotingType: '"',
  });
}

export const NOTATIONS: Notations = {
  json: {
    parse: fromJson,
    stringify: toJson,
  },
  yaml: {
    parse: fromYaml,
    stringify: toYaml,
  },
};
