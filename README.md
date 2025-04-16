# @unts/eslint

[![GitHub Actions](https://github.com/un-ts/eslint/workflows/CI/badge.svg)](https://github.com/un-ts/eslint/actions/workflows/ci.yml)
[![Codecov](https://img.shields.io/codecov/c/gh/un-ts/eslint)](https://codecov.io/gh/un-ts/eslint)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fun-ts%2Feslint%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
[![GitHub release](https://img.shields.io/github/release/un-ts/eslint)](https://github.com/un-ts/eslint/releases)

[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![changesets](https://img.shields.io/badge/maintained%20with-changesets-176de3.svg)](https://github.com/changesets/changesets)

> Incredible ESLint plugins, make ESLint greater

## Packages

This repository is a monorepo managed by [changesets][] what means we actually publish several packages to npm from same codebase, including:

| Package                                                    | Description                                                              | Version                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`eslint-plugin-htm`](/packages/htm)                       | An incredible ESLint plugin for HTML based on HTMLHint                   | [![npm](https://img.shields.io/npm/v/eslint-plugin-htm.svg)](https://www.npmjs.com/package/eslint-plugin-htm) [![View changelog](https://img.shields.io/badge/changelog-explore-brightgreen)](https://changelogs.xyz/eslint-plugin-htm)                                  |
| [`eslint-plugin-markup`](/packages/markup)                 | An incredible ESLint plugin for all markup languages based on markuplint | [![npm](https://img.shields.io/npm/v/eslint-plugin-markup.svg)](https://www.npmjs.com/package/eslint-plugin-markup) [![View changelog](https://img.shields.io/badge/changelog-explore-brightgreen)](https://changelogs.xyz/eslint-plugin-markup)                         |
| [`eslint-plugin-react-enhanced`](/packages/react-enhanced) | An incredible ESLint plugin for @react-enhanced                          | [![npm](https://img.shields.io/npm/v/eslint-plugin-react-enhanced.svg)](https://www.npmjs.com/package/eslint-plugin-react-enhanced) [![View changelog](https://img.shields.io/badge/changelog-explore-brightgreen)](https://changelogs.xyz/eslint-plugin-react-enhanced) |
| [`eslint-plugin-text`](/packages/text)                     | An incredible ESLint plugin for retext or textlint                       | [![npm](https://img.shields.io/npm/v/eslint-plugin-text.svg)](https://www.npmjs.com/package/eslint-plugin-text) [![View changelog](https://img.shields.io/badge/changelog-explore-brightgreen)](https://changelogs.xyz/eslint-plugin-text)                               |
| [`eslint-plugin-utils`](/packages/utils)                   | Utilities for ESLint plugins and custom rules                            | [![npm](https://img.shields.io/npm/v/eslint-plugin-utils.svg)](https://www.npmjs.com/package/eslint-plugin-utils) [![View changelog](https://img.shields.io/badge/changelog-explore-brightgreen)](https://changelogs.xyz/eslint-plugin-utils)                            |

## Sponsors and Backers

[![Sponsors and Backers](https://raw.githubusercontent.com/1stG/static/master/sponsors.svg)](https://github.com/sponsors/JounQin)

### Sponsors

| 1stG                                                                                                                   | RxTS                                                                                                                   | UnTS                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [![1stG Open Collective sponsors](https://opencollective.com/1stG/organizations.svg)](https://opencollective.com/1stG) | [![RxTS Open Collective sponsors](https://opencollective.com/rxts/organizations.svg)](https://opencollective.com/rxts) | [![UnTS Open Collective sponsors](https://opencollective.com/unts/organizations.svg)](https://opencollective.com/unts) |

### Backers

| 1stG                                                                                                                | RxTS                                                                                                                | UnTS                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [![1stG Open Collective backers](https://opencollective.com/1stG/individuals.svg)](https://opencollective.com/1stG) | [![RxTS Open Collective backers](https://opencollective.com/rxts/individuals.svg)](https://opencollective.com/rxts) | [![UnTS Open Collective backers](https://opencollective.com/unts/individuals.svg)](https://opencollective.com/unts) |

## Changelog

Detailed changes for each release are documented in [CHANGELOG.md](./CHANGELOG.md).

## License

[MIT][] © [JounQin][]@[1stG.me][]

[1stg.me]: https://www.1stg.me
[changesets]: https://GitHub.com/atlassian/changesets
[jounqin]: https://GitHub.com/JounQin
[mit]: http://opensource.org/licenses/MIT
