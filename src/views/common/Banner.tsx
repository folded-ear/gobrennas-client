import Box from "@material-ui/core/Box";
import grey from "@material-ui/core/colors/grey";
import {
    HelpOutline,
    InfoOutlined,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import React from "react";
import CloseButton from "./CloseButton";
import { selectionColor } from "./colors";

const Banner = ({
                    severity,
                    children,
                    onClose,
                }) => {
    return <Box
        display="flex"
        alignItems="center"
        style={{
            backgroundColor: severity === "info"
                ? selectionColor[100]
                : grey[200],
        }}
    >
        <Box
            m={1}
        >
            {severity === "info"
                ? <InfoOutlined />
                : <HelpOutline />}
        </Box>
        <Box
            flexGrow={1}
        >
            {children}
        </Box>
        {onClose && <Box>
            <CloseButton
                size="small"
                onClick={onClose}
            />
        </Box>}
    </Box>;
};

Banner.propTypes = {
    severity: PropTypes.oneOf(["info"]),
    children: PropTypes.node.isRequired,
    onClose: PropTypes.func,
};

export default Banner;
