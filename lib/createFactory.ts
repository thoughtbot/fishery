import { DeepPartial } from './types';
import { merge, mergeCustomizer } from './merge';

export function factoryType<T>() {
  const t = null as unknown as T;
  return [t, t] as const;
}

type TraitsInput<T, Traits> = {
  [Trait in keyof Traits]: Traits[Trait] extends () => infer R
    ? () => R
    : Traits[Trait] extends (...params: infer P) => infer S
    ? (...params: P) => S
    : () => Partial<T>;
};

export type FactoryInstance<
  T,
  Traits extends TraitsInput<T, {}>,
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
  ) => FactoryInstance<T & NewType, Traits, Created, I>;
  params: (params: DeepPartial<T>) => FactoryInstance<T, Traits, Created, I>;
  create: Created extends {} ? (obj?: Partial<T>) => Promise<Created> : never;
} & {
  [Trait in keyof Traits]: Traits[Trait] extends (
    ...args: infer TraitParams
  ) => infer TraitReturn
    ? (
        ...args: TraitParams
      ) => FactoryInstance<T & TraitReturn, Traits, Created, I>
    : () => FactoryInstance<T, Traits, Created, I>;
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
): FactoryInstance<T, TraitsInput<T, Traits>, Created, I> {
  let sequence = 1;

  const build = (buildParams: DeepPartial<Params>) => {
    const options = {
      sequence: sequence++,
      params: buildParams,
    };

    return merge(define.build(options), params, buildParams, mergeCustomizer);
  };

  let traitsObj: TraitsInput<T, any> = {};
  for (const traitName in define.traits) {
    const trait = define.traits[traitName];
    traitsObj[traitName] = (params: any) =>
      createFactory(define, trait(params));
  }

  return {
    build,
    ...traitsObj,
  } as any;
}
