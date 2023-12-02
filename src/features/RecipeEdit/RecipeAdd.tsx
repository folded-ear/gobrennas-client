import React from "react";
import Dispatcher from "../../data/dispatcher";
import RecipeActions from "../../data/RecipeActions";
import RecipeForm from "./RecipeForm";
import PageBody from "../../views/common/PageBody";

export const handleSave = (recipe) =>
    Dispatcher.dispatch({
        type: RecipeActions.CREATE_RECIPE,
        data: recipe,
    });

const handleCancel = (recipe) =>
    Dispatcher.dispatch({
        type: RecipeActions.CANCEL_ADD,
        sourceId: recipe.sourceId,
    });

type RecipeAddProps = {
    labelList: string[];
};
export const RecipeAdd: React.FC<RecipeAddProps> = ({ labelList }) => (
    <PageBody>
        <RecipeForm
            title={"Add A New Recipe"}
            onSave={handleSave}
            onCancel={handleCancel}
            labelList={labelList}
        />
    </PageBody>
);
