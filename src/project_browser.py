import os
from pathlib import Path
import random
import textwrap
import datetime

import panel as pn
from panel.reactive import ReactiveHTML
import param

import data


__version__ = "0.1.0"

REPO_URL = "https://github.com/OCNS/simselect"
DATA_FOLDER = "simtools"

DOC_URLS = ["documentation", "installation", "tutorial", "examples"]
DEV_URLS = ["email", "chat", "forum", "issue tracker", "source", "download"]


def create_url_button(url_type, url, button_type="default"):
    icon = get_icon(url_type, url)
    url_button = pn.widgets.Button(
        icon=icon,
        name=url_type.capitalize(),
        button_type=button_type,
        stylesheets=["/assets/buttons.css"],
    )
    url_button.disabled = True if not url else False
    if url_type.lower() == "email":
        url_button.js_on_click(code=f"window.open('mailto:{url}')")
    else:
        url_button.js_on_click(code=f"window.open('{url}')")
    return url_button


def create_url_buttons(show_urls, simulator_urls, button_type):
    url_buttons = []
    for url_type in show_urls:
        url_button = create_url_button(
            url_type, simulator_urls.get(url_type, ""), button_type=button_type
        )
        url_buttons.append(url_button)
    return url_buttons


class SimButton(ReactiveHTML):
    sim_name = param.String()
    button_type = param.String()
    button_style = param.String()
    selected_for_details = param.String()
    features = param.List()

    def __init__(self, **params):
        super().__init__(**params)
        self._onclick = None

    _template = """
    <button id="simbutton" class="bk-btn ${selected_for_details} bk-btn-${button_type} bk-btn-${button_style}" onclick="${_btn_click}"
     type="button" style="padding: var(--padding-vertical) var(--padding-horizontal); font-size: var(--font-size); font-family: var(--base-font); margin: var(--padding-vertical) var(--padding-horizontal); cursor: pointer">
    {{sim_name}}
    {% if features %}
    <span style="border: 1px dashed lightgray; margin-left: 1em">
    {% endif %}
    {% if "frontend" in features%}
    <span style="font-family: tabler-icons !important;">\uf7cc</span>
    {% endif %}
    {% if "backend" in features %}
    <span style="font-family: tabler-icons !important;">\uef8e</span>
    {% endif %}
    {% if "standard" in features %}
    <span style="font-family: tabler-icons !important;">\uf567</span>
    {% endif %}
    {% if "tool" in features %}
    <span style="font-family: tabler-icons !important;">\ueb40</span>
    {% endif %}
    {% if features %}
    </span>
    {% endif %}
    </button>
    """

    def _btn_click(self, event):
        if self._onclick:
            # Note that SimSelect.simulator_details will set the button class to highlight the selected button
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
    elif url_type.lower() == "tutorial":
        return "school"
    elif url_type.lower() == "installation":
        return "device-laptop"
    elif url_type.lower() == "examples":
        return "script"
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
            if key == "features":
                # Translate long display names to short category names
                value = [
                    {
                        "user interface": "frontend",
                        "compute engine": "backend",
                        "interoperability standard": "standard",
                        "general tool": "tool",
                    }[v]
                    for v in value
                ]
                for name, values in SimSelect.DATA.items():
                    if not set(value).intersection(values[key]):  # no overlap
                        # Hide completely
                        filtered[name] = -1
            elif value:  # other filters
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
            {key: self.select_widgets[key].value for key in self.select_widgets}
            | {"features": self.feature_checkboxes.value},
            self.search_box.value_input.lower(),
        )
        unsorted = all(
            v == 0 for v in filter_results.values()
        )  # categories matches, but nothing else checked
        for simulator in self.simulators:
            if filter_results[simulator.sim_name] == 0 and total_critera == 0:
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
        if unsorted:
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
        # Highlight buttons correctly
        for button in self.simulators:
            if button.sim_name == sim_name:
                button.selected_for_details = "sim-detail-selected"
            else:
                button.selected_for_details = ""

        data = SimSelect.DATA[sim_name]

        criteria = self.formatted_criteria(data)
        feature_html = ""
        features = data["features"]
        if "frontend" in features:
            feature_html += '<span style="font-family: tabler-icons !important; margin-right:.2em">\uf7cc</span>user interface&nbsp;'
        if "backend" in features:
            feature_html += '<span style="font-family: tabler-icons !important; margin-right:.2em">\uef8e</span>compute engine&nbsp;'
        if "standard" in features:
            feature_html += '<span style="font-family: tabler-icons !important; margin-right:.2em">\uf567</span>interoperability standard&nbsp;'
        if "tool" in features:
            feature_html += '<span style="font-family: tabler-icons !important; margin-right:.2em">\ueb40</span>general tool'
        description = f"""
# {data['name']} [\u270e]({github_url(data['filename'])} "Propose changes to this entry")
## {feature_html}

{data.get('summary', '')}

{criteria}
"""
        rows = [description]
        urls = data.get("urls", {})
        if "homepage" in urls:
            url_button = create_url_button(
                "homepage", urls["homepage"], button_type="success"
            )
            # Display homepage prominently on its own (if it exists)
            rows.append(pn.Row(url_button))

        url_buttons = create_url_buttons(DOC_URLS, urls, "primary")
        rows.append(pn.Row(*url_buttons))

        url_buttons = create_url_buttons(DEV_URLS, urls, "default")
        rows.append(pn.Row(*url_buttons))

        if data.get("relations", []):
            rows.append("## Related simulators")
            relation_buttons = []
            for relation in data["relations"]:
                relation_button = pn.widgets.Button(
                    name=relation["name"], button_type="primary"
                )
                relation_button.on_click(
                    lambda event: self.simulator_details(event.obj.name)
                )
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
        **Note: this is an early prototype; please provide feedback <a href="https://github.com/OCNS/simselect/issues/37" target="_blank" style="color: var(--neutral-foreground-rest);">here</a>.**
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
        features = [
            "user interface",
            "compute engine",
            "interoperability standard",
            "general tool",
        ]
        self.feature_checkboxes = pn.widgets.CheckBoxGroup(
            name="Category", value=features, options=features
        )
        self.template.sidebar.append(self.feature_checkboxes)
        for key in self.select_widgets:
            self.template.sidebar.append(self.select_widgets[key])

        # Create "buttons" for all simulators
        self.simulators = []
        for name in SimSelect.DATA:
            self.simulators.append(
                SimButton(
                    sim_name=name,
                    button_type="default",
                    button_style="solid",
                    features=SimSelect.DATA[name].get("features", []),
                    stylesheets=["/assets/buttons.css"],
                )
            )
        self.update_cards(None)
        for simulator in self.simulators:
            simulator.on_click(self.simulator_details)
        self.detail_view = pn.Row(
            "Click on a simulator above to get more details ☝️"
        )  # placeholder, will be filled when clicking on a simulator
        self.layout = pn.FlexBox(*self.simulators)
        self.template.main.append(self.layout)
        self.template.main.append(self.detail_view)

        # footer
        self.template.sidebar.append(pn.layout.Divider())
        self.footer = pn.Row(scroll=False)
        year = datetime.datetime.now().date().strftime("%Y")
        self.footer.append(
            textwrap.dedent(
                f"""
Simselect v{__version__} |
Copyright {year} [Simselect
contributors](https://github.com/OCNS/simselect/graphs/contributors) |
[Source](https://github.com/OCNS/simselect/) |
[License](#) |
[Contribution guidelines](https://github.com/OCNS/simselect/blob/main/CONTRIBUTING.md)

*Disclaimer*: the information included here is taken from the
websites/documentation of the different tools. Please [file an
issue](https://github.com/OCNS/simselect/issues/new/choose) or suggest a change
via [pull requests](https://github.com/OCNS/simselect/pulls) if you find any
errors.
            """
            )
        )
        self.template.sidebar.append(self.footer)

        # Watch the category checkboxes
        self.feature_checkboxes.param.watch(self.update_cards, "value")
        # Watch the select widgets
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
