
export const selectCurrentUser = (data) => {
    let currentUser;

    if(data) {
        currentUser = data.getCurrentUser;
    }
    return {
        currentUser
    };
};