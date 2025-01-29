// vim set sw=4:
var criteria = [];  // selected criteria

const bio_levels = ["Population Model", "Single-Compartment (Simple) Model",
                    "Single-Compartment (Complex) Model", "Multi-Compartment Model"]
const comp_levels = ["GPU", "Single Machine", "Cluster", "Supercomputer"];
const colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00'];

const width = 1200;
const colsize = (width - 150) / (bio_levels.length + 1);
const height = 600;
const rowsize = (height - bio_levels.length*20) / (comp_levels.length + 1);

function toggle(feature) {
    const checkbox = document.getElementById("select_" + feature);
    if (checkbox.checked) {
        criteria.push(feature);
    } else {
        const index = criteria.indexOf(feature);
        if (index > -1) { // only splice array when item is found
            criteria.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
    updateHighlights();
}

function create_filters() {
    const filters = document.getElementById("simulator_filters");
    const bio_heading = document.createElement("h5");
    bio_heading.textContent = "Level of biological detail";
    filters.appendChild(bio_heading);
    for (const bio_level of bio_levels) {
        const formCheck = document.createElement("div");
        formCheck.classList.add("form-check");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "select_" + bio_level;
        checkbox.classList.add("form-check-input");
        checkbox.onchange = () => toggle(bio_level);
        const label = document.createElement("label");
        label.htmlFor = "select_" + bio_level;
        label.classList.add("form-check-label");
        label.textContent = bio_level;
        formCheck.appendChild(checkbox);
        formCheck.appendChild(label);
        filters.appendChild(formCheck);
    }
    const comp_heading = document.createElement("h5");
    comp_heading.textContent = "Computational resources";
    comp_heading.classList.add("mt-3");
    filters.appendChild(comp_heading);
    for (const comp_level of comp_levels) {
        const formCheck = document.createElement("div");
        formCheck.classList.add("form-check");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "select_" + comp_level;
        checkbox.classList.add("form-check-input");
        checkbox.onchange = () => toggle(comp_level);
        const label = document.createElement("label");
        label.htmlFor = "select_" + comp_level;
        label.classList.add("form-check-label");
        label.textContent = comp_level;
        formCheck.appendChild(checkbox);
        formCheck.appendChild(label);
        filters.appendChild(formCheck);
    }
}
