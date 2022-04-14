import { RushConfiguration } from "@microsoft/rush-lib";

export function loadRushPackages(path = RushConfiguration.tryFindRushJsonLocation()) {
  const rushConfig = RushConfiguration.loadFromConfigurationFile(path);
  return {
    path,
    generator: function* () {
      for (const project of rushConfig.projects) {
        yield project;
      }
    }
  };
}
