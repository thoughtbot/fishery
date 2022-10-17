import { DeepPartial } from './deepPartial';

export type GeneratorFnOptions<T, I, C, P> = {
  sequence: number;
  afterBuild: (fn: HookFn<T>) => any;
  afterCreate: (fn: AfterCreateFn<C>) => any;
  onCreate: (fn: OnCreateFn<T, C>) => any;
  params: P;
  associations: Partial<T>;
  transientParams: Partial<I>;
};
export type GeneratorFn<T, I, C, P> = (opts: GeneratorFnOptions<T, I, C, P>) => T;
export type HookFn<T> = (object: T) => any;
export type OnCreateFn<T, C = T> = (object: T) => C | Promise<C>;
export type AfterCreateFn<C> = (object: C) => C | Promise<C>;
export type BuildOptions<T, I> = {
  associations?: Partial<T>;
  transient?: Partial<I>;
};
