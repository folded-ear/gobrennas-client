import AccessLevel, { includesLevel } from "@/data/AccessLevel";
import dispatcher, { ActionType } from "@/data/dispatcher";
import FriendStore from "@/data/FriendStore";
import useFluxStore from "@/data/useFluxStore";
import PlanBucketManager from "@/features/Planner/components/PlanBucketManager";
import SidebarUnit from "@/features/Planner/components/SidebarUnit";
import { Plan } from "@/features/Planner/data/planStore";
import { bfsIdEq, BfsStringId, UserType } from "@/global/types/identity";
import { useProfile } from "@/providers/Profile";
import DeleteButton from "@/views/common/DeleteButton";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import PlanAvatar from "@/views/shop/PlanAvatar";
import User from "@/views/user/User";
import {
    Box,
    Drawer,
    Grid,
    InputAdornment,
    List,
    ListItem,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import * as React from "react";
import { useEffect, useState } from "react";

const LEVEL_NO_ACCESS = "NO_ACCESS";

type AccessOption = AccessLevel | typeof LEVEL_NO_ACCESS;

interface Props {
    open: boolean;
    plan: Plan;
    onClose(): void;
}

interface UserContentProps {
    friend: UserType;
    isAdministrator: boolean;
    grants: Record<string, AccessLevel>;
    handleGrantChange(userId: BfsStringId, level: AccessOption): void;
}

function isValidColor(color: string): boolean {
    return /^[0-9a-fA-F]{6}$/.test(color);
}

function UserContent({
    friend,
    isAdministrator,
    grants,
    handleGrantChange,
}: UserContentProps) {
    return (
        <Grid
            container
            spacing={0.5}
            justifyContent="space-between"
            alignItems="center"
        >
            <Grid item>
                <User {...friend} />
            </Grid>
            <Grid item>
                {isAdministrator ? (
                    <Select
                        value={grants[friend.id] || LEVEL_NO_ACCESS}
                        style={{
                            color: grants[friend.id] ? "inherit" : "#ccc",
                        }}
                        onChange={(e) =>
                            handleGrantChange(
                                friend.id,
                                e.target.value as AccessOption,
                            )
                        }
                        variant={undefined}
                        size={"small"}
                    >
                        <MenuItem value={LEVEL_NO_ACCESS}>No Access</MenuItem>
                        {/*VIEW too?*/}
                        <MenuItem value={AccessLevel.CHANGE}>Modify</MenuItem>
                        <MenuItem value={AccessLevel.ADMINISTER}>
                            Administer
                        </MenuItem>
                    </Select>
                ) : (
                    grants[friend.id] || LEVEL_NO_ACCESS
                )}
            </Grid>
        </Grid>
    );
}

const PlanSidebar: React.FC<Props> = ({ open, onClose, plan }) => {
    const me = useProfile();
    const [friendsLoading, friendList] = useFluxStore(() => {
        const { data: friendList } = FriendStore.getFriendsRlo();
        const loading = friendList == null;
        return [loading, loading ? [] : friendList];
    }, [FriendStore]);

    const [name, setName] = React.useState(plan.name);
    const [color, setColor] = useState(plan.color.substring(1));

    useEffect(() => {
        if (open) {
            setName(plan.name);
            setColor(plan.color.substring(1));
        }
    }, [open, plan.color, plan.name]);

    const handleRename = () => {
        dispatcher.dispatch({
            type: ActionType.PLAN__RENAME_PLAN,
            id: plan.id,
            name,
        });
    };

    const handleSetColor = () => {
        const isBlank = color === "";
        if (isBlank || isValidColor(color)) {
            dispatcher.dispatch({
                type: ActionType.PLAN__SET_PLAN_COLOR,
                id: plan.id,
                color: isBlank ? "" : "#" + color,
            });
        }
    };

    const handleGrantChange = (userId: BfsStringId, level: AccessOption) => {
        if (level === LEVEL_NO_ACCESS) {
            dispatcher.dispatch({
                type: ActionType.PLAN__CLEAR_PLAN_GRANT,
                id: plan.id,
                userId,
            });
        } else {
            dispatcher.dispatch({
                type: ActionType.PLAN__SET_PLAN_GRANT,
                id: plan.id,
                userId,
                level,
            });
        }
    };

    const handleDelete = () => {
        dispatcher.dispatch({
            type: ActionType.PLAN__DELETE_PLAN,
            id: plan.id,
        });
    };

    const acl = plan.acl || {};
    const grants = acl.grants || {};
    const isMine = bfsIdEq(acl.ownerId, me.id);
    const owner = isMine
        ? me
        : friendList?.find((it) => bfsIdEq(it.id, acl.ownerId));
    const isAdministrator =
        isMine || includesLevel(grants[me.id], AccessLevel.ADMINISTER);

    return (
        <Drawer open={open} anchor="right" onClose={onClose}>
            <div
                style={{
                    minHeight: "100%",
                    minWidth: "40vw",
                    maxWidth: "90vw",
                }}
            >
                <Box m={2}>
                    <SidebarUnit>
                        {owner && (
                            <div style={{ float: "right" }}>
                                <User {...owner} />
                            </div>
                        )}
                        {isAdministrator ? (
                            <TextField
                                label="Name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={handleRename}
                                variant="outlined"
                                fullWidth
                            />
                        ) : (
                            <Typography variant="h2" component="h3">
                                {plan.name}
                            </Typography>
                        )}
                    </SidebarUnit>
                    {isAdministrator && (
                        <SidebarUnit>
                            <Stack direction={"row"} gap={1}>
                                <TextField
                                    label="Color"
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    onBlur={handleSetColor}
                                    variant="outlined"
                                    size={"small"}
                                    error={!isValidColor(color)}
                                    helperText={"An RGB color (six hex digits)"}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                #
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            fontFamily: "monospace",
                                            fontSize: "90%",
                                        },
                                    }}
                                />
                                <PlanAvatar
                                    plan={{
                                        ...plan,
                                        color:
                                            "#" +
                                            color
                                                .padEnd(6, "0")
                                                .substring(0, 6),
                                    }}
                                    empty
                                />
                            </Stack>
                        </SidebarUnit>
                    )}
                    {isAdministrator && (
                        <SidebarUnit>
                            <PlanBucketManager />
                        </SidebarUnit>
                    )}
                    {friendsLoading ? (
                        <LoadingIndicator primary="Loading friends list..." />
                    ) : (
                        <SidebarUnit>
                            <List>
                                {(isMine
                                    ? friendList
                                    : friendList
                                          .filter(
                                              (f) =>
                                                  !bfsIdEq(f.id, acl.ownerId),
                                          )
                                          .concat(me)
                                ).map((f) => (
                                    <ListItem key={f.id}>
                                        <UserContent
                                            friend={f}
                                            isAdministrator={isAdministrator}
                                            grants={grants}
                                            handleGrantChange={
                                                handleGrantChange
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </SidebarUnit>
                    )}
                    {isAdministrator && (
                        <SidebarUnit
                            style={{
                                textAlign: "center",
                            }}
                        >
                            <DeleteButton
                                forType="plan"
                                onConfirm={handleDelete}
                                label="Delete Plan"
                            />
                        </SidebarUnit>
                    )}
                </Box>
            </div>
        </Drawer>
    );
};

export default PlanSidebar;
