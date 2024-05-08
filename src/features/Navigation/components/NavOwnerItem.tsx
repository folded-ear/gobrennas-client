import * as React from "react";
import { Subheader } from "./Navigation.elements";
import useFriendRlo from "../../../data/useFriendRlo";
import { BfsId } from "global/types/identity";

interface NavOwnerItemProps {
    id: BfsId;
    expanded: boolean;
}

export const NavOwnerItem: React.FC<NavOwnerItemProps> = ({ id, expanded }) => {
    const { data: user } = useFriendRlo(id);
    return (
        <Subheader title={`${user?.name} (${id})`}>
            {user?.name || "…"}
        </Subheader>
    );
};
