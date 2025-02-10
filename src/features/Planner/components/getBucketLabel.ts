import { PlanBucket } from "@/features/Planner/data/planStore";
import { humanDate } from "@/util/time";

function getBucketLabel(b: PlanBucket): string {
    if (b.name) return b.name;
    if (!b.date) return `Bucket ${b.id}`;
    return humanDate(b.date);
}

export default getBucketLabel;
