export type Plain = string | number | boolean | null;

export type Obj = { [key: string]: Json };

export type Arr = Json[];

export type Json = Plain | Obj | Arr;

export type Data = Obj;

export type FileFormat = 'plain' | 'json' | 'yaml';

export type FileConfig = {
  src: string;
  dest?: string;
  format?: FileFormat;
};

export type SourceConfig = {
  files: FileConfig[];
}

export type Config = {
  source: string;
  data: Data;
};

export type File = {
  src: string;
  dest: string;
  format: FileFormat;
  content: string;
};

export type Source = {
  src: string;
  dest: string;
  files: File[];
};
