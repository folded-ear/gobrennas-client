import React, { Component } from "react";
import Dispatcher from "../../data/dispatcher";
import RecipeActions from "../../data/RecipeActions";
import PageBody from "../common/PageBody";
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
            <PageBody>
                <RecipeForm
                    title={"Add A New Recipe"}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            </PageBody>
        );
    }
}

export default RecipeAdd;
