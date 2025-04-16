export const arrayify = <
  T,
  R = T extends Array<infer S> ? NonNullable<S> : NonNullable<T>,
>(
  ...args: T[]
) =>
  args.reduce<R[]>((arr, curr) => {
    arr.push(
      ...(Array.isArray(curr)
        ? curr.filter(it => it != null)
        : // eslint-disable-next-line sonarjs/no-nested-conditional
          curr == null
          ? []
          : [curr]),
    )
    return arr
  }, [])
