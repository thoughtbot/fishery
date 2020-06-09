import {
  DeepPartial,
  GeneratorFn,
  BuildOptions,
  GeneratorFnOptions,
  HookFn,
} from './types';
import { FactoryBuilder } from './builder';

export interface AnyFactories {
  [key: string]: Factory<any>;
}

const SEQUENCE_START_VALUE = 1;

export class Factory<T, F = any, I = any> {
  private nextId: number = SEQUENCE_START_VALUE;
  private factories?: F;
  private _afterCreates: HookFn<T>[] = [];
  private _associations: Partial<T> = {};
  private _params: DeepPartial<T> = {};
  private _transient: Partial<I> = {};

  constructor(
    private readonly generator: (opts: GeneratorFnOptions<T, F, I>) => T,
  ) {}

  /**
   * Define a factory. This factory needs to be registered with
   * `register` before use.
   * @template T The object the factory builds
   * @template F The `factories` object
   * @template I The transient parameters that your factory supports
   * @param generator - your factory function
   */
  static define<T, F = any, I = any, C = Factory<T, F, I>>(
    this: new (generator: GeneratorFn<T, F, I>) => C,
    generator: GeneratorFn<T, F, I>,
  ): C {
    return new this(generator);
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
      throw new Error(
        'Your factory has not been registered. Call `register` before using factories or define your factory with `defineUnregistered` instead of `define`',
      );
    }

    return new FactoryBuilder<T, F, I>(
      this.generator,
      this.factories,
      this.sequence(),
      { ...this._params, ...params },
      { ...this._transient, ...options.transient },
      { ...this._associations, ...options.associations },
      this._afterCreates,
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
   * Extend the factory by adding a function to be called after an object is built.
   * @param afterCreateFn - the function to call. It accepts your object of type T. The value this function returns gets returned from "build"
   * @returns a new factory
   */
  afterCreate(afterCreateFn: HookFn<T>): this {
    const factory = this.clone();
    factory._afterCreates.push(afterCreateFn);
    return factory;
  }

  /**
   * Extend the factory by adding default associations to be passed to the factory when "build" is called
   * @param associations
   * @returns a new factory
   */
  associations(associations: Partial<T>): this {
    const factory = this.clone();
    factory._associations = { ...this._associations, ...associations };
    return factory;
  }

  /**
   * Extend the factory by adding default parameters to be passed to the factory when "build" is called
   * @param params
   * @returns a new factory
   */
  params(params: DeepPartial<T>): this {
    const factory = this.clone();
    factory._params = { ...this._params, ...params };
    return factory;
  }

  /**
   * Extend the factory by adding default transient parameters to be passed to the factory when "build" is called
   * @param transient - transient params
   * @returns a new factory
   */
  transient(transient: Partial<I>): this {
    const factory = this.clone();
    factory._transient = { ...this._transient, ...transient };
    return factory;
  }

  /**
   * Sets sequence back to its default value
   */
  rewindSequence() {
    this.nextId = SEQUENCE_START_VALUE;
  }

  setFactories(factories: F) {
    this.factories = factories;
  }

  protected clone<C extends Factory<T, F, I>>(this: C): C {
    const copy = new (this.constructor as {
      new (generator: GeneratorFn<T, F, I>): C;
    })(this.generator);
    Object.assign(copy, this);
    return copy;
  }

  protected sequence() {
    return this.nextId++;
  }
}
