import { Factory } from '../../../factory';
import { Post, Factories } from '../types';
import user from './user';

export default Factory.define<Post, Factories>(
  ({ sequence, params, instance, factories }) => ({
    id: sequence,
    title: 'A Post',
    user: params.user || factories.user.build({ post: instance }),
  }),
);
