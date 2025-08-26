// Neon Neon database connection helper for frontend (local/dev)
// Do not commit actual credentials. Prefer using .env.local (ignored by git) in CI and dev environments.

export interface NeonConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  url?: string;
}

// Reads configuration from VITE_NEON_* environment variables
export const getNeonConfig = (): NeonConfig => {
  const host = (import.meta.env.VITE_NEON_HOST ?? 'localhost') as string;
  const port = Number(import.meta.env.VITE_NEON_PORT ?? 5432);
  const database = (import.meta.env.VITE_NEON_DATABASE ?? 'neondb') as string;
  const user = (import.meta.env.VITE_NEON_USERNAME ?? 'neondb_owner') as string;
  const password = (import.meta.env.VITE_NEON_PASSWORD ?? '') as string;
  const url = (import.meta.env.VITE_NEON_DATABASE_URL ?? undefined) as string | undefined;

  return {
    host,
    port,
    database,
    user,
    password,
    url
  };
};

// Optional: construct a connection URL if URL is not provided
export const getNeonConnectionUrl = (): string | undefined => {
  const cfg = getNeonConfig();
  if (typeof cfg.url === 'string' && cfg.url.length > 0) return cfg.url;

  const { host, port, database, user, password } = cfg;
  if (!host || !database || !user) return undefined;

  // Basic URL construction; adjust if your backend expects different query params
  const encodedUser = encodeURIComponent(user);
  const encodedPass = encodeURIComponent(password ?? '');
  return `postgresql://${encodedUser}:${encodedPass}@${host}:${port}/${database}?sslmode=require&channel_binding=require`;
};

export function logNeonConfig(): void {
  const cfg = getNeonConfig();
  // Only log non-sensitive details in development
  console.log('Neon Config (dev):', {
    host: cfg.host,
    port: cfg.port,
    database: cfg.database,
    user: cfg.user
    // Do not log password or full URL for security reasons
  });
}

export function testNeonConnection(): void {
  try {
    const cfg = getNeonConfig();
    const url = getNeonConnectionUrl();
    console.info('Neon Connection Test (dev):', {
      host: cfg.host,
      port: cfg.port,
      database: cfg.database,
      user: cfg.user,
      url: url
    });
  } catch (err) {
    console.error('Neon connection test failed', err);
  }
}
