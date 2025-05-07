// vim set sw=4:
var elements = [];
var cy;
var cy_layout;
var removed = [];
var meta_node;
var meta_node_edges;
const cy_pan = {};
const cy_zoom = {
    value: 0,
};
var highlighted_node;

function selectionChanged() {
    removed.toReversed().forEach(eles => eles.restore());
    removed = [];
    removed.push(cy.filter(function(element, i){
        return element.isNode() && element.data("features").includes("simulator") && !selected.includes(element.data("id"));
    }).remove());
    // Hide all nodes that do not have any (even indirect) connection to a visible simulator node
    removed.push(cy.filter(function(element, i){
        return element.isNode() && !element.data("features").includes("simulator") && !element.connectedEdges().some(edge => edge.source().data("features").includes("simulator") || edge.target().data("features").includes("simulator"));
    }).remove());
    // Hide all edges that are not connected to a visible node
    removed.push(cy.filter(function(element, i){
        return element.isEdge() && !(element.source().visible() && element.target().visible);
    }).remove());
    // Hide all nodes that are not connected to a visible edge, except for simulators
    removed.push(cy.filter(function(element, i){
        return element.isNode() && !element.data("features").includes("simulator") && !element.connectedEdges().some(edge => edge.visible());
    }).remove());

    if (selected.length > 0) {
        layoutNodes();
    }
}

function layoutNodes() {
    cy_layout = cy.layout({
        name: "fcose",
        animate: "end",
        padding: 50,
        nodeDimensionsIncludeLabels: true,
        centerGraph: false,
        numIter: 10000,
        fit: true,
        stop: store_positions,
        nodeRepulsion: node => 15000,
        quality: "proof",
    });
    cy_layout.run();
}

const BUTTON_ICON_FNAMES = {
    "source": "github.svg",
    "documentation": "book.svg",
    "homepage": "home.svg",
    "download": "download.svg",
    "chat": "messages.svg",
    "issue tracker": "check-circle.svg",
    "forum": "users.svg",
    "examples": "code.svg",
    "tutorial": "user.svg",
    "installation": "package.svg",
    "email": "mail.svg"
}
var BUTTON_ICONS = {};

const BUTTON_ROWS = [
    ["homepage", "download", "source"],
    ["documentation", "installation", "tutorial", "examples"],
    ["forum", "issue tracker", "chat", "email"]
];

function urlButton(type, url, btnClass) {
    const button = document.createElement("button");
    button.type = "button"
    button.classList.add('btn', 'm-1');
    let icon = BUTTON_ICONS[type];
    button.innerHTML = icon + " " + type;
    if (url !== undefined)  {
        button.classList.add(btnClass);
        button.onclick = function() {
            window.open(url, "_blank");
        }
    } else {
        button.classList.add('btn-outline-secondary');
        button.disabled = true;
    }
    return button;
}

function highlightNode(node) {
    if (node.id() == "simulators") {
        return;
    }
    // track highlighted node
    highlighted_node = node;

    // Swap out center/uncenter buttons
    const centerButton = document.getElementById("center_button");
    const uncenterButton = document.getElementById("uncenter_button");
    if (centerButton) {
        centerButton.classList.add("d-none");
        uncenterButton.classList.remove("d-none");
    }

    // Ignore the meta node
    meta_node.deselect();
    meta_node.remove();
    // change opacity if node or edge is not connected to the clicked node
    const nhood = node.closedNeighbourhood();
    const connectedEdges = node.connectedEdges();

    cy.elements().forEach(n => n.style("opacity", 0.1));
    nhood.forEach(n => n.style("opacity", 1));
    connectedEdges.forEach(n => {n.style("curve-style", "bezier"); n.style("min-zoomed-font-size", 12)});

    const layout = nhood.layout({
        name: 'concentric',
        fit: true,
        concentric: function(ele) {
            if (ele.same(node)) {
                return 2;

            } else {
                return 1;
            }
        },
        minNodeSpacing: 75,
        avoidOverlap: true,
        levelWidth: () => {return 1; },
        animate: true,
        //animationDuration: 50,
        animationEasing: 'ease',
    });

    layout.run();

}

function showNodeDetails(node) {
    if (node.id() == "simulators") {
        showDetails(null, null);
    } else {
        showDetails(node.data(), node.outgoers("edge").map((edge) => {
            return { type: "outgoing", target: edge.target().id(), label: edge.data("label"), source: edge.source().id() };
        }).concat(
            node.incomers("edge").map((edge) => {
                return { type: "incoming", target: edge.target().id(), label: edge.data("label"), source: edge.source().id() }
            })
        )
        );
    }
}

function highlightEdge(edge) {
    console.log("Edge double tapped: no op");
}

function highlightElement(event) {
    if (event.target === cy) {
        // Only unhilight node if double tapped on background
        // Single tap is too error prone
        if (event.type === "dbltap") {
            unhighlightNode(null, true);
            cy.nodes().selectify();
            cy.nodes().filter(":selected").unselect();
            cy.nodes().unselectify();
        }
        else {
            console.log("No-op: single tap on background");
        }
    }
    else {
        if (event.target.group() === "nodes") {
            const node = event.target;
            if (event.type === "dbltap") {
                highlightNode(node);
            }
            else if (event.type === "tap") {
                showNodeDetails(node);
            }
            cy.nodes().selectify();
            cy.nodes().filter(":selected").unselect();
            node.select();
            cy.nodes().unselectify();
        }
    }
}

function unhighlightNode(event, unselect) {
    if (! highlighted_node)
        return;
    // Swap out center/uncenter buttons
    const centerButton = document.getElementById("center_button");
    const uncenterButton = document.getElementById("uncenter_button");
    if (centerButton) {
        centerButton.classList.remove("d-none");
        uncenterButton.classList.add("d-none");
    }

    // Ignore the meta node
    meta_node.restore();
    meta_node_edges.restore();
    // Re-add the edges
    cy.elements().forEach(n => n.style("opacity", 1));

    // return graph to initial state
    const return_graph_to_init = () => {

        // reset edges
        var moved_edges = highlighted_node.closedNeighbourhood((el) => {return el.isEdge()});
        moved_edges.forEach(n => {n.style("curve-style", "unbundled-bezier"); n.style("min-zoomed-font-size", 36)});

        // reset moved nodes
        var moved_nodes = highlighted_node.closedNeighbourhood((el) => {return el.isNode()});
        const node_animations = moved_nodes.map(n => n.animation({
                position: n.initial_position,
                duration: 1500,
                easing: 'ease',
                queue: false,
                fit: {
                    eles: cy.nodes(),
                    padding: 50,
                },
            })
        );

        const viewport_animation = cy.animation(
                {
                    pan: cy_pan,
                    duration: 1500,
                    easing: 'ease',
                    queue: false,
                    zoom: {
                        level: cy_zoom.value,
                    },
                    fit: {
                        eles: cy.nodes(),
                        padding: 50,
                    },
                    complete: () => {
                        console.log("New pan: " + JSON.stringify(cy.pan()) + ", zoom: " + cy.zoom());
                    }
                }
            );

        const node_promises = node_animations.map(an => an.play().promise());
        Promise.all([...node_promises, viewport_animation.play().promise]).then(() => {
            console.log("Apparently " + moved_nodes.length + " nodes and viewport animations all have completed");
        });
    };

    return_graph_to_init();
    if (unselect) {
        showDetails(null, null);
    }
}

function updateHighlights() {
    const search = document.getElementById("simulator_search_input");
    const searchValue = search.value.toLowerCase();
    for (node of cy.nodes()) {
        node.style("opacity", 1);
    }
    if (search) {
        for (node of cy.nodes()) {
            const full_name = node.data("full_name");
            const description = node.data("description");
            if (full_name && !(full_name.toLowerCase().includes(searchValue) || description && description.toLowerCase().includes(searchValue))) {
                node.style("opacity", 0.2);
            }
        }
    }
    if (criteria.length > 0) {
        for (node of cy.nodes()) {
            let levels = node.data("levels");
            if (levels && criteria.every(c => levels.includes(c))) {
                // do nothing
            } else if (levels && criteria.some(c => levels.includes(c))) {
                if (node.style("opacity") > 0.6) {
                    node.style("opacity", 0.6);
                }
            } else {
                node.style("opacity", 0.2);
            }
        }
    }
}

function newNode(name, description) {
    const features = description["features"].split(",").map(x => x.trim());
    let bio_levels = description["biological_level"];
    if (bio_levels === undefined) {
        bio_levels = [];
    }
    let comp_levels = description["computing_scale"];
    if (comp_levels === undefined) {
        comp_levels = [];
    }
    let position = undefined;
    return {
        group: 'nodes',
        data: {
            id: name,
            full_name: description["full_name"],
            short_name: description["short_name"],
            description: description["summary"],
            levels: bio_levels.concat(comp_levels),
            features: description["features"],
            urls: description["urls"]
        },
        position: position,
        initial_position: position,
        classes: features.join(" ")
    }
}

function newEdge(name, relation) {
    return {
        group: 'edges',
        data: {
            id: name + " → " + relation["name"],
            source: name,
            target: relation["name"],
            label: relation["description"],
            style: {
                "event": "no",
                "selectable": false,
                "grabbable": false
            },
        }
    }
}

function load_button_icons() {
    // Load SVG content for inline inclusion
    for (const [type, fname] of Object.entries(BUTTON_ICON_FNAMES)) {
        fetch(`assets/${fname}`)
            .then(response => response.text())
            .then(svg => {
                BUTTON_ICONS[type] = svg;
            })
            .catch(err => {
                console.error(`Failed to load icon for ${type} (${fname}):`, err);
                BUTTON_ICONS[type] = "";
            });
    }
}

function create_cy_elements(data, style) {
    // Not quite the right place, but convenient to do htis here
    load_button_icons();
    // Create a "meta-node" for all simulators
    elements.push(newNode("simulators", {full_name: "Simulators", features: "meta"}));
    for (const [name, description] of Object.entries(data)) {
        elements.push(newNode(name, description));
        // Connect all simulators to the meta node
        if (description["features"].includes("simulator")) {
            elements.push(newEdge("simulators", {name: name, description: "simulator"}));
        }
        if (description["relations"] !== undefined) {
            for (let relation of description["relations"]){
                if (relation["description"] === undefined)
                    continue;
                elements.push(newEdge(name, relation));
            }
        }
    }
    cy = window.cy = cytoscape({
        container: document.getElementById('cy'),
        elements: elements,
        layout: { name: 'random' },
        style: style,
        minZoom: 0.75,
        maxZoom: 4,
        wheelSensitivity: 0.2,
    });
    // store the meta_node, since we need to remove it when highlighting nodes
    meta_node = cy.$("#simulators");
    meta_node_edges = meta_node.connectedEdges();
    cy.on("tap dbltap", highlightElement);
    //
    // if a user drags a node, we want to remember this
    cy.on("drag", "node", store_positions);
    cy.$("#simulators").select();
    cy.nodes().unselectify();  // We handle selection manually in highlightNode
    selectionChanged();
}

function store_positions(event) {
    event_target = event.target;

    // must be a dragged node
    if (event.type === "drag")
    {
        n = event_target;
        const new_pos = {x: n.position().x, y: n.position().y};
        n.initial_position = new_pos;

        console.log("Node was dragged");
        console.log("New pos: " + n.id() + ": " + n.initial_position.x + ", " + n.initial_position.y);
    }
    else {
        cy.nodes().forEach(n => {const init_pos = {x: n.position().x, y: n.position().y}; n.initial_position = init_pos;});
        cy.nodes().forEach(n => {console.log("Init pos: " + n.id() + ": " + n.initial_position.x + ", " + n.initial_position.y);});

        Object.assign(cy_pan, cy.pan());
        // cy.zoom does not return an object
        cy_zoom.value = cy.zoom();

        console.log("Initial pan: " + JSON.stringify(cy_pan) + ", zoom: " + JSON.stringify(cy_zoom));
    }
}
