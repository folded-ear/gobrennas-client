import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grid from "@mui/material/Grid";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popper from "@mui/material/Popper";
import { makeStyles } from "@mui/styles";
import { DropDownIcon } from "views/common/icons";
import React, { MouseEventHandler, ReactNode } from "react";
import { BfsId } from "global/types/identity";
import { Paper } from "@mui/material";

const useStyles = makeStyles({
    popper: {
        zIndex: 1100,
    },
});

interface Option {
    id: BfsId;
    label: string;
}

interface Props {
    primary: ReactNode;

    onClick: MouseEventHandler;

    options: Option[];

    onSelect(event: Event, opt: Option): void;

    disabled?: boolean;
    dropdownDisabled?: boolean;
}

const SplitButton: React.FC<Props> = ({
    primary,
    onClick,
    onSelect,
    options,
    disabled = false,
    dropdownDisabled = disabled,
}) => {
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
                        disabled={
                            dropdownDisabled || !options || !options.length
                        }
                    >
                        <DropDownIcon />
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
                                transformOrigin:
                                    placement === "bottom"
                                        ? "right top"
                                        : "right bottom",
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleClose}>
                                    <MenuList id="split-button-menu">
                                        {options.map((option) => (
                                            <MenuItem
                                                key={option.id}
                                                selected={
                                                    option === selectedOption
                                                }
                                                onClick={(event) =>
                                                    handleSelect(event, option)
                                                }
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

export default SplitButton;
