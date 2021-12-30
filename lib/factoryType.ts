/**
 * Help the compiler infer your factory type in createFactory
 * This isn't always needed but can be useful and avoids having to
 * explicitly define all generic parameters, which can be quite complex
 *
 * Will be unnecessary once TypeScript has partial type inference
 * https://github.com/microsoft/TypeScript/pull/26349
 *
 * Usage: createFactory({ type: factoryType<MyType>() })
 */
export function factoryType<T>() {
  const t = null as unknown as T;
  return [t, t] as const;
}
