import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grid from "@mui/material/Grid";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { makeStyles } from "@mui/styles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PropTypes from "prop-types";
import React from "react";

const useStyles = makeStyles({
    popper: {
        zIndex: 1100,
    },
});

const SplitButton = props => {
    const {
        primary,
        onClick,
        onSelect,
        options,
        disabled,
        dropdownDisabled = disabled,
    } = props;
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const [selectedOption, setSelectedOption] = React.useState(null);

    const handleClick = (event) => {
        onClick && onClick(event);
    };

    const handleSelect = (event, option) => {
        setSelectedOption(option);
        setOpen(false);
        onSelect && onSelect(event, option);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }
        setOpen(false);
    };

    return (
        <Grid container direction="column" alignItems="center">
            <Grid item xs={12}>
                <ButtonGroup
                    variant="contained"
                    ref={anchorRef}
                    aria-label="split button"
                >
                    <Button
                        size="small"
                        onClick={handleClick}
                        disabled={disabled}
                    >
                        {primary}
                    </Button>
                    <Button
                        size="small"
                        onClick={handleToggle}
                        disabled={dropdownDisabled || !options || !options.length}
                    >
                        <ArrowDropDownIcon />
                    </Button>
                </ButtonGroup>
                <Popper
                    open={open}
                    anchorEl={anchorRef.current}
                    role={undefined}
                    transition
                    disablePortal
                    className={classes.popper}
                    placement={"bottom-end"}
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: placement === "bottom" ? "right top" : "right bottom",
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu">
                                        {options.map(option => (
                                            <MenuItem
                                                key={option.id}
                                                selected={option === selectedOption}
                                                onClick={(event) => handleSelect(event, option)}
                                            >
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </Grid>
        </Grid>
    );
};

SplitButton.propTypes = {
    primary: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.any.isRequired,
        label: PropTypes.string.isRequired,
    })),
    onSelect: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    dropdownDisabled: PropTypes.bool,
};

export default SplitButton;
