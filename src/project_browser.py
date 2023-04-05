import data

import panel as pn

DATA = data.parse_files()
VALUES = data.unique_entries(DATA)

def filtered_data(criteria):
    '''
    Filter the data based on the criteria
    Args:
        criteria: dict
            The criteria to filter on

    Returns:
        dict: The filtered data
    '''
    filtered = {}
    for name, values in DATA.items():
        for key, value in criteria.items():
            if value and not set(value).issubset(values[key]):
                break
        else:
            filtered[name] = values
    return filtered

# Create selection widgets
os_select = pn.widgets.MultiChoice(name='Operating systems', options=VALUES["operating_system"])
lang_select = pn.widgets.MultiChoice(name='Interface languages', options=VALUES["interface_language"])
power_select = pn.widgets.MultiChoice(name='Computing power', options=VALUES["interface_language"])
model_select = pn.widgets.MultiChoice(name='Model type', options=VALUES["biological_level"])
description_select = pn.widgets.MultiChoice(name='Model description language', options=VALUES["model__description_language"])

# Basic layout
header = pn.pane.Markdown("""
# Simselect tool
**Note: this is an early prototype and far from ready for general use**
""")
select_col = pn.Column(os_select, lang_select)
select_co2 = pn.Column(power_select, model_select, description_select)
select_row = pn.Row(select_col, select_co2)

# Create cards for all "simulators"
layout = pn.FlexBox([])

# Due to watch=True, this function will be called whenever any of the widgets change
# It updates the cards in place by assigning to layout.objects (another option would be to
# change the cards' visibility, I guess)
@pn.depends(os_select, lang_select, model_select, power_select, description_select, watch=True)
def get_cards(os_select, lang_select, model_select, power_select, description_select):

    cards = [pn.Card({key: value if isinstance(value, str) else ', '.join(sorted(value))
             for key, value in DATA[name].items()},
             title=name, collapsed=True)
    for name in filtered_data({'operating_system': os_select,
                               'interface_language': lang_select,
                               'biological_level': model_select,
                               'computing_scale': power_select,
                               'model__description_language': description_select})]
    layout.objects = cards

# This is needed to make the app work in a notebook
pn.extension()

# Initially, display all simulators
get_cards([], [], [], [], [])  # Select all simulators
main = pn.Column(header, select_row, layout)

if __name__.startswith("bokeh"):
    main.servable()
