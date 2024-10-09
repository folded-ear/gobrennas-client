import FluxReduceStore from "flux/lib/FluxReduceStore";
import LoadObject from "@/util/LoadObject";
import LoadObjectState from "@/util/LoadObjectState";
import AccessLevel from "@/data/AccessLevel";
import { FluxAction } from "@/global/types/types";
import { BfsId } from "@/global/types/identity";
import { RippedLO } from "@/util/ripLoadObject";
import PlanItemStatus from "./PlanItemStatus";

export interface PlanBucket {
    id: BfsId;
    name?: Maybe<string>;
    date: Maybe<Date>;
}

export interface WireBucket {
    id: BfsId;
    name?: Maybe<string>;
    date: Maybe<string>;
}

export interface BasePlanItem {
    //  core
    id: BfsId;
    name: string;
    notes?: Maybe<string>;
    parentId?: Maybe<number>;
    subtaskIds?: BfsId[];
    aggregateId?: Maybe<number>;
    componentIds?: Maybe<number[]>;
    bucketId?: Maybe<BfsId>;
    // client-side
    _expanded?: Maybe<boolean>;
    _next_status?: Maybe<PlanItemStatus>;
}

export interface PlanItem extends BasePlanItem {
    status: string;
    quantity?: Maybe<number>;
    uomId?: Maybe<number>;
    units?: Maybe<string>;
    ingredientId?: Maybe<number>;
    preparation?: Maybe<string>;
}

export interface Plan extends BasePlanItem {
    acl: {
        ownerId: number;
        grants: Record<string, AccessLevel>;
    };
    color: string;
    buckets: PlanBucket[];
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
    getPlanIdsLO(): LoadObject<BfsId[]>;
    getPlanIdsRlo(): RippedLO<BfsId[]>;

    getPlansRlo(): RippedLO<Plan[]>;

    getChildItemRlos(id: BfsId): RippedLO<PlanItem>[];

    getNonDescendantComponents(id: number): PlanItem[];

    getActivePlanLO(): LoadObject<Plan>;
    getActivePlanRlo(): RippedLO<Plan>;

    getActiveItem(): PlanItem;

    getItemLO(id: BfsId): LoadObject<PlanItem>;
    getItemRlo(id: BfsId): RippedLO<PlanItem>;
    getPlanRlo(id: BfsId): RippedLO<Plan>;

    getSelectedItems(): PlanItem[];

    getItemsInBucket(planId: number, bucketId: number): PlanItem[];

    isPlanDetailVisible(): boolean;

    isMultiItemSelection(): boolean;

    getSelectionAsTextBlock(): string;
}

const planStore: PlanStore;
export = planStore;
