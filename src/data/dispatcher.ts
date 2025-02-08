import { Dispatcher } from "flux";
import ValidatingDispatcher from "@/data/ValidatingDispatcher";
import { Layout } from "@/data/preferencesStore";
import { WindowSize } from "@/data/WindowStore";
import { Snack } from "@/data/snackBarStore";
import { BfsId, BfsStringId, UserType } from "@/global/types/identity";
import { SendToPlanPayload } from "@/features/RecipeLibrary/data/LibraryStore";
import { Plan, PlanItem } from "@/features/Planner/data/planStore";
import { ShopItemType } from "@/views/shop/ShopList";
import PlanItemStatus from "@/features/Planner/data/PlanItemStatus";
import AccessLevel from "@/data/AccessLevel";
import { MoveSubtreeAction } from "@/features/Planner/data/utils";

export type FluxAction =
    // friend
    | { type: "friend/load-friend-list" }
    | { type: "friend/friend-list-loaded"; data: UserType[] }
    | { type: "friend/friend-list-load-error" }
    // pantry-item
    | {
          type: "pantry-item/order-for-store";
          id: BfsId;
          targetId: BfsId;
          after: boolean;
      }
    | {
          type: "pantry-item/send-to-plan";
          planId: BfsId;
          id: BfsId;
          name: string;
      }
    // plan
    | { type: "plan/clear-plan-grant"; id: BfsId; userId: BfsId }
    | { type: "plan/collapse-all" }
    | { type: "plan/create-item-after"; id: BfsId }
    | { type: "plan/create-item-at-end" }
    | { type: "plan/create-item-before"; id: BfsId }
    | { type: "plan/create-plan"; name: string }
    | { type: "plan/delete-item-backwards"; id: BfsId }
    | { type: "plan/delete-item-forward"; id: BfsId }
    | { type: "plan/delete-plan"; id: BfsId }
    | { type: "plan/delete-selected" }
    | { type: "plan/duplicate-plan"; fromId: BfsId; name: string }
    | { type: "plan/expand-all" }
    | { type: "plan/focus"; id: BfsId }
    | { type: "plan/focus-next" }
    | { type: "plan/focus-previous" }
    | { type: "plan/move-next" }
    | { type: "plan/move-previous" }
    | ({ type: "plan/move-subtree" } & MoveSubtreeAction)
    | { type: "plan/multi-line-paste"; text: string }
    | { type: "plan/nest" }
    | { type: "plan/plan-detail-visibility"; visible: boolean }
    | { type: "plan/rename-plan"; id: BfsId; name: string }
    | { type: "plan/select-next" }
    | { type: "plan/select-plan"; id: BfsId }
    | { type: "plan/select-previous" }
    | { type: "plan/select-to"; id: BfsId }
    | { type: "plan/send-to-plan"; planId: BfsId; name: string }
    | { type: "plan/set-plan-color"; id: BfsId; color: string }
    | {
          type: "plan/set-plan-grant";
          id: BfsId;
          userId: BfsId;
          level: AccessLevel;
      }
    | { type: "plan/sort-by-bucket" }
    | { type: "plan/toggle-expanded"; id: BfsId }
    | { type: "plan/unnest" }
    // promise
    | { type: "promise-flux/error-fallthrough"; error: unknown }
    // recipe
    | ({ type: "recipe/send-to-plan" } & SendToPlanPayload)
    | ({
          type: "recipe/sent-to-plan";
          data: (Plan | PlanItem)[];
      } & SendToPlanPayload)
    | ({ type: "recipe/error-sending-to-plan" } & SendToPlanPayload)
    // shopping
    | { type: "shopping/create-item-before"; id: BfsId }
    | { type: "shopping/create-item-after"; id: BfsId }
    | { type: "shopping/create-item-at-end" }
    | { type: "shopping/delete-item-backward"; id: BfsId }
    | { type: "shopping/delete-item-forward"; id: BfsId }
    | { type: "shopping/focus-item"; id: BfsId; itemType: ShopItemType }
    | {
          type: "shopping/set-ingredient-status";
          id: BfsId;
          itemIds: BfsStringId[];
          status: PlanItemStatus;
      }
    | {
          type: "shopping/undo-set-ingredient-status";
          id: BfsId;
          itemIds: BfsStringId[];
      }
    | { type: "shopping/toggle-expanded"; id: BfsId }
    | { type: "shopping/toggle-plan"; id: BfsId }
    // ui
    | { type: "ui/dismiss-snackbar"; key: Snack["key"] }
    | { type: "ui/hide-fab" }
    | { type: "ui/show-fab" }
    // user
    | { type: "user/restore-preferences"; preferences: [string, unknown][] }
    | { type: "user/set-dev-mode"; enabled: boolean }
    | { type: "user/set-layout"; layout: Layout }
    | { type: "user/set-nav-collapsed"; collapsed: boolean }
    // window
    | { type: "window/focus-change"; focused: boolean }
    | { type: "window/resize"; size: WindowSize }
    | { type: "window/visibility-change"; visible: boolean };

export default import.meta.env.PROD
    ? new Dispatcher<FluxAction>()
    : new ValidatingDispatcher();
