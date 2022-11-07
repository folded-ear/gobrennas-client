import {
    Divider,
    Grid,
    Typography,
} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import PropTypes from "prop-types";
import React from "react";
import { Recipe } from "../../data/RecipeTypes";
import { formatDuration } from "util/time";
import CollapseIconButton from "global/components/CollapseIconButton";
import IngredientDirectionsRow from "./IngredientDirectionsRow";

const useStyles = makeStyles({
    time: {
        display: "inline-block",
        marginLeft: "1em",
        fontSize: "80%",
    },
});

const SubrecipeItem = ({recipe, loggedIn}) => {
    const classes = useStyles();
    const [expanded, setExpanded] = React.useState(false);
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
            <IngredientDirectionsRow
                loggedIn={loggedIn}
                recipe={recipe}
                hideHeadings
            />
            <Grid item xs={12}>
                <Divider
                    variant={"middle"}
                />
            </Grid>
        </>}
    </>;
};

SubrecipeItem.propTypes = {
    recipe: Recipe.isRequired,
    loggedIn: PropTypes.bool,
};

export default SubrecipeItem;
