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
- operating_system: Linux, MacOS
- biological_level: Population Model, Single-Compartment (Simple) Model, Single-Compartment (Complex) Model, Multi-Compartment Model
- computing_scale: Single Machine, Cluster, Supercomputer, GPU
- interface_language: Python
- model_description_language: NeuroML2
- summary: This simulator is very good.
- urls:
    homepage: https://example.com
    email: contact@example.com
- relations:
      - name: Another simulator
      - name: Yet another simulator
```
The fields `operating_system`, `biological_level`, `computing_scale`,
`interface_language`, and `model_description_language` are comma-separated
strings (i.e. not yaml lists).

The `urls` field can contain arbitrary keys that will be displayed as button
labels. A  number of names will be recognized and will be displayed with a
special icon: `homepage`, `source`, `documentation`, `issue tracker`,
`download`, `release notes`, `email`, `chat`, and `forum`. The `email` field
should refer to  an email address (which will be converted into a `mailto:`
link), all other  fields should give a full URL.

Relations are a list of other simulators that are related to the current
simulator. The mentioned `name` needs to match the `name` of another simulator
in the directory.
