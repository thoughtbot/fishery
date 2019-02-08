import { Factory, AnyFactories } from './factory';

// TODO: would like to type this argument as AnyFactories but issue with
// inheritance since user-defined Factories will not have index property set
// see: https://github.com/Microsoft/TypeScript/issues/15300
export const register = (allFactories: object) => {
  const factories = allFactories as AnyFactories;
  Object.keys(factories).forEach((key: string) => {
    factories[key].factories = factories;
  });
};
