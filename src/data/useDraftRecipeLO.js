import DraftRecipeStore from "./DraftRecipeStore";
import useFluxStore from "./useFluxStore";

const useDraftRecipeLO = () =>
    useFluxStore(() => DraftRecipeStore.getDraftLO(), [DraftRecipeStore]);

export default useDraftRecipeLO;
