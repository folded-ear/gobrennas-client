import LoadObject from "./LoadObject";

export interface RippedLO<T> {
    loading?: boolean;
    deleting?: boolean;
    data?: T;
    error?: any;
}

export function ripLoadObject<T>(lo: LoadObject<T>): RippedLO<T> {
    return {
        loading: lo.isLoading(),
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

export function mapData<T, R>(rlo: RippedLO<T>, fn: (T) => R) {
    if (!rlo.data) return rlo;
    const data = fn(rlo.data);
    if (data === rlo.data) return rlo;
    return {
        ...rlo,
        data,
    };
}
