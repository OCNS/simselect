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
