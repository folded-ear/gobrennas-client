import React from "react";
import {
    Box,
    Container,
    Paper,
    Typography,
} from "@mui/material";
import { useIsMobile } from "providers/IsMobile";

function Foodinger() {
    const mobile = useIsMobile();
    return <Container maxWidth={"sm"}>
        <Box m={2}>
            <Paper>
                <Box p={2}>
                    <Typography variant={"h3"} component={"h1"} paragraph>
                        Brenna&apos;s Food Software
                    </Typography>
                    <Typography paragraph>
                        Foodinger is now <a
                        href="https://gobrennas.com">Brenna&apos;s Food
                        Software</a>. Your recipes and plans are here, already
                        waiting for you.
                    </Typography>
                    {mobile
                        ? <Typography paragraph>
                            Open <a
                            href="https://gobrennas.com">gobrennas.com</a> in
                            your mobile browser, install the new app, and delete
                            this one. That&apos;s it.
                        </Typography>
                        : <Typography paragraph>
                            Update your bookmark, and that&apos;s it.
                        </Typography>}
                    <Typography paragraph>
                        Happy cooking!
                    </Typography>
                </Box>
            </Paper>
        </Box>
    </Container>;
}

export default Foodinger;
