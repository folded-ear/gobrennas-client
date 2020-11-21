import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Drawer from "@material-ui/core/Drawer";
import FormControl from "@material-ui/core/FormControl";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import { Container } from "flux/utils";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../data/dispatcher";
import TaskActions from "../data/TaskActions";
import WindowStore from "../data/WindowStore";
import { humanStringComparator } from "../util/comparators";
import EditButton from "./common/EditButton";
import {
    CollapseAll,
    ExpandAll,
} from "./common/icons";
import TaskListSidebar from "./TaskListSidebar";

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
        this.onSelect = this.onSelect.bind(this);
        this.onNameChange = this.onNameChange.bind(this);
        this.onExpandAll = this.onExpandAll.bind(this);
        this.onCollapseAll = this.onCollapseAll.bind(this);
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

    render() {
        const {
            activeList,
            allLists,
            listDetailVisible,
        } = this.props;
        const {
            name,
        } = this.state;
        return <Box
            display="flex"
            alignItems="center"
        >
            {activeList && <Box>
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
            </Box>}
            {allLists && allLists.length > 0 && <React.Fragment>
                <FormControl
                    variant="outlined"
                    style={{
                        minWidth: "120px",
                    }}
                >
                    <Select
                        placeholder="Select a Plan"
                        value={activeList && activeList.id}
                        onChange={this.onSelect}
                    >
                        {allLists.sort(humanStringComparator).map(l =>
                            <MenuItem
                                key={l.id}
                                value={l.id}
                            >
                                {l.name}
                            </MenuItem>,
                        )}
                    </Select>
                </FormControl>
                {activeList && <>
                    <EditButton
                        type={listDetailVisible ? "primary" : "default"}
                        onClick={this.onShowDrawer}
                    />
                    <Drawer
                        open={listDetailVisible}
                        anchor="right"
                        onClose={this.onCloseDrawer}
                    >
                        <div
                            style={{
                                minHeight: "100%",
                                backgroundColor: "#f7f7f7",
                            }}
                        >
                            <TaskListSidebar list={activeList} />
                        </div>
                    </Drawer>
                </>}
            </React.Fragment>}
            <TextField
                label="New Plan..."
                onChange={this.onNameChange}
            />
            <Button
                onClick={this.onCreate}
                disabled={!isValidName(name)}
            >
                Create
            </Button>
        </Box>;
    }

}

TaskListHeader.propTypes = {
    allLists: PropTypes.array.isRequired,
    activeList: PropTypes.object,
    listDetailVisible: PropTypes.bool.isRequired,
    windowWidth: PropTypes.number.isRequired,
};

export default Container.createFunctional(
    props => <TaskListHeader {...props} />,
    () => [
        WindowStore,
    ],
    (prev, props) => {
        return {
            ...props,
            windowWidth: WindowStore.getSize().width,
        };
    },
    { withProps: true }
);
