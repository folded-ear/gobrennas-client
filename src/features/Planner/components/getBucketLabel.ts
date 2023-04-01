import { humanDate } from "util/time";
import { Bucket } from "../data/TaskStore";

function getBucketLabel(b: Bucket): string {
    if (b.name) return b.name;
    if (!b.date) return `Bucket ${b.id}`;
    return humanDate(b.date);
}

export default getBucketLabel;
