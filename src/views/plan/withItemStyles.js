import withStyles from "@material-ui/core/styles/withStyles";

const withItemStyles = withStyles({
    text: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    section: {
        borderBottomColor: "#ccc",
        "& input": {
            fontWeight: "bold",
        },
        "& .MuiTypography-body1": {
            fontWeight: "bold",
        },
    },
    question: {
        backgroundColor: "#ffd",
    },
    selected: {
        backgroundColor: "#f0f7ff",
    },
    deleting: {
        opacity: 0.8,
        textDecoration: "line-through",
    },
    completing: {
        opacity: 0.8,
        backgroundColor: "#f0fff0",
    },
    ancestorDeleting: {
        opacity: 0.6,
        textDecoration: "line-through",
    },
});

export default withItemStyles;
