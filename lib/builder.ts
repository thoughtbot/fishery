import {
  GeneratorFn,
  HookFn,
  GeneratorFnOptions,
  DeepPartial,
  CreateFn,
  BulkCreateFn,
} from './types';
import mergeWith from 'lodash.mergewith';
import { merge, mergeCustomizer } from './merge';

export class FactoryBuilder<T, I> {
  constructor(
    private generator: GeneratorFn<T, I>,
    private sequence: number,
    private params: DeepPartial<T>,
    private transientParams: Partial<I>,
    private associations: Partial<T>,
    private afterBuilds: HookFn<T>[],
    private onCreates: CreateFn<T>[],
    private onBulkCreates: BulkCreateFn<T>[],
  ) {}

  build() {
    const generatorOptions: GeneratorFnOptions<T, I> = {
      sequence: this.sequence,
      afterBuild: this.setAfterBuild,
      onCreate: this.setOnCreate,
      onBulkCreate: this.setOnBulkCreate,
      params: this.params,
      associations: this.associations,
      transientParams: this.transientParams,
    };

    const object = this.generator(generatorOptions);
    this._mergeParamsOntoObject(object);
    this._callAfterBuilds(object);
    return object;
  }

  async create() {
    const object = this.build();
    return this._callOnCreates(object);
  }

  setAfterBuild = (hook: HookFn<T>) => {
    this.afterBuilds = [hook, ...this.afterBuilds];
  };

  setOnCreate = (hook: CreateFn<T>) => {
    this.onCreates = [hook, ...this.onCreates];
  };

  setOnBulkCreate = (hook: BulkCreateFn<T>) => {
    this.onBulkCreates = [hook, ...this.onBulkCreates];
  }

  // merge params and associations into object. The only reason 'associations'
  // is separated is because it is typed differently from `params` (Partial<T>
  // vs DeepPartial<T>) so can do the following in a factory:
  // `user: associations.user || userFactory.build()`
  _mergeParamsOntoObject(object: T) {
    merge(object, this.params, this.associations, mergeCustomizer);
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

  _callOnCreates(object: T): Promise<T> {
    let created = Promise.resolve(object);

    this.onCreates.forEach(onCreate => {
      if (typeof onCreate === 'function') {
        created = created.then(onCreate);
      } else {
        throw new Error('"onCreate" must be a function');
      }
    });

    return created;
  }
}
