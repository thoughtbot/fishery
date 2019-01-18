import { Factory } from '../../../factory';
import { User } from '../types';

export default Factory.define<User>(({ sequence }) => ({
  id: `user-${sequence}`,
  name: 'Bob',
}));
