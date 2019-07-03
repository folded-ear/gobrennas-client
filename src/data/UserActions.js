import PropTypes from "prop-types";
import typedAction from "../util/typedAction";

const UserActions = {
    LOGGED_IN: "user/logged-in",
    LOGOUT: "user/logout",
    LOAD_PROFILE: "user/load-profile",
    PROFILE_LOADED: typedAction("user/profile-loaded", {
        data: PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string,
            email: PropTypes.string.isRequired,
            imageUrl: PropTypes.string,
        }).isRequired
    }),
    PROFILE_LOAD_ERROR: "user/profile-load-error",
    RESTORE_PREFERENCES: "user/restore-preferences",
};

export default UserActions;