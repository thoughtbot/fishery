import {
  GeneratorFn,
  HookFn,
  GeneratorFnOptions,
  DeepPartial,
  OnCreateFn,
  AfterCreateFn,
} from './types';
import { merge, mergeCustomizer } from './merge';

export class FactoryBuilder<T, I, C> {
  constructor(
    private generator: GeneratorFn<T, I, C>,
    private sequence: number,
    private params: DeepPartial<T>,
    private transientParams: Partial<I>,
    private associations: Partial<T>,
    private afterBuilds: HookFn<T>[],
    private afterCreates: AfterCreateFn<C>[],
    private onCreate?: OnCreateFn<T, C>,
  ) {}

  build() {
    const generatorOptions: GeneratorFnOptions<T, I, C> = {
      sequence: this.sequence,
      afterBuild: this.setAfterBuild,
      afterCreate: this.setAfterCreate,
      onCreate: this.setOnCreate,
      params: this.params,
      associations: this.associations,
      transientParams: this.transientParams,
    };

    const object = this._mergeParamsOntoObject(
      this.generator(generatorOptions),
    );
    this._callAfterBuilds(object);
    return object;
  }

  async create() {
    const object = this.build();
    const created = await this._callOnCreate(object);
    return this._callAfterCreates(created);
  }

  setAfterBuild = (hook: HookFn<T>) => {
    this.afterBuilds = [hook, ...this.afterBuilds];
  };

  setAfterCreate = (hook: AfterCreateFn<C>) => {
    this.afterCreates = [hook, ...this.afterCreates];
  };

  setOnCreate = (hook: OnCreateFn<T, C>) => {
    if (!this.onCreate) {
      this.onCreate = hook;
    }
  };

  // merge params and associations into object. The only reason 'associations'
  // is separated is because it is typed differently from `params` (Partial<T>
  // vs DeepPartial<T>) so can do the following in a factory:
  // `user: associations.user || userFactory.build()`
  _mergeParamsOntoObject(object: T) {
    if (typeof object !== 'object') {
      return object;
    }

    let targetObject: unknown = object;

    if (Object.getPrototypeOf(object) === Object.prototype) {
      targetObject = {};
    } else if (Array.isArray(object)) {
      targetObject = [];
    }

    return merge(
      targetObject,
      object,
      this.params,
      this.associations,
      mergeCustomizer,
    );
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

  async _callOnCreate(object: T): Promise<C> {
    if (!this.onCreate) {
      throw new Error('Attempted to call `create`, but no onCreate defined');
    }

    return this.onCreate(object);
  }

  async _callAfterCreates(object: C): Promise<C> {
    let created = object;

    for (const afterCreate of this.afterCreates) {
      if (typeof afterCreate === 'function') {
        created = await afterCreate(created);
      } else {
        throw new Error('"afterCreate" must be a function');
      }
    }

    return created;
  }
}
