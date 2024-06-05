var criteria = [];  // selected criteria

const bio_levels = ["Population Model", "Single-Compartment (Simple) Model",
                    "Single-Compartment (Complex) Model", "Multi-Compartment Model"]
const comp_levels = ["GPU", "Single Machine", "Cluster", "Supercomputer"];
const colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00'];
const selected = [];

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

function update_table() {
    let header = "<thead class='simulator_table'>\n<th></th><th></th>"
    bio_levels.forEach(bio_level => {
        const is_selected = criteria.indexOf(bio_level) >= 0 ? "checked" : "";
        header += `<th><div class="header_space"><div class="header"><input type="checkbox" id="select_${bio_level}" name="select_${bio_level}" onclick="toggle('${bio_level}');"/ ${is_selected}><label for="select_${bio_level}">${bio_level}</label></div></div></th>`;
    });

    // Add a separator line
    header += `<th><div class="header_space"><div class="header"><div class="separator"></div></div></div></th>`;

    comp_levels.forEach(comp_level => {
        const is_selected = criteria.indexOf(comp_level) >= 0 ? "checked" : "";
        header += `<th><div class="header_space"><div class="header"><input type="checkbox" id="select_${comp_level}" name="select_${comp_level}" onclick="toggle('${comp_level}');" ${is_selected}/><label for="select_${comp_level}">${comp_level}</label></div></div></th>`;;
    });
    header += "\n</thead>";
    let rows = [];
    for (const simulator of SIMULATORS) {
        const sim_description = TOOL_DESCRIPTIONS[simulator];
        let matches = 0;
        let cells = [];
        bio_levels.forEach(bio_level => {
            const cell_class = get_cell_class(criteria, bio_level, sim_description["biological_level"]);
            if (cell_class == "match")
                matches++;
            cells.push(`<td class=${cell_class}></td>`);
        })
        cells.push(`<td class="separator"></td>`);
        comp_levels.forEach(comp_level => {
            const cell_class = get_cell_class(criteria, comp_level, sim_description["computing_scale"]);
            if (cell_class == "match")
                matches++;
            cells.push(`<td class=${cell_class}></td>`);
        })
        if (criteria.length == 0)
            match_class = "";
        else if (criteria.length == matches)
            match_class = "good_match";
        else if (matches > 0)
            match_class = "medium_match";
        else
            match_class = "bad_match"
        const is_checked = selected.includes(simulator) ? "checked" : "";
        const checkbox = `<input type="checkbox" id="select_${simulator}" name="select_${simulator}" onclick="toggle_selection('${simulator}');" ${is_checked}/>`;
        const row = `<tr class="simulator_row ${match_class}"><td>${checkbox}</td><th scope="row" class='simulator_name'><span onclick="showDetails(TOOL_DESCRIPTIONS['${simulator}'], []);">${simulator}</span></td>` + cells.join(" ") + "</tr>";
        rows.push({row: row, matches: matches});
    }
    rows.sort((a, b) => b['matches']-a['matches'])
    let table_div = document.getElementById("table");
    table_div.innerHTML = "<table>\n" + header + "\n<tbody>" + rows.map(r => r["row"]).join("\n") + "</tbody></table>"
}

function toggle_selection(simulator) {
    const checkbox = document.getElementById("select_" + simulator);
    if (checkbox.checked) {
        selected.push(simulator);
    } else {
        const index = selected.indexOf(simulator);
        if (index > -1) { // only splice array when item is found
            selected.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
    if (selected.length > 0) {
        document.getElementById("graph_label").innerText = "Graph";
        document.getElementById("graph_label").style = "";
        document.getElementById("select_graph").disabled = false;
    } else {
        document.getElementById("graph_label").innerText = "Graph (select at least one simulator)";
        document.getElementById("select_graph").disabled = true;
        document.getElementById("graph_label").style = "color: gray;";
    }
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
