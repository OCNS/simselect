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

    }
    else {
        if (data["features"].includes("simulator")) {
            const quoted_sim = `[id='${data.id}']`;
            details.innerHTML = `<div class='d-flex justify-content-between align-items-center'>
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
            details.innerHTML = `<h2>${data["full_name"]}</h2>`;
        }
        details.innerHTML += "<p>" + data["description"] + "</p>";
    }
    // Relations
    if (outgoers !== null) {
        if (outgoers.length > 0) {
            details.innerHTML += "<h3>Relations</h3>";
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
            details.appendChild(list);
        }
        // URLs
        link_heading = document.createElement("h3");
        link_heading.innerHTML = "Links";
        details.append(link_heading);
        if (data["urls"] !== undefined) {
            for (let [text, url] of Object.entries(data["urls"])) {
                details.appendChild(urlButton(text, url));
            }
        }
        // Back to simulators
        back_p = document.createElement("p");
        back_p.classList.add("mt-3");
        back_button = document.createElement("a");
        back_button.href = "#";
        back_button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/>
                                    <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/>
                                 </svg>&nbsp;Back to simulators`;
        back_button.classList.add("btn", "btn-secondary");
        back_button.onclick = function() { cy.nodes(`[id = '${data.id}']`).unselect(); cy.nodes("#simulators").select(); unhighlightNode(); };
        back_p.appendChild(back_button);
        details.appendChild(back_p);
        // Edit footer
        edit_p = document.createElement("p");
        edit_p.classList.add("mt-3", "text-end");
        edit_link = document.createElement("a");
        edit_link.classList.add("link-secondary");
        edit_link.href = `${REPO_URL}/edit/${GIT_BRANCH}/${DATA_FOLDER}/${data["short_name"].replaceAll(" ", "-")}.yaml`;
        edit_link.innerHTML = "Edit this description on GitHub&nbsp;";
        edit_link.innerHTML += `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
                                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"/>
                                </svg>`;
        edit_link.target = "_blank";
        edit_p.appendChild(edit_link);
        details.appendChild(edit_p);

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
