export declare type DeepPartial<T> = {
    [P in keyof T]?: unknown extends T[P] ? T[P] : DeepPartial<T[P]>;
};
export declare type GeneratorFnOptions<T, I> = {
    sequence: number;
    afterBuild: (fn: HookFn<T>) => any;
    params: DeepPartial<T>;
    associations: Partial<T>;
    transientParams: Partial<I>;
};
export declare type GeneratorFn<T, I> = (opts: GeneratorFnOptions<T, I>) => T;
export declare type HookFn<T> = (object: T) => any;
export declare type BuildOptions<T, I> = {
    associations?: Partial<T>;
    transient?: Partial<I>;
};
