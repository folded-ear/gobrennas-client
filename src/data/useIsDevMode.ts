import preferencesStore from "@/data/preferencesStore";
import useFluxStore from "./useFluxStore";
import dispatcher from "./dispatcher";
import UserActions from "./UserActions";

export function setDevMode(enabled: boolean) {
    dispatcher.dispatch({
        type: UserActions.SET_DEV_MODE,
        enabled,
    });
}

function useIsDevMode(): boolean {
    return useFluxStore(() => preferencesStore.isDevMode(), [preferencesStore]);
}

export default useIsDevMode;
