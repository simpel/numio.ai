/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'This dependency creates a circular dependency',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'This module is orphaned - it has no incoming dependencies',
      from: {
        orphan: true,
        pathNot: '\\.d\\.ts$'
      },
      to: {}
    }
  ],
  allowed: [
    {
      from: 'apps/web/src/**',
      to: 'apps/web/src/**'
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
      dependencyTypes: [
        'npm-no-pkg',
        'npm-unknown'
      ]
    },
    includeOnly: '^apps/web/src',
    tsPreCompilationDeps: false,
    tsConfig: {
      fileName: 'apps/web/tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+'
      },
      archi: {
        collapsePattern: '^(packages|src|lib|app|bin|test(s?)|spec(s?))/[^/]+|node_modules/[^/]+'
      }
    }
  }
};
