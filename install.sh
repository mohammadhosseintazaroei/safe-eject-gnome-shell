#!/bin/bash
# Installs the Safe Eject GNOME Shell extension for the current user.
set -eu

UUID="safe-eject@mohammadhosseintazaroei.github.io"
HERE="$(cd "$(dirname "$0")" && pwd)"
DEST="${HOME}/.local/share/gnome-shell/extensions/${UUID}"

if ! command -v safe-eject >/dev/null && [ ! -x "${HOME}/.local/bin/safe-eject" ]; then
  echo "The 'safe-eject' command is required but not installed."
  echo "Install it from https://github.com/mohammadhosseintazaroei/safe-eject (v1.3.0 or newer), then run this script again."
  exit 1
fi

mkdir -p "$DEST"
install -m 644 "$HERE/metadata.json" "$HERE/extension.js" "$DEST/"

echo "Installed to $DEST"
echo
echo "Load it:"
echo "  X11:     press Alt+F2, type r, press Enter"
echo "  Wayland: log out and log back in"
echo "Then enable it:"
echo "  gnome-extensions enable ${UUID}"
