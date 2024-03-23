import ClientId from "util/ClientId";
import { renderWithProviders, screen } from "test/test-utils";
import RecipeForm from "features/RecipeEdit/components/RecipeForm";
import { DraftRecipe } from "global/types/types";

describe("Recipe Form", () => {
    const defaultProps = {
        onSave: () => jest.fn,
        onCancel: () => jest.fn,
        onAddIngredientRef: () => jest.fn,
        onEditIngredientRef: () => jest.fn,
        onDeleteIngredientRef: () => jest.fn,
        onMoveIngredientRef: () => jest.fn,
        onMultilinePasteIngredientRefs: () => jest.fn,
        onUpdate: () => jest.fn,
        onUpdateLabels: () => jest.fn,
        labelList: [],
    };
    it("displays an empty form when adding", () => {
        const emptyDraft: DraftRecipe = {
            id: ClientId.next(),
            name: "",
            externalUrl: "",
            ingredients: [
                {
                    id: ClientId.next(),
                    raw: "",
                    ingredient: null,
                    preparation: null,
                    quantity: null,
                },
            ],
            directions: "",
            recipeYield: null,
            totalTime: null,
            calories: null,
            labels: [],
            photoUrl: "",
            photoUpload: null,
            photoFocus: null,
            sourceId: "",
        };

        renderWithProviders(
            <RecipeForm
                draft={emptyDraft}
                title="Add a New Recipe"
                {...defaultProps}
            ></RecipeForm>,
        );
        const titleInput = screen.getByLabelText("Title");
        expect(titleInput).toBeDefined();
    });
});
