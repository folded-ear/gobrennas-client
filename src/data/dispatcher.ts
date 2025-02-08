import { Dispatcher } from "flux";
import ValidatingDispatcher from "@/data/ValidatingDispatcher";
import { Layout } from "@/data/preferencesStore";
import { WindowSize } from "@/data/WindowStore";
import { Snack } from "@/data/snackBarStore";
import { BfsId, UserType } from "@/global/types/identity";

export type FluxAction =
    | { type: "friend/friend-list-load-error" }
    | { type: "friend/friend-list-loaded"; data: UserType[] }
    | { type: "friend/load-friend-list" }
    // prettier-ignore
    | { type: "pantry-item/order-for-store"; id: BfsId; targetId: BfsId; after: boolean; }
    // prettier-ignore
    | { type: "pantry-item/send-to-plan"; planId: BfsId; id: BfsId; name: string; }
    | { type: "promise-flux/error-fallthrough"; error: unknown }
    | { type: "ui/dismiss-snackbar"; key: Snack["key"] }
    | { type: "ui/hide-fab" }
    | { type: "ui/show-fab" }
    | { type: "user/restore-preferences"; preferences: [string, unknown][] }
    | { type: "user/set-dev-mode"; enabled: boolean }
    | { type: "user/set-layout"; layout: Layout }
    | { type: "user/set-nav-collapsed"; collapsed: boolean }
    | { type: "window/focus-change"; focused: boolean }
    | { type: "window/resize"; size: WindowSize }
    | { type: "window/visibility-change"; visible: boolean };

export default import.meta.env.PROD
    ? new Dispatcher<FluxAction>()
    : new ValidatingDispatcher();
