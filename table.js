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
    update_table();
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

function update_table() {
    const table_div = document.getElementById("simulators");
    if (criteria.length == 0) {
        table_div.innerHTML = "";
        for (const simulator of SIMULATORS) {
            const div_wrapper = document.createElement("div");
            div_wrapper.classList.add("form-check");
            const input = document.createElement("input");
            input.classList.add("form-check-input");
            if (! selected.includes(simulator))
                selected.push(simulator);
            input.checked = true;
            input.type = "checkbox";
            input.id = "sim_" + simulator;
            input.onchange = toggle_selection;
            const label = document.createElement("label");
            label.classList.add("form-check-label");
            label.textContent = TOOL_DESCRIPTIONS[simulator]["full_name"];
            label.htmlFor = "sim_" + simulator;
            div_wrapper.appendChild(input);
            div_wrapper.appendChild(label);
            table_div.appendChild(div_wrapper);
        }

    } else {
        let good = [];
        let medium = [];
        let bad = [];
        for (const simulator of SIMULATORS) {
            const sim_description = TOOL_DESCRIPTIONS[simulator];
            let matches = 0;
            bio_levels.forEach(bio_level => {
                const cell_class = get_cell_class(criteria, bio_level, sim_description["biological_level"]);
                if (cell_class == "match")
                    matches++;

            })
            comp_levels.forEach(comp_level => {
                const cell_class = get_cell_class(criteria, comp_level, sim_description["computing_scale"]);
                if (cell_class == "match")
                    matches++;
            })
            if (criteria.length == matches)
                good.push({simulator: simulator, matches: matches});
            else if (matches > 0)
                medium.push({simulator: simulator, matches: matches});
            else
                bad.push({simulator: simulator, matches: matches});
        }
        good.sort((a, b) => b['matches']-a['matches']);
        medium.sort((a, b) => b['matches']-a['matches']);
        table_div.innerHTML = "";
        const good_header = document.createElement("h5");
        good_header.textContent = "Full matches";
        table_div.appendChild(good_header);
        for (sim_matches of good) {
            simulator = sim_matches["simulator"];
            const div_wrapper = document.createElement("div");
            div_wrapper.classList.add("form-check");
            const input = document.createElement("input");
            input.classList.add("form-check-input");
            input.id = "sim_" + simulator;
            if (! selected.includes(simulator)) {
                selected.push(simulator);
            }
            input.checked = true;
            input.type = "checkbox";

            input.onchange = toggle_selection;
            const label = document.createElement("label");
            label.classList.add("form-check-label", "fw-bold");
            label.textContent = TOOL_DESCRIPTIONS[simulator]["full_name"];
            label.htmlFor = "sim_" + simulator;
            div_wrapper.appendChild(input);
            div_wrapper.appendChild(label);
            table_div.appendChild(div_wrapper);
        }
        const medium_header = document.createElement("h5");
        medium_header.textContent = "Partial matches";
        table_div.appendChild(medium_header);
        for (sim_matches of medium) {
            simulator = sim_matches["simulator"];
            const div_wrapper = document.createElement("div");
            div_wrapper.classList.add("form-check");
            const input = document.createElement("input");
            input.classList.add("form-check-input");
            input.id = "sim_" + simulator;
            if (selected.includes(simulator)) {
                selected.splice(selected.indexOf(simulator), 1);
            }
            input.checked = false;
            input.type = "checkbox";

            input.onchange = toggle_selection;
            const label = document.createElement("label");
            label.classList.add("form-check-label");
            label.textContent = TOOL_DESCRIPTIONS[simulator]["full_name"];
            label.htmlFor = "sim_" + simulator;
            div_wrapper.appendChild(input);
            div_wrapper.appendChild(label);
            table_div.appendChild(div_wrapper);
        }
        if (medium.length == 0) {
            const no_matches = document.createElement("p");
            no_matches.textContent = "No partial matches";
            table_div.appendChild(no_matches);
        }
        for (const sim_matches of bad) {
            const simulator = sim_matches["simulator"];
            if (selected.includes(simulator))
                selected.splice(selected.indexOf(simulator), 1);
        }
    }
    selectionChanged();
}

function toggle_selection() {
    const simulator = this.id.split("_")[1];
    console.log("toggle selection", simulator);
    const checkbox = document.getElementById("sim_" + simulator);
    if (checkbox.checked) {
        selected.push(simulator);
    } else {
        const index = selected.indexOf(simulator);
        if (index > -1) { // only splice array when item is found
            selected.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
    selectionChanged();
}

function get_cell_class(criteria, feature, category_description) {
    if (criteria.indexOf(feature) >= 0) {
        if (category_description.indexOf(feature) >= 0)
            cell_class = "match";

        else
            cell_class = "mismatch";
    } else {
        if (category_description.indexOf(feature) >= 0)
            cell_class = "has_feature";

        else
            cell_class = "no_feature";
    }
    return cell_class;
}
