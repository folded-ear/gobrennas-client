import useFriendRlo from "@/data/useFriendRlo";
import { BfsId } from "@/global/types/identity";
import User, { UserProps } from "@/views/user/User";
import React from "react";

interface Props extends Pick<UserProps, "size" | "iconOnly" | "inline"> {
    id: BfsId;
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
