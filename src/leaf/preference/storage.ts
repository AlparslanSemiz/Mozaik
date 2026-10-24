// The one guard around localStorage. It can be disabled, full, or absent under
// file:// in a locked-down browser, and none of those is worth an error on the
// screen: a read that cannot happen reads as nothing, a write that cannot
// happen is dropped. A leaf, so the plan library and the store can share it
// without importing each other.

export function safely<T>(job: () => T): T | null {
  try {
    return job();
  } catch {
    return null;
  }
}
