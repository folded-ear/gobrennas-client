import { humanDate } from "util/time";

const getBucketLabel = b => {
    if (b.name) return b.name;
    if (!b.date) return `Bucket ${b.id}`;
    return humanDate(b.date);
};

export default getBucketLabel;
