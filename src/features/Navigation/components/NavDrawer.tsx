import * as React from "react";
import {
    Box,
    SwipeableDrawer
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import { NavPlanItem } from "features/Navigation/components/NavPlanItem";
import { colorHash } from "constants/colors";
import { Subheader } from "features/Navigation/components/Navigation.elements";
import { NavOwnerItem } from "features/Navigation/components/NavOwnerItem";

const Puller = styled(Box)(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: grey[300],
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 15px)',
}));

const DrawerContent = styled(Box)(({theme}) => ({
    paddingBottom: "100px"
}));


type NavDrawerProps = {
    planItems: any
}

export const NavDrawer: React.FC<NavDrawerProps> = ({planItems}) => {
    return (
        <SwipeableDrawer
            sx={{zIndex: 10}}
            anchor="bottom"
            open={true}
            onClose={console.log}
            onOpen={console.log}
            ModalProps={{
                keepMounted: true,
            }}
            disableBackdropTransition={true}
        >
            <Puller />
            <DrawerContent>
                {planItems && planItems.map((item, i) => {
                    const elements = [ <NavPlanItem
                        key={item.id}
                        id={item.id}
                        onSelect={console.log}
                        expanded={true}
                        name={item.name}
                        color={colorHash(item.id)}
                    /> ];
                    if (i === 0) {
                        elements.unshift(
                            <Subheader key={-item.id}>
                                Plans
                            </Subheader>
                        );
                    } else if (item.acl.ownerId !== planItems[i - 1].acl.ownerId) {
                        elements.unshift(
                            <NavOwnerItem key={-item.id}
                                          expanded={true}
                                          id={item.acl.ownerId} />
                        );
                    }
                    return elements;
                })}            </DrawerContent>
        </SwipeableDrawer>
    )
}