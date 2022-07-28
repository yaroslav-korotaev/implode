import { implode } from './';

async function main(): Promise<void> {
  await implode('../hurp-cli', process.cwd() + '/');
}

main().catch(err => console.error(err));
