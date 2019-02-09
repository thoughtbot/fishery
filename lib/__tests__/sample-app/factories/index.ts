import user from './user';
import post from './post';
import { register } from '../../../register';
import { Factories } from '../types';

export const factories: Factories = {
  user,
  post,
};

register(factories);

export { user, post };
