# pretty-console-kit

A lightweight, zero-dependency Node.js logging utility that delivers colored, timestamped, and categorized console logs with configurable severity levels and prefixes.

## Highlights

- **Zero dependencies**: Built entirely on native Node.js APIs (`node:util`, `node:test`, `node:assert`).
- **ECMAScript Modules (ESM)**: Clean modern imports for Node.js 18+.
- **5 log levels**: `debug`, `info`, `success`, `warn`, and `error`.
- **ANSI color styling**: Distinct colors per level with automatic terminal detection and `NO_COLOR` compliance.
- **Timestamps & prefixes**: 24-hour `[HH:MM:SS]` timestamps and custom module tags.
- **Severity filtering**: Configurable threshold level with automatic production suppression.
- **Multi-argument formatting**: Pretty-prints objects, strings, numbers, and Error traces cleanly.

---

## Installation

Install using npm:

```bash
npm install pretty-console-kit
```

---

## Requirements

- Node.js 18.0.0 or higher.
- Native ES module support (`"type": "module"` in `package.json` or `.mjs` extension).

---

## Quick Start

```javascript
import { createLogger } from 'pretty-console-kit';

const logger = createLogger();

logger.info('Application started');
logger.success('Database connected');
logger.warn('API rate limit approaching');
logger.error('Database connection failed');
logger.debug('Authentication initiated');
```

---

## Configuration Options

Pass an options object to `createLogger(options)`:

```javascript
import { createLogger } from 'pretty-console-kit';

const logger = createLogger({
  prefix: 'CampusCore',
  timestamp: true,
  enabled: true,
  level: 'INFO',
  colors: 'auto'
});

logger.info('Server started');
// Output: [18:30:12] [INFO] [CampusCore] Server started
```

### Options Reference

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `prefix` | `string` | `""` | Tag displayed after the log level badge. Wrapped in brackets automatically. |
| `timestamp` | `boolean` | `true` | When true, prepends a 24-hour `[HH:MM:SS]` timestamp. |
| `enabled` | `boolean` | `true` | Global logging toggle. When false, logging calls return immediately without output. |
| `level` | `string` | `"DEBUG"` (dev) / `"INFO"` (prod) | Minimum severity threshold. Supported: `DEBUG`, `INFO`, `SUCCESS`, `WARN`, `ERROR`. |
| `colors` | `boolean \| "auto"` | `"auto"` | Terminal coloring mode. `true` forces color, `false` disables it, `"auto"` detects TTY and env vars. |

Invalid configuration keys or wrong types throw descriptive `TypeError` exceptions.

---

## Logging Levels & Severity

Levels follow a strict severity hierarchy:

```
DEBUG (10)  -->  INFO (20)  -->  SUCCESS (30)  -->  WARN (40)  -->  ERROR (50)
```

When a minimum `level` is set, messages with a lower severity are suppressed.

Example:
```javascript
const logger = createLogger({ level: 'WARN' });

logger.debug('hidden');
logger.info('hidden');
logger.success('hidden');
logger.warn('visible');   // logged
logger.error('visible');  // logged
```

### Color Mapping

| Level | Badge | ANSI Color | Console Target |
| :--- | :--- | :--- | :--- |
| `DEBUG` | `[DEBUG]` | Magenta | `console.debug` (stdout) |
| `INFO` | `[INFO]` | Blue | `console.info` (stdout) |
| `SUCCESS` | `[SUCCESS]` | Green | `console.log` (stdout) |
| `WARN` | `[WARN]` | Yellow | `console.warn` (stderr) |
| `ERROR` | `[ERROR]` | Red | `console.error` (stderr) |

---

## Production Behavior

When `NODE_ENV=production`:
- If `level` is not explicitly supplied, `level` automatically defaults to `"INFO"`.
- As a result, `debug()` messages are suppressed by default in production.
- If an explicit `level` is specified (e.g. `{ level: 'DEBUG' }`), that preference is always honored regardless of `NODE_ENV`.

---

## Color Control & Standards

`pretty-console-kit` complies with CLI terminal conventions:

- `"auto"` (default): Enables ANSI styling when writing to an interactive terminal (`stream.isTTY === true`) and terminal is not `dumb`.
- `NO_COLOR`: If `process.env.NO_COLOR` is set to any non-empty string, ANSI codes are suppressed.
- `FORCE_COLOR`: If set and not `'0'`, colors are enabled.
- `false`: All ANSI codes are stripped, producing raw plain text.
- `true`: Forces ANSI codes regardless of TTY status.

---

## Multiple Arguments & Objects

Logging methods accept multiple parameters of any JavaScript type:

```javascript
logger.info('User session created', { id: 101, username: 'krishna' });
logger.warn('Latency threshold exceeded:', 450, 'ms');
logger.error('Unhandled exception encountered:', new Error('Connection refused'));
```

Objects are formatted legibly with inspection styling, and Error instances include full message and stack trace details.

---

## Complete API Reference

### `createLogger(options)`

Factory function creating a new `Logger` instance.

- **Parameters**: `options` (optional object)
- **Returns**: `Logger` instance

### `Logger` Instance Methods

- `logger.debug(...args)`: Emits debug log.
- `logger.info(...args)`: Emits informational log.
- `logger.success(...args)`: Emits success log.
- `logger.warn(...args)`: Emits warning log.
- `logger.error(...args)`: Emits error log.

### `Logger` Instance Properties

The following properties have dynamic getters and validating setters:
- `logger.level`: String (`"DEBUG"`, `"INFO"`, `"SUCCESS"`, `"WARN"`, `"ERROR"`).
- `logger.enabled`: Boolean.
- `logger.prefix`: String.
- `logger.timestamp`: Boolean.
- `logger.colors`: Boolean or `"auto"`.

---

## Testing

Run the test suite using Node.js built-in test runner:

```bash
npm test
```

All 19 test cases verify log output, label colors, timestamps, level filtering, production defaults, object formatting, and edge cases without external test harnesses.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`.
3. Verify test coverage: `npm test`.
4. Commit changes: `git commit -m "Add feature"`.
5. Open a Pull Request.

---

## License

Released under the [MIT License](file:///Users/krishnasrivastava/Desktop/prettyConsole/LICENSE).
