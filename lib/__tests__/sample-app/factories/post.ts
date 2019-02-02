import { Factory } from '../../../factory';
import { Post } from '../types';
import { Factories } from './index';

export default Factory.define<Post>(
  ({ sequence, params, instance, factories }) => ({
    id: sequence,
    title: 'A Post',
    user: params.user || factories.user.build({ post: instance }),
  }),
);
