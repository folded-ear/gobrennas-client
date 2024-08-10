import useFluxStore from "./useFluxStore";
import { mapData } from "@/util/ripLoadObject";
import planStore from "@/features/Planner/data/planStore";
import friendStore from "./FriendStore";
import { zippedComparator } from "@/util/comparators";
import { usePendingProfile } from "@/providers/Profile";

export default function useAllPlansRLO() {
    const profileRLO = usePendingProfile();
    return useFluxStore(
        () =>
            mapData(planStore.getPlansRlo(), (plans) => {
                const myId = profileRLO.data && profileRLO.data.id;
                const orderComponentsById = plans.reduce((byId, p) => {
                    let ownerId =
                        (p.acl ? p.acl.ownerId : undefined) ||
                        Number.MAX_SAFE_INTEGER;
                    let ownerName = "";
                    if (ownerId === myId) {
                        ownerId = -1;
                    } else {
                        const rlo = friendStore.getFriendRlo(ownerId);
                        if (rlo.data) {
                            ownerName = rlo.data.name;
                        }
                    }
                    byId[p.id] = [ownerId, ownerName, p.name];
                    return byId;
                }, {});
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
