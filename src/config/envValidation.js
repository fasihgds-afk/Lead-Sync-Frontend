/**
 * Validates that all required Vite environment variables are present at startup.
 * Throws a descriptive error listing every missing variable so misconfiguration
 * fails loudly instead of silently falling back to a wrong environment.
 *
 * Add any new required VITE_ vars to the REQUIRED_ENV_VARS array below.
 */

const REQUIRED_ENV_VARS = [
  'VITE_API_BASE_URL',
];

export function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `[envValidation] Missing required environment variable(s):\n` +
      missing.map((k) => `  - ${k}`).join('\n') +
      `\n\nCopy .env.example to .env and fill in the values before starting the app.`
    );
  }
}
