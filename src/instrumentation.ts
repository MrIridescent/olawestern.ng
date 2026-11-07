/**
 * instrumentation.ts — runs once when the Next.js server process starts.
 *
 * On some Windows and container hosts Node prefers AAAA (IPv6) records, while
 * outbound access to the AI providers only works over IPv4. The request then
 * hangs until it times out even though the API itself is healthy. Preferring
 * IPv4 first keeps the Truth Desk's provider calls on a working route.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { setDefaultResultOrder } = await import('node:dns');
    setDefaultResultOrder('ipv4first');
  }
}
