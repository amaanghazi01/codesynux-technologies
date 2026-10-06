import { supabaseAdmin } from '@/integrations/supabase/client.server';
export async function getAIBlock() {
 const {data,error}=await supabaseAdmin.from('ai_service_state').select('blocked,message').eq('service','gateway').maybeSingle();
 if(error) throw new Error('Unable to check AI availability.');
 return data?.blocked ? data.message || 'AI access is paused until the account owner restores access.' : null;
}
export async function recordAIBlock(status:number,message:string) {
 if (status !== 403) return;
 const {error}=await supabaseAdmin.from('ai_service_state').upsert({service:'gateway',blocked:true,message});
 if(error) console.error('AI access state could not be saved',error.code);
}
export function safeAIMessage(raw:string,status:number) {
 try {const j=JSON.parse(raw); return String(j.error?.message || j.message || `AI request failed (${status}).`);} catch {return `AI request failed (${status}).`;}
}
