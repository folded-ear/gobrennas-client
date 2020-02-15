(function() {
    const GATEWAY_PROP = "foodinger_import_bookmarklet_gateway_Ch8LF4wGvsRHN3nM0jFv";
    const CONTAINER_ID = "foodinger-import-bookmarklet-container-Ch8LF4wGvsRHN3nM0jFv";
    const store = {
        title: "",
        url: window.location.toString(),
        ingredients: [],
        directions: [],
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
        border: "1px solid #963"
    });
    const headerStyle = toStyle({
        fontSize: "14pt",
        fontWeight: "bold",
        padding: "3px 5px",
        backgroundColor: "#fed",
    });
    const formItemStyle = toStyle({});
    const labelStyle = toStyle({});
    const valueStyle = toStyle({});
    let listRules = {
        listStylePosition: "inside",
        paddingLeft: "0.5em",
        marginLeft: "0.5em",
    };
    const ingStyle = toStyle({
        ...listRules,
        listStyleType: "circle",
    });
    const dirStyle = toStyle({
        ...listRules,
        listStyleType: "decimal",
    });
    const itemStyle = toStyle({});
    const render = () => {
        console.log("RENDER", store);
        window[GATEWAY_PROP] = {
            grabTitle: () => {
                store.title = grabString();
                render();
            },
            grabIngredients: () => {
                store.ingredients = grabList();
                render();
            },
            grabDirections: () => {
                store.directions = grabList();
                render();
            },
        };
        let $div = document.getElementById(CONTAINER_ID);
        if ($div == null) {
            $div = document.createElement('div');
            $div.id = CONTAINER_ID;
            document.body.append($div);
        }
        $div.style = containerStyle;
        $div.innerHTML = `<h1 style="${headerStyle}">Foodinger Import</h1>
        <div style="${formItemStyle}">
            <label style="${labelStyle}">Title:</label>
            <span style="${valueStyle}" name="title"></span>
            <button onclick="${GATEWAY_PROP}.grabTitle()">Grab</button>
        </div>
        <div style="${formItemStyle}">
            <label style="${labelStyle}">URL:</label>
            <span style="${valueStyle}" name="url"></span>
        </div>
        <div style="${formItemStyle}">
            <label style="${labelStyle}">Ingredients:</label>
            <ul style="${ingStyle}" name="ingredients"></ul>
            <button onclick="${GATEWAY_PROP}.grabIngredients()">Grab</button>
        </div>
        <div style="${formItemStyle}">
            <label style="${labelStyle}">Directions:</label>
            <ol style="${dirStyle}" name="directions"></ol>
            <button onclick="${GATEWAY_PROP}.grabDirections()">Grab</button>
        </div>`;
        $div.querySelector("span[name=title]").innerHTML = store.title;
        $div.querySelector("span[name=url]").innerHTML = store.url;
        $div.querySelector("ul[name=ingredients]").innerHTML = store.ingredients
            .map(i => `<li style="${itemStyle}">${i}</li>`)
            .join("\n");
        $div.querySelector("ol[name=directions]").innerHTML = store.directions
            .map(i => `<li style="${itemStyle}">${i}</li>`)
            .join("\n");
    };
    render();
})();