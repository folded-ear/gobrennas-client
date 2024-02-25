import { useQuery } from "@apollo/client";
import { LIST_ALL_LABELS_QUERY } from "data/graphql/queries";

export const useGetAllLabels = () => {
    const { loading, error, data } = useQuery(LIST_ALL_LABELS_QUERY);
    const labels = data?.labels?.all || [];

    return {
        loading,
        error,
        data: labels.map((label) => label.name),
    };
};
