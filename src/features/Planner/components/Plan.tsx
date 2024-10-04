import { AddIcon } from "@/views/common/icons";
import { List } from "@mui/material";
import Dispatcher from "@/data/dispatcher";
import LoadingItem from "@/features/Planner/components/LoadingItem";
import PlanHeader from "@/features/Planner/components/PlanHeader";
import PlanItem from "@/features/Planner/components/PlanItem";
import PlanActions from "@/features/Planner/data/PlanActions";
import { isParent } from "@/features/Planner/data/plannerUtils";
import FoodingerFab from "@/views/common/FoodingerFab";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import PageBody from "@/views/common/PageBody";
import DragContainer, { Horiz, Vert } from "./DragContainer";
import { ItemTuple } from "../PlannerController";
import { FluxAction } from "@/global/types/types";
import {
    Plan as TPlan,
    PlanItem as PlanItemType,
} from "@/features/Planner/data/planStore";
import { BfsId } from "@/global/types/identity";
import { RippedLO } from "@/util/ripLoadObject";

interface Props {
    allPlans: any;
    loading: boolean;
    activePlan: RippedLO<TPlan>;
    planDetailVisible: boolean;
    itemTuples: ItemTuple[];
    isItemActive: (it: ItemTuple) => boolean;
    isItemSelected: (it: ItemTuple) => boolean;
}

export function moveSubtree(
    id: BfsId,
    target: PlanItemType | undefined,
    horizontal: Horiz,
    vertical: Vert,
) {
    if (!target) return;
    const action: FluxAction = {
        type: PlanActions.MOVE_SUBTREE,
        id,
    };
    if (horizontal === "right") {
        action.parentId = target.id;
        action.before = null; // last
    } else {
        action.parentId = target.parentId;
        if (vertical === "above") {
            action.before = target.id;
        } else {
            action.after = target.id;
        }
    }
    Dispatcher.dispatch(action);
}

function Plan({
    allPlans,
    loading,
    activePlan,
    planDetailVisible,
    itemTuples,
    isItemActive,
    isItemSelected,
}: Props) {
    if (!activePlan.data) {
        return <LoadingIndicator primary="Loading plan..." />;
    }

    const handleAddNew = (e) => {
        e.preventDefault();
        Dispatcher.dispatch({
            type: PlanActions.CREATE_ITEM_AT_END,
        });
    };

    const handleDrop = (id, targetId, vertical, horizontal) => {
        const target = itemTuples.find((it) => it.data?.id === targetId)?.data;
        moveSubtree(id, target, horizontal, targetId);
    };

    const plan = activePlan.data;
    const buckets = plan && plan.buckets;
    const canExpand = itemTuples.some((t) => t.data && isParent(t.data));

    function renderItem(item, i = -1) {
        const { data, loading, depth, ancestorDeleting } = item;
        if (data) {
            return (
                <PlanItem
                    key={data.id}
                    plan={plan}
                    depth={depth}
                    item={data}
                    ancestorDeleting={ancestorDeleting}
                    loading={loading}
                    active={isItemActive(data)}
                    selected={isItemSelected(data)}
                    buckets={buckets}
                />
            );
        } else {
            return <LoadingItem key={i} depth={depth} />;
        }
    }

    return (
        <PageBody hasFab fullWidth>
            <PlanHeader
                allPlans={allPlans}
                activePlan={plan}
                planDetailVisible={planDetailVisible}
                hasBuckets={!!buckets}
                canExpand={canExpand}
                loading={loading}
            />
            <DragContainer
                onDrop={handleDrop}
                renderOverlay={(activeId) =>
                    renderItem(
                        itemTuples.find(
                            (it) => it.data && it.data.id === activeId,
                        ),
                    )
                }
            >
                <List>{itemTuples.map(renderItem)}</List>
            </DragContainer>
            <FoodingerFab onClick={handleAddNew}>
                <AddIcon />
            </FoodingerFab>
        </PageBody>
    );
}

export default Plan;
