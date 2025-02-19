#!/usr/bin/env python3
"""
Validates the yaml files by defining a schema

File: validate_data.py

Copyright 2023 Simselect contributors
"""

from pathlib import Path
import sys

from schema import Schema, SchemaError, Optional, Or, And
import yaml


class SimselectSchema(Schema):
    def validate(self, data, _is_simselect_schema=True):
        data = super().validate(data, _is_simselect_schema=False)
        if _is_simselect_schema and not "simulator" in data["features"]:
            if "biological_level" in data:
                raise SchemaError("biological_level is only valid for simulators")
        return data


data_schema = SimselectSchema(
    {
        "name": str,
        Optional("short_name"): str,
        "features": And(
            str,
            lambda s: all(
                ss.strip()
                in ["frontend", "simulator", "standard", "tool", "library", "API"]
                for ss in s.split(",")
            ),
            error="features must be a comma-separated list of 'frontend', 'simulator', 'standard', 'tool', 'library', 'API'",
        ),
        "operating_system": Or(str, None),
        Optional("biological_level"): Or(str, None),
        Optional("processing_support"): Or(str, None),
        "interface_language": Or(str, None),
        "summary": str,
        Optional("model_description_language"): Or(str, None),
        Optional("urls"): {
            Or(
                "homepage",
                "documentation",
                "installation",
                "tutorial",
                "examples",
                "email",
                "chat",
                "forum",
                "issue tracker",
                "source",
                "download",
            ): (
                lambda url: isinstance(url, str)
                and url.startswith("http")
                or "@" in url
            )
        },
        Optional("relations"): [{"name": str, "description": str}],
    }
)

data_files = Path(Path(__file__).parent / ".." / "simtools")
file_list = list(data_files.glob("**/*.yaml"))
print(file_list)

errors = []
for datafile in file_list:
    if datafile.name == "simtools.yaml":
        continue
    print(f"\n>> Validating {datafile}")
    with open(datafile, "r") as f:
        text = yaml.safe_load(f)
        try:
            data_schema.validate(text)
            print(f">> {datafile} is valid.")
        except SchemaError as e:
            errors.append(datafile.name)
            print(f"!! {e}")
            print(f"!! {datafile} is invalid.")
        expected_name = text.get("short_name") or text.get("name")
        expected_name = expected_name.replace(" ", "-") + ".yaml"
        if datafile.name != expected_name:
            errors.append(datafile.name)
            print(text[0])
            print(
                f"!! File name '{datafile}'does not match name in {datafile} (should be '{expected_name}')"
            )

if errors:
    print(f"\n!! Some files did not validate: {errors}")
    sys.exit(1)
else:
    print("\n>> All files validated successfully.")
    sys.exit(0)
