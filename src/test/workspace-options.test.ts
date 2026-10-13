import { describe, expect, it } from 'vitest';
import { validateAttachments, modelReadyMessages } from '@/lib/ai/workspace-options';
const file = { type: 'file' as const, mediaType: 'text/plain', filename: 'code.txt', url: 'data:text/plain;base64,aGVsbG8=' };
describe('AI attachments', () => {
  it('accepts ten files per message', () => expect(() => validateAttachments(Array(10).fill(file))).not.toThrow());
  it('rejects an eleventh file', () => expect(() => validateAttachments(Array(11).fill(file))).toThrow('10'));
  it('rejects remote URLs', () => expect(() => validateAttachments([{ ...file, url: 'https://example.com/private' }])).toThrow('device'));
  it('includes the uploaded code in model input', () => {
    const parts = modelReadyMessages([{ id: 'user', role: 'user', parts: [file] }])[0].parts;
    expect(parts[0]).toEqual({ type: 'text', text: 'Attached file: code.txt\n<untrusted-file>\nhello\n</untrusted-file>' });
  });
});