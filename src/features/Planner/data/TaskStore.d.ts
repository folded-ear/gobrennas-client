import FluxReduceStore from "flux/lib/FluxReduceStore";
import LoadObject from "../../../util/LoadObject";
import LoadObjectState from "../../../util/LoadObjectState";
import AccessLevel from "../../../data/AccessLevel";
import { FluxAction } from "../../../global/types/types";

type clientOrDatabaseIdType = string | number;

interface Bucket {
    id: clientOrDatabaseIdType
    name?: string
    date?: Date
}

export interface Task {
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
        grants: {
            [k: string]: AccessLevel
        }
    }
    buckets: Bucket[]
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
    byId: {
        [id: clientOrDatabaseIdType]: LoadObject<Task>
    }
}

declare namespace TaskStore {
}

declare class TaskStore extends FluxReduceStore<State, FluxAction> {
    getListIdsLO(): LoadObject<clientOrDatabaseIdType>

    getListsLO(): LoadObject<Task[]>

    getSubtaskLOs(id: number): LoadObject<Task>[]

    getNonDescendantComponents(id: number): Task[]

    getActiveListLO(): LoadObject<Task>

    getActiveTask(): Task

    getTaskLO(id: number): LoadObject<Task>

    getSelectedTasks(): Task[]

    getItemsInBucket(planId: number, bucketId: number): Task[]

    isListDetailVisible(): boolean

    isMultiTaskSelection(): boolean

    getSelectionAsTextBlock(): string

}

const taskStore: TaskStore;
export = taskStore;
