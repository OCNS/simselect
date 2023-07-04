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


data_schema = Schema(
    [
        {
            "name": str,
        },
        {
            "features": And(
                str,
                lambda s: all(
                    ss.strip() in ["frontend", "backend", "standard", "tool"]
                    for ss in s.split(",")
                ),
                error="features must be a comma-separated list of 'frontend', 'backend', 'standard', 'tool'",
            ),
        },
        {"operating_system": Or(str, None)},
        {
            "biological_level": Or(str, None),
        },
        {
            "computing_scale": Or(str, None),
        },
        {
            "interface_language": Or(str, None),
        },
        {
            "summary": str,
        },
        {
            Optional("model_description_language"): Or(str, None),
        },
        {
            Optional("urls"): {
                str: str,
            }
        },
        {Optional("relations"): [{"name": str}]},
        {Optional("website_url"): str},
    ]
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

if errors:
    print(f"\n!! Some files did not validate: {errors}")
    sys.exit(1)
else:
    print("\n>> All files validated successfully.")
    sys.exit(0)
