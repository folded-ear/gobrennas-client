import useFluxStore from "./useFluxStore";
import { ripLoadObject } from "../util/ripLoadObject";
import planStore from "../features/Planner/data/planStore";
import friendStore from "./FriendStore";
import { zippedComparator } from "../util/comparators";
import { useProfileLO } from "../providers/Profile";

export default function useAllPlansRLO() {
    const profileRLO = ripLoadObject(useProfileLO());
    return useFluxStore(
        () =>
            ripLoadObject(
                planStore.getPlansLO().map((plans) => {
                    const myId = profileRLO.data && profileRLO.data.id;
                    const orderComponentsById = plans.reduce((byId, p) => {
                        let ownerId =
                            (p.acl ? p.acl.ownerId : undefined) ||
                            Number.MAX_SAFE_INTEGER;
                        let ownerName = "";
                        if (ownerId === myId) {
                            ownerId = -1;
                        } else {
                            const rlo = ripLoadObject(
                                friendStore.getFriendLO(ownerId),
                            );
                            if (rlo.data) {
                                // eslint-disable-next-line @typescript-eslint/no-extra-non-null-assertion
                                ownerName = rlo.data.name!!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
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
            ),
        [planStore, friendStore],
        [profileRLO.data],
    );
}
