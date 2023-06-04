import React from "react";
import useFriendLO from "data/useFriendLO";
import User, { UserProps } from "views/user/User";
import { ripLoadObject } from "../../../util/ripLoadObject";

interface Props extends Pick<UserProps, "size" | "iconOnly"> {
    id: number
}

const UserById: React.FC<Props> = ({
                                       id,
                                       ...passthrough
                                   }) => {
    const user = ripLoadObject(useFriendLO(id)).data;
    return user
        ? <User {...passthrough} {...user} />
        : null;
};

export default UserById;
