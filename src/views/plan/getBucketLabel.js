const getBucketLabel = b => {
    if (b.name) return b.name;
    if (!b.dt) return `Bucket ${b.id}`;
    return new Intl.DateTimeFormat("default", {
        month: "short",
        weekday: "short",
        day: "numeric"
    }).format(b.dt);
};

export default getBucketLabel;
