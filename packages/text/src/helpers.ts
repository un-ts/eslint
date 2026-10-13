export const arrayify = <
  T,
  R = T extends Array<infer S> ? NonNullable<S> : NonNullable<T>,
>(
  ...args: T[]
) =>
  args.reduce<R[]>((arr, curr) => {
    if (curr == null) {
      return arr
    }
    arr.push(
      ...(Array.isArray(curr)
        ? (curr as R[]).filter((it): it is R => it != null)
        : [curr as unknown as R]),
    )
    return arr
  }, [])
