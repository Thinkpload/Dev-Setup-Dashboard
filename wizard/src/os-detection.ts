/**
 * OS detection utilities for the CLI wizard.
 * Extracted as a standalone module for testability.
 */

/**
 * Returns true when running on native Windows (not WSL or WSL2).
 * WSL/WSL2 sets WSL_DISTRO_NAME env var; native Windows does not.
 */
export function isWindowsNative(): boolean {
  if (process.platform !== 'win32') return false;
  if (process.env['WSL_DISTRO_NAME']) return false;
  if (process.env['WSL_INTEROP']) return false;
  return true;
}

/**
 * No-op: Windows native is fully supported.
 * Kept for API compatibility — never called.
 */
export function printWsl2Instructions(): never {
  process.exit(0);
}
