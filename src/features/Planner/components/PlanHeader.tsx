import dispatcher, { ActionType } from "@/data/dispatcher";
import PlanSidebar from "@/features/Planner/components/PlanSidebar";
import UserById from "@/features/Planner/components/UserById";
import { Plan as TPlan } from "@/features/Planner/data/planStore";
import CollapseIconButton from "@/global/components/CollapseIconButton";
import { useIsMobile } from "@/providers/IsMobile";
import { useProfileId } from "@/providers/Profile";
import Directions from "@/views/common/Directions";
import {
    AddIcon,
    CollapseAll,
    CollapseIcon,
    EditIcon,
    EditPlanNotes,
    ExpandAll,
    SortByBucketIcon,
} from "@/views/common/icons";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import SplitButton, { SelectOption } from "@/views/common/SplitButton";
import MobilePlanSelector from "@/views/shop/MobilePlanSelector";
import PlanAvatar from "@/views/shop/PlanAvatar";
import {
    Box,
    Grid,
    IconButton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import * as React from "react";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { NavPlanItem } from "../../Navigation/components/NavPlanItem";
import AddToCalendar from "./AddToCalendar";

const isValidName = (name: string) => name != null && name.trim().length > 0;

const onShowDrawer = () =>
    dispatcher.dispatch({
        type: ActionType.PLAN__PLAN_DETAIL_VISIBILITY,
        visible: true,
    });

const onCloseDrawer = () =>
    dispatcher.dispatch({
        type: ActionType.PLAN__PLAN_DETAIL_VISIBILITY,
        visible: false,
    });

const onExpandAll = () =>
    dispatcher.dispatch({
        type: ActionType.PLAN__EXPAND_ALL,
    });

const onCollapseAll = () =>
    dispatcher.dispatch({
        type: ActionType.PLAN__COLLAPSE_ALL,
    });

const sortByBucket = () =>
    dispatcher.dispatch({
        type: ActionType.PLAN__SORT_BY_BUCKET,
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
    const [editingNotes, setEditingNotes] = useState(false);

    if (!activePlan) {
        return <LoadingIndicator />;
    }

    const handleCreate = () => {
        if (!isValidName(name)) return;
        dispatcher.dispatch({
            type: ActionType.PLAN__CREATE_PLAN,
            name: name.trim(),
        });
        setName("");
        setShowAdd(false);
    };

    const handleDuplicate = (_: never, plan: SelectOption<never>) => {
        if (!isValidName(name)) return;
        dispatcher.dispatch({
            type: ActionType.PLAN__DUPLICATE_PLAN,
            name: name.trim(),
            fromId: plan.id,
        });
        setName("");
        setShowAdd(false);
    };

    const handleEditNotes = () => setEditingNotes(true);

    const handleNotesUpdated = (e: React.FocusEvent) => {
        setEditingNotes(false);
        const { value } = e.target as HTMLTextAreaElement;
        const notes = (value ?? "").trim();
        const curr = (activePlan.notes ?? "").trim();
        if (notes !== curr) {
            dispatcher.dispatch({
                type: ActionType.PLAN__SET_PLAN_NOTES,
                id: activePlan.id,
                notes,
            });
        }
    };

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
                    {activePlan && activePlan.acl.ownerId !== myId && (
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
            {editingNotes ? (
                <TextField
                    name="notes"
                    label="Notes"
                    multiline
                    rows={6}
                    defaultValue={activePlan.notes || ""}
                    onBlur={handleNotesUpdated}
                    placeholder="Notes..."
                    fullWidth
                    variant="outlined"
                    autoFocus
                />
            ) : (
                activePlan.notes && (
                    <>
                        <Directions text={activePlan.notes} />
                        <Divider />
                    </>
                )
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
                        <Tooltip
                            title="Edit plan notes"
                            placement="bottom-start"
                        >
                            <IconButton
                                aria-label="edit-notes"
                                onClick={handleEditNotes}
                                size="large"
                            >
                                <EditPlanNotes />
                            </IconButton>
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
                                    onClick={handleCreate}
                                    options={
                                        (allPlans.length > 0 &&
                                            allPlans.map((p) => ({
                                                label: `Duplicate "${p.name}"`,
                                                id: p.id,
                                            }))) ||
                                        []
                                    }
                                    onSelect={handleDuplicate}
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
