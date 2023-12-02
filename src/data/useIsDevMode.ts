import preferencesStore from "data/preferencesStore";
import useFluxStore from "./useFluxStore";

function useIsDevMode(): boolean {
    return useFluxStore(() => preferencesStore.isDevMode(), [preferencesStore]);
}

export default useIsDevMode;
