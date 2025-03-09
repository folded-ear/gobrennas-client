import { COOKIE_DEVICE_KEY } from "@/constants";
import { getCookie, setCookie } from "@/util/cookies";
import { rand_chars } from "@/util/entropy";

// Ensure the device has a key stored in a cookie, and re-set it to the same
// value on every app load. This is a "forever" cookie, even though UAs may
// choose to expire it earlier than the requested 10 years.
const deviceKey: string = (() => {
    let deviceKey = getCookie(COOKIE_DEVICE_KEY);
    if (!deviceKey) {
        deviceKey = Date.now().toString(36) + "_" + rand_chars(60);
    }
    const d = new Date();
    d.setFullYear(d.getFullYear() + 10);
    setCookie(COOKIE_DEVICE_KEY, encodeURIComponent(deviceKey), {
        expires: d.toUTCString(),
        domain: location.hostname.split(".").slice(-2).join("."),
        path: "/",
    });
    return deviceKey;
})();

export default deviceKey;
