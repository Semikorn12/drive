/** Native app: updates come through the App Store / EAS, nothing to check here. */
export function startWebUpdateChecks(): () => void {
  return () => {};
}
