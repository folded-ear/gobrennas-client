import { CircularProgress } from "@mui/material";
import React from "react";
import { Redirect } from "react-router-dom";
import Dispatcher from "data/dispatcher";
import RecipeActions from "data/RecipeActions";
import RecipeApi from "data/RecipeApi";
import { handleSave as handleSaveCopy } from "./RecipeAdd";
import RecipeForm from "./RecipeForm";
import PageBody from "views/common/PageBody";
import DeleteButton from "views/common/DeleteButton";
import { Recipe } from "global/types/types";
import LoadObject from "../../util/LoadObject";

const handleDelete = (id) => {
    RecipeApi.deleteRecipe(id);
};

const handleSave = recipe =>
    Dispatcher.dispatch({
        type: RecipeActions.UPDATE_RECIPE,
        data: recipe,
    });

const handleCancel = recipe =>
    Dispatcher.dispatch({
        type: RecipeActions.CANCEL_EDIT,
        id: recipe.id,
    });

type RecipeEditProps = {
    recipeLO: LoadObject<Recipe>,
    labelList: string[]
}

export const RecipeEdit : React.FC<RecipeEditProps> = ({recipeLO, labelList}) => {
    if (!recipeLO.hasValue()) {
        if (recipeLO.isLoading()) {
            return <CircularProgress />;
        }
        return <Redirect to="/library" />;
    }

    const recipe = recipeLO.getValueEnforcing();
    return <PageBody>
        <RecipeForm
            title={`Editing ${recipe.name}`}
            onSave={handleSave}
            onSaveCopy={handleSaveCopy}
            onCancel={handleCancel}
            labelList={labelList}
            extraButtons={
                <DeleteButton
                    type="recipe"
                    label="Delete Recipe"
                    onConfirm={() => handleDelete(recipe.id)}
                />}
        />
    </PageBody>;
};
