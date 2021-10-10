import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grid from "@material-ui/core/Grid";
import Grow from "@material-ui/core/Grow";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
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
    const anchorRef = React.useRef(null);
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
