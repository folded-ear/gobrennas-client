import FluxReduceStore from "flux/lib/FluxReduceStore";
import LoadObject from "../../../util/LoadObject";
import LoadObjectState from "../../../util/LoadObjectState";
import AccessLevel from "../../../data/AccessLevel";
import { FluxAction } from "global/types/types";
import { BfsId } from "global/types/identity";
import { RippedLO } from "../../../util/ripLoadObject";

export interface PlanBucket {
    id: BfsId;
    name?: string;
    date?: Date;
}

export interface PlanItem {
    //  core
    id: BfsId;
    name: string;
    notes?: string;
    status: string;
    parentId?: number;
    subtaskIds?: BfsId[];
    aggregateId?: number;
    componentIds?: number[];
    bucketId?: number;
    // lists
    acl: {
        ownerId: number;
        grants: Record<string, AccessLevel>;
    };
    buckets: PlanBucket[];
    // item
    quantity?: number;
    uomId?: number;
    units?: string;
    ingredientId?: number;
    preparation?: string;
    // client-side
    _expanded?: boolean;
    _next_status?: string;
}

interface State {
    activeListId?: BfsId;
    listDetailVisible: boolean;
    activeTaskId?: BfsId;
    selectedTaskIds?: BfsId[];
    topLevelIds: LoadObjectState<BfsId[]>;
    byId: Record<BfsId, LoadObject<PlanItem>>;
}

declare namespace TaskStore {}

declare class PlanStore extends FluxReduceStore<State, FluxAction> {
    getPlanIdsLO(): LoadObject<clientOrDatabaseIdType>;
    getPlanIdsRlo(): RippedLO<clientOrDatabaseIdType>;

    getPlansRlo(): RippedLO<PlanItem[]>;

    getChildItemRlos(id: clientOrDatabaseIdType): RippedLO<PlanItem>[];

    getNonDescendantComponents(id: number): PlanItem[];

    getActivePlanLO(): LoadObject<PlanItem>;
    getActivePlanRlo(): RippedLO<PlanItem>;

    getActiveItem(): PlanItem;

    getItemLO(id: clientOrDatabaseIdType): LoadObject<PlanItem>;
    getItemRlo(id: clientOrDatabaseIdType): RippedLO<PlanItem>;

    getSelectedItems(): PlanItem[];

    getItemsInBucket(planId: number, bucketId: number): PlanItem[];

    isPlanDetailVisible(): boolean;

    isMultiItemSelection(): boolean;

    getSelectionAsTextBlock(): string;
}

const planStore: PlanStore;
export = planStore;
