import useFluxStore from "./useFluxStore";
import WindowStore from "./WindowStore";

interface Dimensions {
    width: number
    height: number
}

function useWindowSize(): Dimensions {
    return useFluxStore(
        () => WindowStore.getSize(),
        [ WindowStore ],
    );
}

export default useWindowSize;
