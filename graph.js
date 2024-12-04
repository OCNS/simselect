var elements = [];
var cy;
var cy_layout;
var removed = [];

function selectionChanged() {
    removed.toReversed().forEach(eles => eles.restore());
    removed = [];
    removed.push(cy.filter(function(element, i){
        return element.isNode() && element.data("features").includes("simulator") && !selected.includes(element.data("id"));
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
        console.log(selected);
        layoutNodes();
    }
}

function layoutNodes() {
    const simulator_nodes = cy.filter(function(element, i){
        return element.isNode() && element.data("features").includes("simulator");
    });
    let counter = 0;
    alignments = [];
    for (let node of simulator_nodes) {
        if (removed.indexOf(node) === -1) {
            alignments.push({node: node, offset: 0});
            counter++;
        }
    }
    cy_layout = cy.layout({
        name: "cola",
        animate: "end",
        padding: 50,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
        centerGraph: false,
        // alignment: {horizontal: [alignments]}
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
    // change opacity if node or edge is not connected to the clicked node
    const nhood = node.closedNeighbourhood();
    const connectedEdges = node.connectedEdges();

    cy.elements().forEach(n => {n.style("opacity", 0.1); n.style("z-index", 0); n.style("z-index-compare", "manual");});
    cy.edges().forEach(n => {n.style("opacity", 0.1); n.style("z-index", 0); n.style("z-index-compare", "manual");});
    nhood.forEach(n => {n.style("opacity", 1); n.style("z-index", 100); n.style("z-index-compare", "manual");});
    connectedEdges.forEach(n => {n.style("curve-style", "bezier"); n.style("min-zoomed-font-size", 12); n.style("z-index", 50); n.style("z-index-compare", "manual");});

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
    showDetails(node.data(), node.outgoers("edge").map((edge) => {
        return {target: edge.target().id(), label: edge.data("label"), source: edge.source().id()};
        }));
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
    cy.elements().forEach(n => n.style("opacity", 1));
    showDetails(null, null);
}

function newNode(name, description) {
    const features = description["features"].split(",").map(x => x.trim());
    let position = undefined;
    return {
        group: 'nodes',
        data: {
            id: name,
            full_name: description["full_name"],
            description: description["summary"],
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
    for (const [name, description] of Object.entries(data)) {
        elements.push(newNode(name, description));
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
    selectionChanged();
    cy.on("select tap dbltap", "*", highlightElement);
    cy.on("unselect", "*", unhighlightNode);
}
