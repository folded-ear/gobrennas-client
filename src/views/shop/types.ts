export type tuplePropTypes = {
    active: boolean,
    classes: any,
};

export type baseItemPropTypes = {
    id: string | number
    name: string,
};

export type itemPropTypes = baseItemPropTypes & {
    loading: boolean,
    deleting: boolean,
    acquiring: boolean,
};
