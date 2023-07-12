# SimSelect
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

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
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.shailesh-appukuttan.com/"><img src="https://avatars.githubusercontent.com/u/24866517?v=4?s=100" width="100px;" alt="appukuttan-shailesh"/><br /><sub><b>appukuttan-shailesh</b></sub></a><br /><a href="#maintenance-appukuttan-shailesh" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://marcel.stimberg.info"><img src="https://avatars.githubusercontent.com/u/1381982?v=4?s=100" width="100px;" alt="Marcel Stimberg"/><br /><sub><b>Marcel Stimberg</b></sub></a><br /><a href="https://github.com/OCNS/simselect/commits?author=mstimberg" title="Code">💻</a> <a href="#infra-mstimberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#content-mstimberg" title="Content">🖋</a> <a href="#data-mstimberg" title="Data">🔣</a> <a href="#maintenance-mstimberg" title="Maintenance">🚧</a> <a href="#design-mstimberg" title="Design">🎨</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
