import * as React from "react";
import Button from "@material-ui/core/Button";
import {API_IS_SECURE, APP_BASE_URL} from "../../../constants";
import {LockOpen} from "@material-ui/icons";
import qs from "qs";
import {useAuthToken} from "../../../providers/AuthToken";

export const CookThis = () => {
    const cookThisRef = React.useRef();
    const token = useAuthToken();
    React.useEffect(() => {
        cookThisRef.current.href = `javascript:s=document.createElement('script');s.src='${APP_BASE_URL}/import_bookmarklet.js?${qs.stringify(
            {
                token,
            })}&_='+Date.now();s.id='foodinger-import-bookmarklet';void(document.body.appendChild(s));`;
    }, [cookThisRef.current]);

    return (
        <>
        <h2>Cook This!</h2>
        <p>&quot;Cook This!&quot; helps import recipes into Foodinger. Drag
            it to your bookmarks bar, and then click it to when viewing a
            recipe online.
        </p>
        <p style={{textAlign: "center"}}>
            <Button
                ref={cookThisRef}
                href="#"
                variant={process.env.NODE_ENV === "production" ? "contained" : "outlined"}
                color="primary"
            >
                {process.env.NODE_ENV === "production"
                    ? "Cook This!"
                    : "DEV Cook This!"}
            </Button>
        </p>
        {!API_IS_SECURE && <p>
            <LockOpen />
            Since you hate SSL, you&apos;ll have to do this each time you log
            into Foodinger (deleting the old one first). Sorry, man.
            <LockOpen />
        </p>}
    </>
    );
};