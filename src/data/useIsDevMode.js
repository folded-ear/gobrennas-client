import PreferencesStore from "./PreferencesStore";
import useFluxStore from "./useFluxStore";

const useIsDevMode = () => useFluxStore(
    () => PreferencesStore.isDevMode(),
    [PreferencesStore]
);

export default useIsDevMode;
