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


### Updating software tool metadata

Data on each tool is included in individual files in the `simselect` directory.
To make changes, please fork the repository, make any necessary changes, and open pull requests for community review.

### Deployment
The web app is hosted on [fly.io](https://fly.io/). It gets deployed automatically
via a [GitHub Action](.github/workflows/deploy.yml). When a pull request is merged into ``main``, it will be deployed
to https://simselect-dev.fly.dev. A tagged release will be deployed to https://simselect.fly.dev.
