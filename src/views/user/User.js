import { Avatar } from "antd";
import PropTypes from "prop-types";
import React from "react";

const User = ({
                  name,
                  email,
                  imageUrl,
                  size = "small",
    iconOnly = false,
              }) =>
    <span title={iconOnly ? name ? `${name} <${email}>` : email : email}>
        <Avatar src={imageUrl} size={size}>{(name || email || "U").charAt(0).toUpperCase()}</Avatar>
        {!iconOnly && <React.Fragment>
            {" "}
            {name || email}
        </React.Fragment>}
    </span>;

User.propTypes = {
    name: PropTypes.string,
    email: PropTypes.string,
    imageUrl: PropTypes.string,
    size: PropTypes.oneOfType([
        PropTypes.oneOf([
            "small",
            "default",
            "large",
        ]),
        PropTypes.number,
    ]),
    iconOnly: PropTypes.bool,
};

export default User;