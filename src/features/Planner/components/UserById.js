import PropTypes from "prop-types";
import React from "react";
import useFriendLO from "data/useFriendLO";
import User from "views/user/User";

const UserById = ({id, iconOnly}) => {
    const user = useFriendLO(id).getValue();
    return user
        ? <User iconOnly={iconOnly} {...user} />
        : null;
};

UserById.propTypes = {
    id: PropTypes.number.isRequired,
    iconOnly: PropTypes.bool,
};

export default UserById;
