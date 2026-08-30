/**
 * A minimal ZIP writer.
 *
 * Browsers ship DEFLATE via CompressionStream, and the archive format itself is
 * a few headers, so a real compressed .zip costs no dependency at all. The app
 * already requires DecompressionStream to load a dataset, so this needs nothing
 * the rest of the lab does not already assume.
 *
 * Writes ZIP64 end-of-archive records when an archive exceeds the classic
 * limits, so large dumps stay valid.
 */

export interface ZipEntry {
  /** Path inside the archive, using forward slashes. */
  name: string;
  data: Uint8Array | string;
  /** Skip compression for data that will not shrink. */
  store?: boolean;
}

const encoder = new TextEncoder();

// ------------------------------------------------------------------ crc32

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ------------------------------------------------------------------ helpers

async function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** MS-DOS date/time, which is what the ZIP header stores. */
function dosDateTime(date: Date): { time: number; date: number } {
  const time =
    (Math.floor(date.getSeconds() / 2) & 0x1f) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((date.getHours() & 0x1f) << 11);
  const day =
    (date.getDate() & 0x1f) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    ((Math.max(0, date.getFullYear() - 1980) & 0x7f) << 9);
  return { time, date: day };
}

class ByteWriter {
  private chunks: Uint8Array[] = [];
  length = 0;

  push(bytes: Uint8Array) {
    this.chunks.push(bytes);
    this.length += bytes.length;
  }

  u16(value: number) {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, value, true);
    this.push(b);
  }

  u32(value: number) {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, value >>> 0, true);
    this.push(b);
  }

  u64(value: number) {
    const b = new Uint8Array(8);
    new DataView(b.buffer).setBigUint64(0, BigInt(value), true);
    this.push(b);
  }

  blob(type: string) {
    return new Blob(this.chunks as BlobPart[], { type });
  }
}

const U32_MAX = 0xffffffff;

// ------------------------------------------------------------------ archive

export async function createZip(
  entries: ZipEntry[],
  onProgress?: (done: number, total: number) => void,
): Promise<Blob> {
  const writer = new ByteWriter();
  const central: {
    name: Uint8Array;
    crc: number;
    compressed: number;
    raw: number;
    offset: number;
    method: number;
    time: number;
    date: number;
  }[] = [];

  const stamp = dosDateTime(new Date());

  for (const [index, entry] of entries.entries()) {
    const name = encoder.encode(entry.name);
    const raw = typeof entry.data === "string" ? encoder.encode(entry.data) : entry.data;
    const crc = crc32(raw);

    // Tiny or already-compressed payloads are stored verbatim.
    const useStore = entry.store || raw.length < 64;
    const body = useStore ? raw : await deflateRaw(raw);
    const method = useStore ? 0 : 8;

    const offset = writer.length;

    writer.u32(0x04034b50); // local file header
    writer.u16(20); // version needed
    writer.u16(0x0800); // UTF-8 names
    writer.u16(method);
    writer.u16(stamp.time);
    writer.u16(stamp.date);
    writer.u32(crc);
    writer.u32(body.length);
    writer.u32(raw.length);
    writer.u16(name.length);
    writer.u16(0); // extra field length
    writer.push(name);
    writer.push(body);

    central.push({
      name,
      crc,
      compressed: body.length,
      raw: raw.length,
      offset,
      method,
      time: stamp.time,
      date: stamp.date,
    });

    onProgress?.(index + 1, entries.length);
  }

  const centralStart = writer.length;

  for (const item of central) {
    // A file past 4 GB into the archive needs its offset in a ZIP64 extra field.
    const needsZip64 = item.offset > U32_MAX;
    writer.u32(0x02014b50); // central directory header
    writer.u16(0x031e); // made by: UNIX, spec 3.0
    writer.u16(needsZip64 ? 45 : 20);
    writer.u16(0x0800);
    writer.u16(item.method);
    writer.u16(item.time);
    writer.u16(item.date);
    writer.u32(item.crc);
    writer.u32(item.compressed);
    writer.u32(item.raw);
    writer.u16(item.name.length);
    writer.u16(needsZip64 ? 12 : 0);
    writer.u16(0); // comment length
    writer.u16(0); // disk number
    writer.u16(0); // internal attributes
    writer.u32(0o644 << 16); // external attributes
    writer.u32(needsZip64 ? U32_MAX : item.offset);
    writer.push(item.name);
    if (needsZip64) {
      writer.u16(0x0001); // ZIP64 extra field
      writer.u16(8);
      writer.u64(item.offset);
    }
  }

  const centralSize = writer.length - centralStart;
  const needsZip64End = centralStart > U32_MAX || central.length > 0xffff;

  if (needsZip64End) {
    const zip64Start = writer.length;
    writer.u32(0x06064b50); // ZIP64 end of central directory
    writer.u64(44);
    writer.u16(45);
    writer.u16(45);
    writer.u32(0);
    writer.u32(0);
    writer.u64(central.length);
    writer.u64(central.length);
    writer.u64(centralSize);
    writer.u64(centralStart);

    writer.u32(0x07064b50); // ZIP64 locator
    writer.u32(0);
    writer.u64(zip64Start);
    writer.u32(1);
  }

  writer.u32(0x06054b50); // end of central directory
  writer.u16(0);
  writer.u16(0);
  writer.u16(needsZip64End ? 0xffff : central.length);
  writer.u16(needsZip64End ? 0xffff : central.length);
  writer.u32(needsZip64End ? U32_MAX : centralSize);
  writer.u32(needsZip64End ? U32_MAX : centralStart);
  writer.u16(0); // comment length

  return writer.blob("application/zip");
}

/** Hand a finished archive to the browser as a download. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
