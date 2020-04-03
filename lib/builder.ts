import {
  GeneratorFn,
  HookFn,
  GeneratorFnOptions,
  DeepPartial,
  BuildOptions,
} from './types';
import merge from 'lodash.merge';

export class FactoryBuilder<T, F, I> {
  private afterBuildHook?: HookFn<T>;
  private onCreateHook?: HookFn<T>;
  private transientParams: Partial<I>;
  private associations: Partial<T>;

  constructor(
    private generator: GeneratorFn<T, F, I>,
    private factories: F,
    private sequence: number,
    private params: DeepPartial<T>,
    options: BuildOptions<T, I>,
  ) {
    this.transientParams = options.transient || {};
    this.associations = options.associations || {};
  }

  build() {
    const generatorOptions: GeneratorFnOptions<T, F, I> = {
      sequence: this.sequence,
      onCreate: this.setOnCreateHook,
      afterBuild: this.setAfterBuildHook,
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
    this._callAfterBuildHook(object);
    return object;
  }

  async create() {
    const object = this.build();
    return this._callOnCreateHook(object);
  }

  setOnCreateHook = (hook: HookFn<T>) => {
    this.onCreateHook = hook;
  };

  setAfterBuildHook = (hook: HookFn<T>) => {
    this.afterBuildHook = hook;
  };

  _callAfterBuildHook(object: T) {
    if (this.afterBuildHook) {
      if (typeof this.afterBuildHook === 'function') {
        this.afterBuildHook(object);
      } else {
        throw new Error('"afterBuild" must be a function');
      }
    }
  }

  _callOnCreateHook(object: T) {
    if (this.onCreateHook) {
      if (typeof this.onCreateHook === 'function') {
        return this.onCreateHook(object);
      } else {
        throw new Error('"onCreate" must be a function');
      }
    } else {
      throw new Error(
        'Tried to call `create` but `onCreate` function is not defined for the factory. Define this function when calling `factory.define`',
      );
    }
  }
}
