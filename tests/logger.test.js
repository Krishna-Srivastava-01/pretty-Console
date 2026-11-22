import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createLogger, Logger, LOG_LEVELS } from '../src/index.js';
import { shouldUseColors, colorize, ANSI_CODES, LEVEL_COLORS } from '../src/colors.js';
import {
  formatTimestamp,
  formatPrefix,
  formatLevel,
  formatArgs,
  formatLog
} from '../src/formatter.js';

describe('pretty-console-kit', () => {
  let originalEnv;
  let originalConsoleMethods;
  let captured;

  beforeEach(() => {
    // Snapshot environment variables
    originalEnv = { ...process.env };

    // Set predictable environment baseline for tests
    delete process.env.NODE_ENV;
    delete process.env.NO_COLOR;
    delete process.env.FORCE_COLOR;
    process.env.TERM = 'xterm-256color';

    // Capture console output
    captured = {
      debug: [],
      info: [],
      log: [],
      warn: [],
      error: []
    };

    originalConsoleMethods = {
      debug: console.debug,
      info: console.info,
      log: console.log,
      warn: console.warn,
      error: console.error
    };

    console.debug = (...args) => captured.debug.push(args.join(' '));
    console.info = (...args) => captured.info.push(args.join(' '));
    console.log = (...args) => captured.log.push(args.join(' '));
    console.warn = (...args) => captured.warn.push(args.join(' '));
    console.error = (...args) => captured.error.push(args.join(' '));
  });

  afterEach(() => {
    // Restore console methods
    console.debug = originalConsoleMethods.debug;
    console.info = originalConsoleMethods.info;
    console.log = originalConsoleMethods.log;
    console.warn = originalConsoleMethods.warn;
    console.error = originalConsoleMethods.error;

    // Restore environment
    process.env = originalEnv;
  });

  // 1. Logger creation with default options
  it('1. creates logger with expected default configuration', () => {
    delete process.env.NODE_ENV;
    const logger = createLogger();

    assert.ok(logger instanceof Logger);
    assert.strictEqual(logger.prefix, '');
    assert.strictEqual(logger.timestamp, true);
    assert.strictEqual(logger.enabled, true);
    assert.strictEqual(logger.level, 'DEBUG');
    assert.strictEqual(logger.colors, 'auto');
  });

  // 2. All five logging methods
  it('2. supports all five logging methods (info, success, warn, error, debug)', () => {
    const logger = createLogger({ colors: false });

    logger.debug('debug message');
    logger.info('info message');
    logger.success('success message');
    logger.warn('warn message');
    logger.error('error message');

    assert.strictEqual(captured.debug.length, 1);
    assert.strictEqual(captured.info.length, 1);
    assert.strictEqual(captured.log.length, 1); // success routes to console.log
    assert.strictEqual(captured.warn.length, 1);
    assert.strictEqual(captured.error.length, 1);
  });

  // 3. Correct log labels
  it('3. attaches correct log labels to each level', () => {
    const logger = createLogger({ colors: false, timestamp: false });

    logger.debug('d');
    logger.info('i');
    logger.success('s');
    logger.warn('w');
    logger.error('e');

    assert.ok(captured.debug[0].startsWith('[DEBUG]'));
    assert.ok(captured.info[0].startsWith('[INFO]'));
    assert.ok(captured.log[0].startsWith('[SUCCESS]'));
    assert.ok(captured.warn[0].startsWith('[WARN]'));
    assert.ok(captured.error[0].startsWith('[ERROR]'));
  });

  // 4. Timestamp generation
  it('4. includes timestamp formatted as [HH:MM:SS] when enabled', () => {
    const logger = createLogger({ colors: false, timestamp: true });
    logger.info('checking timestamp');

    const entry = captured.info[0];
    const timestampRegex = /^\[\d{2}:\d{2}:\d{2}\] \[INFO\] checking timestamp/;
    assert.match(entry, timestampRegex);
  });

  // 5. Timestamp disabling
  it('5. omits timestamp when timestamp is false', () => {
    const logger = createLogger({ colors: false, timestamp: false });
    logger.info('no timestamp here');

    assert.strictEqual(captured.info[0], '[INFO] no timestamp here');
  });

  // 6. Custom prefixes
  it('6. formats custom prefixes with brackets', () => {
    const logger = createLogger({
      colors: false,
      timestamp: false,
      prefix: 'CampusCore'
    });
    logger.info('Server started');

    assert.strictEqual(captured.info[0], '[INFO] [CampusCore] Server started');
  });

  // 7. Logging disabled globally
  it('7. produces no output across all methods when enabled is false', () => {
    const logger = createLogger({ enabled: false });

    logger.debug('debug');
    logger.info('info');
    logger.success('success');
    logger.warn('warn');
    logger.error('error');

    assert.strictEqual(captured.debug.length, 0);
    assert.strictEqual(captured.info.length, 0);
    assert.strictEqual(captured.log.length, 0);
    assert.strictEqual(captured.warn.length, 0);
    assert.strictEqual(captured.error.length, 0);
  });

  // 8. Minimum logging level filtering
  it('8. filters messages below minimum logging level', () => {
    const logger = createLogger({ level: 'WARN', colors: false, timestamp: false });

    logger.debug('d');
    logger.info('i');
    logger.success('s');
    logger.warn('w');
    logger.error('e');

    // WARN and ERROR should be logged; DEBUG, INFO, SUCCESS should be hidden
    assert.strictEqual(captured.debug.length, 0);
    assert.strictEqual(captured.info.length, 0);
    assert.strictEqual(captured.log.length, 0);
    assert.strictEqual(captured.warn.length, 1);
    assert.strictEqual(captured.error.length, 1);
    assert.strictEqual(captured.warn[0], '[WARN] w');
    assert.strictEqual(captured.error[0], '[ERROR] e');
  });

  // 9. DEBUG suppression in production
  it('9. suppresses DEBUG by default when NODE_ENV=production', () => {
    process.env.NODE_ENV = 'production';
    const logger = createLogger({ colors: false, timestamp: false });

    assert.strictEqual(logger.level, 'INFO');

    logger.debug('should be hidden in production');
    logger.info('should be shown in production');

    assert.strictEqual(captured.debug.length, 0);
    assert.strictEqual(captured.info.length, 1);
    assert.strictEqual(captured.info[0], '[INFO] should be shown in production');
  });

  // 10. Explicit production log-level configuration
  it('10. respects explicitly configured minimum log level in production', () => {
    process.env.NODE_ENV = 'production';
    const logger = createLogger({
      level: 'DEBUG',
      colors: false,
      timestamp: false
    });

    assert.strictEqual(logger.level, 'DEBUG');

    logger.debug('explicit debug enabled');
    assert.strictEqual(captured.debug.length, 1);
    assert.strictEqual(captured.debug[0], '[DEBUG] explicit debug enabled');
  });

  // 11. Color-enabled output
  it('11. includes ANSI escape codes when colors are forced true', () => {
    const logger = createLogger({
      colors: true,
      timestamp: false
    });

    logger.info('blue info');
    logger.success('green success');
    logger.warn('yellow warn');
    logger.error('red error');
    logger.debug('magenta debug');

    assert.ok(captured.info[0].includes(ANSI_CODES.blue));
    assert.ok(captured.info[0].includes(ANSI_CODES.reset));
    assert.ok(captured.log[0].includes(ANSI_CODES.green));
    assert.ok(captured.warn[0].includes(ANSI_CODES.yellow));
    assert.ok(captured.error[0].includes(ANSI_CODES.red));
    assert.ok(captured.debug[0].includes(ANSI_CODES.magenta));
  });

  // 12. Color-disabled output
  it('12. contains zero ANSI escape sequences when colors are false', () => {
    const logger = createLogger({
      colors: false,
      timestamp: false,
      prefix: 'Demo'
    });

    logger.info('testing plain text', { count: 42 });

    const ansiPattern = /\x1b\[[0-9;]*m/;
    assert.strictEqual(ansiPattern.test(captured.info[0]), false);
    assert.strictEqual(
      captured.info[0],
      "[INFO] [Demo] testing plain text { count: 42 }"
    );
  });

  // 13. Automatic color detection
  it('13. detects color support automatically based on TTY stream', () => {
    const ttyStream = { isTTY: true };
    const nonTtyStream = { isTTY: false };
    const testEnv = { TERM: 'xterm-256color' };

    assert.strictEqual(shouldUseColors('auto', ttyStream, testEnv), true);
    assert.strictEqual(shouldUseColors('auto', nonTtyStream, testEnv), false);
    assert.strictEqual(shouldUseColors('auto', null, testEnv), false);

    // TERM=dumb disables colors even on TTY
    assert.strictEqual(
      shouldUseColors('auto', ttyStream, { ...testEnv, TERM: 'dumb' }),
      false
    );
  });

  // 14. NO_COLOR environment variable handling
  it('14. suppresses colors in auto mode when NO_COLOR is set', () => {
    const ttyStream = { isTTY: true };
    const baseEnv = { TERM: 'xterm-256color' };
    const envWithNoColor = { ...baseEnv, NO_COLOR: '1' };

    assert.strictEqual(shouldUseColors('auto', ttyStream, envWithNoColor), false);

    // Empty string for NO_COLOR should NOT disable color (per standard)
    const envEmptyNoColor = { ...baseEnv, NO_COLOR: '' };
    assert.strictEqual(shouldUseColors('auto', ttyStream, envEmptyNoColor), true);

    // colors: true overrides NO_COLOR
    assert.strictEqual(shouldUseColors(true, ttyStream, envWithNoColor), true);
  });

  // 15. Multiple arguments
  it('15. correctly formats multiple arguments of varying types', () => {
    const logger = createLogger({ colors: false, timestamp: false });
    logger.info('User count:', 42, 'active users, ratio:', 0.95);

    assert.strictEqual(
      captured.info[0],
      '[INFO] User count: 42 active users, ratio: 0.95'
    );
  });

  // 16. Object formatting and error handling
  it('16. formats objects and errors sensibly', () => {
    const logger = createLogger({ colors: false, timestamp: false });

    // Object formatting
    logger.info('User logged in', { id: 101, name: 'Krishna' });
    assert.ok(captured.info[0].includes("id: 101, name: 'Krishna'"));

    // Error formatting
    const sampleError = new Error('Database connection failed');
    logger.error('Operation error', sampleError);
    assert.ok(captured.error[0].includes('Database connection failed'));
    assert.ok(captured.error[0].includes('Operation error Error: Database connection failed'));
  });

  // 17. Invalid configuration values
  it('17. throws TypeErrors for invalid configuration options', () => {
    // Non-object options
    assert.throws(() => createLogger('not an object'), {
      name: 'TypeError',
      message: /Logger options must be an object/
    });
    assert.throws(() => createLogger(null), {
      name: 'TypeError',
      message: /Logger options must be an object/
    });
    assert.throws(() => createLogger([1, 2]), {
      name: 'TypeError',
      message: /Logger options must be an object/
    });

    // Invalid prefix
    assert.throws(() => createLogger({ prefix: 123 }), {
      name: 'TypeError',
      message: /Invalid option "prefix"/
    });

    // Invalid timestamp
    assert.throws(() => createLogger({ timestamp: 'yes' }), {
      name: 'TypeError',
      message: /Invalid option "timestamp"/
    });

    // Invalid enabled
    assert.throws(() => createLogger({ enabled: 1 }), {
      name: 'TypeError',
      message: /Invalid option "enabled"/
    });

    // Invalid level
    assert.throws(() => createLogger({ level: 'VERBOSE' }), {
      name: 'TypeError',
      message: /Invalid option "level"/
    });
    assert.throws(() => createLogger({ level: 99 }), {
      name: 'TypeError',
      message: /Invalid option "level"/
    });

    // Invalid colors
    assert.throws(() => createLogger({ colors: 'yes' }), {
      name: 'TypeError',
      message: /Invalid option "colors"/
    });
    assert.throws(() => createLogger({ colors: 1 }), {
      name: 'TypeError',
      message: /Invalid option "colors"/
    });
  });

  // 18. Empty messages and edge cases
  it('18. handles edge cases including empty calls and prefix formatting', () => {
    const logger = createLogger({ colors: false, timestamp: false });

    // Empty message
    logger.info();
    assert.strictEqual(captured.info[0], '[INFO]');

    // Empty string message
    logger.info('');
    assert.strictEqual(captured.info[1], '[INFO]');

    // Prefix already wrapped in brackets
    const bracketedLogger = createLogger({
      colors: false,
      timestamp: false,
      prefix: '[AppCore]'
    });
    bracketedLogger.info('ready');
    assert.strictEqual(captured.info[2], '[INFO] [AppCore] ready');

    // Blank prefix should not add extra brackets
    const blankPrefixLogger = createLogger({
      colors: false,
      timestamp: false,
      prefix: '   '
    });
    blankPrefixLogger.info('running');
    assert.strictEqual(captured.info[3], '[INFO] running');

    // Runtime setters validate updates
    logger.enabled = false;
    assert.strictEqual(logger.enabled, false);
    logger.info('should not log');
    assert.strictEqual(captured.info.length, 4);

    assert.throws(() => {
      logger.level = 'INVALID';
    }, TypeError);

    assert.throws(() => {
      logger.prefix = 123;
    }, TypeError);

    assert.throws(() => {
      logger.timestamp = 'no';
    }, TypeError);

    assert.throws(() => {
      logger.colors = 'invalid';
    }, TypeError);
  });

  // Color & Formatter unit tests
  it('unit tests for colorize and format utilities', () => {
    assert.strictEqual(colorize('test', ANSI_CODES.blue, false), 'test');
    assert.strictEqual(
      colorize('test', ANSI_CODES.blue, true),
      `${ANSI_CODES.blue}test${ANSI_CODES.reset}`
    );

    assert.throws(() => formatPrefix(123), TypeError);
    assert.strictEqual(formatPrefix(''), '');
    assert.strictEqual(formatPrefix('Module'), '[Module]');
    assert.strictEqual(formatPrefix('[Module]'), '[Module]');

    const testDate = new Date(2026, 10, 22, 9, 5, 8);
    assert.strictEqual(formatTimestamp(testDate), '[09:05:08]');

    const customLog = formatLog({
      level: 'INFO',
      prefix: 'Unit',
      timestamp: true,
      colors: false,
      args: ['Hello', { x: 1 }],
      date: testDate
    });
    assert.strictEqual(customLog, '[09:05:08] [INFO] [Unit] Hello { x: 1 }');
  });
});
