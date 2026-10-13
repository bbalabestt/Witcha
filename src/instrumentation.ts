/** Validates the environment once at server start so misconfiguration fails fast, not mid-request. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getServerEnv } = await import("@/lib/config/env");
  getServerEnv();
}
