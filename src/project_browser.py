import data

import panel as pn

class SimSelect:
    DATA = data.parse_files()
    VALUES = data.unique_entries(DATA)

    def filtered_data(self, criteria):
        '''
        Filter the data based on the criteria
        Args:
            criteria: dict
                The criteria to filter on

        Returns:
            dict: The filtered data
        '''
        filtered = {}
        for name, values in SimSelect.DATA.items():
            for key, value in criteria.items():
                if value and not set(value).issubset(values[key]):
                    break
            else:
                filtered[name] = values
        return filtered

    def update_cards(self, event):
        filter_results = self.filtered_data({'operating_system': self.os_select.value,
                                             'interface_language': self.lang_select.value,
                                             'biological_level': self.model_select.value,
                                             'computing_scale': self.power_select.value,
                                             'model__description_language': self.description_select.value})
        for simulator in self.simulators:
            simulator.visible = simulator.name in filter_results

    def simulator_details(self, event):
        simulator = event.obj.name
        data = SimSelect.DATA[simulator]
        description = f"""
        # {data['name']}
        
        TODO
        
        Website: [{data['website_url']}]({data['website_url']})
        """
        print(description)
        self.template.modal[0].clear()
        self.template.modal[0].append(pn.pane.Markdown(description))
        self.template.open_modal()

    def __init__(self):
        # This is needed to make the app work in a notebook
        pn.extension()

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
        self.simulators = [pn.widgets.Button(name=name)
                           for name in SimSelect.DATA.keys()]
        for simulator in self.simulators:
            simulator.on_click(self.simulator_details)
        layout = pn.FlexBox(*self.simulators)
        self.template.main.append(layout)
        self.os_select.param.watch(self.update_cards, 'value')
        self.lang_select.param.watch(self.update_cards, 'value')
        self.power_select.param.watch(self.update_cards, 'value')
        self.model_select.param.watch(self.update_cards, 'value')
        self.description_select.param.watch(self.update_cards, 'value')

        self.template.modal.append(pn.Column())  # Placeholder


if __name__.startswith("bokeh"):
    sim_select = SimSelect()
    sim_select.template.servable()
