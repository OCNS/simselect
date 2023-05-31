import random

import panel as pn

import data


class SimSelect:
    DATA = data.parse_files()
    VALUES = data.unique_entries(DATA)
    # Criteria with their "translation" for humans
    CRITERIA = {"operating_system": "Operating systems",
                "interface_language": "Interface languages",
                "biological_level": "Model type",
                "computing_scale": "Computing power",
                "model_description_language": "Model description language"}

    def filtered_data(self, criteria):
        '''
        Filter the data based on the criteria, returning the number of matched criteria.
        Args:
            criteria: dict
                The criteria to filter on

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

        return filtered, total_criteria

    def update_cards(self, event):
        filter_results, total_critera = self.filtered_data({key: self.select_widgets[key].value
                                                            for key in self.select_widgets})

        for simulator in self.simulators:
            simulator.css_classes.clear()
            if total_critera == 0:
                simulator.button_type = 'default'
            elif filter_results[simulator.name] == total_critera:
                simulator.button_type = 'success'
            elif filter_results[simulator.name] > 0:
                simulator.button_type = 'warning'
            else:
                simulator.button_type = 'light'
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
# {data['name']}

{data.get('summary', '')}

{criteria}

Website: [{data['website_url']}]({data['website_url']})
"""
        print(description)
        self.template.modal[0].clear()
        self.template.modal[0].append(pn.pane.Markdown(description, sizing_mode="stretch_both"))
        self.template.open_modal()

    def __init__(self):
        # This is needed to make the app work in a notebook
        pn.extension(raw_css=['.bk-btn-light {color: #888!important;}'])

        self.template = pn.template.MaterialTemplate(title='SimSelect')

        # Create selection widgets
        self.select_widgets = {}
        for key, translation in SimSelect.CRITERIA.items():
            self.select_widgets[key] = pn.widgets.MultiChoice(name=translation, options=SimSelect.VALUES[key])

        # Basic layout
        self.template.header.append(pn.pane.Markdown("""
        **Note: this is an early prototype and far from ready for general use**
        """))
        for key in self.select_widgets:
            self.template.sidebar.append(self.select_widgets[key])

        # Create "buttons" for all simulators
        self.simulators = [pn.widgets.Button(name=name, margin=10, css_classes=['ranking-neutral'])
                           for name in SimSelect.DATA.keys()]
        self.update_cards(None)
        for simulator in self.simulators:
            simulator.on_click(self.simulator_details)
        self.layout = pn.FlexBox(*self.simulators)
        self.template.main.append(self.layout)
        for key in self.select_widgets:
            self.select_widgets[key].param.watch(self.update_cards, 'value')

        self.template.modal.append(pn.Column(width=800))  # Placeholder

if __name__.startswith("bokeh"):
    sim_select = SimSelect()
    sim_select.template.servable()
