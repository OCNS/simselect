var SIMULATORS = [];
var TOOL_DESCRIPTIONS = {};
const selected = [];

function showDetails(data, outgoers) {
    // Show details about the simulator
    const details = document.getElementById("details");
    // Basic description
    details.innerHTML = "<h2>" + data["full_name"] + "</h2>";
    details.innerHTML += "<p>" + data["description"] + "</p>";
    // Relations
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
        description["description"] = description["summary"];
        TOOL_DESCRIPTIONS[name] = description;
    }

    // Select all simulators initially
    for (const simulator of SIMULATORS)
        selected.push(simulator);
    create_cy_elements(data, style);
    create_filters();
    update_table();
    }
);
