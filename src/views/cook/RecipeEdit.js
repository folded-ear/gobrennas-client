import React, {Component} from "react";
import {
    CircularProgress,
    Typography
} from "@material-ui/core";
import {Redirect} from "react-router-dom";
import RecipeForm from "../../containers/RecipeForm";
import Dispatcher from "../../data/dispatcher";
import RecipeActions from "../../data/RecipeActions";
import RecipeApi from "../../data/RecipeApi";
import history from "../../util/history";
import onNextActionThat from "../../util/onNextActionThat";
import DeleteButton from "../common/DeleteButton";
import {handleSave as handleSaveCopy} from "./RecipeAdd";

const handleDelete = (id) => {
    RecipeApi.deleteRecipe(id);
};

const handleSave = recipe => {
    Dispatcher.dispatch({
        type: RecipeActions.UPDATE_RECIPE,
        data: recipe
    });
    onNextActionThat(action =>
        action.type === RecipeActions.RECIPE_UPDATED,
        (action) => {
            if (action.id !== recipe.id) return;
            history.push(`/library/recipe/${recipe.id}`);
        });
};

const handleCancel = recipe => {
    Dispatcher.dispatch({
        type: RecipeActions.CANCEL_EDIT,
        id: recipe.id,
    });
    history.push(`/library/recipe/${recipe.id}`);
};

class RecipeEdit extends Component<{ recipeLO: any }> {
    render() {
        let {recipeLO} = this.props;
        
        if (!recipeLO.hasValue()) {
            if (recipeLO.isLoading()) {
                return <CircularProgress/>;
            }
            return <Redirect to="/library"/>;
        }
        
        return (
            <div>
                <Typography variant="h2">Editing {recipeLO.getValueEnforcing().name}</Typography>
                <RecipeForm onSave={handleSave}
                            onSaveCopy={handleSaveCopy}
                            onCancel={handleCancel}/>
                <hr />
                <DeleteButton
                    type="recipe"
                    label="Delete Recipe"
                    onConfirm={() => handleDelete(recipeLO.getValueEnforcing().id)}
                />

            </div>
        );
    }
}

export default RecipeEdit;
