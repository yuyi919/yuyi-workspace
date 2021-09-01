export type RushJson = {
  $schema: string;
  rushVersion: string;
  pnpmVersion: string;
  pnpmOptions: {
    pnpmStore?: "global" | "local";
    strictPeerDependencies?: boolean;
    useWorkspaces?: boolean;
  };
  nodeSupportedVersionRange: string;
  projectFolderMaxDepth?: number;
  approvedPackagesPolicy: {
    reviewCategories: ("default" | "production" | "tools" | "prototypes" | (string & {}))[];
    ignoredNpmScopes: ("@types" | "@babel" | "@vitejs" | (string & {}))[];
  };
  gitPolicy: Record<string, any>;
  repository: Record<string, any>;
  /**
   * Event hooks are customized script actions that Rush executes when specific events occur
   */
  eventHooks: {
    /**
     * The list of shell commands to run before the Rush installation starts
     */
    preRushInstall: string[];
    /**
     * The list of shell commands to run after the Rush installation finishes
     */
    postRushInstall: string[];
    /**
     * The list of shell commands to run before the Rush build command starts
     */
    preRushBuild: string[];
    /**
     * The list of shell commands to run after the Rush build command finishes
     */
    postRushBuild: string[];
  };
  variants: {
    /**
     * The folder name for this variant.
     */
    variantName: string;

    /**
     * An informative description
     */
    description?: string;
  }[];
  projects: {
    packageName: string;
    projectFolder: string;
    cyclicDependencyProjects?: string[];
    reviewCategory?: string;
  }[];
};
