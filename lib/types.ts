export type GeneratorFnOptions<T, F> = {
  sequence: number;
  afterCreate: (fn: HookFn<T>) => any;
  params: Partial<T>;
  instance: T;
  factories: F;
};
export type GeneratorFn<T, F> = (opts: GeneratorFnOptions<T, F>) => T;
export type HookFn<T> = (object: T) => any;
