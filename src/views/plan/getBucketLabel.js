const getBucketLabel = b => {
    if (b.name) return b.name;
    if (!b.date) return `Bucket ${b.id}`;
    return new Intl.DateTimeFormat("default", {
        month: "short",
        weekday: "short",
        day: "numeric"
    }).format(b.date);
};

export default getBucketLabel;
