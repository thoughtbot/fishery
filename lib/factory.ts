import {
  DeepPartial,
  GeneratorFn,
  BuildOptions,
  GeneratorFnOptions,
  HookFn,
  OnCreateFn,
  AfterCreateFn,
} from './types';
import { FactoryBuilder } from './builder';
import { merge, mergeCustomizer } from './merge';

const SEQUENCE_START_VALUE = 1;

export class Factory<T, I = any, C = T, P = DeepPartial<T>> {
  // id is an object so it is shared between extended factories
  private id: { value: number } = { value: SEQUENCE_START_VALUE };

  private _afterBuilds: HookFn<T>[] = [];
  private _afterCreates: AfterCreateFn<C>[] = [];
  private _onCreate?: OnCreateFn<T, C>;
  private _associations?: Partial<T>;
  private _params?: P;
  private _transient?: Partial<I>;

  constructor(
    private readonly generator: (opts: GeneratorFnOptions<T, I, C, P>) => T,
  ) {}

  /**
   * Define a factory.
   * @template T The object the factory builds
   * @template I The transient parameters that your factory supports
   * @template C The class of the factory object being created.
   * @param generator - your factory function
   */
  static define<T, I = any, C = T, P = DeepPartial<T>, F = Factory<T, I, C, P>>(
    this: new (generator: GeneratorFn<T, I, C, P>) => F,
    generator: GeneratorFn<T, I, C, P>,
  ): F {
    return new this(generator);
  }

  /**
   * Build an object using your factory
   * @param params
   * @param options
   */
  build(params?: P, options: BuildOptions<T, I> = {}): T {
    return this.builder(params, options).build();
  }

  buildList(
    number: number,
    params?: P,
    options: BuildOptions<T, I> = {},
  ): T[] {
    let list: T[] = [];
    for (let i = 0; i < number; i++) {
      list.push(this.build(params, options));
    }

    return list;
  }

  /**
   * Asynchronously create an object using your factory.
   * @param params
   * @param options
   */
  async create(
    params?: P,
    options: BuildOptions<T, I> = {},
  ): Promise<C> {
    return this.builder(params, options).create();
  }

  async createList(
    number: number,
    params?: P,
    options: BuildOptions<T, I> = {},
  ): Promise<C[]> {
    let list: Promise<C>[] = [];
    for (let i = 0; i < number; i++) {
      list.push(this.create(params, options));
    }

    return Promise.all(list);
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
   * Define a transform that occurs when `create` is called on the factory. Specifying an `onCreate` overrides any previous `onCreate`s.
   * To return a different type from `build`, specify a third type argument when defining the factory.
   * @param onCreateFn - The function to call. IT accepts your object of type T.
   * The value this function returns gets returned from "create" after any
   * `afterCreate`s are run
   * @return a new factory
   */
  onCreate(onCreateFn: OnCreateFn<T, C>): this {
    const factory = this.clone();
    factory._onCreate = onCreateFn;
    return factory;
  }

  /**
   * Extend the factory by adding a function to be called after creation. This is called after `onCreate` but before the object is returned from `create`.
   * If multiple are defined, they are chained.
   * @param afterCreateFn
   * @return a new factory
   */
  afterCreate(afterCreateFn: AfterCreateFn<C>): this {
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
  params(params: P): this {
    const factory = this.clone();
    factory._params = merge({}, this._params, params, mergeCustomizer);
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
    this.id.value = SEQUENCE_START_VALUE;
  }

  protected clone<F extends Factory<T, I, C, P>>(this: F): F {
    const copy = new (this.constructor as {
      new (generator: GeneratorFn<T, I, C, P>): F;
    })(this.generator);
    Object.assign(copy, this);
    copy._afterCreates = [...this._afterCreates];
    copy._afterBuilds = [...this._afterBuilds];
    return copy;
  }

  protected sequence() {
    return this.id.value++;
  }

  protected builder(params?: P, options: BuildOptions<T, I> = {}) {
    return new FactoryBuilder<T, I, C, P>(
      this.generator,
      this.sequence(),
      merge({}, this._params, params, mergeCustomizer),
      { ...this._transient, ...options.transient },
      { ...this._associations, ...options.associations },
      this._afterBuilds,
      this._afterCreates,
      this._onCreate,
    );
  }
}
