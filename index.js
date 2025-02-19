// vim set sw=4:
const REPO_URL = "https://github.com/ocns/simselect";
const GIT_BRANCH = "graph";
const DATA_FOLDER = "simtools";

var SIMULATORS = [];
var TOOL_DESCRIPTIONS = {};
const selected = [];

// If params  are null, show a default message
function showDetails(data, outgoers) {
    // Show details about the simulator
    const details = document.getElementById("details");
    // Basic description
    if (data === null) {
        details.innerHTML = "<br />";
        details.innerHTML += "<h2>Using this resource</h2>";
        details.innerHTML += "<ul>";
        details.innerHTML += "<li>Use the 'Toggle Filters' button to activate the simulation engine filter.</li>";
        details.innerHTML += "<li>Select what simulation engines you would like to show in the graph.</li>";
        details.innerHTML += "<li>Select a node/edge to see its ecosystem in the graph.</li>";
        details.innerHTML += "<li>Double click/tap on a node/edge to see details of the tool.</li>";
        details.innerHTML += "<li>Click outside to unselect nodes.</li>";
        details.innerHTML += "</ul>";
        details.innerHTML += "<h3 class='mt-3'>Contributing</h2>";
        details.innerHTML += `<p>Contributions are welcome! If you have anything to add or correct in the data,
                              please follow the link at the end of the tool's details view to edit the data on GitHub.
                              You can also open an <a href='${REPO_URL}/issues'>issue on the GitHub repository</a>.</p>`;
        details.innerHTML += "<h3 class='mt-3'>List of simulators</h2>";
        details.innerHTML += "<div class='d-flex'>";
        for (const sim of SIMULATORS) {
            const quoted_sim = `[id='${sim}']`;
            details.innerHTML += `<button class='btn btn-secondary m-1' onclick="cy.nodes('#simulators').unselect(); let node = cy.nodes('${quoted_sim.replace(/'/g, "\\'")}'); node.select(); showNodeDetails(node);">${TOOL_DESCRIPTIONS[sim].short_name}</button>`;
        }
        details.innerHTML += "</div>";
        window.history.pushState({}, "", window.location.href.split("?")[0]);
        return;
    }
    details.innerHTML = "";
    let flex_container = document.createElement("div");
    flex_container.classList.add("d-flex", "flex-column", "vh-80");
    let top_row = document.createElement("div");
    top_row.classList.add("row");
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
    if (outgoers !== null) {
        if (outgoers.length > 0) {
            description.innerHTML += "<h3>Relations</h3>";
            const list = document.createElement("ul");
            for (let edge of outgoers) {
                const listItem = document.createElement("li");
                const targetLink = document.createElement("a");
                // targetLink.href = "#";
                // targetLink.addEventListener("click",function(e) { node.unselect(); edge.target().select(); });
                targetLink.innerHTML = edge["target"];
                const label = document.createElement("i");
                label.innerHTML = " " + edge["label"] + " ";
                listItem.appendChild(label);
                listItem.appendChild(targetLink);

                list.appendChild(listItem);
            }
            description.appendChild(list);
        }
        top_row.classList.add("flex-grow-1");
        top_row.appendChild(description);
        // URLs
        link_heading = document.createElement("h3");
        link_heading.innerHTML = "Links";
        let tool_links = data["urls"];
        let bottom_row = document.createElement("div");
        bottom_row.append(link_heading);
        bottom_row.classList.add("row");
        for (let row_idx=0; row_idx < BUTTON_ROWS.length; row_idx++) {
            let row = document.createElement("div");
            row.classList.add("row");
            // Go through elements in BUTTON_ROWS
            for (const button_type of BUTTON_ROWS[row_idx]) {
                console.log(button_type, tool_links[button_type]);
                let col = document.createElement("div");
                col.classList.add("col-auto");
                let button = urlButton(button_type, tool_links[button_type]);
                col.appendChild(button);
                row.appendChild(col);
            }
            bottom_row.appendChild(row);
        }
        flex_container.appendChild(top_row);
        flex_container.appendChild(bottom_row);
        details.appendChild(flex_container);
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
