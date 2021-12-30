import { DeepPartial } from './types';
import { merge, mergeCustomizer } from './merge';

type TraitsInput<T> = {
  [key: string]: (...params: any[]) => DeepPartial<T>;
};

type TraitsInputs<T, Traits extends TraitsInput<T>> = {
  [Trait in keyof Traits]: Traits[Trait] extends (...params: infer P) => infer R
    ? R extends DeepPartial<T>
      ? (...params: P) => R
      : (...params: P) => DeepPartial<T>
    : never;
  // : (...args: any[]) => DeepPartial<T>;
};

export type FactoryInstance<
  T,
  Traits extends TraitsInputs<T, TraitsInput<T>>,
  Created,
  I,
> = {
  build: <BuildParams extends T>(
    params?: keyof BuildParams extends keyof DeepPartial<T>
      ? DeepPartial<BuildParams>
      : DeepPartial<T>,
  ) => T & BuildParams;
  extend: <NewType>(
    newParams: DeepPartial<NewType>,
  ) => FactoryInstance<
    NewType extends T ? NewType : T & NewType,
    Traits,
    Created,
    I
  >;
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
  T, // Type of returned object
  Traits, // Type of traits
  Params extends T = T, // type of params passed to builder, same as T
  Created = unknown, // type of created object
  I = any, // type of transient params
  ExtensionParams = DeepPartial<T>, // type of extra params
>(
  define: {
    type?: readonly [T, Params];
    build: (options: BuildOptions<Params>) => T;
    traits?: Traits extends TraitsInput<T> ? Traits : never;
    create?: (obj: T) => Promise<Created>;
  },
  params?: ExtensionParams,
): Traits extends TraitsInput<T>
  ? FactoryInstance<T, TraitsInputs<T, Traits>, Created, I>
  : FactoryInstance<T, TraitsInputs<T, {}>, Created, I> {
  let sequence = 1;

  let traitsObj: any = {};
  if (define.traits) {
    for (const traitName in define.traits) {
      const trait = define.traits[traitName];
      traitsObj[traitName] = (...traitParams: any[]) =>
        createFactory(define, merge({}, params, trait(...traitParams)));
    }
  }

  return {
    build(buildParams: DeepPartial<Params>) {
      const options = {
        sequence: sequence++,
        params: buildParams,
      };

      return merge(
        {},
        define.build(options),
        params,
        buildParams,
        mergeCustomizer,
      );
    },
    ...traitsObj,
    extend: <NewType extends T>(
      newParams: Omit<NewType, keyof T> & DeepPartial<T>,
    ) => {
      const mergedParams = merge({}, params, newParams, mergeCustomizer);
      return createFactory(define, mergedParams);
    },
  } as any;
}
