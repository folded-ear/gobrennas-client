import { GET_RECIPE_QUERY } from "data/hooks/useGetRecipe";
import { LIST_ALL_LABELS_QUERY } from "data/hooks/useGetAllLabels";

export const mockQueries = [
    {
        request: {
            query: GET_RECIPE_QUERY,
            variables: {
                id: "1",
            },
        },
        result: {
            data: {
                library: { id: "1", name: "Honey Ham" },
            },
        },
    },
    {
        request: { query: LIST_ALL_LABELS_QUERY },
        result: {
            data: {
                labels: {
                    all: [],
                },
            },
        },
    },
];
