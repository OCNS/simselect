import random

import panel as pn

import data


class SimSelect:
    DATA = data.parse_files()
    VALUES = data.unique_entries(DATA)

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
        filter_results, total_critera = self.filtered_data({'operating_system': self.os_select.value,
                                             'interface_language': self.lang_select.value,
                                             'biological_level': self.model_select.value,
                                             'computing_scale': self.power_select.value,
                                             'model__description_language': self.description_select.value})

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

    def simulator_details(self, event):
        simulator = event.obj.name
        data = SimSelect.DATA[simulator]
        description = f"""
        # {data['name']} <span class="material-symbols-outlined">star</span>
        
        TODO
        
        Website: [{data['website_url']}]({data['website_url']})
        """
        self.template.modal[0].clear()
        self.template.modal[0].append(pn.pane.Markdown(description, sizing_mode="stretch_both"))
        self.template.open_modal()

    def __init__(self):
        # This is needed to make the app work in a notebook
        pn.extension(raw_css=['.bk-btn-light {color: #888!important;}'])

        self.template = pn.template.MaterialTemplate(title='SimSelect')

        # Create selection widgets
        self.os_select = pn.widgets.MultiChoice(name='Operating systems', options=SimSelect.VALUES["operating_system"])
        self.lang_select = pn.widgets.MultiChoice(name='Interface languages', options=SimSelect.VALUES["interface_language"])
        self.power_select = pn.widgets.MultiChoice(name='Computing power', options=SimSelect.VALUES["computing_scale"])
        self.model_select = pn.widgets.MultiChoice(name='Model type', options=SimSelect.VALUES["biological_level"])
        self.description_select = pn.widgets.MultiChoice(name='Model description language', options=SimSelect.VALUES["model__description_language"])

        # Basic layout
        self.template.header.append(pn.pane.Markdown("""
        **Note: this is an early prototype and far from ready for general use**
        """))
        self.template.sidebar.append(self.os_select)
        self.template.sidebar.append(self.lang_select)
        self.template.sidebar.append(self.power_select)
        self.template.sidebar.append(self.model_select)
        self.template.sidebar.append(self.description_select)

        # Create "buttons" for all simulators
        self.simulators = [pn.widgets.Button(name=name, margin=10, css_classes=['ranking-neutral'])
                           for name in SimSelect.DATA.keys()]
        self.update_cards(None)
        for simulator in self.simulators:
            simulator.on_click(self.simulator_details)
        self.layout = pn.FlexBox(*self.simulators)
        self.template.main.append(self.layout)
        self.os_select.param.watch(self.update_cards, 'value')
        self.lang_select.param.watch(self.update_cards, 'value')
        self.power_select.param.watch(self.update_cards, 'value')
        self.model_select.param.watch(self.update_cards, 'value')
        self.description_select.param.watch(self.update_cards, 'value')

        self.template.modal.append(pn.Column(width=800))  # Placeholder

if __name__.startswith("bokeh"):
    sim_select = SimSelect()
    sim_select.template.servable()
