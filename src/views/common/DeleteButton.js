import {
    Button,
    Icon,
    Popconfirm,
} from "antd";
import PropTypes from "prop-types";
import React from "react";
import capitalize from "../../util/capitalize";

const DeleteButton = ({type, onConfirm, label = "Delete " + capitalize(type), onClick, onCancel}) =>
    <Popconfirm
        title={`Irrevocably delete this ${type}?`}
        icon={<Icon type="exclamation-circle" style={{color: "red"}} />}
        okType="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
    >
        <Button
            type="danger"
            icon={"delete"}
            onClick={onClick}
        >{label}</Button>
    </Popconfirm>;

DeleteButton.propTypes = {
    type: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    label: PropTypes.string,
    onClick: PropTypes.func,
    onCancel: PropTypes.func,
};

export default DeleteButton;