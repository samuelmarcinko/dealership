/**
 * Next.js Instrumentation Hook
 *
 * Runs once when the server process starts.
 * Used to initialise the background XML sync cron job.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run in Node.js runtime (not Edge), and only in the main server process
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // Skip in test environment
  if (process.env.NODE_ENV === 'test') return

  const { startSyncCron } = await import('./lib/xml-sync/cron')
  startSyncCron()
}
