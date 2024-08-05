import { useRegisterSW } from "virtual:pwa-register/react";
import Banner from "@/views/common/Banner";
import Button from "@mui/material/Button";
import React from "react";

function NewVersionPrompt() {
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

    return needRefresh ? (
        <Banner severity="info">
            Brenna&apos;s Food Software has updated!{" "}
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
        </Banner>
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
