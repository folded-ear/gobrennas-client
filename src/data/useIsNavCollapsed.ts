import preferencesStore from "@/data/preferencesStore";
import dispatcher, { ActionType } from "./dispatcher";
import useFluxStore from "./useFluxStore";

export function setNavCollapsed(collapsed: boolean) {
    dispatcher.dispatch({
        type: ActionType.USER__SET_NAV_COLLAPSED,
        collapsed,
    });
}

function useIsNavCollapsed(): boolean {
    return useFluxStore(
        () => preferencesStore.isNavCollapsed(),
        [preferencesStore],
    );
}

export default useIsNavCollapsed;
