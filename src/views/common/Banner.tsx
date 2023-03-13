import Box from "@mui/material/Box";
import grey from "@mui/material/colors/grey";
import {
    HelpOutline,
    InfoOutlined,
} from "@mui/icons-material";
import PropTypes from "prop-types";
import React from "react";
import CloseButton from "views/common/CloseButton";
import { lightBlue } from "@mui/material/colors";

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
                ? lightBlue[100]
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
