# SimSelect

**This is a work-in-progress and in pre-alpha state at the moment**

This is a project by the [OCNS/INCF software working group](https://ocns.github.io/SoftwareWG/index.html),
aiming to build an easy-to-use tool for finding a suitable computational neuroscience
simulator. See OCNS/SoftwareWG#117 For more details, and announcements of the regular
meetings.

## Development notes
This project is an app built using [Holoviz Panel](https://panel.holoviz.org/). You can
install it using `python -n pip install -r requirements.txt`.

To run the app, use `panel serve --show src/project_browser`. This will open a
browser window with the app.

## Deployment
The web app is hosted on [fly.io](https://fly.io/). See https://simselect.fly.dev/ for the latest version.
