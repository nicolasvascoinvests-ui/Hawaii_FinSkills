/**
 * Expo config plugin: install a custom Android network_security_config.xml
 * and reference it from AndroidManifest.xml.
 *
 * - Copies ./network_security_config.xml into android/app/src/main/res/xml/
 * - Adds android:networkSecurityConfig="@xml/network_security_config" to
 *   the <application> element.
 */
const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withNetworkSecurityConfigFile(config) {
  return withDangerousMod(config, [
    'android',
    async (mod) => {
      const src = path.resolve(mod.modRequest.projectRoot, 'network_security_config.xml');
      const destDir = path.join(
        mod.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'res',
        'xml'
      );
      const dest = path.join(destDir, 'network_security_config.xml');
      if (!fs.existsSync(src)) {
        throw new Error(`withNetworkSecurityConfig: missing source file ${src}`);
      }
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, dest);
      return mod;
    },
  ]);
}

function withNetworkSecurityConfigManifest(config) {
  return withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application?.[0];
    if (app) {
      app.$ = app.$ || {};
      app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    }
    return mod;
  });
}

module.exports = function withNetworkSecurityConfig(config) {
  config = withNetworkSecurityConfigFile(config);
  config = withNetworkSecurityConfigManifest(config);
  return config;
};
