import { GeneratorFn, HookFn, GeneratorFnOptions, DeepPartial } from './types';
import isArray from 'lodash.isarray';
import mergeWith from 'lodash.mergewith';

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
    this._mergeParamsOntoObject(object);
    this._callAfterBuilds(object);
    return object;
  }

  setAfterBuild = (hook: HookFn<T>) => {
    this.afterBuilds = [hook, ...this.afterBuilds];
  };

  // merge params and associations into object. The only reason 'associations'
  // is separated is because it is typed differently from `params` (Partial<T>
  // vs DeepPartial<T>) so can do the following in a factory:
  // `user: associations.user || userFactory.build()`
  _mergeParamsOntoObject(object: T) {
    mergeWith(object, this.params, this.associations, mergeCustomizer);
  }

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

const mergeCustomizer = (_object: any, srcVal: any) => {
  if (isArray(srcVal)) {
    return srcVal;
  }
};
