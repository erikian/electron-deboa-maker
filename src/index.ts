import MakerBase, { MakerOptions } from '@electron-forge/maker-base'
import { Deboa, IControlFileOptions, IDeboa } from 'deboa'

type DeboaOptions = Omit<IDeboa, 'sourceDir' | 'targetDir'>

/**
 * @property {Omit<IDeboa, 'sourceDir' | 'targetDir'>} deboaOptions - Options passed to the deboa constructor.
 * @see IDeboa
 */
interface IDeboaMakerOptions {
  /** @see IDeboa */
  deboaOptions: DeboaOptions
}

/**
 * Borrowed from
 * [electron-forge](https://github.com/electron-userland/electron-forge/blob/0490472f4978282c63b255e452e93aa8c3ee0e03/packages/maker/deb/src/MakerDeb.ts#L7)
 */
export function debianArch(nodeArch: string): string {
  switch (nodeArch) {
    case 'ia32':
      return 'i386'
    case 'x64':
      return 'amd64'
    case 'armv7l':
      return 'armhf'
    case 'arm':
      return 'armel'
    default:
      return nodeArch
  }
}

export default class DeboaMaker extends MakerBase<IDeboaMakerOptions> {
  get name(): string {
    return 'deboa'
  }

  isSupportedOnCurrentPlatform(): boolean {
    return true
  }

  get defaultPlatforms(): string[] {
    return ['linux']
  }

  async make(makeOptions: MakerOptions): Promise<string[]> {
    const {
      appName,
      dir,
      forgeConfig: {
        packagerConfig: { appVersion },
      },
      makeDir,
      packageJSON: {
        author,
        description,
        name,
        productName,
        version: packageJSONVersion,
      },
      targetArch,
    } = makeOptions

    const { deboaOptions = {} as DeboaOptions } = this.config || {}

    const {
      controlFileOptions = {} as IControlFileOptions,
      additionalTarEntries = [] as DeboaOptions['additionalTarEntries'],
      ...otherConfigOptions
    } = deboaOptions

    // @TODO fetch the dependencies for the depends/recommends/suggests fields dynamically if possible
    const {
      architecture,
      maintainer = author,
      packageName = name,
      shortDescription = description,
      version = appVersion || packageJSONVersion,
      section = 'utils',
      depends = [
        'libgtk-3-0',
        'libnotify4',
        'libnss3',
        'libxtst6',
        'xdg-utils',
        'libatspi2.0-0',
        'libdrm2',
        'libgbm1',
        'libxcb-dri3-0',
        'kde-cli-tools | kde-runtime | trash-cli | libglib2.0-bin | gvfs-bin',
      ],
      recommends = ['pulseaudio | libasound2'],
      suggests = [
        'gir1.2-gnomekeyring-1.0',
        'libgnome-keyring0',
        'lsb-release',
      ],
      ...otherControlFileOptions
    } = controlFileOptions

    const executableFiles = [
      `usr/lib/${packageName}/${appName}`,
      `usr/lib/${packageName}/libEGL.so`,
      `usr/lib/${packageName}/libGLESv2.so`,
      `usr/lib/${packageName}/libffmpeg.so`,
      `usr/lib/${packageName}/libvk_swiftshader.so`,
      `usr/lib/${packageName}/libvulkan.so`,
      `usr/lib/${packageName}/swiftshader/libEGL.so`,
      `usr/lib/${packageName}/swiftshader/libGLESv2.so`,
    ]

    const opts: IDeboa = {
      ...otherConfigOptions,
      additionalTarEntries: [
        // creates a symlink in /usr/bin
        {
          gname: 'root',
          linkname: `../lib/${packageName}/${appName}`,
          mode: parseInt('777', 8),
          name: `usr/bin/${packageName}`,
          type: 'symlink',
          uname: 'root',
        },
        ...additionalTarEntries,
      ],
      controlFileOptions: {
        architecture: debianArch(architecture || targetArch),
        depends,
        maintainer,
        packageName,
        recommends,
        section,
        shortDescription,
        suggests,
        version,
        ...otherControlFileOptions,
      },
      sourceDir: dir,
      targetDir: makeDir,
    }

    const deboa = new Deboa(opts)

    await deboa.loadHooks()

    const {
      beforeCreateDesktopEntry: originalBeforeCreateDesktopEntry,
      modifyTarHeader: originalModifyTarHeader,
    } = deboa

    // sets the right permissions for the executable files
    deboa.modifyTarHeader = header => {
      const { name } = header

      if (executableFiles.includes(name)) {
        header.mode = parseInt('0755', 8)
      }

      if (name === `usr/lib/${packageName}/chrome-sandbox`) {
        header.mode = parseInt('4755', 8)
      }

      if (typeof originalModifyTarHeader === 'function') {
        header = originalModifyTarHeader(header)
      }

      return header
    }

    deboa.beforeCreateDesktopEntry = async desktopEntries => {
      desktopEntries = {
        ...desktopEntries,
        Name: productName || packageName,
        Exec: `${packageName} %U`,
        StartupNotify: 'true',
        Categories: 'GNOME;GTK;Utility;',
      }

      if (typeof originalBeforeCreateDesktopEntry === 'function') {
        desktopEntries = await originalBeforeCreateDesktopEntry(desktopEntries)
      }

      return desktopEntries
    }

    const debLocation = await deboa.package()

    return [debLocation]
  }
}
