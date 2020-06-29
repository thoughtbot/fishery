import { Factory } from 'fishery';
import { Post } from '../types';
import userFactory from './user';

const postFactory: Factory<Post> = Factory.define<Post>(
  ({ sequence, params, associations }) => ({
    id: sequence,
    title: 'A Post',
    user: associations.user || userFactory.build(params.user || {}),
  }),
);

export default postFactory;
