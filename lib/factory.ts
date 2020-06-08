import {
  DeepPartial,
  GeneratorFn,
  BuildOptions,
  GeneratorFnOptions,
  HookFn,
} from './types';
import { FactoryBuilder } from './builder';

const SEQUENCE_START_VALUE = 1;

export class Factory<T, I = any> {
  private nextId: number = SEQUENCE_START_VALUE;
  private _afterBuilds: HookFn<T>[] = [];
  private _associations: Partial<T> = {};
  private _params: DeepPartial<T> = {};
  private _transient: Partial<I> = {};

  constructor(
    private readonly generator: (opts: GeneratorFnOptions<T, I>) => T,
  ) {}

  /**
   * Define a factory. This factory needs to be registered with
   * `register` before use.
   * @template T The object the factory builds
   * @template I The transient parameters that your factory supports
   * @param generator - your factory function
   */
  static define<T, I = any, C = Factory<T, I>>(
    this: new (generator: GeneratorFn<T, I>) => C,
    generator: GeneratorFn<T, I>,
  ): C {
    return new this(generator);
  }

  /**
   * Build an object using your factory
   * @param params
   * @param options
   */
  build(params: DeepPartial<T> = {}, options: BuildOptions<T, I> = {}): T {
    return new FactoryBuilder<T, I>(
      this.generator,
      this.sequence(),
      { ...this._params, ...params },
      { ...this._transient, ...options.transient },
      { ...this._associations, ...options.associations },
      this._afterBuilds,
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
   * @param afterBuildFn - the function to call. It accepts your object of type T. The value this function returns gets returned from "build"
   * @returns a new factory
   */
  afterBuild(afterBuildFn: HookFn<T>): this {
    const factory = this.clone();
    factory._afterBuilds.push(afterBuildFn);
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

  protected clone<C extends Factory<T, I>>(this: C): C {
    const copy = new (this.constructor as {
      new (generator: GeneratorFn<T, I>): C;
    })(this.generator);
    Object.assign(copy, this);
    return copy;
  }

  protected sequence() {
    return this.nextId++;
  }
}
