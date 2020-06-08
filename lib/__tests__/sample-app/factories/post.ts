import { Factory } from 'fishery';
import { Post } from '../types';
import userFactory from './user';

export default Factory.define<Post>(({ sequence, params }) => ({
  id: sequence,
  title: 'A Post',
  user: userFactory.build(params.user || {}),
}));
