import preferencesStore from "@/data/preferencesStore";
import useFluxStore from "./useFluxStore";
import dispatcher, { ActionType } from "./dispatcher";

export function setDevMode(enabled: boolean) {
    dispatcher.dispatch({
        type: ActionType.USER__SET_DEV_MODE,
        enabled,
    });
}

function useIsDevMode(): boolean {
    return useFluxStore(() => preferencesStore.isDevMode(), [preferencesStore]);
}

export default useIsDevMode;
