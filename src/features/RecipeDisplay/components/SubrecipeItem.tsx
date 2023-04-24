import {
    Divider,
    Grid,
    Typography,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { formatDuration } from "util/time";
import CollapseIconButton from "global/components/CollapseIconButton";
import IngredientDirectionsRow from "./IngredientDirectionsRow";
import { ScalingProvider } from "util/ScalingContext";
import { Recipe } from "global/types/types";

const useStyles = makeStyles({
    time: {
        display: "inline-block",
        marginLeft: "1em",
        fontSize: "80%",
    },
});

interface Props {
    recipe: Recipe
    loggedIn?: boolean
}

const SubrecipeItem: React.FC<Props> = ({
                                            recipe,
                                            loggedIn,
                                        }) => {
    const classes = useStyles();
    const [ expanded, setExpanded ] = React.useState(false);
    return <>
        <Grid item xs={12}>
            <Typography variant="h5">
                <CollapseIconButton
                    expanded={expanded}
                    onClick={() => setExpanded(s => !s)}
                />
                <span
                    onClick={() => setExpanded(s => !s)}
                    style={{
                        cursor: "pointer",
                    }}
                >
                    {recipe.name}
                </span>
                {recipe.totalTime && <Typography
                    variant={"subtitle1"}
                    component={"span"}
                    className={classes.time}
                >
                    ({formatDuration(recipe.totalTime)})
                </Typography>}
            </Typography>
        </Grid>
        {expanded && <>
            {/* Subrecipes do not scale w/ the main recipe */}
            <ScalingProvider>
                <IngredientDirectionsRow
                    loggedIn={loggedIn}
                    recipe={recipe}
                    hideHeadings
                />
            </ScalingProvider>
            <Grid item xs={12}>
                <Divider
                    variant={"middle"}
                />
            </Grid>
        </>}
    </>;
};

export default SubrecipeItem;
