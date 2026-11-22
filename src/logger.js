import { shouldUseColors } from './colors.js';
import { formatLog } from './formatter.js';

/**
 * Numeric severity order for logging levels.
 * Higher number indicates higher severity.
 */
export const LOG_LEVELS = Object.freeze({
  DEBUG: 10,
  INFO: 20,
  SUCCESS: 30,
  WARN: 40,
  ERROR: 50
});

const CONSOLE_METHODS = Object.freeze({
  DEBUG: 'debug',
  INFO: 'info',
  SUCCESS: 'log',
  WARN: 'warn',
  ERROR: 'error'
});

/**
 * Validates and normalizes logger configuration options.
 *
 * @param {object} [options={}]
 * @returns {object} Validated options
 */
export function validateOptions(options = {}) {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Logger options must be an object');
  }

  const validated = {};

  // Validate prefix
  if (options.prefix !== undefined) {
    if (typeof options.prefix !== 'string') {
      throw new TypeError('Invalid option "prefix": expected a string');
    }
    validated.prefix = options.prefix;
  } else {
    validated.prefix = '';
  }

  // Validate timestamp
  if (options.timestamp !== undefined) {
    if (typeof options.timestamp !== 'boolean') {
      throw new TypeError('Invalid option "timestamp": expected a boolean');
    }
    validated.timestamp = options.timestamp;
  } else {
    validated.timestamp = true;
  }

  // Validate enabled
  if (options.enabled !== undefined) {
    if (typeof options.enabled !== 'boolean') {
      throw new TypeError('Invalid option "enabled": expected a boolean');
    }
    validated.enabled = options.enabled;
  } else {
    validated.enabled = true;
  }

  // Validate level
  if (options.level !== undefined) {
    if (typeof options.level !== 'string') {
      throw new TypeError(
        `Invalid option "level": "${options.level}". Expected one of: ${Object.keys(LOG_LEVELS).join(', ')}`
      );
    }
    const normalized = options.level.toUpperCase();
    if (!Object.hasOwn(LOG_LEVELS, normalized)) {
      throw new TypeError(
        `Invalid option "level": "${options.level}". Expected one of: ${Object.keys(LOG_LEVELS).join(', ')}`
      );
    }
    validated.level = normalized;
  } else {
    // In production, DEBUG is suppressed by default (defaulting to INFO)
    validated.level = process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG';
  }

  // Validate colors
  if (options.colors !== undefined) {
    if (typeof options.colors !== 'boolean' && options.colors !== 'auto') {
      throw new TypeError(
        `Invalid option "colors": "${options.colors}". Expected true, false, or "auto"`
      );
    }
    validated.colors = options.colors;
  } else {
    validated.colors = 'auto';
  }

  return validated;
}

/**
 * Logger class offering categorized, timestamped, colored logging methods.
 */
export class Logger {
  #prefix;
  #timestamp;
  #enabled;
  #level;
  #colors;
  #customConsole;

  /**
   * @param {object} [options={}]
   * @param {string} [options.prefix=""]
   * @param {boolean} [options.timestamp=true]
   * @param {boolean} [options.enabled=true]
   * @param {string} [options.level]
   * @param {boolean|'auto'} [options.colors='auto']
   * @param {object} [options.console] - Optional console delegate
   */
  constructor(options = {}) {
    const validated = validateOptions(options);

    this.#prefix = validated.prefix;
    this.#timestamp = validated.timestamp;
    this.#enabled = validated.enabled;
    this.#level = validated.level;
    this.#colors = validated.colors;
    this.#customConsole = options.console || null;
  }

  get prefix() {
    return this.#prefix;
  }

  set prefix(val) {
    if (typeof val !== 'string') {
      throw new TypeError('Invalid option "prefix": expected a string');
    }
    this.#prefix = val;
  }

  get timestamp() {
    return this.#timestamp;
  }

  set timestamp(val) {
    if (typeof val !== 'boolean') {
      throw new TypeError('Invalid option "timestamp": expected a boolean');
    }
    this.#timestamp = val;
  }

  get enabled() {
    return this.#enabled;
  }

  set enabled(val) {
    if (typeof val !== 'boolean') {
      throw new TypeError('Invalid option "enabled": expected a boolean');
    }
    this.#enabled = val;
  }

  get level() {
    return this.#level;
  }

  set level(val) {
    if (typeof val !== 'string') {
      throw new TypeError(
        `Invalid option "level": "${val}". Expected one of: ${Object.keys(LOG_LEVELS).join(', ')}`
      );
    }
    const normalized = val.toUpperCase();
    if (!Object.hasOwn(LOG_LEVELS, normalized)) {
      throw new TypeError(
        `Invalid option "level": "${val}". Expected one of: ${Object.keys(LOG_LEVELS).join(', ')}`
      );
    }
    this.#level = normalized;
  }

  get colors() {
    return this.#colors;
  }

  set colors(val) {
    if (typeof val !== 'boolean' && val !== 'auto') {
      throw new TypeError(
        `Invalid option "colors": "${val}". Expected true, false, or "auto"`
      );
    }
    this.#colors = val;
  }

  /**
   * Internal dispatcher for all logging levels.
   *
   * @param {string} levelName
   * @param {Array<unknown>} args
   */
  #log(levelName, args) {
    if (!this.#enabled) {
      return;
    }

    if (LOG_LEVELS[levelName] < LOG_LEVELS[this.#level]) {
      return;
    }

    const stream =
      levelName === 'WARN' || levelName === 'ERROR'
        ? process.stderr
        : process.stdout;

    const useColors = shouldUseColors(this.#colors, stream);

    const formatted = formatLog({
      level: levelName,
      prefix: this.#prefix,
      timestamp: this.#timestamp,
      colors: useColors,
      args
    });

    const consoleMethod = CONSOLE_METHODS[levelName];
    const target = this.#customConsole || globalThis.console;

    target[consoleMethod](formatted);
  }

  /**
   * Log informational message.
   * @param {...unknown} args
   */
  info(...args) {
    this.#log('INFO', args);
  }

  /**
   * Log successful operation message.
   * @param {...unknown} args
   */
  success(...args) {
    this.#log('SUCCESS', args);
  }

  /**
   * Log warning message.
   * @param {...unknown} args
   */
  warn(...args) {
    this.#log('WARN', args);
  }

  /**
   * Log error message.
   * @param {...unknown} args
   */
  error(...args) {
    this.#log('ERROR', args);
  }

  /**
   * Log development/debugging message.
   * @param {...unknown} args
   */
  debug(...args) {
    this.#log('DEBUG', args);
  }
}

/**
 * Creates and returns a new Logger instance.
 *
 * @param {object} [options={}]
 * @returns {Logger}
 */
export function createLogger(options = {}) {
  return new Logger(options);
}
