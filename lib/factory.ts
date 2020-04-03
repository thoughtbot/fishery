import { DeepPartial, GeneratorFn, BuildOptions } from './types';
import { FactoryBuilder } from './builder';

export interface AnyFactories {
  [key: string]: Factory<any>;
}

export class Factory<T, F = any, I = any> {
  private nextId: number = 0;
  private factories?: F;

  constructor(private generator: GeneratorFn<T, F, I>) {}

  /**
   * Define a factory. This factory needs to be registered with
   * `register` before use.
   * @param generator - your factory function
   */
  static define<T, F = any, I = any>(generator: GeneratorFn<T, F, I>) {
    return new Factory<T, F, I>(generator);
  }

  /**
   * Define a factory that does not need to be registered with `register`. The
   * factory will not have access the `factories` parameter. This can be useful
   * for one-off factories in individual tests
   * @param generator - your factory
   * function
   */
  static defineUnregistered<T, I = any>(generator: GeneratorFn<T, null, I>) {
    const factory = new Factory<T, null, I>(generator);
    factory.setFactories(null);
    return factory;
  }

  /**
   * Build an object using your factory
   * @param params
   * @param options
   */
  build(params: DeepPartial<T> = {}, options: BuildOptions<T, I> = {}): T {
    if (typeof this.factories === 'undefined') {
      this._throwFactoriesUndefined();
    }

    return new FactoryBuilder<T, F, I>(
      this.generator,
      this.factories,
      this.nextId++,
      params,
      options,
    ).build();
  }

  buildList(
    number: number,
    params: DeepPartial<T> = {},
    options: BuildOptions<T, I> = {},
  ): T[] {
    let list: T[] = [];
    for (let i = 0; i < number; i++) {
      list.push(this.build(params, options));
    }

    return list;
  }

  /**
   * Asynchronously create an object using your factory. Relies on the `create`
   * function defined in the factory
   * @param params
   * @param options
   */
  create(
    params: DeepPartial<T> = {},
    options: BuildOptions<T, I> = {},
  ): Promise<T> {
    if (typeof this.factories === 'undefined') {
      this._throwFactoriesUndefined();
    }

    return new FactoryBuilder<T, F, I>(
      this.generator,
      this.factories,
      this.nextId++,
      params,
      options,
    ).create();
  }

  createList(
    number: number,
    params: DeepPartial<T> = {},
    options: BuildOptions<T, I> = {},
  ): Promise<T[]> {
    let promises: Promise<T>[] = [];
    for (let i = 0; i < number; i++) {
      promises.push(this.create(params, options));
    }

    return Promise.all(promises);
  }

  setFactories(factories: F) {
    this.factories = factories;
  }

  _throwFactoriesUndefined(): never {
    throw new Error(
      'Your factory has not been registered. Call `register` before using factories or define your factory with `defineUnregistered` instead of `define`',
    );
  }
}
