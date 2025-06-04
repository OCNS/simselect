import json
import urllib
import yaml
import pathlib

import feedparser
from packaging.version import Version

# Go through the yaml files
simtools_dir = pathlib.Path("simtools")
yaml_files = simtools_dir.glob("**/*.yaml")
for yaml_file in yaml_files:
    with open(yaml_file, "r") as file:
        data = yaml.safe_load(file)
    name = data["name"]
    release_info = data.get("release", {})
    if (
        release_info.get("source", None) == "pypi"
    ):  # Only source supported at the moment
        current_version = Version(release_info.get("version", "0"))
        package_name = release_info.get("package_name", name)
        etag = release_info.get("etag", None)
        print(f"Checking updates for '{name}', latest known version: {current_version}")
        pypi_feed = feedparser.parse(
            f"https://pypi.org/rss/project/{package_name}/releases.xml", etag=etag
        )
        if pypi_feed.status == 304:
            print("  PyPI feed has not changed")
            continue
        # Go through entries until finding a version that is not a dev release or pre-release
        for entry in pypi_feed.entries:
            entry_version = Version(entry.title)
            if entry_version.is_prerelease or entry_version.is_devrelease:
                continue
            if entry_version > current_version:
                print(f"  New version found: {entry_version}")
                release_info["version"] = str(entry_version)
                release_info["published"] = (
                    f"{entry.published_parsed.tm_year}-{entry.published_parsed.tm_mon:02d}-{entry.published_parsed.tm_mday:02d}"
                )
                release_info["etag"] = pypi_feed.etag
                with open(yaml_file, "w") as file:
                    yaml.safe_dump(data, file, sort_keys=False)
                break
        else:
            print(f"  No new version found for '{name}'")
    elif release_info.get("source", None) == "github":
        current_version = Version(release_info.get("version", "0"))
        repo_name = release_info.get("repository", name)
        etag = release_info.get("etag", None)
        print(f"Checking updates for '{name}', latest known version: {current_version}")
        request = urllib.request.Request(
            f"https://api.github.com/repos/{repo_name}/releases/latest",
            headers={"Accept": "application/vnd.github+json"},
        )
        response = urllib.request.urlopen(request)
        if response.status == 304:
            print("  GitHub releases feed has not changed")
            continue
        releases = json.loads(response.read().decode("utf-8"))
        if "tag_name" in releases:
            entry_version = Version(releases["tag_name"])
            if entry_version.is_prerelease or entry_version.is_devrelease:
                print(f"  Skipping pre-release version: {entry_version}")
                continue
            if entry_version > current_version:
                print(f"  New version found: {entry_version}")
                release_info["version"] = str(entry_version)
                release_date = releases.get("created_at", "")[:10]  # only date
                release_info["published"] = release_date
                release_info["etag"] = response.headers.get("ETag")
                with open(yaml_file, "w") as file:
                    yaml.safe_dump(data, file, sort_keys=False)
        else:
            print(f"  No new version found for '{name}'")
    else:
        print(f"Skipping '{name}' as it is not on PyPI or GitHub")
