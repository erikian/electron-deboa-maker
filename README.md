electron-deboa-maker
===========

electron-deboa-maker is a maker for [Electron Forge](https://github.com/electron-userland/electron-forge) that enables
it to create a .deb package for your Electron app on Windows, Linux and macOS. It
uses [deboa](https://github.com/erikian/deboa) under the hood to build the .deb package.

# Features

- Supports compression in .tar, .tar.gz or .tar.xz
- Support for icon and desktop specification file
- Symlink creation and granular control over chmod permissions at build time, even on Windows

# Installation

```shell
# Yarn
yarn add --dev electron-deboa-maker

# npm
npm i -D electron-deboa-maker
```

# Usage

> Please refer to Electron Forge's [docs](https://www.electronforge.io/configuration) for more details on how to write
> your configuration. You can also check out
> the example Electron app [here](https://github.com/erikian/electron-deboa-maker/tree/main/example).

`package.json`:

```json
{
  "name": "my-awesome-app",
  "productName": "My Awesome App",
  "version": "1.0.0",
  "description": "My Electron application description",
  "main": "src/index.js",
  "scripts": {
    "makedeb": "electron-forge make --platform=linux"
  },
  "config": {
    "forge": {
      "packagerConfig": {
        "name": "my-awesome-app"
      },
      "makers": [
        {
          "name": "electron-deboa-maker",
          "config": {
            "deboaOptions": {
              "icon": "./build/icon.png",
              "beforeCreateDesktopEntry": "./build/beforeDesktopEntry.js",
              "controlFileOptions": {
                "maintainer": "Erik Moura",
                "homepage": "https://www.example.com",
                "maintainerScripts": {
                  "postrm": "./build/postrm"
                }
              },
              "tarballFormat": "tar.xz"
            }
          }
        }
      ]
    }
  }
}
```

To create your .deb file, run the `makedeb` script.

You can check all the available options on [deboa's docs](https://github.com/erikian/deboa#additional-options).
