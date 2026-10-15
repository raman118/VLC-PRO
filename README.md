# VLC-PRO

VLC-PRO is a customized fork of VLC media player. It keeps VLC's media playback engine and adds a Qt interface with two configurable movie website shortcuts, plus a separate movie discovery site in `movies-site/`.

## VLC-PRO additions

- The Movies navigation item offers **Nightflix** and **CineHD** in the embedded browser.
- The two destinations can be changed with the Qt options `qt-movies-url` and `qt-movies-alt-url`.
- `movies-site/` contains a static movie discovery site with TMDB metadata and a public domain film section. See its [setup guide](movies-site/README.md).

## Build

Follow [INSTALL.md](INSTALL.md) for the build requirements and instructions. VLC-PRO uses the VLC source tree and build system.

## Upstream source and license

The player code is based on VLC media player, developed by the VideoLAN community and VLC contributors. Existing source copyright notices and author credits are retained. VLC is distributed under GPL-2.0-or-later; libVLC uses LGPL-2.0-or-later. See [COPYING](COPYING), [COPYING.LIB](COPYING.LIB), and the notices in individual source files.

VLC-PRO-specific changes are recorded in this repository's Git history. VLC-PRO is an independent fork and is not an official VideoLAN release.

## Project references

- [VLC upstream project](https://www.videolan.org/vlc/)
- [VideoLAN source repository](https://code.videolan.org/videolan/vlc/)
- [Movie site setup](movies-site/README.md)
