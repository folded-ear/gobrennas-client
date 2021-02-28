import {
    Drawer,
    FormControl,
    Grid,
    IconButton,
    MenuItem,
    Select,
    TextField,
    Tooltip,
} from "@material-ui/core";
import {
    Add,
    DynamicFeed,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../data/dispatcher";
import TaskActions from "../data/TaskActions";
import { byNameComparator } from "../util/comparators";
import EditButton from "./common/EditButton";
import {
    CollapseAll,
    ExpandAll,
} from "./common/icons";
import SplitButton from "./common/SplitButton";
import TaskListSidebar from "./TaskListSidebar";
import UserById from "./user/UserById";

const isValidName = name =>
    name != null && name.trim().length > 0;

class TaskListHeader extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            name: "",
        };
        this.onShowDrawer = this.onShowDrawer.bind(this);
        this.onCloseDrawer = this.onCloseDrawer.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.onDuplicate = this.onDuplicate.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onExpandAll = this.onExpandAll.bind(this);
        this.onCollapseAll = this.onCollapseAll.bind(this);
        this.sortByBucket = this.sortByBucket.bind(this);
    }

    onShowDrawer() {
        Dispatcher.dispatch({
            type: TaskActions.LIST_DETAIL_VISIBILITY,
            visible: true,
        });
    }

    onCloseDrawer() {
        Dispatcher.dispatch({
            type: TaskActions.LIST_DETAIL_VISIBILITY,
            visible: false,
        });
    }

    onNameChange(e) {
        const {value} = e.target;
        this.setState({
            name: value == null ? "" : value,
        });
    }

    onCreate() {
        const {name} = this.state;
        if (!isValidName(name)) return;
        this.setState({
            name: "",
        });
        Dispatcher.dispatch({
            type: TaskActions.CREATE_LIST,
            name: name.trim(),
        });
    }

    onDuplicate(e, list) {
        const {name} = this.state;
        if (!isValidName(name)) return;
        this.setState({
            name: "",
        });
        Dispatcher.dispatch({
            type: TaskActions.DUPLICATE_LIST,
            name: name.trim(),
            fromId: list.id,
        });
    }

    onSelect(e) {
        Dispatcher.dispatch({
            type: TaskActions.SELECT_LIST,
            id: e.target.value,
        });
    }

    onExpandAll() {
        Dispatcher.dispatch({
            type: TaskActions.EXPAND_ALL,
        });
    }

    onCollapseAll() {
        Dispatcher.dispatch({
            type: TaskActions.COLLAPSE_ALL,
        });
    }

    sortByBucket() {
        Dispatcher.dispatch({
            type: TaskActions.SORT_BY_BUCKET,
        });
    }

    render() {
        const {
            activeList,
            allLists: allListsUnsorted,
            listDetailVisible,
            hasBuckets,
        } = this.props;
        const allLists = allListsUnsorted
            ? allListsUnsorted.slice().sort(byNameComparator)
            : [];
        const {
            name,
        } = this.state;
        return <Grid container justify={"space-between"}>
            {activeList && <Grid item>
                <IconButton
                    aria-label="expand-all"
                    onClick={this.onExpandAll}
                >
                    <ExpandAll />
                </IconButton>
                <IconButton
                    aria-label="collapse-all"
                    onClick={this.onCollapseAll}
                >
                    <CollapseAll />
                </IconButton>
                {hasBuckets && <Tooltip
                    title="Sort plan in bucket order"
                    placement="bottom-start"
                >
                    <IconButton
                        aria-label="sort-by-bucket"
                        onClick={this.sortByBucket}
                    >
                        <DynamicFeed />
                    </IconButton>
                </Tooltip>}
                <Drawer
                    open={listDetailVisible}
                    anchor="right"
                    onClose={this.onCloseDrawer}
                >
                    <div
                        style={{
                            minHeight: "100%",
                            minWidth: "40vw",
                            maxWidth: "90vw",
                            backgroundColor: "#f7f7f7",
                        }}
                    >
                        <TaskListSidebar list={activeList} />
                    </div>
                </Drawer>
            </Grid>}
            {allLists.length > 0 && <Grid item>
                <Grid container>
                    {activeList && <Grid item>
                        <EditButton
                            onClick={this.onShowDrawer}
                        />
                    </Grid>}
                    <Grid item>
                        <FormControl
                            variant="outlined"
                            style={{
                                minWidth: "120px",
                            }}
                            size={"small"}
                        >
                            <Select
                                placeholder="Select a Plan"
                                value={activeList && activeList.id}
                                onChange={this.onSelect}
                            >
                                {allLists.map(l =>
                                    <MenuItem
                                        key={l.id}
                                        value={l.id}
                                    >
                                        {l.name}
                                    </MenuItem>,
                                )}
                            </Select>
                        </FormControl>
                    </Grid>
                    {activeList && activeList.acl && <Grid item>
                        <UserById
                            id={activeList.acl.ownerId}
                            iconOnly
                        />
                    </Grid>}
                </Grid>
            </Grid>}
            <Grid item>
                <Grid container>
                    <Grid item>
                        <TextField
                            label="New Plan..."
                            value={name}
                            size={"small"}
                            variant={"outlined"}
                            onChange={this.onNameChange}
                        />
                    </Grid>
                    <Grid item>
                        <SplitButton
                            primary={<Add />}
                            onClick={this.onCreate}
                            options={allLists.length > 0 && allLists.map(l => ({
                                label: `Duplicate "${l.name}"`,
                                id: l.id,
                            }))}
                            onSelect={this.onDuplicate}
                            disabled={!isValidName(name)}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>;
    }

}

TaskListHeader.propTypes = {
    allLists: PropTypes.array.isRequired,
    activeList: PropTypes.object,
    listDetailVisible: PropTypes.bool.isRequired,
    hasBuckets: PropTypes.bool.isRequired,
};

export default TaskListHeader;
