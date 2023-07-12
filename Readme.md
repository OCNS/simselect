# SimSelect

[![All Contributors](https://img.shields.io/github/all-contributors/OCNS/simselect?color=ee8449&style=flat-square)](#contributors)


**This is a work-in-progress and in pre-alpha state at the moment**

This is a project by the [OCNS/INCF software working group](https://ocns.github.io/SoftwareWG/index.html),
aiming to build an easy-to-use tool for finding a suitable computational neuroscience
simulator. See OCNS/SoftwareWG#117 For more details, and announcements of the regular
meetings.

## Development notes
A fresh virtual environment is suggested for development:
```
python -m venv .venv
source .venv/bin/activate
```
One can also use `conda` and other tools to set up virtual environments.

This project is an app built using [Holoviz Panel](https://panel.holoviz.org/).
You can install it using
```
python -m pip install -r requirements.txt
```
To run the app, use:
```
panel serve --show src/project_browser.py --static-files assets=./assets
```
This will open a browser window with the app.
Firefox/Chrome based browsers are supported.
Please file an issue if the app does not work with your browser.

### Contribution notes
Please install the necessary linters/pre-commit hooks using the `requirements-dev.txt` file:

```
python -m pip install -r requirements-dev.txt
```

To set up pre-commit, please run (only needed once):

```
pre-commit install
```

Now, the pre-commit checks will be run before each commit.

## Deployment
The web app is hosted on [fly.io](https://fly.io/). See https://simselect.fly.dev/ for the latest version.


## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
