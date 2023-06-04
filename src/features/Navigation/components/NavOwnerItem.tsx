import * as React from "react";
import { Subheader } from "./Navigation.elements";
import { ripLoadObject } from "../../../util/ripLoadObject";
import useFriendLO from "../../../data/useFriendLO";

interface NavOwnerItemProps {
    id: string | number
    expanded: boolean
}

export const NavOwnerItem: React.FC<NavOwnerItemProps> = ({
                                                              id,
                                                              expanded
                                                          }) => {
    const { data: user } = ripLoadObject(useFriendLO(id));
    return <Subheader title={`${user?.name} (${id})`}>
        {user?.name || "…"}
    </Subheader>;
};
