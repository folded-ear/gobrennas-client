import preferencesStore from "@/data/preferencesStore";
import useFluxStore from "./useFluxStore";
import dispatcher from "./dispatcher";

export function setDevMode(enabled: boolean) {
    dispatcher.dispatch({
        type: "user/set-dev-mode",
        enabled,
    });
}

function useIsDevMode(): boolean {
    return useFluxStore(() => preferencesStore.isDevMode(), [preferencesStore]);
}

export default useIsDevMode;
