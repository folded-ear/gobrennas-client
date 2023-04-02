import React from "react";
import useFriendLO from "data/useFriendLO";
import User from "views/user/User";

interface Props {
    id: number,
    iconOnly?: boolean
}

const UserById: React.FC<Props> = ({ id, iconOnly }) => {
    const user = useFriendLO(id).getValue();
    return user
        ? <User iconOnly={iconOnly} {...user} />
        : null;
};

export default UserById;
