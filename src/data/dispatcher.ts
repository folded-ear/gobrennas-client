import { Dispatcher } from "flux";
import ValidatingDispatcher from "@/data/ValidatingDispatcher";
import { Layout } from "@/data/preferencesStore";

export type FluxAction =
    | { type: "promise-flux/error-fallthrough"; error: unknown }
    | { type: "user/restore-preferences"; preferences: [string, unknown][] }
    | { type: "user/set-dev-mode"; enabled: boolean }
    | { type: "user/set-layout"; layout: Layout }
    | { type: "user/set-nav-collapsed"; collapsed: boolean };

export default import.meta.env.PROD
    ? new Dispatcher<FluxAction>()
    : new ValidatingDispatcher();
