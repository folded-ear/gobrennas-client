import PropTypes from "prop-types";
import typedAction from "@/util/typedAction";

const UserActions = {
    RESTORE_PREFERENCES: "user/restore-preferences",
    SET_DEV_MODE: typedAction("user/set-dev-mode", {
        enabled: PropTypes.bool.isRequired,
    }),
    SET_LAYOUT: "user/set-layout",
    SET_NAV_COLLAPSED: "user/set-nav-collapsed",
};

export default UserActions;
