export {};

declare global {
  /**
   * `Expand` expands the typedef of `<T>` in your IDE's Intellisense.
   * - Works on functions, promises, arrays, and objects.
   * - If `<T>` is an object or array, it will only be expanded one level deep.
   */
  type Expand<T> = T extends (...args: infer A) => infer FR
    ? (...args: Expand<A>) => Expand<FR>
    : T extends Promise<infer PR>
    ? Promise<Expand<PR>>
    : T extends Array<infer E>
    ? Array<Expand<E>>
    : T extends infer O
    ? { [K in keyof O]: O[K] }
    : never;
}
