import { GeneratorFn } from './types';
import { FactoryBuilder } from './builder';

export class Factory<T> {
  nextId: number = 0;
  constructor(private generator: GeneratorFn<T>) {}

  static define<T>(generator: GeneratorFn<T>) {
    return new Factory<T>(generator);
  }

  build(options: Partial<T> = {}): T {
    return new FactoryBuilder<T>(
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
