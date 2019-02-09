import user from './user';
import post from './post';
import { register } from 'fishery';
import { Factories } from '../types';

export const factories: Factories = {
  user,
  post,
};

register(factories);

export { user, post };
