import { useQuery } from "@apollo/client";
import { listAllLabelsQuery } from "../data/queries";

export const useGetAllLabels = () => {
    const { loading, error, data } = useQuery(listAllLabelsQuery);
    const labels = data?.labels?.all || [];

    return {
        loading,
        error,
        data: labels
    };
};