// This is where the old CRA service worker lived. If it's requested, unregister
// everything, so the Vite one (at sw.js) can take over control.
if ("serviceWorker" in navigator)
    navigator.serviceWorker.getRegistrations()
        .then(rs => rs
            .forEach(r => r.unregister()));
