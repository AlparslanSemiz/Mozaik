// Ruflo is a development tool, and its defaults reach past this repository:
// every CLI call starts a daemon whose workers open headless Claude sessions,
// the updater runs `npm install --save-exact` in the project, the first
// SessionStart writes spinner verbs into ~/.claude/settings.json, and the
// funnel calls a remote endpoint. Each one is switched off in a file here, and
// `ruflo init --force` or `init upgrade --settings` can rewrite those files
// without anything else noticing the switches went back on.
//
// The release guard sits in the same settings file. It was measured once
// through a Ruflo worker (WORKLOG 2026-10-23); this keeps the rules there.
//
// Read through Vite rather than `node:fs`, for the reason `surum.test.ts`
// gives at its own head.

import { describe, expect, it } from 'vitest';

import settings from '../.claude/settings.json';
import mcp from '../.mcp.json';
import rufloConfig from '../claude-flow.config.json';
import pkg from '../package.json';
import claudeMd from '../CLAUDE.md?raw';

const OFF_SWITCHES = {
  CLAUDE_FLOW_AUTO_UPDATE: 'false',
  RUFLO_DAEMON_AUTOSTART: '0',
  RUFLO_NO_AUTO_ENABLE: '1',
  RUFLO_FUNNEL: '0',
};

describe('Ruflo yalnız bu depoda ve kendiliğinden iş başlatmıyor', () => {
  it('daemon ve funnel proje dosyasında kapalı', () => {
    expect(rufloConfig.daemon.autostart).toBe(false);
    expect(rufloConfig.funnel.enabled).toBe(false);
  });

  it('Claude oturumunun ortamında da, MCP sunucusunun ortamında da kapalı', () => {
    expect(settings.env).toMatchObject(OFF_SWITCHES);
    expect(mcp.mcpServers['claude-flow'].env).toMatchObject(OFF_SWITCHES);
  });

  it('MCP sunucusu sürüme sabit ve CLAUDE.md aynı sürümü söylüyor', () => {
    const args = mcp.mcpServers['claude-flow'].args;
    const spec = args.find((a) => a.startsWith('ruflo@')) ?? '';
    expect(spec).toMatch(/^ruflo@\d+\.\d+\.\d+$/);
    expect(claudeMd).toContain(`npx -y ${spec}`);
  });

  // Claude Code reads a hook's `timeout` in seconds; init wrote milliseconds,
  // so a hung pre-bash hook would have held every Bash call for 83 minutes.
  it('kanca süreleri saniye cinsinden', () => {
    const timeouts = Object.values(settings.hooks).flatMap((groups) =>
      groups.flatMap((group) => group.hooks.map((hook) => hook.timeout)),
    );
    expect(timeouts.length).toBeGreaterThan(5);
    for (const t of timeouts) expect(t).toBeLessThanOrEqual(60);
  });

  it('package.json’a Ruflo girmedi', () => {
    const names = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    expect(names.filter((n) => /ruflo|claude-flow/.test(n))).toEqual([]);
  });
});

describe('yayın bekçisi: etiket ve yayın Claude’a kapalı', () => {
  const deny: readonly string[] = settings.permissions.deny;

  it.each([
    'Bash(npm run yayinla)',
    'Bash(npm run yayinla *)',
    'Bash(git tag)',
    'Bash(git tag *)',
    'Bash(git push --tags)',
    'Bash(git push * --tags)',
    'Bash(git push origin v*)',
    'Bash(gh release create *)',
  ])('%s', (rule) => {
    expect(deny).toContain(rule);
  });

  // `terminal_execute` hands its command straight to execSync, and init allows
  // every `mcp__claude-flow__*` tool without asking: the one way around the
  // Bash rules. A hive-mind worker sees the same tools under a second name.
  it('Ruflo’nun komut koşan aracı iki sunucu adında da kapalı', () => {
    expect(settings.permissions.allow).toContain('mcp__claude-flow__*');
    expect(deny).toContain('mcp__claude-flow__terminal_execute');
    expect(deny).toContain('mcp__ruflo__terminal_execute');
  });

  it('hiçbir izin kuralı bekçinin kapattığını açmıyor', () => {
    const opened = settings.permissions.allow.filter((rule) => /yayinla|git tag|git push|gh release/.test(rule));
    expect(opened).toEqual([]);
  });
});
