/*
  Neon runtime logger for development
  Logs Neon configuration without exposing sensitive data
*/
import { logNeonConfig } from '../utils/neonUsage';
import { getNeonConfig } from '../utils/neonConfig';

if (import.meta.env.DEV) {
  try {
    logNeonConfig();
    testNeonConnection();
    const cfg = getNeonConfig();
    console.info('Neon config loaded from env (host: ' + cfg.host + ', db: ' + cfg.database + ', user: ' + cfg.user + ')');
  } catch (err) {
    console.error('Neon config log failed', err);
  }
}

export {};
