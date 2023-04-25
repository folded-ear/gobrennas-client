import { useQuery } from "@apollo/client";
import { getFullRecipeQuery } from "../data/queries";

export const useGetFullRecipe = (id: string) => {
    const { loading, error, data } = useQuery(
        getFullRecipeQuery,
        { variables: { id: id } },
    );

    return {
        loading,
        error,
        data,
    };
};
