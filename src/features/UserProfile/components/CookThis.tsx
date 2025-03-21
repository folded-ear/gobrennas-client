import { API_BASE_URL, API_IS_SECURE, APP_BASE_URL } from "@/constants";
import { useAuthToken } from "@/providers/AuthToken";
import { UnlockedIcon } from "@/views/common/icons";
import { Button, Stack, Typography } from "@mui/material";
import * as React from "react";

export const CookThis = () => {
    const cookThisRef = React.useRef<HTMLLinkElement>(null);
    const token = useAuthToken();
    React.useEffect(() => {
        if (!cookThisRef.current) return;
        cookThisRef.current.href = `javascript:s=document.createElement('script');s.src='${API_BASE_URL}/import_bookmarklet.js?${new URLSearchParams(
            {
                appRoot: APP_BASE_URL,
                token,
            },
        )}&_='+Date.now();s.id='foodinger-import-bookmarklet';void(document.body.appendChild(s));`;
    }, [token]);

    // The ref is passed in as 'any', because Typescript can't identify that the
    // Button component is going render as an <a> in the DOM. The ref needs to
    // be of that type for setting its 'href' attribute, so have to introduce an
    // assertion somewhere. I picked here.
    //
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cookThisRefAsAny = cookThisRef as any;

    return (
        <>
            <Typography variant={"h2"} id={"cook-this"}>
                Cook This!
            </Typography>
            <p>
                &quot;Cook This!&quot; helps import recipes into Brenna&apos;s
                Food Software. Drag it to your bookmarks bar, and then click it
                when viewing a recipe online.
            </p>
            <p style={{ textAlign: "center" }}>
                <Button
                    ref={cookThisRefAsAny}
                    component={"a"}
                    href="#"
                    variant={import.meta.env.PROD ? "contained" : "outlined"}
                    color="primary"
                    disabled={!token}
                >
                    {import.meta.env.PROD ? "Cook This!" : "DEV Cook This!"}
                </Button>
            </p>
            {!API_IS_SECURE && (
                <Stack direction={"row"} alignItems={"center"} gap={1}>
                    <UnlockedIcon />
                    <p>
                        Since you hate SSL, you&apos;ll have to do this each
                        time you log into Brenna&apos;s Food Software (deleting
                        the old one first). Sorry, man.
                    </p>
                    <UnlockedIcon />
                </Stack>
            )}
        </>
    );
};
