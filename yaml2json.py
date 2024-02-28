import glob
import os

import yaml
import json

if __name__ == "__main__":
    data = {}
    for fname in sorted(glob.glob("simtools/*.yaml")):
        if os.path.basename(fname) == "simtools.yaml":
            continue
        with open(fname) as f:
            tool_data = {
                list(item.keys())[0]: list(item.values())[0]
                for item in yaml.load(f, Loader=yaml.FullLoader)
            }
            if "short_name" in tool_data:
                name = tool_data["short_name"]
                del tool_data["short_name"]
            else:
                name = tool_data["name"]

            data[name] = tool_data
    with open("simtools/simtools.json", "w") as f:
        json.dump(data, f, indent=2, sort_keys=True)
