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
  once?: boolean;
};

export type DirConfig = {
  dir: string;
};

export type TaskConfig =
  | FileConfig
  | DirConfig
;

export type SourceConfig = {
  tasks: TaskConfig[];
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
  overwrite: boolean;
};

export type Dir = {
  dir: string;
};

export type Task =
  | File
  | Dir
;

export type Source = {
  src: string;
  dest: string;
  tasks: Task[];
};
