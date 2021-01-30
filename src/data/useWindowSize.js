import useFluxStore from "./useFluxStore";
import WindowStore from "./WindowStore";

const useWindowSize = () => useFluxStore(
    () => WindowStore.getSize(),
    [WindowStore],
);

export default useWindowSize;
