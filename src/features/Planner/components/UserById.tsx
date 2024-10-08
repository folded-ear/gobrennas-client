import React from "react";
import useFriendRlo from "@/data/useFriendRlo";
import User, { UserProps } from "@/views/user/User";

interface Props extends Pick<UserProps, "size" | "iconOnly" | "inline"> {
    id: number;
}

const UserById: React.FC<Props> = ({ id, ...passthrough }) => {
    const user = useFriendRlo(id).data;
    return user ? (
        <User {...passthrough} {...user} />
    ) : (
        <User email={"?"} {...passthrough} />
    );
};

export default UserById;
