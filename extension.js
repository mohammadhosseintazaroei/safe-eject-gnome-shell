import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

function findSafeEject() {
    const inPath = GLib.find_program_in_path('safe-eject');
    if (inPath)
        return inPath;
    const local = GLib.build_filenamev([GLib.get_home_dir(), '.local', 'bin', 'safe-eject']);
    return GLib.file_test(local, GLib.FileTest.IS_EXECUTABLE) ? local : null;
}

// Returns [{name, label}] for USB disks that have a mounted partition.
async function listUsbDrives() {
    const proc = Gio.Subprocess.new(
        ['lsblk', '-J', '-p', '-o', 'NAME,TYPE,TRAN,MODEL,SIZE,MOUNTPOINTS'],
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_SILENCE);
    const [, stdout] = await new Promise((resolve, reject) => {
        proc.communicate_utf8_async(null, null, (p, res) => {
            try {
                resolve(p.communicate_utf8_finish(res));
            } catch (e) {
                reject(e);
            }
        });
    });

    const mounted = dev =>
        (dev.mountpoints ?? []).some(m => m) ||
        (dev.children ?? []).some(mounted);

    const drives = [];
    for (const dev of JSON.parse(stdout).blockdevices ?? []) {
        if (dev.type === 'disk' && dev.tran === 'usb' && mounted(dev)) {
            const model = (dev.model ?? '').trim() || dev.name;
            drives.push({name: dev.name, label: `${model} (${dev.size})`});
        }
    }
    return drives;
}

const Indicator = GObject.registerClass(
class SafeEjectIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Safe Eject');
        this.add_child(new St.Icon({
            icon_name: 'media-eject-symbolic',
            style_class: 'system-status-icon',
        }));
        this.menu.connect('open-state-changed', (_menu, open) => {
            if (open)
                this._refresh();
        });
        this._refresh();
    }

    async _refresh() {
        this.menu.removeAll();
        let drives = [];
        try {
            drives = await listUsbDrives();
        } catch (e) {
            console.error(`safe-eject: ${e}`);
        }

        // The menu may have been destroyed while lsblk ran.
        if (!this.menu)
            return;
        this.menu.removeAll();

        if (!findSafeEject()) {
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(
                'safe-eject command not found', {reactive: false}));
            return;
        }
        if (drives.length === 0) {
            this.menu.addMenuItem(new PopupMenu.PopupMenuItem(
                'No USB drive mounted', {reactive: false}));
            return;
        }
        for (const drive of drives) {
            const item = new PopupMenu.PopupImageMenuItem(
                `Safe Eject: ${drive.label}`, 'media-eject-symbolic');
            item.connect('activate', () => this._eject(drive.name));
            this.menu.addMenuItem(item);
        }
    }

    _eject(device) {
        const cmd = findSafeEject();
        if (!cmd) {
            Main.notify('Safe Eject', 'safe-eject command not found');
            return;
        }
        try {
            Gio.Subprocess.new([cmd, device], Gio.SubprocessFlags.NONE);
        } catch (e) {
            Main.notify('Safe Eject', `${e.message}`);
        }
    }
});

export default class SafeEjectExtension extends Extension {
    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}
