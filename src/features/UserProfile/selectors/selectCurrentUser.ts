import { GetCurrentUserQuery } from "../../../__generated__/graphql";

export const selectCurrentUser = (data?: GetCurrentUserQuery) => {
    let currentUser;

    if (data) {
        currentUser = data.getCurrentUser;
    }
    return {
        currentUser,
    };
};
