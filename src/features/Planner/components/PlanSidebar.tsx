import {
    Box,
    Drawer,
    Grid,
    List,
    ListItem,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import React from "react";
import AccessLevel, { includesLevel } from "data/AccessLevel";
import Dispatcher from "data/dispatcher";
import FriendStore from "data/FriendStore";
import PlanActions from "features/Planner/data/PlanActions";
import useFluxStore from "data/useFluxStore";
import { useProfile } from "providers/Profile";
import DeleteButton from "views/common/DeleteButton";
import LoadingIndicator from "views/common/LoadingIndicator";
import PlanBucketManager from "features/Planner/components/PlanBucketManager";
import SidebarUnit from "features/Planner/components/SidebarUnit";
import User from "views/user/User";
import { PlanItem } from "features/Planner/data/planStore";
import { UserType } from "../../../global/types/identity";

const LEVEL_NO_ACCESS = "NO_ACCESS";

interface Props {
    open: boolean;
    plan: PlanItem;
    onClose(): void;
}

interface UserContentProps {
    friend: UserType;
    isAdministrator: boolean;
    grants: Record<string, AccessLevel>;
    handleGrantChange(userId, level): void;
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
            spacing={1}
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
                            handleGrantChange(friend.id, e.target.value)
                        }
                    >
                        <MenuItem value={LEVEL_NO_ACCESS}>No Access</MenuItem>
                        {/*VIEW too!*/}
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
    const [friendsLoading, friendList, friendsById] = useFluxStore(() => {
        const { data: friendList } = FriendStore.getFriendsRlo();
        const loading = friendList == null;
        return [
            loading,
            loading ? [] : friendList,
            loading
                ? {}
                : friendList.reduce(
                      (idx, f) => ({
                          ...idx,
                          [f.id]: f,
                      }),
                      {},
                  ),
        ];
    }, [FriendStore]);

    const [name, setName] = React.useState(plan.name);

    const handleRename = () => {
        Dispatcher.dispatch({
            type: PlanActions.RENAME_PLAN,
            id: plan.id,
            name,
        });
    };

    const handleGrantChange = (userId, level) => {
        if (level === LEVEL_NO_ACCESS) {
            Dispatcher.dispatch({
                type: PlanActions.CLEAR_PLAN_GRANT,
                id: plan.id,
                userId,
            });
        } else {
            Dispatcher.dispatch({
                type: PlanActions.SET_PLAN_GRANT,
                id: plan.id,
                userId,
                level,
            });
        }
    };

    const handleDelete = () => {
        Dispatcher.dispatch({
            type: PlanActions.DELETE_PLAN,
            id: plan.id,
        });
    };

    const grants = plan.acl.grants || {};
    const isMine = plan.acl.ownerId === me.id;
    const owner = isMine ? me : friendsById[plan.acl.ownerId];
    const isAdministrator =
        isMine || includesLevel(grants[me.id], AccessLevel.ADMINISTER);

    return (
        <Drawer open={open} anchor="right" onClose={onClose}>
            <div
                style={{
                    minHeight: "100%",
                    minWidth: "40vw",
                    maxWidth: "90vw",
                    backgroundColor: "#f7f7f7",
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
                                              (f) => f.id !== plan.acl.ownerId,
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
