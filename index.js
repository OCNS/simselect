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
        details_top.innerHTML += "<li>Single click/tap a node to see details of the tool.</li>";
        details_top.innerHTML += "<li>Double click/tap a node to see its ecosystem in the graph.</li>";
        details_top.innerHTML += "<li>Double click outside to unselect nodes and return to the overview.</li>";
        details_top.innerHTML += "</ul>";
        details_top.innerHTML += "<h3 class='mt-3'>Contributing</h2>";
        details_top.innerHTML += `<p>Contributions are welcome! If you have anything to add or correct in the data,
                              please follow the link at the end of the tool's details view to edit the data on GitHub.
                              You can also view the <a href='${REPO_URL}'>sources</a> or open an <a href='${REPO_URL}/issues'>issue on the GitHub repository</a>.</p>`;
        details_top.innerHTML += "<p>&copy; 2024 Simselect contributors. Built with <a href='https://js.cytoscape.org'>cytoscape</a>.</p>"
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
        description.innerHTML = `<div class='d-flex justify-content-between align-items-center sticky-top border-bottom border-2' style='background-color: white;'>
                            <h2>${data["full_name"]}</h2>
                            <div id='center_button'>
                            <button class='btn btn-outline-primary align-middle m-1 me-2' title='Center ${data["short_name"]} in the graph' onclick="highlightNode(cy.nodes('${quoted_sim.replace(/'/g, "\\'")}'));">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-zoom-in" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0"/>
                            <path d="M10.344 11.742q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1 6.5 6.5 0 0 1-1.398 1.4z"/>
                            <path fill-rule="evenodd" d="M6.5 3a.5.5 0 0 1 .5.5V6h2.5a.5.5 0 0 1 0 1H7v2.5a.5.5 0 0 1-1 0V7H3.5a.5.5 0 0 1 0-1H6V3.5a.5.5 0 0 1 .5-.5"/>
                            </svg>
                            </div>
                            <div class="d-none" id='uncenter_button'>
                            <button class='btn btn-outline-primary align-middle m-1 me-2' title='Go back to default view' onclick="unhighlightNode(null);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-zoom-out" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11M13 6.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0"/>
                            <path d="M10.344 11.742q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1 6.5 6.5 0 0 1-1.398 1.4z"/>
                            <path fill-rule="evenodd" d="M3 6.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5"/>
                            </svg>
                            </div>`;
    } else {
        description.innerHTML = `<h2 class="sticky-top border-bottom border-2" style='background-color: white;'>${data["full_name"]}</h2>`;
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
        const flex_div = document.createElement("div");
        flex_div.classList.add("d-flex", "flex-wrap");
        const btnClasses = ["btn-primary", "btn-success", "btn-warning"];
        for (let row_idx=0; row_idx < BUTTON_ROWS.length; row_idx++) {
            // Go through elements in BUTTON_ROWS
            for (const button_type of BUTTON_ROWS[row_idx]) {
                let button = urlButton(button_type, tool_links[button_type], btnClasses[row_idx]);
                flex_div.appendChild(button);
            }
        }
        details_bottom.appendChild(flex_div);

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
        details_bottom.appendChild(back_p);
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
        details_bottom.appendChild(edit_p);
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
