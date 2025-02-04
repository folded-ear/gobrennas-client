import React from "react";
import { AddIcon, AddToCalendarIcon } from "@/views/common/icons";
import type { Plan } from "@/features/Planner/data/planStore";
import ModalButton from "@/views/ModalButton";
import { API_BASE_URL } from "@/constants";
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    TextField,
} from "@mui/material";
import { RippedLO } from "@/util/ripLoadObject";
import { bfsIdEq, ensureString } from "@/global/types/identity";
import PlanApi from "@/features/Planner/data/PlanApi";
import { ShareInfo } from "@/global/types/types";

interface Props {
    plan: Plan;
}

const Body: React.FC<Props> = ({ plan }) => {
    const [rlo, setRlo] = React.useState<RippedLO<ShareInfo>>({});
    React.useEffect(() => {
        if (rlo.data && bfsIdEq(rlo.data.id, plan.id)) {
            return;
        }
        setRlo({
            loading: true,
            data: {
                id: ensureString(plan.id),
                slug: "",
                secret: "",
            },
        });
        PlanApi.promiseShareInfo(plan.id).then(
            (data) =>
                setRlo({
                    data,
                }),
            (error) =>
                setRlo({
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
                    <Button onClick={() => setRlo({})}>Try Again</Button>
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
                    In Google Calendar, find &quot;Other Calendars&quot; in the
                    sidebar, click <AddIcon />, select &quot;From URL&quot;, and
                    paste in the URL above.
                </p>
                <p>
                    Other calendar applications are similar, perhaps labeled
                    &quot;Import from URL&quot; or &quot;Add Calendar from
                    iCal&quot;.
                </p>
            </>
        );
    }
};

const AddToCalendar: React.FC<Props> = ({ plan }) => {
    return (
        <ModalButton
            buttonTitle="Add to Calendar"
            icon={<AddToCalendarIcon />}
            render={() => <Body plan={plan} />}
        />
    );
};

export default AddToCalendar;
