import env from '../config/env.js';

const SENSITIVE_KEYS = /pass(word)?|token|secret|authorization|cookie/i;

function redact(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => [key, SENSITIVE_KEYS.test(key) ? '[redacted]' : value]),
  );
}

function write(level, message, meta) {
  if (env.isTest) return;
  const entry = { time: new Date().toISOString(), level, message, ...redact(meta) };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else console.log(line);
}

const logger = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
  /** Security-relevant events (logins, role changes, suspicious token reuse). Never include secrets. */
  security: (event, meta) => write('security', event, meta),
};

export default logger;
