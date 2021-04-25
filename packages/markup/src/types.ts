// eslint-disable-next-line @typescript-eslint/ban-types
export type Sync<T extends Function> = T extends (
  ...args: infer Args
) => Promise<infer R>
  ? (...args: Args) => R
  : never
