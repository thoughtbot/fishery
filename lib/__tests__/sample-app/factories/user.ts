import { Factory } from '../../../factory';
import { User } from '../types';

export default Factory.define<User>(
  ({ sequence, params, instance, factories }) => ({
    id: `user-${sequence}`,
    name: 'Bob',
    post: params.post || factories.post.build({ user: instance }),
  }),
);
