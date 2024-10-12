import React from "react";
import useFriendRlo from "@/data/useFriendRlo";
import User, { UserProps } from "@/views/user/User";
import { BfsId } from "@/global/types/identity";

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
