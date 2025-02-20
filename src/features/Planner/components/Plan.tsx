import dispatcher, { ActionType } from "@/data/dispatcher";
import LoadingItem from "@/features/Planner/components/LoadingItem";
import { moveSubtree } from "@/features/Planner/components/moveSubtree";
import PlanHeader from "@/features/Planner/components/PlanHeader";
import PlanItem from "@/features/Planner/components/PlanItem";
import { isParent } from "@/features/Planner/data/plannerUtils";
import { Plan as TPlan } from "@/features/Planner/data/planStore";
import { BfsId, Identified } from "@/global/types/identity";
import { RippedLO } from "@/util/ripLoadObject";
import FoodingerFab from "@/views/common/FoodingerFab";
import { AddIcon } from "@/views/common/icons";
import LoadingIndicator from "@/views/common/LoadingIndicator";
import PageBody from "@/views/common/PageBody";
import { List } from "@mui/material";
import * as React from "react";
import { ItemTuple } from "../PlannerController";
import DragContainer, { Horiz, Vert } from "./DragContainer";

interface Props {
    allPlans: Array<Pick<TPlan, "id" | "name" | "color">>;
    loading: boolean;
    activePlan: RippedLO<TPlan>;
    planDetailVisible: boolean;
    itemTuples: ItemTuple[];
    isItemActive: (it: Identified) => boolean;
    isItemSelected: (it: Identified) => boolean;
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

    const handleAddNew = (e: React.MouseEvent) => {
        e.preventDefault();
        dispatcher.dispatch({
            type: ActionType.PLAN__CREATE_ITEM_AT_END,
        });
    };

    const handleDrop = (
        id: BfsId,
        targetId: BfsId,
        vertical: Vert,
        horizontal: Horiz,
    ) => {
        // nice linear scan...
        const target = itemTuples.find(
            (it) => it.data && it.data.id === targetId,
        )?.data;
        moveSubtree(id, target, horizontal, vertical);
    };

    const plan = activePlan.data;
    const buckets = plan && plan.buckets;
    const canExpand = itemTuples.some((t) => t.data && isParent(t.data));

    function renderItem(item: ItemTuple | undefined, i = -1) {
        if (!item) return null; // this soaks up when the active dragging item is deleted
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
        <PageBody>
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
