# SimSelect
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

**This is a work-in-progress and in pre-alpha state at the moment**

This is a project by the [OCNS/INCF software working group](https://ocns.github.io/SoftwareWG/index.html),
aiming to build an easy-to-use tool for finding a suitable computational neuroscience
simulator. See OCNS/SoftwareWG#117 For more details, and announcements of the regular
meetings.

## Development notes
The website is built with ["vanilla JS"](http://vanilla-js.com/) and uses the [cytoscape.js](https://js.cytoscape.org/)
library for graph visualisation. The full code runs in the browser, but in order to make it able to access the data, it
needs to run in a local webserver. You can either use such a webserver as provided by your IDE (e.g. the
[Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)) for VS Code,
or use Python's built-in webserver:
```
python -m http.server
```

Python is also used to pre-process and validate the data when simulator descriptions are changed in one of the YAML files.

If you want to work on that part, we suggest a virtual environment for development:
```
python -m venv .venv
source .venv/bin/activate
```
One can also use `conda` and other tools to set up virtual environments.

To install the dependencies, you can use:
```
python -m pip install -r requirements.txt
```



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
The website is hosted on https://ocns.github.io/simselect

## Dependencies
The layout is using the fCoSE algorithm by the [i-Vis Research Lab at Bilkent University](http://www.cs.bilkent.edu.tr/~ivis/).
The files in the `assets/js` directory are minified versions of the original files, licensed under the [MIT license](LICENSE.MIT).

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.shailesh-appukuttan.com/"><img src="https://avatars.githubusercontent.com/u/24866517?v=4?s=100" width="100px;" alt="appukuttan-shailesh"/><br /><sub><b>appukuttan-shailesh</b></sub></a><br /><a href="#maintenance-appukuttan-shailesh" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://marcel.stimberg.info"><img src="https://avatars.githubusercontent.com/u/1381982?v=4?s=100" width="100px;" alt="Marcel Stimberg"/><br /><sub><b>Marcel Stimberg</b></sub></a><br /><a href="https://github.com/OCNS/simselect/commits?author=mstimberg" title="Code">💻</a> <a href="#infra-mstimberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#content-mstimberg" title="Content">🖋</a> <a href="#data-mstimberg" title="Data">🔣</a> <a href="#maintenance-mstimberg" title="Maintenance">🚧</a> <a href="#design-mstimberg" title="Design">🎨</a> <a href="#ideas-mstimberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#projectManagement-mstimberg" title="Project Management">📆</a> <a href="#research-mstimberg" title="Research">🔬</a> <a href="https://github.com/OCNS/simselect/pulls?q=is%3Apr+reviewed-by%3Amstimberg" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/OCNS/simselect/commits?author=mstimberg" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/dissagaliyeva"><img src="https://avatars.githubusercontent.com/u/80033932?v=4?s=100" width="100px;" alt="Dinara Issagaliyeva"/><br /><sub><b>Dinara Issagaliyeva</b></sub></a><br /><a href="https://github.com/OCNS/simselect/commits?author=dissagaliyeva" title="Code">💻</a> <a href="#design-dissagaliyeva" title="Design">🎨</a> <a href="#ideas-dissagaliyeva" title="Ideas, Planning, & Feedback">🤔</a> <a href="#projectManagement-dissagaliyeva" title="Project Management">📆</a> <a href="#research-dissagaliyeva" title="Research">🔬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/elianecr"><img src="https://avatars.githubusercontent.com/u/80128318?v=4?s=100" width="100px;" alt="Eliane Crepaldi Rodrigues"/><br /><sub><b>Eliane Crepaldi Rodrigues</b></sub></a><br /><a href="#design-elianecr" title="Design">🎨</a> <a href="#content-elianecr" title="Content">🖋</a> <a href="#data-elianecr" title="Data">🔣</a> <a href="#ideas-elianecr" title="Ideas, Planning, & Feedback">🤔</a> <a href="#projectManagement-elianecr" title="Project Management">📆</a> <a href="#research-elianecr" title="Research">🔬</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://brent.huisman.pl"><img src="https://avatars.githubusercontent.com/u/2943652?v=4?s=100" width="100px;" alt="Brent Huisman"/><br /><sub><b>Brent Huisman</b></sub></a><br /><a href="https://github.com/OCNS/simselect/commits?author=brenthuisman" title="Code">💻</a> <a href="#content-brenthuisman" title="Content">🖋</a> <a href="#data-brenthuisman" title="Data">🔣</a> <a href="#maintenance-brenthuisman" title="Maintenance">🚧</a> <a href="#design-brenthuisman" title="Design">🎨</a> <a href="#ideas-brenthuisman" title="Ideas, Planning, & Feedback">🤔</a> <a href="#projectManagement-brenthuisman" title="Project Management">📆</a> <a href="#research-brenthuisman" title="Research">🔬</a> <a href="https://github.com/OCNS/simselect/pulls?q=is%3Apr+reviewed-by%3Abrenthuisman" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/OCNS/simselect/commits?author=brenthuisman" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ree-gupta"><img src="https://avatars.githubusercontent.com/u/59512969?v=4?s=100" width="100px;" alt="Reema Gupta"/><br /><sub><b>Reema Gupta</b></sub></a><br /><a href="https://github.com/OCNS/simselect/commits?author=ree-gupta" title="Code">💻</a> <a href="#content-ree-gupta" title="Content">🖋</a> <a href="#data-ree-gupta" title="Data">🔣</a> <a href="#maintenance-ree-gupta" title="Maintenance">🚧</a> <a href="#design-ree-gupta" title="Design">🎨</a> <a href="#ideas-ree-gupta" title="Ideas, Planning, & Feedback">🤔</a> <a href="#projectManagement-ree-gupta" title="Project Management">📆</a> <a href="#research-ree-gupta" title="Research">🔬</a> <a href="https://github.com/OCNS/simselect/pulls?q=is%3Apr+reviewed-by%3Aree-gupta" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/OCNS/simselect/commits?author=ree-gupta" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://ankursinha.in/"><img src="https://avatars.githubusercontent.com/u/102575?v=4?s=100" width="100px;" alt="Ankur Sinha"/><br /><sub><b>Ankur Sinha</b></sub></a><br /><a href="https://github.com/OCNS/simselect/commits?author=sanjayankur31" title="Code">💻</a> <a href="#content-sanjayankur31" title="Content">🖋</a> <a href="#data-sanjayankur31" title="Data">🔣</a> <a href="#maintenance-sanjayankur31" title="Maintenance">🚧</a> <a href="#design-sanjayankur31" title="Design">🎨</a> <a href="#ideas-sanjayankur31" title="Ideas, Planning, & Feedback">🤔</a> <a href="#projectManagement-sanjayankur31" title="Project Management">📆</a> <a href="#research-sanjayankur31" title="Research">🔬</a> <a href="https://github.com/OCNS/simselect/pulls?q=is%3Apr+reviewed-by%3Asanjayankur31" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/OCNS/simselect/commits?author=sanjayankur31" title="Tests">⚠️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/clinssen"><img src="https://avatars.githubusercontent.com/u/41159823?v=4?s=100" width="100px;" alt="clinssen"/><br /><sub><b>clinssen</b></sub></a><br /><a href="#content-clinssen" title="Content">🖋</a> <a href="#data-clinssen" title="Data">🔣</a></td>
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
