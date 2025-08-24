import { BfsId } from "@/global/types/identity";
import { DropDownIcon } from "@/views/common/icons";
import { ButtonGroupProps, ButtonProps, Paper } from "@mui/material";
import Button from "@mui/material/Button";
import ButtonGroup, { ButtonGroupOwnProps } from "@mui/material/ButtonGroup";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Popper from "@mui/material/Popper";
import * as React from "react";
import { ReactNode } from "react";

export type SelectOption<TOption> = {
    id: BfsId;
    label: string;
    value?: TOption | null;
};

type Props<TOption> = ButtonGroupOwnProps & {
    primary: ReactNode | string;
    onClick: ButtonProps["onClick"];
    options: SelectOption<TOption>[];
    onSelect(event: React.MouseEvent, opt: SelectOption<TOption>): void;
    disabled?: boolean;
    dropdownDisabled?: boolean;
    startIcon?: ReactNode;
    className?: ButtonGroupProps["className"];
};

const SplitButton = <TOption,>({
    primary,
    className,
    onClick,
    onSelect,
    options,
    disabled = false,
    dropdownDisabled = disabled,
    variant = "contained",
    color = "primary",
    size = "small",
    startIcon,
    disableElevation,
}: Props<TOption>) => {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const [selectedOption, setSelectedOption] =
        React.useState<SelectOption<TOption>>();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) onClick(event);
    };

    const handleSelect = (
        event: React.MouseEvent<HTMLLIElement>,
        option: SelectOption<TOption>,
    ) => {
        setSelectedOption(option);
        setOpen(false);
        if (onSelect) onSelect(event, option);
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
                size={size}
                className={className}
            >
                <Button
                    startIcon={startIcon ? startIcon : null}
                    size={size}
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
                    size={size}
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
                    // this gets the menu up above field placeholders
                    zIndex: 2,
                }}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement.includes("bottom")
                                ? "right top"
                                : "right bottom",
                        }}
                    >
                        <Paper
                            elevation={4}
                            sx={{
                                borderStartStartRadius: 0,
                                borderStartEndRadius: 0,
                            }}
                        >
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList
                                    id="split-button-menu"
                                    dense={size === "small"}
                                >
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
