import {
  forCommand,
  forGroup,
} from 'hurp-cli';

export type Context = {};

export const command = forCommand<Context>();
export const group = forGroup<Context>();
