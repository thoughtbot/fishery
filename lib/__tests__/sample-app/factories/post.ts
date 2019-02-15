import { Factory } from 'fishery';
import { Post, Factories } from '../types';

export default Factory.define<Post, Factories>(
  ({ sequence, params, factories }) => ({
    id: sequence,
    title: 'A Post',
    user: params.user || factories.user.build(),
  }),
);
