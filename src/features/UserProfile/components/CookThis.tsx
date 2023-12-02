import * as React from "react";
import { API_BASE_URL, API_IS_SECURE, APP_BASE_URL } from "constants/index";
import { LockOpen } from "@mui/icons-material";
import qs from "qs";
import { useAuthToken } from "providers/AuthToken";
import { Button, Typography } from "@mui/material";

export const CookThis = () => {
    const cookThisRef = React.useRef<HTMLLinkElement>(null);
    const token = useAuthToken();
    React.useEffect(() => {
        if (!cookThisRef.current) return;
        cookThisRef.current.href = `javascript:s=document.createElement('script');s.src='${API_BASE_URL}/import_bookmarklet.js?${qs.stringify(
            {
                appRoot: APP_BASE_URL,
                token,
            },
        )}&_='+Date.now();s.id='foodinger-import-bookmarklet';void(document.body.appendChild(s));`;
    }, [token]);

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
                {/*
            The ref is passed in as 'any', because Typescript can't identify
            that the Button component is going render as an <a> in the DOM. We
            need the ref to be of that type for setting its 'href' attribute, so
            have to introduce an assertion somewhere. I picked here.
            */}
                <Button
                    ref={cookThisRef as any}
                    component={"a"}
                    href="#"
                    variant={
                        process.env.NODE_ENV === "production"
                            ? "contained"
                            : "outlined"
                    }
                    color="primary"
                >
                    {process.env.NODE_ENV === "production"
                        ? "Cook This!"
                        : "DEV Cook This!"}
                </Button>
            </p>
            {!API_IS_SECURE && (
                <p>
                    <LockOpen />
                    Since you hate SSL, you&apos;ll have to do this each time
                    you log into Brenna&apos;s Food Software (deleting the old
                    one first). Sorry, man.
                    <LockOpen />
                </p>
            )}
        </>
    );
};
