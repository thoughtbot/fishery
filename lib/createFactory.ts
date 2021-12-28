import { DeepPartial } from './types';

type TraitsInput<T, Traits> = {
  [Trait in keyof Traits]: () => Partial<T>;
};

export type FactoryInstance<
  T,
  TraitsObj extends TraitsInput<T, {}>,
  Created,
  I,
> = {
  build: <BuildParams extends T>(
    params: keyof BuildParams extends keyof DeepPartial<T>
      ? DeepPartial<BuildParams>
      : DeepPartial<T>,
  ) => T & BuildParams;
  extend: <NewType>(
    params: NewType,
  ) => FactoryInstance<T & NewType, TraitsObj, Created, I>;
  params: (params: DeepPartial<T>) => FactoryInstance<T, TraitsObj, Created, I>;
  create: Created extends Record<any, any>
    ? (obj: Partial<T>) => Promise<Created>
    : never;
} & {
  [Trait in keyof TraitsObj]: () => FactoryInstance<
    TraitsObj[Trait] extends () => infer U ? T & U : T,
    TraitsObj,
    Created,
    I
  >;
};

export function createFactory<
  T,
  TraitsInputs extends TraitsInput<T, {}>,
  I,
  Created,
>(
  define: {
    build: () => T;
    traits?: TraitsInputs;
    create?: (obj: T) => Promise<Created>;
  },
  params?: DeepPartial<T>,
): FactoryInstance<T, TraitsInputs, Created, I> {
  return 1 as any;
}
