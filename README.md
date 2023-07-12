# SimSelect
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
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
      <td align="center" valign="top" width="14.28%"><a href="https://marcel.stimberg.info"><img src="https://avatars.githubusercontent.com/u/1381982?v=4?s=100" width="100px;" alt="Marcel Stimberg"/><br /><sub><b>Marcel Stimberg</b></sub></a><br /><a href="https://github.com/OCNS/simselect/commits?author=mstimberg" title="Code">💻</a> <a href="#infra-mstimberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#content-mstimberg" title="Content">🖋</a> <a href="#data-mstimberg" title="Data">🔣</a> <a href="#maintenance-mstimberg" title="Maintenance">🚧</a> <a href="#design-mstimberg" title="Design">🎨</a> <a href="#ideas-mstimberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#projectManagement-mstimberg" title="Project Management">📆</a> <a href="#research-mstimberg" title="Research">🔬</a> <a href="https://github.com/OCNS/simselect/pulls?q=is%3Apr+reviewed-by%3Amstimberg" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/OCNS/simselect/commits?author=mstimberg" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ree-gupta"><img src="https://avatars.githubusercontent.com/u/59512969?v=4?s=100" width="100px;" alt="Reema Gupta"/><br /><sub><b>Reema Gupta</b></sub></a><br /><a href="https://github.com/OCNS/simselect/commits?author=ree-gupta" title="Code">💻</a> <a href="#content-ree-gupta" title="Content">🖋</a> <a href="#data-ree-gupta" title="Data">🔣</a> <a href="#maintenance-ree-gupta" title="Maintenance">🚧</a> <a href="#design-ree-gupta" title="Design">🎨</a> <a href="#ideas-ree-gupta" title="Ideas, Planning, & Feedback">🤔</a> <a href="#projectManagement-ree-gupta" title="Project Management">📆</a> <a href="#research-ree-gupta" title="Research">🔬</a> <a href="https://github.com/OCNS/simselect/pulls?q=is%3Apr+reviewed-by%3Aree-gupta" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/OCNS/simselect/commits?author=ree-gupta" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dissagaliyeva"><img src="https://avatars.githubusercontent.com/u/80033932?v=4?s=100" width="100px;" alt="Dinara Issagaliyeva"/><br /><sub><b>Dinara Issagaliyeva</b></sub></a><br /><a href="https://github.com/OCNS/simselect/commits?author=dissagaliyeva" title="Code">💻</a> <a href="#design-dissagaliyeva" title="Design">🎨</a> <a href="#ideas-dissagaliyeva" title="Ideas, Planning, & Feedback">🤔</a> <a href="#projectManagement-dissagaliyeva" title="Project Management">📆</a> <a href="#research-dissagaliyeva" title="Research">🔬</a></td>
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
