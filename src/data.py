import yaml
from pathlib import Path


def get_files(dirname):
    """
    Return
    Args:
        dirname: Path
            directory containing the yaml files

    Yields:
        Filenames
    """
    for fname in sorted(dirname.glob("*.yaml")):
        if not fname.name == "simtools.yaml":  # hardcoded exception
            yield fname.resolve()


def string_to_list(s, prefix=""):
    """
    Helper function to convert a string to a list, e.g. `'A, B'` to `['A', 'B']`
    """
    if s:
        return sorted(prefix + l.strip() for l in s.split(","))
    else:
        return []


def parse_file(filename):
    """
    Parse a yaml file and return content as dictionary
    Args:
        filename: Path
            The name of the yaml file to parse

    Returns:
        A dictionary with the content of the yaml file
    """
    with open(filename) as f:
        content = yaml.safe_load(f)
        content_dict = {}
        for element in content:
            key, value = list(element.items())[0]
            content_dict[key] = value

    # Normalize the standard fields

    # Features (frontend, etc.)
    assert "features" in content_dict, "no features entry"
    content_dict["features"] = string_to_list(content_dict["features"])

    # Operating System
    if "simulator" in content_dict["features"]:
        assert "operating_system" in content_dict, "no operating_system entry"
    content_dict["operating_system"] = string_to_list(
        content_dict.get("operating_system", "")
    )

    # Biological level
    if "simulator" in content_dict["features"]:
        assert "biological_level" in content_dict, "no biological level"
    content_dict["biological_level"] = string_to_list(
        content_dict.get("biological_level", "")
    )

    # Computing scale
    if "simulator" in content_dict["features"]:
        assert "processing_support" in content_dict, "no processing support"
    content_dict["processing_support"] = string_to_list(
        content_dict.get("processing_support", "")
    )

    # interface language
    if "simulator" in content_dict["features"]:
        assert "interface_language" in content_dict, "no interface language"
    content_dict["interface_language"] = string_to_list(
        content_dict.get("interface_language", "")
    )

    # model description language
    content_dict["model_description_language"] = string_to_list(
        content_dict.get("model_description_language", "")
    )
    return content_dict


def parse_files(dirname=Path(__file__).parent / ".." / "simtools"):
    simulators = {}
    for f in get_files(dirname):
        try:
            content = parse_file(f)
        except Exception as e:
            raise ValueError(f"Error parsing {f}") from e
        # Store the filename itself
        content["filename"] = f.name
        simulators[content["name"]] = content

    # Verify that relations point to valid names
    for sim in simulators.values():
        for relation in sim.get("relations", []):
            if relation["name"] not in simulators:
                raise ValueError(
                    f"Unknown simulator '{relation['name']}' in relations of '{sim['name']}'"
                )
    return simulators


def unique_entries(
    simulators,
    fields=(
        "operating_system",
        "biological_level",
        "processing_support",
        "interface_language",
        "model_description_language",
    ),
):
    unique = {f: set() for f in fields}
    for sim in simulators.values():
        for f in fields:
            if sim.get(f, "") is None:
                print(sim)
            unique[f] |= set(sim.get(f, set()))
    unique = {f: sorted(unique[f]) for f in fields}
    return unique


if __name__ == "__main__":
    simulators = parse_files()
    import pprint

    pprint.pprint(simulators)

    print("unique entries per category:")
    pprint.pprint(unique_entries(simulators))
