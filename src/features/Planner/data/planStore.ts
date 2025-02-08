import dotProp from "dot-prop-immutable";
import PlanActions from "@/features/Planner/data/PlanActions";
import FluxReduceStore from "flux/lib/FluxReduceStore";
import { removeAtIndex } from "@/util/arrayAsSet";
import ClientId from "@/util/ClientId";
import { bucketComparator } from "@/util/comparators";
import LoadObject from "@/util/LoadObject";
import LoadObjectState from "@/util/LoadObjectState";
import PlanApi from "./PlanApi";
import { mapData, ripLoadObject, RippedLO } from "@/util/ripLoadObject";
import {
    addTask,
    addTaskAndFlush,
    assignToBucket,
    cancelStatusUpdate,
    collapseAll,
    createList,
    createTaskAfter,
    createTaskBefore,
    doInteractiveStatusChange,
    expandAll,
    flushStatusUpdates,
    flushTasksToRename,
    focusDelta,
    focusTask,
    getOrderedBlock,
    isKnown,
    listCreated,
    listsLoaded,
    loadLists,
    loForId,
    losForIds,
    mapPlanBuckets,
    moveDelta,
    moveSubtree,
    MoveSubtreeAction,
    nestTask,
    queueDelete,
    renameTask,
    resetToThisWeeksBuckets,
    saveBucket,
    selectDefaultList,
    selectDelta,
    selectList,
    selectTo,
    setPlanColor,
    sortActivePlanByBucket,
    taskDeleted,
    taskForId,
    taskLoaded,
    tasksCreated,
    tasksForIds,
    tasksLoaded,
    toggleExpanded,
    unnestTask,
} from "./utils";
import {
    BfsId,
    bfsIdEq,
    BfsStringId,
    ensureString,
    includesBfsId,
} from "@/global/types/identity";
import AccessLevel from "@/data/AccessLevel";
import { Maybe } from "graphql/jsutils/Maybe";
import PlanItemStatus from "@/features/Planner/data/PlanItemStatus";
import dispatcher, { FluxAction } from "@/data/dispatcher";

/*
 * This store is way too muddled. But leaving it that way for the moment, to
 * avoid introducing too much "spray" during the early stages. It can be chopped
 * up in the future.
 */

export interface PlanBucket {
    id: BfsId;
    name?: Maybe<string>;
    date?: Maybe<Date>;
}

export interface BasePlanItem {
    //  core
    id: BfsId;
    name: string;
    notes?: Maybe<string>;
    subtaskIds?: BfsId[];
    aggregateId?: Maybe<BfsId>;
    componentIds?: Maybe<BfsId[]>;
    bucketId?: Maybe<BfsId>;
}

export interface PlanItem extends BasePlanItem {
    parentId: BfsId;
    status: PlanItemStatus;
    quantity?: Maybe<number>;
    uomId?: Maybe<BfsStringId>;
    units?: Maybe<string>;
    ingredientId?: Maybe<BfsStringId>;
    preparation?: Maybe<string>;
    // client-side
    _expanded?: Maybe<boolean>;
    _next_status?: Maybe<PlanItemStatus>;
}

export interface Plan extends BasePlanItem {
    acl: {
        ownerId: BfsId;
        grants: Record<string, AccessLevel>;
    };
    color: string;
    buckets: PlanBucket[];
}

export interface State {
    activeListId: Maybe<BfsId>;
    listDetailVisible: boolean;
    activeTaskId: Maybe<BfsId>;
    selectedTaskIds: Maybe<BfsId[]>;
    topLevelIds: LoadObjectState<BfsId[]>;
    byId: Record<BfsId, LoadObject<Plan | PlanItem>>;
}

export interface StateWithActiveTask extends State {
    activeTaskId: BfsId;
}

class PlanStore extends FluxReduceStore<State, FluxAction> {
    getInitialState() {
        return {
            activeListId: null,
            listDetailVisible: false,
            activeTaskId: null,
            selectedTaskIds: null,
            topLevelIds: new LoadObjectState<BfsId[]>(() =>
                this.__dispatcher.dispatch({
                    type: PlanActions.LOAD_PLANS,
                }),
            ),
            byId: {},
        };
    }

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {
            case "plan/create-plan":
                return createList(state, action.name);

            case "plan/duplicate-plan":
                return createList(state, action.name, action.fromId);

            case PlanActions.PLAN_CREATED: {
                return listCreated(
                    state,
                    action.clientId,
                    action.id,
                    action.data,
                );
            }

            case "plan/plan-detail-visibility": {
                if (state.listDetailVisible === action.visible) return state;
                return {
                    ...state,
                    listDetailVisible: action.visible,
                };
            }

            case "plan/delete-plan": {
                PlanApi.deletePlan(action.id);
                const next: State = dotProp.set(
                    state,
                    ["byId", action.id],
                    (lo) => lo.deleting(),
                );
                if (bfsIdEq(next.activeListId, action.id)) {
                    next.listDetailVisible = false;
                    next.activeTaskId = null;
                    next.selectedTaskIds = null;
                }
                return next;
            }

            case PlanActions.PLAN_DELETED: {
                return selectDefaultList({
                    ...dotProp.delete(state, ["byId", action.id]),
                    topLevelIds: state.topLevelIds.map((ids) =>
                        ids.filter((id) => !bfsIdEq(id, action.id)),
                    ),
                });
            }

            case PlanActions.LOAD_PLANS:
                return loadLists(state);
            case PlanActions.PLANS_LOADED:
                return listsLoaded(state, action.data);
            case "plan/select-plan":
                return selectList(state, action.id);
            case "plan/rename-plan":
                return renameTask(state, action.id, action.name);
            case "plan/set-plan-color":
                return setPlanColor(state, action.id, action.color);

            case "plan/set-plan-grant": {
                PlanApi.setPlanGrant(
                    ensureString(action.id),
                    action.userId,
                    action.level,
                );
                return dotProp.set(state, ["byId", action.id], (lo) =>
                    lo
                        .map((l) =>
                            dotProp.set(
                                l,
                                ["acl", "grants", action.userId],
                                action.level,
                            ),
                        )
                        .updating(),
                );
            }

            case PlanActions.CLEAR_PLAN_GRANT: {
                PlanApi.clearPlanGrant(action.id, action.userId);
                return dotProp.set(state, ["byId", action.id], (lo) =>
                    lo
                        .map((l) =>
                            dotProp.delete(l, ["acl", "grants", action.userId]),
                        )
                        .deleting(),
                );
            }

            case PlanActions.PLAN_GRANT_SET:
            case PlanActions.PLAN_GRANT_CLEARED: {
                return dotProp.set(state, ["byId", action.id], (lo) =>
                    lo.done(),
                );
            }

            case PlanActions.PLAN_DATA_BOOTSTRAPPED:
            case PlanActions.PLAN_DELTAS:
            case "recipe/sent-to-plan":
                return tasksLoaded(state, action.data);

            case PlanActions.TREE_CREATE:
                return tasksCreated(state, action.data, action.newIds);

            case PlanActions.RENAME_ITEM:
                return renameTask(state, action.id, action.name);

            case PlanActions.UPDATED:
                return taskLoaded(state, action.data);

            case PlanActions.DELETED:
                return taskDeleted(state, action.id);

            case "plan/focus": {
                state = focusTask(state, action.id);
                return flushTasksToRename(state);
            }

            case "shopping/focus-item":
                return flushTasksToRename(state);

            case "plan/focus-next":
                if (state.activeTaskId == null) return state;
                state = focusDelta(state, state.activeTaskId, 1);
                return flushTasksToRename(state);
            case "plan/focus-previous":
                if (state.activeTaskId == null) return state;
                state = focusDelta(state, state.activeTaskId, -1);
                return flushTasksToRename(state);

            case PlanActions.CREATE_ITEM_AFTER:
            case "shopping/create-item-after": {
                state = createTaskAfter(state, action.id);
                return flushTasksToRename(state);
            }

            case PlanActions.CREATE_ITEM_BEFORE:
            case "shopping/create-item-before": {
                state = createTaskBefore(state, action.id);
                return flushTasksToRename(state);
            }

            case PlanActions.CREATE_ITEM_AT_END:
            case "shopping/create-item-at-end": {
                if (state.activeListId == null) return state;
                state = addTask(state, state.activeListId, "");
                return state;
            }

            case PlanActions.SEND_TO_PLAN: {
                return addTaskAndFlush(state, action.planId, action.name);
            }

            case "pantry-item/send-to-plan": {
                let name = action.name.trim();
                if (name.indexOf(" ") > 0) {
                    name = `"${name}"`;
                }
                return addTaskAndFlush(state, action.planId, name);
            }

            case PlanActions.DELETE_ITEM_FORWARD:
            case "shopping/delete-item-forward": {
                state = focusDelta(state, action.id, 1);
                return queueDelete(state, action.id);
            }

            case PlanActions.DELETE_ITEM_BACKWARDS:
            case "shopping/delete-item-backward": {
                state = focusDelta(state, action.id, -1);
                return queueDelete(state, action.id);
            }

            case PlanActions.COMPLETE_PLAN_ITEM: {
                return doInteractiveStatusChange(state, action.id, {
                    status: PlanItemStatus.COMPLETED,
                    doneAt: action.doneAt,
                });
            }

            case PlanActions.SET_STATUS: {
                return doInteractiveStatusChange(state, action.id, {
                    status: action.status,
                });
            }

            case PlanActions.BULK_SET_STATUS: {
                return action.ids.reduce(
                    (s, id) => doInteractiveStatusChange(s, id, action.status),
                    state,
                );
            }

            case "shopping/set-ingredient-status": {
                return action.itemIds.reduce(
                    (s, id) => doInteractiveStatusChange(s, id, action.status),
                    state,
                );
            }

            case PlanActions.DELETE_SELECTED: {
                const tasks = getOrderedBlock(state).map(([t]) => t);
                state = tasks.reduce((s, t) => queueDelete(s, t.id), state);
                return focusDelta(state, tasks[0].id, -1);
            }

            case PlanActions.UNDO_SET_STATUS:
                return cancelStatusUpdate(state, action.id);

            case "shopping/undo-set-ingredient-status": {
                return action.itemIds.reduce(
                    (s, id) => cancelStatusUpdate(s, id),
                    state,
                );
            }

            case "plan/select-next":
                if (state.activeTaskId == null) return state;
                return selectDelta(state, state.activeTaskId, 1);
            case "plan/select-previous":
                if (state.activeTaskId == null) return state;
                return selectDelta(state, state.activeTaskId, -1);
            case "plan/select-to":
                return selectTo(state, action.id);

            case PlanActions.MOVE_NEXT:
                return moveDelta(state, 1);

            case PlanActions.MOVE_PREVIOUS:
                return moveDelta(state, -1);

            case PlanActions.NEST:
                return nestTask(state);

            case PlanActions.UNNEST:
                return unnestTask(state);

            case PlanActions.MOVE_SUBTREE:
                return moveSubtree(
                    state,
                    action as unknown as MoveSubtreeAction,
                );

            case "plan/toggle-expanded":
                return toggleExpanded(state, action.id);

            case "plan/expand-all":
                return expandAll(state);

            case "plan/collapse-all":
                return collapseAll(state);

            case "plan/multi-line-paste": {
                if (state.activeTaskId == null) return state;
                const lines = action.text
                    .split("\n")
                    .map((l) => l.trim())
                    .filter((l) => l.length > 0);
                if (lines.length === 0) return state;
                const active = taskForId(state, state.activeTaskId);
                if (active.name == null || active.name.trim().length === 0) {
                    // can't get here with zero lines
                    state = renameTask(state, active.id, lines.shift()!);
                }
                state = lines.reduce((s, l) => {
                    s = createTaskAfter(s, s.activeTaskId);
                    s = renameTask(s, s.activeTaskId, l);
                    return s;
                }, state as StateWithActiveTask);
                return flushTasksToRename(state);
            }

            case PlanActions.CREATE_BUCKET: {
                return mapPlanBuckets(state, action.planId, (bs) => [
                    { id: ClientId.next() },
                    ...bs,
                ]);
            }

            case PlanActions.RESET_TO_THIS_WEEKS_BUCKETS:
                return resetToThisWeeksBuckets(state, action.planId);

            case PlanActions.BUCKET_CREATED: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs
                        .filter((b) => !bfsIdEq(b.id, action.clientId))
                        .concat(action.data)
                        .sort(bucketComparator),
                );
            }

            case PlanActions.DELETE_BUCKET: {
                return mapPlanBuckets(state, action.planId, (bs) => {
                    const idx = bs.findIndex((b) => bfsIdEq(b.id, action.id));
                    if (idx >= 0 && !ClientId.is(action.id)) {
                        PlanApi.deleteBucket(state.activeListId!, action.id);
                    }
                    return removeAtIndex(bs, idx);
                });
            }

            case PlanActions.BUCKET_DELETED: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs.filter((b) => !bfsIdEq(b.id, action.id)),
                );
            }

            case PlanActions.BUCKETS_DELETED: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs.filter((b) => !includesBfsId(action.ids, b.id)),
                );
            }

            case PlanActions.RENAME_BUCKET: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs
                        .map((b) => {
                            if (!bfsIdEq(b.id, action.id)) return b;
                            b = { ...b, name: action.name };
                            saveBucket(state, b);
                            return b;
                        })
                        .sort(bucketComparator),
                );
            }

            case PlanActions.SET_BUCKET_DATE: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs
                        .map((b) => {
                            if (!bfsIdEq(b.id, action.id)) return b;
                            b = { ...b, date: action.date };
                            saveBucket(state, b);
                            return b;
                        })
                        .sort(bucketComparator),
                );
            }

            case PlanActions.BUCKET_UPDATED: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs
                        .map((b) => {
                            if (!bfsIdEq(b.id, action.data.id)) return b;
                            return action.data;
                        })
                        .sort(bucketComparator),
                );
            }

            case PlanActions.ASSIGN_ITEM_TO_BUCKET:
                return assignToBucket(state, action.id, action.bucketId);

            case "plan/sort-by-bucket":
                return sortActivePlanByBucket(state);

            case PlanActions.FLUSH_RENAMES:
                return flushTasksToRename(state);
            case PlanActions.FLUSH_STATUS_UPDATES:
                return flushStatusUpdates(state);

            default:
                return state;
        }
    }

    getPlanIdsLO(): LoadObject<BfsId[]> {
        return this.getState().topLevelIds.getLoadObject();
    }

    getPlanIdsRlo(): RippedLO<BfsId[]> {
        return ripLoadObject(this.getPlanIdsLO());
    }

    getPlansRlo(): RippedLO<Plan[]> {
        const s = this.getState();
        return mapData(this.getPlanIdsRlo(), (ids) =>
            (losForIds(s, ids) as LoadObject<Plan>[])
                .filter((lo) => lo.isDone())
                .map((lo) => lo.getValueEnforcing()),
        );
    }

    getChildItemRlos(id: BfsId): RippedLO<PlanItem>[] {
        const s = this.getState();
        const t = taskForId(s, id);
        return (losForIds(s, t.subtaskIds) as LoadObject<PlanItem>[]).map(
            ripLoadObject,
        );
    }

    getNonDescendantComponents(id: BfsId): PlanItem[] {
        const state = this.getState();
        const t = taskForId(state, id);
        if (!t.componentIds) return [];
        const queue = t.componentIds.slice();
        const result: PlanItem[] = [];
        while (queue.length) {
            const lo = loForId(state, queue.shift()!);
            if (!lo.hasValue()) continue;
            const comp = lo.getValueEnforcing() as PlanItem;
            // walk upward and see if it's within the tree...
            let curr = comp;
            let descendant = false;
            while (curr.parentId != null) {
                if (bfsIdEq(curr.parentId, id)) {
                    descendant = true;
                    break;
                }
                curr = taskForId(state, curr.parentId) as PlanItem;
            }
            // process the component...
            if (descendant) {
                comp.componentIds && queue.push(...comp.componentIds);
            } else {
                result.push(comp);
            }
        }
        return result;
    }

    getActivePlanLO(): LoadObject<Plan> {
        const lo = this.getPlanIdsLO();
        if (!lo.hasValue()) return LoadObject.empty();
        const s = this.getState();
        return s.activeListId == null
            ? LoadObject.empty()
            : (loForId(s, s.activeListId) as unknown as LoadObject<Plan>);
    }

    getActivePlanRlo(): RippedLO<Plan> {
        return ripLoadObject(this.getActivePlanLO());
    }

    getActiveItem(): Maybe<PlanItem> {
        const s = this.getState();
        if (s.activeTaskId == null) return null;
        const lo = loForId(s, s.activeTaskId);
        return lo.hasValue() ? (lo.getValueEnforcing() as PlanItem) : null;
    }

    getItemLO(id: BfsId): LoadObject<PlanItem> {
        if (id == null) throw new Error("No task has the null ID");
        const s = this.getState();
        if (isKnown(s, id)) return loForId(s, id) as LoadObject<PlanItem>;
        const planIdsLO = this.getPlanIdsLO();
        if (planIdsLO.isLoading() || !planIdsLO.hasValue())
            return LoadObject.loading();
        return LoadObject.withError(new Error("uh, no?"));
    }

    getItemRlo(id: BfsId): RippedLO<PlanItem> {
        return ripLoadObject(this.getItemLO(id));
    }

    getPlanRlo(id: BfsId): RippedLO<Plan> {
        return ripLoadObject(this.getItemLO(id)) as unknown as RippedLO<Plan>;
    }

    getSelectedItems(): Maybe<PlanItem[]> {
        const s = this.getState();
        return s.selectedTaskIds == null
            ? null
            : (tasksForIds(s, s.selectedTaskIds) as PlanItem[]);
    }

    getItemsInBucket(planId: BfsId, bucketId: BfsId): PlanItem[] {
        /* todo: This is TERRIBLE form. Bucket membership should be tracked like
            any other data, not scanned for across the entire plan.
         */
        const byId = this.getState().byId;
        const items: PlanItem[] = [];
        const stack = [planId];
        while (stack.length) {
            const lo = byId[stack.pop()!];
            if (!lo || !lo.hasValue()) continue;
            const it = lo.getValueEnforcing() as PlanItem;
            if (bfsIdEq(it.bucketId, bucketId)) {
                items.push(it);
                continue;
            }
            if (it.subtaskIds) stack.push(...it.subtaskIds);
        }
        return items;
    }

    isPlanDetailVisible(): boolean {
        return this.getState().listDetailVisible;
    }

    isMultiItemSelection(): boolean {
        const s = this.getState();
        return s.activeTaskId != null && s.selectedTaskIds != null;
    }

    getSelectionAsTextBlock(): string {
        const s = this.getState();
        if (s.activeTaskId == null) return "";
        return tasksForIds(
            s,
            taskForId(
                s,
                (taskForId(s, s.activeTaskId) as PlanItem).parentId,
            ).subtaskIds?.filter(
                (id) =>
                    bfsIdEq(id, s.activeTaskId) ||
                    (s.selectedTaskIds && includesBfsId(s.selectedTaskIds, id)),
            ),
        )
            .map((t) => t.name)
            .join("\n");
    }
}

export default new PlanStore(dispatcher);
