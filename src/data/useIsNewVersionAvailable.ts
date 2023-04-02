import useFluxStore from "./useFluxStore";
import WindowStore from "./WindowStore";

function useIsNewVersionAvailable(): boolean {
    return useFluxStore(
        () => WindowStore.isNewVersionAvailable(),
        [ WindowStore ],
    );
}

export default useIsNewVersionAvailable;
