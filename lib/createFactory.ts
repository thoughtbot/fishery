import { DeepPartial } from './types';
import { merge, mergeCustomizer } from './merge';

export type BuildOptions<T> = {
  sequence: number;
  params: DeepPartial<T>;
};

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
    params?: keyof BuildParams extends keyof DeepPartial<T>
      ? DeepPartial<BuildParams>
      : DeepPartial<T>,
  ) => T & BuildParams;
  extend: <NewType>(
    params: NewType,
  ) => FactoryInstance<T & NewType, TraitsObj, Created, I>;
  params: (params: DeepPartial<T>) => FactoryInstance<T, TraitsObj, Created, I>;
  create: Created extends {} ? (obj: Partial<T>) => Promise<Created> : never;
} & {
  [Trait in keyof TraitsObj]: () => FactoryInstance<
    TraitsObj[Trait] extends () => infer U ? T & U : T,
    TraitsObj,
    Created,
    I
  >;
};

type BuildFnOption<T> = {
  (options: BuildOptions<T>): T;
};

type DefineOptions<T, TraitsInputs extends TraitsInput<T, {}>, Created> = {
  build: (options: BuildOptions<T>) => T;
  traits?: TraitsInputs;
  create?: (obj: T) => Promise<Created>;
};

export function createFactory<
  T,
  TraitsInputs extends TraitsInput<T, {}>,
  I,
  Created,
>(
  // define: DefineOptions<T, TraitsInputs, Created>,
  define: {
    build: (options: BuildOptions<T>) => T;
    traits?: TraitsInputs;
    create?: (obj: T) => Promise<Created>;
  },
  params?: DeepPartial<T>,
): FactoryInstance<T, TraitsInputs, Created, I> {
  let sequence = 1;

  const build = (buildParams: DeepPartial<T>) => {
    const options = {
      sequence: sequence++,
      params: buildParams,
    };

    return merge(define.build(options), params, buildParams, mergeCustomizer);
  };

  return {
    build,
  } as any;
}
