/**
 * Example demonstration of pretty-console-kit
 */
import { createLogger } from '../src/index.js';

console.log('--- 1. Default Logger ---');
const defaultLogger = createLogger();

defaultLogger.debug('Debugging query execution plan');
defaultLogger.info('Application bootstrap completed');
defaultLogger.success('Connected to PostgreSQL cluster on port 5432');
defaultLogger.warn('Memory usage exceeded 75% threshold');
defaultLogger.error('Failed to dispatch webhook notification');

console.log('\n--- 2. Custom Prefix & Timestamp ---');
const serviceLogger = createLogger({
  prefix: 'AuthService',
  level: 'DEBUG',
  timestamp: true,
  colors: true
});

serviceLogger.info('User session created', {
  userId: 1042,
  username: 'krishna',
  role: 'admin'
});
serviceLogger.warn('Rate limit approaching', { limit: 100, remaining: 5 });

console.log('\n--- 3. Minimum Log Level Filtering (WARN) ---');
const prodLogger = createLogger({
  level: 'WARN',
  prefix: 'ProductionAPI',
  colors: true
});

prodLogger.debug('This debug message is filtered out');
prodLogger.info('This info message is filtered out');
prodLogger.success('This success message is filtered out');
prodLogger.warn('Elevated latency observed on /api/v1/checkout');
prodLogger.error('Payment gateway timeout', new Error('Gateway timed out after 5000ms'));

console.log('\n--- 4. Plain Text Mode (No Colors) ---');
const plainLogger = createLogger({
  colors: false,
  prefix: 'AuditLog'
});

plainLogger.info('Security audit log entry written to disk');
