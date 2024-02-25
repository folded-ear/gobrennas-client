import { gql as createNewRecipeMutation } from "__generated__";

export const CREATE_NEW_RECIPE_MUTATION = createNewRecipeMutation(`
    mutation createRecipe(
        $info: IngredientInfo!
        $photo: Upload
        $cookThis: Boolean
    ) {
        library {
            createRecipe(info: $info, photo: $photo, cookThis: $cookThis) {
                id
            }
        }
    }
`);
