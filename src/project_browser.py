import random

import panel as pn

import data

REPO_URL = "https://github.com/OCNS/simselect"
DATA_FOLDER = "simtools"


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
    if url_type.lower() == 'homepage':
        return 'home'
    elif url_type.lower() == 'source':
        if 'github.com' in url.lower():
            return 'brand-github'
        elif 'gitlab.com' in url.lower():
            return 'brand-gitlab'
        elif 'bitbucket.org' in url.lower():
            return 'brand-bitbucket'
        else:
            return 'code'
    elif url_type.lower() == 'documentation':
        return 'book'
    elif url_type.lower() == 'issue tracker':
        return 'bug'
    elif url_type.lower() == 'download':
        if 'pypi.org' in url.lower():
            return 'package'
        else:
            return 'download'
    elif url_type.lower() == 'release_notes':
        return 'notes'
    elif url_type.lower() == 'email':
        return 'mail'
    elif url_type.lower() == 'chat':
        return 'message-circle-2'
    elif url_type.lower() == 'forum':
        return 'messages'
    else:
        return None

class SimSelect:
    DATA = data.parse_files()
    VALUES = data.unique_entries(DATA)
    # Criteria with their "translation" for humans
    CRITERIA = {"operating_system": "Operating systems",
                "interface_language": "Interface languages",
                "biological_level": "Model type",
                "computing_scale": "Computing power",
                "model_description_language": "Model description language"}

    def filtered_data(self, criteria, search_text):
        '''
        Filter the data based on the criteria, returning the number of matched criteria.
        Args:
            criteria: dict
                The criteria to filter on
            search_text: str
                A lower-case string to search for in the name and summary

        Returns:
            dict, int
            The number of matched criteria for each simulator and the total number of criteria
        '''
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
                if (search_text not in values.get("summary", "").lower() and
                        search_text not in values["name"].lower()):
                    filtered[name] = -1  # Hide completely
                else:
                    filtered[name] += 1

        return filtered, total_criteria

    def update_cards(self, event):
        filter_results, total_critera = self.filtered_data({key: self.select_widgets[key].value
                                                            for key in self.select_widgets},
                                                           self.search_box.value_input.lower())

        for simulator in self.simulators:
            simulator.css_classes.clear()
            if total_critera == 0:
                simulator.button_type = 'default'
                simulator.button_style = 'solid'
            elif filter_results[simulator.name] == total_critera:
                simulator.button_type = 'success'
                simulator.button_style = 'solid'
            elif filter_results[simulator.name] > 0:
                simulator.button_type = 'warning'
                simulator.button_style = 'solid'
            elif filter_results[simulator.name] == 0:
                simulator.button_type = 'default'
                simulator.button_style = 'outline'
            elif filter_results[simulator.name] == -1:
                simulator.button_type = 'light'
                simulator.button_style = 'solid'
        if total_critera == 0:
            random.shuffle(self.simulators)
        else:
            self.simulators.sort(key=lambda x: filter_results[x.name], reverse=True)
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
            support = ", ".join(f"**{v}**" if v in self.select_widgets[key].value else v
                                for v in data[key])
            description.append(f"*{value}*: {support}")
        return "\n\n".join(description)

    def simulator_details(self, event):
        simulator = event.obj.name
        data = SimSelect.DATA[simulator]

        criteria = self.formatted_criteria(data)
        description = f"""
# {data['name']} [\u270e]({github_url(data['filename'])} "Propose changes to this entry")

{data.get('summary', '')}

{criteria}
"""
        self.template.modal[0].clear()
        url_buttons = []
        for url_type, url in data.get("urls", {}).items():
            icon = get_icon(url_type, url)
            url_button = pn.widgets.Button(icon=icon, name=url_type.capitalize(),
                                           button_type="primary")
            url_button.js_on_click(code=f"window.open('{url}')")
            url_buttons.append(url_button)
        buttons = pn.Row(*url_buttons)

        layout = pn.Column(description, buttons)
        self.template.modal[0].append(layout)
        self.template.open_modal()

    def __init__(self):
        # This is needed to make the app work in a notebook
        pn.extension(raw_css=['.bk-btn-light {color: #888!important;}'])

        self.template = pn.template.FastListTemplate(title='SimSelect')

        # Search box
        self.search_box = pn.widgets.TextInput(placeholder="Search")

        # Create selection widgets
        self.select_widgets = {}
        for key, translation in SimSelect.CRITERIA.items():
            self.select_widgets[key] = pn.widgets.MultiChoice(name=translation, options=SimSelect.VALUES[key])

        # Basic layout
        self.template.header.append(pn.pane.Markdown("""
        **Note: this is an early prototype and far from ready for general use**
        """))
        self.template.sidebar.append(self.search_box)
        self.template.sidebar.append("## Filter by")
        for key in self.select_widgets:
            self.template.sidebar.append(self.select_widgets[key])

        # Create "buttons" for all simulators
        self.simulators = [pn.widgets.Button(name=name, css_classes=['ranking-neutral'])
                           for name in SimSelect.DATA.keys()]
        self.update_cards(None)
        for simulator in self.simulators:
            simulator.on_click(self.simulator_details)
        self.layout = pn.FlexBox(*self.simulators)
        self.template.main.append(self.layout)
        for key in self.select_widgets:
            self.select_widgets[key].param.watch(self.update_cards, 'value')
        # Watch the search box
        self.search_box.param.watch(self.update_cards, 'value_input')
        self.template.modal.append(pn.Column(width=800))  # Placeholder

if __name__.startswith("bokeh"):
    sim_select = SimSelect()
    sim_select.template.servable()
