import invariant from "invariant";
import PropTypes from "prop-types";
import { ReduceStore } from "flux/utils";

type Store<S> = ReduceStore<S, unknown>;

function builder<S>(
    self: Store<S>,
    method: Store<S>["reduce"],
    typesKey: string,
    initial: S,
): Store<S>["reduce"] {
    const name = self.constructor.name;
    method = method.bind(self);
    let typeSpecs = self.constructor[typesKey];
    invariant(
        typeSpecs != null,
        `No ${typesKey} defined for ${name}; can't activate type checking.`,
    );
    // PropTypes doesn't allow you to declare type information where the
    // top-level properties are anonymous, which is exactly what is needed for
    // an "id lookup"-style Store. Rather than forcing the Store to deal with
    // the extra layer just to get typechecking, assume that if the store's
    // type info is a function, it's the result of an `objectOf` call for the
    // top-level state object itself. The extra named layer will be created
    // implicitly before validating. And, in fact, `objectOf` is in no way
    // special; this mechanism will allow any checker to be used for a store.
    typeSpecs = {
        state:
            typeof typeSpecs === "function"
                ? typeSpecs
                : PropTypes.exact(typeSpecs),
    };
    const check = (next) =>
        PropTypes.checkPropTypes(typeSpecs, { state: next }, typesKey, name);
    if (initial != null) check(initial);
    return (curr, action) => {
        const next = method(curr, action);
        if (!self.areEqual(curr, next)) check(next);
        return next;
    };
}

function typedStore<S extends Store<unknown>>(self: S): S {
    if (!import.meta.env.PROD) {
        invariant(self.reduce, "No 'reduce' method found on store.");
        self.reduce = builder(
            self,
            self.reduce,
            "stateTypes",
            self.getInitialState(),
        );
    }
    return self;
}

export default typedStore;
