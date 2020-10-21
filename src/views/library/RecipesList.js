import {
    Box,
    CircularProgress,
    FormControlLabel,
    Grid,
    Switch
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import Dispatcher from "../../data/dispatcher";
import LibraryActions from "../../data/LibraryActions";
import {
    SCOPE_EVERYONE,
    SCOPE_MINE,
} from "../../data/LibraryStore";
import {Recipe} from "../../data/RecipeTypes";
import {loadObjectOf} from "../../util/loadObjectTypes";
import SearchFilter from "./SearchFilter";
import RecipeCard from "./RecipeCard";

const useStyles = makeStyles({
    card: {
        display: "flex",
    }
});

const updateFilter = (e) => {
    const {value: filter} = e.target;
    Dispatcher.dispatch({
        type: LibraryActions.UPDATE_FILTER,
        filter
    });
};

const sendFilter = (e) => {
    if (e.key === "Enter") {
        const {value: filter} = e.target;
        Dispatcher.dispatch({
            type: LibraryActions.FILTER_LIBRARY,
            filter
        });
    }
};

const toggleScope = (e) => {
    const everyone = e.target.checked;
    Dispatcher.dispatch({
        type: LibraryActions.SET_SCOPE,
        scope: everyone ? SCOPE_EVERYONE : SCOPE_MINE,
    });
};

const RecipesList = (props: {}) => {
    const classes = useStyles();
    const {me, filter, scope, libraryLO} = props;

    return <>
        <h1>Recipe Library</h1>

        <div style={{float: "right"}}>
            <FormControlLabel
                control={
                    <Switch checked={scope === SCOPE_EVERYONE}
                            name="scope"
                            onChange={toggleScope}
                            color="primary"
                    />
                }
                label={scope === SCOPE_EVERYONE ? "Everyone" : "Mine"}
            />
        </div>

        <Box m={2}>
            <SearchFilter
                onChange={updateFilter}
                onFilter={sendFilter}
                term={filter}
            />
        </Box>

        {
            libraryLO.isLoading()
                ? <Box><CircularProgress/></Box>
                : <>{
                    libraryLO.hasValue() && <>
                        <Grid
                            container
                            spacing={4}
                            alignItems="stretch"
                        >
                            {libraryLO
                                .getValueEnforcing()
                                .map(recipe => (
                                    <Grid
                                        item
                                        md={4}
                                        sm={6}
                                        xs={12}
                                        className={classes.card}
                                        key={`gridid_${recipe.id}`}>
                                        <RecipeCard recipe={recipe} mine={recipe.ownerId === me.id}/>
                                    </Grid>)
                                )
                            }
                        </Grid>
                    </>
                }
                </>
        }
    </>;
};

RecipesList.defaultProps = {
    filter: "",
    scope: "mine"
};

RecipesList.propTypes = {
    me: PropTypes.object.isRequired,
    libraryLO: loadObjectOf(PropTypes.arrayOf(Recipe)).isRequired,
    stagedRecipes: PropTypes.arrayOf(Recipe).isRequired,
    filter: PropTypes.string,
    scope: PropTypes.string,
};

export default RecipesList;
