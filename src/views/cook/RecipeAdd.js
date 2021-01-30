import {
    Container as Content,
    Typography,
} from "@material-ui/core";
import React, { Component } from "react";
import Dispatcher from "../../data/dispatcher";
import RecipeActions from "../../data/RecipeActions";
import RecipeForm from "./RecipeForm";

export const handleSave = recipe =>
    Dispatcher.dispatch({
        type: RecipeActions.CREATE_RECIPE,
        data: recipe,
    });

const handleCancel = recipe =>
    Dispatcher.dispatch({
        type: RecipeActions.CANCEL_ADD,
        sourceId: recipe.sourceId,
    });

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
