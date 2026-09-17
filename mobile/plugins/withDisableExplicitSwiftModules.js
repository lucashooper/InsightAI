const { withXcodeProject } = require('@expo/config-plugins');

/**
 * Xcode 26 turns on explicit Swift modules, which makes the app target
 * require CocoaPods .modulemap files before those pods have compiled.
 * That shows up as SwiftGeneratePch + "No such module 'Expo'".
 */
function withDisableExplicitSwiftModules(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const configurations = project.pbxXCBuildConfigurationSection();
    for (const key of Object.keys(configurations)) {
      const item = configurations[key];
      if (item && typeof item === 'object' && item.buildSettings) {
        item.buildSettings.SWIFT_ENABLE_EXPLICIT_MODULES = 'NO';
      }
    }

    const first = project.getFirstTarget();
    if (first?.uuid) {
      const existing = project.hash.project.objects.PBXShellScriptBuildPhase || {};
      const already = Object.values(existing).some(
        (phase) => phase && phase.name === '[Insight] Stage CocoaPods modulemaps'
      );
      if (!already) {
        project.addBuildPhase(
          [],
          'PBXShellScriptBuildPhase',
          '[Insight] Stage CocoaPods modulemaps',
          first.uuid,
          {
            shellPath: '/bin/sh',
            shellScript: '"${SRCROOT}/../scripts/stage-pod-modulemaps.sh"\n',
          }
        );
      }
    }
    return config;
  });
}

module.exports = withDisableExplicitSwiftModules;
