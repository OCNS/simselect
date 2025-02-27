// vim set sw=4:
const REPO_URL = "https://github.com/ocns/simselect";
const GIT_BRANCH = "graph";
const DATA_FOLDER = "simtools";

var SIMULATORS = [];
var TOOL_DESCRIPTIONS = {};
const selected = [];

// If params  are null, show a default message
function showDetails(data, connected) {
    // Show details about the simulator
    const details_top = document.getElementById("details_top");
    const details_bottom = document.getElementById("details_bottom");
    // Basic description
    if (data === null) {
        details_top.innerHTML = "<br />";
        details_top.innerHTML += "<h2>Using this resource</h2>";
        details_top.innerHTML += "<ul>";
        details_top.innerHTML += "<li>Use the 'Toggle Filters' button to activate the simulation engine filter.</li>";
        details_top.innerHTML += "<li>Select what simulation engines you would like to show in the graph.</li>";
        details_top.innerHTML += "<li>Select a node/edge to see its ecosystem in the graph.</li>";
        details_top.innerHTML += "<li>Double click/tap on a node/edge to see details of the tool.</li>";
        details_top.innerHTML += "<li>Click outside to unselect nodes.</li>";
        details_top.innerHTML += "</ul>";
        details_top.innerHTML += "<h3 class='mt-3'>Contributing</h2>";
        details_top.innerHTML += `<p>Contributions are welcome! If you have anything to add or correct in the data,
                              please follow the link at the end of the tool's details view to edit the data on GitHub.
                              You can also open an <a href='${REPO_URL}/issues'>issue on the GitHub repository</a>.</p>`;
        details_bottom.innerHTML = "<div class='d-flex'>";
        details_bottom.innerHTML += "<h3 class='mt-3'>List of simulators</h2>";
        for (const sim of SIMULATORS) {
            const quoted_sim = `[id='${sim}']`;
            details_bottom.innerHTML += `<button class='btn btn-secondary m-1' onclick="cy.nodes('#simulators').unselect(); let node = cy.nodes('${quoted_sim.replace(/'/g, "\\'")}'); node.select(); showNodeDetails(node);">${TOOL_DESCRIPTIONS[sim].short_name}</button>`;
        }
        details_bottom.innerHTML += "</div>";
        window.history.pushState({}, "", window.location.href.split("?")[0]);
        return;
    }
    details_top.innerHTML = "";
    details_bottom.innerHTML = "";
    let description = document.createElement("div");
    if (data["features"].includes("simulator")) {
        const quoted_sim = `[id='${data.id}']`;
        description.innerHTML = `<div class='d-flex justify-content-between align-items-center'>
                            <h2>${data["full_name"]}</h2>
                            <button class='btn btn-outline-primary align-middle' title='Center ${data["short_name"]} in the graph' onclick="highlightNode(cy.nodes('${quoted_sim.replace(/'/g, "\\'")}'));">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bullseye" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M8 13A5 5 0 1 1 8 3a5 5 0 0 1 0 10m0 1A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
                            <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/>
                            <path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                            </svg>
                            </button>
                            </div>`;
    } else {
        description.innerHTML = `<h2>${data["full_name"]}</h2>`;
    }
    description.innerHTML += "<p>" + data["description"] + "</p>";
    // Relations
    if (connected !== null) {
        if (connected.length > 0) {
            description.innerHTML += "<h3>Relations</h3>";
            const list = document.createElement("ul");
            for (let edge of connected) {
                if (edge["source"] === "simulators") {
                    continue;
                }
                const listItem = document.createElement("li");
                const targetLink = document.createElement("a");
                targetLink.href = "#";
                if (edge["type"] === "outgoing") {
                    targetId = edge["target"];
                } else {
                    targetId = edge["source"];
                }
                targetLink.addEventListener("click",function(e) {
                    console.log("Clicked on " + targetLink.innerHTML);
                    cy.nodes("[id='" + data.id + "']").unselect();
                    cy.nodes("[id='" + targetLink.innerHTML + "']").select();
                });
                targetLink.innerHTML = targetId;
                const simName = document.createElement("i");
                simName.innerHTML = data["short_name"];
                const label = document.createElement("span");
                label.innerHTML = " " + edge["label"] + " ";
                if (edge["type"] === "outgoing") {
                    listItem.append(simName);
                    listItem.append(label);
                    listItem.appendChild(targetLink);
                } else {
                    listItem.appendChild(targetLink);
                    listItem.append(label);
                    listItem.append(simName);
                }
                list.appendChild(listItem);
            }
            description.appendChild(list);
        }
        details_top.appendChild(description);
        // URLs
        link_heading = document.createElement("h3");
        link_heading.innerHTML = "Links";
        let tool_links = data["urls"];
        details_bottom.appendChild(link_heading);
        for (let row_idx=0; row_idx < BUTTON_ROWS.length; row_idx++) {
            let row = document.createElement("div");
            row.classList.add("row");
            // Go through elements in BUTTON_ROWS
            for (const button_type of BUTTON_ROWS[row_idx]) {
                let col = document.createElement("div");
                col.classList.add("col-auto");
                let button = urlButton(button_type, tool_links[button_type]);
                col.appendChild(button);
                row.appendChild(col);
            }
            details_bottom.appendChild(row);
        }
    }
    // hide filter pane
    const filterPane = new bootstrap.Offcanvas('#filter_pane');
    // FIXME: not quite sure what is going on here, but sometimes the internal state is incorrect
    if (document.getElementById("filter_pane").classList.contains("show"))
        filterPane._isShown = true;
    filterPane.hide();

    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    if (data === null)
        params.delete('selected');
    else {
        params.set('selected', data["full_name"]);
    }
    url.search = params.toString();
    window.history.pushState({}, "", url);
}

function resetSearch() {
    const search = document.getElementById("simulator_search_input");
    search.value = "";
    const filters = document.getElementById("simulator_filters");
    for (const filter of filters.getElementsByTagName("input")) {
        filter.checked = false;
    }
    criteria.length = 0; // clear the array
    updateHighlights();
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
        description["computing_scale"] = description["processing_support"];
        delete description["processing_support"];
        for (const name of ["biological_level", "computing_scale"]) {
            if (description[name] === undefined)
                description[name] = [];
            else
                description[name] = description[name].split(",").map(x => x.trim());
        }
        description["full_name"] = description["name"];
        description["short_name"] = name;
        description["description"] = description["summary"];
        TOOL_DESCRIPTIONS[name] = description;
    }

    // Select all simulators initially
    for (const simulator of SIMULATORS)
        selected.push(simulator);
    create_cy_elements(data, style);
    create_filters();
    showDetails(null, null);
    }
);
