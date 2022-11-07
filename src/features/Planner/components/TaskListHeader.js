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
    Edit,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "data/dispatcher";
import TaskActions from "features/Planner/data/TaskActions";
import { byNameComparator } from "util/comparators";
import {
    CollapseAll,
    ExpandAll,
} from "views/common/icons";
import SplitButton from "views/common/SplitButton";
import TaskListSidebar from "features/Planner/components/TaskListSidebar";
import UserById from "features/Planner/components/UserById";

const isValidName = name =>
    name != null && name.trim().length > 0;

const onShowDrawer = () =>
    Dispatcher.dispatch({
        type: TaskActions.LIST_DETAIL_VISIBILITY,
        visible: true,
    });

const onCloseDrawer = () =>
    Dispatcher.dispatch({
        type: TaskActions.LIST_DETAIL_VISIBILITY,
        visible: false,
    });

const onSelect = e =>
    Dispatcher.dispatch({
        type: TaskActions.SELECT_LIST,
        id: e.target.value,
    });

const onExpandAll = () =>
    Dispatcher.dispatch({
        type: TaskActions.EXPAND_ALL,
    });

const onCollapseAll = () =>
    Dispatcher.dispatch({
        type: TaskActions.COLLAPSE_ALL,
    });

const sortByBucket = () =>
    Dispatcher.dispatch({
        type: TaskActions.SORT_BY_BUCKET,
    });

function TaskListHeader({
                            activeList,
                            allLists: allListsUnsorted,
                            listDetailVisible = false,
                            hasBuckets = false,
                            canExpand = true,
                        }) {
    const allLists = allListsUnsorted
        ? allListsUnsorted.slice().sort(byNameComparator)
        : [];

    const [name, setName] = React.useState("");
    const [showAdd, setShowAdd] = React.useState(false);

    const onCreate = () => {
        if (!isValidName(name)) return;
        setName("");
        setShowAdd(false);
        Dispatcher.dispatch({
            type: TaskActions.CREATE_LIST,
            name: name.trim(),
        });
    };

    const onDuplicate = (e, list) => {
        if (!isValidName(name)) return;
        setName("");
        Dispatcher.dispatch({
            type: TaskActions.DUPLICATE_LIST,
            name: name.trim(),
            fromId: list.id,
        });
    };

    return <Grid container justify={"space-between"}>
        {activeList && <Grid item>
            <Tooltip
                title="Expand all collapsed items"
                placement="bottom-start"
            >
                <IconButton
                    aria-label="expand-all"
                    onClick={onExpandAll}
                    disabled={!canExpand}
                >
                    <ExpandAll />
                </IconButton>
            </Tooltip>
            <Tooltip
                title="Collapse all expanded items"
                placement="bottom-start"
            >
                <IconButton
                    aria-label="collapse-all"
                    onClick={onCollapseAll}
                    disabled={!canExpand}
                >
                    <CollapseAll />
                </IconButton>
            </Tooltip>
            <Tooltip
                title="Sort plan in bucket order"
                placement="bottom-start"
            >
                <IconButton
                    aria-label="sort-by-bucket"
                    onClick={sortByBucket}
                    disabled={!hasBuckets}
                >
                    <DynamicFeed />
                </IconButton>
            </Tooltip>
            <Drawer
                open={listDetailVisible}
                anchor="right"
                onClose={onCloseDrawer}
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
                {activeList && activeList.acl && <Grid item>
                    <UserById
                        id={activeList.acl.ownerId}
                        iconOnly
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
                            onChange={onSelect}
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
                <Grid item>
                    <Tooltip
                        title="Edit plan, buckets, and access"
                        placement="bottom"
                    >
                        <IconButton
                            onClick={onShowDrawer}
                            disabled={!activeList}
                        >
                            <Edit />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
        </Grid>}
        <Grid item>
            {(showAdd || allLists.length === 0)
                ? <Grid container>
                    <Grid item>
                        <TextField
                            label="New Plan..."
                            value={name}
                            size={"small"}
                            variant={"outlined"}
                            onChange={e => {
                                const {value} = e.target;
                                setName(value == null ? "" : value);
                            }}
                            autoFocus
                            onKeyUp={e => {
                                if (e.key === "Escape") {
                                    setShowAdd(false);
                                    setName("");
                                }
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <SplitButton
                            primary={<Add />}
                            onClick={onCreate}
                            options={allLists.length > 0 && allLists.map(l => ({
                                label: `Duplicate "${l.name}"`,
                                id: l.id,
                            }))}
                            onSelect={onDuplicate}
                            disabled={!isValidName(name)}
                        />
                    </Grid>
                </Grid>
                : <Tooltip
                    title="Create a new plan"
                    placement="bottom-end"
                >
                    <IconButton
                        onClick={() => setShowAdd(true)}
                    >
                        <Add />
                    </IconButton>
                </Tooltip>}
        </Grid>
    </Grid>;

}

TaskListHeader.propTypes = {
    allLists: PropTypes.array.isRequired,
    activeList: PropTypes.object,
    listDetailVisible: PropTypes.bool,
    hasBuckets: PropTypes.bool,
    canExpand: PropTypes.bool,
};

export default TaskListHeader;
