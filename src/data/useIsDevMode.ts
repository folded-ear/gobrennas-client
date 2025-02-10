import preferencesStore from "@/data/preferencesStore";
import dispatcher, { ActionType } from "./dispatcher";
import useFluxStore from "./useFluxStore";

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
