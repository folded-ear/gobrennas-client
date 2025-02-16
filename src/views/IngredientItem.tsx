import dispatcher, { ActionType } from "@/data/dispatcher";
import SendToPlan from "@/features/RecipeLibrary/components/SendToPlan";
import type { BfsId } from "@/global/types/identity";
import { IIngredient, IngredientRef } from "@/global/types/types";
import { useScale } from "@/util/ScalingContext";
import { LinkIcon } from "@/views/common/icons";
import Quantity from "@/views/common/Quantity";
import { Chip, Grid, IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import * as React from "react";
import { ReactNode } from "react";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles(() => ({
    quantity: {
        textAlign: "right",
    },
    name: {
        textDecorationColor: "#999",
        textDecorationStyle: "dotted",
        textDecorationLine: "underline",
    },
}));

interface AugmentProps {
    text?: BfsId | null;
    prefix?: string;
    suffix?: string;
}

const Augment: React.FC<AugmentProps> = ({ text, prefix, suffix }) =>
    text ? (
        <>
            {prefix}
            {text}
            {suffix}
        </>
    ) : null;

interface Props {
    ingRef: IngredientRef<IIngredient>;
    hideRecipeLink?: boolean;
    hideSendToPlan?: boolean;
    inline?: boolean;
}

const IngredientItem: React.FC<Props> = ({
    ingRef: ref,
    hideRecipeLink,
    hideSendToPlan,
    inline,
}) => {
    const classes = useStyles();
    const history = useHistory();
    const scale = useScale();

    let left: ReactNode, right: ReactNode;
    if (ref.quantity === 0) {
        left = <Chip label="NO" size={"small"} color={"error"} />;
    } else if (ref.quantity != null) {
        left = <Quantity quantity={ref.quantity * scale} units={ref.units} />;
    }

    if (ref.ingredient == null || typeof ref.ingredient === "string") {
        left = null;
        const name = ref.raw || ref.name;
        right = name;
        if (name && !hideSendToPlan) {
            right = (
                <>
                    {right}{" "}
                    <SendToPlan
                        onClick={(planId) =>
                            dispatcher.dispatch({
                                type: ActionType.PLAN__SEND_TO_PLAN,
                                planId,
                                name,
                            })
                        }
                        iconOnly
                    />
                </>
            );
        }
    } else {
        const ingredient = ref.ingredient;
        const isRecipe = ingredient.type === "Recipe";

        right = (
            <>
                <span className={classes.name}>{ingredient.name}</span>
                {isRecipe && !hideRecipeLink && (
                    <>
                        {" "}
                        <IconButton
                            size={"small"}
                            onClick={() =>
                                history.push(`/library/recipe/${ingredient.id}`)
                            }
                            title={`Open ${ingredient.name}`}
                        >
                            <LinkIcon fontSize="inherit" />
                        </IconButton>
                    </>
                )}
                <Augment text={ref.preparation} prefix=", " />
                {!isRecipe && !hideSendToPlan && (
                    <>
                        {" "}
                        <SendToPlan
                            onClick={(planId) =>
                                dispatcher.dispatch({
                                    type: ActionType.PANTRY_ITEM__SEND_TO_PLAN,
                                    planId,
                                    id: ingredient.id,
                                    name: ingredient.name,
                                })
                            }
                            iconOnly
                        />
                    </>
                )}
            </>
        );
    }

    if (inline) {
        return (
            <span>
                {left} {right}
            </span>
        );
    }

    return (
        <Grid container spacing={2}>
            <Grid item xs={3} className={classes.quantity}>
                {left}
            </Grid>
            <Grid item xs={9}>
                {right}
            </Grid>
        </Grid>
    );
};

export default IngredientItem;
