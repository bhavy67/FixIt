import { describe, expect, it } from 'vitest';
import { inspectFile } from './file-inspector';

function fileFromBytes(bytes: number[], name: string, type = ''): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe('inspectFile', () => {
  it('detects PDF via magic bytes even with wrong extension', async () => {
    const pdf = fileFromBytes([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37], 'not-a-pdf.txt');
    const r = await inspectFile(pdf);
    expect(r.kind).toBe('pdf');
  });

  it('detects PNG via magic bytes', async () => {
    const png = fileFromBytes(
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0],
      'x.png',
      'image/png',
    );
    const r = await inspectFile(png);
    expect(r.kind).toBe('image');
  });

  it('detects JPEG via magic bytes', async () => {
    const jpeg = fileFromBytes([0xff, 0xd8, 0xff, 0xe0, 0, 0], 'x.jpg');
    const r = await inspectFile(jpeg);
    expect(r.kind).toBe('image');
  });

  it('detects WebP via RIFF + WEBP tag', async () => {
    const webp = fileFromBytes(
      [
        0x52,
        0x49,
        0x46,
        0x46, // RIFF
        0,
        0,
        0,
        0, // size
        0x57,
        0x45,
        0x42,
        0x50, // WEBP
      ],
      'x.webp',
    );
    const r = await inspectFile(webp);
    expect(r.kind).toBe('image');
  });

  it('falls back to MIME for JSON', async () => {
    const json = new File(['{"a":1}'], 'data.json', { type: 'application/json' });
    const r = await inspectFile(json);
    expect(r.kind).toBe('json');
  });

  it('falls back to extension for CSV when MIME is missing', async () => {
    const csv = new File(['a,b\n1,2'], 'rows.csv');
    const r = await inspectFile(csv);
    expect(r.kind).toBe('csv');
  });

  it('returns unknown for empty file with no useful hints', async () => {
    const empty = new File([], 'mystery');
    const r = await inspectFile(empty);
    expect(r.kind).toBe('unknown');
  });

  it('parses extension and size', async () => {
    const f = new File(['hello'], 'greeting.txt', { type: 'text/plain' });
    const r = await inspectFile(f);
    expect(r.ext).toBe('txt');
    expect(r.name).toBe('greeting.txt');
    expect(r.sizeBytes).toBe(5);
    expect(r.mime).toBe('text/plain');
    expect(r.kind).toBe('text');
  });

  it('assigns a unique id per file', async () => {
    const a = await inspectFile(new File(['x'], 'a.txt'));
    const b = await inspectFile(new File(['x'], 'b.txt'));
    expect(a.id).not.toBe(b.id);
  });
});
