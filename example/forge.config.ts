import type { IDeboaMakerOptions } from 'electron-deboa-maker'
import type { ForgeConfig } from '@electron-forge/shared-types'

const deboaConfig: IDeboaMakerOptions = {
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

const forgeConfig: ForgeConfig = {
  packagerConfig: {
    ignore: [
      /^(\/build)/,
      /^(\/out$)/,
      /.gitignore/,
      /.idea/,
      /.vscode/,
      /forge.config.ts/,
      /yarn-error.log/,
      /yarn.lock/,
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

export default forgeConfig
