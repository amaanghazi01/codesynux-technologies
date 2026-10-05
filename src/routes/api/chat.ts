import { createFileRoute } from '@tanstack/react-router';
export const Route=createFileRoute('/api/chat')({server:{handlers:{POST:async({request})=>{
 const {chatRequest}=await import('@/lib/ai/chat.server');
 return chatRequest(request);
}}}});
