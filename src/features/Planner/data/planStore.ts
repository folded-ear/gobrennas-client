import AccessLevel from "@/data/AccessLevel";
import dispatcher, { ActionType, FluxAction } from "@/data/dispatcher";
import PlanItemStatus from "@/features/Planner/data/PlanItemStatus";
import { BfsId, includesBfsId } from "@/global/types/identity";
import { removeAtIndex } from "@/util/arrayAsSet";
import ClientId from "@/util/ClientId";
import { bucketComparator } from "@/util/comparators";
import LoadObject from "@/util/LoadObject";
import LoadObjectState from "@/util/LoadObjectState";
import { mapData, ripLoadObject, RippedLO } from "@/util/ripLoadObject";
import dotProp from "dot-prop-immutable";
import FluxReduceStore from "flux/lib/FluxReduceStore";
import { Maybe } from "graphql/jsutils/Maybe";
import PlanApi from "./PlanApi";
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
    uomId?: Maybe<BfsId>;
    units?: Maybe<string>;
    ingredientId?: Maybe<BfsId>;
    preparation?: Maybe<string>;
    // client-side
    _expanded?: Maybe<boolean>;
    _next_status?: Maybe<PlanItemStatus>;
}

export interface Plan extends BasePlanItem {
    acl: {
        ownerId: BfsId;
        grants: Record<BfsId, AccessLevel>;
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
                    type: ActionType.PLAN__LOAD_PLANS,
                }),
            ),
            byId: {},
        };
    }

    reduce(state: State, action: FluxAction): State {
        switch (action.type) {
            case ActionType.PLAN__CREATE_PLAN:
                return createList(state, action.name);

            case ActionType.PLAN__DUPLICATE_PLAN:
                return createList(state, action.name, action.fromId);

            case ActionType.PLAN__PLAN_CREATED: {
                return listCreated(
                    state,
                    action.clientId,
                    action.id,
                    action.data,
                );
            }

            case ActionType.PLAN__PLAN_DETAIL_VISIBILITY: {
                if (state.listDetailVisible === action.visible) return state;
                return {
                    ...state,
                    listDetailVisible: action.visible,
                };
            }

            case ActionType.PLAN__DELETE_PLAN: {
                PlanApi.deletePlan(action.id);
                const next: State = dotProp.set(
                    state,
                    ["byId", action.id],
                    (lo: LoadObject<Plan>) => lo.deleting(),
                );
                if (next.activeListId === action.id) {
                    next.listDetailVisible = false;
                    next.activeTaskId = null;
                    next.selectedTaskIds = null;
                }
                return next;
            }

            case ActionType.PLAN__PLAN_DELETED: {
                return selectDefaultList({
                    ...dotProp.delete(state, ["byId", action.id]),
                    topLevelIds: state.topLevelIds.map((ids) =>
                        ids.filter((id) => id !== action.id),
                    ),
                });
            }

            case ActionType.PLAN__LOAD_PLANS:
                return loadLists(state);
            case ActionType.PLAN__PLANS_LOADED:
                return listsLoaded(state, action.data);
            case ActionType.PLAN__SELECT_PLAN:
                return selectList(state, action.id);
            case ActionType.PLAN__RENAME_PLAN:
                return renameTask(state, action.id, action.name);
            case ActionType.PLAN__SET_PLAN_COLOR:
                return setPlanColor(state, action.id, action.color);

            case ActionType.PLAN__SET_PLAN_GRANT: {
                PlanApi.setPlanGrant(action.id, action.userId, action.level);
                return dotProp.set(
                    state,
                    ["byId", action.id],
                    (lo: LoadObject<Plan>) =>
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

            case ActionType.PLAN__CLEAR_PLAN_GRANT: {
                PlanApi.clearPlanGrant(action.id, action.userId);
                return dotProp.set(
                    state,
                    ["byId", action.id],
                    (lo: LoadObject<Plan>) =>
                        lo
                            .map((l) =>
                                dotProp.delete(l, [
                                    "acl",
                                    "grants",
                                    action.userId,
                                ]),
                            )
                            .deleting(),
                );
            }

            case ActionType.PLAN__PLAN_GRANT_SET:
            case ActionType.PLAN__PLAN_GRANT_CLEARED: {
                return dotProp.set(
                    state,
                    ["byId", action.id],
                    (lo: LoadObject<Plan>) => lo.done(),
                );
            }

            case ActionType.PLAN__PLAN_DATA_BOOTSTRAPPED:
            case ActionType.PLAN__PLAN_DELTAS:
            case ActionType.RECIPE__SENT_TO_PLAN:
                return tasksLoaded(state, action.data);

            case ActionType.PLAN__ITEM_CREATED:
                return tasksCreated(state, action.data, action.newIds);

            case ActionType.PLAN__RENAME_ITEM:
                return renameTask(state, action.id, action.name);

            case ActionType.PLAN__UPDATED:
                return taskLoaded(state, action.data);

            case ActionType.PLAN__DELETED:
                return taskDeleted(state, action.id);

            case ActionType.PLAN__FOCUS: {
                state = focusTask(state, action.id);
                return flushTasksToRename(state);
            }

            case ActionType.SHOPPING__FOCUS_ITEM:
                return flushTasksToRename(state);

            case ActionType.PLAN__FOCUS_NEXT:
                if (state.activeTaskId == null) return state;
                state = focusDelta(state, state.activeTaskId, 1);
                return flushTasksToRename(state);
            case ActionType.PLAN__FOCUS_PREVIOUS:
                if (state.activeTaskId == null) return state;
                state = focusDelta(state, state.activeTaskId, -1);
                return flushTasksToRename(state);

            case ActionType.PLAN__CREATE_ITEM_AFTER:
            case ActionType.SHOPPING__CREATE_ITEM_AFTER: {
                state = createTaskAfter(state, action.id);
                return flushTasksToRename(state);
            }

            case ActionType.PLAN__CREATE_ITEM_BEFORE:
            case ActionType.SHOPPING__CREATE_ITEM_BEFORE: {
                state = createTaskBefore(state, action.id);
                return flushTasksToRename(state);
            }

            case ActionType.PLAN__CREATE_ITEM_AT_END:
            case ActionType.SHOPPING__CREATE_ITEM_AT_END: {
                if (state.activeListId == null) return state;
                state = addTask(state, state.activeListId, "");
                return state;
            }

            case ActionType.PLAN__SEND_TO_PLAN: {
                return addTaskAndFlush(state, action.planId, action.name);
            }

            case ActionType.PANTRY_ITEM__SEND_TO_PLAN: {
                let name = action.name.trim();
                if (name.indexOf(" ") > 0) {
                    name = `"${name}"`;
                }
                return addTaskAndFlush(state, action.planId, name);
            }

            case ActionType.PLAN__DELETE_ITEM_FORWARD:
            case ActionType.SHOPPING__DELETE_ITEM_FORWARD: {
                state = focusDelta(state, action.id, 1);
                return queueDelete(state, action.id);
            }

            case ActionType.PLAN__DELETE_ITEM_BACKWARDS:
            case ActionType.SHOPPING__DELETE_ITEM_BACKWARD: {
                state = focusDelta(state, action.id, -1);
                return queueDelete(state, action.id);
            }

            case ActionType.PLAN__COMPLETE_PLAN_ITEM: {
                return doInteractiveStatusChange(state, action.id, {
                    status: PlanItemStatus.COMPLETED,
                    doneAt: action.doneAt,
                });
            }

            case ActionType.PLAN__SET_STATUS: {
                return doInteractiveStatusChange(
                    state,
                    action.id,
                    action.status,
                );
            }

            case ActionType.PLAN__BULK_SET_STATUS: {
                return action.ids.reduce(
                    (s, id) => doInteractiveStatusChange(s, id, action.status),
                    state,
                );
            }

            case ActionType.SHOPPING__SET_INGREDIENT_STATUS: {
                return action.itemIds.reduce(
                    (s, id) => doInteractiveStatusChange(s, id, action.status),
                    state,
                );
            }

            case ActionType.PLAN__DELETE_SELECTED: {
                const tasks = getOrderedBlock(state).map(([t]) => t);
                state = tasks.reduce((s, t) => queueDelete(s, t.id), state);
                return focusDelta(state, tasks[0].id, -1);
            }

            case ActionType.PLAN__UNDO_SET_STATUS:
                return cancelStatusUpdate(state, action.id);

            case ActionType.SHOPPING__UNDO_SET_INGREDIENT_STATUS: {
                return action.itemIds.reduce(
                    (s, id) => cancelStatusUpdate(s, id),
                    state,
                );
            }

            case ActionType.PLAN__SELECT_NEXT:
                if (state.activeTaskId == null) return state;
                return selectDelta(state, state.activeTaskId, 1);
            case ActionType.PLAN__SELECT_PREVIOUS:
                if (state.activeTaskId == null) return state;
                return selectDelta(state, state.activeTaskId, -1);
            case ActionType.PLAN__SELECT_TO:
                return selectTo(state, action.id);

            case ActionType.PLAN__MOVE_NEXT:
                return moveDelta(state, 1);

            case ActionType.PLAN__MOVE_PREVIOUS:
                return moveDelta(state, -1);

            case ActionType.PLAN__NEST:
                return nestTask(state);

            case ActionType.PLAN__UNNEST:
                return unnestTask(state);

            case ActionType.PLAN__MOVE_SUBTREE:
                return moveSubtree(state, action);

            case ActionType.PLAN__TOGGLE_EXPANDED:
                return toggleExpanded(state, action.id);

            case ActionType.PLAN__EXPAND_ALL:
                return expandAll(state);

            case ActionType.PLAN__COLLAPSE_ALL:
                return collapseAll(state);

            case ActionType.PLAN__MULTI_LINE_PASTE: {
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

            case ActionType.PLAN__CREATE_BUCKET: {
                return mapPlanBuckets(state, action.planId, (bs) => [
                    { id: ClientId.next() },
                    ...bs,
                ]);
            }

            case ActionType.PLAN__RESET_TO_THIS_WEEKS_BUCKETS:
                return resetToThisWeeksBuckets(state, action.planId);

            case ActionType.PLAN__BUCKET_CREATED: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs
                        .filter((b) => b.id !== action.clientId)
                        .concat(action.data)
                        .sort(bucketComparator),
                );
            }

            case ActionType.PLAN__DELETE_BUCKET: {
                return mapPlanBuckets(state, action.planId, (bs) => {
                    const idx = bs.findIndex((b) => b.id === action.id);
                    if (idx >= 0 && !ClientId.is(action.id)) {
                        PlanApi.deleteBucket(state.activeListId!, action.id);
                    }
                    return removeAtIndex(bs, idx);
                });
            }

            case ActionType.PLAN__BUCKET_DELETED: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs.filter((b) => b.id !== action.id),
                );
            }

            case ActionType.PLAN__BUCKETS_DELETED: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs.filter((b) => !includesBfsId(action.ids, b.id)),
                );
            }

            case ActionType.PLAN__RENAME_BUCKET: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs
                        .map((b) => {
                            if (b.id !== action.id) return b;
                            b = { ...b, name: action.name };
                            saveBucket(state, b);
                            return b;
                        })
                        .sort(bucketComparator),
                );
            }

            case ActionType.PLAN__SET_BUCKET_DATE: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs
                        .map((b) => {
                            if (b.id !== action.id) return b;
                            b = { ...b, date: action.date };
                            saveBucket(state, b);
                            return b;
                        })
                        .sort(bucketComparator),
                );
            }

            case ActionType.PLAN__BUCKET_UPDATED: {
                return mapPlanBuckets(state, action.planId, (bs) =>
                    bs
                        .map((b) => {
                            if (b.id !== action.data.id) return b;
                            return action.data;
                        })
                        .sort(bucketComparator),
                );
            }

            case ActionType.PLAN__ASSIGN_ITEM_TO_BUCKET:
                return assignToBucket(state, action.id, action.bucketId);

            case ActionType.PLAN__SORT_BY_BUCKET:
                return sortActivePlanByBucket(state);

            case ActionType.PLAN__FLUSH_RENAMES:
                return flushTasksToRename(state);
            case ActionType.PLAN__FLUSH_STATUS_UPDATES:
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
                if (curr.parentId === id) {
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
            if (it.bucketId === bucketId) {
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
                    id === s.activeTaskId ||
                    (s.selectedTaskIds && includesBfsId(s.selectedTaskIds, id)),
            ),
        )
            .map((t) => t.name)
            .join("\n");
    }
}

export default new PlanStore(dispatcher);
