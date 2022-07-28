import { command } from './helpers';
import { implode } from '../';

export default command({
  name: 'install',
  default: true,
  description: 'Install template in current directory',
  handler: async (ctx, args) => {
    await implode('.', process.cwd() + '/');
  },
});
