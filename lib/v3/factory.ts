import { merge } from '../../lib/merge';
import { DeepPartial } from '../../lib/types/deepPartial';

const build = <T>(factory: T, partial: DeepPartial<T>): T => {
  const model = merge({}, factory, partial);
  return model;
};

const getFactory = () => {
  return {
    build,
  };
};

export { getFactory };
