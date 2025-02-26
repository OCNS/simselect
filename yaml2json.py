from textwrap import dedent
import glob
import os

import markdown
import yaml
import json

if __name__ == "__main__":
    data = {}
    for fname in sorted(glob.glob("simtools/*.yaml")):
        if os.path.basename(fname) == "simtools.yaml":
            continue
        with open(fname) as f:
            tool_data = yaml.load(f, Loader=yaml.SafeLoader)
            if "short_name" in tool_data:
                name = tool_data["short_name"]
                del tool_data["short_name"]
            else:
                name = tool_data["name"]

            # Convert markdown description to HTML
            if "summary" in tool_data:
                tool_data["summary"] = markdown.markdown(tool_data["summary"])

            data[name] = tool_data
    with open("simtools/simtools.json", "w") as f:
        json.dump(data, f, indent=2, sort_keys=True)
