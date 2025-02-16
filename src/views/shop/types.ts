import { ItemStyles } from "@/features/Planner/components/withItemStyles";
import PlanItemStatus from "@/features/Planner/data/PlanItemStatus";
import type { BfsId } from "@/global/types/identity";

export type TupleProps = {
    active?: boolean;
    classes: Pick<
        ItemStyles,
        "acquiring" | "active" | "deleting" | "question" | "text"
    >;
};

export type BaseItemProp = {
    id: BfsId;
    name: string;
    status?: PlanItemStatus;
};

export type ItemProps = BaseItemProp & {
    question?: boolean;
    loading: boolean;
    deleting: boolean;
    acquiring: boolean;
    needing?: boolean;
};
