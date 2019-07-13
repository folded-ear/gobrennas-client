import React from "react"
import PropTypes from "prop-types"
import Dispatcher from "../data/dispatcher"
import TaskActions from "../data/TaskActions"
import {
    Form,
    Icon,
    Input,
    List,
    Select,
    Spin,
} from "antd"
import { Container } from "flux/utils"
import UserStore from "../data/UserStore"
import FriendStore from "../data/FriendStore"
import AccessLevel, { includesLevel } from "../data/AccessLevel"
import User from "./user/User"
import DeleteButton from "./common/DeleteButton"

const LEVEL_NO_ACCESS = "NO_ACCESS"

class TaskListSidebar extends React.PureComponent {

    constructor(...args) {
        super(...args)
        this.onRename = this.onRename.bind(this)
        this.onGrantChange = this.onGrantChange.bind(this)
        this.onDelete = this.onDelete.bind(this)
    }

    onRename(e) {
        const {value} = e.target
        const {
            list: {id},
        } = this.props
        Dispatcher.dispatch({
            type: TaskActions.RENAME_LIST,
            id,
            name: value,
        })
    }

    onGrantChange(userId, level) {
        const {
            list: {id},
        } = this.props
        if (level === LEVEL_NO_ACCESS) {
            Dispatcher.dispatch({
                type: TaskActions.CLEAR_LIST_GRANT,
                id,
                userId,
            })
        } else {
            Dispatcher.dispatch({
                type: TaskActions.SET_LIST_GRANT,
                id,
                userId,
                level,
            })
        }
    }

    onDelete() {
        const {
            list: {id},
        } = this.props
        Dispatcher.dispatch({
            type: TaskActions.DELETE_LIST,
            id,
        })
    }

    render() {
        const {
            list,
            me,
            friendsLoading,
            friendList,
            friendsById,
        } = this.props

        // blindly copied - side by side when big, stacked when small
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
            },
        }

        const grants = list.acl.grants || {}
        const isMine = list.acl.ownerId === me.id
        const owner = isMine
            ? me
            : friendsById[list.acl.ownerId]
        const isAdministrator = isMine || includesLevel(
            grants[me.id],
            AccessLevel.ADMINISTER,
        )
        return <Form {...formItemLayout}>
            <Form.Item
                label="Name"
            >
                <Input
                    value={list.name}
                    onChange={this.onRename}
                />
            </Form.Item>
            {friendsLoading ? <Spin /> : <React.Fragment>
                <Form.Item
                    label="Owned By"
                >
                    <User {...owner} />
                </Form.Item>
                {isAdministrator && <Form.Item
                    label="Sharing"
                >
                    <List
                        bordered
                        dataSource={isMine ? friendList : friendList.filter(
                            f => f.id !== list.acl.ownerId).concat(me)}
                        renderItem={f =>
                            <List.Item>
                                <User {...f} />
                                {" "}
                                <Select
                                    value={grants[f.id] || LEVEL_NO_ACCESS}
                                    style={{color: grants[f.id] ? "inherit" : "#ccc"}}
                                    onChange={level => this.onGrantChange(
                                        f.id,
                                        level,
                                    )}
                                >
                                    <Select.Option
                                        value={LEVEL_NO_ACCESS}
                                        style={{color: "#ccc"}}
                                    >
                                        <Icon type="stop" />
                                        {" "}
                                        No Access
                                    </Select.Option>
                                    {/*<Select.Option*/}
                                    {/*    value="VIEW"*/}
                                    {/*>*/}
                                    {/*    <Icon type="eye" />*/}
                                    {/*    {" "}*/}
                                    {/*    View*/}
                                    {/*</Select.Option>*/}
                                    <Select.Option
                                        value={AccessLevel.CHANGE}
                                    >
                                        <Icon type="edit" />
                                        {" "}
                                        Modify
                                    </Select.Option>
                                    <Select.Option
                                        value={AccessLevel.ADMINISTER}
                                    >
                                        <Icon type="crown" />
                                        {" "}
                                        Administer
                                    </Select.Option>
                                </Select>
                            </List.Item>}
                    />
                </Form.Item>}
                {isAdministrator && <Form.Item
                    label="Danger Zone"
                >
                    <DeleteButton
                        type="list"
                        onConfirm={this.onDelete}
                    />
                </Form.Item>}
            </React.Fragment>}
        </Form>
    }

}

TaskListSidebar.propTypes = {
    list: PropTypes.object,
}

export default Container.createFunctional(
    props => <TaskListSidebar {...props} />,
    () => [
        UserStore,
        FriendStore,
    ],
    (prevState, {list}) => {
        const flo = FriendStore.getFriendsLO()
        const loading = !flo.hasValue()
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
        }
    },
    {withProps: true},
)