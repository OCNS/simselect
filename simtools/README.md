This folder contains one file for each simulator. The file `simtools.yaml` is
ignored. (It is a file with information that was gathered previously and is now
replaced by the  individual files. As soon as all the information is
transferred, the file will be deleted.)

The file for each simulator should have a name that is the same as the name of
the simulator, avoiding spaces. Each file is a `YAML` file with the following
structure (additional fields not mentioned below will be ignored; the values
shown below are obviously example values):

```yaml
- name: Simulator Name
- features: frontend, simulator
- operating_system: Linux, MacOS
- biological_level: Population Model, Single-Compartment (Simple) Model, Single-Compartment (Complex) Model, Multi-Compartment Model
- processing_support: Single Machine, Cluster, Supercomputer, GPU
- interface_language: Python
- model_description_language: NeuroML/LEMS
- summary: This simulator is very good.
- urls:
    homepage: https://example.com
    email: contact@example.com
- relations:
      - name: Another simulator
        description: exports to
      - name: Yet another simulator
        description: imports from
```
The fields `features`, `operating_system`, `biological_level`,
`processing_support`, `interface_language`, and `model_description_language`
are comma-separated strings (i.e. not yaml lists).

The `features` fields should contain one or more of the following values: `frontend` (for
interfaces to simulation engines), `simulator` (for simulation engines), `standard`
(for interoperability standards, APIs, etc.), or `tool` (for a general tool).
Only tools that are simulators should contain the `biological_level` and
`processing_support` fields.

The `urls` field contains entries that will be displayed as button labels. The
following names are recognized: `documentation`, `installation`, `tutorial`,
`examples`, `email`, `chat`, `forum`, `issue tracker`, `source`, `download`.
The `email` field  should refer to  an email address (which will be converted
into a `mailto:` link), all other  fields should give a full URL.

Relations are a relationships between tools. The mentioned `name` needs to
match the `name` of another simulator in the directory. The `description` of
the relationship is currently a free-form string.
