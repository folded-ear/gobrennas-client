import BaseAxios from "axios";
import React from "react";
import { match, Redirect } from "react-router-dom";
import { API_BASE_URL } from "@/constants";
import Dispatcher from "@/data/dispatcher";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import RecipeDetail from "@/features/RecipeDisplay/components/RecipeDetail";
import LibraryActions from "@/features/RecipeLibrary/data/LibraryActions";
import { UserType } from "@/global/types/identity";
import { Maybe } from "graphql/jsutils/Maybe";
import { recipeRloById } from "@/features/RecipeDisplay/utils/recipeRloById";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/shared/recipe`,
});

interface MatchParams {
    slug: string;
    secret: string;
    id: string;
}

const DoTheDance: React.FC<MatchParams> = ({ slug, secret, id }) => {
    const [owner, setOwner] = React.useState<Maybe<UserType>>(undefined);
    React.useEffect(() => {
        axios.get(`/${slug}/${secret}/${id}.json`).then(
            ({
                data: {
                    ingredients, // includes the recipe itself
                    owner,
                },
            }) => {
                Dispatcher.dispatch({
                    type: LibraryActions.INGREDIENTS_LOADED,
                    ids: ingredients.map((i) => i.id),
                    data: ingredients,
                    oneOff: true,
                });
                setOwner(owner);
            },
            () => alert("This recipe no longer exists. Sorry."),
        );
    }, [slug, secret, id]);
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
    match: match<MatchParams>;
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
