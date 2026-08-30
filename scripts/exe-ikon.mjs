// WHAT IS ACTUALLY INSIDE THE .exe — the icon sizes and the version fields.
//
// This exists because a sentence in STATUS.md said "`bundle.icon`'un
// `--no-bundle` ile ikonu gömdüğü VARSAYILDI, ölçülmedi", and the reader's
// complaint about the taskbar icon was read as evidence for that assumption.
// An unmeasured platform claim is pitfall 65, and the way out of pitfall 65 is
// never an argument — it is a measurement. So: open the binary, walk its
// resource directory, and print what is in it.
//
//   node scripts/exe-ikon.mjs <exe>
//   node scripts/exe-ikon.mjs <exe> --karsilastir kurulum/icon.ico
//
// With `--karsilastir` it is a GATE rather than a report: the sizes embedded in
// the exe have to be exactly the sizes in the .ico, and it exits 1 if they are
// not. `.github/workflows/surum.yml` runs it that way on every build, so the
// assumption cannot come back.
//
// No dependencies. A PE resource directory is three levels of a fixed-layout
// table, and reading it is forty lines; pulling in a parser to do that would
// put a third-party package on the one path where the delivery is built.

import { readFileSync } from 'node:fs';

const RT_ICON = 3;
const RT_GROUP_ICON = 14;
const RT_VERSION = 16;

/** The section table, and where each section's bytes actually live in the file. */
function sections(buf) {
  if (buf.readUInt16LE(0) !== 0x5a4d) throw new Error('MZ imzası yok — bu bir PE değil');
  const pe = buf.readUInt32LE(0x3c);
  if (buf.readUInt32LE(pe) !== 0x00004550) throw new Error('PE imzası yok');
  const count = buf.readUInt16LE(pe + 6);
  const optSize = buf.readUInt16LE(pe + 20);
  const first = pe + 24 + optSize;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const at = first + i * 40;
    out.push({
      name: buf.toString('latin1', at, at + 8).replace(/\0+$/, ''),
      virtualAddress: buf.readUInt32LE(at + 12),
      rawSize: buf.readUInt32LE(at + 16),
      rawPointer: buf.readUInt32LE(at + 20),
    });
  }
  return out;
}

/**
 * Every resource in the file, flattened to {type, id, bytes}.
 *
 * Three nested directories — type, then name/id, then language — and the only
 * subtlety is that offsets inside them are relative to the START of the
 * resource section while the data entry's address is an RVA like any other.
 */
function resources(buf) {
  const rsrc = sections(buf).find((s) => s.name === '.rsrc');
  if (rsrc === undefined) throw new Error('.rsrc bölümü yok — kaynak tablosu hiç gömülmemiş');
  const base = rsrc.rawPointer;
  const found = [];

  const walk = (offset, depth, type, id) => {
    const named = buf.readUInt16LE(base + offset + 12);
    const ids = buf.readUInt16LE(base + offset + 14);
    for (let i = 0; i < named + ids; i += 1) {
      const at = base + offset + 16 + i * 8;
      const nameField = buf.readUInt32LE(at);
      const dataField = buf.readUInt32LE(at + 4);
      const entryId = (nameField & 0x80000000) === 0 ? nameField : -1;
      if ((dataField & 0x80000000) !== 0) {
        walk(dataField & 0x7fffffff, depth + 1, depth === 0 ? entryId : type, depth === 1 ? entryId : id);
        continue;
      }
      const entry = base + dataField;
      const dataRva = buf.readUInt32LE(entry);
      const size = buf.readUInt32LE(entry + 4);
      const start = dataRva - rsrc.virtualAddress + base;
      found.push({ type, id, bytes: buf.subarray(start, start + size) });
    }
  };

  walk(0, 0, -1, -1);
  return found;
}

/** An ICONDIR — the same eight bytes per image whether it is in a .ico or a
    RT_GROUP_ICON, except that the group entry ends in a 2-byte resource id
    where the file entry has a 4-byte offset. */
function iconSizes(bytes, entryLength) {
  const count = bytes.readUInt16LE(4);
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const at = 6 + i * entryLength;
    // 0 means 256: the field is one byte and 256 does not fit in it.
    out.push(bytes.readUInt8(at) === 0 ? 256 : bytes.readUInt8(at));
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

/** The VERSIONINFO strings, read as the UTF-16 pairs they are stored as. */
function versionInfo(bytes) {
  const text = bytes.toString('utf16le');
  const runs = [];
  let run = '';
  for (const ch of text) {
    // Printable, or a separator that ends the run.
    if (ch >= ' ' && ch !== '�') run += ch;
    else {
      if (run.length > 1) runs.push(run.trim());
      run = '';
    }
  }
  if (run.length > 1) runs.push(run.trim());

  // The blob stores key then value, and the keys are a known set — so pairing
  // is a lookup rather than a guess about ordering.
  const KEYS = [
    'CompanyName', 'FileDescription', 'FileVersion', 'InternalName',
    'LegalCopyright', 'OriginalFilename', 'ProductName', 'ProductVersion',
    'Comments', 'LegalTrademarks', 'PrivateBuild', 'SpecialBuild',
  ];
  const fields = {};
  for (let i = 0; i < runs.length; i += 1) {
    if (!KEYS.includes(runs[i])) continue;
    const next = runs[i + 1];
    fields[runs[i]] = next !== undefined && !KEYS.includes(next) ? next : '';
  }
  return fields;
}

const [, , exePath, flag, icoPath] = process.argv;
if (exePath === undefined) {
  console.error('kullanım: node scripts/exe-ikon.mjs <exe> [--karsilastir <ico>]');
  process.exit(2);
}

const buf = readFileSync(exePath);
const all = resources(buf);

const groups = all.filter((r) => r.type === RT_GROUP_ICON);
const icons = all.filter((r) => r.type === RT_ICON);
const versions = all.filter((r) => r.type === RT_VERSION);

console.log(`${exePath}  ${buf.length.toLocaleString('tr-TR')} bayt`);
console.log(`  RT_GROUP_ICON : ${groups.length}`);
console.log(`  RT_ICON       : ${icons.length}`);
console.log(`  RT_VERSION    : ${versions.length}`);

const embedded = groups.length === 0 ? [] : iconSizes(groups[0].bytes, 14);
console.log(`  gömülü boylar : ${embedded.length === 0 ? '(YOK)' : embedded.join(' · ')}`);

if (versions.length === 0) {
  console.log('  VERSIONINFO   : (YOK)');
} else {
  const fields = versionInfo(versions[0].bytes);
  const names = Object.keys(fields);
  console.log(`  VERSIONINFO   : ${names.length} alan`);
  for (const k of names) console.log(`     ${k.padEnd(17)} ${fields[k]}`);
}

if (flag === '--karsilastir') {
  if (icoPath === undefined) {
    console.error('--karsilastir bir .ico yolu ister');
    process.exit(2);
  }
  const wanted = iconSizes(readFileSync(icoPath), 16);
  console.log(`\n  ${icoPath}: ${wanted.join(' · ')}`);
  const missing = wanted.filter((n) => !embedded.includes(n));
  const extra = embedded.filter((n) => !wanted.includes(n));
  if (missing.length > 0 || extra.length > 0) {
    console.error(
      `\nBOYLAR TUTMUYOR — exe'de eksik: [${missing.join(', ')}] · fazla: [${extra.join(', ')}]`,
    );
    console.error(
      'Windows istediği boyu bulamazsa en yakınını ölçekler ve sonuç "bozuk" değil ' +
        '"biraz bulanık" görünür (tuzak 78).',
    );
    process.exit(1);
  }
  console.log('  BOYLAR TUTUYOR');
}
