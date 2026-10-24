// How the two-way preferences are written, shared by the dock, the strip and
// the availability clock.

/** How the two-way preferences are stored and written on <html>. */
export const onOff = (on: boolean): string => (on ? 'acik' : 'kapali');
