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
  OriginalType, // always the type when the factory originally defined
  ExtensionParams, // params that are added with traits/extend/.params
  Traits extends TraitsInputs<OriginalType, TraitsInput<OriginalType>>,
  Created,
  I,
  BuildType = OriginalType & ExtensionParams, // same as ExtensionParams but want to preserve name if passed with extend
> = {
  build: <BuildParams extends BuildType>(
    params?: keyof BuildParams extends keyof DeepPartial<BuildType>
      ? DeepPartial<BuildParams>
      : DeepPartial<BuildType>,
  ) => BuildType & BuildParams;
  extend: <NewType>(
    newParams: DeepPartial<NewType>,
  ) => FactoryInstance<
    OriginalType,
    ExtensionParams,
    Traits,
    Created,
    I,
    NewType extends BuildType ? NewType : BuildType & NewType
  >;
  params: <ParamsType extends BuildType>(
    params: DeepPartial<ParamsType>,
  ) => FactoryInstance<
    OriginalType,
    ExtensionParams & ParamsType,
    Traits,
    Created,
    I,
    BuildType & ParamsType
  >;
  create: Created extends {}
    ? (obj?: Partial<OriginalType>) => Promise<Created>
    : never;
} & {
  [Trait in keyof Traits]: Traits[Trait] extends (
    ...args: infer TraitParams
  ) => infer TraitReturn
    ? (
        ...args: TraitParams
      ) => FactoryInstance<
        OriginalType,
        ExtensionParams & TraitReturn,
        Traits,
        Created,
        I,
        BuildType & TraitReturn
      >
    : () => FactoryInstance<
        OriginalType,
        ExtensionParams,
        Traits,
        Created,
        I,
        BuildType
      >;
};

type BuildOptions<U> = {
  sequence: number;
  params: DeepPartial<U>;
};

export function createFactory<
  T, // Type of returned object
  Traits, // Type of traits
  Params extends T = T, // type of params passed to builder, same as T
  Created = unknown, // type of created object
  I = any, // type of transient params
  ExtensionParams = {}, // type of extra params
>(
  define: {
    type?: readonly [T, Params];
    build: (options: BuildOptions<Params>) => T;
    traits?: Traits extends TraitsInput<T> ? Traits : never;
    create?: (obj: T) => Promise<Created>;
  },
  params?: ExtensionParams,
): Traits extends TraitsInput<T>
  ? FactoryInstance<
      T,
      ExtensionParams,
      TraitsInputs<T, Traits>,
      Created,
      I,
      T & ExtensionParams
    >
  : FactoryInstance<
      T,
      ExtensionParams,
      TraitsInputs<T, {}>,
      Created,
      I,
      T & ExtensionParams
    > {
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
