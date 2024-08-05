import { MutationResult, useMutation } from "@apollo/client";
import { gql } from "@/__generated__";
import { PantryItem, RenamePantryItemMutation } from "@/__generated__/graphql";
import { useCallback } from "react";

const RENAME_PANTRY_ITEM = gql(`
mutation renamePantryItem($id: ID!, $name: String!) {
  pantry {
    renameItem(id: $id, name: $name) {
      id
      name
      synonyms
    }
  }
}
`);

type Result = Pick<PantryItem, "id" | "name" | "synonyms">;

export const useRenamePantryItem = (): [
    (id: string, name: string) => Promise<Result>,
    MutationResult<RenamePantryItemMutation>,
] => {
    const [mutateFunction, out] = useMutation(RENAME_PANTRY_ITEM);

    const rename = useCallback(
        (id: string, name: string) =>
            mutateFunction({
                variables: {
                    id,
                    name,
                },
            }).then(({ data, errors }) => {
                if (errors && errors.length) {
                    let msg = "Rename failed:\n\n" + errors[0];
                    if (errors.length > 1) {
                        msg += `\n\nPlus ${errors.length - 1} more.`;
                    }
                    return Promise.reject(msg);
                }
                if (!data?.pantry?.renameItem) {
                    return Promise.reject("Empty rename response");
                }
                return data.pantry.renameItem;
            }),
        [mutateFunction],
    );

    return [rename, out];
};
