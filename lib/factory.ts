export type GeneratorFnOptions = {
  sequence: number;
};
export type GeneratorFn<T> = (opts: GeneratorFnOptions) => T;
export type GeneratorsMap = {
  [key: string]: GeneratorFn<any>;
};

let id = 1;
const nextId = () => id++;

const names = [
  'Stephen Hanson',
  'Harry Haller',
  'Hermoine Granger',
  'LongNameWithoutSpaces Bob',
  'Billy Pilgrim',
  'Kilgore Trout',
  'Bertuccio',
  'José Rodriguez',
  'Björn Månsson',
];

class FactoryClass {
  generators: GeneratorsMap = {};

  define<T>(name: string, generator: GeneratorFn<T>) {
    this.generators[name] = generator;
    // this.defineBuilder<T>(name);
  }

  build<T>(name: string, options: Partial<T>): T {
    return {
      ...this.generators[name]({ sequence: nextId() }),
      ...options,
    };
  }

  buildList<T>(number: number, name: string, options: Partial<T>): T[] {
    let list: T[] = [];
    for (let i = 0; i < number; i++) {
      list.push(this.build<T>(name, options));
    }

    return list;
  }

  // private defineBuilder<T>(name: string) {
  //   const methodName = `create${name.charAt(0).toUpperCase()}${name.substr(1)}`;
  //   this[methodName] = (options: Partial<T>) => this.build<T>(name, options);
  // }
}

export const Factory = new FactoryClass();
