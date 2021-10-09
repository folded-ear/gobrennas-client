import useFluxStore from "./useFluxStore";
import WindowStore from "./WindowStore";

const useIsNewVersionAvailable = () =>
    useFluxStore(
        () => WindowStore.isNewVersionAvailable(),
        [WindowStore],
    );

export default useIsNewVersionAvailable;
