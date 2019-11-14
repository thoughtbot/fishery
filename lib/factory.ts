import { GeneratorFn, BuildOptions } from './types';
import { FactoryBuilder } from './builder';

export interface AnyFactories {
  [key: string]: Factory<any>;
}

export class Factory<T, F = any, I = any> {
  nextId: number = 0;
  factories?: F;

  constructor(private generator: GeneratorFn<T, F, I>) {}

  static define<T, F = any, I = any>(generator: GeneratorFn<T, F, I>) {
    return new Factory<T, F, I>(generator);
  }

  build(
    params: Partial<T> = {},
    options: BuildOptions<I> = { transient: {} },
  ): T {
    if (!this.factories) {
      throw new Error(
        'Factories have not been registered. Call `register` before using factories',
      );
    }

    return new FactoryBuilder<T, F, I>(
      this.generator,
      this.factories,
      this.nextId++,
      params,
      options.transient,
    ).build();
  }

  buildList(
    number: number,
    params: Partial<T> = {},
    options: BuildOptions<I> = { transient: {} },
  ): T[] {
    let list: T[] = [];
    for (let i = 0; i < number; i++) {
      list.push(this.build(params, options));
    }

    return list;
  }
}
