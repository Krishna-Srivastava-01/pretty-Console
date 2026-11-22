import util from 'node:util';
import { LEVEL_COLORS, colorize } from './colors.js';

/**
 * Formats a Date object into a 24-hour bracketed timestamp string [HH:MM:SS].
 *
 * @param {Date} [date=new Date()]
 * @returns {string} Formatted timestamp
 */
export function formatTimestamp(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `[${hours}:${minutes}:${seconds}]`;
}

/**
 * Formats a custom prefix, ensuring bracket encapsulation without duplication.
 *
 * @param {string} prefix
 * @returns {string} Formatted prefix or empty string
 */
export function formatPrefix(prefix) {
  if (typeof prefix !== 'string') {
    throw new TypeError('Expected "prefix" to be a string');
  }

  const trimmed = prefix.trim();
  if (trimmed.length === 0) {
    return '';
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed;
  }

  return `[${trimmed}]`;
}

/**
 * Formats the logging level badge with optional ANSI color.
 *
 * @param {string} level
 * @param {boolean} useColors
 * @returns {string} Formatted level badge
 */
export function formatLevel(level, useColors) {
  const badge = `[${level}]`;
  const colorCode = LEVEL_COLORS[level];
  return colorize(badge, colorCode, useColors);
}

/**
 * Formats message arguments using Node inspect utilities.
 *
 * @param {Array<unknown>} args
 * @param {boolean} useColors
 * @returns {string} Formatted message string
 */
export function formatArgs(args, useColors) {
  if (!args || args.length === 0) {
    return '';
  }

  return util.formatWithOptions({ colors: useColors }, ...args);
}

/**
 * Assembles the full log entry line.
 *
 * @param {object} params
 * @param {string} params.level - Log level name
 * @param {string} [params.prefix] - Optional prefix
 * @param {boolean} [params.timestamp=true] - Whether to include timestamp
 * @param {boolean} [params.colors=false] - Whether colors are active
 * @param {Array<unknown>} [params.args=[]] - Log arguments
 * @param {Date} [params.date=new Date()] - Date instance
 * @returns {string} Complete log line
 */
export function formatLog({
  level,
  prefix = '',
  timestamp = true,
  colors = false,
  args = [],
  date = new Date()
}) {
  const headerParts = [];

  if (timestamp) {
    headerParts.push(formatTimestamp(date));
  }

  headerParts.push(formatLevel(level, colors));

  if (prefix) {
    const formattedPrefix = formatPrefix(prefix);
    if (formattedPrefix.length > 0) {
      headerParts.push(formattedPrefix);
    }
  }

  const header = headerParts.join(' ');
  const message = formatArgs(args, colors);

  if (message.length === 0) {
    return header;
  }

  return `${header} ${message}`;
}
