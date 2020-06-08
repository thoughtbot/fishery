import { Factory } from 'fishery';
import { User } from '../types';

export default Factory.define<User>(({ sequence }) => {
  return {
    id: `user-${sequence}`,
    name: 'Bob',
    post: null,
  };
});
