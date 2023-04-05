import yaml

def yaml_to_yamls():
    with open("simtools/simtools.yaml", "r") as stream:
        data = yaml.load(stream, Loader=yaml.FullLoader)
        for simtool in data:
            tool_name = list(simtool.keys())[0]
            with open(f"simtools/{tool_name.replace(' ', '-')}.yaml", "w") as outfile:
                val = [
                    {"name": tool_name},
                    {"website_url": ""},
                    {"operating_system" : ""},
                    {"biological_level": ""},
                    {"computing_scale": ""},
                    {"interface_language": ""},
                    {"model_description_language": ""},
                ]
                yaml.dump(val, outfile)

                
if __name__ == "__main__":
    yaml_to_yamls()