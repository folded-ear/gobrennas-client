import preferencesStore from "@/data/preferencesStore";
import useFluxStore from "./useFluxStore";
import Dispatcher from "./dispatcher";
import UserActions from "./UserActions";

export function setNavCollapsed(collapsed: boolean) {
    Dispatcher.dispatch({
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
