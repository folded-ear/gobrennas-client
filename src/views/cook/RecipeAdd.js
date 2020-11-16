import {
    Container as Content,
    Typography,
} from "@material-ui/core";
import React, { Component } from "react";
import RecipeForm from "../../containers/RecipeForm";
import Dispatcher from "../../data/dispatcher";
import DraftRecipeStore from "../../data/DraftRecipeStore";
import RecipeActions from "../../data/RecipeActions";
import history from "../../util/history";
import onNextActionThat from "../../util/onNextActionThat";

export const handleSave = (recipe) => {
    Dispatcher.dispatch({
        type: RecipeActions.CREATE_RECIPE,
        data: recipe
    });
    onNextActionThat(action =>
        action.type === RecipeActions.RECIPE_CREATED,
        (action) => {
            if (action.id !== recipe.id) return;
            history.push(`/library/recipe/${action.data.id}`);
        });
};

const handleCancel = () => {
    const draft = DraftRecipeStore.getDraft();
    Dispatcher.dispatch({
        type: RecipeActions.CANCEL_ADD,
    });
    history.push(draft.sourceId == null
        ? "/library"
        : `/library/recipe/${draft.sourceId}`);
};

class RecipeAdd extends Component<{}> {
    render() {
        return (
            <Content>
                <Typography variant="h2">Add A New Recipe</Typography>
                <div>
                    <RecipeForm onSave={handleSave}
                                onCancel={handleCancel}/>
                </div>
            </Content>
        );
    }
}

export default RecipeAdd;
