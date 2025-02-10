import AccessLevel from "@/data/AccessLevel";
import { Layout } from "@/data/preferencesStore";
import { Snack } from "@/data/snackBarStore";
import { WindowSize } from "@/data/WindowStore";
import PlanItemStatus from "@/features/Planner/data/PlanItemStatus";
import { Plan, PlanBucket, PlanItem } from "@/features/Planner/data/planStore";
import { MoveSubtreeAction } from "@/features/Planner/data/utils";
import { SendToPlanPayload } from "@/features/RecipeLibrary/data/LibraryStore";
import { BfsId, BfsStringId, UserType } from "@/global/types/identity";
import { PantryItem, Recipe } from "@/global/types/types";
import { ShopItemType } from "@/views/shop/ShopList";
import { Dispatcher } from "flux";
import { Maybe } from "graphql/jsutils/Maybe";

// Vite doesn't support `const enum`, due to using esbuild (not tsc). As such,
// this enum wastes several KB (post-gzip) of bundle. If support is added in the
// future, it can save ~5x the current waste, with only `logAction` impacted.
export enum ActionType {
    FRIEND__FRIEND_LIST_LOADED,
    FRIEND__FRIEND_LIST_LOAD_ERROR,
    FRIEND__LOAD_FRIEND_LIST,
    LIBRARY__INGREDIENTS_LOADED,
    LIBRARY__LOAD_INGREDIENTS,
    PANTRY_ITEM__ORDER_FOR_STORE,
    PANTRY_ITEM__SEND_TO_PLAN,
    PLAN__ASSIGN_ITEM_TO_BUCKET,
    PLAN__BUCKETS_DELETED,
    PLAN__BUCKET_CREATED,
    PLAN__BUCKET_DELETED,
    PLAN__BUCKET_UPDATED,
    PLAN__BULK_SET_STATUS,
    PLAN__CLEAR_PLAN_GRANT,
    PLAN__COLLAPSE_ALL,
    PLAN__COMPLETE_PLAN_ITEM,
    PLAN__CREATE_BUCKET,
    PLAN__CREATE_ITEM_AFTER,
    PLAN__CREATE_ITEM_AT_END,
    PLAN__CREATE_ITEM_BEFORE,
    PLAN__CREATE_PLAN,
    PLAN__DELETED,
    PLAN__DELETE_BUCKET,
    PLAN__DELETE_ITEM_BACKWARDS,
    PLAN__DELETE_ITEM_FORWARD,
    PLAN__DELETE_PLAN,
    PLAN__DELETE_SELECTED,
    PLAN__DUPLICATE_PLAN,
    PLAN__EXPAND_ALL,
    PLAN__FLUSH_RENAMES,
    PLAN__FLUSH_STATUS_UPDATES,
    PLAN__FOCUS,
    PLAN__FOCUS_NEXT,
    PLAN__FOCUS_PREVIOUS,
    PLAN__ITEM_CREATED,
    PLAN__LOAD_PLANS,
    PLAN__MOVE_NEXT,
    PLAN__MOVE_PREVIOUS,
    PLAN__MOVE_SUBTREE,
    PLAN__MULTI_LINE_PASTE,
    PLAN__NEST,
    PLAN__PLANS_LOADED,
    PLAN__PLAN_CREATED,
    PLAN__PLAN_DATA_BOOTSTRAPPED,
    PLAN__PLAN_DELETED,
    PLAN__PLAN_DELTAS,
    PLAN__PLAN_DETAIL_VISIBILITY,
    PLAN__PLAN_GRANT_CLEARED,
    PLAN__PLAN_GRANT_SET,
    PLAN__RENAME_BUCKET,
    PLAN__RENAME_ITEM,
    PLAN__RENAME_PLAN,
    PLAN__RESET_TO_THIS_WEEKS_BUCKETS,
    PLAN__SELECT_NEXT,
    PLAN__SELECT_PLAN,
    PLAN__SELECT_PREVIOUS,
    PLAN__SELECT_TO,
    PLAN__SEND_TO_PLAN,
    PLAN__SET_BUCKET_DATE,
    PLAN__SET_PLAN_COLOR,
    PLAN__SET_PLAN_GRANT,
    PLAN__SET_STATUS,
    PLAN__SORT_BY_BUCKET,
    PLAN__TOGGLE_EXPANDED,
    PLAN__UNDO_SET_STATUS,
    PLAN__UNNEST,
    PLAN__UPDATED,
    PROMISE_FLUX__ERROR_FALLTHROUGH,
    RECIPE__ERROR_SENDING_TO_PLAN,
    RECIPE__SEND_TO_PLAN,
    RECIPE__SENT_TO_PLAN,
    SHOPPING__CREATE_ITEM_AFTER,
    SHOPPING__CREATE_ITEM_AT_END,
    SHOPPING__CREATE_ITEM_BEFORE,
    SHOPPING__DELETE_ITEM_BACKWARD,
    SHOPPING__DELETE_ITEM_FORWARD,
    SHOPPING__FOCUS_ITEM,
    SHOPPING__SET_INGREDIENT_STATUS,
    SHOPPING__TOGGLE_EXPANDED,
    SHOPPING__TOGGLE_PLAN,
    SHOPPING__UNDO_SET_INGREDIENT_STATUS,
    UI__DISMISS_SNACKBAR,
    UI__HIDE_FAB,
    UI__SHOW_FAB,
    USER__RESTORE_PREFERENCES,
    USER__SET_DEV_MODE,
    USER__SET_LAYOUT,
    USER__SET_NAV_COLLAPSED,
    WINDOW__FOCUS_CHANGE,
    WINDOW__RESIZE,
    WINDOW__VISIBILITY_CHANGE,
}

export type FluxAction =
    // friend
    | { type: ActionType.FRIEND__LOAD_FRIEND_LIST }
    | { type: ActionType.FRIEND__FRIEND_LIST_LOADED; data: UserType[] }
    | { type: ActionType.FRIEND__FRIEND_LIST_LOAD_ERROR }
    // library
    | {
          type: ActionType.LIBRARY__INGREDIENTS_LOADED;
          data: Array<PantryItem | Recipe>;
      }
    | { type: ActionType.LIBRARY__LOAD_INGREDIENTS; ids: BfsStringId[] }
    // pantry-item
    | {
          type: ActionType.PANTRY_ITEM__ORDER_FOR_STORE;
          id: BfsId;
          targetId: BfsId;
          after: boolean;
      }
    | {
          type: ActionType.PANTRY_ITEM__SEND_TO_PLAN;
          planId: BfsId;
          id: BfsId;
          name: string;
      }
    // plans
    | { type: ActionType.PLAN__CLEAR_PLAN_GRANT; id: BfsId; userId: BfsId }
    | { type: ActionType.PLAN__COLLAPSE_ALL }
    | { type: ActionType.PLAN__CREATE_PLAN; name: string }
    | { type: ActionType.PLAN__DELETE_PLAN; id: BfsId }
    | { type: ActionType.PLAN__DUPLICATE_PLAN; fromId: BfsId; name: string }
    | { type: ActionType.PLAN__EXPAND_ALL }
    | { type: ActionType.PLAN__FLUSH_RENAMES }
    | { type: ActionType.PLAN__FLUSH_STATUS_UPDATES }
    | { type: ActionType.PLAN__LOAD_PLANS }
    | {
          type: ActionType.PLAN__PLAN_CREATED;
          id: BfsId;
          clientId: string;
          data: Plan;
          fromId: Maybe<BfsId>;
      }
    | {
          type: ActionType.PLAN__PLAN_DATA_BOOTSTRAPPED;
          id: BfsId;
          data: Array<Plan | PlanItem>;
      }
    | { type: ActionType.PLAN__PLAN_DELETED; id: BfsId }
    | {
          type: ActionType.PLAN__PLAN_DELTAS;
          id: BfsId;
          data: Array<Plan | PlanItem>;
      }
    | { type: ActionType.PLAN__PLAN_DETAIL_VISIBILITY; visible: boolean }
    | { type: ActionType.PLAN__PLAN_GRANT_CLEARED; id: BfsId; userId: BfsId }
    | { type: ActionType.PLAN__PLAN_GRANT_SET; id: BfsId; userId: BfsId }
    | { type: ActionType.PLAN__PLANS_LOADED; data: Plan[] }
    | { type: ActionType.PLAN__RENAME_PLAN; id: BfsId; name: string }
    | { type: ActionType.PLAN__SELECT_PLAN; id: BfsId }
    | { type: ActionType.PLAN__SET_PLAN_COLOR; id: BfsId; color: string }
    | {
          type: ActionType.PLAN__SET_PLAN_GRANT;
          id: BfsId;
          userId: BfsId;
          level: AccessLevel;
      }
    | { type: ActionType.PLAN__SORT_BY_BUCKET }
    | { type: ActionType.PLAN__TOGGLE_EXPANDED; id: BfsId }
    // plan buckets
    | {
          type: ActionType.PLAN__ASSIGN_ITEM_TO_BUCKET;
          id: BfsId;
          bucketId: Maybe<BfsId>;
      }
    | {
          type: ActionType.PLAN__BUCKET_CREATED;
          planId: BfsId;
          clientId: string;
          data: PlanBucket;
      }
    | { type: ActionType.PLAN__BUCKET_DELETED; planId: BfsId; id: BfsId }
    | { type: ActionType.PLAN__BUCKET_UPDATED; planId: BfsId; data: PlanBucket }
    | { type: ActionType.PLAN__BUCKETS_DELETED; planId: BfsId; ids: BfsId[] }
    | { type: ActionType.PLAN__CREATE_BUCKET; planId: BfsId }
    | { type: ActionType.PLAN__DELETE_BUCKET; planId: BfsId; id: BfsId }
    | {
          type: ActionType.PLAN__RENAME_BUCKET;
          planId: BfsId;
          id: BfsId;
          name: string;
      }
    | { type: ActionType.PLAN__RESET_TO_THIS_WEEKS_BUCKETS; planId: BfsId }
    | {
          type: ActionType.PLAN__SET_BUCKET_DATE;
          planId: BfsId;
          id: BfsId;
          date: Maybe<Date>;
      }
    // plan items
    | {
          type: ActionType.PLAN__COMPLETE_PLAN_ITEM;
          id: BfsId;
          status: PlanItemStatus;
          doneAt: Maybe<Date>;
      }
    | {
          type: ActionType.PLAN__BULK_SET_STATUS;
          ids: BfsId[];
          status: PlanItemStatus;
      }
    | { type: ActionType.PLAN__DELETED; id: BfsId }
    | { type: ActionType.PLAN__FOCUS; id: BfsId }
    | { type: ActionType.PLAN__FOCUS_NEXT }
    | { type: ActionType.PLAN__FOCUS_PREVIOUS }
    | { type: ActionType.PLAN__RENAME_ITEM; id: BfsId; name: string }
    | { type: ActionType.PLAN__SELECT_NEXT }
    | { type: ActionType.PLAN__UPDATED; data: Plan | PlanItem }
    | { type: ActionType.PLAN__SELECT_PREVIOUS }
    | { type: ActionType.PLAN__SELECT_TO; id: BfsId }
    | { type: ActionType.PLAN__SEND_TO_PLAN; planId: BfsId; name: string }
    | { type: ActionType.PLAN__SET_STATUS; id: BfsId; status: PlanItemStatus }
    | { type: ActionType.PLAN__UNDO_SET_STATUS; id: BfsId }
    // plan tree
    | { type: ActionType.PLAN__CREATE_ITEM_AFTER; id: BfsId }
    | { type: ActionType.PLAN__CREATE_ITEM_AT_END }
    | { type: ActionType.PLAN__CREATE_ITEM_BEFORE; id: BfsId }
    | { type: ActionType.PLAN__DELETE_ITEM_BACKWARDS; id: BfsId }
    | { type: ActionType.PLAN__DELETE_ITEM_FORWARD; id: BfsId }
    | { type: ActionType.PLAN__DELETE_SELECTED }
    | {
          type: ActionType.PLAN__ITEM_CREATED;
          data: Array<Plan | PlanItem>;
          newIds: Record<BfsId, string>;
      }
    | { type: ActionType.PLAN__MOVE_NEXT }
    | { type: ActionType.PLAN__MOVE_PREVIOUS }
    | ({ type: ActionType.PLAN__MOVE_SUBTREE } & MoveSubtreeAction)
    | { type: ActionType.PLAN__MULTI_LINE_PASTE; text: string }
    | { type: ActionType.PLAN__NEST }
    | { type: ActionType.PLAN__UNNEST }
    // promise
    | { type: ActionType.PROMISE_FLUX__ERROR_FALLTHROUGH; error: unknown }
    // recipe
    | ({ type: ActionType.RECIPE__SEND_TO_PLAN } & SendToPlanPayload)
    | ({
          type: ActionType.RECIPE__SENT_TO_PLAN;
          data: (Plan | PlanItem)[];
      } & SendToPlanPayload)
    | ({ type: ActionType.RECIPE__ERROR_SENDING_TO_PLAN } & SendToPlanPayload)
    // shopping
    | { type: ActionType.SHOPPING__CREATE_ITEM_BEFORE; id: BfsId }
    | { type: ActionType.SHOPPING__CREATE_ITEM_AFTER; id: BfsId }
    | { type: ActionType.SHOPPING__CREATE_ITEM_AT_END }
    | { type: ActionType.SHOPPING__DELETE_ITEM_BACKWARD; id: BfsId }
    | { type: ActionType.SHOPPING__DELETE_ITEM_FORWARD; id: BfsId }
    | {
          type: ActionType.SHOPPING__FOCUS_ITEM;
          id: BfsId;
          itemType: ShopItemType;
      }
    | {
          type: ActionType.SHOPPING__SET_INGREDIENT_STATUS;
          id: BfsId;
          itemIds: BfsStringId[];
          status: PlanItemStatus;
      }
    | {
          type: ActionType.SHOPPING__UNDO_SET_INGREDIENT_STATUS;
          id: BfsId;
          itemIds: BfsStringId[];
      }
    | { type: ActionType.SHOPPING__TOGGLE_EXPANDED; id: BfsId }
    | { type: ActionType.SHOPPING__TOGGLE_PLAN; id: BfsId }
    // ui
    | { type: ActionType.UI__DISMISS_SNACKBAR; key: Snack["key"] }
    | { type: ActionType.UI__HIDE_FAB }
    | { type: ActionType.UI__SHOW_FAB }
    // user
    | {
          type: ActionType.USER__RESTORE_PREFERENCES;
          preferences: [string, unknown][];
      }
    | { type: ActionType.USER__SET_DEV_MODE; enabled: boolean }
    | { type: ActionType.USER__SET_LAYOUT; layout: Layout }
    | { type: ActionType.USER__SET_NAV_COLLAPSED; collapsed: boolean }
    // window
    | { type: ActionType.WINDOW__FOCUS_CHANGE; focused: boolean }
    | { type: ActionType.WINDOW__RESIZE; size: WindowSize }
    | { type: ActionType.WINDOW__VISIBILITY_CHANGE; visible: boolean };

export default new Dispatcher<FluxAction>();
