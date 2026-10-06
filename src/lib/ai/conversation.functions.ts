import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const loadConversation = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    let { data: thread, error } = await supabase.from('ai_threads').select('id').eq('user_id', userId).maybeSingle();
    if (error) throw new Error('Your conversation could not be loaded.');
    if (!thread) {
      const created = await supabase
        .from('ai_threads')
        .upsert({ user_id: userId, title: 'Your conversation' }, { onConflict: 'user_id' })
        .select('id')
        .single();
      if (created.error || !created.data) throw new Error('Your conversation could not be opened.');
      thread = created.data;
    }
    const history = await supabase.from('ai_messages').select('message').eq('thread_id', thread.id).order('created_at');
    if (history.error) throw new Error('Your saved messages could not be loaded.');
    // Messages are returned as serialized JSON; the client parses them back into AI SDK UIMessages.
    return { id: thread.id, messages: JSON.stringify(history.data.map((row) => row.message)) };
  });

export const clearConversation = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: thread } = await supabase.from('ai_threads').select('id').eq('user_id', userId).maybeSingle();
    if (!thread) return { ok: true };
    const { error } = await supabase.from('ai_messages').delete().eq('thread_id', thread.id);
    if (error) throw new Error('Your conversation could not be cleared.');
    return { ok: true };
  });
