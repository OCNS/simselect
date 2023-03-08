import random

import panel as pn


operating_systems = ['Windows', 'MacOS', 'Linux']
interface_languages = ['Python', 'Java', 'C/C++', 'Julia', 'Matlab', 'GUI']
computing_power = ['single computer', 'cluster', 'supercomputer', 'GPU', 'neuromorphic hardware']
model_type = ['rate-based model', 'simple single-compartment model', 'complex single-compartment model', 'multi-compartment model']
licenses = ['copy-left', 'permissive']
development_status = ['active', 'unknown', 'maintained']

def create_data(n=20):
    '''
    Create some silly fake data
    Args:
        n: int
            Number of data points to create

    Returns:
        dict: The data
    '''
    name1 = ['sim', 'core', 'bio', 'cyber', 'virtual', 'multi']
    name2 = ['neuron', 'cell', 'spike', 'synapse', 'brain', 'cortex']
    data = {}
    for _ in range(n):
        # Chose names that are unique
        while True:
            name = random.choice(name1) + '-' + random.choice(name2)
            if name not in data:
                break

        n_os = random.randint(1, len(operating_systems))
        os_support = random.sample(operating_systems, n_os)
        n_lang = random.randint(1, 3)
        interface_lang = random.sample(interface_languages, n_lang)
        n_power = random.randint(1, len(computing_power)-1)
        power = random.sample(computing_power, n_power)
        n_model = random.randint(1, len(model_type))
        model = random.sample(model_type, n_model)
        license = random.choice(licenses)
        dev_status = random.choice(development_status)

        data[name] = {'operating_systems': os_support,
                      'interface_languages': interface_lang,
                      'computing_power': power,
                      'model_type': model,
                      'license': license,
                      'development_status': dev_status}
    return data

DATA = create_data(20)

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
            if key == 'license':
                if value != 'any' and value != values[key]:
                    break
            elif key == 'development_status':
                if value != 'any' and value != values[key]:
                    break
            elif value and not set(value).issubset(values[key]):
                break
        else:
            filtered[name] = values
    return filtered

# Create selection widgets
os_select = pn.widgets.MultiChoice(name='Operating systems', options=operating_systems)
lang_select = pn.widgets.MultiChoice(name='Interface languages', options=interface_languages)
power_select = pn.widgets.MultiChoice(name='Computing power', options=computing_power)
model_select = pn.widgets.MultiChoice(name='Model type', options=model_type)
license_select = pn.widgets.Select(name='License', options=['any'] + licenses)
dev_select = pn.widgets.Select(name='Development status', options=['any'] + development_status)

# Basic layout
select_col = pn.Column(os_select, lang_select, power_select, model_select)
select_co2 = pn.Column(license_select, dev_select)
select_row = pn.Row(select_col, select_co2)

# Create cards for all "simulators"
layout = pn.FlexBox([])

# Due to watch=True, this function will be called whenever any of the widgets change
# It updates the cards in place by assigning to layout.objects (another option would be to
# change the cards' visibility, I guess)
@pn.depends(os_select, lang_select, model_select, power_select, license_select, dev_select, watch=True)
def get_cards(os_select, lang_select, model_select, power_select, license_select, dev_select):

    cards = [pn.Card({key: value if isinstance(value, str) else ', '.join(sorted(value))
             for key, value in DATA[name].items()},
            title=name, collapsed=True)
    for name in filtered_data({'operating_systems': os_select,
                               'interface_languages': lang_select,
                               'model_type': model_select,
                               'computing_power': power_select,
                               'license': license_select,
                               'development_status': dev_select})]
    layout.objects = cards

# This is needed to make the app work in a notebook
pn.extension()

# Initially, display all simulators
get_cards([], [], [], [], 'any', 'any')  # Select all simulators
main = pn.Column(select_row, layout)

if __name__.startswith("bokeh"):
    main.servable()

if __name__ == '__main__':
    # This embeds the app in a standalone HTML file, but it does only work for
    # simple widgets like Select, not for e.g. MultiChoice
    main.save('project_browser.html', embed=True)