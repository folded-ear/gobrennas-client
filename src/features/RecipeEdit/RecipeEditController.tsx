import * as React from "react";
import { RecipeEdit } from "./RecipeEdit";
import { useGetAllLabels } from "./hooks/useGetAllLabels";
import { withRouter } from "react-router-dom";
import useIngredientLO from "data/useIngredientLO";
import { RouteComponentProps } from "react-router";

const RecipeEditController = ({match}: RouteComponentProps<{id?: string}>) => {
    const id = match.params?.id || "";
    const lo = useIngredientLO(parseInt(id, 10));
    const { data: labelList } = useGetAllLabels();
    return (<RecipeEdit recipeLO={lo} labelList={labelList} />);
};

export default withRouter(RecipeEditController);