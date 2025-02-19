/* eslint-disable */
// noinspection JSUnusedGlobalSymbols

type LoadObjectOperation =
    | "NONE"
    | "CREATING"
    | "LOADING"
    | "UPDATING"
    | "DELETING";

/**
 * A secret key that is used to prevent direct construction of these objects,
 * this is effectively used to ensure that the constructor is private.
 */
const SECRET = "SECRET_" + Math.random();

/**
 * Immutable Load Object. This is an immutable object that represents a
 * particular point in time for a request. Some examples:
 *
 * Render spinners while loading:
 *
 *   if (loadObject.isLoading()) {
 *     return <Spinner />;
 *   }
 *   return <div>...</div>;
 *
 * Render errors with an error:
 *
 *   if (loadObject.hasError()) {
 *     return <ErrorBox error={loadObject.getError()} />;
 *   }
 *   return <div>...</div>;
 *
 * Render normally when there's a value:
 *
 *   return <div>{loadObject.getValue().text}</div>;
 *
 */

class LoadObject<V> {
    _operation: LoadObjectOperation;
    _value: V | null | undefined;
    _error: Error | null | undefined;
    _hasValue: boolean;

    /**
     * Private construtor, never call this outside of this class.
     */
    constructor(
        secret: string,
        operation: LoadObjectOperation,
        value: V | null | undefined,
        error: Error | null | undefined,
        hasValue: boolean,
    ) {
        if (secret !== SECRET) {
            throw new Error(
                "Construct LoadObjects using static methods such as " +
                    "LoadObject.loading(), LoadObject.empty()",
            );
        }

        this._operation = operation;
        this._value = value;
        this._error = error;
        this._hasValue = hasValue;
    }

    // Convenient getters
    getOperation(): LoadObjectOperation {
        return this._operation;
    }

    getValue(): V | null | undefined {
        return this._value;
    }

    getValueEnforcing(): V {
        if (!this.hasValue()) {
            throw new Error("Expected load object to have a value set.");
        }

        // We check hasValue and cast rather than checking if value is null so that
        // it's possible to have "null" values that are set.
        return this._value as any;
    }

    getError(): Error | null | undefined {
        return this._error;
    }

    getErrorEnforcing(): Error {
        if (!this._error) {
            throw new Error("Expected load object to have an error set.");
        }

        return this._error;
    }

    hasOperation(): boolean {
        return this._operation !== "NONE";
    }

    hasValue(): boolean {
        return this._hasValue;
    }

    hasError(): boolean {
        return !!this._error;
    }

    isEmpty(): boolean {
        return !this.hasValue() && !this.hasOperation() && !this.hasError();
    }

    // Convenient setters
    setOperation(operation: LoadObjectOperation): LoadObject<V> {
        if (this._operation === operation) {
            return this;
        }

        return new LoadObject(
            SECRET,
            operation,
            this._value,
            this._error,
            this._hasValue,
        );
    }

    setValue(value: V): LoadObject<V> {
        if (this._value === value && this._hasValue) {
            return this;
        }

        return new LoadObject(
            SECRET,
            this._operation,
            value,
            this._error,
            true,
        );
    }

    setError(error: Error): LoadObject<V> {
        if (this._error === error) {
            return this;
        }

        return new LoadObject(
            SECRET,
            this._operation,
            this._value,
            error,
            this._hasValue,
        );
    }

    removeOperation(): LoadObject<V> {
        if (this._operation === "NONE") {
            return this;
        }

        return new LoadObject(
            SECRET,
            "NONE",
            this._value,
            this._error,
            this._hasValue,
        );
    }

    removeValue(): LoadObject<V> {
        if (this._value === undefined && !this._hasValue) {
            return this;
        }

        return new LoadObject(
            SECRET,
            this._operation,
            undefined as V,
            this._error,
            false,
        );
    }

    removeError(): LoadObject<V> {
        if (this._error === undefined) {
            return this;
        }

        return new LoadObject(
            SECRET,
            this._operation,
            this._value,
            undefined,
            this._hasValue,
        );
    }

    map(fn: (value: V) => V): LoadObject<V> {
        if (!this.hasValue()) {
            return this;
        }

        const v = fn(this.getValueEnforcing());

        if (v === this._value) {
            return this;
        }

        return this.setValue(v);
    }

    // Provide some helper methods to check specific operations
    isDone(): boolean {
        return !this.hasOperation();
    }

    isCreating(): boolean {
        return this.getOperation() === "CREATING";
    }

    isLoading(): boolean {
        return this.getOperation() === "LOADING";
    }

    isUpdating(): boolean {
        return this.getOperation() === "UPDATING";
    }

    isDeleting(): boolean {
        return this.getOperation() === "DELETING";
    }

    // Provide some helpers for mutating the operations
    done(): LoadObject<V> {
        return this.removeOperation();
    }

    creating(): LoadObject<V> {
        return this.setOperation("CREATING");
    }

    loading(): LoadObject<V> {
        return this.setOperation("LOADING");
    }

    updating(): LoadObject<V> {
        return this.setOperation("UPDATING");
    }

    deleting(): LoadObject<V> {
        return this.setOperation("DELETING");
    }

    // Static helpers for creating LoadObjects
    static empty<V>(): LoadObject<V> {
        return new LoadObject(SECRET, "NONE", undefined as V, undefined, false);
    }

    static creating<V>(): LoadObject<V> {
        return new LoadObject(
            SECRET,
            "CREATING",
            undefined as V,
            undefined,
            false,
        );
    }

    static loading<V>(): LoadObject<V> {
        return new LoadObject(
            SECRET,
            "LOADING",
            undefined as V,
            undefined,
            false,
        );
    }

    static updating<V>(): LoadObject<V> {
        return new LoadObject(
            SECRET,
            "UPDATING",
            undefined as V,
            undefined,
            false,
        );
    }

    static deleting<V>(): LoadObject<V> {
        return new LoadObject(
            SECRET,
            "DELETING",
            undefined as V,
            undefined,
            false,
        );
    }

    static withError<V>(error: Error): LoadObject<V> {
        return new LoadObject(SECRET, "NONE", undefined as V, error, false);
    }

    static withValue<V>(value: V): LoadObject<V> {
        return new LoadObject(SECRET, "NONE", value, undefined, true);
    }
}

export default LoadObject;
