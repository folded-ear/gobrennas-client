import React from "react";
import PropTypes from "prop-types";
import { Avatar } from "antd";

const User = ({
                  name,
                  email,
                  imageUrl,
                  size = "small",
              }) =>
    <span title={email}>
        <Avatar src={imageUrl} size={size}>{(name || "U").charAt(0).toUpperCase()}</Avatar>
        {" "}
        {name}
    </span>;

User.propTypes = {
    name: PropTypes.string.isRequired,
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
};

export default User