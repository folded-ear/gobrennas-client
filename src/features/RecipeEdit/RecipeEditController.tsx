import * as React from "react";
import { RecipeEdit } from "./RecipeEdit";
import { useGetAllLabels } from "./hooks/useGetAllLabels";
import { withRouter } from "react-router-dom";
import useIngredientLO from "data/useIngredientLO";
import { RouteComponentProps } from "react-router";
import LoadObject from "../../util/LoadObject";
import { Recipe } from "features/RecipeEdit/types";

type Props = RouteComponentProps<{ id?: string }>;

const RecipeEditController: React.FC<Props> = ({ match }) => {
    const id = match.params?.id || "";
    const lo = useIngredientLO(parseInt(id, 10));
    const { data: labelList } = useGetAllLabels();
    return (
        <RecipeEdit recipeLO={lo as LoadObject<Recipe>} labelList={labelList} />
    );
};

export default withRouter(RecipeEditController);
