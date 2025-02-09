import preferencesStore from "@/data/preferencesStore";
import useFluxStore from "./useFluxStore";
import dispatcher, { ActionType } from "./dispatcher";

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
