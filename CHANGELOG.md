# Changelog

All notable changes to the `pretty-console-kit` library will be documented here.

## [1.0.0] - Initial Release

### Added
- ES Module native architecture supporting Node.js 18 and newer.
- Core `createLogger` factory and `Logger` class.
- Five distinct log categories: `debug`, `info`, `success`, `warn`, and `error`.
- Automatic and manual terminal color styling with ANSI escape codes.
- Bracketed 24-hour timestamp formatting (`[HH:MM:SS]`).
- Custom message prefixes (e.g., `[CampusCore]`).
- Minimum log severity level filtering (`DEBUG` < `INFO` < `SUCCESS` < `WARN` < `ERROR`).
- Automatic suppression of `DEBUG` output in production environments (`NODE_ENV=production`).
- Support for `NO_COLOR` standard and `FORCE_COLOR` environment variables.
- Robust formatting for objects, primitives, arrays, and Error stack traces.
- Complete automated test suite using `node:test` and `node:assert`.
- GitHub Actions CI workflow for Node 18, 20, and 22.
