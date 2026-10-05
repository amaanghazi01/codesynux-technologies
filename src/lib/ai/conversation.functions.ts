import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import type { UIMessage } from 'ai';
export const loadConversation=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {supabase,userId}=context;
 let {data:thread,error}=await supabase.from('ai_threads').select('id').eq('user_id',userId).maybeSingle();
 if(error) throw new Error('Your conversation could not be loaded.');
 if(!thread){
  const created=await supabase.from('ai_threads').upsert({user_id:userId,title:'Your conversation'},{onConflict:'user_id'}).select('id').single();
  if(created.error || !created.data) throw new Error('Your conversation could not be opened.');
  thread=created.data;
 }
 const history=await supabase.from('ai_messages').select('message').eq('thread_id',thread.id).order('created_at');
 if(history.error) throw new Error('Your saved messages could not be loaded.');
 return {id:thread.id,messages:history.data.map(row=>row.message as unknown as UIMessage)};
});
