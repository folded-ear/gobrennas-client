import { useIsAuthenticated } from "@/providers/Profile";
import { Alert, AlertTitle, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import { useRegisterSW } from "virtual:pwa-register/react";

function NewVersionPrompt() {
    const authenticated = useIsAuthenticated();
    // periodic sync is disabled, change the value to enable it, the period is in milliseconds
    // You can remove onRegisteredSW callback and registerPeriodicSync function
    const period = 0;

    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, r) {
            if (period <= 0) return;
            if (r?.active?.state === "activated") {
                registerPeriodicSync(period, swUrl, r);
            } else if (r?.installing) {
                r.installing.addEventListener("statechange", (e) => {
                    const sw = e.target as ServiceWorker;
                    if (sw.state === "activated")
                        registerPeriodicSync(period, swUrl, r);
                });
            }
        },
    });

    function close() {
        setNeedRefresh(false);
    }

    return authenticated && needRefresh ? (
        <Alert severity="info">
            <AlertTitle>Brenna&apos;s Food Software has updated!</AlertTitle>
            <Stack direction={"row"} gap={1}>
                <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    onClick={() => updateServiceWorker(true)}
                >
                    Relaunch
                </Button>
                <Button
                    size="small"
                    color="secondary"
                    variant="outlined"
                    onClick={() => close()}
                >
                    Ignore
                </Button>
            </Stack>
        </Alert>
    ) : null;
}

export default NewVersionPrompt;

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(
    period: number,
    swUrl: string,
    r: ServiceWorkerRegistration,
) {
    if (period <= 0) return;

    setInterval(async () => {
        if ("onLine" in navigator && !navigator.onLine) return;

        const resp = await fetch(swUrl, {
            cache: "no-store",
            headers: {
                cache: "no-store",
                "cache-control": "no-cache",
            },
        });

        if (resp?.status === 200) await r.update();
    }, period);
}
