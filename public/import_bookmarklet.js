(function() {
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
    const renderForm = ($div) => {
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
        </div>`;
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
        };
    };
    const renderGrab = ($div) => {
        $div.innerHTML = `<h1 style="${headerStyle}">Grabbing '${store.grabTarget}'</h1>
        Select some of the ${store.grabTarget}. Doesn't have to be perfect.
        <button onclick="${GATEWAY_PROP}.cancel()">Cancel</button>`;
        return {
            cancel: () => {
                tearDownGrab();
            },
        };
    };
    const render = () => {
        console.log("RENDER", store);
        let $div = document.getElementById(CONTAINER_ID);
        if ($div == null) {
            $div = document.createElement('div');
            $div.id = CONTAINER_ID;
            document.body.append($div);
        }
        $div.style = containerStyle;
        const rfn = store.mode === "form"
            ? renderForm
            : store.mode === "grab"
            ? renderGrab
            : () => {throw new Error(`Unrecognized '${store.mode}' mode`)};
        window[GATEWAY_PROP] = rfn($div);
    };
    render();
})();