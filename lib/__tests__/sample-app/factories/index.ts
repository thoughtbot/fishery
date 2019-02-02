import user from './user';
import post from './post';
import { register } from '../../../register';

export const factories = {
  user,
  post,
};

export type Factories = typeof factories;

register<Factories>(factories);
