import { MenuItem } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import { Container } from "flux/utils";
import PropTypes from "prop-types";
import React from "react";
import AccessLevel, { includesLevel } from "../data/AccessLevel";
import Dispatcher from "../data/dispatcher";
import FriendStore from "../data/FriendStore";
import TaskActions from "../data/TaskActions";
import UserStore from "../data/UserStore";
import DeleteButton from "./common/DeleteButton";
import PlanBucketManager from "./plan/PlanBucketManager";
import SidebarUnit from "./plan/SidebarUnit";
import User from "./user/User";

const LEVEL_NO_ACCESS = "NO_ACCESS";

class TaskListSidebar extends React.PureComponent {

    constructor(...args) {
        super(...args);
        this.onRename = this.onRename.bind(this);
        this.onGrantChange = this.onGrantChange.bind(this);
        this.onDelete = this.onDelete.bind(this);
    }

    onRename(e) {
        const {value} = e.target;
        const {
            list: {id},
        } = this.props;
        Dispatcher.dispatch({
            type: TaskActions.RENAME_LIST,
            id,
            name: value,
        });
    }

    onGrantChange(userId, level) {
        const {
            list: {id},
        } = this.props;
        if (level === LEVEL_NO_ACCESS) {
            Dispatcher.dispatch({
                type: TaskActions.CLEAR_LIST_GRANT,
                id,
                userId,
            });
        } else {
            Dispatcher.dispatch({
                type: TaskActions.SET_LIST_GRANT,
                id,
                userId,
                level,
            });
        }
    }

    onDelete() {
        const {
            list: {id},
        } = this.props;
        Dispatcher.dispatch({
            type: TaskActions.DELETE_LIST,
            id,
        });
    }

    render() {
        const {
            list,
            me,
            friendsLoading,
            friendList,
            friendsById,
        } = this.props;

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
                <TextField
                    label="Name"
                    required
                    value={list.name}
                    onChange={this.onRename}
                    variant="outlined"
                    fullWidth
                />
            </SidebarUnit>
            <SidebarUnit>
                <PlanBucketManager />
            </SidebarUnit>
            {friendsLoading && <CircularProgress />}
            {isAdministrator && <SidebarUnit>
                <List>
                    {(isMine ? friendList : friendList.filter(f =>f.id !== list.acl.ownerId).concat(me)).map(f =>
                        <ListItem
                            key={f.id}
                        >
                            <Grid container spacing={1} justify="space-between">
                                <Grid item>
                                    <User {...f} />
                                </Grid>
                                <Grid item>
                                    <Select
                                        value={grants[f.id] || LEVEL_NO_ACCESS}
                                        style={{color: grants[f.id] ? "inherit" : "#ccc"}}
                                        onChange={e => this.onGrantChange(
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
                                        <MenuItem value={AccessLevel.ADMINISTER}>
                                            Administer
                                        </MenuItem>
                                    </Select>
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
                    onConfirm={this.onDelete}
                    label="Delete Plan"
                />
            </SidebarUnit>}
        </Box>;
    }

}

TaskListSidebar.propTypes = {
    list: PropTypes.object,
};

export default Container.createFunctional(
    props => <TaskListSidebar {...props} />,
    () => [
        UserStore,
        FriendStore,
    ],
    (prevState, {list}) => {
        const flo = FriendStore.getFriendsLO();
        const loading = !flo.hasValue();
        return {
            list,
            me: UserStore.getProfileLO().getValueEnforcing(),
            friendsLoading: loading,
            friendList: loading
                ? []
                : flo.getValueEnforcing(),
            friendsById: loading
                ? {}
                : flo.getValueEnforcing().reduce((idx, f) => ({
                    ...idx,
                    [f.id]: f,
                }), {}),
        };
    },
    {withProps: true},
);
