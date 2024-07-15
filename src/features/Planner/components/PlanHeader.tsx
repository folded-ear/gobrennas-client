import {
    Box,
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
import React, { useState } from "react";
import {
    AddIcon,
    CollapseAll,
    EditIcon,
    ExpandAll,
    SortByBucketIcon,
} from "views/common/icons";
import SplitButton, { SelectOption } from "views/common/SplitButton";
import AddToCalendar from "./AddToCalendar";
import CollapseIconButton from "../../../global/components/CollapseIconButton";
import { useIsMobile } from "../../../providers/IsMobile";
import MobilePlanSelector from "../../../views/shop/MobilePlanSelector";
import { NavPlanItem } from "../../Navigation/components/NavPlanItem";
import { selectPlan } from "../../Navigation/NavigationController";
import { Plan } from "features/Planner/types";

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

type PlanHeaderProps = {
    allPlans: Plan[];
    activePlan?: any;
    planDetailVisible?: boolean;
    hasBuckets?: boolean;
    canExpand?: boolean;
};

function PlanHeader({
    activePlan,
    allPlans,
    planDetailVisible = false,
    hasBuckets = false,
    canExpand = true,
}: PlanHeaderProps) {
    const [name, setName] = React.useState("");
    const [showAdd, setShowAdd] = React.useState(false);
    const showPlanSelector = useIsMobile() && allPlans && allPlans.length >= 2;
    const [planSelectorOpen, setPlanSelectorOpen] = useState(false);

    const onCreate = () => {
        if (!isValidName(name)) return;
        Dispatcher.dispatch({
            type: PlanActions.CREATE_PLAN,
            name: name.trim(),
        });
        setName("");
        setShowAdd(false);
    };

    const onDuplicate = (_, plan: SelectOption<never>) => {
        if (!isValidName(name)) return;
        Dispatcher.dispatch({
            type: PlanActions.DUPLICATE_PLAN,
            name: name.trim(),
            fromId: plan.id,
        });
        setName("");
        setShowAdd(false);
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
                        <PlanSidebar
                            open={planDetailVisible}
                            onClose={onCloseDrawer}
                            plan={activePlan}
                        />
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
                                        (allPlans.length > 0 &&
                                            allPlans.map((l) => ({
                                                label: `Duplicate "${l.name}"`,
                                                id: l.id,
                                            }))) ||
                                        []
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

export default PlanHeader;
