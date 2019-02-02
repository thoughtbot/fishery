import { GeneratorFn, HookFn, GeneratorFnOptions } from './types';

export class FactoryBuilder<T> {
  private afterCreate?: HookFn<T>;
  constructor(
    private generator: GeneratorFn<T>,
    private sequence: number,
    private params: Partial<T>,
  ) {}

  build() {
    const generatorOptions: GeneratorFnOptions<T> = {
      sequence: this.sequence,
      afterCreate: this.setAfterCreate,
      params: this.params,
    };

    const object: T = {
      ...this.generator(generatorOptions),
      ...this.params,
    };

    this._callAfterCreate(object);
    return object;
  }

  setAfterCreate = (hook: HookFn<T>) => {
    this.afterCreate = hook;
  };

  _callAfterCreate(object: T) {
    if (this.afterCreate) {
      if (typeof this.afterCreate === 'function') {
        this.afterCreate(object);
      } else {
        throw new Error('"afterCreate" must be a function');
      }
    }
  }
}
