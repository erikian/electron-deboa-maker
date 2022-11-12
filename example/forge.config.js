/** @type import('electron-deboa-maker').IDeboaMakerOptions */
const deboaConfig = {
  deboaOptions: {
    icon: './build/icon.png',
    beforeCreateDesktopEntry: './build/beforeDesktopEntry.js',
    controlFileOptions: {
      maintainer: 'Erik Moura',
      homepage: 'https://www.example.com',
      maintainerScripts: {
        postrm: './build/postrm',
      },
    },
    tarballFormat: 'tar.xz',
  },
}

/** @type import('@electron-forge/shared-types').ForgeConfig */
module.exports = {
  packagerConfig: {
    ignore: [
      '^(/build)',
      '^(/out$)',
      '.gitignore',
      '.idea',
      '.vscode',
      'yarn-error.log',
      'yarn.lock',
    ],
    name: 'my-awesome-app',
  },
  makers: [
    {
      name: 'electron-deboa-maker',
      config: deboaConfig,
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'Erik Moura',
      },
    },
  ],
}
