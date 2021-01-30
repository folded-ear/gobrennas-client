import PropTypes from "prop-types";
import React from "react";
import FriendStore from "../../data/FriendStore";
import useFluxStore from "../../data/useFluxStore";
import User from "./User";

const UserById = ({id, iconOnly}) => {
    const user = useFluxStore(() => FriendStore.getFriendLO(id), [FriendStore], [id]).getValue();
    return user
        ? <User iconOnly={iconOnly} {...user} />
        : null;
};

UserById.propTypes = {
    id: PropTypes.number.isRequired,
    iconOnly: PropTypes.bool,
};

export default UserById;
