#!/usr/bin/env python3
"""
Validates the yaml files by defining a schema

File: validate_data.py

Copyright 2023 Simselect contributors
"""


from pathlib import Path
from schema import Schema, SchemaError, Optional, Or
import yaml


data_schema = Schema(
    [
        {
            "name": str,
        },
        {
            "operating_system": str,
        },
        {
            "biological_level": str,
        },
        {
            "computing_scale": str,
        },
        {
            "interface_language": str,
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

data_files = Path("../simtools")
file_list = list(data_files.glob("**/*.yaml"))
print(file_list)

for datafile in file_list:
    print(f"\n>> Validating {datafile}")
    with open(datafile, "r") as f:
        text = yaml.safe_load(f)
        try:
            data_schema.validate(text)
            print(f">> {datafile} is valid.")
        except SchemaError as e:
            print(e)
