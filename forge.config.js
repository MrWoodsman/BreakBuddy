// forge.config.js
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
makers: [
    // BLOK MAKER-SQUIRREL POZOSTAJE USUNIĘTY (dla budowania na Macu)

    {
      // Ten maker stworzy plik .zip DLA WINDOWS
      name: '@electron-forge/maker-zip',
      platforms: ['win32'], 
    },
    {
      // --- NOWA ZMIANA ---
      // Ten maker stworzy obraz dysku .dmg DLA MACOS
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        // Opcjonalnie: możesz tu dodać tło, ikony itp.
        // background: './assets/dmg-background.png',
        // format: 'ULFO'
      }
    },
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      platforms: ['linux'],
      config: {},
    },
  ],
  plugins: [
    // ... Twoje pluginy Fuses zostają bez zmian
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};