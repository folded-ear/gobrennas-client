import FluxReduceStore from "flux/lib/FluxReduceStore";
import LoadObject from "../../../util/LoadObject";

declare class TaskStore extends FluxReduceStore {
    getListsLO(): LoadObject<any[]>

    getLists(): any[]

    getSubtaskLOs(id: number): LoadObject<any>[]

    getComponentLOs(id: number): LoadObject<any>[]

    getNonDescendantComponents(id: number): any[]

    getActiveListLO(): LoadObject<any>

    getActiveTask(): any

    getTaskLO(id: number): LoadObject<any>

    getSelectedTasks(): any[]

    getItemsInBucket(planId: number, bucketId: number): any[]

    isListDetailVisible(): boolean

    isMultiTaskSelection(): boolean

    getSelectionAsTextBlock(): string

}

const taskStore: TaskStore;
export = taskStore;
