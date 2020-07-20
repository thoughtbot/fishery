import { DeepPartial, GeneratorFn, BuildOptions, GeneratorFnOptions, HookFn } from './types';
export declare class Factory<T, I = any> {
    private readonly generator;
    private nextId;
    private _afterBuilds;
    private _associations;
    private _params;
    private _transient;
    constructor(generator: (opts: GeneratorFnOptions<T, I>) => T);
    /**
     * Define a factory. This factory needs to be registered with
     * `register` before use.
     * @template T The object the factory builds
     * @template I The transient parameters that your factory supports
     * @param generator - your factory function
     */
    static define<T, I = any, C = Factory<T, I>>(this: new (generator: GeneratorFn<T, I>) => C, generator: GeneratorFn<T, I>): C;
    /**
     * Build an object using your factory
     * @param params
     * @param options
     */
    build(params?: DeepPartial<T>, options?: BuildOptions<T, I>): T;
    buildList(number: number, params?: DeepPartial<T>, options?: BuildOptions<T, I>): T[];
    /**
     * Extend the factory by adding a function to be called after an object is built.
     * @param afterBuildFn - the function to call. It accepts your object of type T. The value this function returns gets returned from "build"
     * @returns a new factory
     */
    afterBuild(afterBuildFn: HookFn<T>): this;
    /**
     * Extend the factory by adding default associations to be passed to the factory when "build" is called
     * @param associations
     * @returns a new factory
     */
    associations(associations: Partial<T>): this;
    /**
     * Extend the factory by adding default parameters to be passed to the factory when "build" is called
     * @param params
     * @returns a new factory
     */
    params(params: DeepPartial<T>): this;
    /**
     * Extend the factory by adding default transient parameters to be passed to the factory when "build" is called
     * @param transient - transient params
     * @returns a new factory
     */
    transient(transient: Partial<I>): this;
    /**
     * Sets sequence back to its default value
     */
    rewindSequence(): void;
    protected clone<C extends Factory<T, I>>(this: C): C;
    protected sequence(): number;
}
