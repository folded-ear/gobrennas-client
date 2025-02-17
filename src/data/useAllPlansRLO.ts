import planStore from "@/features/Planner/data/planStore";
import { BfsId, bfsIdEq } from "@/global/types/identity";
import { usePendingProfile } from "@/providers/Profile";
import { zippedComparator } from "@/util/comparators";
import { mapData } from "@/util/ripLoadObject";
import friendStore from "./FriendStore";
import useFluxStore from "./useFluxStore";

export default function useAllPlansRLO() {
    const profileRLO = usePendingProfile();
    return useFluxStore(
        () =>
            mapData(planStore.getPlansRlo(), (plans) => {
                const myId = profileRLO.data && profileRLO.data.id;
                const orderComponentsById: Record<
                    BfsId,
                    [BfsId, string, string]
                > = {};
                for (const p of plans) {
                    let ownerId = p.acl?.ownerId ?? Number.MAX_SAFE_INTEGER;
                    let ownerName = "";
                    if (bfsIdEq(ownerId, myId)) {
                        ownerId = 0;
                    } else {
                        const rlo = friendStore.getFriendRlo(ownerId);
                        if (rlo.data) {
                            ownerName = rlo.data.name ?? "";
                        }
                    }
                    orderComponentsById[p.id] = [ownerId, ownerName, p.name];
                }
                return plans
                    .slice()
                    .sort((a, b) =>
                        zippedComparator(
                            orderComponentsById[a.id],
                            orderComponentsById[b.id],
                        ),
                    );
            }),
        [planStore, friendStore],
        [profileRLO.data],
    );
}
