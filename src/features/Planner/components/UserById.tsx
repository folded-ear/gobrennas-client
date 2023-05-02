import React from "react";
import useFriendLO from "data/useFriendLO";
import User from "views/user/User";
import { ripLoadObject } from "../../../util/ripLoadObject";

interface Props {
    id: number,
    iconOnly?: boolean
}

const UserById: React.FC<Props> = ({ id, iconOnly }) => {
    const user = ripLoadObject(useFriendLO(id)).data;
    return user
        ? <User iconOnly={iconOnly} {...user} />
        : null;
};

export default UserById;
