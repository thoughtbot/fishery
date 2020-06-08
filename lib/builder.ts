import { GeneratorFn, HookFn, GeneratorFnOptions, DeepPartial } from './types';
import merge from 'lodash.merge';

export class FactoryBuilder<T, F, I> {
  constructor(
    private generator: GeneratorFn<T, F, I>,
    private factories: F,
    private sequence: number,
    private params: DeepPartial<T>,
    private transientParams: Partial<I>,
    private associations: Partial<T>,
    private afterCreates: HookFn<T>[],
  ) {}

  build() {
    const generatorOptions: GeneratorFnOptions<T, F, I> = {
      sequence: this.sequence,
      afterCreate: this.setAfterCreate,
      factories: this.factories,
      params: this.params,
      associations: this.associations,
      transientParams: this.transientParams,
    };

    const object = this.generator(generatorOptions);

    // merge params and associations into object. The only reason 'associations'
    // is separated is because it is typed differently from `params` (Partial<T>
    // vs DeepPartial<T>) so can do the following in a factory:
    // `user: associations.user || factories.user.build()`
    merge(object, this.params, this.associations);
    this._callAfterCreates(object);
    return object;
  }

  setAfterCreate = (hook: HookFn<T>) => {
    this.afterCreates = [hook, ...this.afterCreates];
  };

  _callAfterCreates(object: T) {
    this.afterCreates.forEach(afterCreate => {
      if (typeof afterCreate === 'function') {
        afterCreate(object);
      } else {
        throw new Error('"afterCreate" must be a function');
      }
    });
  }
}
