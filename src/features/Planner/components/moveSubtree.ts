import dispatcher, { ActionType } from "@/data/dispatcher";
import { Horiz, Vert } from "@/features/Planner/components/DragContainer";
import { PlanItem as PlanItemType } from "@/features/Planner/data/planStore";
import { BfsId } from "@/global/types/identity";

function moveSubtreeInternal(
    id: BfsId,
    parentId: BfsId,
    before?: BfsId,
    after?: BfsId,
) {
    dispatcher.dispatch({
        type: ActionType.PLAN__MOVE_SUBTREE,
        id,
        parentId,
        before,
        after,
    });
}

export function moveSubtree(
    id: BfsId,
    target: PlanItemType | undefined,
    horizontal: Horiz,
    vertical: Vert,
) {
    if (!target) return;
    if (horizontal === "right") {
        moveSubtreeInternal(id, target.id); // as last child
    } else if (vertical === "above") {
        moveSubtreeInternal(id, target.parentId, target.id);
    } else {
        moveSubtreeInternal(id, target.parentId, undefined, target.id);
    }
}
