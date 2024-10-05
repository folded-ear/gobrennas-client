import {
    Box,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import Dispatcher from "@/data/dispatcher";
import PlanSidebar from "@/features/Planner/components/PlanSidebar";
import UserById from "@/features/Planner/components/UserById";
import PlanActions from "@/features/Planner/data/PlanActions";
import React, { useState } from "react";
import {
    AddIcon,
    CollapseAll,
    CollapseIcon,
    EditIcon,
    ExpandAll,
    SortByBucketIcon,
} from "@/views/common/icons";
import SplitButton, { SelectOption } from "@/views/common/SplitButton";
import AddToCalendar from "./AddToCalendar";
import CollapseIconButton from "@/global/components/CollapseIconButton";
import { useIsMobile } from "@/providers/IsMobile";
import MobilePlanSelector from "@/views/shop/MobilePlanSelector";
import { NavPlanItem } from "../../Navigation/components/NavPlanItem";
import { useHistory } from "react-router-dom";
import { useProfileId } from "@/providers/Profile";
import { Plan as TPlan } from "@/features/Planner/data/planStore";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import PlanAvatar from "@/views/shop/PlanAvatar";

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
    allPlans: Pick<TPlan, "id" | "name">[];
    activePlan?: TPlan;
    planDetailVisible?: boolean;
    hasBuckets?: boolean;
    canExpand?: boolean;
    loading?: boolean;
};

export default function PlanHeader({
    activePlan,
    allPlans,
    planDetailVisible = false,
    hasBuckets = false,
    canExpand = true,
    loading = false,
}: PlanHeaderProps) {
    const [name, setName] = React.useState("");
    const [showAdd, setShowAdd] = React.useState(false);
    const showPlanSelector = useIsMobile() && allPlans && allPlans.length >= 2;
    const [planSelectorOpen, setPlanSelectorOpen] = useState(false);
    const history = useHistory();
    const myId = useProfileId();

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

    if (!activePlan) {
        return <LoadingIndicator />;
    }

    return (
        <Box mx={showPlanSelector ? 0 : 1}>
            <Stack direction="row" justifyContent={"space-between"}>
                <Stack direction="row" alignItems={"center"} spacing={1}>
                    {showPlanSelector ? (
                        <CollapseIconButton
                            size={"medium"}
                            Icon={CollapseIcon}
                            expanded={planSelectorOpen}
                            onClick={() => setPlanSelectorOpen((o) => !o)}
                            sx={{
                                color: activePlan.color,
                            }}
                        />
                    ) : (
                        <PlanAvatar plan={activePlan} empty />
                    )}
                    <Typography variant="h2">
                        {activePlan && activePlan.name}
                    </Typography>
                </Stack>
                <Stack direction="row" alignItems={"center"} gap={1}>
                    <Tooltip
                        title="Edit plan, buckets, and access"
                        placement="bottom-end"
                    >
                        <span>
                            <IconButton
                                onClick={onShowDrawer}
                                disabled={!activePlan}
                                size="medium"
                            >
                                <EditIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                    {activePlan && "" + activePlan.acl.ownerId !== myId && (
                        <UserById id={activePlan.acl.ownerId} iconOnly />
                    )}
                </Stack>
            </Stack>
            {showPlanSelector && (
                <MobilePlanSelector
                    open={planSelectorOpen}
                    PlanItem={NavPlanItem}
                    onSelectPlan={(id) => history.push(`/plan/${id}`)}
                />
            )}
            <Grid container justifyContent={"space-between"}>
                {activePlan && (
                    <Grid item>
                        <Tooltip
                            title="Expand all collapsed items"
                            placement="bottom-start"
                        >
                            <span>
                                <IconButton
                                    aria-label="expand-all"
                                    onClick={onExpandAll}
                                    disabled={!canExpand}
                                    size="large"
                                >
                                    <ExpandAll />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip
                            title="Collapse all expanded items"
                            placement="bottom-start"
                        >
                            <span>
                                <IconButton
                                    aria-label="collapse-all"
                                    onClick={onCollapseAll}
                                    disabled={!canExpand}
                                    size="large"
                                >
                                    <CollapseAll />
                                </IconButton>
                            </span>
                        </Tooltip>
                        {hasBuckets && (
                            <>
                                <Tooltip
                                    title="Sort plan in bucket order"
                                    placement="bottom-start"
                                >
                                    <span>
                                        <IconButton
                                            aria-label="sort-by-bucket"
                                            onClick={sortByBucket}
                                            size="large"
                                        >
                                            <SortByBucketIcon />
                                        </IconButton>
                                    </span>
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
                    {showAdd || (allPlans.length === 0 && !loading) ? (
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
                                            allPlans.map((p) => ({
                                                label: `Duplicate "${p.name}"`,
                                                id: p.id,
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
