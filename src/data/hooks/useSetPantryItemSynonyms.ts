import throwAnyGraphQLErrors from "@/util/throwAnyGraphQLErrors";
import { gql } from "@/__generated__";
import {
    PantryItem,
    SetPantryItemSynonymsMutation,
} from "@/__generated__/graphql";
import { MutationResult, useMutation } from "@apollo/client";
import { useCallback } from "react";

const SET_PANTRY_ITEM_SYNONYMS = gql(`
mutation setPantryItemSynonyms($id: ID!, $synonyms: [String!]!) {
  pantry {
    setSynonyms(id: $id, synonyms: $synonyms) {
      id
      name
      synonyms
    }
  }
}
`);

type Result = Pick<PantryItem, "id" | "name" | "synonyms">;

export const useSetPantryItemSynonyms = (): [
    (id: string, synonyms: string[]) => Promise<Result>,
    MutationResult<SetPantryItemSynonymsMutation>,
] => {
    const [mutateFunction, out] = useMutation(SET_PANTRY_ITEM_SYNONYMS);

    const setSynonyms = useCallback(
        (id: string, synonyms: string[]) =>
            mutateFunction({
                variables: {
                    id,
                    synonyms,
                },
            }).then(({ data, errors }) => {
                throwAnyGraphQLErrors(errors);
                if (!data?.pantry?.setSynonyms) {
                    return Promise.reject("Empty set synonyms response");
                }
                return data.pantry.setSynonyms;
            }),
        [mutateFunction],
    );

    return [setSynonyms, out];
};
