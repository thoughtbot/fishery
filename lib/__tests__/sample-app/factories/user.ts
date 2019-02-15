import { Factory } from 'fishery';
import { User, Factories } from '../types';

export default Factory.define<User, Factories>(({ sequence }) => {
  return {
    id: `user-${sequence}`,
    name: 'Bob',
    post: null,
  };
});
