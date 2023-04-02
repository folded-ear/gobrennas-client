import PreferencesStore from "./PreferencesStore";
import useFluxStore from "./useFluxStore";

function useIsDevMode(): boolean {
    return useFluxStore(
        () => PreferencesStore.isDevMode(),
        [ PreferencesStore ],
    );
}

export default useIsDevMode;
