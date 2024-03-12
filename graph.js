var elements = [];
var cy;
var cy_layout;
var removed = [];
const PRESELECTED = ["Arbor", "Brian", "NEST", "Neuron"];
var SIMULATORS = [];

function selectionChanged() {
    const selected = [];
    for (const name of SIMULATORS) {
        const checkbox = document.getElementById(name);
        if (checkbox.checked)
            selected.push(name);
    }
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
    layoutNodes();
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
        alignment: {horizontal: [alignments]}
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
    icon = `<img aria-hidden='true' focusable='false' class='icon' src='assets/${iconFile}'></img>`;
    button.innerHTML = icon + " " + type;
    button.onclick = function() {
        window.open(url, "_blank");
    }
    return button;
}

function highlightNode(node) {
    // change opacity if node or edge is not connected to the clicked node
    const connected_edges = node.connectedEdges()
    const connected_nodes = connected_edges.connectedNodes();
    cy.elements().forEach(n => n.style("opacity", 0.2));
    connected_edges.forEach(n => n.style("opacity", 1));
    connected_nodes.forEach(n => n.style("opacity", 1));

    // Show details about the simulator
    const details = document.getElementById("details");
    // Basic description
    details.innerHTML = "<h2>" + node.data("full_name") + "</h2>";
    details.innerHTML += "<p>" + node.data("description") + "</p>";
    // Relations
    const outgoingEdges = node.outgoers("edge");
    if (outgoingEdges.length > 0) {
        details.innerHTML += "<h3>Relations</h3>";
        const list = document.createElement("ul");
        for (let edge of outgoingEdges) {
            const listItem = document.createElement("li");
            const targetLink = document.createElement("a");
            targetLink.href = "#";
            targetLink.addEventListener("click",function(e) { node.unselect(); edge.target().select(); });
            targetLink.innerHTML = edge.target().id();
            const label = document.createElement("i");
            label.innerHTML = " " + edge.data("label") + " ";
            listItem.appendChild(label);
            listItem.appendChild(targetLink);

            list.appendChild(listItem);
        }
        details.appendChild(list);
    }
    // URLs
    if (node.data("urls") !== undefined) {
        for (let [text, url] of Object.entries(node.data("urls"))) {
            details.appendChild(urlButton(text, url));
        }
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
}

function highlightElement(event) {
    if (event.target.group() === "nodes") {
        const node = event.target;
        highlightNode(node);
    } else if (event.target.group() === "edges") {
        const edge = event.target;
        highlightEdge(edge);
    } else if (event.target === cy) {
        unhighlightNode();
    }
}

function unhighlightNode(event) {
    cy.elements().forEach(n => n.style("opacity", 1));
    document.getElementById("details").innerHTML = "";
}

function create_checkboxes() {
    const checkbox_container = document.getElementById("simulators");
    const fieldset_container = document.createElement("fieldset")
    fieldset_container.className = "simulatorfields"
    checkbox_container.appendChild(fieldset_container)

    for (const name of SIMULATORS) {
        const checkbox_div = document.createElement("div");
        checkbox_div.className = "item"
        fieldset_container.appendChild(checkbox_div);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = name;
        checkbox.name = name;
        checkbox.value = name;
        checkbox.checked = false;
        checkbox.onchange = selectionChanged;
        checkbox_div.appendChild(checkbox)

        const label = document.createElement("label");
        label.htmlFor = name;
        label.appendChild(document.createTextNode(name));
        checkbox_div.appendChild(label);
    }
}

function newNode(name, description) {
    const features = description["features"].split(",").map(x => x.trim());
    let position = undefined;
    return {
        group: 'nodes',
        data: {
            id: name,
            full_name: description["name"],
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

// Load style and data from JSON files
Promise.all([
    fetch('assets/cy-style.json')
      .then(function(res) {
        return res.json();
      }),
    fetch('simtools/simtools.json')
      .then(function(res) {
        return res.json();
      })
  ])
  .then(function(dataArray) {
    const style = dataArray[0];
    const data = dataArray[1];
    // Fill the list of simulators with all items that have "simulator" in their features
    for (const [name, description] of Object.entries(data)) {
        if (description["features"].includes("simulator")) {
            SIMULATORS.push(name);
        }
    }
    create_checkboxes(SIMULATORS);
    for (const name of PRESELECTED) {
        const checkbox = document.getElementById(name);
        checkbox.checked = true;
    }
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
    layoutNodes();
    cy.on("select", "*", highlightElement);
    cy.on("unselect", "*", unhighlightNode);
    // cy.on("dragfree", "*", function(event) {
    //     cy_layout.stop();
    //     event.target.lock();
    //     cy_layout.run();
    //     event.target.unlock();
    // });
    }
);
