/* eslint-disable */
(function() {
    const scripts = document.getElementsByTagName("script");
    const parts = scripts[scripts.length - 1].src.split("?");
    let appRoot = parts[0].split("/");
    appRoot.pop();
    appRoot = appRoot.join('/');
    let apiRoot = appRoot.replace(/^https?:\/\/localhost:3001(\/|$)/, "http://localhost:8080$1") + "/api";
    const QS = parts[1].split("&")
        .map(p => p.split("="))
        .reduce((m, a) => ({
            ...m,
            [a.shift()]: a.join("="),
        }), {});
    const authHeaders = {
        "Authorization": `Bearer ${QS.token || "garbage"}`,
    };
    fetch(apiRoot + "/user/me", {
        headers: authHeaders,
    })
        .then(r => {
            if (!r.ok) {
                throw new Error("stale token")
            }
        })
        .catch(() => {
            store.mode = "stale";
            render();
        });
    const sendToFoodinger = () => {
        fetch(apiRoot + "/recipe", {
            method: "POST",
            headers: {
                ...authHeaders,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type: "Recipe",
                name: store.title,
                externalUrl: store.url,
                ingredients: store.ingredients.map(i => ({raw: i})),
                directions: store.directions
                    .map(d => `1.  ${d}`)
                    .join("\n"),
            }),
        })
            .then(r => {
                if (r.status === 401) {
                    store.mode = "stale";
                    render();
                    throw new Error("stale token");
                }
                if (r.status !== 201) {
                    throw new Error(`${r.status} ${r.statusText}`)
                }
                return r.json();
            })
            .then(r => {
                store.mode = "imported";
                store.id = r.id;
                render();
            })
            .catch(e => {
                alert(`Something went wrong: ${e}\n\nTry it again?`)
            })
        store.mode = "importing";
        render();
    };
    const GATEWAY_PROP = "foodinger_import_bookmarklet_gateway_Ch8LF4wGvsRHN3nM0jFv";
    const CONTAINER_ID = "foodinger-import-bookmarklet-container-Ch8LF4wGvsRHN3nM0jFv";
    const store = {
        mode: "form",
        grabTarget: null,
        grabStyle: null,
        title: "",
        url: window.location.toString(),
        ingredients: [],
        directions: [],
        id: null,
    };
    const debounce = (fn, delay = 100) => {
        let timeout = null;
        return (...args) => {
            if (timeout != null) {
                clearTimeout(timeout)
            }
            timeout = setTimeout(() => {
                timeout = null;
                fn(...args)
            }, delay)
        }
    };
    const grabSelectHandler = debounce(() => {
        if (document.getSelection().isCollapsed) return;
        store[store.grabTarget] = (store.grabStyle === "string"
            ? grabString()
            : grabList());
        tearDownGrab();
    }, 250);
    const setUpGrab = (target, style) => {
        store.mode = "grab";
        store.grabTarget = target;
        store.grabStyle = style;
        document.addEventListener('selectionchange', grabSelectHandler);
        render();
    };
    const tearDownGrab = () => {
        store.mode = "form";
        store.grabTarget = null;
        store.grabStyle = null;
        document.removeEventListener('selectionchange', grabSelectHandler);
        render();
    };
    const grabSelectedNode = () => {
        const sel = document.getSelection();
        if (sel.isCollapsed) {
            alert("Select something to grab...");
            return;
        }
        let targetNode = sel.focusNode;
        while (targetNode && !targetNode.contains(sel.anchorNode)) {
            targetNode = targetNode.parentNode;
        }
        if (!targetNode) {
            alert("Something's amiss. Sorry.");
            return;
        }
        return targetNode;
    };
    const collapseWS = n => n == null ? "" : n.textContent
        .replace(/\s+/g, ' ')
        .trim();
    const grabString = () => {
        const node = grabSelectedNode();
        return collapseWS(node);
    };
    const grabList = () => {
        const node = grabSelectedNode();
        if (!node) return [];
        return Array.from(node.childNodes)
            .map(collapseWS)
            .filter(s => s.length > 0);
    };
    const camelToDashed = n =>
        n.replace(/([a-z0-9])([A-Z])/g, (match, a, b) =>
            `${a}-${b.toLowerCase()}`);
    const toStyle = rules =>
        Object.keys(rules)
            .map(n => `${(camelToDashed(n))}:${rules[n]}`)
            .join(";");
    const containerStyle = toStyle({
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 99999,
        backgroundColor: "white",
        border: "1px solid #963",
        width: "50%",
    });
    const headerStyle = toStyle({
        fontSize: "14pt",
        fontWeight: "bold",
        padding: "3px 5px",
        backgroundColor: "#fed",
    });
    const formItemStyle = toStyle({});
    const labelStyle = toStyle({
        display: "inline-block",
        textAlign: "right",
        verticalAlign: "top",
        paddingTop: "0.3em",
        marginRight: "0.5em",
        width: "6em",
        fontSize: "90%",
        fontWeight: "bold",
    });
    const grabBtnStyle = toStyle({
        display: "inline-block",
        verticalAlign: "top",
        cursor: "pointer",
    });
    const importBtnStyle = toStyle({
        display: "inline-block",
        borderRadius: "3px",
        backgroundColor: "#ded",
        border: "1px solid #090",
        fontWeight: "bold",
        padding: "0.2em 1em",
        cursor: "pointer",
    });
    const valueStyle = toStyle({});
    const blockRules = {
        minWidth: "20em",
        minHeight: "12em",
    };
    const ingStyle = toStyle({
        ...blockRules,
        whiteSpace: "nowrap",
    });
    const dirStyle = toStyle({
        ...blockRules,
    });
    const renderForm = $div => {
        $div.innerHTML = `<h1 style="${headerStyle}">Foodinger Import</h1>
        <div style="${formItemStyle}">
            <label style="${labelStyle}">Title:</label>
            <input style="${valueStyle}" name="title" />
            <button style="${grabBtnStyle}" onclick="${GATEWAY_PROP}.grabTitle()">Grab</button>
        </div>
        <div style="${formItemStyle}">
            <label style="${labelStyle}">URL:</label>
            <input style="${valueStyle}" name="url" />
        </div>
        <div style="${formItemStyle}">
            <label style="${labelStyle}">Ingredients:</label>
            <textarea style="${ingStyle}" name="ingredients"></textarea>
            <button style="${grabBtnStyle}" onclick="${GATEWAY_PROP}.grabIngredients()">Grab</button>
        </div>
        <div style="${formItemStyle}">
            <label style="${labelStyle}">Directions:</label>
            <textarea style="${dirStyle}" name="directions"></textarea>
            <button style="${grabBtnStyle}" onclick="${GATEWAY_PROP}.grabDirections()">Grab</button>
        </div>
        <div style="${formItemStyle}">
            <label style="${labelStyle}"></label>
            <button style="${importBtnStyle}" onclick="${GATEWAY_PROP}.doImport()">Import</button>
        </div>
        `;
        $div.querySelector("input[name=title]").setAttribute("value", store.title);
        $div.querySelector("input[name=url]").setAttribute("value", store.url);
        $div.querySelector("textarea[name=ingredients]").innerHTML = store.ingredients.join("\n");
        $div.querySelector("textarea[name=directions]").innerHTML = store.directions
            .map((l, i) => `${i + 1}.  ${l}`)
            .join("\n");
        return {
            grabTitle: () => {
                setUpGrab("title", "string");
            },
            grabIngredients: () => {
                setUpGrab("ingredients", "list");
            },
            grabDirections: () => {
                setUpGrab("directions", "list");
            },
            doImport: () => {
                sendToFoodinger();
            },
        };
    };
    const renderGrab = $div => {
        $div.innerHTML = `<h1 style="${headerStyle}">Grabbing '${store.grabTarget}'</h1>
        Select some of the ${store.grabTarget}. Doesn't have to be perfect.
        <button onclick="${GATEWAY_PROP}.cancel()">Cancel</button>`;
        return {
            cancel: () => {
                tearDownGrab();
            },
        };
    };
    const renderStale = $div => {
        $div.innerHTML = `<h1 style="${headerStyle}">Stale Bookmarklet</h1>
        <p>Your import bookmarklet is stale. Go update it from
        <a href="${appRoot}/profile" target="_blank">your Profile</a>,
        and then return to this page and click it!</p>
        `;
    };
    const renderImporting = $div => {
        $div.innerHTML = `<h1 style="${headerStyle}">Importing...</h1>
        <p>Your recipe is being imported. Hang tight...</p>
        `;
    };
    const renderImported = $div => {
        $div.innerHTML = `<h1 style="${headerStyle}">Success!</h1>
        <p>Your recipe was successfully imported!</p>
        <p>You can <a href="${appRoot}/library/recipe/${store.id}">view it</a>
        or <a href="${appRoot}/library/recipe/${store.id}/edit">edit it</a>, or
        just continue on your merry way.</p>
        `;
    };
    const render = () => {
        console.log("RENDER", store); // todo: remove
        let $div = document.getElementById(CONTAINER_ID);
        if ($div == null) {
            $div = document.createElement('div');
            $div.id = CONTAINER_ID;
            document.body.append($div);
        }
        $div.style = containerStyle;
        window[GATEWAY_PROP] = (
            store.mode === "form" ? renderForm
                : store.mode === "grab" ? renderGrab
                : store.mode === "stale" ? renderStale
                : store.mode === "importing" ? renderImporting
                : store.mode === "imported" ? renderImported
                : () => {throw new Error(`Unrecognized '${store.mode}' mode`)}
        )($div);
    };
    render();
})();