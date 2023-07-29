export type TupleProps = {
    active: boolean,
    classes: any,
};

export type BaseItemProp = {
    id: string | number
    name: string,
    status?: string
};

export type ItemProps = BaseItemProp & {
    loading: boolean,
    deleting: boolean,
    acquiring: boolean,
    needing?: boolean,
};
