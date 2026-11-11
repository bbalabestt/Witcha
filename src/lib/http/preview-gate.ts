/** HTTP Basic check for the pre-launch preview. With no password configured, the site is open. */
export function isPreviewAuthorised(header: string | null, password: string | undefined): boolean {
  if (!password) return true;
  const [scheme, encoded] = (header ?? "").split(" ");
  if (scheme !== "Basic" || !encoded) return false;
  try {
    return atob(encoded).split(":").slice(1).join(":") === password;
  } catch {
    return false;
  }
}
