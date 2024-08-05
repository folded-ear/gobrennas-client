import type { BfsId } from "@/global/types/identity";

export type TupleProps = {
    active: boolean;
    classes: any;
};

export type BaseItemProp = {
    id: BfsId;
    name: string;
    status?: string;
};

export type ItemProps = BaseItemProp & {
    loading: boolean;
    deleting: boolean;
    acquiring: boolean;
    needing?: boolean;
};
