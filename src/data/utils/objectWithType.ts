import { Maybe } from "graphql/jsutils/Maybe";

export default function objectWithType<T, O extends { __typename?: T }>(
    ing: Maybe<O>,
): Maybe<O & { type: T | undefined }> {
    return ing
        ? {
              ...ing,
              type: ing.__typename,
          }
        : null;
}
