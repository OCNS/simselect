#!/bin/bash

# script to watch source directory for changes, and re-run build and preview

previewpidfile="preview.pid"

# 4913: for vim users, vim creates a temporary file to test it can write to
# directory
# https://groups.google.com/g/vim_dev/c/sppdpElxY44
# .git: so we don't get rebuilds each time git metadata changes
inotifyignore="\.git.*|4913"

watch_and_preview () {
    if ! command -v inotifywait > /dev/null
    then
        echo "inotifywait command could not be found. Please install inotify-tools."
        echo "On Fedora, run: sudo dnf install inotify-tools"
        echo "On *buntu, run: sudo apt-get install inotify-tools"
        stop_preview_and_exit
    else
        # check for git
        # required to get ignorelist
        if ! command -v git > /dev/null
        then
            echo "git command could not be found. Please install git."
            echo "On Fedora, run: sudo dnf install git-core"
            stop_preview_and_exit
        else
            # Get files not being tracked, we don't watch for changes in these.
            # Could hard code, but people use different editors that may create
            # temporary files that are updated regularly and so on, so better
            # to get the list from git. It'll also look at global gitingore
            # settings and so on.
            inotifyignore="$(git status -s --ignored | grep '^!!' | sed -e 's/^!! //' | tr '\n' '|')${inotifyignore}"
        fi

        while true
        do
            echo "Watching current directory (excluding: ${inotifyignore}) for changes and re-building as required. Use Ctrl C to stop."
            inotifywait -q --exclude "($inotifyignore)" -e modify,create,delete,move -r . && echo "Change detected, rebuilding.." && start_preview
        done
    fi
}

start_preview (){
    stop_preview

    if ! command -v panel > /dev/null
    then
        echo "panel command was not found. Please see the README file to set up your environment."
        stop_preview_and_exit
    else
        panel serve src/project_browser.py &
        echo "$!" > "${previewpidfile}"
    fi
}


stop_preview () {
    if [ -e "${previewpidfile}" ]
    then
        PID=$(cat "${previewpidfile}")
        kill $PID
        echo "Stopping preview server (running with PID ${PID}).."
        rm -f "${previewpidfile}"
    else
        echo "No running preview server found to stop: no ${previewpidfile} file found."
    fi
}

stop_preview_and_exit ()
{
    # stop and also exit the script

    # if stop_preview is trapped, then SIGINT doesn't stop the build loop. So
    # we need to make sure we also exit the script.

    # stop_preview is called before other functions, so we cannot add exit to
    # it.
    stop_preview
    exit 0
}


trap stop_preview_and_exit INT
start_preview
watch_and_preview
stop_preview
