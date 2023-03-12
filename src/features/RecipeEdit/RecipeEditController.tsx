import * as React from "react";
import { RecipeEdit } from "./RecipeEdit";
import { useGetAllLabels } from "./hooks/useGetAllLabels";
import { withRouter } from "react-router-dom";
import useIngredientLO from "data/useIngredientLO";
import { RouteComponentProps } from "react-router";
import { StandardError } from "../../global/components/StandardError";

const RecipeEditController = ({match}: RouteComponentProps<{id?: string}>) => {
    const id = match.params?.id || 0;
    if(!id) { return <StandardError />}
    const lo = useIngredientLO(id);
    const { data: labelList } = useGetAllLabels();
    return (<RecipeEdit recipeLO={lo} labelList={labelList} />);
};

export default withRouter(RecipeEditController);