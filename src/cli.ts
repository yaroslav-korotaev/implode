import { execute } from 'hurp-cli';
import {
  Context,
  commands,
} from './commands';

async function main(): Promise<void> {
  const ctx: Context = {};
  
  await execute(process.argv.slice(2), ctx, {
    children: commands,
  });
}

main().catch(err => console.error(err));
