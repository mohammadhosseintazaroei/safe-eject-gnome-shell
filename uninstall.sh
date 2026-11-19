#!/bin/bash
# Removes the Safe Eject GNOME Shell extension (the safe-eject command stays).
set -eu
UUID="safe-eject@mohammadhosseintazaroei.github.io"
gnome-extensions disable "$UUID" 2>/dev/null || true
rm -rf "${HOME}/.local/share/gnome-shell/extensions/${UUID}"
echo "Removed. Restart GNOME Shell (X11: Alt+F2, r; Wayland: log out/in)."
