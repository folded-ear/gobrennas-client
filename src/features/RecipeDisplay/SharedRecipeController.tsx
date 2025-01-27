import React from "react";
import { match, Redirect, useHistory } from "react-router-dom";
import Dispatcher from "@/data/dispatcher";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import RecipeDetail from "@/features/RecipeDisplay/components/RecipeDetail";
import LibraryActions from "@/features/RecipeLibrary/data/LibraryActions";
import { UserType } from "@/global/types/identity";
import { Maybe } from "graphql/jsutils/Maybe";
import { recipeRloById } from "@/features/RecipeDisplay/utils/recipeRloById";
import RecipeApi from "@/data/RecipeApi";
import { ShareInfo } from "@/global/types/types";

const DoTheDance: React.FC<ShareInfo> = ({ slug, secret, id }) => {
    const [owner, setOwner] = React.useState<Maybe<UserType>>(null);
    const history = useHistory();
    React.useEffect(() => {
        RecipeApi.promiseSharedRecipe(slug, secret, id).then(
            ([owner, ingredients]) => {
                Dispatcher.dispatch({
                    type: LibraryActions.INGREDIENTS_LOADED,
                    ids: ingredients.map((i) => i.id),
                    data: ingredients,
                    oneOff: true,
                });
                setOwner(owner);
            },
            () => {
                alert("This recipe no longer exists. Sorry.");
                history.push("/");
            },
        );
    }, [history, slug, secret, id]);
    if (!owner) {
        return <LoadingIndicator />;
    }
    const recipe = recipeRloById(id).data;
    if (!recipe) {
        return <LoadingIndicator />;
    }
    return (
        <RecipeDetail
            anonymous
            recipe={recipe}
            subrecipes={recipe.subrecipes}
            owner={owner}
        />
    );
};

interface Props {
    authenticated: boolean;
    match: match<ShareInfo>;
}

export const SharedRecipeController = (props: Props) => {
    const {
        authenticated,
        match: {
            params: { id, ...params },
        },
    } = props;
    if (authenticated) {
        // At the moment, being a user means you can view any recipe...
        return <Redirect to={`/library/recipe/${id}`} />;
    }
    return <DoTheDance id={id} {...params} />;
};
