import { gql } from "@/__generated__";
import {
    PantryItem,
    SetPantryItemLabelsMutation,
} from "@/__generated__/graphql";
import throwAnyErrors from "@/util/throwAnyErrors";
import { MutationResult, useMutation } from "@apollo/client";
import { useCallback } from "react";

const SET_PANTRY_ITEM_LABELS = gql(`
mutation setPantryItemLabels($id: ID!, $labels: [String!]!) {
  pantry {
    setLabels(id: $id, labels: $labels) {
      id
      name
      labels
    }
  }
}
`);

type Result = Pick<PantryItem, "id" | "name" | "labels">;

export const useSetPantryItemLabels = (): [
    (id: string, labels: string[]) => Promise<Result>,
    MutationResult<SetPantryItemLabelsMutation>,
] => {
    const [mutateFunction, out] = useMutation(SET_PANTRY_ITEM_LABELS);

    const setLabels = useCallback(
        (id: string, labels: string[]) =>
            mutateFunction({
                variables: {
                    id,
                    labels,
                },
            }).then(({ data, errors }) => {
                throwAnyErrors(errors);
                if (!data?.pantry?.setLabels) {
                    return Promise.reject("Empty set labels response");
                }
                return data.pantry.setLabels;
            }),
        [mutateFunction],
    );

    return [setLabels, out];
};
