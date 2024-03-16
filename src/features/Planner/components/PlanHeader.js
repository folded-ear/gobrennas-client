import {
    Add as AddIcon,
    DynamicFeed as SortByBucketIcon,
    Edit as EditIcon,
} from "@mui/icons-material";
import {
    Box,
    Drawer,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import Dispatcher from "data/dispatcher";
import PlanSidebar from "features/Planner/components/PlanSidebar";
import UserById from "features/Planner/components/UserById";
import PlanActions from "features/Planner/data/PlanActions";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { CollapseAll, ExpandAll } from "views/common/icons";
import SplitButton from "views/common/SplitButton";
import AddToCalendar from "./AddToCalendar";
import CollapseIconButton from "../../../global/components/CollapseIconButton";
import { useIsMobile } from "../../../providers/IsMobile";
import MobilePlanSelector from "../../../views/shop/MobilePlanSelector";
import { NavPlanItem } from "../../Navigation/components/NavPlanItem";
import { selectPlan } from "../../Navigation/NavigationController";

const isValidName = (name) => name != null && name.trim().length > 0;

const onShowDrawer = () =>
    Dispatcher.dispatch({
        type: PlanActions.PLAN_DETAIL_VISIBILITY,
        visible: true,
    });

const onCloseDrawer = () =>
    Dispatcher.dispatch({
        type: PlanActions.PLAN_DETAIL_VISIBILITY,
        visible: false,
    });

const onExpandAll = () =>
    Dispatcher.dispatch({
        type: PlanActions.EXPAND_ALL,
    });

const onCollapseAll = () =>
    Dispatcher.dispatch({
        type: PlanActions.COLLAPSE_ALL,
    });

const sortByBucket = () =>
    Dispatcher.dispatch({
        type: PlanActions.SORT_BY_BUCKET,
    });

function PlanHeader({
    activePlan,
    allPlans,
    planDetailVisible = false,
    hasBuckets = false,
    canExpand = true,
}) {
    const [name, setName] = React.useState("");
    const [showAdd, setShowAdd] = React.useState(false);
    const showPlanSelector = useIsMobile() && allPlans && allPlans.length >= 2;
    const [planSelectorOpen, setPlanSelectorOpen] = useState(false);

    const onCreate = () => {
        if (!isValidName(name)) return;
        setName("");
        setShowAdd(false);
        Dispatcher.dispatch({
            type: PlanActions.CREATE_PLAN,
            name: name.trim(),
        });
    };

    const onDuplicate = (e, list) => {
        if (!isValidName(name)) return;
        setName("");
        Dispatcher.dispatch({
            type: PlanActions.DUPLICATE_PLAN,
            name: name.trim(),
            fromId: list.id,
        });
    };

    return (
        <Box mx={showPlanSelector ? 0 : 1}>
            <Typography variant="h2">
                <Stack direction="row" alignItems={"center"} spacing={1}>
                    {showPlanSelector && (
                        <CollapseIconButton
                            size={"medium"}
                            expanded={planSelectorOpen}
                            onClick={() => setPlanSelectorOpen((o) => !o)}
                        />
                    )}
                    {activePlan && activePlan.acl && (
                        <UserById id={activePlan.acl.ownerId} iconOnly />
                    )}
                    {activePlan && activePlan.name}
                    <Tooltip
                        title="Edit plan, buckets, and access"
                        placement="bottom-start"
                    >
                        <IconButton
                            onClick={onShowDrawer}
                            disabled={!activePlan}
                            size="medium"
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Typography>
            {showPlanSelector && (
                <MobilePlanSelector
                    open={planSelectorOpen}
                    PlanItem={NavPlanItem}
                    onSelectPlan={selectPlan}
                />
            )}
            <Grid container justifyContent={"space-between"}>
                {activePlan && (
                    <Grid item>
                        <Tooltip
                            title="Expand all collapsed items"
                            placement="bottom-start"
                        >
                            <IconButton
                                aria-label="expand-all"
                                onClick={onExpandAll}
                                disabled={!canExpand}
                                size="large"
                            >
                                <ExpandAll />
                            </IconButton>
                        </Tooltip>
                        <Tooltip
                            title="Collapse all expanded items"
                            placement="bottom-start"
                        >
                            <IconButton
                                aria-label="collapse-all"
                                onClick={onCollapseAll}
                                disabled={!canExpand}
                                size="large"
                            >
                                <CollapseAll />
                            </IconButton>
                        </Tooltip>
                        {hasBuckets && (
                            <>
                                <Tooltip
                                    title="Sort plan in bucket order"
                                    placement="bottom-start"
                                >
                                    <IconButton
                                        aria-label="sort-by-bucket"
                                        onClick={sortByBucket}
                                        size="large"
                                    >
                                        <SortByBucketIcon />
                                    </IconButton>
                                </Tooltip>
                                <AddToCalendar plan={activePlan} />
                            </>
                        )}
                        <Drawer
                            open={planDetailVisible}
                            anchor="right"
                            onClose={onCloseDrawer}
                        >
                            <div
                                style={{
                                    minHeight: "100%",
                                    minWidth: "40vw",
                                    maxWidth: "90vw",
                                    backgroundColor: "#f7f7f7",
                                }}
                            >
                                <PlanSidebar plan={activePlan} />
                            </div>
                        </Drawer>
                    </Grid>
                )}
                <Grid item>
                    {showAdd || allPlans.length === 0 ? (
                        <Grid container>
                            <Grid item>
                                <TextField
                                    label="New Plan..."
                                    value={name}
                                    size={"small"}
                                    variant={"outlined"}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setName(value == null ? "" : value);
                                    }}
                                    autoFocus
                                    onKeyUp={(e) => {
                                        if (e.key === "Escape") {
                                            setShowAdd(false);
                                            setName("");
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <SplitButton
                                    primary={<AddIcon />}
                                    onClick={onCreate}
                                    options={
                                        allPlans.length > 0 &&
                                        allPlans.map((l) => ({
                                            label: `Duplicate "${l.name}"`,
                                            id: l.id,
                                        }))
                                    }
                                    onSelect={onDuplicate}
                                    disabled={!isValidName(name)}
                                />
                            </Grid>
                        </Grid>
                    ) : (
                        <Tooltip
                            title="Create a new plan"
                            placement="bottom-end"
                        >
                            <IconButton
                                onClick={() => setShowAdd(true)}
                                size="large"
                            >
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}

PlanHeader.propTypes = {
    allPlans: PropTypes.array.isRequired,
    activePlan: PropTypes.object,
    planDetailVisible: PropTypes.bool,
    hasBuckets: PropTypes.bool,
    canExpand: PropTypes.bool,
};

export default PlanHeader;
