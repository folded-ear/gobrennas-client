import {
    CircularProgress,
    Container as Content,
    Typography,
} from "@material-ui/core";
import React from "react";
import { Redirect } from "react-router-dom";
import Dispatcher from "../../data/dispatcher";
import RecipeActions from "../../data/RecipeActions";
import RecipeApi from "../../data/RecipeApi";
import { Recipe } from "../../data/RecipeTypes";
import { loadObjectOf } from "../../util/loadObjectTypes";
import DeleteButton from "../common/DeleteButton";
import { handleSave as handleSaveCopy } from "./RecipeAdd";
import RecipeForm from "./RecipeForm";

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

const RecipeEdit = ({recipeLO}) => {

    if (!recipeLO.hasValue()) {
        if (recipeLO.isLoading()) {
            return <CircularProgress />;
        }
        return <Redirect to="/library" />;
    }

    return <Content>
        <Typography
            variant="h2">Editing {recipeLO.getValueEnforcing().name}</Typography>
        <RecipeForm
            onSave={handleSave}
            onSaveCopy={handleSaveCopy}
            onCancel={handleCancel}
        />
        <hr />
        <div style={{float: "right"}}>
            <DeleteButton
                type="recipe"
                label="Delete Recipe"
                onConfirm={() => handleDelete(recipeLO.getValueEnforcing().id)}
            />
        </div>
    </Content>;
};

RecipeEdit.propTypes = {
    recipeLO: loadObjectOf(Recipe),
};

export default RecipeEdit;
