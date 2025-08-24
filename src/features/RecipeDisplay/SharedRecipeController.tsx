import { useGetFullRecipe } from "@/data/hooks/useGetFullRecipe";
import RecipeDetail from "@/features/RecipeDisplay/components/RecipeDetail";
import { ShareInfo } from "@/global/types/types";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import NotFound from "@/views/common/NotFound";
import Login from "@/views/user/Login";
import * as React from "react";
import { match, Redirect } from "react-router-dom";

const DoTheDance: React.FC<ShareInfo> = ({ secret, id }) => {
    const { loading, error, data: fullRecipe } = useGetFullRecipe(id, secret);
    if (loading) {
        return <LoadingIndicator />;
    }
    if (error || !fullRecipe) {
        return (
            <NotFound>
                <Login authenticated={false} location={"/"} />
            </NotFound>
        );
    }
    return (
        <RecipeDetail
            anonymous
            recipe={fullRecipe.recipe}
            owner={fullRecipe.owner}
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
