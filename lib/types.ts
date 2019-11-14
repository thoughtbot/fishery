export type GeneratorFnOptions<T, F, I> = {
  sequence: number;
  afterCreate: (fn: HookFn<T>) => any;
  params: Partial<T>;
  transientParams: Partial<I>;
  factories: F;
};
export type GeneratorFn<T, F, I> = (opts: GeneratorFnOptions<T, F, I>) => T;
export type HookFn<T> = (object: T) => any;
export type BuildOptions<I> = {
  transient: Partial<I>;
};
