import FluxReduceStore from "flux/lib/FluxReduceStore";
import LoadObject from "../../../util/LoadObject";
import LoadObjectState from "../../../util/LoadObjectState";
import AccessLevel from "../../../data/AccessLevel";
import { FluxAction } from "global/types/types";

type clientOrDatabaseIdType = string | number;

export interface PlanBucket {
    id: clientOrDatabaseIdType
    name?: string
    date?: Date
}

export interface PlanItem {
    //  core
    id: clientOrDatabaseIdType
    name: string
    notes?: string
    status: string
    parentId?: number
    subtaskIds?: clientOrDatabaseIdType[]
    aggregateId?: number
    componentIds?: number[]
    bucketId?: number
    // lists
    acl: {
        ownerId: number
        grants: Record<string, AccessLevel>
    }
    buckets: PlanBucket[]
    // item
    quantity?: number
    uomId?: number
    units?: string
    ingredientId?: number
    preparation?: string
    // client-side
    _expanded?: boolean
    _next_status?: string
}

interface State {
    activeListId?: clientOrDatabaseIdType
    listDetailVisible: boolean
    activeTaskId?: clientOrDatabaseIdType
    selectedTaskIds?: clientOrDatabaseIdType[]
    topLevelIds: LoadObjectState<clientOrDatabaseIdType[]>
    byId: Record<clientOrDatabaseIdType, LoadObject<PlanItem>>
}

declare namespace TaskStore {
}

declare class TaskStore extends FluxReduceStore<State, FluxAction> {
    getListIdsLO(): LoadObject<clientOrDatabaseIdType>

    getListsLO(): LoadObject<PlanItem[]>

    getSubtaskLOs(id: clientOrDatabaseIdType): LoadObject<PlanItem>[]

    getNonDescendantComponents(id: number): PlanItem[]

    getActiveListLO(): LoadObject<PlanItem>

    getActiveTask(): PlanItem

    getTaskLO(id: clientOrDatabaseIdType): LoadObject<PlanItem>

    getSelectedTasks(): PlanItem[]

    getItemsInBucket(planId: number, bucketId: number): PlanItem[]

    isListDetailVisible(): boolean

    isMultiTaskSelection(): boolean

    getSelectionAsTextBlock(): string

}

const taskStore: TaskStore;
export = taskStore;
