import { DeepPartial } from './types';
import { merge, mergeCustomizer } from './merge';

export function factoryType<T>() {
  const t = null as unknown as T;
  return [t, t] as const;
}

type TraitsInput<T, Traits> = {
  [Trait in keyof Traits]: Traits[Trait] extends () => infer R
    ? () => R
    : () => Partial<T>;
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
  create: Created extends {} ? (obj?: Partial<T>) => Promise<Created> : never;
} & {
  [Trait in keyof TraitsObj]: () => FactoryInstance<
    TraitsObj[Trait] extends () => infer U ? T & U : T,
    TraitsObj,
    Created,
    I
  >;
};

export type BuildOptions<U> = {
  sequence: number;
  params: DeepPartial<U>;
};

export function createFactory<
  T,
  Params extends T = T,
  Traits extends TraitsInput<T, {}> = any,
  Created = unknown,
  I = any,
>(
  define: {
    type?: readonly [T, Params];
    build: (options: BuildOptions<Params>) => T;
    traits?: Traits;
    create?: (obj: T) => Promise<Created>;
  },
  params?: DeepPartial<T>,
): Traits extends infer TraitsInferred
  ? FactoryInstance<T, TraitsInput<T, TraitsInferred>, Created, I>
  : FactoryInstance<T, TraitsInput<T, {}>, Created, I> {
  let sequence = 1;

  const build = (buildParams: DeepPartial<Params>) => {
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
