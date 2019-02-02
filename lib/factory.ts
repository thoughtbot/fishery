import { GeneratorFn } from './types';
import { FactoryBuilder } from './builder';

interface AnyFactories {
  [key: string]: Factory<any>;
}

export class Factory<T, F = any> {
  nextId: number = 0;
  constructor(private generator: GeneratorFn<T, F>) {}

  static define<T, F = AnyFactories>(generator: GeneratorFn<T, F>) {
    return new Factory<T, F>(generator);
  }

  build(options: Partial<T> = {}): T {
    return new FactoryBuilder<T, F>(
      this.generator,
      this.nextId++,
      options,
    ).build();
  }

  buildList(number: number, options: Partial<T> = {}): T[] {
    let list: T[] = [];
    for (let i = 0; i < number; i++) {
      list.push(this.build(options));
    }

    return list;
  }
}
