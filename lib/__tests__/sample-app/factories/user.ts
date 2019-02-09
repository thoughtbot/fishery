import { Factory } from 'fishery';
import { User, Factories } from '../types';

export default Factory.define<User, Factories>(
  ({ sequence, params, instance, factories }) => ({
    id: `user-${sequence}`,
    name: 'Bob',
    post: params.post || factories.post.build({ user: instance }),
  }),
);
