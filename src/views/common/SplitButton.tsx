import Button from "@mui/material/Button";
import ButtonGroup, { ButtonGroupOwnProps } from "@mui/material/ButtonGroup";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popper from "@mui/material/Popper";
import { DropDownIcon } from "@/views/common/icons";
import React, { ReactNode } from "react";
import { BfsId } from "@/global/types/identity";
import { ButtonProps, Paper } from "@mui/material";

export type SelectOption<TOption> = {
    id: BfsId;
    label: string;
    value?: TOption | null;
};

interface Props<TOption> extends ButtonGroupOwnProps {
    primary: ReactNode | string;
    onClick: ButtonProps["onClick"];
    options: SelectOption<TOption>[];
    onSelect(event: React.MouseEvent, opt: SelectOption<TOption>): void;
    disabled?: boolean;
    dropdownDisabled?: boolean;
    startIcon?: ReactNode;
}

const SplitButton = <TOption,>({
    primary,
    onClick,
    onSelect,
    options,
    disabled = false,
    dropdownDisabled = disabled,
    variant = "contained",
    color = "primary",
    startIcon,
    disableElevation,
}: Props<TOption>) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const [selectedOption, setSelectedOption] = React.useState(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick && onClick(event);
    };

    const handleSelect = (event: React.MouseEvent<HTMLLIElement>, option) => {
        setSelectedOption(option);
        setOpen(false);
        onSelect && onSelect(event, option);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <ButtonGroup
                disableElevation={disableElevation}
                variant={variant}
                ref={anchorRef}
                aria-label="split button"
                color={color}
                sx={{
                    minWidth: 0,
                }}
            >
                <Button
                    startIcon={startIcon ? startIcon : null}
                    size="small"
                    onClick={handleClick}
                    disabled={disabled}
                >
                    <span
                        style={{
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                        }}
                    >
                        {primary}
                    </span>
                </Button>
                <Button
                    size="small"
                    onClick={handleToggle}
                    disabled={dropdownDisabled || !options || !options.length}
                    sx={{
                        paddingX: 0,
                    }}
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
                placement={"bottom-end"}
                sx={{
                    popper: {
                        zIndex: 1100,
                    },
                }}
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
                                            selected={option === selectedOption}
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
        </>
    );
};

export default SplitButton;
