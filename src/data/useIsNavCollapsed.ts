import preferencesStore from "@/data/preferencesStore";
import useFluxStore from "./useFluxStore";
import dispatcher from "./dispatcher";

export function setNavCollapsed(collapsed: boolean) {
    dispatcher.dispatch({
        type: "user/set-nav-collapsed",
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
