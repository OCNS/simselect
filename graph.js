var elements = [];
var cy;
var cy_layout;
var removed = [];
var meta_node;
var meta_node_edges;

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
        name: "cola",
        animate: "end",
        padding: 50,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
        centerGraph: false,
    });
    cy_layout.run();
}

function urlButton(type, url) {
    const button = document.createElement("button");
    let icon = "";
    switch (type) {
        case "source":
            iconFile = "github.svg";
            break;
        case "documentation":
            iconFile = "book.svg";
            break;
        case "homepage":
            iconFile = "home.svg";
            break;
        case "download":
            iconFile = "download.svg";
            break;
        case "issue tracker":
            iconFile = "check-circle.svg";
            break;
        case "forum":
            iconFile = "users.svg";
            break;
        case "examples":
            iconFile = "code.svg";
            break;
        case "tutorial":
            iconFile = "user.svg";
            break;
        case "installation":
            iconFile = "package.svg";
            break;
        case "email":
            iconFile = "mail.svg";
            break;
        default:
            iconFile = "link.svg";
    }
    button.type = "button"
    button.classList.add('btn', 'btn-info', 'm-1');
    icon = `<img aria-hidden='true' focusable='false' class='icon' src='assets/${iconFile}'></img>`;
    button.innerHTML = icon + " " + type;
    button.onclick = function() {
        window.open(url, "_blank");
    }
    return button;
}

function highlightNode(node) {
    if (node.id() == "simulators") {
        return;
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
            return {target: edge.target().id(), label: edge.data("label"), source: edge.source().id()};
            }));
    }
}

function highlightEdge(edge) {
    const details = document.getElementById("details");
    const headerElement = document.createElement("h2");
    headerElement.innerHTML = edge.id();

    const sourceLink = document.createElement("a");
    sourceLink.href = "#";
    sourceLink.addEventListener("click",function(e) { edge.unselect(); edge.source().select(); });
    sourceLink.innerHTML = edge.source().id();

    const targetLink = document.createElement("a");
    targetLink.href = "#";
    targetLink.addEventListener("click",function(e) { edge.unselect(); edge.target().select(); });
    targetLink.innerHTML = edge.target().id();

    details.innerHTML = "";

    const paragraph = document.createElement("p");
    paragraph.appendChild(sourceLink);
    const label = document.createElement("i");
    label.innerHTML = " " + edge.data("label") + " ";
    paragraph.appendChild(label);
    paragraph.appendChild(targetLink);
    details.appendChild(headerElement);
    details.appendChild(paragraph);
    // Only show the edge and the connected nodes
    cy.elements().forEach(n => n.style("opacity", 0.2));
    edge.style("opacity", 1);
    edge.connectedNodes().forEach(n => n.style("opacity", 1));
    // hide filter pane
    const filterPane = new bootstrap.Offcanvas('#filter_pane');
    // FIXME: not quite sure what is going on here, but sometimes the internal state is incorrect
    if (document.getElementById("filter_pane").classList.contains("show"))
        filterPane._isShown = true;
    filterPane.hide();
}

function highlightElement(event) {
    if (event.target.group() === "nodes") {
        const node = event.target;
        if (event.type === "tap") {
            highlightNode(node);
        }
        else if (event.type === "dbltap") {
            showNodeDetails(node);
        }
    } else if (event.target.group() === "edges") {
        const edge = event.target;
        if (event.type === "tap") {
            // do nothing special
        }
        else if (event.type === "dbltap") {
            highlightEdge(edge);
        }
    } else if (event.target === cy) {
        unhighlightNode();
    }
}

function unhighlightNode(event) {
    // Ignore the meta node
    meta_node.restore();
    meta_node_edges.restore();
    // Re-add the edges
    cy.elements().forEach(n => n.style("opacity", 1));
    showDetails(null, null);
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
            label: relation["description"]
        }
    }
}

function create_cy_elements(data, style) {
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
        style: style
    });
    // store the meta_node, since we need to remove it when highlighting nodes
    meta_node = cy.$("#simulators");
    meta_node_edges = meta_node.connectedEdges();
    cy.on("select tap dbltap", "*", highlightElement);
    cy.on("unselect", "*", unhighlightNode);
    cy.$("#simulators").select();
    selectionChanged();
}
