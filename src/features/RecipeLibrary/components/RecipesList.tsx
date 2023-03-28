import {
    Clear as ClearIcon,
    PostAdd as AddIcon,
    Search as SearchIcon,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Container as Content,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    InputAdornment,
    InputBase,
    Paper,
    Switch,
    Typography,
    useScrollTrigger,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import RecipeCard, { RecipeType } from "features/RecipeLibrary/components/RecipeCard";
import { useIsMobile } from "providers/IsMobile";
import React, {
    ReactNode,
    useState,
} from "react";
import history from "util/history";
import FoodingerFab from "views/common/FoodingerFab";
import LazyInfinite from "views/common/LazyInfinite";
import LoadingIndicator from "views/common/LoadingIndicator";
import { LibrarySearchScope } from "../../../__generated__/graphql";

const useStyles = makeStyles((theme) => {
    const search = {
        margin: theme.spacing(2, 0),
        padding: theme.spacing(1),
        display: "flex",
        alignItems: "center",
    };
    return ({
        search,
        paddedContent: {
            paddingTop: 85,
        },
        fixedSearch: {
            ...search,
            position: "fixed",
            zIndex: 1100,
            top: 70,
            minWidth: "70%",
        },
        divider: {
            height: theme.spacing(4),
            margin: theme.spacing(0, 1),
        },
        card: {
            display: "flex",
        },
    });
});

interface MessagePaperProps {
    primary: string,
    children?: ReactNode,
}

const MessagePaper: React.FC<MessagePaperProps> = ({
                                                       primary,
                                                       children,
                                                   }) => {
    return <Paper
        style={{
            textAlign: "center",
        }}
    >
        <Box p={2} pb={1}>
            {children
                ? children
                : primary && <Typography variant="h5">
                {primary}
            </Typography>}
        </Box>
    </Paper>;
};

interface RecipesListProps {
    me: any, // todo
    filter?: string,
    scope?: LibrarySearchScope,
    isLoading: boolean,
    isComplete: boolean,
    recipes?: Array<RecipeType>,

    onSearch(filter: string, scope: LibrarySearchScope): void,

    onNeedMore(): void,
}

const RecipesList: React.FC<RecipesListProps> = ({
                                                     me,
                                                     scope = LibrarySearchScope.Mine,
                                                     filter = "",
                                                     recipes,
                                                     isLoading,
                                                     isComplete,
                                                     onSearch,
                                                     onNeedMore,
                                                 }) => {
    const classes = useStyles();
    const isSearchFloating = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
    });
    const isMobile = useIsMobile();
    const [ unsavedFilter, setUnsavedFilter ] = useState(filter);

    function handleSearchChange(e) {
        setUnsavedFilter(e.target.value);
    }

    function handleClear(e) {
        e.preventDefault();
        e.stopPropagation();
        setUnsavedFilter("");
        onSearch(unsavedFilter, scope);
    }

    function handleSearch(e) {
        e.preventDefault();
        e.stopPropagation();
        onSearch(unsavedFilter, scope);
    }

    function toggleScope(e) {
        const scope = e.target.checked
            ? LibrarySearchScope.Everyone
            : LibrarySearchScope.Mine;
        onSearch(filter, scope);
    }

    let body;
    if (!!recipes) {
        if (recipes.length > 0) {
            body = <LazyInfinite
                loading={isLoading}
                complete={isComplete}
                onNeedMore={onNeedMore}
            >
                <Grid
                    container
                    spacing={4}
                    alignItems="stretch"
                >
                    {recipes.map(recipe =>
                        <Grid
                            item
                            md={4}
                            sm={6}
                            xs={12}
                            className={classes.card}
                            key={recipe.id}
                        >
                            <RecipeCard
                                recipe={recipe}
                                me={me}
                                indicateMine={scope === LibrarySearchScope.Everyone}
                                mine={recipe.owner.id === ("" + me.id)}
                            />
                        </Grid>,
                    )}
                    {isComplete && recipes.length > 5 && <Grid
                        item
                        xs={12}
                    >
                        <MessagePaper
                            primary={"That's it. Fin. The end."}
                        />
                    </Grid>}
                    {isLoading && <Grid
                        item
                        xs={12}
                    >
                        <LoadingIndicator
                            primary={"Searching..."}
                        />
                    </Grid>}
                </Grid>
            </LazyInfinite>;
        } else if (isLoading) {
            body = <LoadingIndicator />;
        } else {
            body = <MessagePaper
                primary={filter
                    ? "Zero recipes matched your filter. 🙁"
                    : "You don't have any recipes yet!"}
            />;
        }
    } else {
        body = <LoadingIndicator />;
    }
    return (
        <Content
            className={isSearchFloating ? classes.paddedContent : undefined}
        >
            <Paper
                elevation={isSearchFloating ? 4 : 1}
                className={isSearchFloating ? classes.fixedSearch : classes.search}
            >
                <InputBase
                    value={unsavedFilter}
                    onChange={handleSearchChange}
                    placeholder="Search Recipes"
                    style={{ flexGrow: 2 }}
                    onKeyDown={e => {
                        if (e.key === "Enter") {
                            handleSearch(e);
                        }
                    }}
                    endAdornment={
                        unsavedFilter
                            ? <InputAdornment position="end">
                                <IconButton
                                    onClick={e => handleClear(e)}
                                >
                                    <ClearIcon />
                                </IconButton>
                            </InputAdornment>
                            : undefined
                    }
                />
                {isMobile || isSearchFloating
                    ? <IconButton color={"primary"} onClick={handleSearch} size="large">
                        <SearchIcon />
                    </IconButton>
                    : <Button
                        variant={"contained"}
                        onClick={handleSearch}
                        color="primary"
                        type="submit"
                        aria-label="search"
                        startIcon={<SearchIcon />}>
                        Search
                    </Button>}
                <Divider className={classes.divider} orientation="vertical" />
                <FormControlLabel
                    control={
                        <Switch checked={scope === LibrarySearchScope.Everyone}
                                name="scope"
                                onChange={toggleScope}
                                color="primary"
                        />
                    }
                    label={"Everyone"}
                    labelPlacement={"start"}
                />
            </Paper>
            {body}
            <FoodingerFab
                onClick={() => history.push(`/add`)}
            >
                <AddIcon />
            </FoodingerFab>
        </Content>
    );
};

export default RecipesList;
