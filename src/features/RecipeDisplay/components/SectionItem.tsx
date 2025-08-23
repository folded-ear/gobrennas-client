import CollapseIconButton from "@/global/components/CollapseIconButton";
import { IIngredient, Section } from "@/global/types/types";
import { Divider, Grid, Stack, Typography } from "@mui/material";
import * as React from "react";
import { useCallback } from "react";
import IngredientDirectionsRow from "./IngredientDirectionsRow";

interface Props {
    section: Section<IIngredient>;
    loggedIn?: boolean;
}

const SectionItem: React.FC<Props> = ({ section, loggedIn }) => {
    const [expanded, setExpanded] = React.useState(true);
    const toggleExpanded = useCallback(() => setExpanded((s) => !s), []);
    return (
        <>
            <Grid item xs={12}>
                <Divider flexItem textAlign={"left"}>
                    <Stack direction={"row"} alignItems={"center"}>
                        <CollapseIconButton
                            expanded={expanded}
                            onClick={toggleExpanded}
                        />
                        <Typography
                            variant={"h6"}
                            mb={0}
                            onClick={toggleExpanded}
                            sx={{
                                cursor: "pointer",
                            }}
                        >
                            {section.name || "Unnamed Section"}
                        </Typography>
                    </Stack>
                </Divider>
            </Grid>
            {expanded && (
                <IngredientDirectionsRow
                    loggedIn={loggedIn}
                    recipe={section}
                    hideHeadings
                />
            )}
        </>
    );
};

export default SectionItem;
