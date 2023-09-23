import React from "react";
import {
  Add as PlusIcon,
  CalendarMonth as CalendarIcon
} from "@mui/icons-material";
import { PlanItem } from "../data/planStore";
import ModalButton from "../../../views/ModalButton";
import { API_BASE_URL } from "../../../constants";
import BaseAxios from "axios";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  TextField
} from "@mui/material";
import {
  emptyRLO,
  RippedLO
} from "../../../util/ripLoadObject";

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/plan`,
});

interface Props {
    plan: PlanItem;
}

interface SharedPlan {
    id: PlanItem["id"];
    secret: string;
    slug: string;
}

const Body: React.FC<Props> = ({ plan }) => {
    const [rlo, setRlo] = React.useState<RippedLO<SharedPlan>>(emptyRLO());
    React.useEffect(() => {
        if (rlo.data && rlo.data.id === plan.id) {
            return;
        }
        setRlo({
            ...emptyRLO(),
            loading: true,
            data: {
                id: plan.id,
                slug: "",
                secret: "",
            },
        });
        axios.get(`/${plan.id}/share`).then(
            (data) =>
                setRlo({
                    ...emptyRLO(),
                    data: data.data,
                }),
            (error) =>
                setRlo({
                    ...emptyRLO(),
                    error,
                }),
        );
    }, [rlo, plan.id]);
    if (rlo.loading || !rlo.data) {
        return (
            <Box style={{ textAlign: "center" }}>
                <CircularProgress />
            </Box>
        );
    } else if (rlo.error) {
        return (
            <div>
                Something went wrong getting a sharable link.
                <div style={{ textAlign: "right" }}>
                    <Button onClick={() => setRlo(emptyRLO())}>
                        Try Again
                    </Button>
                </div>
            </div>
        );
    } else {
        // got it!
        const info = rlo.data;
        const iCalUrl = `${API_BASE_URL}/shared/plan/${info.slug}/${info.secret}/${info.id}.ics`;
        return (
            <>
                <p>
                    Add the below iCalendar link and have your plan synced to
                    your devices automatically:
                </p>
                <TextField
                    value={iCalUrl}
                    fullWidth
                    multiline
                    onFocus={(e) => e.target.select()}
                    autoFocus
                />
                <Divider />
                <p>
                    In Google Calendar, find "Other Calendars" in the sidebar,
                    click
                    <PlusIcon />, select "From URL", and paste in the URL above.
                </p>
                <p>
                    Other calendar applications are similar, perhaps labeled
                    "Import from URL" or "Add Calendar from iCal".
                </p>
            </>
        );
    }
};

const AddToCalendar: React.FC<Props> = ({ plan }) => {
    return (
        <ModalButton
            buttonTitle="Add to Calendar"
            icon={<CalendarIcon />}
            render={() => <Body plan={plan} />}
        />
    );
};

export default AddToCalendar;
