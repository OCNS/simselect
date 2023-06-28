import os
from pathlib import Path
import random

import panel as pn
from panel.reactive import ReactiveHTML
import param

import data

REPO_URL = "https://github.com/OCNS/simselect"
DATA_FOLDER = "simtools"


class SimButton(ReactiveHTML):
    sim_name = param.String()
    button_type = param.String()
    button_style = param.String()
    categories = param.List()

    def __init__(self, **params):
        super().__init__(**params)
        self._onclick = None

    _template = """
    <button id="simbutton" class="bk-btn bk-btn-${button_type} bk-btn-${button_style}" onclick="${_btn_click}"
     type="button" style="padding: var(--padding-vertical) var(--padding-horizontal); font-size: var(--font-size); font-family: var(--base-font); margin: var(--padding-vertical) var(--padding-horizontal); cursor: pointer">
    {{sim_name}}
    {% if categories %}
    <span style="border: 1px dashed lightgray; margin-left: 1em">
    {% endif %}
    {% if "frontend" in categories%}
    <span style="font-family: tabler-icons !important;">\uf7cc</span>
    {% endif %}
    {% if "backend" in categories %}
    <span style="font-family: tabler-icons !important;">\uef8e</span>
    {% endif %}
    {% if "standard" in categories %}
    <span style="font-family: tabler-icons !important;">\uf567</span>
    {% endif %}
    {% if categories %}
    </span>
    {% endif %}
    </button>
    """

    def _btn_click(self, event):
        if self._onclick:
            self._onclick(self.sim_name)

    def on_click(self, callback):
        self._onclick = callback


def github_url(filename):
    return f"{REPO_URL}/edit/main/{DATA_FOLDER}/{filename}"


def get_icon(url_type, url):
    """
    Returns an appropriate icon from https://tabler-icons.io based on the url
    type and url.

    Args:
        url_type: str
        url: str

    Returns:
        icon: str or None
            The name of the icon to use or None
    """
    if url_type.lower() == "homepage":
        return "home"
    elif url_type.lower() == "source":
        if "github.com" in url.lower():
            return "brand-github"
        elif "gitlab.com" in url.lower():
            return "brand-gitlab"
        elif "bitbucket.org" in url.lower():
            return "brand-bitbucket"
        else:
            return "code"
    elif url_type.lower() == "documentation":
        return "book"
    elif url_type.lower() == "issue tracker":
        return "bug"
    elif url_type.lower() == "download":
        if "pypi.org" in url.lower():
            return "package"
        else:
            return "download"
    elif url_type.lower() == "release notes":
        return "notes"
    elif url_type.lower() == "email":
        return "mail"
    elif url_type.lower() == "chat":
        return "message-circle-2"
    elif url_type.lower() == "forum":
        return "messages"
    else:
        return None


class SimSelect:
    DATA = data.parse_files()
    VALUES = data.unique_entries(DATA)
    # Criteria with their "translation" for humans
    CRITERIA = {
        "operating_system": "Operating systems",
        "interface_language": "Interface languages",
        "biological_level": "Model type",
        "computing_scale": "Computing power",
        "model_description_language": "Model description language",
    }

    def filtered_data(self, criteria, search_text):
        """
        Filter the data based on the criteria, returning the number of matched criteria.
        Args:
            criteria: dict
                The criteria to filter on
            search_text: str
                A lower-case string to search for in the name and summary

        Returns:
            dict, int
            The number of matched criteria for each simulator and the total number of criteria
        """
        filtered = {}
        total_criteria = 0
        for name, values in SimSelect.DATA.items():
            filtered[name] = 0

        for key, value in criteria.items():
            if value:
                total_criteria += 1
                for name, values in SimSelect.DATA.items():
                    if set(value).issubset(values[key]):
                        filtered[name] += 1

        # Filter by search text
        if search_text:
            total_criteria += 1
            for name, values in SimSelect.DATA.items():
                if (
                    search_text not in values.get("summary", "").lower()
                    and search_text not in values["name"].lower()
                ):
                    filtered[name] = -1  # Hide completely
                else:
                    filtered[name] += 1

        return filtered, total_criteria

    def update_cards(self, event):
        filter_results, total_critera = self.filtered_data(
            {key: self.select_widgets[key].value for key in self.select_widgets},
            self.search_box.value_input.lower(),
        )

        for simulator in self.simulators:
            # simulator.css_classes.clear()
            if total_critera == 0:
                simulator.button_type = "default"
                simulator.button_style = "solid"
            elif filter_results[simulator.sim_name] == total_critera:
                simulator.button_type = "success"
                simulator.button_style = "solid"
            elif filter_results[simulator.sim_name] > 0:
                simulator.button_type = "warning"
                simulator.button_style = "solid"
            elif filter_results[simulator.sim_name] == 0:
                simulator.button_type = "default"
                simulator.button_style = "outline"
            elif filter_results[simulator.sim_name] == -1:
                simulator.button_type = "light"
                simulator.button_style = "solid"
        if total_critera == 0:
            random.shuffle(self.simulators)
        else:
            self.simulators.sort(key=lambda x: filter_results[x.sim_name], reverse=True)
            self.layout.objects = self.simulators

    def formatted_criteria(self, data):
        """
        Return a multi-line string with markdown formatted information
        about the support operating systems, interface languages, model types,
        and computing power.
        Args:
            data: dict
                The data for a single simulator
        Returns:
            description: str
        """
        description = []
        for key, value in SimSelect.CRITERIA.items():
            support = ", ".join(
                f"**{v}**" if v in self.select_widgets[key].value else v
                for v in data[key]
            )
            description.append(f"*{value}*: {support}")
        return "\n\n".join(description)

    def simulator_details(self, sim_name):
        data = SimSelect.DATA[sim_name]

        criteria = self.formatted_criteria(data)
        category_html = ""
        if categories := data.get("categories", []):
            if "frontend" in categories:
                category_html += '<span style="font-family: tabler-icons !important">\uf7cc</span> interface/frontend&nbsp;'
            if "backend" in categories:
                category_html += '<span style="font-family: tabler-icons !important">\uef8e</span> backend/engine&nbsp;'
            if "standard" in categories:
                category_html += '<span style="font-family: tabler-icons !important">\uf567</span> interoperability standard&nbsp;'
        else:
            category_html += '<span style="font-family: tabler-icons !important;">\ueb40</span> general tool'
        description = f"""
# {data['name']} [\u270e]({github_url(data['filename'])} "Propose changes to this entry")
## {category_html}

{data.get('summary', '')}

{criteria}
"""
        rows = [description]
        url_buttons = []
        for url_type, url in data.get("urls", {}).items():
            icon = get_icon(url_type, url)
            url_button = pn.widgets.Button(
                icon=icon, name=url_type.capitalize(), button_type="default"
            )
            if url_type.lower() == "email":
                url_button.js_on_click(code=f"window.open('mailto:{url}')")
            else:
                url_button.js_on_click(code=f"window.open('{url}')")
            url_buttons.append(url_button)

        if url_buttons:
            buttons = pn.Row(*url_buttons)
            rows.append(buttons)

        if data.get("relations", []):
            rows.append("## Related simulators")
            relation_buttons = []
            for relation in data["relations"]:
                relation_button = pn.widgets.Button(
                    name=relation["name"], button_type="primary"
                )
                relation_button.on_click(self.simulator_details)
                relation_buttons.append(relation_button)
            rows.append(pn.Row(*relation_buttons))

        layout = pn.Column(*rows)
        self.detail_view.clear()
        self.detail_view.append(layout)

    def __init__(self):
        # This is needed to make the app work in a notebook
        pn.extension()

        self.template = pn.template.FastListTemplate(title="SimSelect")

        # Search box
        self.search_box = pn.widgets.TextInput(placeholder="Search")

        # Create selection widgets
        self.select_widgets = {}
        for key, translation in SimSelect.CRITERIA.items():
            self.select_widgets[key] = pn.widgets.MultiChoice(
                name=translation, options=SimSelect.VALUES[key]
            )

        # Basic layout
        self.template.header.append(
            pn.pane.Markdown(
                """
        **Note: this is an early prototype and far from ready for general use**
        """
            )
        )
        self.template.sidebar.append(self.search_box)
        self.template.sidebar.append(pn.layout.Divider())
        filter_help = pn.widgets.Button(
            name="Help",
            icon="help-circle",
            button_type="light",
            button_style="outline",
            icon_size="1.5em",
        )
        filter_help.on_click(lambda event: self.template.open_modal())
        self.template.sidebar.append(pn.Row("## Filter by", filter_help))
        for key in self.select_widgets:
            self.template.sidebar.append(self.select_widgets[key])

        # Create "buttons" for all simulators
        self.simulators = [
            SimButton(
                sim_name=name,
                button_type="default",
                button_style="solid",
                categories=SimSelect.DATA[name].get("categories", []),
                stylesheets=["/assets/categories.css"],
            )
            for name in SimSelect.DATA
        ]
        self.update_cards(None)
        for simulator in self.simulators:
            simulator.on_click(self.simulator_details)
        self.detail_view = pn.Row(
            "Click on a simulator above to get more details ☝️"
        )  # placeholder, will be filled when clicking on a simulator
        self.layout = pn.FlexBox(*self.simulators)
        self.template.main.append(self.layout)
        self.template.main.append(self.detail_view)
        for key in self.select_widgets:
            self.select_widgets[key].param.watch(self.update_cards, "value")
        # Watch the search box
        self.search_box.param.watch(self.update_cards, "value_input")

        # Fill the help modal
        with open(Path(__file__).parent / ".." / "static" / "filter_criteria.md") as f:
            filter_help_text = pn.pane.Markdown(
                f.read(), renderer="markdown", extensions=["def_list"]
            )
        self.template.modal.append(filter_help_text)


if __name__.startswith("bokeh"):
    sim_select = SimSelect()
    sim_select.template.servable()
