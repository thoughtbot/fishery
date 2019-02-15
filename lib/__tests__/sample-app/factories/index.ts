import user from './user';
import post from './post';
import { register } from 'fishery';
import { Factories } from '../types';

export const factories: Factories = register({
  user,
  post,
});

export { user, post };
