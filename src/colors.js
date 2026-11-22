/**
 * ANSI escape codes for terminal color formatting.
 */
export const ANSI_CODES = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

/**
 * Mapping of logger levels to ANSI colors.
 */
export const LEVEL_COLORS = {
  INFO: ANSI_CODES.blue,
  SUCCESS: ANSI_CODES.green,
  WARN: ANSI_CODES.yellow,
  ERROR: ANSI_CODES.red,
  DEBUG: ANSI_CODES.magenta
};

/**
 * Evaluates whether colors should be active based on mode and terminal environment.
 *
 * @param {boolean|'auto'} mode - Selected color mode
 * @param {object} [stream=process.stdout] - Stream to check for TTY capabilities
 * @param {object} [env=process.env] - Environment variables
 * @returns {boolean} Whether color styling is active
 */
export function shouldUseColors(mode, stream = process.stdout, env = process.env) {
  if (typeof mode === 'boolean') {
    return mode;
  }

  if (mode === 'auto') {
    // Adhere to NO_COLOR specification: any non-empty string disables color
    if (env.NO_COLOR !== undefined && env.NO_COLOR !== '') {
      return false;
    }

    // Support FORCE_COLOR override
    if (env.FORCE_COLOR !== undefined) {
      return env.FORCE_COLOR !== '0';
    }

    // Dumb terminals should not receive ANSI sequences
    if (env.TERM === 'dumb') {
      return false;
    }

    // Check if the stream supports interactive terminal output
    if (stream && Boolean(stream.isTTY)) {
      return true;
    }

    return false;
  }

  throw new TypeError(`Invalid color mode: "${mode}". Expected true, false, or "auto".`);
}

/**
 * Wraps target text with ANSI color codes when enabled.
 *
 * @param {string} text - Content to colorize
 * @param {string} colorCode - ANSI escape sequence
 * @param {boolean} enabled - Whether coloring is active
 * @returns {string} Formatted string
 */
export function colorize(text, colorCode, enabled) {
  if (!enabled || !colorCode) {
    return text;
  }
  return `${colorCode}${text}${ANSI_CODES.reset}`;
}
