export type GeneratorFnOptions = {
  sequence: number;
};
export type GeneratorFn<T> = (opts: GeneratorFnOptions) => T;

let id = 1;
const nextId = () => id++;

export class Factory<T> {
  generator: GeneratorFn<T>;

  constructor(generator: GeneratorFn<T>) {
    this.generator = generator;
  }

  static define<T>(generator: GeneratorFn<T>) {
    return new Factory<T>(generator);
  }

  build(options: Partial<T>): T {
    return {
      ...this.generator({ sequence: nextId() }),
      ...options,
    };
  }

  buildList(number: number, options: Partial<T>): T[] {
    let list: T[] = [];
    for (let i = 0; i < number; i++) {
      list.push(this.build(options));
    }

    return list;
  }
}
