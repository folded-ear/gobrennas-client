import { useQuery } from "@apollo/client";
import { gql } from "__generated__";

const LIST_ALL_LABELS_QUERY = gql(`
  query listAllLabels {
    labels {
        all {
          name
        }
    }
  }
`);

export const useGetAllLabels = () => {
    const { loading, error, data } = useQuery(LIST_ALL_LABELS_QUERY);
    const labels = data?.labels?.all || [];

    return {
        loading,
        error,
        data: labels.map((label) => label.name),
    };
};
