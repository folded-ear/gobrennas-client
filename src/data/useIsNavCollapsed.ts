import preferencesStore from "@/data/preferencesStore";
import useFluxStore from "./useFluxStore";
import dispatcher from "./dispatcher";
import UserActions from "./UserActions";

export function setNavCollapsed(collapsed: boolean) {
    dispatcher.dispatch({
        type: UserActions.SET_NAV_COLLAPSED,
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
