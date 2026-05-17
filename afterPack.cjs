/**
 * electron-builder afterPack hook — runs after packaging, before signing.
 *
 * Flips the EnableEmbeddedAsarIntegrityValidation fuse to OFF so that
 * unsigned builds do not crash during the early ASAR integrity check that
 * Electron 30+ performs before any JavaScript runs.
 */
const { flipFuses, FuseVersion, FuseV1Options } = require('@electron/fuses');
const path = require('path');

exports.default = async function afterPack(context) {
  const { appOutDir, packager } = context;
  const appName = packager.appInfo.productFilename;
  const electronPath = path.join(
    appOutDir,
    `${appName}.app`,
    'Contents', 'MacOS', appName
  );

  console.log(`  • flipping fuses on ${electronPath}`);

  await flipFuses(electronPath, {
    version: FuseVersion.V1,
    [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
  });

  console.log('  • ASAR integrity validation disabled');
};
