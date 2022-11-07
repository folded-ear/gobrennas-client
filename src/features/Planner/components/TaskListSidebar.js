import {
    MenuItem,
    Typography,
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import PropTypes from "prop-types";
import React from "react";
import AccessLevel, { includesLevel } from "data/AccessLevel";
import Dispatcher from "data/dispatcher";
import FriendStore from "data/FriendStore";
import TaskActions from "features/Planner/data/TaskActions";
import useFluxStore from "data/useFluxStore";
import { useProfileLO } from "providers/Profile";
import DeleteButton from "views/common/DeleteButton";
import LoadingIndicator from "views/common/LoadingIndicator";
import PlanBucketManager from "features/Planner/components/PlanBucketManager";
import SidebarUnit from "features/Planner/components/SidebarUnit";
import User from "views/user/User";

const LEVEL_NO_ACCESS = "NO_ACCESS";

const TaskListSidebar = ({list}) => {

    const me = useProfileLO().getValueEnforcing();

    const [friendsLoading, friendList, friendsById] = useFluxStore(
        () => {
            const flo = FriendStore.getFriendsLO();
            const loading = !flo.hasValue();
            return [
                loading,
                loading
                    ? []
                    : flo.getValueEnforcing(),
                loading
                    ? {}
                    : flo.getValueEnforcing().reduce((idx, f) => ({
                        ...idx,
                        [f.id]: f,
                    }), {}),
            ];
        },
        [FriendStore],
    );

    const [name, setName] = React.useState(list.name);

    const handleRename = () => {
        Dispatcher.dispatch({
            type: TaskActions.RENAME_LIST,
            id: list.id,
            name,
        });
    };

    const handleGrantChange = (userId, level) => {
        if (level === LEVEL_NO_ACCESS) {
            Dispatcher.dispatch({
                type: TaskActions.CLEAR_LIST_GRANT,
                id: list.id,
                userId,
            });
        } else {
            Dispatcher.dispatch({
                type: TaskActions.SET_LIST_GRANT,
                id: list.id,
                userId,
                level,
            });
        }
    };

    const handleDelete = () => {
        Dispatcher.dispatch({
            type: TaskActions.DELETE_LIST,
            id: list.id,
        });
    };

    const grants = list.acl.grants || {};
    const isMine = list.acl.ownerId === me.id;
    const owner = isMine
        ? me
        : friendsById[list.acl.ownerId];
    const isAdministrator = isMine || includesLevel(
        grants[me.id],
        AccessLevel.ADMINISTER,
    );

    return <Box m={2}>
        <SidebarUnit>
            {owner && <div style={{float: "right"}}>
                <User {...owner} />
            </div>}
            {isAdministrator ? <TextField
                label="Name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={handleRename}
                variant="outlined"
                fullWidth
            /> : <Typography variant="h2"
                             component="h3">{list.name}</Typography>}
        </SidebarUnit>
        {isAdministrator && <SidebarUnit>
            <PlanBucketManager />
        </SidebarUnit>}
        {friendsLoading ?
            <LoadingIndicator primary="Loading friends list..." /> :
            <SidebarUnit>
                <List>
                    {(isMine ? friendList : friendList.filter(f => f.id !== list.acl.ownerId)
                        .concat(me)).map(f =>
                        <ListItem
                            key={f.id}
                        >
                            <Grid container spacing={1} justify="space-between"
                                  alignItems="center">
                                <Grid item>
                                    <User {...f} />
                                </Grid>
                                <Grid item>
                                    {isAdministrator ? <Select
                                        value={grants[f.id] || LEVEL_NO_ACCESS}
                                        style={{color: grants[f.id] ? "inherit" : "#ccc"}}
                                        onChange={e => handleGrantChange(
                                            f.id,
                                            e.target.value,
                                        )}
                                    >
                                        <MenuItem value={LEVEL_NO_ACCESS}>
                                            No Access
                                        </MenuItem>
                                        {/*VIEW too!*/}
                                        <MenuItem value={AccessLevel.CHANGE}>
                                            Modify
                                        </MenuItem>
                                        <MenuItem
                                            value={AccessLevel.ADMINISTER}>
                                            Administer
                                        </MenuItem>
                                    </Select> : (grants[f.id] || LEVEL_NO_ACCESS)}
                                </Grid>
                            </Grid>
                        </ListItem>)}
                </List>
            </SidebarUnit>}
        {isAdministrator && <SidebarUnit
            style={{
                textAlign: "center",
            }}
        >
            <DeleteButton
                type="plan"
                onConfirm={handleDelete}
                label="Delete Plan"
            />
        </SidebarUnit>}
    </Box>;
};


TaskListSidebar.propTypes = {
    list: PropTypes.object,
};

export default TaskListSidebar;
