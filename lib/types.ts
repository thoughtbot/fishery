export type GeneratorFnOptions<T> = {
  sequence: number;
  afterCreate: (fn: HookFn<T>) => any;
  params: Partial<T>;
};
export type GeneratorFn<T> = (opts: GeneratorFnOptions<T>) => T;
export type HookFn<T> = (object: T) => any;
