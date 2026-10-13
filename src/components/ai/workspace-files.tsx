import { useEffect, useState } from 'react';
import type { FileUIPart } from 'ai';
import { Plus, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Attachments, Attachment, AttachmentPreview, AttachmentInfo, AttachmentRemove } from '@/components/ai-elements/attachments';
import { PromptInputButton, PromptInputHeader, PromptInputSubmit, usePromptInputAttachments } from '@/components/ai-elements/prompt-input';
import type { ChatStatus } from 'ai';

export function FileStrip({ files, onOpen, onRemove }: { files: (FileUIPart & { id: string })[]; onOpen: (file: FileUIPart) => void; onRemove?: (id: string) => void }) {
  return <Attachments variant="inline" className="max-w-full">{files.map(file => <Attachment key={file.id} data={file} className="max-w-full bg-background text-foreground" onRemove={onRemove ? () => onRemove(file.id) : undefined}><Button variant="ghost" size="sm" className="h-7 min-w-0 gap-2 px-1" onClick={() => onOpen(file)} title={`Open ${file.filename}`}><AttachmentPreview /><AttachmentInfo /></Button><AttachmentRemove className="opacity-100" /></Attachment>)}</Attachments>;
}
export function ComposerFiles({ onOpen }: { onOpen: (file: FileUIPart) => void }) {
  const attachments = usePromptInputAttachments();
  if (!attachments.files.length) return null;
  return <PromptInputHeader><FileStrip files={attachments.files} onOpen={onOpen} onRemove={attachments.remove}/></PromptInputHeader>;
}
export function AddFiles() {
  const attachments = usePromptInputAttachments();
  return <PromptInputButton aria-label="Attach files" tooltip="Attach up to 10 files" onClick={attachments.openFileDialog}><Plus /></PromptInputButton>;
}
export function SendControl({ status, stop, text }: { status: ChatStatus; stop: () => void; text: string }) {
  const attachments = usePromptInputAttachments();
  const busy = status === 'submitted' || status === 'streaming';
  return <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !text.trim() && !attachments.files.length} className="size-9 rounded-full" title={busy ? 'Stop response' : 'Send message'}>{!busy && <ArrowUp className="size-5"/>}</PromptInputSubmit>;
}
export function FileViewer({ file, onClose }: { file: FileUIPart | null; onClose: () => void }) {
  const [content, setContent] = useState('');
  useEffect(() => {
    let cancelled = false;
    setContent('');
    if (file && !file.mediaType.startsWith('image/')) fetch(file.url).then(r => r.text()).then(t => { if (!cancelled) setContent(t); }).catch(() => { if (!cancelled) setContent('This file could not be opened.'); });
    return () => { cancelled = true; };
  }, [file]);
  return <Dialog open={!!file} onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] max-w-3xl overflow-auto rounded-lg"><DialogTitle className="break-all pr-6">{file?.filename ?? 'Attachment'}</DialogTitle><DialogDescription>Attached to your conversation</DialogDescription>{file?.mediaType.startsWith('image/') ? <img src={file.url} alt={file.filename ?? 'Attachment'} className="max-h-[65dvh] w-full object-contain"/> : <pre className="whitespace-pre-wrap break-words text-sm">{content || 'Opening file…'}</pre>}</DialogContent></Dialog>;
}