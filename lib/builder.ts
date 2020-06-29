import { GeneratorFn, HookFn, GeneratorFnOptions, DeepPartial } from './types';
import merge from 'lodash.merge';

export class FactoryBuilder<T, I> {
  constructor(
    private generator: GeneratorFn<T, I>,
    private sequence: number,
    private params: DeepPartial<T>,
    private transientParams: Partial<I>,
    private associations: Partial<T>,
    private afterBuilds: HookFn<T>[],
  ) {}

  build() {
    const generatorOptions: GeneratorFnOptions<T, I> = {
      sequence: this.sequence,
      afterBuild: this.setAfterBuild,
      params: this.params,
      associations: this.associations,
      transientParams: this.transientParams,
    };

    const object = this.generator(generatorOptions);

    // merge params and associations into object. The only reason 'associations'
    // is separated is because it is typed differently from `params` (Partial<T>
    // vs DeepPartial<T>) so can do the following in a factory:
    // `user: associations.user || userFactory.build()`
    merge(object, this.params, this.associations);
    this._callAfterBuilds(object);
    return object;
  }

  setAfterBuild = (hook: HookFn<T>) => {
    this.afterBuilds = [hook, ...this.afterBuilds];
  };

  _callAfterBuilds(object: T) {
    this.afterBuilds.forEach(afterBuild => {
      if (typeof afterBuild === 'function') {
        afterBuild(object);
      } else {
        throw new Error('"afterBuild" must be a function');
      }
    });
  }
}
