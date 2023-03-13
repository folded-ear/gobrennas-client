import * as React from "react";
import { useGetAllLabels } from "./hooks/useGetAllLabels";
import { RecipeAdd } from "./RecipeAdd";

export const RecipeAddController = () => {
    const { data: labelList } = useGetAllLabels();
    return (<RecipeAdd labelList={labelList} />);
};