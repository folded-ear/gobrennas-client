import LoadObject from "./LoadObject";
import { Maybe } from "graphql/jsutils/Maybe";

export interface RippedLO<T> {
    loading?: boolean;
    deleting?: boolean;
    data?: T;
    error?: Maybe<Error>;
}

export function ripLoadObject<T>(lo: LoadObject<T>): RippedLO<T> {
    if (import.meta.env.DEV) {
        if (lo.isCreating()) {
            // eslint-disable-next-line no-console
            console.warn(
                "LoadObject.creating is deprecated. Use .loading (as Apollo does).",
                lo,
            );
        }
        if (lo.isUpdating()) {
            // eslint-disable-next-line no-console
            console.warn(
                "LoadObject.updating is deprecated. Use .loading (as Apollo does).",
                lo,
            );
        }
    }
    return {
        loading: lo.isLoading() || lo.isCreating() || lo.isUpdating(),
        deleting: lo.isDeleting(),
        data: lo.getValue() || undefined,
        error: lo.getError(),
    };
}

export function requiredData<T>(rlo: RippedLO<T> | undefined): T {
    if (!rlo?.data) {
        throw new Error("Expected ripped load object to have data.");
    }
    return rlo.data;
}

export function mapData<T, R>(
    rlo: RippedLO<T>,
    fn: (data: T) => R | undefined,
) {
    // if data is null/undefined, this cast is safe
    if (!rlo.data) return rlo as unknown as RippedLO<R>;
    const data = fn(rlo.data);
    // if data is strict-equal (i.e., fn was no-op), this cast is safe
    if (data === rlo.data) return rlo as unknown as RippedLO<R>;
    return {
        ...rlo,
        data,
    };
}
