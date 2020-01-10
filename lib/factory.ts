import { DeepPartial, GeneratorFn, BuildOptions } from './types';
import { FactoryBuilder } from './builder';

export interface AnyFactories {
  [key: string]: Factory<any>;
}

export class Factory<T, F = any, I = any> {
  private nextId: number = 0;

  // default to proxy object that raises a useful error if user attempts to access
  // 'factories' in their factory without first registering their factory
  private factories: F = (uninitializedFactories as unknown) as F;

  constructor(private generator: GeneratorFn<T, F, I>) {}

  static define<T, F = any, I = any>(generator: GeneratorFn<T, F, I>) {
    return new Factory<T, F, I>(generator);
  }

  build(params: DeepPartial<T> = {}, options: BuildOptions<T, I> = {}): T {
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

  setFactories(factories: F) {
    this.factories = factories;
  }
}

// proxy object that raises a useful error if user tries to use `factories`
// without first registering their factory
const uninitializedFactories = new Proxy(
  {},
  {
    get: (_obj, prop) => {
      throw new Error(
        `Attempted to call 'factories.${String(
          prop,
        )}', but 'factories' is undefined. Register your factories with 'register' before use if using the 'factories' argument`,
      );
    },
  },
);
