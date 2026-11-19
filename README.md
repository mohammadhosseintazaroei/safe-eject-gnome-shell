# Safe Eject: GNOME Shell extension

A top-bar menu that lists your USB drives and ejects them safely with one click.

Companion to [safe-eject](https://github.com/mohammadhosseintazaroei/safe-eject): this extension is only the menu; the actual work (quit Files, sync, unmount, power off, never force) is done by the `safe-eject` command.

## What it does

- Adds an eject icon to the top bar.
- Click it to see the USB drives that are currently mounted.
- Click a drive to run `safe-eject /dev/sdX` for exactly that drive.
- If an application is still using the drive, you are told which one. Nothing is forced.

Works from anywhere, even when Files is not open.

## Requirements

- GNOME Shell 45, 46, 47 or 48 (Ubuntu 24.04 and newer)
- The [`safe-eject`](https://github.com/mohammadhosseintazaroei/safe-eject) command, **v1.3.0 or newer**

## Install

```bash
# 1. the safe-eject command (once)
git clone https://github.com/mohammadhosseintazaroei/safe-eject.git
(cd safe-eject && ./install.sh)

# 2. this extension
git clone https://github.com/mohammadhosseintazaroei/safe-eject-gnome-shell.git
cd safe-eject-gnome-shell
./install.sh
```

Then load it:

| Session | How |
|---|---|
| X11 | `Alt+F2`, type `r`, Enter |
| Wayland | log out and log back in |

and enable it:

```bash
gnome-extensions enable safe-eject@mohammadhosseintazaroei.github.io
```

You can also enable it in the *Extensions* app.

Check your session type with `echo $XDG_SESSION_TYPE`.

## Use

1. Click the eject icon in the top bar.
2. Click **Safe Eject: \<your drive\>**.
3. Wait for the notification, then unplug.

If no drive is mounted the menu says **No USB drive mounted**.

## Uninstall

```bash
./uninstall.sh
```

## Troubleshooting

**No icon after installing.** Reload the shell (see above) and make sure the extension is enabled: `gnome-extensions list --enabled`.

**"safe-eject command not found".** Install the main tool (step 1 above). It must be in your `PATH` or at `~/.local/bin/safe-eject`.

**Extension shows an error.** Look at the logs:

```bash
journalctl -f -o cat /usr/bin/gnome-shell
```

**It never lists my drive.** The drive must be USB and mounted. Check with `lsblk -o NAME,TRAN,MOUNTPOINTS`.

## How it works

On opening the menu it runs `lsblk -J` to find disks with a USB transport that have a mounted partition, and shows one entry per disk. Clicking an entry runs `safe-eject <device>`.

## Related

- [safe-eject](https://github.com/mohammadhosseintazaroei/safe-eject): the command-line tool and the Files right-click extension.

## License

[MIT](LICENSE) © 2026 Mohammad Hossein
