import IconButton from "@material-ui/core/IconButton";
import {
    ArrowDropDown,
    ArrowRight,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";

class CollapseIconButton extends React.PureComponent {
    render() {
        const {
            expanded,
            ...props
        } = this.props;
        const Icn = expanded ? ArrowDropDown : ArrowRight;
        return <IconButton
            size="small"
            {...props}
        >
            <Icn />
        </IconButton>;
    }
}

CollapseIconButton.propTypes = {
    expanded: PropTypes.bool.isRequired,
};

export default CollapseIconButton;
